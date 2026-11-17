import { INCOME_TAX } from "./rates.ts";
import { employeeNiFor, personalAllowanceFor } from "./takehome.ts";
import { parseTaxCode } from "./payslip.ts";
import {
  studentLoanPlan,
  type StudentLoanPlanId,
} from "./student-loan.ts";

/**
 * Payslip calculator maths — UK, 2026/27 (monthly pay).
 *
 * The payslip GENERATOR on this site builds a printable payslip from
 * one period's gross pay. This CALCULATOR answers the question asked
 * before payday — "what will my payslip actually say?" — starting
 * from the annual salary and the three deductions that decide it:
 *
 *   - Income Tax, from the tax code. The code is HMRC's instruction
 *     for the Personal Allowance (1257L = £12,570), parsed by the same
 *     parseTaxCode() the generator uses and taxed through the same
 *     INCOME_TAX band structure from rates.ts. The standard code uses
 *     the verified personalAllowanceFor() taper; a non-standard code
 *     is applied at face value, exactly as PAYE applies it (HMRC
 *     builds the taper into the code it issues).
 *   - Employee National Insurance from the verified employeeNiFor()
 *     (8% between £12,570 and £50,270, 2% above). Pension
 *     contributions under a net-pay arrangement do NOT reduce NI —
 *     only salary sacrifice does, and this calculator models the
 *     ordinary net-pay arrangement, as the page states.
 *   - Pension contributions under a net-pay arrangement: the
 *     contribution comes off BEFORE tax (so it saves Income Tax at
 *     the saver's marginal rate) but not before NI.
 *   - Student loan repayments: payroll works on the MONTHLY threshold
 *     GOV.UK publishes for each plan, so the monthly deduction is the
 *     plan rate × (monthly gross − monthly threshold). Monthly
 *     thresholds and rates are from src/lib/student-loan.ts
 *     (2026/27, GOV.UK, checked 17 November 2026). Pension
 *     contributions do not reduce the income student loan repayments
 *     are charged on.
 *
 * Annual tax and NI are worked out on the annual figures and divided
 * by 12 — real PAYE is cumulative through the year, so a single
 * month's actual deduction can differ when pay varies; for a steady
 * salary the figures are exact. The page calls the result an
 * estimate for that reason.
 */

export interface PayslipCalculatorInput {
  /** Gross annual salary, £. */
  annualSalary: number;
  /** HMRC tax code, e.g. "1257L". Blank = the standard 1257L. */
  taxCode: string;
  /** Employee pension contribution, % of gross salary (net-pay arrangement). */
  pensionPercent: number;
  /** Student loan plan, or null for none. Postgraduate can be added on top. */
  studentLoanPlan: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is repaid alongside an undergraduate plan. */
  postgraduateLoanToo: boolean;
}

export interface PayslipCalculatorResult {
  taxCode: string;
  taxCodeRecognised: boolean;
  /** Allowance actually used in the tax calculation, £/year. */
  allowanceUsed: number;
  grossAnnual: number;
  grossMonthly: number;
  /** Pension contribution, £/year and £/month. */
  pensionAnnual: number;
  pensionMonthly: number;
  /** Pay the tax is charged on (gross − pension), £/year. */
  taxablePayAnnual: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  employeeNiAnnual: number;
  employeeNiMonthly: number;
  studentLoanAnnual: number;
  studentLoanMonthly: number;
  totalDeductionsMonthly: number;
  netAnnual: number;
  netMonthly: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Income tax on `salary` with a stated allowance, INCOME_TAX bands. */
function taxWithAllowance(salary: number, allowance: number): number {
  const taxable = Math.max(0, salary - allowance);
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

export function calculatePayslipBreakdown(
  input: PayslipCalculatorInput,
): PayslipCalculatorResult {
  const gross = Math.max(0, input.annualSalary || 0);
  const pensionPercent = Math.min(100, Math.max(0, input.pensionPercent || 0));
  const pensionAnnual = (gross * pensionPercent) / 100;
  const taxablePay = gross - pensionAnnual;

  const parsed = parseTaxCode(input.taxCode);
  let incomeTaxAnnual: number;
  let allowanceUsed: number;
  if (parsed.noTax) {
    incomeTaxAnnual = 0;
    allowanceUsed = personalAllowanceFor(taxablePay);
  } else if (parsed.flatRate !== null) {
    incomeTaxAnnual = taxablePay * parsed.flatRate;
    allowanceUsed = 0;
  } else if (
    parsed.allowance !== null &&
    parsed.allowance !== INCOME_TAX.personalAllowance
  ) {
    incomeTaxAnnual = taxWithAllowance(taxablePay, parsed.allowance);
    allowanceUsed = parsed.allowance;
  } else {
    // Standard code: the verified taper applies to the taxable pay.
    const pa = personalAllowanceFor(taxablePay);
    incomeTaxAnnual = taxWithAllowance(taxablePay, pa);
    allowanceUsed = pa;
  }

  // NI is charged on the full gross — a net-pay pension does not reduce it.
  const niAnnual = employeeNiFor(gross);

  // Student loan: payroll works per period on the monthly threshold.
  const grossMonthly = gross / 12;
  let loanMonthly = 0;
  if (input.studentLoanPlan && input.studentLoanPlan !== "postgraduate") {
    const plan = studentLoanPlan(input.studentLoanPlan);
    loanMonthly +=
      Math.max(0, grossMonthly - plan.monthlyThreshold) * plan.rate;
  }
  if (input.postgraduateLoanToo || input.studentLoanPlan === "postgraduate") {
    const pg = studentLoanPlan("postgraduate");
    loanMonthly += Math.max(0, grossMonthly - pg.monthlyThreshold) * pg.rate;
  }
  const loanAnnual = loanMonthly * 12;

  const taxMonthly = incomeTaxAnnual / 12;
  const niMonthly = niAnnual / 12;
  const pensionMonthly = pensionAnnual / 12;
  const totalMonthly = pensionMonthly + taxMonthly + niMonthly + loanMonthly;
  const netMonthly = grossMonthly - totalMonthly;

  return {
    taxCode: parsed.code,
    taxCodeRecognised: parsed.recognised,
    allowanceUsed: round2(allowanceUsed),
    grossAnnual: round2(gross),
    grossMonthly: round2(grossMonthly),
    pensionAnnual: round2(pensionAnnual),
    pensionMonthly: round2(pensionMonthly),
    taxablePayAnnual: round2(taxablePay),
    incomeTaxAnnual: round2(incomeTaxAnnual),
    incomeTaxMonthly: round2(taxMonthly),
    employeeNiAnnual: round2(niAnnual),
    employeeNiMonthly: round2(niMonthly),
    studentLoanAnnual: round2(loanAnnual),
    studentLoanMonthly: round2(loanMonthly),
    totalDeductionsMonthly: round2(totalMonthly),
    netAnnual: round2(netMonthly * 12),
    netMonthly: round2(netMonthly),
  };
}
