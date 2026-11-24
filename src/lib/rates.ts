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

/**
 * Marriage Allowance — 2026/27.
 *
 * Verified against GOV.UK ("Marriage Allowance: How it works" and
 * the Marriage Allowance application service) on 22 November 2026:
 *   - The lower earner transfers £1,260 of their Personal
 *     Allowance (10% of £12,570, rounded up) to their spouse or
 *     civil partner, cutting the recipient's tax by up to £252
 *     (20% of £1,260) in the tax year.
 *   - The transferor's own allowance falls to £11,310, so a
 *     transferor earning between £11,310 and £12,570 starts
 *     paying tax on the slice above £11,310.
 *   - Conditions: married or in a civil partnership; the
 *     transferor's income below the Personal Allowance; the
 *     recipient a basic-rate taxpayer — income £12,571 to
 *     £50,270 in England, Wales and Northern Ireland, or
 *     £12,571 to £43,662 in Scotland (starter, basic or
 *     intermediate rate).
 *   - Claims can be backdated to 6 April 2022 (the 2022/23 tax
 *     year). The Personal Allowance and the £1,260 transfer were
 *     the same in every year back to 2022/23, so each backdated
 *     year is worth up to £252; the 2022/23 claim deadline is
 *     5 April 2027.
 *   - Tax codes after a claim: 1383M for the recipient, 1131N
 *     for the transferor.
 *   - Couples where one partner was born before 6 April 1935
 *     may do better with Married Couple's Allowance instead;
 *     the two cannot be claimed together.
 */
export const MARRIAGE_ALLOWANCE = {
  /** Amount of Personal Allowance transferred, £/year. */
  transferAmount: 1260,
  /** Maximum tax saving for the recipient, £/year (20% of the transfer). */
  maxSaving: 252,
  /** Transferor's Personal Allowance after the transfer, £/year. */
  transferorAllowanceAfter: 11310,
  /** Top of the recipient's basic-rate band, England/Wales/NI, £/year. */
  recipientLimitEWNI: 50270,
  /** Top of the recipient's intermediate band, Scotland, £/year. */
  recipientLimitScotland: 43662,
  /** Tax codes HMRC issues after a successful claim. */
  recipientTaxCode: "1383M",
  transferorTaxCode: "1131N",
  /** Backdatable tax years, oldest first, with each year's maximum saving. */
  backdateYears: [
    { label: "2022/23", maxSaving: 252, claimDeadline: "5 April 2027" },
    { label: "2023/24", maxSaving: 252, claimDeadline: "5 April 2028" },
    { label: "2024/25", maxSaving: 252, claimDeadline: "5 April 2029" },
    { label: "2025/26", maxSaving: 252, claimDeadline: "5 April 2030" },
  ],
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
export const CORPORATION_TAX_RATES_VERIFIED = "23 November 2026";

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

/**
 * Statutory Neonatal Care Pay (SNCP) — Neonatal Care (Leave and
 * Pay) Act 2023, in force for babies born on or after 6 April 2025.
 *
 * Verified against GOV.UK on 24 November 2026 ("Statutory Neonatal
 * Care Pay and Leave: employer guide", "Manually calculate
 * Statutory Neonatal Care Pay", and "Rates and thresholds for
 * employers 2025 to 2026" / "2026 to 2027"):
 *   - One week of leave and pay for every 7 consecutive full days
 *     the baby spends in neonatal care (care starting within 28
 *     days of birth), up to 12 weeks, taken within 68 weeks of the
 *     birth. Leave is a day-one right.
 *   - Every week of pay is the LOWER of the tax year's flat rate
 *     or 90% of average weekly earnings — there is NO higher-rate
 *     opening stage, unlike SMP.
 *   - Pay needs 26 weeks' continuous service ending with the
 *     qualifying week, and average weekly earnings at or above
 *     the Lower Earnings Limit (£125 a week in 2025/26, £129 in
 *     2026/27).
 *   - Employers recover SNCP from HMRC: 92%, or with Small
 *     Employers' Relief (total Class 1 NICs of £45,000 or less in
 *     the previous tax year) 108.5% in 2025/26 and 109% in 2026/27
 *     — the compensation rate rose from 8.5% to 9% on 6 April 2026.
 */
export const NEONATAL = {
  /** Maximum weeks of leave and pay. */
  maxWeeks: 12,
  /** Earnings fraction used in every week. */
  aweFraction: 0.9,
  /** Minimum consecutive days in neonatal care to earn a week. */
  minDaysInCare: 7,
  /** Care must start within this many days of the birth. */
  careStartWindowDays: 28,
  /** Scheme applies to babies born on or after this date, ISO. */
  schemeStartDate: "2025-04-06",
  /** All leave must be taken within this many weeks of the birth. */
  leaveWindowWeeks: 68,
  /** Standard employer recovery rate from HMRC. */
  standardRecovery: 0.92,
  years: {
    "2025-26": {
      /** Flat statutory weekly rate, £/week. */
      weeklyRate: 187.18,
      /** Lower Earnings Limit, £/week. */
      lowerEarningsLimitWeekly: 125,
      /** Recovery with Small Employers' Relief (100% + 8.5%). */
      smallEmployerRecovery: 1.085,
    },
    "2026-27": {
      /** Flat statutory weekly rate, £/week. */
      weeklyRate: 194.32,
      /** Lower Earnings Limit, £/week. */
      lowerEarningsLimitWeekly: 129,
      /** Recovery with Small Employers' Relief (100% + 9%). */
      smallEmployerRecovery: 1.09,
    },
  },
} as const;

/** Tax years the neonatal calculator supports. */
export type NeonatalTaxYear = keyof typeof NEONATAL.years;

/**
 * Construction Industry Scheme (CIS) — deduction rates and the
 * monthly admin deadlines.
 *
 * Verified against GOV.UK on 24 November 2026 ("Construction
 * Industry Scheme: contractor guide" and "Construction Industry
 * Scheme: subcontractor guide", plus the policy paper
 * "Simplification and administrative improvements to the
 * Construction Industry Scheme"):
 *   - Contractors deduct 20% from payments to subcontractors who
 *     are registered for CIS and verified, 30% where the
 *     subcontractor is not registered or cannot be verified, and
 *     nothing (0%) where the subcontractor holds gross payment
 *     status. HMRC tells the contractor which rate applies at
 *     verification — the contractor does not choose.
 *   - The deduction applies to the LABOUR element only: VAT,
 *     materials at direct cost, consumable stores, fuel other
 *     than for travelling, plant hire and materials used in
 *     manufacturing or prefabricating materials are all taken off
 *     the payment first. Travel and subsistence recharged stay in.
 *   - The rates are unchanged for 2026/27; the April 2026 changes
 *     were administrative (nil CIS300 returns reinstated, payments
 *     to local authorities and certain public bodies exempted) and
 *     anti-fraud (Finance Act 2026).
 *   - Monthly cycle: the CIS300 return is due by the 19th of the
 *     following month, the deductions reach HMRC by the 22nd
 *     (19th by post), and each subcontractor's payment and
 *     deduction statement is due within 14 days of the end of the
 *     tax month (tax months run 6th to 5th). Records are kept for
 *     at least 3 years after the tax year they relate to.
 */
export const CIS = {
  /** Deduction rate for a registered, verified subcontractor. */
  standardRate: 0.2,
  /** Deduction rate for an unregistered / unverifiable subcontractor. */
  higherRate: 0.3,
  /** Deduction rate with gross payment status — no deduction. */
  grossRate: 0,
  /** CIS300 monthly return due day of the following month. */
  returnDueDay: 19,
  /** Deductions due to HMRC, electronic payment. */
  payDueDayElectronic: 22,
  /** Deductions due to HMRC, payment by post. */
  payDueDayPost: 19,
  /** Payment and deduction statement due within this many days of the tax month end. */
  statementDays: 14,
  /** Years CIS records must be kept after the tax year. */
  recordsYears: 3,
  /** A business spending more than this on construction in 12 months is a deemed contractor. */
  deemedContractorThreshold: 3000000,
  /** Work on the subcontractor's own property below this value (excl. materials) is exempt. */
  ownPropertyExemptionLimit: 1000,
  /** Gross payment status turnover test: net construction turnover per relevant person. */
  grossStatusTurnoverPerPerson: 30000,
  /** Gross payment status turnover test: whole-business alternative. */
  grossStatusTurnoverWholeBusiness: 100000,
} as const;

/** The three CIS payment statuses, keyed by the rate HMRC sets at verification. */
export type CisStatus = "verified" | "unverified" | "gross";
