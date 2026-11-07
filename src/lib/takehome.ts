import { EMPLOYEE_NI, INCOME_TAX } from "./rates.ts";

/**
 * Take-home pay calculation — England, Wales and Northern Ireland,
 * 2026/27 PAYE rules (Scotland has different income tax bands).
 *
 * Income Tax:
 *   Personal Allowance £12,570, reduced by £1 for every £2 of income
 *   over £100,000 (zero at £125,140).
 *   Taxable income = salary − Personal Allowance.
 *   20% on the first £37,700 of taxable income; 40% on taxable income
 *   above that up to £125,140; 45% on taxable income over £125,140.
 *   (The £125,140 additional-rate threshold is an income threshold; it
 *   can be applied to taxable income directly because the Personal
 *   Allowance is already zero at that level of income.)
 *
 * Employee Class 1 National Insurance (category A):
 *   0% up to £12,570; 8% from £12,570 to £50,270; 2% above £50,270.
 *
 * The result is before pension contributions, student loan repayments
 * and any other deductions — the page says so.
 */

export interface TakeHomeInput {
  /** Gross annual salary, £ per year. */
  annualSalary: number;
}

export interface TakeHomeResult {
  grossAnnual: number;
  /** Personal Allowance after the £100,000 taper, £. */
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  employeeNationalInsurance: number;
  totalDeductions: number;
  /** Net (take-home) pay per year, £. */
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  netDaily: number;
  /** Share of gross pay kept, 0–100. */
  effectiveKeepPercent: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function personalAllowanceFor(income: number): number {
  const excess = Math.max(0, income - INCOME_TAX.allowanceTaperThreshold);
  const reduction = Math.floor(excess / 2);
  return Math.max(0, INCOME_TAX.personalAllowance - reduction);
}

export function incomeTaxFor(salary: number): number {
  const pa = personalAllowanceFor(salary);
  const taxable = Math.max(0, salary - pa);
  const basic = Math.min(taxable, INCOME_TAX.basicRateBand);
  const higher = Math.min(
    Math.max(0, taxable - INCOME_TAX.basicRateBand),
    INCOME_TAX.additionalRateThreshold - INCOME_TAX.basicRateBand,
  );
  const additional = Math.max(0, taxable - INCOME_TAX.additionalRateThreshold);
  return (
    basic * INCOME_TAX.basicRate +
    higher * INCOME_TAX.higherRate +
    additional * INCOME_TAX.additionalRate
  );
}

export function employeeNiFor(salary: number): number {
  const main = Math.min(
    Math.max(0, salary - EMPLOYEE_NI.primaryThresholdAnnual),
    EMPLOYEE_NI.upperEarningsLimitAnnual - EMPLOYEE_NI.primaryThresholdAnnual,
  );
  const extra = Math.max(0, salary - EMPLOYEE_NI.upperEarningsLimitAnnual);
  return main * EMPLOYEE_NI.mainRate + extra * EMPLOYEE_NI.additionalRate;
}

export function calculateTakeHome(input: TakeHomeInput): TakeHomeResult {
  const gross = Math.max(0, input.annualSalary || 0);
  const pa = personalAllowanceFor(gross);
  const tax = incomeTaxFor(gross);
  const ni = employeeNiFor(gross);
  const net = gross - tax - ni;

  return {
    grossAnnual: round2(gross),
    personalAllowance: round2(pa),
    taxableIncome: round2(Math.max(0, gross - pa)),
    incomeTax: round2(tax),
    employeeNationalInsurance: round2(ni),
    totalDeductions: round2(tax + ni),
    netAnnual: round2(net),
    netMonthly: round2(net / 12),
    netWeekly: round2(net / 52),
    netDaily: round2(net / 260),
    effectiveKeepPercent: gross > 0 ? round2((net / gross) * 100) : 100,
  };
}
