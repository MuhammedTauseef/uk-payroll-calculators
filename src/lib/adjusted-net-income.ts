/**
 * Adjusted net income (ANI) calculator maths — HMRC rules.
 *
 * Adjusted net income is defined in section 58 of the Income Tax
 * Act 2007 and explained in HMRC's "Personal Allowances: adjusted
 * net income" guidance on GOV.UK. In short:
 *
 *   ANI = total taxable income
 *         − grossed-up Gift Aid donations
 *         − grossed-up pension contributions (relief at source)
 *         − pension contributions paid gross / trading losses
 *           (already taken off inside "net income")
 *
 * "Grossed-up" means the amount paid plus basic-rate tax relief:
 * for every £1 paid in, £1.25 comes off. A contribution paid under
 * a net-pay arrangement never reaches taxable income in the first
 * place, and an employer contribution is not the employee's income
 * at all — neither belongs in the inputs below.
 *
 * HMRC tests ANI against four lines:
 *  - £60,000 — the High Income Child Benefit Charge starts:
 *    1% of Child Benefit is repaid for every complete £200 of ANI
 *    over £60,000.
 *  - £80,000 — the charge reaches 100% of Child Benefit.
 *  - £100,000 — the Personal Allowance is cut by £1 for every £2
 *    of ANI over the line, and Tax-Free Childcare plus the funded
 *    childcare hours for working parents stop completely.
 *  - £125,140 — the Personal Allowance is gone (and this is also
 *    the additional-rate threshold).
 *
 * Every one of these figures is the same in 2025/26 and 2026/27:
 * the Personal Allowance has been £12,570 since 2021/22 and is
 * frozen, the Child Benefit charge band moved to £60,000–£80,000
 * in April 2024 and has not moved since, and the £100,000
 * childcare line and £125,140 additional-rate threshold are
 * unchanged. The tax-year input is still carried through so the
 * page can state plainly which year a result belongs to.
 */

export type AniTaxYear = "2025/26" | "2026/27";

export const ANI_RULES = {
  personalAllowance: 12570,
  hicbcStart: 60000,
  hicbcFull: 80000,
  hicbcStep: 200,
  paTaperStart: 100000,
  additionalRateThreshold: 125140,
  /** £1 paid in counts as £1.25 off — basic-rate relief gross-up. */
  grossUpFactor: 1.25,
} as const;

export interface AniInput {
  taxYear: AniTaxYear;
  /** Employment income (salary, bonus, taxable benefits) before tax. */
  employmentIncome: number;
  /** Self-employment profit for the tax year. */
  selfEmploymentProfit: number;
  /** Savings income (interest) above any allowances — it all counts. */
  savingsIncome: number;
  /** Dividend income. */
  dividendIncome: number;
  /** Property (rental) income profit. */
  propertyIncome: number;
  /** Any other taxable income (pensions in payment, foreign, misc). */
  otherIncome: number;
  /**
   * Pension contributions actually paid in (net), where the provider
   * claims basic-rate relief at source — personal pensions and SIPPs.
   * Grossed up ×1.25 by the calculator.
   */
  pensionPaidNet: number;
  /**
   * Gift Aid donations actually paid (net of the basic-rate tax the
   * charity reclaims). Grossed up ×1.25 by the calculator.
   */
  giftAidPaidNet: number;
}

export interface AniResult {
  taxYear: AniTaxYear;
  totalIncome: number;
  pensionGross: number;
  giftAidGross: number;
  totalReliefs: number;
  adjustedNetIncome: number;
  /** High Income Child Benefit Charge as a % of Child Benefit (0–100). */
  hicbcPercent: number;
  /** Personal Allowance after the £100,000 taper. */
  personalAllowance: number;
  /** How much Personal Allowance the taper has taken away. */
  personalAllowanceLost: number;
  /** ANI of £100,000 or less keeps Tax-Free Childcare eligibility. */
  taxFreeChildcareEligible: boolean;
  /** At or over £125,140 the additional rate applies and PA is £0. */
  overAdditionalRateThreshold: boolean;
  /** Gross pension contribution that would bring ANI down to £100,000. */
  pensionGrossTo100k: number;
  /** What that contribution would actually cost out of pocket (net). */
  pensionNetTo100k: number;
  /** Gross pension contribution that would bring ANI down to £60,000. */
  pensionGrossTo60k: number;
  /** What that contribution would actually cost out of pocket (net). */
  pensionNetTo60k: number;
}

function clean(n: number): number {
  return Math.max(0, Number.isFinite(n) ? n : 0);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateAdjustedNetIncome(input: AniInput): AniResult {
  const totalIncome = round2(
    clean(input.employmentIncome) +
      clean(input.selfEmploymentProfit) +
      clean(input.savingsIncome) +
      clean(input.dividendIncome) +
      clean(input.propertyIncome) +
      clean(input.otherIncome),
  );

  const pensionGross = round2(
    clean(input.pensionPaidNet) * ANI_RULES.grossUpFactor,
  );
  const giftAidGross = round2(
    clean(input.giftAidPaidNet) * ANI_RULES.grossUpFactor,
  );
  const totalReliefs = round2(pensionGross + giftAidGross);

  const adjustedNetIncome = Math.max(0, round2(totalIncome - totalReliefs));

  // High Income Child Benefit Charge: 1% for every complete £200
  // of ANI over £60,000 (the percentage is rounded down in the
  // statute), capped at 100% once ANI reaches £80,000.
  const hicbcPercent =
    adjustedNetIncome <= ANI_RULES.hicbcStart
      ? 0
      : Math.min(
          100,
          Math.floor(
            (adjustedNetIncome - ANI_RULES.hicbcStart) / ANI_RULES.hicbcStep,
          ),
        );

  // Personal Allowance taper: £1 lost for every £2 of ANI over
  // £100,000, until nothing is left at £125,140.
  const personalAllowanceLost =
    adjustedNetIncome <= ANI_RULES.paTaperStart
      ? 0
      : Math.min(
          ANI_RULES.personalAllowance,
          Math.floor((adjustedNetIncome - ANI_RULES.paTaperStart) / 2),
        );
  const personalAllowance = ANI_RULES.personalAllowance - personalAllowanceLost;

  // Extra gross pension contribution needed to land exactly on a
  // line; at relief at source the saver pays 80% of the gross figure.
  const grossTo = (line: number) =>
    adjustedNetIncome > line ? round2(adjustedNetIncome - line) : 0;
  const pensionGrossTo100k = grossTo(ANI_RULES.paTaperStart);
  const pensionGrossTo60k = grossTo(ANI_RULES.hicbcStart);

  return {
    taxYear: input.taxYear,
    totalIncome,
    pensionGross,
    giftAidGross,
    totalReliefs,
    adjustedNetIncome,
    hicbcPercent,
    personalAllowance,
    personalAllowanceLost,
    taxFreeChildcareEligible: adjustedNetIncome <= ANI_RULES.paTaperStart,
    overAdditionalRateThreshold:
      adjustedNetIncome >= ANI_RULES.additionalRateThreshold,
    pensionGrossTo100k,
    pensionNetTo100k: round2(pensionGrossTo100k * 0.8),
    pensionGrossTo60k,
    pensionNetTo60k: round2(pensionGrossTo60k * 0.8),
  };
}
