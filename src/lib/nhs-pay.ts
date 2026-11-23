import { employeeNiFor, incomeTaxFor } from "./takehome.ts";

/**
 * NHS Agenda for Change (AfC) pay — England, 2026/27.
 *
 * Pay values: NHS Employers, "Pay scales for 2026/27" (the official
 * Agenda for Change annual and hourly rates for England), fetched and
 * verified on 23 November 2026:
 *   https://www.nhsemployers.org/articles/pay-scales-202627
 * The 2026/27 award is a 3.3% consolidated uplift on all pay points
 * from 1 April 2026 — the government accepted the NHS Pay Review
 * Body's 39th report in full on 12 February 2026 (written statement
 * HCWS1340), so the uplift was in April 2026 pay with no backpay
 * arrears. Only the basic (non-London) rates are used — the High
 * Cost Area Supplement (HCAS) tables on the same page are NOT
 * included, and the page says so. Band 1 is closed to new entrants
 * and is not offered; the scale below starts at Band 2, as the
 * calculator spec requires.
 *
 * Pension tiers: NHS Pension Scheme member contribution rates for
 * 2026/27 (England and Wales), per NHSBSA "Cost of being in the
 * Scheme" — the tier thresholds are uprated by CPI from 1 April
 * 2026 — also verified 23 November 2026:
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
  "Agenda for Change pay scales 2026/27 (England) — NHS Employers";
export const AFC_SOURCE_URL =
  "https://www.nhsemployers.org/articles/pay-scales-202627";
export const AFC_LAST_VERIFIED = "23 November 2026";
export const NHS_FULL_TIME_HOURS = 37.5;

export const AFC_BANDS: NhsBand[] = [
  {
    band: "Band 2",
    roles: "Healthcare assistants, porters, receptionists, domestic staff",
    steps: [
      { label: "Entry", yearsLabel: "0+ years", annual: 25272, hourly: 12.92 },
    ],
  },
  {
    band: "Band 3",
    roles: "Senior healthcare assistants, medical secretaries, admin officers",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 25760, hourly: 13.17 },
      { label: "Top", yearsLabel: "2+ years", annual: 27476, hourly: 14.05 },
    ],
  },
  {
    band: "Band 4",
    roles: "Nursing associates, pharmacy technicians, associate practitioners",
    steps: [
      { label: "Entry", yearsLabel: "0–3 years", annual: 28392, hourly: 14.52 },
      { label: "Top", yearsLabel: "3+ years", annual: 31157, hourly: 15.93 },
    ],
  },
  {
    band: "Band 5",
    roles: "Newly qualified nurses, midwives, paramedics and AHPs",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 32073, hourly: 16.4 },
      { label: "Intermediate", yearsLabel: "2–4 years", annual: 34592, hourly: 17.69 },
      { label: "Top", yearsLabel: "4+ years", annual: 39043, hourly: 19.97 },
    ],
  },
  {
    band: "Band 6",
    roles: "Senior nurses, specialist practitioners, team leaders",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 39959, hourly: 20.44 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 42170, hourly: 21.57 },
      { label: "Top", yearsLabel: "5+ years", annual: 48117, hourly: 24.61 },
    ],
  },
  {
    band: "Band 7",
    roles: "Advanced practitioners, ward managers, principal AHPs",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 49387, hourly: 25.26 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 51932, hourly: 26.56 },
      { label: "Top", yearsLabel: "5+ years", annual: 56515, hourly: 28.9 },
    ],
  },
  {
    band: "Band 8a",
    roles: "Matrons, consultant nurses, service managers",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 57528, hourly: 29.42 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 60417, hourly: 30.9 },
      { label: "Top", yearsLabel: "5+ years", annual: 64750, hourly: 33.11 },
    ],
  },
  {
    band: "Band 8b",
    roles: "Senior matrons, heads of service, consultant practitioners",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 66582, hourly: 34.05 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 70896, hourly: 36.26 },
      { label: "Top", yearsLabel: "5+ years", annual: 77368, hourly: 39.57 },
    ],
  },
  {
    band: "Band 8c",
    roles: "Associate directors, heads of nursing, clinical directors",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 79504, hourly: 40.66 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 84346, hourly: 43.14 },
      { label: "Top", yearsLabel: "5+ years", annual: 91609, hourly: 46.85 },
    ],
  },
  {
    band: "Band 8d",
    roles: "Chief nurses, divisional directors, senior executives",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 94356, hourly: 48.26 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 100140, hourly: 51.21 },
      { label: "Top", yearsLabel: "5+ years", annual: 108814, hourly: 55.65 },
    ],
  },
  {
    band: "Band 9",
    roles: "Directors of nursing, chief officers, executive leads",
    steps: [
      { label: "Entry", yearsLabel: "0–2 years", annual: 112782, hourly: 57.68 },
      { label: "Intermediate", yearsLabel: "2–5 years", annual: 119583, hourly: 61.16 },
      { label: "Top", yearsLabel: "5+ years", annual: 129783, hourly: 66.37 },
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
  { min: 13260, max: 28854, ratePercent: 6.5 },
  { min: 28855, max: 35155, ratePercent: 8.3 },
  { min: 35156, max: 52778, ratePercent: 9.8 },
  { min: 52779, max: 67668, ratePercent: 10.7 },
  { min: 67669, max: Infinity, ratePercent: 12.5 },
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
