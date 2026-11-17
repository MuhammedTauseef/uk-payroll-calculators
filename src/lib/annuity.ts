/**
 * Pension annuity estimator maths.
 *
 * IMPORTANT — these are ESTIMATES, not quotes, and the page says so in
 * plain words. A real annuity quote depends on the provider's live
 * pricing, the buyer's health and postcode, and the options chosen.
 * What this calculator does is apply a transparent, published-here
 * rate table so a visitor can see the shape of the answer — and the
 * table itself is printed on the page, which most annuity calculators
 * do not do.
 *
 * The table is anchored on the figure comparison sites and the FCA's
 * retirement-income data put in front of buyers in November 2026: a
 * healthy 65-year-old buying a single-life, level annuity with no
 * guarantee period gets roughly £7,300 a year per £100,000 of pension
 * pot (an annuity rate of about 7.3%). The other anchor ages follow
 * the same market curve — income rises with age because the provider
 * expects to pay it for fewer years. Option adjustments are the
 * typical market relationships, stated as factors so the arithmetic
 * can be checked:
 *
 *   - Joint life (50% to a spouse/partner after death): × 0.93 —
 *     the provider expects to pay for longer, so the starting
 *     income is lower.
 *   - Escalating at a fixed 3% a year: × 0.72 — payments start
 *     lower and rise; the starting income is roughly 28% below the
 *     level annuity.
 *   - RPI-linked escalation: × 0.70 — similar to fixed escalation,
 *     slightly lower again because inflation protection costs more
 *     when inflation is uncertain.
 *   - 5-year guarantee period: × 0.99; 10-year: × 0.975 — a small
 *     reduction for the promise that payments continue to the estate
 *     if the buyer dies inside the guarantee period.
 *
 * Tax-free cash is taken BEFORE the rest is annuitised (the usual
 * order): up to 25% of the pot can normally be taken tax-free, and
 * only the remainder buys the annuity. That ordering is the edge
 * case the verify script pins down.
 *
 * Rates labelled: illustrative, typical market, November 2026.
 */

export type AnnuityEscalation = "level" | "fixed3" | "rpi";
export type AnnuityGuaranteeYears = 0 | 5 | 10;

/** Anchor ages and the single-life, level, no-guarantee income per £100,000. */
export const ANNUITY_RATE_ANCHORS: readonly { age: number; per100k: number }[] = [
  { age: 55, per100k: 5900 },
  { age: 60, per100k: 6500 },
  { age: 65, per100k: 7300 },
  { age: 70, per100k: 8300 },
  { age: 75, per100k: 9600 },
];

/** Option adjustment factors applied to the anchor rate. */
export const ANNUITY_FACTORS = {
  jointLife: 0.93,
  escalation: { level: 1, fixed3: 0.72, rpi: 0.7 } as Record<
    AnnuityEscalation,
    number
  >,
  guarantee: { 0: 1, 5: 0.99, 10: 0.975 } as Record<
    AnnuityGuaranteeYears,
    number
  >,
};

/** The usual maximum tax-free lump sum, % of the pot. */
export const ANNUITY_MAX_TAX_FREE_PERCENT = 25;

export interface AnnuityInput {
  /** Total pension pot before any tax-free cash is taken, £. */
  pot: number;
  /** Percentage of the pot taken as tax-free cash first (usually 25). */
  taxFreePercent: number;
  /** Age at purchase. Rates are anchored at 55–75; outside values clamp. */
  age: number;
  /** True for a joint-life annuity paying 50% to a spouse/partner. */
  jointLife: boolean;
  escalation: AnnuityEscalation;
  guaranteeYears: AnnuityGuaranteeYears;
}

export interface AnnuityResult {
  /** Tax-free cash taken, £. */
  taxFreeCash: number;
  /** What is left to buy the annuity, £. */
  annuitisedPot: number;
  /** Estimated yearly income per £100,000 annuitised, after adjustments. */
  ratePer100k: number;
  /** Estimated income a year, £. */
  annualIncome: number;
  /** Estimated income a month (annual ÷ 12), £. */
  monthlyIncome: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/**
 * The single-life, level, no-guarantee rate per £100,000 at an age:
 * the anchor value at an anchor age, linearly interpolated between
 * anchors, clamped to the 55 and 75 anchors outside that range.
 */
export function annuityBaseRatePer100k(age: number): number {
  const anchors = ANNUITY_RATE_ANCHORS;
  const a = Math.min(
    anchors[anchors.length - 1].age,
    Math.max(anchors[0].age, Math.floor(age) || anchors[0].age),
  );
  for (let i = 0; i < anchors.length; i++) {
    if (a === anchors[i].age) return anchors[i].per100k;
    if (a < anchors[i].age) {
      const lo = anchors[i - 1];
      const hi = anchors[i];
      const t = (a - lo.age) / (hi.age - lo.age);
      return lo.per100k + t * (hi.per100k - lo.per100k);
    }
  }
  return anchors[anchors.length - 1].per100k;
}

/** The adjusted rate per £100,000 for a full set of options. */
export function annuityRatePer100k(input: {
  age: number;
  jointLife: boolean;
  escalation: AnnuityEscalation;
  guaranteeYears: AnnuityGuaranteeYears;
}): number {
  let rate = annuityBaseRatePer100k(input.age);
  if (input.jointLife) rate *= ANNUITY_FACTORS.jointLife;
  rate *= ANNUITY_FACTORS.escalation[input.escalation];
  rate *= ANNUITY_FACTORS.guarantee[input.guaranteeYears];
  return round2(rate);
}

export function calculateAnnuity(input: AnnuityInput): AnnuityResult {
  const pot = positive(input.pot);
  const taxFreePercent = Math.min(
    100,
    Math.max(0, input.taxFreePercent || 0),
  );

  // Tax-free cash comes off FIRST; only the remainder is annuitised.
  const taxFreeCash = round2((pot * taxFreePercent) / 100);
  const annuitisedPot = round2(pot - taxFreeCash);

  const ratePer100k = annuityRatePer100k(input);
  const annualIncome = round2((annuitisedPot / 100000) * ratePer100k);

  return {
    taxFreeCash,
    annuitisedPot,
    ratePer100k,
    annualIncome,
    monthlyIncome: round2(annualIncome / 12),
  };
}
