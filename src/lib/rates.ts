/**
 * Statutory rates and rule constants for the UK employer/payroll calculator hub.
 *
 * SINGLE SOURCE OF TRUTH for every calculator on this site.
 * If a rate changes, change it here only — never hard-code a rate in a page
 * or a component.
 *
 * Rules basis: April 2026 (2026/27) rules, re-verified against GOV.UK
 * on 7 November 2026 (the employer SSP and SMP guides, "Rates and
 * thresholds for employers 2026 to 2027", and the DWP automatic
 * enrolment thresholds review for 2026/27). Figures were first recorded
 * in the research record on 6 November 2026
 * (ssp-hub-full-research-2026-11-06.md).
 */

/** Human-readable dating shown wherever rates are displayed on the site. */
export const RATES_RULES_LABEL =
  "April 2026 rules — verified against GOV.UK";

/** Date the figures below were last verified against GOV.UK. */
export const RATES_LAST_VERIFIED = "7 November 2026";

/**
 * Statutory Sick Pay (SSP) — April 2026 rule change.
 *
 * From April 2026 the weekly SSP amount is the LOWER of:
 *   - the flat statutory rate (£123.25 per week), or
 *   - 80% of the employee's average weekly earnings (AWE).
 *
 * SSP is payable from the FIRST full day of sickness — the old "waiting
 * days" no longer apply — and there is NO lower earnings limit.
 * Maximum entitlement is 28 weeks in a period of incapacity for work
 * (linked periods of sickness count towards the same 28 weeks).
 */
export const SSP = {
  /** Flat statutory weekly rate, £/week. */
  weeklyCap: 123.25,
  /** Alternative weekly amount: this fraction of average weekly earnings. */
  aweFraction: 0.8,
  /** Maximum number of weeks SSP can be paid in one (linked) period. */
  maxWeeks: 28,
  /** SSP is payable from this day of the sickness spell (1 = first full day). */
  firstPayableDay: 1,
  /** April 2026 rules: no lower earnings limit applies. */
  lowerEarningsLimitApplies: false,
} as const;

/**
 * Statutory Maternity Pay (SMP) — flat weekly rate after the first 6 weeks.
 *
 * 2026/27 rate: £194.32 a week, applying from 5 April 2026, verified
 * against GOV.UK on 7 November 2026 ("Rates and thresholds for employers
 * 2026 to 2027" and the Statutory Maternity Pay employer guide). The
 * 2025/26 rate was £187.18 — do not use it for 2026/27.
 */
export const SMP = {
  weeklyRate: 194.32,
} as const;

/** Statutory redundancy pay caps (2026). */
export const REDUNDANCY = {
  /** Maximum amount of a week's pay that counts, £. */
  weeklyPayCap: 751,
  /** Maximum total statutory redundancy payment, £. */
  maxStatutoryPay: 22530,
} as const;

/** Employment Allowance — annual reduction in employer National Insurance. */
export const EMPLOYMENT_ALLOWANCE = {
  annualAmount: 10500,
} as const;

/**
 * Employer Class 1 National Insurance (secondary contributions).
 *
 * DATING: the April 2025 change set these figures (employer rate 15% on
 * earnings above a £5,000-a-year secondary threshold), and GOV.UK's
 * "Rates and thresholds for employers 2026 to 2027" confirms they are
 * UNCHANGED for 2026/27 — the same 15% rate, the same £5,000 secondary
 * threshold (£96 a week, £417 a month) and the same £50,270 upper
 * secondary threshold. Verified against GOV.UK on 7 November 2026.
 *
 * For employees under 21, and apprentices under 25, the employer rate is
 * 0% on earnings up to the upper secondary threshold (£50,270 a year);
 * the main rate applies to earnings above it.
 */
export const EMPLOYER_NI = {
  /** Employer Class 1 rate on earnings above the threshold. */
  rate: 0.15,
  /** Secondary Threshold — earnings above this attract employer NICs, £/year. */
  secondaryThresholdAnnual: 5000,
  /** Upper secondary threshold for under-21s / apprentices under 25, £/year. */
  youngWorkerUpperThresholdAnnual: 50270,
} as const;

/** Dating label for employer NI figures (2026/27 — GOV.UK-verified). */
export const EMPLOYER_NI_RATES_LABEL =
  "2026/27 rates — verified against GOV.UK";

/** Date the employer NI figures above were verified against GOV.UK. */
export const EMPLOYER_NI_RATES_VERIFIED = "7 November 2026";

/**
 * Workplace pension — auto-enrolment employer minimum contribution.
 *
 * DATING: the employer minimum is 3% of qualifying earnings, and the
 * qualifying-earnings band runs from £6,240 to £50,270 a year. The
 * Department for Work and Pensions' annual review of the automatic
 * enrolment earnings trigger and qualifying earnings band (published on
 * GOV.UK) decided to maintain the existing values unchanged into
 * 2026/27, so these are the confirmed 2026/27 figures. Verified against
 * GOV.UK on 7 November 2026.
 *
 * Qualifying earnings for a salary are the slice of it inside the band:
 *   max(0, min(salary, £50,270) − £6,240)
 * The employer minimum contribution is 3% of that slice.
 */
export const PENSION = {
  /** Auto-enrolment employer minimum contribution rate. */
  employerMinimumRate: 0.03,
  /** Bottom of the qualifying-earnings band, £/year. */
  qualifyingEarningsLowerAnnual: 6240,
  /** Top of the qualifying-earnings band, £/year. */
  qualifyingEarningsUpperAnnual: 50270,
} as const;

/** Dating label for pension figures (2026/27 — GOV.UK-verified). */
export const PENSION_RATES_LABEL =
  "2026/27 rates — verified against GOV.UK";

/** Date the pension figures above were verified against GOV.UK. */
export const PENSION_RATES_VERIFIED = "7 November 2026";
