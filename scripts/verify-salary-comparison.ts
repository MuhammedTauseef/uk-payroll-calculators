/**
 * Hand-computed verification of the salary comparison maths.
 *
 * Run with:  npm run verify:salary-comparison
 *
 * Every expected figure below was worked by hand from the 2026/27
 * rules in rates.ts (Personal Allowance £12,570, withdrawn £1 per
 * £2 over £100,000; 20% on the first £37,700 of taxable income,
 * 40% to £125,140, 45% above; employee NI 8% between £12,570 and
 * £50,270, 2% above; Plan 2 student loan 9% over £29,385) before
 * the engine was run. Case 1 is also the cross-check against a
 * competitor's live-verified figures (TaxCalcUK, 23 Nov 2026).
 * Exits non-zero on any disagreement.
 */
import {
  calculateSalaryComparison,
  type SalaryComparisonInput,
} from "../src/lib/salary-comparison.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  const ok = Math.abs(actual - expected) < 0.005;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function checkBool(label: string, actual: boolean, expected: boolean) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function run(label: string, input: SalaryComparisonInput) {
  console.log(`\n--- ${label} ---`);
  return calculateSalaryComparison(input);
}

// Case 1 — the headline cross-check: £40,000 vs £60,000, plain.
// A: taxable £27,430 @ 20% = £5,486; NI £27,430 @ 8% = £2,194.40;
// take-home £32,319.60 (£2,693.30/mo). B: £7,540 + £9,730 @ 40%
// = £11,432; NI £3,016 + £194.60 = £3,210.60; take-home
// £45,357.40 (£3,779.78/mo). Difference £13,037.80 a year,
// £1,086.48 a month; of the £20,000 rise, 65.19% is kept.
// Marginal rate at B: 40% tax + 2% NI = 42%.
{
  const r = run("Case 1: £40,000 vs £60,000", {
    a: { salary: 40000 },
    b: { salary: 60000 },
  });
  check("A income tax", r.a.incomeTax, 5486.0);
  check("A NI", r.a.nationalInsurance, 2194.4);
  check("A take-home", r.a.takeHomeAnnual, 32319.6);
  check("A take-home / month", r.a.takeHomeMonthly, 2693.3);
  check("B income tax", r.b.incomeTax, 11432.0);
  check("B NI", r.b.nationalInsurance, 3210.6);
  check("B take-home", r.b.takeHomeAnnual, 45357.4);
  check("B take-home / month", r.b.takeHomeMonthly, 3779.78);
  check("take-home difference", r.takeHomeDifferenceAnnual, 13037.8);
  check("difference / month", r.takeHomeDifferenceMonthly, 1086.48);
  check("keep % of the rise", r.keepPercentOfDifference ?? -1, 65.19);
  check("B marginal rate", r.b.marginalRatePercent, 42.0);
  check("A effective deduction %", r.a.effectiveDeductionPercent, 19.2);
  check("B effective deduction %", r.b.effectiveDeductionPercent, 24.4);
}

// Case 2 — the £100,000 taper: £100,000 vs £125,000.
// A: PA £12,570 (income exactly £100,000 — no taper yet); tax
// £7,540 + £49,730 @ 40% = £27,432; NI £3,016 + £994.60 =
// £4,010.60; take-home £68,557.40. B: PA £12,570 − £12,500 =
// £70; taxable £124,930 → £7,540 + £87,230 @ 40% = £42,432;
// NI £3,016 + £1,494.60 = £4,510.60; take-home £78,057.40.
// Of the £25,000 rise only £9,500 lands — 38.00% kept — and
// the marginal rate inside the taper is 62% (60% tax + 2% NI).
{
  const r = run("Case 2: £100,000 vs £125,000 (taper)", {
    a: { salary: 100000 },
    b: { salary: 125000 },
  });
  check("A take-home", r.a.takeHomeAnnual, 68557.4);
  check("B personal allowance", r.b.personalAllowance, 70.0);
  check("B income tax", r.b.incomeTax, 42432.0);
  check("B take-home", r.b.takeHomeAnnual, 78057.4);
  check("take-home difference", r.takeHomeDifferenceAnnual, 9500.0);
  check("keep % of the rise", r.keepPercentOfDifference ?? -1, 38.0);
  checkBool("B in taper zone", r.b.inTaperZone, true);
  checkBool("A in taper zone", r.a.inTaperZone, false);
  check("B marginal rate", r.b.marginalRatePercent, 62.0);
}

// Case 3 — a rise that crosses into the higher rate: £45,000
// vs £55,000. A: £32,430 @ 20% = £6,486; NI £2,594.40;
// take-home £35,919.60. B: £7,540 + £4,730 @ 40% = £9,432;
// NI £3,016 + £94.60 = £3,110.60; take-home £42,457.40.
// Difference £6,537.80 of £10,000 — 65.38% kept.
{
  const r = run("Case 3: £45,000 vs £55,000", {
    a: { salary: 45000 },
    b: { salary: 55000 },
  });
  check("A take-home", r.a.takeHomeAnnual, 35919.6);
  check("B income tax", r.b.incomeTax, 9432.0);
  check("B take-home", r.b.takeHomeAnnual, 42457.4);
  check("keep % of the rise", r.keepPercentOfDifference ?? -1, 65.38);
  check("B marginal rate", r.b.marginalRatePercent, 42.0);
}

// Case 4 — Plan 2 student loan on both: £40,000 vs £60,000.
// Loan A: (£40,000 − £29,385) @ 9% = £955.35 → take-home
// £31,364.25. Loan B: £30,615 @ 9% = £2,755.35 → take-home
// £42,602.05. Difference £11,237.80 — 56.19% of the rise kept.
// Marginal rate at B: 40% + 2% + 9% = 51%.
{
  const r = run("Case 4: £40,000 vs £60,000, Plan 2 loan", {
    a: { salary: 40000 },
    b: { salary: 60000 },
    undergraduatePlan: "plan2",
  });
  check("A student loan", r.a.studentLoan, 955.35);
  check("A take-home", r.a.takeHomeAnnual, 31364.25);
  check("B student loan", r.b.studentLoan, 2755.35);
  check("B take-home", r.b.takeHomeAnnual, 42602.05);
  check("keep % of the rise", r.keepPercentOfDifference ?? -1, 56.19);
  check("B marginal rate", r.b.marginalRatePercent, 51.0);
}

// Case 5 — total reward: the lower gross wins on pension.
// A: £55,000, employee 5%, employer 3%. Pay £52,250; tax
// £7,540 + £1,980 @ 40% = £8,332; NI £3,016 + £39.60 =
// £3,055.60; take-home £40,862.40; employer pension £1,650;
// total reward £56,650; total value £45,262.40.
// B: £52,000, employee 5%, employer 12%. Pay £49,400; tax
// £36,830 @ 20% = £7,366; NI £2,946.40; take-home £39,087.60;
// employer pension £6,240; total reward £58,240; total value
// £47,927.60. B pays £1,774.80 LESS cash but is worth
// £1,590 MORE in total reward (£2,665.20 more in total value).
{
  const r = run("Case 5: £55k (er 3%) vs £52k (er 12%)", {
    a: { salary: 55000, employeePensionPercent: 5, employerPensionPercent: 3 },
    b: { salary: 52000, employeePensionPercent: 5, employerPensionPercent: 12 },
  });
  check("A take-home", r.a.takeHomeAnnual, 40862.4);
  check("A employer pension", r.a.employerPension, 1650.0);
  check("A total reward", r.a.totalReward, 56650.0);
  check("A total value", r.a.totalValue, 45262.4);
  check("B take-home", r.b.takeHomeAnnual, 39087.6);
  check("B employer pension", r.b.employerPension, 6240.0);
  check("B total reward", r.b.totalReward, 58240.0);
  check("B total value", r.b.totalValue, 47927.6);
  check("take-home difference", r.takeHomeDifferenceAnnual, -1774.8);
  check("total reward difference", r.totalRewardDifference, 1590.0);
  checkBool("B wins total reward", r.totalRewardWinner === "B", true);
  checkBool("A wins take-home", r.takeHomeWinner === "A", true);
}

// Case 6 — part-time: £30,000 full-time (37.5h) vs £24,000 at
// 30 hours. A: tax £3,486, NI £1,394.40, take-home £25,119.60
// (£483.07/wk). B: tax £2,286, NI £914.40, take-home
// £20,799.60 (£399.99/wk). The hourly gross is the SAME
// £15.38 — but B keeps £13.33 of each hour against A's £12.88,
// because the same allowances are spread over fewer pounds.
{
  const r = run("Case 6: £30,000 @37.5h vs £24,000 @30h", {
    a: { salary: 30000, hoursPerWeek: 37.5 },
    b: { salary: 24000, hoursPerWeek: 30 },
  });
  check("A take-home", r.a.takeHomeAnnual, 25119.6);
  check("A take-home / week", r.a.takeHomeWeekly, 483.07);
  check("A gross hourly", r.a.grossHourly, 15.38);
  check("A take-home hourly", r.a.takeHomeHourly, 12.88);
  check("B take-home", r.b.takeHomeAnnual, 20799.6);
  check("B take-home / week", r.b.takeHomeWeekly, 399.99);
  check("B gross hourly", r.b.grossHourly, 15.38);
  check("B take-home hourly", r.b.takeHomeHourly, 13.33);
}

// Case 7 — a bonus is taxed like salary, but it is not
// pensionable: £50,000 + £5,000 bonus with a 5% employee
// pension. The pension is 5% of the £50,000 salary (£2,500),
// not of £55,000. Pay £52,500; taxable £39,930 → £7,540 +
// £2,230 @ 40% = £8,432; NI £3,016 + £44.60 = £3,060.60;
// take-home £41,007.40.
{
  const r = run("Case 7: £50,000 + £5,000 bonus vs £52,000", {
    a: { salary: 50000, bonus: 5000, employeePensionPercent: 5 },
    b: { salary: 52000 },
  });
  check("A gross pay", r.a.grossPay, 55000.0);
  check("A employee pension (on salary only)", r.a.employeePension, 2500.0);
  check("A pay after pension", r.a.payAfterPension, 52500.0);
  check("A income tax", r.a.incomeTax, 8432.0);
  check("A NI", r.a.nationalInsurance, 3060.6);
  check("A take-home", r.a.takeHomeAnnual, 41007.4);
}

console.log(
  failures === 0
    ? "\nAll salary-comparison checks passed."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
