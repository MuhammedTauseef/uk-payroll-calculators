/**
 * Hand-computed verification of the tapered annual allowance engine.
 *
 * Run with:  npm run verify:taper
 *
 * The engine (src/lib/tapered-annual-allowance.ts) applies HMRC's
 * GOV.UK guidance "Work out your reduced (tapered) annual
 * allowance" and HS345: the taper needs threshold income over
 * £200,000 AND adjusted income over £260,000; the allowance then
 * falls £1 per £2 over £260,000 (rounded down), floored at
 * £10,000. Every expected figure below was worked out by hand
 * from those rules first:
 *
 *  (1) Boundary: employment £250,000 + employer £10,000 →
 *      adjusted income exactly £260,000 → NOT over the line →
 *      full £60,000.
 *  (2) Employment £260,000 + employer £10,000 → adjusted
 *      £270,000 → reduction (£10,000 / 2) = £5,000 → £55,000.
 *  (3) Employment £350,000 + employer £10,000 → adjusted
 *      £360,000 → reduction £50,000 → the £10,000 floor; and at
 *      £400,000 adjusted the floor still holds.
 *  (4) Threshold test saves: employment £190,000 + employer
 *      £150,000 → threshold £190,000 (employer's money is not in
 *      net income) but adjusted £340,000 → no taper → £60,000.
 *  (5) Relief at source: £270,000 salary, £60,000 paid in net →
 *      grossed up £75,000 → threshold £195,000 → taper OFF even
 *      though adjusted income is £280,000 (employer £10,000).
 *      (The ukfinancetools "Omar" scenario.)
 *  (6) Escape solver: threshold £250,000 (salary £250,000,
 *      employer £30,000 → adjusted £280,000, tapered to £50,000)
 *      → escape contribution £50,000 gross, £40,000 out of pocket.
 *  (7) Net-pay contributions: pay £220,000 before a £20,000
 *      net-pay contribution → net income £200,000, threshold
 *      £200,000 (not over) → no taper; adjusted income back up
 *      to £220,000.
 *  (8) Salary sacrifice add-back: pay £240,000 after sacrificing
 *      £30,000 → threshold £270,000; adjusted £240,000 + £30,000
 *      (the sacrifice is an employer saving) = £270,000 → both
 *      tests passed → reduction £5,000 → £55,000.
 *  (9) MPAA: flexibly accessed, adjusted £300,000 → tapered
 *      allowance £40,000, but money purchase savings capped at
 *      the £10,000 MPAA; alternative allowance £40,000 − £10,000
 *      = £30,000.
 * (10) Carry forward (2026/27): savings 2023/24 £40,000 (unused
 *      £20,000), 2024/25 £50,000 (unused £10,000), 2025/26
 *      £60,000 (unused £0) → £30,000 carried forward → available
 *      £60,000 + £30,000 = £90,000.
 * (11) Carry forward (2025/26) reaches 2022/23: that year's
 *      standard allowance was £40,000 → savings £25,000 leave
 *      £15,000 unused.
 * (12) Excess + charge: planned savings £100,000 against a
 *      £60,000 available allowance → excess £40,000 → at 45%
 *      the charge estimate is £18,000.
 * (13) Gift Aid changes neither measure: £300,000 salary with a
 *      £8,000 net Gift Aid donation → threshold and adjusted
 *      income both stay £300,000 → tapered to £40,000.
 * Exits non-zero if any figure disagrees.
 */
import {
  calculateTaperedAnnualAllowance,
  type TaperInput,
} from "../src/lib/tapered-annual-allowance.ts";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${actual} (expected ${expected})`);
}

const base: TaperInput = {
  taxYear: "2026/27",
  employmentIncome: 0,
  selfEmploymentProfit: 0,
  propertyIncome: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  contributionsGross: 0,
  employerContributions: 0,
  salarySacrifice: 0,
  giftAidPaidNet: 0,
  flexiblyAccessed: false,
  plannedSavings: 0,
  marginalRatePercent: 45,
  carryForward: [
    { year: "2023/24", pensionSavings: 0, allowance: 60000 },
    { year: "2024/25", pensionSavings: 0, allowance: 60000 },
    { year: "2025/26", pensionSavings: 0, allowance: 60000 },
  ],
};

// (1)
const t1 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 250000, employerContributions: 10000 });
check("1 adjusted income", t1.adjustedIncome, 260000);
check("1 adjusted test passed", t1.adjustedTestPassed, false);
check("1 tapered", t1.tapered, false);
check("1 allowance", t1.taperedAllowance, 60000);

// (2)
const t2 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 260000, employerContributions: 10000 });
check("2 adjusted income", t2.adjustedIncome, 270000);
check("2 reduction", t2.reduction, 5000);
check("2 allowance", t2.taperedAllowance, 55000);

// (3)
const t3 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 350000, employerContributions: 10000 });
check("3 adjusted income", t3.adjustedIncome, 360000);
check("3 allowance at £360k", t3.taperedAllowance, 10000);
const t3b = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 390000, employerContributions: 10000 });
check("3 adjusted income £400k", t3b.adjustedIncome, 400000);
check("3 allowance floor holds", t3b.taperedAllowance, 10000);

// (4)
const t4 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 190000, employerContributions: 150000 });
check("4 threshold income", t4.thresholdIncome, 190000);
check("4 adjusted income", t4.adjustedIncome, 340000);
check("4 threshold test passed", t4.thresholdTestPassed, false);
check("4 tapered", t4.tapered, false);
check("4 allowance", t4.taperedAllowance, 60000);

// (5)
const t5 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 270000, employerContributions: 10000, pensionPaidNet: 60000 });
check("5 RAS grossed up", t5.rasGross, 75000);
check("5 threshold income", t5.thresholdIncome, 195000);
check("5 adjusted income", t5.adjustedIncome, 280000);
check("5 tapered", t5.tapered, false);
check("5 allowance", t5.taperedAllowance, 60000);

// (6)
const t6 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 250000, employerContributions: 30000 });
check("6 tapered", t6.tapered, true);
check("6 allowance before escape", t6.taperedAllowance, 50000);
check("6 escape gross", t6.escapeContributionGross, 50000);
check("6 escape net cost", t6.escapeContributionNet, 40000);

// (7)
const t7 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 220000, contributionsGross: 20000 });
check("7 net income", t7.netIncome, 200000);
check("7 threshold income", t7.thresholdIncome, 200000);
check("7 threshold test passed", t7.thresholdTestPassed, false);
check("7 adjusted income", t7.adjustedIncome, 220000);
check("7 allowance", t7.taperedAllowance, 60000);

// (8)
const t8 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 240000, salarySacrifice: 30000 });
check("8 threshold income", t8.thresholdIncome, 270000);
check("8 adjusted income", t8.adjustedIncome, 270000);
check("8 tapered", t8.tapered, true);
check("8 allowance", t8.taperedAllowance, 55000);

// (9)
const t9 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 290000, employerContributions: 10000, flexiblyAccessed: true });
check("9 adjusted income", t9.adjustedIncome, 300000);
check("9 tapered allowance", t9.taperedAllowance, 40000);
check("9 MPAA applies", t9.mpaaApplies, true);
check("9 money purchase allowance", t9.moneyPurchaseAllowance, 10000);
check("9 alternative allowance", t9.alternativeAllowance, 30000);

// (10)
const t10 = calculateTaperedAnnualAllowance({
  ...base,
  employmentIncome: 120000,
  carryForward: [
    { year: "2023/24", pensionSavings: 40000, allowance: 60000 },
    { year: "2024/25", pensionSavings: 50000, allowance: 60000 },
    { year: "2025/26", pensionSavings: 60000, allowance: 60000 },
  ],
});
check("10 unused 2023/24", t10.carryForwardYears[0].unused, 20000);
check("10 unused 2024/25", t10.carryForwardYears[1].unused, 10000);
check("10 unused 2025/26", t10.carryForwardYears[2].unused, 0);
check("10 total carry forward", t10.totalCarryForward, 30000);
check("10 available allowance", t10.availableAllowance, 90000);

// (11)
const t11 = calculateTaperedAnnualAllowance({
  ...base,
  taxYear: "2025/26",
  employmentIncome: 120000,
  carryForward: [
    { year: "2022/23", pensionSavings: 25000, allowance: 40000 },
    { year: "2023/24", pensionSavings: 60000, allowance: 60000 },
    { year: "2024/25", pensionSavings: 60000, allowance: 60000 },
  ],
});
check("11 unused 2022/23 (£40k year)", t11.carryForwardYears[0].unused, 15000);
check("11 total carry forward", t11.totalCarryForward, 15000);

// (12)
const t12 = calculateTaperedAnnualAllowance({
  ...base,
  employmentIncome: 150000,
  plannedSavings: 100000,
  marginalRatePercent: 45,
  carryForward: [
    { year: "2023/24", pensionSavings: 60000, allowance: 60000 },
    { year: "2024/25", pensionSavings: 60000, allowance: 60000 },
    { year: "2025/26", pensionSavings: 60000, allowance: 60000 },
  ],
});
check("12 available allowance", t12.availableAllowance, 60000);
check("12 excess", t12.excess, 40000);
check("12 charge estimate", t12.chargeEstimate, 18000);

// (13)
const t13 = calculateTaperedAnnualAllowance({ ...base, employmentIncome: 300000, giftAidPaidNet: 8000 });
check("13 threshold income", t13.thresholdIncome, 300000);
check("13 adjusted income", t13.adjustedIncome, 300000);
check("13 allowance", t13.taperedAllowance, 40000);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll tapered annual allowance checks passed.");
