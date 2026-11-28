/**
 * Hand-computed verification of the monthly salary calculator
 * (2026/27, England, Wales and Northern Ireland bands).
 *
 * Run with:  npm run verify:monthly-salary
 *
 * The calculator annualises the entered pay and runs the hub's
 * forward engine, so the expected figures are the standard
 * take-home figures worked by hand: Personal Allowance £12,570,
 * 20% on the first £37,700 of taxable income, employee NI at 8%
 * between £12,570 and £50,270 and 2% above.
 *
 * Case A — £35,000 a year entered as an annual figure: tax
 * £22,430×20% = £4,486; NI £22,430×8% = £1,794.40; net £28,719.60
 * a year, £2,393.30 a month (tax £373.83, NI £149.53 a month).
 * Case B — £3,000 a month entered as a monthly figure: annual
 * £36,000; tax £23,430×20% = £4,686; NI £23,430×8% = £1,874.40;
 * net £29,439.60 a year, £2,453.30 a month.
 * Case C — £673.08 a week entered as a weekly figure: annual
 * £35,000.16 — within a pound of Case A, so the monthly net must
 * land within £0.10 of £2,393.30.
 * Case D — £3,000 a month with a 5% net-pay pension: pension
 * £1,800 a year (£150 a month); taxable pay £34,200; tax
 * £21,630×20% = £4,326; NI on the full gross, £1,874.40; net
 * £27,999.60 a year, £2,333.30 a month.
 * Exits non-zero if any figure disagrees.
 */
import { calculateMonthlySalary } from "../src/lib/monthly-salary.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number, tol = 0.011) {
  if (Math.abs(actual - expected) > tol) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const plain = { pensionPercent: 0, studentLoanPlan: null, postgraduateLoanToo: false } as const;

// Case A — annual entry, £35,000.
{
  const r = calculateMonthlySalary({ amount: 35000, period: "annual", ...plain });
  check("A", "grossAnnual", r.grossAnnual, 35000);
  check("A", "incomeTaxAnnual", r.incomeTaxAnnual, 4486);
  check("A", "employeeNiAnnual", r.employeeNiAnnual, 1794.4);
  check("A", "netAnnual", r.netAnnual, 28719.6);
  check("A", "netMonthly", r.netMonthly, 2393.3);
  check("A", "incomeTaxMonthly", r.incomeTaxMonthly, 373.83);
  check("A", "employeeNiMonthly", r.employeeNiMonthly, 149.53);
}

// Case B — monthly entry, £3,000 a month.
{
  const r = calculateMonthlySalary({ amount: 3000, period: "monthly", ...plain });
  check("B", "grossAnnual", r.grossAnnual, 36000);
  check("B", "incomeTaxAnnual", r.incomeTaxAnnual, 4686);
  check("B", "employeeNiAnnual", r.employeeNiAnnual, 1874.4);
  check("B", "netAnnual", r.netAnnual, 29439.6);
  check("B", "netMonthly", r.netMonthly, 2453.3);
}

// Case C — weekly entry, £673.08 a week ≈ £35,000 a year.
{
  const r = calculateMonthlySalary({ amount: 673.08, period: "weekly", ...plain });
  check("C", "grossAnnual", r.grossAnnual, 35000.16);
  check("C", "netMonthly", r.netMonthly, 2393.3, 0.1);
}

// Case D — monthly entry with a 5% net-pay pension.
{
  const r = calculateMonthlySalary({
    amount: 3000,
    period: "monthly",
    pensionPercent: 5,
    studentLoanPlan: null,
    postgraduateLoanToo: false,
  });
  check("D", "pensionAnnual", r.pensionAnnual, 1800);
  check("D", "pensionMonthly", r.pensionMonthly, 150);
  check("D", "incomeTaxAnnual", r.incomeTaxAnnual, 4326);
  check("D", "netMonthly", r.netMonthly, 2333.3);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("verify-monthly-salary: all checks passed.");
