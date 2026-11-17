import { INCOME_TAX } from "./rates.ts";
import { personalAllowanceFor } from "./takehome.ts";

/**
 * Capital Gains Tax maths — UK, 2026/27.
 *
 * Rates and allowance verified against GOV.UK ("Capital Gains Tax —
 * rates and allowances") on 17 November 2026:
 *   - Annual exempt amount: £3,000.
 *   - Gains that fall inside the basic-rate Income Tax band (the
 *     £37,700 band, measured on taxable income plus taxable gains)
 *     are taxed at 18%; gains above the band at 24%. Since 30 October
 *     2024 the same 18%/24% pair applies to residential property and
 *     to other assets, so one calculation covers both.
 *   - Business Asset Disposal Relief gains are charged at 18% for
 *     disposals from 6 April 2026 (lifetime limit £1 million) — this
 *     calculator works on the standard rates and the page says so.
 *
 * The GOV.UK method, followed exactly:
 *   1. Taxable income = other income − Personal Allowance (with the
 *      £100,000 taper, from the verified take-home functions).
 *   2. Taxable gain = total gains − £3,000 annual exempt amount.
 *   3. The gain stacks on top of taxable income: the part of the gain
 *      that fits in the unused basic-rate band is taxed at 18%, the
 *      rest at 24%.
 * GOV.UK's own worked examples for 2026/27 (taxable income £20,000;
 * gains £12,600 → £1,728 of tax; gains £52,600 → £10,842 of tax) are
 * pinned in scripts/verify-capital-gains.ts.
 */

export const CGT = {
  /** Annual exempt amount, £/year. */
  annualExemptAmount: 3000,
  /** Rate on gains inside the basic-rate band. */
  lowerRate: 0.18,
  /** Rate on gains above the basic-rate band. */
  higherRate: 0.24,
} as const;

/** Dating label for CGT figures (2026/27 — GOV.UK). */
export const CGT_RATES_LABEL = "2026/27 rates — verified against GOV.UK";

/** Date the CGT figures above were verified against GOV.UK. */
export const CGT_RATES_VERIFIED = "17 November 2026";

export interface CapitalGainsInput {
  /** Total capital gains in the year before the exempt amount, £. */
  totalGains: number;
  /** Other taxable income in the same year (salary, rent, etc.), £. */
  otherIncome: number;
}

export interface CapitalGainsResult {
  /** Personal Allowance on the other income (taper applied), £. */
  personalAllowance: number;
  /** Other income after the Personal Allowance, £. */
  taxableIncome: number;
  /** Gains after the £3,000 annual exempt amount, £. */
  taxableGain: number;
  /** Part of the taxable gain taxed at 18%, £. */
  gainAtLowerRate: number;
  /** Part of the taxable gain taxed at 24%, £. */
  gainAtHigherRate: number;
  /** Total Capital Gains Tax, £. */
  taxDue: number;
  /** Tax as a share of the total gains, 0–100. */
  effectiveRatePercent: number;
  /** Gain kept after tax, £. */
  gainAfterTax: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateCapitalGains(
  input: CapitalGainsInput,
): CapitalGainsResult {
  const gains = Math.max(0, input.totalGains || 0);
  const income = Math.max(0, input.otherIncome || 0);

  const pa = personalAllowanceFor(income);
  const taxableIncome = Math.max(0, income - pa);
  const taxableGain = Math.max(0, gains - CGT.annualExemptAmount);

  const bandLeft = Math.max(0, INCOME_TAX.basicRateBand - taxableIncome);
  const atLower = Math.min(taxableGain, bandLeft);
  const atHigher = taxableGain - atLower;
  const tax = atLower * CGT.lowerRate + atHigher * CGT.higherRate;

  return {
    personalAllowance: round2(pa),
    taxableIncome: round2(taxableIncome),
    taxableGain: round2(taxableGain),
    gainAtLowerRate: round2(atLower),
    gainAtHigherRate: round2(atHigher),
    taxDue: round2(tax),
    effectiveRatePercent: gains > 0 ? round2((tax / gains) * 100) : 0,
    gainAfterTax: round2(gains - tax),
  };
}
