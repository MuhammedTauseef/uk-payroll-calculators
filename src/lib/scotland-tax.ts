import { SCOTTISH_TAX } from "./rates.ts";
import {
  calculatePayslipBreakdown,
  type PayslipCalculatorResult,
} from "./payslip-calculator.ts";
import { studentLoanPlan, type StudentLoanPlanId } from "./student-loan.ts";
import { employeeNiFor, personalAllowanceFor } from "./takehome.ts";

/**
 * Take-home pay for a Scottish taxpayer — 2026/27.
 *
 * Scottish Income Tax (non-savings, non-dividend income) is charged
 * at the six Scottish rates on taxable income — income above the
 * Personal Allowance — with the band limits exactly as the Scottish
 * Rate Resolution for 2026-27 states them (SCOTTISH_TAX in
 * rates.ts, verified against gov.scot on 28 November 2026).
 *
 * Everything else follows this hub's shipped forward model, the one
 * the payslip calculator and the reverse salary calculator use, so
 * a figure here can never disagree with a figure there:
 *   - The Personal Allowance is the UK-wide £12,570, tapered by £1
 *     for every £2 of income over £100,000. Following the payslip
 *     engine, the taper is applied to the pay after any pension
 *     contribution (the taxable pay), because a net-pay pension
 *     contribution reduces adjusted net income.
 *   - A pension contribution is a percentage of gross under a
 *     net-pay arrangement: it reduces the Income Tax, not the
 *     National Insurance.
 *   - Employee National Insurance is UK-wide and charged on the
 *     full gross (employeeNiFor from takehome.ts).
 *   - A student loan repayment is worked out per month on the
 *     plan's GOV.UK monthly threshold, as payroll does it, on the
 *     full gross monthly pay (student-loan.ts holds the plans —
 *     Plan 4, the Scottish plan, has a £33,795-a-year threshold for
 *     2026/27).
 *
 * The England, Wales and Northern Ireland comparison in the result
 * is the hub's own forward engine (calculatePayslipBreakdown) run
 * on the same inputs, so the difference shown is the pure effect
 * of the Scottish bands.
 *
 * Not modelled, and the page says so: savings and dividend income
 * (taxed at UK rates even for Scottish taxpayers), tax codes other
 * than the standard allowance with its taper (the payslip
 * calculator reads codes, on the rest-of-UK bands), salary
 * sacrifice and relief-at-source pensions (different arrangements
 * from the net-pay one modelled), benefits in kind and bonuses.
 */

export interface ScotlandTaxInput {
  /** Gross annual salary, £ per year. */
  annualSalary: number;
  /** Employee pension contribution, % of gross (net-pay arrangement). */
  pensionPercent: number;
  /** Student loan plan, or null for none. Postgraduate can be added on top. */
  studentLoanPlan: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is repaid alongside an undergraduate plan. */
  postgraduateLoanToo: boolean;
}

export interface ScotlandBandSlice {
  /** Band name (Starter, Basic, Intermediate, Higher, Advanced, Top). */
  name: string;
  /** The band's rate, as a fraction (0.19 = 19%). */
  rate: number;
  /** How much of the taxable income falls in this band, £. */
  incomeInBand: number;
  /** Tax charged on that slice, £. */
  tax: number;
}

export interface ScotlandTaxResult {
  grossAnnual: number;
  pensionAnnual: number;
  /** Pay the tax is charged on (gross − pension), £/year. */
  taxablePayAnnual: number;
  /** Personal Allowance after the £100,000 taper, £. */
  personalAllowance: number;
  /** Taxable income (taxable pay − Personal Allowance), £. */
  taxableIncome: number;
  /** The taxable income split across the six Scottish bands. */
  bands: ScotlandBandSlice[];
  incomeTax: number;
  employeeNationalInsurance: number;
  studentLoan: number;
  totalDeductions: number;
  /** Net (take-home) pay per year, £. */
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  /** Share of gross pay kept, 0–100. */
  effectiveKeepPercent: number;
  /**
   * Combined marginal rate on the next £100 of gross pay, 0–100:
   * pension, tax (including the allowance taper where it bites),
   * NI and any student loan, measured by running the same
   * calculation £100 higher and taking the difference.
   */
  marginalRatePercent: number;
  /** The same inputs run through the rest-of-UK bands. */
  restOfUk: {
    incomeTax: number;
    netAnnual: number;
    netMonthly: number;
  };
  /** Scottish take-home minus rest-of-UK take-home, £/year. */
  differencePerYear: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface ScotlandCore {
  pensionAnnual: number;
  taxablePayAnnual: number;
  personalAllowance: number;
  taxableIncome: number;
  bands: ScotlandBandSlice[];
  incomeTax: number;
  employeeNationalInsurance: number;
  studentLoan: number;
  totalDeductions: number;
  netAnnual: number;
}

function scotlandCore(
  gross: number,
  pensionPercent: number,
  studentLoanPlanId: StudentLoanPlanId | null,
  postgraduateLoanToo: boolean,
): ScotlandCore {
  const pensionAnnual = (gross * pensionPercent) / 100;
  const taxablePay = gross - pensionAnnual;
  const pa = personalAllowanceFor(taxablePay);
  const taxableIncome = Math.max(0, taxablePay - pa);

  const bands: ScotlandBandSlice[] = [];
  let incomeTax = 0;
  let lower = 0;
  for (const band of SCOTTISH_TAX.bands) {
    const inBand = Math.max(
      0,
      Math.min(taxableIncome, band.limit) - lower,
    );
    const tax = inBand * band.rate;
    bands.push({
      name: band.name,
      rate: band.rate,
      incomeInBand: round2(inBand),
      tax: round2(tax),
    });
    incomeTax += tax;
    lower = band.limit;
  }

  const ni = employeeNiFor(gross);

  // Student loan, per month on the plan's monthly threshold, as
  // payroll works it — the same method as the payslip engine.
  const grossMonthly = gross / 12;
  let loanMonthly = 0;
  if (studentLoanPlanId && studentLoanPlanId !== "postgraduate") {
    const plan = studentLoanPlan(studentLoanPlanId);
    loanMonthly += Math.max(0, grossMonthly - plan.monthlyThreshold) * plan.rate;
  }
  if (postgraduateLoanToo || studentLoanPlanId === "postgraduate") {
    const pg = studentLoanPlan("postgraduate");
    loanMonthly += Math.max(0, grossMonthly - pg.monthlyThreshold) * pg.rate;
  }
  const studentLoan = loanMonthly * 12;

  const totalDeductions = pensionAnnual + incomeTax + ni + studentLoan;
  return {
    pensionAnnual,
    taxablePayAnnual: taxablePay,
    personalAllowance: pa,
    taxableIncome,
    bands,
    incomeTax,
    employeeNationalInsurance: ni,
    studentLoan,
    totalDeductions,
    netAnnual: gross - totalDeductions,
  };
}

export function calculateScotlandTax(
  input: ScotlandTaxInput,
): ScotlandTaxResult {
  const gross = Math.max(0, input.annualSalary || 0);
  const pensionPercent = Math.min(
    100,
    Math.max(0, input.pensionPercent || 0),
  );
  const core = scotlandCore(
    gross,
    pensionPercent,
    input.studentLoanPlan,
    input.postgraduateLoanToo,
  );

  // Marginal rate: the same calculation £100 higher, differenced.
  const higher = scotlandCore(
    gross + 100,
    pensionPercent,
    input.studentLoanPlan,
    input.postgraduateLoanToo,
  );
  const marginalRatePercent =
    gross > 0
      ? round2(
          Math.min(
            100,
            Math.max(0, ((higher.totalDeductions - core.totalDeductions) / 100) * 100),
          ),
        )
      : 0;

  // The rest-of-UK comparison runs the hub's own forward engine on
  // the same inputs, so the two figures are built the same way.
  const rest: PayslipCalculatorResult = calculatePayslipBreakdown({
    annualSalary: gross,
    taxCode: "1257L",
    pensionPercent,
    studentLoanPlan: input.studentLoanPlan,
    postgraduateLoanToo: input.postgraduateLoanToo,
  });

  return {
    grossAnnual: round2(gross),
    pensionAnnual: round2(core.pensionAnnual),
    taxablePayAnnual: round2(core.taxablePayAnnual),
    personalAllowance: round2(core.personalAllowance),
    taxableIncome: round2(core.taxableIncome),
    bands: core.bands,
    incomeTax: round2(core.incomeTax),
    employeeNationalInsurance: round2(core.employeeNationalInsurance),
    studentLoan: round2(core.studentLoan),
    totalDeductions: round2(core.totalDeductions),
    netAnnual: round2(core.netAnnual),
    netMonthly: round2(core.netAnnual / 12),
    netWeekly: round2(core.netAnnual / 52),
    effectiveKeepPercent:
      gross > 0 ? round2((core.netAnnual / gross) * 100) : 100,
    marginalRatePercent,
    restOfUk: {
      incomeTax: rest.incomeTaxAnnual,
      netAnnual: rest.netAnnual,
      netMonthly: rest.netMonthly,
    },
    differencePerYear: round2(core.netAnnual - rest.netAnnual),
  };
}
