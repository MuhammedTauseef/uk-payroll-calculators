/**
 * Marriage Allowance eligibility and saving maths — 2026/27.
 *
 * Built 22 November 2026 for the "marriage allowance
 * calculator" keyword (Semrush UK: 590/month, KD 27 — VERIFIED
 * weak-slot top-10 entry: beatabeck.co.uk, AS 8, at live #6;
 * taxbax.co.uk ranks #2 on roughly 379 visits a month).
 * Competitor teardown (22 Nov 2026): the ranking calculators
 * show the £252 headline but several bury the two catches that
 * decide real cases — the transferor earning between £11,310
 * and £12,570 pays tax on the slice above £11,310, which eats
 * into the saving, and a recipient who pays only a little tax
 * cannot use the full £252 reduction, so some couples gain
 * nothing or end up worse off. This calculator works the full
 * couple position and says which case applies, with the reason.
 *
 * Rules (GOV.UK "Marriage Allowance: How it works", verified
 * 22 November 2026; constants in rates.ts):
 *   - The lower earner transfers £1,260 of Personal Allowance.
 *     Their own allowance falls to £11,310.
 *   - The recipient's tax bill falls by 20% of £1,260 = £252,
 *     capped at the tax they actually pay.
 *   - Eligible: married or in a civil partnership (the page
 *     states this; the calculator takes it as given), the
 *     transferor a non-taxpayer (income at or below the
 *     £12,570 Personal Allowance), the recipient a basic-rate
 *     taxpayer — up to £50,270 in England, Wales and Northern
 *     Ireland, or £43,662 in Scotland (starter, basic or
 *     intermediate rate).
 *   - Net couple saving = recipient's tax reduction −
 *     transferor's extra tax. The transferor's extra tax is
 *     20% of their income above £11,310 (19% in Scotland, where
 *     that slice falls in the starter band).
 *   - Backdating: up to 4 previous tax years (to 2022/23),
 *     each worth the same net saving if circumstances were the
 *     same — the page says the figure assumes that.
 */

import { INCOME_TAX, MARRIAGE_ALLOWANCE } from "./rates.ts";
import { incomeTaxFor } from "./takehome.ts";

export type MarriageRegion = "EWNI" | "Scotland";

export type MarriageVerdict =
  | "full-saving"
  | "partial-saving"
  | "no-saving-recipient-pays-no-tax"
  | "not-eligible-recipient-higher-rate"
  | "not-eligible-transferor-taxpayer"
  | "worse-off";

export interface MarriageAllowanceInput {
  /** Annual gross income of one partner, £. */
  incomeA: number;
  /** Annual gross income of the other partner, £. */
  incomeB: number;
  region: MarriageRegion;
  /** Previous tax years to backdate the claim over, 0–4. */
  backdateYears: number;
}

export interface MarriageAllowanceResult {
  lowerIncome: number;
  higherIncome: number;
  eligible: boolean;
  verdict: MarriageVerdict;
  /** Tax the recipient saves, £/year (before the transferor's extra tax). */
  recipientSaving: number;
  /** Extra tax the transferor pays after giving up £1,260 of allowance, £/year. */
  transferorExtraTax: number;
  /** Net saving for the couple, £/year — can be negative. */
  netAnnualSaving: number;
  netMonthlySaving: number;
  /** Net saving × backdate years, £. */
  backdatedTotal: number;
  /** Current year + backdated total, £. */
  totalWithCurrentYear: number;
  /** Recipient's Income Tax before the claim, £/year. */
  recipientTaxBefore: number;
  /** Transferor's unused Personal Allowance before the claim, £/year. */
  transferorSpareAllowance: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateMarriageAllowance(
  input: MarriageAllowanceInput,
): MarriageAllowanceResult {
  const pa = INCOME_TAX.personalAllowance;
  const lower = Math.min(
    Math.max(0, input.incomeA || 0),
    Math.max(0, input.incomeB || 0),
  );
  const higher = Math.max(
    Math.max(0, input.incomeA || 0),
    Math.max(0, input.incomeB || 0),
  );
  const recipientLimit =
    input.region === "Scotland"
      ? MARRIAGE_ALLOWANCE.recipientLimitScotland
      : MARRIAGE_ALLOWANCE.recipientLimitEWNI;
  const transferorRate = input.region === "Scotland" ? 0.19 : 0.2;
  const years = Math.min(
    4,
    Math.max(0, Math.floor(input.backdateYears || 0)),
  );

  const recipientTaxBefore = incomeTaxFor(higher);
  const transferorSpareAllowance = Math.max(0, pa - lower);

  let verdict: MarriageVerdict;
  let recipientSaving = 0;
  let transferorExtraTax = 0;

  if (lower > pa) {
    verdict = "not-eligible-transferor-taxpayer";
  } else if (higher > recipientLimit) {
    verdict = "not-eligible-recipient-higher-rate";
  } else if (recipientTaxBefore <= 0) {
    verdict = "no-saving-recipient-pays-no-tax";
  } else {
    recipientSaving = Math.min(
      MARRIAGE_ALLOWANCE.maxSaving,
      recipientTaxBefore,
    );
    transferorExtraTax =
      transferorRate *
      Math.max(0, lower - MARRIAGE_ALLOWANCE.transferorAllowanceAfter);
    const net = recipientSaving - transferorExtraTax;
    if (net <= 0) verdict = "worse-off";
    else if (net >= MARRIAGE_ALLOWANCE.maxSaving) verdict = "full-saving";
    else verdict = "partial-saving";
  }

  const eligible =
    verdict === "full-saving" ||
    verdict === "partial-saving" ||
    verdict === "worse-off";
  const netAnnualSaving = round2(recipientSaving - transferorExtraTax);

  return {
    lowerIncome: round2(lower),
    higherIncome: round2(higher),
    eligible,
    verdict,
    recipientSaving: round2(recipientSaving),
    transferorExtraTax: round2(transferorExtraTax),
    netAnnualSaving,
    netMonthlySaving: round2(netAnnualSaving / 12),
    backdatedTotal: round2(netAnnualSaving * years),
    totalWithCurrentYear: round2(netAnnualSaving * (years + 1)),
    recipientTaxBefore: round2(recipientTaxBefore),
    transferorSpareAllowance: round2(transferorSpareAllowance),
  };
}
