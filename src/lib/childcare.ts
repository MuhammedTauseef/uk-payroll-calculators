/**
 * UK Tax-Free Childcare calculator maths — 2026/27 rules.
 *
 * The scheme (UK-wide, run through GOV.UK childcare accounts):
 * for every £8 a parent pays in, the government adds £2 — the state
 * covers 20% of the bill — capped at £500 of top-up per child per
 * 3 months (£2,000 a year), doubled to £1,000 / £4,000 for a disabled
 * child. The cap is quarterly, so a bill is assessed in 3-month
 * blocks: top-up for a quarter = min(20% of the quarter's bill, cap).
 *
 * Eligibility essentials the page checks:
 *  - each parent's expected adjusted net income must be £100,000 or
 *    less (one pound over loses the whole entitlement), and
 *  - each parent must expect to earn at least the National Minimum
 *    Wage for 16 hours a week over the next 3 months (the minimum
 *    earnings threshold below), unless an exception applies.
 *
 * Minimum earnings, April 2026 NMW rates, 16h/week × 13 weeks:
 *  21 and over: £12.71/h → £2,643.68 per 3 months
 *  18–20:       £10.85/h → £2,256.80 per 3 months
 *  Under 18 / apprentice: £8.00/h → £1,664.00 per 3 months
 */

export interface ChildInput {
  /** Childcare bill for this child, £ per month. */
  monthlyCost: number;
  /** Disabled child — the top-up cap doubles. */
  disabled: boolean;
}

/** How a parent enters a child's bill on the page. */
export type CostPeriod = "weekly" | "monthly" | "quarterly";

/**
 * Convert a bill entered per week, per month or per quarter into the
 * monthly figure the calculator works in. The scheme assesses bills
 * in 3-month blocks and a quarter holds 13 weeks (52 ÷ 4), so a
 * weekly bill is worth amount × 13 per quarter — the same total as
 * the monthly figure × 3 used by the maths below.
 */
export function costToMonthly(amount: number, period: CostPeriod): number {
  const a = Math.max(0, amount || 0);
  if (period === "weekly") return (a * 13) / 3;
  if (period === "quarterly") return a / 3;
  return a;
}

export interface ChildResult {
  monthlyCost: number;
  disabled: boolean;
  quarterlyBill: number;
  quarterlyTopUp: number;
  quarterlyDeposit: number;
  annualBill: number;
  annualTopUp: number;
  annualDeposit: number;
  /** Top-up allowance left unused each quarter because the bill is below the cap. */
  unusedQuarterlyTopUp: number;
  capPerQuarter: number;
}

export interface ChildcareInput {
  children: ChildInput[];
  /** "single" or "couple" — eligibility is checked per parent. */
  household: "single" | "couple";
  /** Expected annual adjusted net income, parent 1. */
  parent1Income: number;
  /** Expected annual adjusted net income, parent 2 (couples only). */
  parent2Income: number;
  /** NMW age band of the lower-earning parent, for the minimum-earnings check. */
  parentAgeBand: "21+" | "18-20" | "under-18";
}

export interface ChildcareResult {
  perChild: ChildResult[];
  totalMonthlyBill: number;
  totalQuarterlyTopUp: number;
  totalAnnualBill: number;
  totalAnnualTopUp: number;
  totalAnnualDeposit: number;
  /** What the parent actually pays per month after the top-up. */
  effectiveMonthlyCost: number;
  /** Minimum each parent must expect to earn over the next 3 months. */
  minimumEarningsPerQuarter: number;
  /** Eligibility flags — the page turns these into plain-English warnings. */
  overIncomeLimit: boolean;
  belowMinimumEarnings: boolean;
  eligible: boolean;
}

export const TFC_CAPS = {
  standardQuarter: 500,
  disabledQuarter: 1000,
  incomeLimit: 100000,
} as const;

const NMW_RATES: Record<ChildcareInput["parentAgeBand"], number> = {
  "21+": 12.71,
  "18-20": 10.85,
  "under-18": 8.0,
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateChildcare(input: ChildcareInput): ChildcareResult {
  const perChild: ChildResult[] = input.children.map((child) => {
    const monthlyCost = Math.max(0, child.monthlyCost || 0);
    const cap = child.disabled ? TFC_CAPS.disabledQuarter : TFC_CAPS.standardQuarter;
    const quarterlyBill = round2(monthlyCost * 3);
    // Government covers 20% of the bill, capped per quarter.
    const quarterlyTopUp = round2(Math.min(quarterlyBill * 0.2, cap));
    const quarterlyDeposit = round2(quarterlyBill - quarterlyTopUp);
    return {
      monthlyCost,
      disabled: child.disabled,
      quarterlyBill,
      quarterlyTopUp,
      quarterlyDeposit,
      annualBill: round2(quarterlyBill * 4),
      annualTopUp: round2(quarterlyTopUp * 4),
      annualDeposit: round2(quarterlyDeposit * 4),
      unusedQuarterlyTopUp: round2(cap - quarterlyTopUp),
      capPerQuarter: cap,
    };
  });

  const totalAnnualBill = round2(perChild.reduce((s, c) => s + c.annualBill, 0));
  const totalAnnualTopUp = round2(perChild.reduce((s, c) => s + c.annualTopUp, 0));
  const totalAnnualDeposit = round2(perChild.reduce((s, c) => s + c.annualDeposit, 0));
  const totalQuarterlyTopUp = round2(perChild.reduce((s, c) => s + c.quarterlyTopUp, 0));
  const totalMonthlyBill = round2(perChild.reduce((s, c) => s + c.monthlyCost, 0));

  const minimumEarningsPerQuarter = round2(
    NMW_RATES[input.parentAgeBand] * 16 * 13,
  );
  const minimumAnnual = minimumEarningsPerQuarter * 4;

  const incomes =
    input.household === "couple"
      ? [input.parent1Income || 0, input.parent2Income || 0]
      : [input.parent1Income || 0];
  const overIncomeLimit = incomes.some((i) => i > TFC_CAPS.incomeLimit);
  const belowMinimumEarnings = incomes.some(
    (i) => i > 0 && i < minimumAnnual,
  );

  return {
    perChild,
    totalMonthlyBill,
    totalQuarterlyTopUp,
    totalAnnualBill,
    totalAnnualTopUp,
    totalAnnualDeposit,
    effectiveMonthlyCost: round2(totalMonthlyBill - totalAnnualTopUp / 12),
    minimumEarningsPerQuarter,
    overIncomeLimit,
    belowMinimumEarnings,
    eligible: !overIncomeLimit,
  };
}
