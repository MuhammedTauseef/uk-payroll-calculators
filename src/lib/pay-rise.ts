import {
  calculatePayslipBreakdown,
  type PayslipCalculatorResult,
} from "./payslip-calculator.ts";
import type { StudentLoanPlanId } from "./student-loan.ts";

/**
 * Pay rise calculator maths — UK, 2026/27.
 *
 * A pay rise is quoted gross, but it is spent net. This module works
 * out the new gross three ways (a percentage rise, a flat amount, or
 * a target salary) and then runs BOTH salaries through the site's
 * verified payslip breakdown — the same code the payslip calculator
 * uses, itself built on the verified take-home helpers
 * (incomeTaxFor / personalAllowanceFor / employeeNiFor) and the
 * verified student-loan plans. No second copy of the tax maths
 * exists: with pension at 0% and no student loan, the net figures
 * here equal the take-home calculator's to the penny (asserted in
 * scripts/verify-pay-rise.ts).
 *
 * Basis, exactly as the page states: standard tax code 1257L,
 * England / Wales / Northern Ireland bands, pension contributions
 * on a net-pay arrangement (off pay before Income Tax, not before
 * National Insurance), student loan charged on gross pay.
 */

export type PayRiseMode = "percent" | "amount" | "target";

export interface PayRiseInput {
  /** Current gross annual salary, £. */
  currentSalary: number;
  mode: PayRiseMode;
  /** Rise as a percentage of current salary (percent mode). */
  risePercent: number;
  /** Rise as a flat amount, £ per year (amount mode). */
  riseAmount: number;
  /** The salary being aimed at, £ per year (target mode). */
  targetSalary: number;
  /** Contracted hours per week — only used for the hourly figures. */
  hoursPerWeek: number;
  /** Employee pension contribution, % of gross (net-pay arrangement). */
  pensionPercent: number;
  /** Student loan plan, or null for none. */
  studentLoanPlan: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is repaid alongside an undergraduate plan. */
  postgraduateLoanToo: boolean;
}

export interface PayRiseResult {
  /** Full verified breakdowns for both salaries. */
  current: PayslipCalculatorResult;
  updated: PayslipCalculatorResult;

  currentGrossAnnual: number;
  newGrossAnnual: number;
  /** The rise itself, £ per year / month / week / hour. */
  grossRiseAnnual: number;
  grossRiseMonthly: number;
  grossRiseWeekly: number;
  grossRiseHourly: number;
  /** The rise expressed as a percentage of the current salary. */
  impliedRisePercent: number;

  /** New gross broken down: per month, per week, per hour. */
  newGrossMonthly: number;
  newGrossWeekly: number;
  newGrossHourly: number;
  currentGrossHourly: number;

  currentNetAnnual: number;
  newNetAnnual: number;
  currentNetMonthly: number;
  newNetMonthly: number;
  /** The part of the rise that actually reaches the bank account. */
  netRiseAnnual: number;
  netRiseMonthly: number;
  /** Share of the gross rise kept as take-home, 0–100; null when there is no rise. */
  keepPercent: number | null;

  /** How much of the rise each deduction takes, £ per year. */
  extraIncomeTax: number;
  extraNationalInsurance: number;
  extraPension: number;
  extraStudentLoan: number;

  /** Personal Allowance before and after — the £100,000 taper made visible. */
  personalAllowanceBefore: number;
  personalAllowanceAfter: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function newSalaryFor(input: PayRiseInput): number {
  const current = Math.max(0, input.currentSalary || 0);
  if (input.mode === "percent") {
    return Math.max(0, current * (1 + (input.risePercent || 0) / 100));
  }
  if (input.mode === "amount") {
    return Math.max(0, current + (input.riseAmount || 0));
  }
  return Math.max(0, input.targetSalary || 0);
}

export function calculatePayRise(input: PayRiseInput): PayRiseResult {
  const currentSalary = Math.max(0, input.currentSalary || 0);
  const newSalary = newSalaryFor(input);
  const hours = Math.min(Math.max(input.hoursPerWeek || 0, 0), 168);
  const hoursPerYear = hours * 52;

  const shared = {
    taxCode: "1257L",
    pensionPercent: input.pensionPercent,
    studentLoanPlan: input.studentLoanPlan,
    postgraduateLoanToo: input.postgraduateLoanToo,
  };
  const current = calculatePayslipBreakdown({
    annualSalary: currentSalary,
    ...shared,
  });
  const updated = calculatePayslipBreakdown({
    annualSalary: newSalary,
    ...shared,
  });

  const grossRise = newSalary - currentSalary;
  const netRise = updated.netAnnual - current.netAnnual;

  return {
    current,
    updated,
    currentGrossAnnual: round2(currentSalary),
    newGrossAnnual: round2(newSalary),
    grossRiseAnnual: round2(grossRise),
    grossRiseMonthly: round2(grossRise / 12),
    grossRiseWeekly: round2(grossRise / 52),
    grossRiseHourly:
      hoursPerYear > 0 ? round2(grossRise / hoursPerYear) : 0,
    impliedRisePercent:
      currentSalary > 0 ? round2((grossRise / currentSalary) * 100) : 0,
    newGrossMonthly: round2(newSalary / 12),
    newGrossWeekly: round2(newSalary / 52),
    newGrossHourly: hoursPerYear > 0 ? round2(newSalary / hoursPerYear) : 0,
    currentGrossHourly:
      hoursPerYear > 0 ? round2(currentSalary / hoursPerYear) : 0,
    currentNetAnnual: current.netAnnual,
    newNetAnnual: updated.netAnnual,
    currentNetMonthly: current.netMonthly,
    newNetMonthly: updated.netMonthly,
    netRiseAnnual: round2(netRise),
    netRiseMonthly: round2(updated.netMonthly - current.netMonthly),
    keepPercent:
      grossRise > 0 ? round2((netRise / grossRise) * 100) : null,
    extraIncomeTax: round2(updated.incomeTaxAnnual - current.incomeTaxAnnual),
    extraNationalInsurance: round2(
      updated.employeeNiAnnual - current.employeeNiAnnual,
    ),
    extraPension: round2(updated.pensionAnnual - current.pensionAnnual),
    extraStudentLoan: round2(
      updated.studentLoanAnnual - current.studentLoanAnnual,
    ),
    personalAllowanceBefore: current.allowanceUsed,
    personalAllowanceAfter: updated.allowanceUsed,
  };
}
