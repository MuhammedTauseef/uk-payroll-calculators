/**
 * Hand-computed verification of the overtime calculator maths.
 *
 * Run with:  npm run verify:overtime
 *
 * Every case below was worked out by hand first from the rules
 * GOV.UK states ("Overtime: your rights" and "National Minimum
 * Wage and National Living Wage rates", re-read 9 November 2026):
 *   - No statutory overtime premium exists; the multiplier is the
 *     contract's. Overtime pay = overtime hours × hourly rate ×
 *     multiplier; pay lines are rounded to the penny and the total
 *     is built from the rounded lines (the house display rule).
 *   - The minimum wage floor tests the AVERAGE: total pay ÷ total
 *     hours (normal + overtime) against the April 2026 band rates —
 *     21+ £12.71, 18–20 £10.85, under 18 £8.00, apprentice £8.00.
 *   - An hourly rate derived from a salary is salary ÷ 52 ÷
 *     contracted hours per week.
 * Exits non-zero if any figure disagrees.
 */
import { calculateOvertime, nmwBand } from "../src/lib/overtime.ts";
import type { OvertimeInput } from "../src/lib/overtime.ts";

let failures = 0;

function checkNum(
  caseName: string,
  field: string,
  actual: number | null,
  expected: number | null,
) {
  if (actual === null || expected === null) {
    if (actual !== expected) {
      failures += 1;
      console.error(
        `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
      );
    }
    return;
  }
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

function checkBool(
  caseName: string,
  field: string,
  actual: boolean | null,
  expected: boolean | null,
) {
  if (actual !== expected) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

const BASE: OvertimeInput = {
  basis: "hourly",
  hourlyRate: 12.21,
  annualSalary: 0,
  contractedHoursPerWeek: 0,
  normalHours: 40,
  overtimeHours: 10,
  multiplier: 1.5,
  ageBand: "over21",
};

// --- The band rates themselves (April 2026, GOV.UK) ---------------------

checkNum("bands", "over21", nmwBand("over21").rate, 12.71);
checkNum("bands", "age18to20", nmwBand("age18to20").rate, 10.85);
checkNum("bands", "under18", nmwBand("under18").rate, 8.0);
checkNum("bands", "apprentice", nmwBand("apprentice").rate, 8.0);

// --- Time and a half: the page's worked example --------------------------
// £12.21/hr, 40 normal + 10 overtime at 1.5×:
//   normal  = 12.21 × 40        = £488.40
//   overtime = 12.21 × 1.5 × 10 = £183.15   (overtime rate £18.315)
//   total   = £671.55 over 50 hours → average £13.431 → £13.43
//   £13.43 ≥ £12.71 (21+) → passes; shortfall 12.71 − 13.43 = −0.72.
{
  const r = calculateOvertime({ ...BASE });
  checkNum("timeandhalf", "normalPay", r.normalPay, 488.4);
  checkNum("timeandhalf", "overtimePay", r.overtimePay, 183.15);
  checkNum("timeandhalf", "overtimeHourlyRate", r.overtimeHourlyRate, 18.315);
  checkNum("timeandhalf", "totalPay", r.totalPay, 671.55);
  checkNum("timeandhalf", "totalHours", r.totalHours, 50);
  checkNum("timeandhalf", "effectiveHourlyRate", r.effectiveHourlyRate, 13.43);
  checkBool("timeandhalf", "nmwPass", r.nmwPass, true);
  checkNum("timeandhalf", "nmwShortfallPerHour", r.nmwShortfallPerHour, -0.72);
}

// --- Flat rate (1×): paid overtime can still fail the floor --------------
// £12.00/hr, 40 normal + 8 overtime at 1×:
//   normal £480.00, overtime £96.00, total £576.00 over 48 hours
//   → average exactly £12.00, which is BELOW the £12.71 floor for
//   21+ → fails, shortfall £0.71 an hour.
{
  const r = calculateOvertime({
    ...BASE,
    hourlyRate: 12,
    overtimeHours: 8,
    multiplier: 1,
  });
  checkNum("flat", "normalPay", r.normalPay, 480);
  checkNum("flat", "overtimePay", r.overtimePay, 96);
  checkNum("flat", "totalPay", r.totalPay, 576);
  checkNum("flat", "effectiveHourlyRate", r.effectiveHourlyRate, 12);
  checkBool("flat", "nmwPass", r.nmwPass, false);
  checkNum("flat", "nmwShortfallPerHour", r.nmwShortfallPerHour, 0.71);
}

// --- Time and a quarter (1.25×) ------------------------------------------
// £13.00/hr, 40 normal + 20 overtime at 1.25×:
//   normal £520.00, overtime = 13 × 1.25 × 20 = £325.00 (rate £16.25),
//   total £845.00 over 60 hours → average £14.0833 → £14.08 → passes.
{
  const r = calculateOvertime({
    ...BASE,
    hourlyRate: 13,
    overtimeHours: 20,
    multiplier: 1.25,
  });
  checkNum("quarter", "normalPay", r.normalPay, 520);
  checkNum("quarter", "overtimePay", r.overtimePay, 325);
  checkNum("quarter", "overtimeHourlyRate", r.overtimeHourlyRate, 16.25);
  checkNum("quarter", "totalPay", r.totalPay, 845);
  checkNum("quarter", "effectiveHourlyRate", r.effectiveHourlyRate, 14.08);
  checkBool("quarter", "nmwPass", r.nmwPass, true);
}

// --- Double time (2×) ------------------------------------------------------
// £12.21/hr, 40 normal + 5 overtime at 2×:
//   normal £488.40, overtime = 12.21 × 2 × 5 = £122.10 (rate £24.42),
//   total £610.50 over 45 hours → average £13.5667 → £13.57 → passes.
{
  const r = calculateOvertime({ ...BASE, overtimeHours: 5, multiplier: 2 });
  checkNum("double", "normalPay", r.normalPay, 488.4);
  checkNum("double", "overtimePay", r.overtimePay, 122.1);
  checkNum("double", "overtimeHourlyRate", r.overtimeHourlyRate, 24.42);
  checkNum("double", "totalPay", r.totalPay, 610.5);
  checkNum("double", "effectiveHourlyRate", r.effectiveHourlyRate, 13.57);
  checkBool("double", "nmwPass", r.nmwPass, true);
}

// --- Custom multiplier (1.75×), younger band --------------------------------
// £11.00/hr, 37.5 normal + 4 overtime at 1.75×, band 18–20 (£10.85):
//   normal £412.50, overtime = 11 × 1.75 × 4 = £77.00 (rate £19.25),
//   total £489.50 over 41.5 hours → average £11.7952 → £11.80 → passes.
{
  const r = calculateOvertime({
    ...BASE,
    hourlyRate: 11,
    normalHours: 37.5,
    overtimeHours: 4,
    multiplier: 1.75,
    ageBand: "age18to20",
  });
  checkNum("custom", "normalPay", r.normalPay, 412.5);
  checkNum("custom", "overtimePay", r.overtimePay, 77);
  checkNum("custom", "overtimeHourlyRate", r.overtimeHourlyRate, 19.25);
  checkNum("custom", "totalPay", r.totalPay, 489.5);
  checkNum("custom", "effectiveHourlyRate", r.effectiveHourlyRate, 11.8);
  checkNum("custom", "nmwRate", r.nmwRate, 10.85);
  checkBool("custom", "nmwPass", r.nmwPass, true);
}

// --- Salary-derived rate -----------------------------------------------------
// £30,000 salary, 37.5 contracted hours/week:
//   rate = 30000 ÷ 52 ÷ 37.5 = £15.384615… an hour.
//   normal (37.5h) = £576.9231 → £576.92
//   overtime (5h at 1.5×) = £115.3846 → £115.38
//   total £692.30 over 42.5 hours → average £16.2894 → £16.29 → passes.
{
  const r = calculateOvertime({
    ...BASE,
    basis: "salary",
    hourlyRate: 0,
    annualSalary: 30000,
    contractedHoursPerWeek: 37.5,
    normalHours: 37.5,
    overtimeHours: 5,
  });
  checkNum("salary", "hourlyRate", r.hourlyRate, 15.3846);
  checkNum("salary", "normalPay", r.normalPay, 576.92);
  checkNum("salary", "overtimePay", r.overtimePay, 115.38);
  checkNum("salary", "totalPay", r.totalPay, 692.3);
  checkNum("salary", "effectiveHourlyRate", r.effectiveHourlyRate, 16.29);
  checkBool("salary", "nmwPass", r.nmwPass, true);
}

// --- The NMW trap: unpaid overtime on a salary -------------------------------
// £26,000 salary, 37.5 contracted hours/week, 5 UNPAID overtime
// hours (multiplier 0):
//   rate = 26000 ÷ 52 ÷ 37.5 = £13.3333; weekly pay £500.00.
//   total £500.00 over 42.5 hours → average £11.7647 → £11.76,
//   BELOW the £12.71 floor → fails, shortfall £0.95 an hour.
{
  const r = calculateOvertime({
    ...BASE,
    basis: "salary",
    hourlyRate: 0,
    annualSalary: 26000,
    contractedHoursPerWeek: 37.5,
    normalHours: 37.5,
    overtimeHours: 5,
    multiplier: 0,
  });
  checkNum("unpaid", "hourlyRate", r.hourlyRate, 13.3333);
  checkNum("unpaid", "normalPay", r.normalPay, 500);
  checkNum("unpaid", "overtimePay", r.overtimePay, 0);
  checkNum("unpaid", "totalPay", r.totalPay, 500);
  checkNum("unpaid", "effectiveHourlyRate", r.effectiveHourlyRate, 11.76);
  checkBool("unpaid", "nmwPass", r.nmwPass, false);
  checkNum("unpaid", "nmwShortfallPerHour", r.nmwShortfallPerHour, 0.95);
}

// --- Zero overtime: the check follows the band -------------------------------
// £12.21/hr, 40 normal hours, no overtime: average is the rate
// itself, £12.21 — below the 21+ floor (£12.71) but above the
// 18–20 floor (£10.85). (12.21 was the April 2025 Living Wage.)
{
  const r = calculateOvertime({ ...BASE, overtimeHours: 0 });
  checkNum("zero-ot", "overtimePay", r.overtimePay, 0);
  checkNum("zero-ot", "totalPay", r.totalPay, 488.4);
  checkNum("zero-ot", "effectiveHourlyRate", r.effectiveHourlyRate, 12.21);
  checkBool("zero-ot", "nmwPass-21plus", r.nmwPass, false);

  const younger = calculateOvertime({
    ...BASE,
    overtimeHours: 0,
    ageBand: "age18to20",
  });
  checkBool("zero-ot", "nmwPass-18to20", younger.nmwPass, true);
}

// --- No hours at all: no average, no verdict ----------------------------------
{
  const r = calculateOvertime({ ...BASE, normalHours: 0, overtimeHours: 0 });
  checkNum("no-hours", "totalPay", r.totalPay, 0);
  checkNum("no-hours", "effectiveHourlyRate", r.effectiveHourlyRate, null);
  checkBool("no-hours", "nmwPass", r.nmwPass, null);
  checkNum("no-hours", "nmwShortfallPerHour", r.nmwShortfallPerHour, null);
}

if (failures > 0) {
  console.error(`\nverify-overtime: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-overtime: all hand-computed checks passed");
