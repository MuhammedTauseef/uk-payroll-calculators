/**
 * Student loan repayment maths — UK, 2026/27.
 *
 * Repayments through PAYE are a percentage of the income ABOVE the
 * plan's threshold — the size of the debt makes no difference to the
 * amount repaid each period. The thresholds and rates below are the
 * 2026/27 figures published by GOV.UK ("Repaying your student loan —
 * How much you repay"), checked 17 November 2026:
 *
 *   Plan 1:            threshold £26,900 a year (£2,241 a month), 9%
 *   Plan 2:            threshold £29,385 a year (£2,448 a month), 9%
 *   Plan 4:            threshold £33,795 a year (£2,816 a month), 9%
 *   Plan 5:            threshold £25,000 a year (£2,083 a month), 9%
 *   Postgraduate Loan: threshold £21,000 a year (£1,750 a month), 6%
 *
 * Two combination rules from the same GOV.UK page:
 *   - Two undergraduate plans (no Postgraduate Loan): one repayment of
 *     9% of income over the LOWEST of the two thresholds.
 *   - An undergraduate plan plus a Postgraduate Loan: BOTH repayments
 *     run at once — 9% over the undergraduate threshold AND 6% over
 *     £21,000.
 *
 * Payroll works per pay period, so a monthly-paid employee's deduction
 * is worked out on the monthly threshold each month; the annual
 * figures here are the yearly equivalents (annual income against the
 * annual threshold), which is also how HMRC settles the year for the
 * self-employed through Self Assessment. Where income is uneven the
 * two can differ by a few pounds; the page says so.
 */

export type StudentLoanPlanId = "plan1" | "plan2" | "plan4" | "plan5" | "postgraduate";

export interface StudentLoanPlan {
  id: StudentLoanPlanId;
  label: string;
  /** Income threshold, £/year — nothing is repaid on income at or below it. */
  annualThreshold: number;
  /** Income threshold, £/month (GOV.UK's published monthly figure). */
  monthlyThreshold: number;
  /** Repayment rate on income above the threshold. */
  rate: number;
}

export const STUDENT_LOAN_PLANS: StudentLoanPlan[] = [
  { id: "plan1", label: "Plan 1", annualThreshold: 26900, monthlyThreshold: 2241, rate: 0.09 },
  { id: "plan2", label: "Plan 2", annualThreshold: 29385, monthlyThreshold: 2448, rate: 0.09 },
  { id: "plan4", label: "Plan 4", annualThreshold: 33795, monthlyThreshold: 2816, rate: 0.09 },
  { id: "plan5", label: "Plan 5", annualThreshold: 25000, monthlyThreshold: 2083, rate: 0.09 },
  { id: "postgraduate", label: "Postgraduate Loan", annualThreshold: 21000, monthlyThreshold: 1750, rate: 0.06 },
];

/** Dating label for student loan figures (2026/27 — GOV.UK). */
export const STUDENT_LOAN_RATES_LABEL = "2026/27 thresholds — GOV.UK";

/** Date the student loan figures above were checked against GOV.UK. */
export const STUDENT_LOAN_RATES_VERIFIED = "17 November 2026";

export function studentLoanPlan(id: StudentLoanPlanId): StudentLoanPlan {
  return STUDENT_LOAN_PLANS.find((p) => p.id === id) ?? STUDENT_LOAN_PLANS[1];
}

export interface StudentLoanInput {
  /** Gross annual income, £ per year. */
  annualIncome: number;
  /** The borrower's undergraduate plan (Plan 1, 2, 4 or 5), if any. */
  undergraduatePlan: StudentLoanPlanId | null;
  /** True when the borrower also has a Postgraduate Loan. */
  hasPostgraduateLoan: boolean;
}

export interface StudentLoanResult {
  /** Repayment on the undergraduate plan, £/year. */
  undergraduateAnnual: number;
  /** Repayment on the Postgraduate Loan, £/year. */
  postgraduateAnnual: number;
  /** Total repayment, £/year. */
  totalAnnual: number;
  /** Total repayment, £/month (annual ÷ 12). */
  totalMonthly: number;
  /** Total repayment as a share of gross income, 0–100. */
  shareOfIncomePercent: number;
  /** The undergraduate threshold actually used (the plan's own). */
  undergraduateThreshold: number | null;
}

/** One plan's repayment on an annual income, £/year. */
export function studentLoanRepaymentFor(
  annualIncome: number,
  plan: StudentLoanPlan,
): number {
  const income = Math.max(0, annualIncome || 0);
  return Math.max(0, income - plan.annualThreshold) * plan.rate;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateStudentLoan(input: StudentLoanInput): StudentLoanResult {
  const income = Math.max(0, input.annualIncome || 0);

  let undergraduateAnnual = 0;
  let undergraduateThreshold: number | null = null;
  if (input.undergraduatePlan && input.undergraduatePlan !== "postgraduate") {
    const plan = studentLoanPlan(input.undergraduatePlan);
    undergraduateAnnual = studentLoanRepaymentFor(income, plan);
    undergraduateThreshold = plan.annualThreshold;
  }

  let postgraduateAnnual = 0;
  if (input.hasPostgraduateLoan || input.undergraduatePlan === "postgraduate") {
    postgraduateAnnual = studentLoanRepaymentFor(
      income,
      studentLoanPlan("postgraduate"),
    );
  }

  const total = undergraduateAnnual + postgraduateAnnual;

  return {
    undergraduateAnnual: round2(undergraduateAnnual),
    postgraduateAnnual: round2(postgraduateAnnual),
    totalAnnual: round2(total),
    totalMonthly: round2(total / 12),
    shareOfIncomePercent: income > 0 ? round2((total / income) * 100) : 0,
    undergraduateThreshold,
  };
}
