/**
 * Hand-computed verification of the adjusted net income engine.
 *
 * Run with:  npm run verify:ani
 *
 * The engine (src/lib/adjusted-net-income.ts) applies section 58 of
 * the Income Tax Act 2007 as HMRC's GOV.UK guidance sets it out:
 * total taxable income less grossed-up (× 1.25) relief-at-source
 * pension contributions and Gift Aid donations. Every expected
 * figure below was worked out by hand from those rules first:
 *
 *  (1) £110,000 salary, £10,000 net pension: grossed up £12,500 →
 *      ANI £97,500 → full Personal Allowance £12,570, Tax-Free
 *      Childcare kept, Child Benefit charge capped at 100%.
 *  (2) £70,000, no deductions: ANI £70,000 → charge =
 *      (£70,000 − £60,000) / £200 = 50 complete steps → 50%.
 *  (3) £110,000, £8,000 net pension: grossed up £10,000 → ANI
 *      exactly £100,000 → PA intact, nothing needed to reach £100k.
 *  (4) £110,000, no pension: ANI £110,000 → PA lost £10,000/2 =
 *      £5,000 → PA £7,570; childcare lost; gross £10,000 (net
 *      £8,000) restores the line.
 *  (5) £68,000: charge (£8,000/£200) = 40%; gross £8,000 (net
 *      £6,400) reaches £60,000.
 *  (6) Charge step edges: £60,199 → 0% (no complete £200 step),
 *      £60,200 → 1%.
 *  (7) Allowance edges: £125,140 → PA £0; £125,139 → PA £1.
 *  (8) Gift Aid: £50,000 income, £4,000 given → £5,000 grossed up →
 *      ANI £45,000.
 *  (9) All six income lines: 40,000 + 20,000 + 1,000 + 2,000 +
 *      6,000 + 1,000 = £70,000; £4,000 net pension → £5,000 off →
 *      ANI £65,000 → charge 25%.
 * Exits non-zero if any figure disagrees.
 */
import { calculateAdjustedNetIncome } from "../src/lib/adjusted-net-income.ts";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${actual} (expected ${expected})`);
}

const base = {
  taxYear: "2026/27" as const,
  employmentIncome: 0,
  selfEmploymentProfit: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  propertyIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  giftAidPaidNet: 0,
};

// (1)
const t1 = calculateAdjustedNetIncome({ ...base, employmentIncome: 110000, pensionPaidNet: 10000 });
check("1 pension grossed up", t1.pensionGross, 12500);
check("1 ANI", t1.adjustedNetIncome, 97500);
check("1 Personal Allowance", t1.personalAllowance, 12570);
check("1 Tax-Free Childcare eligible", t1.taxFreeChildcareEligible, true);
check("1 Child Benefit charge", t1.hicbcPercent, 100);

// (2)
const t2 = calculateAdjustedNetIncome({ ...base, employmentIncome: 70000 });
check("2 ANI", t2.adjustedNetIncome, 70000);
check("2 Child Benefit charge", t2.hicbcPercent, 50);

// (3)
const t3 = calculateAdjustedNetIncome({ ...base, employmentIncome: 110000, pensionPaidNet: 8000 });
check("3 ANI", t3.adjustedNetIncome, 100000);
check("3 Personal Allowance", t3.personalAllowance, 12570);
check("3 pension needed to £100k", t3.pensionGrossTo100k, 0);

// (4)
const t4 = calculateAdjustedNetIncome({ ...base, employmentIncome: 110000 });
check("4 ANI", t4.adjustedNetIncome, 110000);
check("4 Personal Allowance", t4.personalAllowance, 7570);
check("4 PA lost", t4.personalAllowanceLost, 5000);
check("4 Tax-Free Childcare eligible", t4.taxFreeChildcareEligible, false);
check("4 gross to £100k", t4.pensionGrossTo100k, 10000);
check("4 net cost to £100k", t4.pensionNetTo100k, 8000);

// (5)
const t5 = calculateAdjustedNetIncome({ ...base, employmentIncome: 68000 });
check("5 Child Benefit charge", t5.hicbcPercent, 40);
check("5 gross to £60k", t5.pensionGrossTo60k, 8000);
check("5 net cost to £60k", t5.pensionNetTo60k, 6400);

// (6)
check("6 charge at £60,199", calculateAdjustedNetIncome({ ...base, employmentIncome: 60199 }).hicbcPercent, 0);
check("6 charge at £60,200", calculateAdjustedNetIncome({ ...base, employmentIncome: 60200 }).hicbcPercent, 1);

// (7)
check("7 PA at £125,140", calculateAdjustedNetIncome({ ...base, employmentIncome: 125140 }).personalAllowance, 0);
check("7 PA at £125,139", calculateAdjustedNetIncome({ ...base, employmentIncome: 125139 }).personalAllowance, 1);

// (8)
const t8 = calculateAdjustedNetIncome({ ...base, employmentIncome: 50000, giftAidPaidNet: 4000 });
check("8 Gift Aid grossed up", t8.giftAidGross, 5000);
check("8 ANI", t8.adjustedNetIncome, 45000);

// (9)
const t9 = calculateAdjustedNetIncome({
  ...base,
  employmentIncome: 40000,
  selfEmploymentProfit: 20000,
  savingsIncome: 1000,
  dividendIncome: 2000,
  propertyIncome: 6000,
  otherIncome: 1000,
  pensionPaidNet: 4000,
});
check("9 total income", t9.totalIncome, 70000);
check("9 ANI", t9.adjustedNetIncome, 65000);
check("9 Child Benefit charge", t9.hicbcPercent, 25);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll adjusted net income checks passed.");
