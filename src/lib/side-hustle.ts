/**
 * Side hustle tax — the EXTRA Income Tax and Class 4 National
 * Insurance a side income adds on top of a PAYE salary, 2025/26.
 *
 * Built 22 November 2026 for the "side hustle tax calculator uk"
 * keyword (Semrush UK: 140/month, KD 31 — VERIFIED by owner
 * adjudication: sidehustletaxcalculator.uk, AS 8, holds the live
 * #2 slot, a strict top-5 weak slot, and the trend is RISING;
 * the under-200 volume floor was waived for this tool).
 * Competitor teardown (22 Nov 2026): sidehustletaxcalculator.uk
 * is the strongest rival — PAYE + trading income, the expenses-
 * or-allowance choice, Class 4, worked examples — but it leads
 * on 2026/27, while the returns being filed this season are
 * 2025/26. Taxd offers tax years back to 2020/21 but shows no
 * worked examples and never says which deduction won. Earnr's
 * page still quotes 2022/23 rates (Class 4 at 10.25%/3.25%),
 * and one rival rates table lists Class 4 at 9% for 2025/26 —
 * wrong since April 2024. This calculator leads on 2025/26,
 * picks the better deduction automatically AND names it, and
 * prints the worked examples from its own maths.
 *
 * Rules (verified against GOV.UK on 22 November 2026):
 *   - Trading allowance (GOV.UK, "Tax-free allowances on
 *     property and trading income"): gross trading income of
 *     £1,000 or less in the tax year is fully relieved — no tax
 *     and usually nothing to tell HMRC ("full relief"). Above
 *     £1,000 the trader deducts EITHER the £1,000 allowance OR
 *     their actual expenses, never both ("partial relief") —
 *     this calculator takes the higher deduction and says which.
 *     The £1,000 test is on gross income before expenses, across
 *     all trades combined.
 *   - Income Tax (GOV.UK Annex A / rates and allowances,
 *     2025/26, England, Wales and Northern Ireland): Personal
 *     Allowance £12,570, tapered £1 per £2 of income over
 *     £100,000; 20% on the first £37,700 of taxable income, 40%
 *     up to £125,140, 45% above. The side profit stacks on top
 *     of the salary, so the EXTRA tax is the tax on (salary +
 *     profit) minus the tax on the salary alone — the salary's
 *     own tax is already collected through PAYE and is not part
 *     of the result. The band maths is incomeTaxFor in
 *     takehome.ts; its constants are the frozen figures that
 *     are identical in 2025/26 and 2026/27.
 *   - Class 4 NI (GOV.UK / HMRC rates and allowances, 2025/26):
 *     6% on profits between £12,570 and £50,270, 2% above —
 *     charged on the trading profit alone; the salary does not
 *     use up any of the Class 4 band.
 *   - Class 2 NI (same source): profits of £6,845 or more are
 *     treated as paid — nothing to pay. Below £6,845, voluntary
 *     Class 2 is £3.50 a week. Class 2 is never part of the
 *     bill this calculator totals; the result reports which
 *     side of the threshold the profit falls.
 *
 * Out of scope (the page says so): Scottish Income Tax bands,
 * student loans, pension contributions, the Class 1 + Class 4
 * annual maximum, losses carried forward, and trading income
 * the allowance cannot be used on (from your own employer, or a
 * company or partnership you are connected to).
 */

import { incomeTaxFor } from "./takehome.ts";

/** 2025/26 side hustle constants — GOV.UK-verified 22 Nov 2026. */
export const SIDE_HUSTLE = {
  /** Trading allowance, £ of gross trading income per tax year. */
  tradingAllowance: 1000,
  /** Class 4 lower profits limit, £/year. */
  class4LowerLimit: 12570,
  /** Class 4 upper profits limit, £/year. */
  class4UpperLimit: 50270,
  class4MainRate: 0.06,
  class4AdditionalRate: 0.02,
  /** Class 2 small profits threshold, £/year (2025/26). */
  class2SmallProfitsThreshold: 6845,
  /** Voluntary Class 2 rate below the threshold, £/week (2025/26). */
  class2WeeklyRate: 3.5,
} as const;

export type SideHustleDeduction =
  | "full-relief"
  | "trading-allowance"
  | "expenses";

export interface SideHustleInput {
  /** Gross PAYE salary for the tax year, £ (0 if there is none). */
  salary: number;
  /** Gross side income before any expenses, £ for the tax year. */
  sideIncome: number;
  /** Allowable expenses of the side trade, £ for the tax year. */
  expenses: number;
}

export interface SideHustleResult {
  salary: number;
  sideIncome: number;
  expenses: number;
  /** Gross side income of £1,000 or less — fully relieved. */
  underAllowance: boolean;
  /** Gross side income over £1,000 — Self Assessment is required. */
  mustRegister: boolean;
  /** Which deduction the profit was worked out with. */
  deductionKind: SideHustleDeduction;
  /** The deduction taken off the gross side income, £. */
  deduction: number;
  /** Taxable trading profit, £ (never below zero). */
  taxableProfit: number;
  /** Salary + taxable profit, £ — the income the bands see. */
  combinedIncome: number;
  /** Income Tax on the salary alone, £ (already paid via PAYE). */
  salaryOnlyTax: number;
  /** Income Tax on salary + profit, £. */
  combinedTax: number;
  /** The EXTRA Income Tax the side income causes, £. */
  extraIncomeTax: number;
  /** Class 4 National Insurance on the profit, £. */
  class4Ni: number;
  /** Extra Income Tax + Class 4 NI — the amount to set aside, £. */
  totalExtraTax: number;
  /** Side income − expenses − extra tax: what the hustle keeps, £. */
  netKept: number;
  /** Total extra tax as a share of the gross side income, 0–100. */
  effectiveRatePercent: number;
  /** Profit at or above £6,845 — Class 2 treated as paid. */
  class2TreatedAsPaid: boolean;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function class4For(profit: number): number {
  const main = Math.min(
    Math.max(0, profit - SIDE_HUSTLE.class4LowerLimit),
    SIDE_HUSTLE.class4UpperLimit - SIDE_HUSTLE.class4LowerLimit,
  );
  const extra = Math.max(0, profit - SIDE_HUSTLE.class4UpperLimit);
  return (
    main * SIDE_HUSTLE.class4MainRate +
    extra * SIDE_HUSTLE.class4AdditionalRate
  );
}

export function calculateSideHustle(
  input: SideHustleInput,
): SideHustleResult {
  const salary = Math.max(0, input.salary || 0);
  const gross = Math.max(0, input.sideIncome || 0);
  const expenses = Math.max(0, input.expenses || 0);

  const underAllowance = gross <= SIDE_HUSTLE.tradingAllowance;

  let deductionKind: SideHustleDeduction;
  let deduction: number;
  if (underAllowance) {
    // Full relief: the whole gross amount is covered, profit nil.
    deductionKind = "full-relief";
    deduction = gross;
  } else if (expenses > SIDE_HUSTLE.tradingAllowance) {
    deductionKind = "expenses";
    deduction = expenses;
  } else {
    deductionKind = "trading-allowance";
    deduction = SIDE_HUSTLE.tradingAllowance;
  }

  const taxableProfit = Math.max(0, gross - deduction);
  const salaryOnlyTax = incomeTaxFor(salary);
  const combinedTax = incomeTaxFor(salary + taxableProfit);
  const extraIncomeTax = combinedTax - salaryOnlyTax;
  const class4Ni = class4For(taxableProfit);
  const totalExtraTax = extraIncomeTax + class4Ni;
  const netKept = gross - expenses - totalExtraTax;

  return {
    salary: round2(salary),
    sideIncome: round2(gross),
    expenses: round2(expenses),
    underAllowance,
    mustRegister: !underAllowance,
    deductionKind,
    deduction: round2(deduction),
    taxableProfit: round2(taxableProfit),
    combinedIncome: round2(salary + taxableProfit),
    salaryOnlyTax: round2(salaryOnlyTax),
    combinedTax: round2(combinedTax),
    extraIncomeTax: round2(extraIncomeTax),
    class4Ni: round2(class4Ni),
    totalExtraTax: round2(totalExtraTax),
    netKept: round2(netKept),
    effectiveRatePercent:
      gross > 0 ? round2((totalExtraTax / gross) * 100) : 0,
    class2TreatedAsPaid:
      taxableProfit >= SIDE_HUSTLE.class2SmallProfitsThreshold,
  };
}
