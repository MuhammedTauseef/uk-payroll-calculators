/**
 * Hand-computed verification of the payslip calculator maths.
 *
 * Run with:  npm run verify:payslip-calculator
 *
 * 2026/27: Personal Allowance £12,570; tax 20% to £37,700 of taxable
 * income; employee NI 8% from £12,570 to £50,270; Plan 2 student loan
 * 9% over the £2,448 monthly threshold (GOV.UK). Pension is a net-pay
 * arrangement: it reduces tax, never NI. Every expected value below
 * is worked out by hand. Exits non-zero on any disagreement.
 */
import {
  calculatePayslipBreakdown,
  type PayslipCalculatorInput,
} from "../src/lib/payslip-calculator.ts";

let failures = 0;

function check(
  name: string,
  input: PayslipCalculatorInput,
  expected: {
    pensionMonthly: number;
    incomeTaxMonthly: number;
    employeeNiMonthly: number;
    studentLoanMonthly: number;
    netMonthly: number;
  },
) {
  const actual = calculatePayslipBreakdown(input);
  for (const k of Object.keys(expected) as (keyof typeof expected)[]) {
    if (Math.abs(actual[k] - expected[k]) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`);
    }
  }
}

// £36,000, 1257L, 5% pension, Plan 2 loan:
//   gross £3,000/mo; pension £150/mo (£1,800/yr)
//   tax: (£34,200 − £12,570) × 20% = £4,326/yr → £360.50/mo
//   NI: (£36,000 − £12,570) × 8% = £1,874.40/yr → £156.20/mo
//   loan: (£3,000 − £2,448) × 9% = £49.68/mo
//   net: £3,000 − £150 − £360.50 − £156.20 − £49.68 = £2,283.62
check(
  "£36,000, 5% pension, Plan 2",
  { annualSalary: 36000, taxCode: "1257L", pensionPercent: 5, studentLoanPlan: "plan2", postgraduateLoanToo: false },
  {
    pensionMonthly: 150,
    incomeTaxMonthly: 360.5,
    employeeNiMonthly: 156.2,
    studentLoanMonthly: 49.68,
    netMonthly: 2283.62,
  },
);

// £36,000, 1257L, no pension, no loan — must match the take-home
// calculator: tax (£36,000 − £12,570) × 20% = £4,686/yr → £390.50/mo;
// NI £156.20/mo; net £2,453.30.
check(
  "£36,000, no pension, no loan",
  { annualSalary: 36000, taxCode: "1257L", pensionPercent: 0, studentLoanPlan: null, postgraduateLoanToo: false },
  {
    pensionMonthly: 0,
    incomeTaxMonthly: 390.5,
    employeeNiMonthly: 156.2,
    studentLoanMonthly: 0,
    netMonthly: 2453.3,
  },
);

// £60,000, 1257L, 5% pension, no loan:
//   pension £250/mo; taxable pay £57,000
//   tax: £7,540 + (£44,430 − £37,700) × 40% = £10,232/yr → £852.67/mo
//   NI: £3,016 + £9,730 × 2% = £3,210.60/yr → £267.55/mo
//   net: £5,000 − £250 − £852.67 − £267.55 = £3,629.78
check(
  "£60,000, 5% pension, no loan",
  { annualSalary: 60000, taxCode: "1257L", pensionPercent: 5, studentLoanPlan: null, postgraduateLoanToo: false },
  {
    pensionMonthly: 250,
    incomeTaxMonthly: 852.67,
    employeeNiMonthly: 267.55,
    studentLoanMonthly: 0,
    netMonthly: 3629.78,
  },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll payslip calculator checks passed");
