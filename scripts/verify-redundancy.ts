/**
 * Hand-computed verification of the statutory redundancy pay maths.
 *
 * Run with:  npm run verify:redundancy
 *
 * The cases were worked out by hand first (research notes,
 * research-3tools-2026-11-20) and two of them are the published
 * worked examples of GOV.UK/NIDirect and LegalVision, so the band
 * convention (age at the START of each complete year of service) is
 * checked against official examples, not just against itself.
 * Exits non-zero if any figure disagrees.
 */
import { calculateRedundancy } from "../src/lib/redundancy.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

function checkBool(caseName: string, field: string, actual: boolean, expected: boolean) {
  if (actual !== expected) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

// Case A — official worked example shape (NIDirect example 1):
// 45 years old at leaving, 15 complete years, £600 a week.
// Born 15 Jun 1981; started 16 Nov 2011; ends 15 Nov 2026 (age 45,
// 15 complete years). Service years began at ages 30..44:
// 41+ band = 4 years (began at 41,42,43,44) × 1.5 = 6 weeks;
// 22–40 band = 11 years × 1 = 11 weeks; total 17 weeks × £600
// = £10,200. (NIDirect's own version uses the NI £783 cap and
// reaches the same 17 weeks.)
{
  const r = calculateRedundancy({
    dateOfBirth: "1981-06-15",
    employmentStart: "2011-11-15",
    employmentEnd: "2026-11-15",
    grossWeeklyPay: 600,
    otherTerminationPayments: 0,
  });
  check("A", "completeYears", r.completeYears, 15);
  check("A", "years41plus", r.years41plus, 4);
  check("A", "years22to40", r.years22to40, 11);
  check("A", "totalWeeks", r.totalWeeks, 17);
  check("A", "statutoryPay", r.statutoryPay, 10200);
  check("A", "noticeWeeks", r.noticeWeeks, 12);
  check("A", "noticePay", r.noticePay, 7200);
}

// Case B — LegalVision's published example: 45 years old, 10
// complete years, £600 a week → 4 × 1.5 + 6 × 1 = 12 weeks → £7,200.
{
  const r = calculateRedundancy({
    dateOfBirth: "1981-06-15",
    employmentStart: "2016-11-15",
    employmentEnd: "2026-11-15",
    grossWeeklyPay: 600,
    otherTerminationPayments: 0,
  });
  check("B", "completeYears", r.completeYears, 10);
  check("B", "totalWeeks", r.totalWeeks, 12);
  check("B", "statutoryPay", r.statutoryPay, 7200);
}

// Case C — cap + 20-year limit: 50 years old, 25 years of service
// (20 count), £900 a week → capped at £751. The 20 counted years
// began at ages 30..49: 41+ band = 9 years × 1.5 = 13.5 weeks;
// 22–40 band = 11 years × 1 = 11 weeks; total 24.5 weeks × £751
// = £18,399.50.
{
  const r = calculateRedundancy({
    dateOfBirth: "1976-06-15",
    employmentStart: "2001-11-15",
    employmentEnd: "2026-11-15",
    grossWeeklyPay: 900,
    otherTerminationPayments: 0,
  });
  check("C", "completeYears", r.completeYears, 25);
  check("C", "countedYears", r.countedYears, 20);
  check("C", "totalWeeks", r.totalWeeks, 24.5);
  checkBool("C", "capApplied", r.capApplied, true);
  check("C", "weeksPayUsed", r.weeksPayUsed, 751);
  check("C", "statutoryPay", r.statutoryPay, 18399.5);
}

// Case D — young worker (NIDirect example 2 shape): 30 years old,
// 10 complete years, £450 a week. Years began at ages 20..29:
// under-22 = 2 years × 0.5 = 1 week; 22–40 = 8 × 1 = 8 weeks;
// total 9 weeks × £450 = £4,050.
{
  const r = calculateRedundancy({
    dateOfBirth: "1996-06-15",
    employmentStart: "2016-11-15",
    employmentEnd: "2026-11-15",
    grossWeeklyPay: 450,
    otherTerminationPayments: 0,
  });
  check("D", "yearsUnder22", r.yearsUnder22, 2);
  check("D", "totalWeeks", r.totalWeeks, 9);
  check("D", "statutoryPay", r.statutoryPay, 4050);
}

// Case E — under 2 years: no statutory pay, but the £30,000 check
// still runs on the other payments alone. 1 complete year, plus a
// £35,000 ex-gratia payment → £30,000 tax-free, £5,000 taxable.
{
  const r = calculateRedundancy({
    dateOfBirth: "1990-01-01",
    employmentStart: "2025-06-01",
    employmentEnd: "2026-11-15",
    grossWeeklyPay: 500,
    otherTerminationPayments: 35000,
  });
  checkBool("E", "qualifies", r.qualifies, false);
  check("E", "statutoryPay", r.statutoryPay, 0);
  check("E", "taxFreeUsed", r.taxFreeUsed, 30000);
  check("E", "taxableExcess", r.taxableExcess, 5000);
}

if (failures > 0) {
  console.error(`verify-redundancy: ${failures} failure(s)`);
  process.exit(1);
}
console.log("verify-redundancy: all cases pass");
