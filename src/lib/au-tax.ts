/**
 * Australia tax-rate maths — individual income tax on the ATO
 * resident and foreign-resident (non-resident) rate tables, plus
 * the Medicare levy.
 *
 * Every figure verified against ATO sources at build time
 * (9 November 2026):
 *   - ATO, "Tax rates – Australian resident" — the 2025–26 table:
 *     https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
 *   - ATO, "Tax rates – foreign resident" — the 2025–26 table, and
 *     the ATO's statement that "Foreign residents are not required
 *     to pay the Medicare levy":
 *     https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
 *   - The Medicare levy rate of 2% is stated on both ATO pages
 *     above ("The above rates do not include the Medicare levy
 *     of 2%").
 *
 * Why 2025–26 and not 2026–27: the ATO has published the 2026–27
 * RESIDENT table (the $18,201–$45,000 rate falls to 15c), but it
 * has published NO 2026–27 foreign-resident table — that page
 * still ends at 2025–26. Rather than guess the missing table,
 * this calculator implements the complete, verified 2025–26 pair
 * (income year 1 July 2025 – 30 June 2026) for both residencies.
 *
 * Scope, stated plainly (and repeated on the page):
 *   - The figures are the ATO rate tables applied directly to the
 *     taxable income entered. Tax offsets (for example the low
 *     income tax offset), HELP/HECS debts, the Medicare levy
 *     surcharge and study-loan repayments are NOT included — the
 *     ATO applies those separately in an assessment.
 *   - The Medicare levy is charged at the full 2% of taxable
 *     income whenever it applies. The levy REDUCTION for low
 *     incomes (the shade-in just above the low-income threshold)
 *     is NOT modelled: on incomes where a reduction would apply,
 *     this calculator overstates the levy, and the page says so.
 *   - Display rule (the house rule, as on the UK and US
 *     calculators): every money line is rounded to the cent and
 *     the totals are built from the rounded lines, so the figures
 *     on the page always add up.
 */

export const TAX_YEAR_LABEL = "2025–26";

/** Medicare levy — 2% of taxable income (ATO). */
export const MEDICARE_LEVY_RATE = 0.02;

export type AuResidency = "resident" | "nonResident";

export const RESIDENCY_OPTIONS: { id: AuResidency; label: string }[] = [
  { id: "resident", label: "Australian resident for tax purposes" },
  { id: "nonResident", label: "Non-resident (foreign resident)" },
];

export interface AuTaxBracket {
  /** The bracket's formula starts at this taxable income. */
  from: number;
  /** Tax payable at exactly `from` (the ATO's "plus" base). */
  base: number;
  /** Rate applied to each $1 over `from`. */
  rate: number;
  /** ATO display range, for the rates table on the page. */
  range: string;
  /** ATO "Tax on this income" wording, for the rates table. */
  taxOnIncome: string;
}

/**
 * Resident tax rates 2025–26 (ATO). Full tax-free threshold
 * assumed, as on the ATO page.
 */
export const RESIDENT_BRACKETS: AuTaxBracket[] = [
  { from: 0, base: 0, rate: 0, range: "0 – $18,200", taxOnIncome: "Nil" },
  {
    from: 18200,
    base: 0,
    rate: 0.16,
    range: "$18,201 – $45,000",
    taxOnIncome: "16c for each $1 over $18,200",
  },
  {
    from: 45000,
    base: 4288,
    rate: 0.3,
    range: "$45,001 – $135,000",
    taxOnIncome: "$4,288 plus 30c for each $1 over $45,000",
  },
  {
    from: 135000,
    base: 31288,
    rate: 0.37,
    range: "$135,001 – $190,000",
    taxOnIncome: "$31,288 plus 37c for each $1 over $135,000",
  },
  {
    from: 190000,
    base: 51638,
    rate: 0.45,
    range: "$190,001 and over",
    taxOnIncome: "$51,638 plus 45c for each $1 over $190,000",
  },
];

/**
 * Foreign resident tax rates 2025–26 (ATO). No tax-free
 * threshold: 30c from the first dollar, and no Medicare levy.
 */
export const NON_RESIDENT_BRACKETS: AuTaxBracket[] = [
  {
    from: 0,
    base: 0,
    rate: 0.3,
    range: "0 – $135,000",
    taxOnIncome: "30c for each $1",
  },
  {
    from: 135000,
    base: 40500,
    rate: 0.37,
    range: "$135,001 – $190,000",
    taxOnIncome: "$40,500 plus 37c for each $1 over $135,000",
  },
  {
    from: 190000,
    base: 60850,
    rate: 0.45,
    range: "$190,001 and over",
    taxOnIncome: "$60,850 plus 45c for each $1 over $190,000",
  },
];

/** Round to the cent, half up (the house display rule). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function bracketFor(brackets: AuTaxBracket[], income: number): AuTaxBracket {
  let bracket = brackets[0];
  for (const row of brackets) {
    if (income >= row.from) bracket = row;
  }
  return bracket;
}

export interface AuTaxInput {
  /** Annual taxable income in AUD. */
  taxableIncome: number;
  residency: AuResidency;
  /**
   * Whether the Medicare levy applies. Only meaningful for
   * residents — non-residents never pay the levy (ATO), so the
   * calculator charges them $0 whatever this is set to.
   */
  medicareLevyApplies: boolean;
}

export interface AuTaxResult {
  taxableIncome: number;
  /** Income tax from the ATO rate table (before any offsets). */
  incomeTax: number;
  /** Medicare levy charged (0 when exempt or non-resident). */
  medicareLevy: number;
  /** True when the 2% levy was actually charged. */
  medicareLevyApplied: boolean;
  /** Income tax + Medicare levy. Income − total = net, exactly. */
  totalTax: number;
  netIncome: number;
  /** Income-tax marginal rate at this income, in percent. */
  marginalTaxRatePercent: number;
  /**
   * Marginal rate on the next dollar including the Medicare
   * levy when it applies, in percent.
   */
  marginalRatePercent: number;
  /** Total tax ÷ taxable income, in percent. */
  effectiveTaxRatePercent: number;
}

export function calculateAuTax(input: AuTaxInput): AuTaxResult {
  const income = roundMoney(Math.max(0, input.taxableIncome));
  const brackets =
    input.residency === "resident" ? RESIDENT_BRACKETS : NON_RESIDENT_BRACKETS;
  const bracket = bracketFor(brackets, income);

  const incomeTax = roundMoney(
    bracket.base + bracket.rate * (income - bracket.from),
  );

  const medicareLevyApplied =
    input.residency === "resident" && input.medicareLevyApplies;
  const medicareLevy = medicareLevyApplied
    ? roundMoney(income * MEDICARE_LEVY_RATE)
    : 0;

  const totalTax = roundMoney(incomeTax + medicareLevy);
  const marginalTaxRatePercent = bracket.rate * 100;

  return {
    taxableIncome: income,
    incomeTax,
    medicareLevy,
    medicareLevyApplied,
    totalTax,
    netIncome: roundMoney(income - totalTax),
    marginalTaxRatePercent,
    marginalRatePercent:
      marginalTaxRatePercent + (medicareLevyApplied ? 2 : 0),
    effectiveTaxRatePercent: income > 0 ? (totalTax / income) * 100 : 0,
  };
}
