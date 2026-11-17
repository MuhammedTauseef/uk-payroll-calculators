/**
 * Child Maintenance Service (CMS) calculator maths.
 *
 * Implements the standard CMS calculation (Child Support Act 1991,
 * Schedule 1, and the Child Support Maintenance Calculation
 * Regulations 2012, regulation 43):
 *
 *  1. The paying parent's yearly gross income (from HMRC) is converted
 *     to a gross weekly figure. Income above £3,000 a week is ignored.
 *  2. One of five rates applies, by gross weekly income:
 *       below £7            Nil rate — £0
 *       £7 to £100          Flat rate — £7 (also the rate on benefits)
 *       £100.01 to £199.99  Reduced rate — £7 + a tapered percentage
 *       £200 to £3,000      Basic rate — a percentage of income
 *       income unknown      Default rate — £38 / £51 / £64 (CMS only;
 *                           this calculator always has an income)
 *  3. Basic rate: 12% / 16% / 19% (1 / 2 / 3+ children) of the first
 *     £800 of weekly income, then 9% / 12% / 15% of the rest. If the
 *     paying parent has other children living with them ("relevant
 *     other children"), gross income is first reduced by 11% / 14% /
 *     16% (1 / 2 / 3+ other children) — Schedule 1, paragraph 2(3).
 *  4. Reduced rate (regulation 43): £7 + (income − £100) × T%, where T
 *     is set by the numbers of qualifying and other children (table
 *     below, current revised text on legislation.gov.uk).
 *  5. Shared care (Schedule 1, paragraph 7): for the basic and reduced
 *     rates, overnight stays of 52–103 nights cut the amount by 1/7,
 *     104–155 by 2/7, 156–174 by 3/7 and 175+ by 1/2 plus a further
 *     £7 per child; shared care cannot take the amount below £7.
 *     On the benefits flat rate, 52+ nights reduce the amount to £0
 *     (paragraph 8).
 *  6. Collect & Pay (optional): the paying parent pays 20% on top and
 *     the receiving parent has 4% deducted. Direct Pay has no fees.
 *
 * Sources: GOV.UK "How the Child Maintenance Service works out child
 * maintenance" and legislation.gov.uk (Child Support Act 1991,
 * Schedule 1; SI 2012/2677, regulation 43) — verified 14 Nov 2026.
 */

export const CMS_LAST_VERIFIED = "14 November 2026";
export const CMS_SOURCE_URL =
  "https://www.gov.uk/how-child-maintenance-is-worked-out";
export const CMS_LEGISLATION_URL =
  "https://www.legislation.gov.uk/ukpga/1991/48/schedule/1";
export const CMS_REGULATIONS_URL =
  "https://www.legislation.gov.uk/uksi/2012/2677/regulation/43";

/** Flat rate, and the minimum weekly amount after shared care. */
export const CMS_FLAT_WEEKLY = 7;
/** Gross weekly income above this is ignored (Schedule 1, para 10(3)). */
export const CMS_INCOME_CAP = 3000;
/** The basic-rate percentages change above this weekly income. */
export const CMS_BASIC_PLUS_THRESHOLD = 800;

/** Basic-rate percentages, by number of children (index: 1, 2, 3+). */
export const CMS_BASIC_RATES = {
  first800: [12, 16, 19],
  above800: [9, 12, 15],
} as const;

/**
 * Reduction to gross income for relevant other children living with
 * the paying parent, by their number (index: 0, 1, 2, 3+).
 * Schedule 1, paragraph 2(3): 0% / 11% / 14% / 16%.
 */
export const CMS_OTHER_CHILDREN_REDUCTION = [0, 11, 14, 16] as const;

/**
 * Reduced-rate T percentages (SI 2012/2677, regulation 43, current
 * text): rows are qualifying children (1, 2, 3+), columns are relevant
 * other children (0, 1, 2, 3+). Reduced rate = £7 + (income − £100) × T%.
 */
export const CMS_REDUCED_T: readonly (readonly number[])[] = [
  [17.0, 14.1, 13.2, 12.4],
  [25.0, 21.2, 19.9, 18.9],
  [31.0, 26.4, 24.9, 23.8],
];

/** Shared-care bands (Schedule 1, paragraph 7(4)). */
export const CMS_SHARED_CARE_BANDS = [
  { min: 52, max: 103, fraction: 1 / 7, percent: 14.29, label: "1/7 off" },
  { min: 104, max: 155, fraction: 2 / 7, percent: 28.57, label: "2/7 off" },
  { min: 156, max: 174, fraction: 3 / 7, percent: 42.86, label: "3/7 off" },
  { min: 175, max: Infinity, fraction: 1 / 2, percent: 50, label: "Half off, plus £7 per child" },
] as const;

/** Default rate (income unknown) — applied by the CMS, shown in copy. */
export const CMS_DEFAULT_RATES = [38, 51, 64] as const;

/** Collect & Pay fees: +20% for the paying parent, −4% receiving. */
export const CMS_COLLECT_PAY_PAYER_FEE = 20;
export const CMS_COLLECT_PAY_RECEIVER_FEE = 4;

export interface CmsInput {
  /** Paying parent's gross income for one week, £. */
  grossWeeklyIncome: number;
  /** Children the maintenance is for (qualifying children), 1 or more. */
  qualifyingChildren: number;
  /** Other children living with the paying parent (relevant other children). */
  otherChildren: number;
  /** Paying parent receives benefits (flat rate applies). */
  receivesBenefits: boolean;
  /** Overnight stays with the paying parent, nights per year (0–365). */
  sharedCareNights: number;
  /** Show Collect & Pay amounts (20% / 4% fees) alongside the result. */
  collectAndPay: boolean;
}

export type CmsRateKind = "nil" | "flat" | "reduced" | "basic";

export interface CmsResult {
  rate: CmsRateKind;
  rateLabel: string;
  /** Gross weekly income as entered (before the £3,000 cap). */
  grossWeeklyIncome: number;
  /** True when income above £3,000/week was ignored. */
  cappedAt3000: boolean;
  /** Basic rate only: income after the other-children reduction. */
  adjustedWeeklyIncome: number | null;
  /** Amount before any shared-care reduction (basic/reduced only). */
  beforeSharedCare: number | null;
  /** Shared-care reduction applied, % (0 when none). */
  sharedCarePercent: number;
  /** Extra £7-per-child deduction at 175+ nights (0 otherwise). */
  extraSevenDeduction: number;
  /** True when shared care would have taken the amount below £7. */
  flooredAtMinimum: boolean;
  /** Weekly child maintenance, £. */
  weekly: number;
  /** Weekly × 52 ÷ 12. */
  monthly: number;
  /** Weekly × 52. */
  annual: number;
  /** Collect & Pay: what the paying parent pays each week (+20%). */
  collectAndPayPayerWeekly: number | null;
  /** Collect & Pay: what the receiving parent receives (−4%). */
  collectAndPayReceiverWeekly: number | null;
  /** Plain-English breakdown of how the figure was reached. */
  steps: string[];
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function bucket(n: number): number {
  // Index 0, 1 or 2 for "1, 2, 3 or more".
  return Math.min(Math.max(n, 1), 3) - 1;
}

function sharedCareFraction(nights: number): number {
  for (const band of CMS_SHARED_CARE_BANDS) {
    if (nights >= band.min && nights <= band.max) return band.fraction;
  }
  return 0;
}

export function calculateCms(input: CmsInput): CmsResult {
  const rawIncome = Math.max(0, input.grossWeeklyIncome || 0);
  const income = Math.min(rawIncome, CMS_INCOME_CAP);
  const cappedAt3000 = rawIncome > CMS_INCOME_CAP;
  const qc = Math.max(1, Math.floor(input.qualifyingChildren || 1));
  const roc = Math.max(0, Math.floor(input.otherChildren || 0));
  const nights = Math.min(365, Math.max(0, Math.floor(input.sharedCareNights || 0)));
  const qcBucket = bucket(qc);
  const rocBucket = Math.min(roc, 3);

  const steps: string[] = [];
  let rate: CmsRateKind;
  let rateLabel: string;
  let adjustedWeeklyIncome: number | null = null;
  let beforeSharedCare: number | null = null;
  let sharedCarePercent = 0;
  let extraSevenDeduction = 0;
  let flooredAtMinimum = false;
  let weekly: number;

  const applySharedCare = (amount: number): number => {
    const fraction = sharedCareFraction(nights);
    if (fraction === 0) return amount;
    sharedCarePercent =
      CMS_SHARED_CARE_BANDS.find((b) => b.fraction === fraction)?.percent ?? 0;
    let reduced = amount * (1 - fraction);
    steps.push(
      `Shared care: ${nights} nights a year is the ${sharedCarePercent}% band, so ${gbp.format(amount)} is reduced by ${gbp.format(amount * fraction)} to ${gbp.format(reduced)}.`,
    );
    if (fraction === 1 / 2) {
      extraSevenDeduction = CMS_FLAT_WEEKLY * qc;
      reduced -= extraSevenDeduction;
      steps.push(
        `At 175 or more nights there is a further £7 a week off for each child: −${gbp.format(extraSevenDeduction)} for ${qc} ${qc === 1 ? "child" : "children"}, giving ${gbp.format(Math.max(reduced, 0))}.`,
      );
    }
    if (reduced < CMS_FLAT_WEEKLY) {
      flooredAtMinimum = true;
      steps.push(
        `Shared care cannot take child maintenance below £7 a week, so the amount is set to ${gbp.format(CMS_FLAT_WEEKLY)}.`,
      );
      return CMS_FLAT_WEEKLY;
    }
    return reduced;
  };

  if (input.receivesBenefits) {
    rate = "flat";
    rateLabel = "Flat rate (paying parent on benefits)";
    if (nights >= 52) {
      weekly = 0;
      steps.push(
        "The paying parent receives benefits, so the flat rate applies. With 52 or more shared-care nights a year, nothing is payable for a child who stays overnight (Schedule 1, paragraph 8).",
      );
    } else {
      weekly = CMS_FLAT_WEEKLY;
      steps.push(
        `The paying parent receives benefits, so the flat rate applies: ${gbp.format(CMS_FLAT_WEEKLY)} a week, whatever the income.`,
      );
    }
  } else if (income < CMS_FLAT_WEEKLY) {
    rate = "nil";
    rateLabel = "Nil rate";
    weekly = 0;
    steps.push(
      `Gross weekly income of ${gbp.format(income)} is below £7, so the nil rate applies and nothing is payable.`,
    );
  } else if (income <= 100) {
    rate = "flat";
    rateLabel = "Flat rate";
    weekly = CMS_FLAT_WEEKLY;
    steps.push(
      `Gross weekly income of ${gbp.format(income)} is between £7 and £100, so the flat rate applies: ${gbp.format(CMS_FLAT_WEEKLY)} a week. Overnight stays do not change the flat rate unless the paying parent is on benefits.`,
    );
  } else if (income < 200) {
    rate = "reduced";
    rateLabel = "Reduced rate";
    const t = CMS_REDUCED_T[qcBucket][rocBucket];
    const above = income - 100;
    beforeSharedCare = CMS_FLAT_WEEKLY + (above * t) / 100;
    steps.push(
      `Gross weekly income of ${gbp.format(income)} is in the reduced-rate band (£100.01 to £199.99): £7 plus ${t}% of the ${gbp.format(above)} above £100 = ${gbp.format(beforeSharedCare)} a week before shared care. The ${t}% comes from the regulation 43 table for ${qc >= 3 ? "3 or more" : qc} qualifying ${qc === 1 ? "child" : "children"} and ${roc >= 3 ? "3 or more" : roc} other ${roc === 1 ? "child" : "children"}.`,
    );
    weekly = applySharedCare(beforeSharedCare);
  } else {
    rate = "basic";
    const reduction = CMS_OTHER_CHILDREN_REDUCTION[rocBucket];
    const adjusted = income * (1 - reduction / 100);
    adjustedWeeklyIncome = adjusted;
    const firstPct = CMS_BASIC_RATES.first800[qcBucket];
    const abovePct = CMS_BASIC_RATES.above800[qcBucket];
    const firstSlice = Math.min(adjusted, CMS_BASIC_PLUS_THRESHOLD);
    const aboveSlice = Math.max(0, adjusted - CMS_BASIC_PLUS_THRESHOLD);
    beforeSharedCare =
      (firstSlice * firstPct) / 100 + (aboveSlice * abovePct) / 100;
    rateLabel =
      aboveSlice > 0 ? "Basic rate (with the over-£800 percentages)" : "Basic rate";
    if (reduction > 0) {
      steps.push(
        `The paying parent has ${roc >= 3 ? "3 or more" : roc} other ${roc === 1 ? "child" : "children"} living with them, so gross weekly income is reduced by ${reduction}%: ${gbp.format(income)} becomes ${gbp.format(adjusted)}.`,
      );
    }
    steps.push(
      aboveSlice > 0
        ? `Basic rate for ${qc >= 3 ? "3 or more" : qc} ${qc === 1 ? "child" : "children"}: ${firstPct}% of the first £800 (${gbp.format((firstSlice * firstPct) / 100)}) plus ${abovePct}% of the remaining ${gbp.format(aboveSlice)} (${gbp.format((aboveSlice * abovePct) / 100)}) = ${gbp.format(beforeSharedCare)} a week before shared care.`
        : `Basic rate for ${qc >= 3 ? "3 or more" : qc} ${qc === 1 ? "child" : "children"}: ${firstPct}% of ${gbp.format(adjusted)} = ${gbp.format(beforeSharedCare)} a week before shared care.`,
    );
    weekly = applySharedCare(beforeSharedCare);
  }

  if (cappedAt3000) {
    steps.unshift(
      `Only the first £3,000 of gross weekly income counts — the ${gbp.format(rawIncome - CMS_INCOME_CAP)} above that is ignored, and extra maintenance above £3,000 a week is a matter for the courts.`,
    );
  }

  weekly = round2(weekly);

  return {
    rate,
    rateLabel,
    grossWeeklyIncome: rawIncome,
    cappedAt3000,
    adjustedWeeklyIncome:
      adjustedWeeklyIncome === null ? null : round2(adjustedWeeklyIncome),
    beforeSharedCare: beforeSharedCare === null ? null : round2(beforeSharedCare),
    sharedCarePercent,
    extraSevenDeduction: round2(extraSevenDeduction),
    flooredAtMinimum,
    weekly,
    monthly: round2((weekly * 52) / 12),
    annual: round2(weekly * 52),
    collectAndPayPayerWeekly: input.collectAndPay
      ? round2(weekly * (1 + CMS_COLLECT_PAY_PAYER_FEE / 100))
      : null,
    collectAndPayReceiverWeekly: input.collectAndPay
      ? round2(weekly * (1 - CMS_COLLECT_PAY_RECEIVER_FEE / 100))
      : null,
    steps,
  };
}
