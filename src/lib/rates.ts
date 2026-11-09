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


/**
 * Statutory Paternity Pay (SPP) — weekly amount.
 *
 * 2026/27: the LOWER of £194.32 a week or 90% of the employee's average
 * weekly earnings — the same statutory flat rate as SMP. Verified against
 * GOV.UK "Rates and thresholds for employers 2026 to 2027" on
 * 7 November 2026. (The 2025/26 flat rate was £187.18 — do not use it.)
 *
 * SPP is paid for one or two weeks, chosen by the employee. Since April
 * 2024 the two weeks can be taken as one block of two, or as two separate
 * blocks of one week, at any point in the first year after the birth or
 * adoption placement.
 */
export const SPP = {
  /** Flat statutory weekly rate, £/week (shared with SMP for 2026/27). */
  weeklyRate: 194.32,
  /** Earnings-related fraction of average weekly earnings. */
  aweFraction: 0.9,
  /** Maximum number of weeks SPP can be paid. */
  maxWeeks: 2,
} as const;

/**
 * Statutory Maternity Pay (SMP) structure — April 2026 rules.
 *
 * SMP is payable for up to 39 weeks:
 *   - weeks 1–6:  90% of average weekly earnings (no cap)
 *   - weeks 7–39: the LOWER of £194.32 a week or 90% of average weekly
 *     earnings
 * Weeks 40–52 of maternity leave are unpaid (statutory leave is 52 weeks).
 *
 * Eligibility (employer guide, GOV.UK): the employee must have been
 * continuously employed by the same employer for at least 26 weeks by the
 * 15th week before the expected week of childbirth, and their average
 * weekly earnings in the relevant 8-week period must be at least the
 * Lower Earnings Limit (£129 a week for 2026/27, from the same GOV.UK
 * rates page, verified 7 November 2026).
 */
export const MATERNITY = {
  /** Weeks paid at 90% of average weekly earnings. */
  earningsRelatedWeeks: 6,
  /** Total weeks SMP is payable (including the earnings-related weeks). */
  totalPaidWeeks: 39,
  /** Statutory maternity leave length in weeks (paid + unpaid). */
  leaveWeeks: 52,
  /** Earnings fraction used for both SMP stages. */
  aweFraction: 0.9,
  /** Lower Earnings Limit — minimum AWE to qualify for SMP, £/week. */
  lowerEarningsLimitWeekly: 129,
} as const;

/**
 * NHS occupational maternity pay — Agenda for Change (Section 15).
 *
 * For NHS staff who qualify for occupational maternity pay (broadly: 12
 * months' continuous NHS service by the 11th week before the expected
 * week of childbirth, and an intention to return to NHS work):
 *   - weeks 1–8:   full pay (average weekly earnings)
 *   - weeks 9–26:  half pay PLUS SMP, provided the total does not exceed
 *     full pay
 *   - weeks 27–39: SMP only (the flat statutory stage amount)
 *   - weeks 40–52: unpaid
 * The SMP element inside the half-pay stage is the same statutory weekly
 * amount used above (the lower of £194.32 or 90% of AWE).
 */
export const NHS_MATERNITY = {
  /** Weeks at full pay. */
  fullPayWeeks: 8,
  /** Last week of the half-pay + SMP stage. */
  halfPayEndWeek: 26,
} as const;

/**
 * Income Tax — England, Wales and Northern Ireland, 2026/27.
 *
 * Verified against GOV.UK ("Income Tax rates and Personal Allowances"
 * and "Rates and thresholds for employers 2026 to 2027") on
 * 7 November 2026:
 *   - Personal Allowance: £12,570, reduced by £1 for every £2 of income
 *     over £100,000, reaching zero at £125,140.
 *   - Basic rate 20% on the first £37,700 of taxable income (income up
 *     to £50,270 with a full Personal Allowance).
 *   - Higher rate 40% above that, up to £125,140 of income.
 *   - Additional rate 45% on income over £125,140. (At that income the
 *     Personal Allowance is already zero, so the threshold applies to
 *     taxable income unchanged.)
 * Scotland has different bands — this hub's take-home calculator covers
 * England, Wales and Northern Ireland only and says so on the page.
 */
export const INCOME_TAX = {
  personalAllowance: 12570,
  allowanceTaperThreshold: 100000,
  /** Width of the basic-rate band, measured in taxable income. */
  basicRateBand: 37700,
  basicRate: 0.2,
  higherRate: 0.4,
  /** Income level where the additional rate starts. */
  additionalRateThreshold: 125140,
  additionalRate: 0.45,
} as const;

/**
 * Employee (primary) Class 1 National Insurance — 2026/27.
 *
 * Verified against GOV.UK "Rates and thresholds for employers 2026 to
 * 2027" on 7 November 2026 (category A): 0% up to the Primary Threshold
 * (£12,570 a year), 8% from the Primary Threshold up to the Upper
 * Earnings Limit (£50,270 a year), 2% on earnings above that.
 */
export const EMPLOYEE_NI = {
  primaryThresholdAnnual: 12570,
  upperEarningsLimitAnnual: 50270,
  mainRate: 0.08,
  additionalRate: 0.02,
} as const;

/** Dating label for take-home (PAYE) figures (2026/27 — GOV.UK-verified). */
export const PAYE_RATES_LABEL = "2026/27 rates — verified against GOV.UK";

/** Date the PAYE figures above were verified against GOV.UK. */
export const PAYE_RATES_VERIFIED = "7 November 2026";

/**
 * Corporation Tax — company profits.
 *
 * Verified against GOV.UK ("Corporation Tax rates, expenses and
 * reliefs") on 9 November 2026: the main rate is 25% on profits
 * over £250,000; the small profits rate is 19% on profits of
 * £50,000 or less; Marginal Relief applies between the two, at
 * a fraction of 3/200 of (£250,000 − profit).
 */
export const CORPORATION_TAX = {
  /** Main rate on profits over the main-rate limit. */
  mainRate: 0.25,
  /** Profit above which the main rate applies, £. */
  mainRateLimit: 250000,
  /** Small profits rate on profits at or below the limit. */
  smallProfitsRate: 0.19,
  /** Profit at or below which the small profits rate applies, £. */
  smallProfitsLimit: 50000,
  /** Marginal Relief fraction (3/200). */
  marginalReliefFraction: 0.015,
} as const;

/** Date the Corporation Tax figures above were verified against GOV.UK. */
export const CORPORATION_TAX_RATES_VERIFIED = "9 November 2026";

/**
 * Tax on dividends — 2026/27.
 *
 * Verified against GOV.UK ("Tax on dividends") on 9 November
 * 2026: a £500 dividend allowance each year, then 10.75% at the
 * basic rate, 35.75% at the higher rate and 39.35% at the
 * additional rate. Dividends are the top slice of income —
 * employment income is taxed first — and the Personal Allowance
 * covers dividend income that falls within it.
 */
export const DIVIDEND_TAX = {
  /** Dividend allowance, £/year, taxed at 0%. */
  allowance: 500,
  /** Basic-rate dividend tax. */
  basicRate: 0.1075,
  /** Higher-rate dividend tax. */
  higherRate: 0.3575,
  /** Additional-rate dividend tax. */
  additionalRate: 0.3935,
} as const;

/** Date the dividend tax figures above were verified against GOV.UK. */
export const DIVIDEND_TAX_RATES_VERIFIED = "9 November 2026";
