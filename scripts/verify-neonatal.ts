/**
 * Hand-computed verification of the Statutory Neonatal Care Pay
 * calculator (weeks earned, weekly amount, totals, reclaim and the
 * eligibility tests).
 *
 * Run with:  npm run verify:neonatal
 *
 * Every expected figure below is worked by hand from the GOV.UK
 * rules in the research pack (24 November 2026): one week per 7
 * consecutive days in care, capped at 12; every week pays the lower
 * of the tax year's flat rate (£187.18 in 2025/26, £194.32 in
 * 2026/27) or 90% of average weekly earnings; employers reclaim 92%,
 * or 108.5% (2025/26) / 109% (2026/27) with Small Employers' Relief.
 * Case A's total (£1,748.88 for 9 weeks at the flat rate) and Case
 * D's reclaim figures (£2,145.29 at 92%, £2,541.71 at 109%) match
 * worked examples published independently from the same GOV.UK
 * rules. Exits non-zero if any figure disagrees.
 */
import { calculateNeonatal } from "../src/lib/neonatal.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

function checkStr(caseName: string, field: string, actual: string | null, expected: string) {
  if (actual !== expected) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

function checkBool(caseName: string, field: string, actual: boolean | null, expected: boolean) {
  if (actual !== expected) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const noDates = { birthDate: "", careStartDate: "", employmentStart: "" };

// Case A — 2026/27, AWE £600 (90% = £540, above the flat rate),
// 63 days in care = 9 full weeks. Weekly £194.32, total
// 9 × £194.32 = £1,748.88.
{
  const r = calculateNeonatal({
    taxYear: "2026-27",
    averageWeeklyEarnings: 600,
    daysInCare: 63,
    ...noDates,
  });
  check("A", "weeksEntitled", r.weeksEntitled, 9);
  check("A", "weeklyAmount", r.weeklyAmount, 194.32);
  check("A", "totalPay", r.totalPay, 1748.88);
  checkBool("A", "eligible", r.eligible, true);
}

// Case B — 2026/27, AWE £180 (90% = £162, below the flat rate),
// 21 days = 3 weeks. Weekly £162.00, total £486.00.
{
  const r = calculateNeonatal({
    taxYear: "2026-27",
    averageWeeklyEarnings: 180,
    daysInCare: 21,
    ...noDates,
  });
  check("B", "weeksEntitled", r.weeksEntitled, 3);
  check("B", "weeklyAmount", r.weeklyAmount, 162);
  check("B", "totalPay", r.totalPay, 486);
}

// Case C — 2025/26, AWE £150 (90% = £135, below the £187.18 flat
// rate), 14 days = 2 weeks. Weekly £135.00, total £270.00. AWE
// £150 clears the 2025/26 Lower Earnings Limit of £125.
{
  const r = calculateNeonatal({
    taxYear: "2025-26",
    averageWeeklyEarnings: 150,
    daysInCare: 14,
    ...noDates,
  });
  check("C", "weeksEntitled", r.weeksEntitled, 2);
  check("C", "weeklyAmount", r.weeklyAmount, 135);
  check("C", "totalPay", r.totalPay, 270);
  checkBool("C", "earningsTestMet", r.earningsTestMet, true);
}

// Case D — the 12-week cap: 100 days would be 14 weeks uncapped.
// AWE £1,000, 2026/27: weekly £194.32, total 12 × £194.32 =
// £2,331.84. Reclaim: 92% = £2,145.29; 109% (SER 2026/27) =
// £2,541.71.
{
  const r = calculateNeonatal({
    taxYear: "2026-27",
    averageWeeklyEarnings: 1000,
    daysInCare: 100,
    ...noDates,
  });
  check("D", "weeksEntitled", r.weeksEntitled, 12);
  check("D", "totalPay", r.totalPay, 2331.84);
  check("D", "employerRecoveryStandard", r.employerRecoveryStandard, 2145.29);
  check("D", "employerRecoverySmall", r.employerRecoverySmall, 2541.71);
}

// Case E — 6 days in care earns nothing: 0 weeks, £0, not eligible.
{
  const r = calculateNeonatal({
    taxYear: "2026-27",
    averageWeeklyEarnings: 450,
    daysInCare: 6,
    ...noDates,
  });
  check("E", "weeksEntitled", r.weeksEntitled, 0);
  check("E", "totalPay", r.totalPay, 0);
  checkBool("E", "eligible", r.eligible, false);
}

// Case F — earnings test failure: 2025/26 AWE £120 is below the
// £125 Lower Earnings Limit, so not eligible even though 2 weeks
// are earned (weekly would be 90% of £120 = £108, total £216).
{
  const r = calculateNeonatal({
    taxYear: "2025-26",
    averageWeeklyEarnings: 120,
    daysInCare: 14,
    ...noDates,
  });
  checkBool("F", "earningsTestMet", r.earningsTestMet, false);
  checkBool("F", "eligible", r.eligible, false);
  check("F", "weeklyAmount", r.weeklyAmount, 108);
  check("F", "totalPay", r.totalPay, 216);
}

// Case G — service test dates. Baby born and admitted Monday
// 5 October 2026. The week containing the care start runs Sun
// 4 Oct – Sat 10 Oct 2026, so the qualifying week ends Saturday
// 3 October 2026 and the latest start date for 26 weeks' service
// is 3 Oct 2026 − 26 weeks = 4 April 2026. Starting 4 April 2026
// passes; starting 5 April 2026 fails.
{
  const base = {
    taxYear: "2026-27" as const,
    averageWeeklyEarnings: 450,
    daysInCare: 21,
    birthDate: "2026-10-05",
    careStartDate: "2026-10-05",
  };
  const pass = calculateNeonatal({ ...base, employmentStart: "2026-04-04" });
  checkStr("G", "qualifyingWeekEnd", pass.qualifyingWeekEnd, "2026-10-03");
  checkStr("G", "latestEmploymentStart", pass.latestEmploymentStart, "2026-04-04");
  checkBool("G", "serviceTestMet(pass)", pass.serviceTestMet, true);
  checkBool("G", "careWithinWindow", pass.careWithinWindow, true);
  checkBool("G", "bornInScheme", pass.bornInScheme, true);
  const fail = calculateNeonatal({ ...base, employmentStart: "2026-04-05" });
  checkBool("G", "serviceTestMet(fail)", fail.serviceTestMet, false);
}

// Case H — the two birth/care windows: care starting 36 days
// after the birth is outside the 28-day window; a baby born
// 5 April 2025 predates the scheme.
{
  const late = calculateNeonatal({
    taxYear: "2026-27",
    averageWeeklyEarnings: 450,
    daysInCare: 21,
    birthDate: "2026-10-05",
    careStartDate: "2026-11-10",
    employmentStart: "2024-01-08",
  });
  checkBool("H", "careWithinWindow", late.careWithinWindow, false);
  checkBool("H", "eligible", late.eligible, false);
  const early = calculateNeonatal({
    taxYear: "2025-26",
    averageWeeklyEarnings: 450,
    daysInCare: 21,
    birthDate: "2025-04-05",
    careStartDate: "2025-04-05",
    employmentStart: "2024-01-08",
  });
  checkBool("H", "bornInScheme", early.bornInScheme, false);
  checkBool("H", "eligible", early.eligible, false);
}

if (failures > 0) {
  console.error(`verify-neonatal: ${failures} failure(s)`);
  process.exit(1);
}
console.log("verify-neonatal: all cases pass");
