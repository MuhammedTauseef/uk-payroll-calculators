/**
 * Tapered annual allowance calculator maths — HMRC rules.
 *
 * Since 6 April 2023 the pension annual allowance is £60,000, but
 * for high earners it is tapered away. The taper is set by two
 * different income measures, both defined in the Finance Act 2004
 * (sections 228ZA–228ZB) and worked through step by step in HMRC's
 * GOV.UK guidance "Work out your reduced (tapered) annual
 * allowance":
 *
 *   Threshold income = net income
 *                      − gross relief-at-source pension contributions
 *                      − lump sum death benefits received
 *                      + employment income given up under salary
 *                        sacrifice / flexible remuneration
 *                        arrangements made after 8 July 2015
 *
 *   Adjusted income  = net income
 *                      + contributions where relief was claimed for
 *                        amounts paid gross
 *                      + pension savings under net-pay arrangements
 *                      + relief claimed for overseas schemes
 *                      + pension savings made by the employer
 *                      − lump sum death benefits received
 *
 *   Net income itself is total taxable income less the reliefs
 *   given inside the calculation — which is why net-pay and
 *   paid-gross contributions come off before either measure starts.
 *
 * The taper bites only when BOTH measures are over their lines:
 * threshold income over £200,000 AND adjusted income over
 * £260,000. The allowance then falls by £1 for every £2 of
 * adjusted income over £260,000 (the reduction is rounded down to
 * the nearest £1 — HMRC pensions tax manual PTM057200), and it
 * cannot fall below £10,000, reached at £360,000.
 *
 * Two things that catch people out, both confirmed in the
 * guidance: Gift Aid donations do NOT reduce either measure (they
 * reduce adjusted net income — a different test, for Child Benefit
 * and the Personal Allowance), and relief-at-source contributions
 * reduce threshold income only, never adjusted income. That is
 * what makes the "escape" work: a big enough personal
 * contribution pulls threshold income to £200,000 and switches
 * the taper off, however high adjusted income is.
 *
 * The money purchase annual allowance (MPAA) is £10,000 once a
 * pension has been flexibly accessed (HS345). It replaces the
 * annual allowance for money purchase savings: no taper applies
 * to it and no carry forward can be added to it. A flexibly
 * accessed high earner compares it with the tapered allowance
 * through the alternative annual allowance (tapered allowance
 * minus the £10,000 MPAA), which covers defined benefit savings
 * and can still take carry forward.
 *
 * Every figure above is identical in 2025/26 and 2026/27 — the
 * £60,000 allowance and both limits have been unchanged since
 * 6 April 2023. The tax year still matters for carry forward:
 * the three earlier years are tested against their own
 * allowances (£60,000 for 2023/24 onwards; £40,000 for 2022/23,
 * whose taper lines were also lower — £240,000 adjusted income
 * and a £4,000 floor).
 */

export type TaperTaxYear = "2025/26" | "2026/27";

export const TAPER_RULES = {
  standardAllowance: 60000,
  thresholdLimit: 200000,
  adjustedLimit: 260000,
  minimumAllowance: 10000,
  mpaa: 10000,
  /** £1 paid in at relief at source counts as £1.25 of contribution. */
  grossUpFactor: 1.25,
} as const;

/** Standard annual allowance by tax year, for carry-forward defaults. */
export const STANDARD_ALLOWANCE_BY_YEAR: Record<string, number> = {
  "2022/23": 40000,
  "2023/24": 60000,
  "2024/25": 60000,
  "2025/26": 60000,
  "2026/27": 60000,
};

/** The three tax years carry forward can come from, earliest first. */
export function carryForwardYears(year: TaperTaxYear): string[] {
  return year === "2026/27"
    ? ["2023/24", "2024/25", "2025/26"]
    : ["2022/23", "2023/24", "2024/25"];
}

export interface CarryForwardYearInput {
  /** Tax year label, e.g. "2024/25". */
  year: string;
  /** Total pension savings (pension input amount) in that year. */
  pensionSavings: number;
  /**
   * The annual allowance that applied that year — the standard
   * allowance, or the tapered allowance if the person was tapered
   * that year. Defaults to the year's standard allowance.
   */
  allowance: number;
}

export interface TaperInput {
  taxYear: TaperTaxYear;
  /** Employment income after any salary sacrifice, before net-pay pension deductions. */
  employmentIncome: number;
  /** Self-employment / partnership profit for the tax year. */
  selfEmploymentProfit: number;
  /** Property (rental) income profit. */
  propertyIncome: number;
  /** Savings income (interest) — it all counts. */
  savingsIncome: number;
  /** Dividend income. */
  dividendIncome: number;
  /** Any other taxable income (pensions in payment, trust, foreign, misc). */
  otherIncome: number;
  /**
   * Personal pension contributions actually paid in (net), where
   * the provider claims basic-rate relief at source — personal
   * pensions and SIPPs. Grossed up ×1.25 by the calculator.
   * Reduces threshold income only.
   */
  pensionPaidNet: number;
  /**
   * Pension contributions that came off pay before tax (net-pay
   * arrangement) or were paid gross with relief claimed on the tax
   * return. Gross amounts. They come off net income, then go back
   * into adjusted income.
   */
  contributionsGross: number;
  /**
   * Pension savings made by the employer, excluding anything
   * given up under salary sacrifice (entered separately). For
   * defined benefit schemes this is the pension input amount
   * (closing value − opening value, the ×16 method).
   */
  employerContributions: number;
  /**
   * Employment income given up into a pension under a salary
   * sacrifice (or flexible remuneration) arrangement made after
   * 8 July 2015. Added back to threshold income, and counted as
   * employer savings in adjusted income.
   */
  salarySacrifice: number;
  /**
   * Gift Aid donations actually paid (net). Recorded for the
   * breakdown only: Gift Aid does NOT reduce threshold or
   * adjusted income (it reduces adjusted net income instead).
   */
  giftAidPaidNet: number;
  /** True if a pension has been flexibly accessed (MPAA triggered). */
  flexiblyAccessed: boolean;
  /** Total pension savings planned/made this year (all schemes, all sources). */
  plannedSavings: number;
  /** Marginal income tax rate on the excess, as a percentage (20, 40 or 45). */
  marginalRatePercent: number;
  /** Unused allowance detail for the previous three tax years. */
  carryForward: CarryForwardYearInput[];
}

export interface CarryForwardYearResult extends CarryForwardYearInput {
  unused: number;
}

export interface TaperResult {
  taxYear: TaperTaxYear;
  totalIncome: number;
  netIncome: number;
  rasGross: number;
  thresholdIncome: number;
  adjustedIncome: number;
  /** Threshold income over £200,000. */
  thresholdTestPassed: boolean;
  /** Adjusted income over £260,000. */
  adjustedTestPassed: boolean;
  /** Both tests passed — the taper applies. */
  tapered: boolean;
  /** The £-for-£2 reduction before the £10,000 floor. */
  reduction: number;
  /** Annual allowance after tapering (before MPAA and carry forward). */
  taperedAllowance: number;
  /** MPAA triggered — money purchase savings are capped at £10,000. */
  mpaaApplies: boolean;
  moneyPurchaseAllowance: number;
  /** Tapered allowance minus the MPAA — covers non-money-purchase savings when the MPAA applies. */
  alternativeAllowance: number;
  carryForwardYears: CarryForwardYearResult[];
  totalCarryForward: number;
  /** Tapered allowance plus total carry forward — the available allowance for this year's savings. */
  availableAllowance: number;
  plannedSavings: number;
  /** Savings above the available allowance. */
  excess: number;
  /** Estimated tax charge on the excess at the chosen marginal rate. */
  chargeEstimate: number;
  /**
   * Extra gross relief-at-source contribution that would pull
   * threshold income down to exactly £200,000 and switch the
   * taper off (0 when threshold income is already at or under
   * the line). Only meaningful while the taper is live or the
   * threshold test alone is passed.
   */
  escapeContributionGross: number;
  /** What that escape contribution would cost out of pocket (net of basic-rate relief). */
  escapeContributionNet: number;
}

function clean(n: number): number {
  return Math.max(0, Number.isFinite(n) ? n : 0);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateTaperedAnnualAllowance(input: TaperInput): TaperResult {
  const totalIncome = round2(
    clean(input.employmentIncome) +
      clean(input.selfEmploymentProfit) +
      clean(input.propertyIncome) +
      clean(input.savingsIncome) +
      clean(input.dividendIncome) +
      clean(input.otherIncome),
  );

  const contributionsGross = clean(input.contributionsGross);
  const sacrifice = clean(input.salarySacrifice);
  const employer = clean(input.employerContributions);
  const rasGross = round2(clean(input.pensionPaidNet) * TAPER_RULES.grossUpFactor);

  // Net income: total income less the reliefs given inside the
  // calculation — net-pay and paid-gross pension contributions.
  const netIncome = Math.max(0, round2(totalIncome - contributionsGross));

  // Threshold income: net income − gross relief-at-source
  // contributions + post-8 July 2015 sacrifice given back.
  const thresholdIncome = Math.max(
    0,
    round2(netIncome - rasGross + sacrifice),
  );

  // Adjusted income: net income + everything that was taken off
  // or never counted — net-pay/paid-gross contributions back on,
  // employer savings on, and sacrificed pay (an employer saving).
  const adjustedIncome = round2(
    netIncome + contributionsGross + employer + sacrifice,
  );

  const thresholdTestPassed = thresholdIncome > TAPER_RULES.thresholdLimit;
  const adjustedTestPassed = adjustedIncome > TAPER_RULES.adjustedLimit;
  const tapered = thresholdTestPassed && adjustedTestPassed;

  // £1 off for every £2 of adjusted income over £260,000, the
  // reduction rounded down to the nearest pound, floored at the
  // £10,000 minimum allowance.
  const reduction = tapered
    ? Math.min(
        TAPER_RULES.standardAllowance - TAPER_RULES.minimumAllowance,
        Math.floor((adjustedIncome - TAPER_RULES.adjustedLimit) / 2),
      )
    : 0;
  const taperedAllowance = TAPER_RULES.standardAllowance - reduction;

  // Carry forward: each earlier year keeps whatever of its own
  // allowance its savings did not use; scheme membership in the
  // year is required (stated on the page, not modelled here).
  const carryForwardYears: CarryForwardYearResult[] = input.carryForward.map(
    (y) => {
      const allowance =
        y.allowance > 0
          ? clean(y.allowance)
          : (STANDARD_ALLOWANCE_BY_YEAR[y.year] ?? TAPER_RULES.standardAllowance);
      return {
        year: y.year,
        pensionSavings: clean(y.pensionSavings),
        allowance,
        unused: Math.max(0, round2(allowance - clean(y.pensionSavings))),
      };
    },
  );
  const totalCarryForward = round2(
    carryForwardYears.reduce((sum, y) => sum + y.unused, 0),
  );

  const mpaaApplies = input.flexiblyAccessed;
  const availableAllowance = round2(taperedAllowance + totalCarryForward);

  const plannedSavings = clean(input.plannedSavings);
  const excess = Math.max(0, round2(plannedSavings - availableAllowance));
  const rate = Math.min(100, Math.max(0, input.marginalRatePercent || 0));
  const chargeEstimate = round2((excess * rate) / 100);

  // Escape: relief-at-source contributions reduce threshold
  // income £1 for £1 (gross), so the gross contribution that
  // lands exactly on £200,000 is the whole gap. It restores the
  // full £60,000 allowance, but the contribution itself counts
  // towards that allowance.
  const escapeContributionGross = thresholdTestPassed
    ? round2(thresholdIncome - TAPER_RULES.thresholdLimit)
    : 0;

  return {
    taxYear: input.taxYear,
    totalIncome,
    netIncome,
    rasGross,
    thresholdIncome,
    adjustedIncome,
    thresholdTestPassed,
    adjustedTestPassed,
    tapered,
    reduction,
    taperedAllowance,
    mpaaApplies,
    moneyPurchaseAllowance: TAPER_RULES.mpaa,
    alternativeAllowance: Math.max(0, taperedAllowance - TAPER_RULES.mpaa),
    carryForwardYears,
    totalCarryForward,
    availableAllowance,
    plannedSavings,
    excess,
    chargeEstimate,
    escapeContributionGross,
    escapeContributionNet: round2(escapeContributionGross * 0.8),
  };
}
