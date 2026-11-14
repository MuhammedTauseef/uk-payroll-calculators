import { employeeNiFor, incomeTaxFor } from "./takehome.ts";

/**
 * NHS Agenda for Change (AfC) pay — England, 2025/26.
 *
 * Pay values: NHS Employers, "Pay scales for 2025/26" (the official
 * Agenda for Change annual and hourly rates for England, inclusive of
 * the 2025/26 pay award), fetched and verified on 14 November 2026:
 *   https://www.nhsemployers.org/articles/pay-scales-202526
 * Only the basic (non-London) rates are used — the High Cost Area
 * Supplement (HCAS) tables on the same page are NOT included, and the
 * page says so. Band 1 is closed to new entrants and is not offered;
 * the scale below starts at Band 2, as the calculator spec requires.
 *
 * Pension tiers: NHS Pension Scheme member contribution rates for
 * 2025/26 (England and Wales), per NHSBSA "Cost of being in the
 * Scheme" and the NHS Pension Scheme Regulations 2015, reg. 30 table
 * for scheme years 2025/26 to 2027/28 — also fetched 14 November 2026:
 *   https://www.nhsbsa.nhs.uk/member-hub/cost-being-scheme
 * The rate is a FLAT percentage of all pensionable pay, set by the
 * member's actual annual pensionable pay — it is not a marginal rate.
 *
 * Take-home estimate: the NHS Pension Scheme is a net pay arrangement,
 * so pension contributions come off BEFORE Income Tax (taxable pay =
 * gross − pension) but National Insurance is still charged on the full
 * gross. Tax and NI reuse the site's take-home helpers (2026/27 PAYE,
 * England/Wales/NI) so the estimate matches the take-home calculator.
 */

export interface NhsPayStep {
  /** "Entry", "Intermediate" or "Top". */
  label: string;
  /** Years in the band before this step, as published. */
  yearsLabel: string;
  /** Full-time annual salary, £ (37.5 hours a week). */
  annual: number;
  /** Official published hourly rate, £ (full-time). */
  hourly: number;
}

export interface NhsBand {
  band: string;
  /** Typical roles, for the selector help text and the explainer. */
  roles: string;
  steps: NhsPayStep[];
}

export const AFC_PAY_LABEL =
  "Agenda for Change pay scales 2025/26 (England) — NHS Employers";
export const AFC_SOURCE_URL =
  "https://www.nhsemployers.org/articles/pay-scales-202526";
export const AFC_LAST_VERIFIED = "14 November 2026";
export const NHS_FULL_TIME_HOURS = 37.5;

export const AFC_BANDS: NhsBand[] = [
  {
    band: "Band 2",
    roles: "Healthcare assistants, porters, receptionists, domestic staff",
    steps: [
      { label: "Entry", yearsLabel: "0+ years", annual: 24465, hourly: 12.51 },
    ],
  },
  {
    band: "Band 3",
    roles: "Senior healthcare assistants, medical secretaries, admin officers",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 24937, hourly: 12.75 },
      { label: "Top", yearsLabel: "2+ years", annual: 26598, hourly: 13.6 },
    ],
  },
  {
    band: "Band 4",
    roles: "Nursing associates, pharmacy technicians, associate practitioners",
    steps: [
      { label: "Entry", yearsLabel: "0–3 years", annual: 27485, hourly: 14.06 },
      { label: "Top", yearsLabel: "3+ years", annual: 30162, hourly: 15.43 },
    ],
  },
  {
    band: "Band 5",
    roles: "Newly qualified nurses, midwives, paramedics and AHPs",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 31049, hourly: 15.88 },
      { label: "Intermediate", yearsLabel: "2–4 years", annual: 33487, hourly: 17.13 },
      { label: "Top", yearsLabel: "4+ years", annual: 37796, hourly: 19.33 },
    ],
  },
  {
    band: "Band 6",
    roles: "Senior nurses, specialist practitioners, team leaders",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 38682, hourly: 19.78 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 40823, hourly: 20.88 },
      { label: "Top", yearsLabel: "5+ years", annual: 46580, hourly: 23.82 },
    ],
  },
  {
    band: "Band 7",
    roles: "Advanced practitioners, ward managers, principal AHPs",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 47810, hourly: 24.45 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 50273, hourly: 25.71 },
      { label: "Top", yearsLabel: "5+ years", annual: 54710, hourly: 27.98 },
    ],
  },
  {
    band: "Band 8a",
    roles: "Matrons, consultant nurses, service managers",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 55690, hourly: 28.48 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 58487, hourly: 29.91 },
      { label: "Top", yearsLabel: "5+ years", annual: 62682, hourly: 32.06 },
    ],
  },
  {
    band: "Band 8b",
    roles: "Senior matrons, heads of service, consultant practitioners",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 64455, hourly: 32.96 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 68631, hourly: 35.1 },
      { label: "Top", yearsLabel: "5+ years", annual: 74896, hourly: 38.3 },
    ],
  },
  {
    band: "Band 8c",
    roles: "Associate directors, heads of nursing, clinical directors",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 76965, hourly: 39.36 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 81652, hourly: 41.76 },
      { label: "Top", yearsLabel: "5+ years", annual: 88682, hourly: 45.35 },
    ],
  },
  {
    band: "Band 8d",
    roles: "Chief nurses, divisional directors, senior executives",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 91342, hourly: 46.71 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 96941, hourly: 49.58 },
      { label: "Top", yearsLabel: "5+ years", annual: 105337, hourly: 53.87 },
    ],
  },
  {
    band: "Band 9",
    roles: "Directors of nursing, chief officers, executive leads",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 109179, hourly: 55.84 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 115763, hourly: 59.2 },
      { label: "Top", yearsLabel: "5+ years", annual: 125637, hourly: 64.25 },
    ],
  },
];

export interface NhsPensionTier {
  /** Inclusive lower bound of actual annual pensionable pay, £. */
  min: number;
  /** Inclusive upper bound, £; Infinity for the top tier. */
  max: number;
  /** Flat contribution rate, % of all pensionable pay. */
  ratePercent: number;
}

export const NHS_PENSION_TIERS: NhsPensionTier[] = [
  { min: 0, max: 13259, ratePercent: 5.2 },
  { min: 13260, max: 27797, ratePercent: 6.5 },
  { min: 27798, max: 33868, ratePercent: 8.3 },
  { min: 33869, max: 50845, ratePercent: 9.8 },
  { min: 50846, max: 65190, ratePercent: 10.7 },
  { min: 65191, max: Infinity, ratePercent: 12.5 },
];

export function nhsPensionRateFor(pensionablePay: number): number {
  const tier = NHS_PENSION_TIERS.find(
    (t) => pensionablePay >= t.min && pensionablePay <= t.max,
  );
  return tier ? tier.ratePercent : 12.5;
}

export interface NhsPayInput {
  bandIndex: number;
  stepIndex: number;
  /** Contracted hours per week; 37.5 is full time. */
  hoursPerWeek: number;
  /** Pension contribution, % of pensionable pay (editable on the page). */
  pensionRatePercent: number;
}

export interface NhsPayResult {
  band: string;
  stepLabel: string;
  /** Full-time-equivalent annual salary for the chosen step, £. */
  fullTimeAnnual: number;
  /** Official full-time hourly rate for the chosen step, £. */
  hourlyRate: number;
  /** Pro-rata gross annual pay at the chosen hours, £. */
  grossAnnual: number;
  grossMonthly: number;
  grossWeekly: number;
  pensionAnnual: number;
  pensionMonthly: number;
  incomeTax: number;
  employeeNationalInsurance: number;
  /** Estimated take-home pay. */
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateNhsPay(input: NhsPayInput): NhsPayResult {
  const band = AFC_BANDS[input.bandIndex] ?? AFC_BANDS[4];
  const step = band.steps[input.stepIndex] ?? band.steps[0];
  const hours = Math.min(Math.max(input.hoursPerWeek || 0, 0), 80);
  const fte = hours / NHS_FULL_TIME_HOURS;

  const gross = step.annual * fte;
  const pensionRate = Math.min(Math.max(input.pensionRatePercent || 0, 0), 100);
  const pension = (gross * pensionRate) / 100;

  // Net pay arrangement: tax is charged after pension, NI on full gross.
  const tax = incomeTaxFor(Math.max(0, gross - pension));
  const ni = employeeNiFor(gross);
  const net = gross - pension - tax - ni;

  return {
    band: band.band,
    stepLabel: step.label,
    fullTimeAnnual: step.annual,
    hourlyRate: step.hourly,
    grossAnnual: round2(gross),
    grossMonthly: round2(gross / 12),
    grossWeekly: round2(gross / 52),
    pensionAnnual: round2(pension),
    pensionMonthly: round2(pension / 12),
    incomeTax: round2(tax),
    employeeNationalInsurance: round2(ni),
    netAnnual: round2(net),
    netMonthly: round2(net / 12),
    netWeekly: round2(net / 52),
  };
}
