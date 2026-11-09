/**
 * Hand-computed verification of the IR35 calculator maths.
 *
 * Run with:  npm run verify:ir35
 *
 * Every case below was worked out by hand first from the rules
 * GOV.UK states (re-read 9 November 2026):
 *   - "Understanding off-payroll working (IR35)" + "Check
 *     employment status for tax (CEST)": inside IR35 the deemed
 *     employer deducts Income Tax and employee NI from the fees and
 *     pays employer NI (15% above the £5,000 Secondary Threshold)
 *     on top; student loan is NOT deducted by the deemed employer.
 *   - Income Tax 2026/27 (England, Wales and Northern Ireland):
 *     Personal Allowance £12,570, tapered £1 per £2 over £100,000;
 *     20% to £37,700 taxable, 40% to £125,140, 45% above.
 *   - Employee NI: 8% from £12,570 to £50,270, 2% above.
 *   - Corporation Tax: 19% at or below £50,000 profit, 25% at or
 *     above £250,000, Marginal Relief between the two
 *     (tax = 25% × profit − 3/200 × (£250,000 − profit)).
 *   - Dividend tax 2026/27: £500 allowance, then 10.75% basic,
 *     35.75% higher, 39.35% additional; the salary sits at the
 *     bottom of the bands and dividends are the top slice.
 *   - A one-director company cannot claim the Employment
 *     Allowance, so the employer NI on the salary is shown in full.
 *
 * Money is compared to the penny (0.01) rather than the
 * sub-penny: a few intermediates carry three decimals
 * (e.g. Corporation Tax 19% of £43,794.50 = £8,320.955), and
 * binary floating point rounds the half-penny either way. A
 * penny tolerance still catches any real maths error.
 * Exits non-zero if any figure disagrees.
 */
import {
  assessStatus,
  calculateIr35,
  corporationTaxFor,
  dividendTaxFor,
  salaryTaxFor,
} from "../src/lib/ir35.ts";
import type { Ir35Input } from "../src/lib/ir35.ts";

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
  if (Math.abs(actual - expected) > 0.011) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

function checkStr(
  caseName: string,
  field: string,
  actual: string,
  expected: string,
) {
  if (actual !== expected) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

// --- Corporation Tax boundaries (GOV.UK rates) --------------------------
// £50,000 profit: 19% = £9,500. £250,000: 25% = £62,500.
// £100,000: 25% (£25,000) − 3/200 × £150,000 (£2,250) = £22,750.
checkNum("ct", "50000", corporationTaxFor(50000), 9500);
checkNum("ct", "250000", corporationTaxFor(250000), 62500);
checkNum("ct", "100000", corporationTaxFor(100000), 22750);
checkNum("ct", "0", corporationTaxFor(0), 0);
checkNum("ct", "negative", corporationTaxFor(-5000), 0);

// --- Dividend tax on its own ---------------------------------------------
// £30,000 dividends, no salary: the £12,570 Personal Allowance
// covers the first £12,570, leaving £17,430 taxable; the £500
// dividend allowance leaves £16,930 at 10.75% = £1,819.98.
// £500 dividends: inside the Personal Allowance, no tax.
// £60,000 dividends, no salary: £47,430 taxable after the
// Personal Allowance; £46,930 after the £500 allowance; basic
// £37,700 × 10.75% = £4,052.75; higher £9,230 × 35.75% =
// £3,299.73; total £7,352.48.
checkNum("div", "30k-no-salary", dividendTaxFor(30000, 0), 1819.98);
checkNum("div", "allowance-only", dividendTaxFor(500, 0), 0);
checkNum("div", "60k-no-salary", dividendTaxFor(60000, 0), 7352.48);
// Salary tax: £12,570 salary with £128,916.46 dividends — combined
// income £141,486.46, allowance tapered to £0, so the whole salary
// is taxable at 20% = £2,514.
checkNum("salary-tax", "tapered", salaryTaxFor(12570, 128916.46), 2514);
// £12,570 salary with £61,296.46 dividends — combined £73,866.46,
// allowance in full, salary tax £0.
checkNum("salary-tax", "untapered", salaryTaxFor(12570, 61296.46), 0);

// --- Status scoring -------------------------------------------------------
{
  const allOutside = assessStatus([
    false, false, false, false, false, false, false, false,
  ]);
  checkNum("status", "all-outside-points", allOutside.insidePoints, 0);
  checkStr("status", "all-outside-verdict", allOutside.verdict, "outside");

  const allInside = assessStatus([
    true, true, true, true, true, true, true, true,
  ]);
  checkNum("status", "all-inside-points", allInside.insidePoints, 8);
  checkStr("status", "all-inside-verdict", allInside.verdict, "inside");

  const mixed = assessStatus([
    true, true, false, false, true, false, true, false,
  ]);
  checkNum("status", "mixed-points", mixed.insidePoints, 4);
  checkStr("status", "mixed-verdict", mixed.verdict, "borderline");
}

// --- £500 a day, 5 days, 46 weeks: gross £115,000 -------------------------
// INSIDE: allowance £12,570 − £7,500 (taper) = £5,070; taxable
// £109,930; tax = £7,540 + £28,892 = £36,432. NI = £3,016 +
// £1,294.60 = £4,310.60. Take-home £74,257.40. Employer NI the
// fee-payer pays: 15% × £110,000 = £16,500.
// OUTSIDE: salary £12,570 (tax £0 — combined income under £100k);
// employer NI 15% × £7,570 = £1,135.50; profit £101,294.50;
// Corporation Tax £23,093.04; dividends £78,201.46; dividend tax
// £4,052.75 + £14,300.52 = £18,353.27; take-home £72,418.19.
// Difference −£1,839.21: inside wins at this rate.
{
  const r = calculateIr35({ dayRate: 500, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("500day", "grossAnnual", r.grossAnnual, 115000);
  checkNum("500day", "insideIncomeTax", r.insideIncomeTax, 36432);
  checkNum("500day", "insideEmployeeNi", r.insideEmployeeNi, 4310.6);
  checkNum("500day", "insideTakeHome", r.insideTakeHome, 74257.4);
  checkNum("500day", "insideEmployerNi", r.insideEmployerNi, 16500);
  checkNum("500day", "outsideSalary", r.outsideSalary, 12570);
  checkNum("500day", "outsideSalaryTax", r.outsideSalaryTax, 0);
  checkNum("500day", "outsideEmployerNi", r.outsideEmployerNi, 1135.5);
  checkNum("500day", "outsideProfit", r.outsideProfit, 101294.5);
  checkNum("500day", "outsideCorporationTax", r.outsideCorporationTax, 23093.04);
  checkNum("500day", "outsideDividends", r.outsideDividends, 78201.46);
  checkNum("500day", "outsideDividendTax", r.outsideDividendTax, 18353.27);
  checkNum("500day", "outsideTakeHome", r.outsideTakeHome, 72418.19);
  checkNum("500day", "difference", r.difference, -1839.21);
  checkStr("500day", "betterRoute", r.betterRoute, "inside");
}

// --- £250 a day, 5 days, 46 weeks: gross £57,500 --------------------------
// INSIDE: tax £10,432; NI £3,160.60; take-home £43,907.40.
// OUTSIDE: profit £43,794.50; Corporation Tax 19% = £8,320.96;
// dividends £35,473.55; dividend tax £3,759.66 (all inside the
// basic band after the £500 allowance); take-home £44,283.89.
// Difference +£376.49: outside wins at this rate.
{
  const r = calculateIr35({ dayRate: 250, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("250day", "grossAnnual", r.grossAnnual, 57500);
  checkNum("250day", "insideIncomeTax", r.insideIncomeTax, 10432);
  checkNum("250day", "insideEmployeeNi", r.insideEmployeeNi, 3160.6);
  checkNum("250day", "insideTakeHome", r.insideTakeHome, 43907.4);
  checkNum("250day", "outsideProfit", r.outsideProfit, 43794.5);
  checkNum("250day", "outsideCorporationTax", r.outsideCorporationTax, 8320.96);
  checkNum("250day", "outsideDividends", r.outsideDividends, 35473.55);
  checkNum("250day", "outsideDividendTax", r.outsideDividendTax, 3759.66);
  checkNum("250day", "outsideTakeHome", r.outsideTakeHome, 44283.89);
  checkNum("250day", "difference", r.difference, 376.49);
  checkStr("250day", "betterRoute", r.betterRoute, "outside");
}

// --- £400 a day, 5 days, 46 weeks: gross £92,000 --------------------------
// INSIDE: tax £24,232; NI £3,850.60; take-home £63,917.40.
// OUTSIDE: profit £78,294.50; Corporation Tax £16,998.04;
// dividends £61,296.46; dividend tax £12,309.73; take-home
// £61,556.73. Difference −£2,360.67: inside wins.
{
  const r = calculateIr35({ dayRate: 400, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("400day", "grossAnnual", r.grossAnnual, 92000);
  checkNum("400day", "insideIncomeTax", r.insideIncomeTax, 24232);
  checkNum("400day", "insideEmployeeNi", r.insideEmployeeNi, 3850.6);
  checkNum("400day", "insideTakeHome", r.insideTakeHome, 63917.4);
  checkNum("400day", "outsideProfit", r.outsideProfit, 78294.5);
  checkNum("400day", "outsideCorporationTax", r.outsideCorporationTax, 16998.04);
  checkNum("400day", "outsideDividends", r.outsideDividends, 61296.46);
  checkNum("400day", "outsideDividendTax", r.outsideDividendTax, 12309.73);
  checkNum("400day", "outsideTakeHome", r.outsideTakeHome, 61556.73);
  checkNum("400day", "difference", r.difference, -2360.67);
  checkStr("400day", "betterRoute", r.betterRoute, "inside");
}

// --- £600 a day, 5 days, 46 weeks: gross £138,000 --------------------------
// INSIDE: allowance tapered to £0; tax £48,303; NI £4,770.60;
// take-home £84,926.40.
// OUTSIDE: profit £124,294.50; Corporation Tax £29,188.04;
// dividends £95,106.46; salary tax £767.60 (allowance tapered to
// £8,732, so £3,838 of the salary is taxable at 20%); dividend
// tax £25,356.31; take-home £81,552.55. Difference −£3,373.85.
{
  const r = calculateIr35({ dayRate: 600, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("600day", "grossAnnual", r.grossAnnual, 138000);
  checkNum("600day", "insideIncomeTax", r.insideIncomeTax, 48303);
  checkNum("600day", "insideEmployeeNi", r.insideEmployeeNi, 4770.6);
  checkNum("600day", "insideTakeHome", r.insideTakeHome, 84926.4);
  checkNum("600day", "outsideSalaryTax", r.outsideSalaryTax, 767.6);
  checkNum("600day", "outsideProfit", r.outsideProfit, 124294.5);
  checkNum("600day", "outsideCorporationTax", r.outsideCorporationTax, 29188.04);
  checkNum("600day", "outsideDividends", r.outsideDividends, 95106.46);
  checkNum("600day", "outsideDividendTax", r.outsideDividendTax, 25356.31);
  checkNum("600day", "outsideTakeHome", r.outsideTakeHome, 81552.55);
  checkNum("600day", "difference", r.difference, -3373.85);
  checkStr("600day", "betterRoute", r.betterRoute, "inside");
}

// --- £800 a day, 5 days, 46 weeks: gross £184,000 --------------------------
// INSIDE: tax £69,003; NI £5,690.60; take-home £109,306.40.
// OUTSIDE: profit £170,294.50; Corporation Tax £41,378.04;
// dividends £128,916.46; salary tax £2,514 (allowance £0);
// dividend tax £40,196.86 (basic £2,701.48 + higher £31,259.80 +
// additional £6,235.58); take-home £98,775.60.
// Difference −£10,530.80.
{
  const r = calculateIr35({ dayRate: 800, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("800day", "grossAnnual", r.grossAnnual, 184000);
  checkNum("800day", "insideIncomeTax", r.insideIncomeTax, 69003);
  checkNum("800day", "insideEmployeeNi", r.insideEmployeeNi, 5690.6);
  checkNum("800day", "insideTakeHome", r.insideTakeHome, 109306.4);
  checkNum("800day", "outsideSalaryTax", r.outsideSalaryTax, 2514);
  checkNum("800day", "outsideProfit", r.outsideProfit, 170294.5);
  checkNum("800day", "outsideCorporationTax", r.outsideCorporationTax, 41378.04);
  checkNum("800day", "outsideDividends", r.outsideDividends, 128916.46);
  checkNum("800day", "outsideDividendTax", r.outsideDividendTax, 40196.86);
  checkNum("800day", "outsideTakeHome", r.outsideTakeHome, 98775.6);
  checkNum("800day", "difference", r.difference, -10530.8);
  checkStr("800day", "betterRoute", r.betterRoute, "inside");
}

// --- Zero rate: no revenue, no salary, no take-home ------------------------
{
  const r = calculateIr35({ dayRate: 0, daysPerWeek: 5, weeksPerYear: 46 });
  checkNum("zero", "grossAnnual", r.grossAnnual, 0);
  checkNum("zero", "insideTakeHome", r.insideTakeHome, 0);
  checkNum("zero", "outsideSalary", r.outsideSalary, 0);
  checkNum("zero", "outsideTakeHome", r.outsideTakeHome, 0);
  checkNum("zero", "difference", r.difference, 0);
  checkStr("zero", "betterRoute", r.betterRoute, "equal");
}

// --- Part-week: 3 days a week at £500, 46 weeks ----------------------------
// Gross £69,000. INSIDE: tax = £7,540 + (69,000 − 12,570 −
// 37,700 = 18,730) × 40% = £7,540 + £7,492 = £15,032. NI =
// £3,016 + (69,000 − 50,270) × 2% = £3,016 + £374.60 =
// £3,390.60. Take-home £50,577.40.
{
  const r = calculateIr35({ dayRate: 500, daysPerWeek: 3, weeksPerYear: 46 });
  checkNum("partweek", "grossAnnual", r.grossAnnual, 69000);
  checkNum("partweek", "insideIncomeTax", r.insideIncomeTax, 15032);
  checkNum("partweek", "insideEmployeeNi", r.insideEmployeeNi, 3390.6);
  checkNum("partweek", "insideTakeHome", r.insideTakeHome, 50577.4);
}

if (failures > 0) {
  console.error(`\nverify-ir35: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-ir35: all hand-computed checks passed");
