/**
 * Hand-computed verification of the holiday pay maths.
 *
 * Run with:  npm run verify:holiday-pay
 *
 * Case C is Acas's own published worked example of rolled-up
 * holiday pay (£1,000 of pay → £120.70), so that mode is checked
 * against an official example. The other cases were worked out by
 * hand first (research notes, research-3tools-2026-11-20).
 * Exits non-zero if any figure disagrees.
 */
import { calculateHolidayPay } from "../src/lib/holidaypay.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number | null, expected: number) {
  if (actual === null || Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const base = {
  weeklyPay: 0,
  daysPerWeek: 5,
  daysOfHoliday: 0,
  hoursWorked: 0,
  hourlyRate: 0,
  payForPeriod: 0,
  entitlementWeeks: 5.6,
  proportionOfYearWorked: 0,
  leaveTakenWeeks: 0,
};

// Case A — regular hours: £31,200 salary = £600 a week, 5-day week
// → daily rate £120. 10 days of holiday = £1,200. Full statutory
// year: 5.6 × £600 = £3,360.
{
  const r = calculateHolidayPay({
    ...base,
    mode: "regular",
    weeklyPay: 600,
    daysPerWeek: 5,
    daysOfHoliday: 10,
  });
  check("A", "dailyRate", r.dailyRate, 120);
  check("A", "payForDays", r.payForDays, 1200);
  check("A", "fullYearValue", r.fullYearValue, 3360);
}

// Case B — irregular hours: 120 hours worked at £12.50 an hour.
// Accrual = 120 × 12.07% = 14.484 hours → 14 bookable hours
// (nearest hour, halves up); pay value 14.484 × £12.50 = £181.05.
{
  const r = calculateHolidayPay({
    ...base,
    mode: "irregular",
    hoursWorked: 120,
    hourlyRate: 12.5,
  });
  check("B", "accruedHoursExact", r.accruedHoursExact, 14.48);
  check("B", "accruedHoursBooked", r.accruedHoursBooked, 14);
  check("B", "accruedPayValue", r.accruedPayValue, 181.05);
}

// Case C — rolled-up holiday pay, the Acas worked example:
// £1,000 of pay in the period → 12.07% uplift = £120.70, total
// pay for the period £1,120.70.
{
  const r = calculateHolidayPay({
    ...base,
    mode: "rolledup",
    payForPeriod: 1000,
  });
  check("C", "rolledUpAmount", r.rolledUpAmount, 120.7);
  check("C", "rolledUpTotal", r.rolledUpTotal, 1120.7);
}

// Case D — payment in lieu on leaving: A = 5.6 weeks, B = half the
// leave year worked → 2.8 weeks accrued; C = 1 week taken → 1.8
// weeks owed × £600 a week = £1,080.
{
  const r = calculateHolidayPay({
    ...base,
    mode: "leaving",
    weeklyPay: 600,
    entitlementWeeks: 5.6,
    proportionOfYearWorked: 0.5,
    leaveTakenWeeks: 1,
  });
  check("D", "weeksOwed", r.weeksOwed, 1.8);
  check("D", "paymentInLieu", r.paymentInLieu, 1080);
}

// Case E — leaving having taken MORE than accrued: A × B = 5.6 ×
// 0.25 = 1.4 weeks; C = 2 weeks taken → −0.6 weeks × £600 =
// −£360 (overpaid holiday — the calculator must show the negative,
// not hide it).
{
  const r = calculateHolidayPay({
    ...base,
    mode: "leaving",
    weeklyPay: 600,
    entitlementWeeks: 5.6,
    proportionOfYearWorked: 0.25,
    leaveTakenWeeks: 2,
  });
  check("E", "weeksOwed", r.weeksOwed, -0.6);
  check("E", "paymentInLieu", r.paymentInLieu, -360);
}

if (failures > 0) {
  console.error(`verify-holiday-pay: ${failures} failure(s)`);
  process.exit(1);
}
console.log("verify-holiday-pay: all cases pass");
