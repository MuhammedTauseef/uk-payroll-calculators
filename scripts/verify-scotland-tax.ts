/**
 * Hand-computed verification of the Scotland salary calculator
 * (Scottish Income Tax 2026/27, UK-wide NI, Plan 4 student loan).
 *
 * Run with:  npm run verify:scotland-tax
 *
 * Every expected figure is worked by hand from the Scottish Rate
 * Resolution for 2026-27 (motion S6M-20844, agreed 19 February
 * 2026; bands as published by the Scottish Government on gov.scot,
 * verified 28 November 2026). The bands apply to TAXABLE income
 * (income above the Personal Allowance):
 *   Starter 19% to £3,967 · Basic 20% to £16,956 · Intermediate
 *   21% to £31,092 · Higher 42% to £62,430 · Advanced 45% to
 *   £125,140 · Top 48% above £125,140.
 * Personal Allowance £12,570, tapering £1 per £2 over £100,000.
 * Employee NI is UK-wide: 8% between £12,570 and £50,270, 2% above.
 *
 * Case A (£35,000): taxable £22,430 → 3,967×19% (£753.73) +
 * 12,989×20% (£2,597.80) + 5,474×21% (£1,149.54) = £4,501.07 tax;
 * NI £22,430×8% = £1,794.40; net £28,704.53.
 * Case B (£50,000): taxable £37,430 → £753.73 + £2,597.80 +
 * 14,136×21% (£2,968.56) + 6,338×42% (£2,661.96) = £8,982.05 tax;
 * NI £2,994.40; net £38,023.55.
 * Case C (£150,000): allowance fully tapered, taxable £150,000 →
 * the first four bands (£19,482.05) + 62,710×45% (£28,219.50) +
 * 24,860×48% (£11,932.80) = £59,634.35 tax; NI £5,010.60;
 * net £85,355.05. (This is the case that pins the advanced band's
 * £125,140 TAXABLE limit: with a £112,570 limit the tax would be
 * £60,011.45 — the Resolution's own wording, and the Scottish
 * Government's worked tables, give £59,634.35.)
 * Case D (£45,000): taxable £32,430 → £753.73 + £2,597.80 +
 * £2,968.56 + 1,338×42% (£561.96) = £6,882.05; NI £2,594.40;
 * net £35,523.55.
 * Case E (£50,000, 5% net-pay pension): pension £2,500, taxable
 * pay £47,500, taxable income £34,930 → £753.73 + £2,597.80 +
 * £2,968.56 + 3,838×42% (£1,611.96) = £7,932.05 tax; NI is on the
 * full gross, £2,994.40; net £36,573.55.
 * Case F (£40,000, Plan 4): repayment per month on GOV.UK's
 * monthly threshold (£2,816): (£3,333.33 − £2,816) × 9% = £46.56
 * a month, £558.72 a year.
 * Marginal rates: at £45,000 the next £100 loses 42% tax + 8% NI
 * = 50%; at £110,000 it loses 45% + 22.5% (allowance taper) + 2%
 * NI = 69.5%.
 * Exits non-zero if any figure disagrees.
 */
import { calculateScotlandTax } from "../src/lib/scotland-tax.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.011) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const plain = { pensionPercent: 0, studentLoanPlan: null, postgraduateLoanToo: false } as const;

// Case A — £35,000, plain.
{
  const r = calculateScotlandTax({ annualSalary: 35000, ...plain });
  check("A", "incomeTax", r.incomeTax, 4501.07);
  check("A", "employeeNationalInsurance", r.employeeNationalInsurance, 1794.4);
  check("A", "netAnnual", r.netAnnual, 28704.53);
  check("A", "netMonthly", r.netMonthly, 2392.04);
  check("A", "starterBandTax", r.bands[0].tax, 753.73);
  check("A", "intermediateSlice", r.bands[2].incomeInBand, 5474);
  check("A", "restOfUkTax", r.restOfUk.incomeTax, 4486);
  check("A", "differencePerYear", r.differencePerYear, -15.07);
}

// Case B — £50,000, plain.
{
  const r = calculateScotlandTax({ annualSalary: 50000, ...plain });
  check("B", "incomeTax", r.incomeTax, 8982.05);
  check("B", "employeeNationalInsurance", r.employeeNationalInsurance, 2994.4);
  check("B", "netAnnual", r.netAnnual, 38023.55);
}

// Case C — £150,000, plain: pins the advanced band limit.
{
  const r = calculateScotlandTax({ annualSalary: 150000, ...plain });
  check("C", "personalAllowance", r.personalAllowance, 0);
  check("C", "incomeTax", r.incomeTax, 59634.35);
  check("C", "employeeNationalInsurance", r.employeeNationalInsurance, 5010.6);
  check("C", "netAnnual", r.netAnnual, 85355.05);
  check("C", "advancedSlice", r.bands[4].incomeInBand, 62710);
  check("C", "topSlice", r.bands[5].incomeInBand, 24860);
}

// Case D — £45,000, plain.
{
  const r = calculateScotlandTax({ annualSalary: 45000, ...plain });
  check("D", "incomeTax", r.incomeTax, 6882.05);
  check("D", "netAnnual", r.netAnnual, 35523.55);
  check("D", "marginalRatePercent", r.marginalRatePercent, 50);
}

// Case E — £50,000 with a 5% net-pay pension.
{
  const r = calculateScotlandTax({
    annualSalary: 50000,
    pensionPercent: 5,
    studentLoanPlan: null,
    postgraduateLoanToo: false,
  });
  check("E", "pensionAnnual", r.pensionAnnual, 2500);
  check("E", "incomeTax", r.incomeTax, 7932.05);
  check("E", "employeeNationalInsurance", r.employeeNationalInsurance, 2994.4);
  check("E", "netAnnual", r.netAnnual, 36573.55);
}

// Case F — £40,000 with a Plan 4 student loan.
{
  const r = calculateScotlandTax({
    annualSalary: 40000,
    pensionPercent: 0,
    studentLoanPlan: "plan4",
    postgraduateLoanToo: false,
  });
  check("F", "studentLoan", r.studentLoan, 558.72);
}

// Marginal rate in the taper zone — £110,000.
{
  const r = calculateScotlandTax({ annualSalary: 110000, ...plain });
  check("T", "marginalRatePercent", r.marginalRatePercent, 69.5);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("verify-scotland-tax: all checks passed.");
