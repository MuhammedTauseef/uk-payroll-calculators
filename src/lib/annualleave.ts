/**
 * Annual leave (statutory holiday entitlement) maths — UK.
 *
 * Every rule below was verified against GOV.UK at build time
 * (9 November 2026):
 *   - "Holiday entitlement: entitlement"
 *     https://www.gov.uk/holiday-entitlement-rights
 *   - "Calculate holiday entitlement"
 *     https://www.gov.uk/calculate-your-holiday-entitlement
 *
 * The rules, as GOV.UK states them:
 *   - Almost all workers are legally entitled to 5.6 weeks' paid
 *     holiday a year (statutory leave / annual leave) — 28 days for
 *     someone working a 5-day week.
 *   - Part-time workers on regular hours get the same 5.6 weeks in
 *     their own pattern: days worked per week × 5.6 (GOV.UK's own
 *     example: 3 × 5.6 = 16.8 days a year).
 *   - Statutory entitlement is CAPPED at 28 days: staff working 6
 *     days a week are entitled to 28 days, not 33.6.
 *   - Bank holidays do NOT have to be given on top: an employer can
 *     include them as part of the 5.6 weeks.
 *   - Irregular-hours and part-year workers, for leave years
 *     beginning on or after 1 April 2024, accrue leave at 12.07% of
 *     the hours worked in each pay period. GOV.UK rounds accrued
 *     leave to the nearest whole hour, halves up — its own example:
 *     30 hours worked accrues 3.621 hours, booked as 4 hours.
 *   - Starting a job part-way through a leave year, only part of the
 *     year's entitlement applies: it builds up a twelfth at a time,
 *     and a worker starting part-way through a month accrues that
 *     month's twelfth from their first day (so the start month counts
 *     as a whole twelfth). GOV.UK rounds a part month's accrual up to
 *     the nearest half day (its example: 28 ÷ 12 = 2.33 days for the
 *     month, given as 2.5 days).
 *
 * These are rules of law (Working Time Regulations 1998, as amended),
 * not rates, so they live here rather than in rates.ts — the same
 * treatment as the 5.6-week rule in prorata.ts.
 */

export type AnnualLeaveMode = "regular" | "irregular";

/** Statutory minimum paid holiday, in weeks of the worker's own pattern. */
export const STATUTORY_LEAVE_WEEKS = 5.6;

/** Statutory entitlement is limited to this many days a year. */
export const MAX_STATUTORY_LEAVE_DAYS = 28;

/**
 * Accrual rate for irregular-hours and part-year workers (leave years
 * beginning on or after 1 April 2024): 12.07% of hours worked.
 * (12.07% is 5.6 weeks expressed against the 46.4 weeks actually
 * worked in a year: 5.6 ÷ 46.4 = 0.1207.)
 */
export const IRREGULAR_ACCRUAL_RATE = 0.1207;

/** The same rate as a percentage, for display (12.07). */
export const IRREGULAR_ACCRUAL_PERCENT = 12.07;

export interface AnnualLeaveInput {
  /** Regular hours (set days each week) or irregular hours / part-year. */
  mode: AnnualLeaveMode;
  /** Days worked per week in the regular-hours pattern (e.g. 5, 3, 2.5). */
  daysPerWeek: number;
  /**
   * Hours in one working day, used only to express the entitlement in
   * hours. 0 (or not given) means "no hours figures".
   */
  hoursPerDay: number;
  /** True when the job started part-way through the leave year. */
  startedPartWay: boolean;
  /** First day of the leave year, ISO yyyy-mm-dd. */
  leaveYearStart: string;
  /** First day of the job, ISO yyyy-mm-dd. */
  employmentStart: string;
  /** Whole/part days of leave already taken this leave year (regular). */
  daysAlreadyTaken: number;
  /** Hours actually worked in the pay period / so far (irregular). */
  hoursWorked: number;
  /** Hours of accrued leave already taken (irregular). */
  hoursAlreadyTaken: number;
}

export interface AnnualLeaveResult {
  mode: AnnualLeaveMode;

  // --- Regular-hours figures (null in irregular mode) ----------------
  /** Full-leave-year entitlement in days: 5.6 × days per week, capped at 28. */
  fullYearDays: number | null;
  /**
   * Twelfths of the leave year the worker is employed for: 12 for a
   * full year; the start month counts as a whole twelfth.
   */
  twelfthsRemaining: number | null;
  /** Entitlement for this leave year in days, after any part-year cut. */
  entitlementDays: number | null;
  /** Entitlement in hours (days × hours per day); null if no day length given. */
  entitlementHours: number | null;
  /** Days already taken, echoed. */
  daysTaken: number | null;
  /** entitlementDays − daysTaken (negative if more was taken than accrued). */
  remainingDays: number | null;
  /** Remaining entitlement in hours; null if no day length given. */
  remainingHours: number | null;

  // --- Irregular-hours figures (null in regular mode) ----------------
  /** Exact accrual: hours worked × 12.07%, to the nearest penny-hour (2dp). */
  accruedHoursExact: number | null;
  /**
   * The leave that can actually be booked: the exact accrual rounded
   * to the nearest whole hour, halves up — GOV.UK's rounding rule.
   */
  accruedHoursBooked: number | null;
  /** Hours of leave already taken, echoed. */
  hoursTaken: number | null;
  /** accruedHoursBooked − hoursTaken (negative if over-taken). */
  remainingHoursBooked: number | null;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round1(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/** Round UP to the nearest half day (GOV.UK's part-month treatment). */
function ceilHalfDay(n: number): number {
  return Math.ceil((n - Number.EPSILON) * 2) / 2;
}

/** Nearest whole hour, halves up (GOV.UK's accrued-leave rounding). */
function roundHourHalvesUp(n: number): number {
  return Math.floor(n + 0.5);
}

interface DateParts {
  year: number;
  month: number; // 1–12
  day: number;
}

function parseIsoDate(value: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function monthIndex(d: DateParts): number {
  return d.year * 12 + (d.month - 1);
}

/**
 * Twelfths of the leave year for which the worker is employed.
 * The leave year runs for 12 months from leaveYearStart. A worker in
 * post from on or before its first day gets all 12; otherwise the
 * months run from the start month (counted whole, per GOV.UK) to the
 * leave year's last month inclusive.
 */
export function twelfthsEmployed(
  leaveYearStart: string,
  employmentStart: string,
): number {
  const yearStart = parseIsoDate(leaveYearStart);
  const jobStart = parseIsoDate(employmentStart);
  if (!yearStart || !jobStart) return 12;

  const startIdx = monthIndex(yearStart);
  const endIdx = startIdx + 11; // last month of the leave year
  const jobIdx = monthIndex(jobStart);

  if (jobIdx <= startIdx) return 12;
  if (jobIdx > endIdx) return 0;
  return endIdx - jobIdx + 1;
}

export function calculateAnnualLeave(
  input: AnnualLeaveInput,
): AnnualLeaveResult {
  if (input.mode === "irregular") {
    const hoursWorked = positive(input.hoursWorked);
    const taken = positive(input.hoursAlreadyTaken);
    const exact = hoursWorked * IRREGULAR_ACCRUAL_RATE;
    const booked = roundHourHalvesUp(exact);
    return {
      mode: "irregular",
      fullYearDays: null,
      twelfthsRemaining: null,
      entitlementDays: null,
      entitlementHours: null,
      daysTaken: null,
      remainingDays: null,
      remainingHours: null,
      accruedHoursExact: round2(exact),
      accruedHoursBooked: booked,
      hoursTaken: taken,
      remainingHoursBooked: round2(booked - taken),
    };
  }

  const daysPerWeek = positive(input.daysPerWeek);
  const hoursPerDay = positive(input.hoursPerDay);
  const taken = positive(input.daysAlreadyTaken);

  // Full-year entitlement: 5.6 weeks of the worker's own pattern,
  // expressed in their working days, capped at the statutory 28 days.
  const fullYearExact = Math.min(
    MAX_STATUTORY_LEAVE_DAYS,
    STATUTORY_LEAVE_WEEKS * daysPerWeek,
  );
  const fullYearDays = round1(fullYearExact);

  const twelfths = input.startedPartWay
    ? twelfthsEmployed(input.leaveYearStart, input.employmentStart)
    : 12;

  // Part-year entitlement: the full-year figure scaled by the
  // twelfths employed for, rounded up to the nearest half day
  // (GOV.UK's treatment of part-month accruals). A full 12 twelfths
  // keeps the exact full-year figure — no rounding-up is applied to
  // a whole year.
  const entitlementDays =
    twelfths >= 12
      ? fullYearDays
      : round1(ceilHalfDay(fullYearExact * (twelfths / 12)));

  const remainingExact = entitlementDays - taken;

  return {
    mode: "regular",
    fullYearDays,
    twelfthsRemaining: twelfths,
    entitlementDays,
    entitlementHours:
      hoursPerDay > 0 ? round2(entitlementDays * hoursPerDay) : null,
    daysTaken: taken,
    remainingDays: round1(remainingExact),
    remainingHours:
      hoursPerDay > 0 ? round2(remainingExact * hoursPerDay) : null,
    accruedHoursExact: null,
    accruedHoursBooked: null,
    hoursTaken: null,
    remainingHoursBooked: null,
  };
}
