import {
  calculatePayslipBreakdown,
  type PayslipCalculatorResult,
} from "./payslip-calculator.ts";
import type { StudentLoanPlanId } from "./student-loan.ts";

/**
 * Monthly salary maths — UK, 2026/27 (England, Wales and Northern
 * Ireland bands; Scotland has its own calculator on this hub).
 *
 * Most people are quoted, offered and paid a monthly figure, but
 * every other calculator on this hub leads with the year. This one
 * leads with the month: the pay is entered as it is known — a
 * monthly gross, an annual salary or a weekly wage — annualised,
 * and run through the hub's shipped forward engine
 * (calculatePayslipBreakdown from payslip-calculator.ts, the same
 * maths the payslip calculator and the reverse salary calculator
 * use), so a figure here can never disagree with a figure there.
 *
 * The model is therefore exactly the forward engine's model: the
 * standard 1257L tax code with the £100,000 Personal Allowance
 * taper, an optional pension contribution as a percentage of gross
 * under a net-pay arrangement (it reduces the tax, not the NI),
 * and optional student loan repayments on GOV.UK's monthly
 * thresholds. PAYE in real payroll is cumulative across the tax
 * year; for a steady salary paid evenly, the year's deductions
 * divided by twelve is the monthly figure, which is what this
 * calculator shows — the page says so.
 */

export type MonthlySalaryPeriod = "monthly" | "annual" | "weekly";

export interface MonthlySalaryInput {
  /** The pay figure as entered, £ per period. */
  amount: number;
  /** Which period the entered figure is for. */
  period: MonthlySalaryPeriod;
  /** Employee pension contribution, % of gross (net-pay arrangement). */
  pensionPercent: number;
  /** Student loan plan, or null for none. Postgraduate can be added on top. */
  studentLoanPlan: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is repaid alongside an undergraduate plan. */
  postgraduateLoanToo: boolean;
}

export interface MonthlySalaryResult {
  /** The annual salary the entered figure works out to, £/year. */
  grossAnnual: number;
  grossMonthly: number;
  grossWeekly: number;
  pensionAnnual: number;
  pensionMonthly: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  employeeNiAnnual: number;
  employeeNiMonthly: number;
  studentLoanAnnual: number;
  studentLoanMonthly: number;
  /** Everything taken off in a month, £. */
  totalDeductionsMonthly: number;
  /** Net (take-home) pay per month — the headline figure, £. */
  netMonthly: number;
  netAnnual: number;
  netWeekly: number;
  /** Take-home pay per working day (260 a year), £. */
  netDaily: number;
  /** Share of gross pay kept, 0–100. */
  effectiveKeepPercent: number;
  /** The forward engine's own breakdown, for anything not repeated above. */
  breakdown: PayslipCalculatorResult;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function annualise(amount: number, period: MonthlySalaryPeriod): number {
  const value = Math.max(0, amount || 0);
  if (period === "monthly") return value * 12;
  if (period === "weekly") return value * 52;
  return value;
}

export function calculateMonthlySalary(
  input: MonthlySalaryInput,
): MonthlySalaryResult {
  const grossAnnual = annualise(input.amount, input.period);
  const breakdown = calculatePayslipBreakdown({
    annualSalary: grossAnnual,
    taxCode: "1257L",
    pensionPercent: input.pensionPercent,
    studentLoanPlan: input.studentLoanPlan,
    postgraduateLoanToo: input.postgraduateLoanToo,
  });

  return {
    grossAnnual: breakdown.grossAnnual,
    grossMonthly: breakdown.grossMonthly,
    grossWeekly: round2(grossAnnual / 52),
    pensionAnnual: breakdown.pensionAnnual,
    pensionMonthly: breakdown.pensionMonthly,
    incomeTaxAnnual: breakdown.incomeTaxAnnual,
    incomeTaxMonthly: breakdown.incomeTaxMonthly,
    employeeNiAnnual: breakdown.employeeNiAnnual,
    employeeNiMonthly: breakdown.employeeNiMonthly,
    studentLoanAnnual: breakdown.studentLoanAnnual,
    studentLoanMonthly: breakdown.studentLoanMonthly,
    totalDeductionsMonthly: breakdown.totalDeductionsMonthly,
    netMonthly: breakdown.netMonthly,
    netAnnual: breakdown.netAnnual,
    netWeekly: round2(breakdown.netAnnual / 52),
    netDaily: round2(breakdown.netAnnual / 260),
    effectiveKeepPercent:
      grossAnnual > 0
        ? round2((breakdown.netAnnual / grossAnnual) * 100)
        : 100,
    breakdown,
  };
}
