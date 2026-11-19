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
 * RATE BASIS — re-anchored 19 November 2026 (this replaced the
 * 17 November 2026 table, whose £7,300 age-65 anchor had fallen more
 * than 10% behind the market by mid-November and failed the page's
 * benchmark test). The standard case used across the UK industry is a
 * healthy buyer, £100,000 purchase, single life, level payments, no
 * guarantee period. Published figures for that case, November 2026:
 *
 *   - Which? best-buy table (source: MoneyHelper annuity calculator,
 *     correct at 16 November 2026), age 65: Scottish Widows £8,151,
 *     Canada Life £8,151, Standard Life £8,094, Aviva £8,018,
 *     Legal & General £7,860, Just £6,703. Age 70 best: £9,043.
 *   - Retirement Line best standard rates, 12 November 2026:
 *     age 55 £7,210 · age 60 £7,730 · age 65 £8,520 · age 70 £9,440 ·
 *     age 75 £10,630 (Scottish Widows best at every age shown).
 *   - Money to the Masses best-buy check, 5 November 2026, age 65:
 *     single level £8,209 · with 5-year guarantee £8,145 · joint life
 *     (50%) £7,624 · joint + 3% escalation £5,607.
 *
 * The anchors below are TYPICAL market levels — close to the top of
 * the Which?/MoneyHelper table but deliberately NOT the single best
 * quote in the market (Retirement Line's £8,520), because most
 * buyers land somewhere inside the provider range, not on its best
 * line. Age-65 anchor £8,100 sits 0.6% under the Which?/MoneyHelper
 * best of £8,151 and 4.9% under the Retirement Line best — inside
 * the ±10% benchmark band against both.
 *
 * Option adjustments are the typical market relationships observed
 * in the same November 2026 tables, stated as factors so the
 * arithmetic can be checked:
 *
 *   - Joint life (50% to a spouse/partner after death): × 0.93 —
 *     observed ratios 0.929 (Money to the Masses, Sharing Pensions)
 *     to 0.954 (Which? best-vs-best). The provider expects to pay
 *     for longer, so the starting income is lower.
 *   - Escalating at a fixed 3% a year: × 0.74 — observed ratios
 *     0.732–0.748 across the Which?, Money to the Masses and
 *     Sharing Pensions tables. Payments start lower and rise; the
 *     starting income is roughly 26% below the level annuity.
 *   - RPI-linked escalation: × 0.68 — published RPI-linked starting
 *     incomes sit roughly 30–35% below the level equivalent
 *     (observed ratio ~0.675 in an autumn 2026 provider table),
 *     because inflation protection costs more when inflation is
 *     uncertain.
 *   - 5-year guarantee period: × 0.99 — observed 0.992 (Money to
 *     the Masses, 5 November 2026). 10-year guarantee: × 0.95 —
 *     observed range 0.92–0.99 depending on age (the older the
 *     buyer, the more a 10-year promise costs, because it is more
 *     likely to be used); a single typical factor is applied.
 *
 * Tax-free cash is taken BEFORE the rest is annuitised (the usual
 * order): up to 25% of the pot can normally be taken tax-free
 * (subject to the £268,275 Lump Sum Allowance), and only the
 * remainder buys the annuity. That ordering is the edge case the
 * verify script pins down.
 *
 * Rates labelled: illustrative, typical market, November 2026.
 * Annuity rates move with gilt yields — the 15-year gilt yield was
 * about 5.6% in late October 2026, which is why rates are near
 * their best levels in over a decade — so this table is re-checked
 * against published best-buy tables and re-anchored when it drifts.
 */

export type AnnuityEscalation = "level" | "fixed3" | "rpi";
export type AnnuityGuaranteeYears = 0 | 5 | 10;

/** Anchor ages and the single-life, level, no-guarantee income per £100,000. */
export const ANNUITY_RATE_ANCHORS: readonly { age: number; per100k: number }[] = [
  { age: 55, per100k: 7150 },
  { age: 60, per100k: 7700 },
  { age: 65, per100k: 8100 },
  { age: 70, per100k: 9100 },
  { age: 75, per100k: 10600 },
];

/** Option adjustment factors applied to the anchor rate. */
export const ANNUITY_FACTORS = {
  jointLife: 0.93,
  escalation: { level: 1, fixed3: 0.74, rpi: 0.68 } as Record<
    AnnuityEscalation,
    number
  >,
  guarantee: { 0: 1, 5: 0.99, 10: 0.95 } as Record<
    AnnuityGuaranteeYears,
    number
  >,
};

/** The usual maximum tax-free lump sum, % of the pot. */
export const ANNUITY_MAX_TAX_FREE_PERCENT = 25;

/** Lump Sum Allowance (MoneyHelper / GOV.UK): the cap on total tax-free cash. */
export const LUMP_SUM_ALLOWANCE = 268275;

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
