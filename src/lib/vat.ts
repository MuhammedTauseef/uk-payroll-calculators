/**
 * UK VAT calculator maths — standard add/remove VAT at a percentage rate.
 *
 * Adding VAT:    gross = net × (1 + rate/100);  VAT = gross − net.
 * Removing VAT:  net = gross ÷ (1 + rate/100);  VAT = gross − net.
 * At the 20% standard rate the VAT inside a gross price is 1/6 of it;
 * at the 5% reduced rate it is 1/21 — the page explains both.
 */

export type VatMode = "add" | "remove";

export interface VatInput {
  /** The amount typed in, £. */
  amount: number;
  /** VAT rate, % (20 standard, 5 reduced, 0 zero-rated, or custom). */
  ratePercent: number;
  mode: VatMode;
}

export interface VatResult {
  net: number;
  vat: number;
  gross: number;
  ratePercent: number;
  mode: VatMode;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateVat(input: VatInput): VatResult {
  const amount = Math.max(0, input.amount || 0);
  const rate = Math.max(0, input.ratePercent || 0);
  const factor = 1 + rate / 100;

  let net: number;
  let gross: number;
  if (input.mode === "add") {
    net = amount;
    gross = amount * factor;
  } else {
    gross = amount;
    net = amount / factor;
  }

  return {
    net: round2(net),
    vat: round2(gross - net),
    gross: round2(gross),
    ratePercent: rate,
    mode: input.mode,
  };
}

/** The standard UK VAT rates offered as presets on the page. */
export const VAT_RATE_PRESETS = [
  { value: 20, label: "Standard rate — 20%" },
  { value: 5, label: "Reduced rate — 5%" },
  { value: 0, label: "Zero rate — 0%" },
] as const;
