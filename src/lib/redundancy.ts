import { REDUNDANCY } from "./rates.ts";

/**
 * Statutory redundancy pay — England, Scotland and Wales (Employment
 * Rights Act 1996, Part XI), plus the two figures people almost always
 * need alongside it: statutory notice pay and the £30,000 tax-free
 * termination-payments check.
 *
 * The statutory formula (GOV.UK "Redundancy pay" and the employer's
 * guide, verified 20 November 2026):
 *   - The employee needs at least 2 complete years of continuous
 *     service to qualify at all.
 *   - Count COMPLETE years of service BACKWARDS from the relevant date
 *     (normally the date the employment ends), at most 20 years.
 *   - Each complete year earns weeks of pay by the employee's age
 *     during that year. GOV.UK's own worked examples (and the NIDirect
 *     examples, which use the same GB formula) pin down the exact
 *     convention: the band is set by the employee's age at the START
 *     of that year of service. A 45-year-old with 15 years of service
 *     has 4 years in the 41-and-over band (the years that began at
 *     ages 41, 42, 43 and 44) and 11 years in the 22-to-40 band:
 *     4 × 1.5 + 11 × 1 = 17 weeks.
 *       under 22 → 0.5 week's pay
 *       22 to 40 → 1 week's pay
 *       41 and over → 1.5 weeks' pay
 *   - A week's pay is gross weekly pay capped at £751 for dismissals
 *     on or after 6 April 2026 (REDUNDANCY.weeklyPayCap). The maximum
 *     statutory payment is 30 weeks × £751 = £22,530.
 *   - Statutory redundancy pay itself is tax-free. Termination
 *     payments as a whole (redundancy pay plus ex-gratia amounts, but
 *     NOT pay in lieu of notice, which is taxed as earnings) are
 *     tax-free up to £30,000 combined; anything above that is taxed.
 *   - Statutory minimum notice from the employer: 1 week after one
 *     month's service, then 1 week for each complete year of service
 *     from 2 to 12 years, and 12 weeks for 12 or more years.
 *
 * Northern Ireland uses a different weekly cap (£783 from April 2026),
 * so this calculator is for England, Scotland and Wales and says so.
 */

export interface RedundancyInput {
  /** Date of birth, ISO yyyy-mm-dd. */
  dateOfBirth: string;
  /** First day of employment, ISO yyyy-mm-dd. */
  employmentStart: string;
  /** Date the employment ends (the relevant date), ISO yyyy-mm-dd. */
  employmentEnd: string;
  /** Gross weekly pay before tax, £. */
  grossWeeklyPay: number;
  /**
   * Other tax-free-eligible termination payments (ex-gratia amounts,
   * settlement sums — NOT notice pay), £. Used only for the £30,000
   * tax-free allowance check.
   */
  otherTerminationPayments: number;
}

export interface RedundancyYearRow {
  /** The service year, most recent first: "Year 1 (most recent)". */
  label: string;
  /** Age at the start of that year of service. */
  ageAtStart: number;
  /** Weeks of pay that year earns: 0.5, 1 or 1.5. */
  weeksEarned: number;
}

export interface RedundancyResult {
  /** Complete years of service between the two dates (uncapped). */
  completeYears: number;
  /** Years that count after the 20-year cap. */
  countedYears: number;
  /** True when the employee meets the 2-year qualifying rule. */
  qualifies: boolean;
  /** Year-by-year band split, most recent year first. */
  yearRows: RedundancyYearRow[];
  /** Years counted in each age band. */
  yearsUnder22: number;
  years22to40: number;
  years41plus: number;
  /** Total weeks of pay the counted service earns. */
  totalWeeks: number;
  /** The week's pay actually used, after the statutory cap. */
  weeksPayUsed: number;
  /** True when the entered weekly pay was above the cap. */
  capApplied: boolean;
  /** Statutory redundancy pay, £. */
  statutoryPay: number;
  /** Statutory minimum notice from the employer, in weeks. */
  noticeWeeks: number;
  /** Statutory notice pay at the entered week's pay (uncapped), £. */
  noticePay: number;
  /** Redundancy pay + other termination payments, £. */
  totalTerminationPayments: number;
  /** How much of the £30,000 tax-free allowance the package uses, £. */
  taxFreeUsed: number;
  /** Amount above the £30,000 limit — taxable as earnings, £. */
  taxableExcess: number;
}

/** Combined tax-free limit for termination payments, £ (ITEPA 2003 s.403). */
export const TERMINATION_TAX_FREE_LIMIT = 30000;

/** Maximum complete years of service that count. */
export const MAX_COUNTED_YEARS = 20;

/** Minimum complete years of service to qualify. */
export const MIN_QUALIFYING_YEARS = 2;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseIsoDate(value: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function toUtc(d: DateParts): number {
  return Date.UTC(d.year, d.month - 1, d.day);
}

const YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000;

/** Complete years between two dates (anniversaries reached). */
export function completeYearsBetween(start: DateParts, end: DateParts): number {
  let years = end.year - start.year;
  const anniversary = Date.UTC(end.year, start.month - 1, start.day);
  if (toUtc(end) < anniversary) years -= 1;
  return Math.max(0, years);
}

/** Age in complete years on a given date. */
export function ageOn(dob: DateParts, on: DateParts): number {
  return completeYearsBetween(dob, on);
}

/** Subtract whole years from a date (29 Feb clamps to 28 Feb). */
function minusYears(d: DateParts, years: number): DateParts {
  const year = d.year - years;
  const day = Math.min(d.day, daysInMonth(year, d.month));
  return { year, month: d.month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Weeks of pay one service year earns, by age at its start. */
export function weeksForAge(ageAtStart: number): number {
  if (ageAtStart < 22) return 0.5;
  if (ageAtStart <= 40) return 1;
  return 1.5;
}

/** Statutory minimum notice (weeks) owed by the employer. */
export function statutoryNoticeWeeks(completeYears: number): number {
  if (completeYears < 1) {
    // One month to two years of service still earns 1 week — that
    // depends on months, which the caller cannot see from complete
    // years alone; the page words it as "at least 1 week once you
    // have a month's service". completeYears here is whole years, so
    // under 1 year we return 1 as the statutory floor after a month.
    return 1;
  }
  return Math.min(12, completeYears);
}

export function calculateRedundancy(input: RedundancyInput): RedundancyResult {
  const dob = parseIsoDate(input.dateOfBirth);
  const start = parseIsoDate(input.employmentStart);
  const end = parseIsoDate(input.employmentEnd);
  const weeklyPay = Math.max(0, input.grossWeeklyPay || 0);
  const otherPayments = Math.max(0, input.otherTerminationPayments || 0);

  const empty: RedundancyResult = {
    completeYears: 0,
    countedYears: 0,
    qualifies: false,
    yearRows: [],
    yearsUnder22: 0,
    years22to40: 0,
    years41plus: 0,
    totalWeeks: 0,
    weeksPayUsed: Math.min(weeklyPay, REDUNDANCY.weeklyPayCap),
    capApplied: weeklyPay > REDUNDANCY.weeklyPayCap,
    statutoryPay: 0,
    noticeWeeks: 0,
    noticePay: 0,
    totalTerminationPayments: round2(otherPayments),
    taxFreeUsed: round2(Math.min(otherPayments, TERMINATION_TAX_FREE_LIMIT)),
    taxableExcess: round2(
      Math.max(0, otherPayments - TERMINATION_TAX_FREE_LIMIT),
    ),
  };

  if (!dob || !start || !end) return empty;
  if (toUtc(end) <= toUtc(start) || toUtc(start) < toUtc(dob)) return empty;

  const completeYears = completeYearsBetween(start, end);
  const countedYears = Math.min(MAX_COUNTED_YEARS, completeYears);
  const qualifies = completeYears >= MIN_QUALIFYING_YEARS;

  const yearRows: RedundancyYearRow[] = [];
  let yearsUnder22 = 0;
  let years22to40 = 0;
  let years41plus = 0;
  let totalWeeks = 0;

  for (let k = 0; k < countedYears; k += 1) {
    // The year of service that ended k years before the end date
    // began (k + 1) years before it. Its band is set by the age at
    // that start date.
    const yearStart = minusYears(end, k + 1);
    const ageAtStart = ageOn(dob, yearStart);
    const weeks = weeksForAge(ageAtStart);
    if (ageAtStart < 22) yearsUnder22 += 1;
    else if (ageAtStart <= 40) years22to40 += 1;
    else years41plus += 1;
    totalWeeks += weeks;
    yearRows.push({
      label:
        k === 0
          ? "Most recent year"
          : k === countedYears - 1
            ? "Earliest counted year"
            : `${k + 1} years ago`,
      ageAtStart,
      weeksEarned: weeks,
    });
  }

  const weeksPayUsed = Math.min(weeklyPay, REDUNDANCY.weeklyPayCap);
  const statutoryPay = qualifies ? round2(totalWeeks * weeksPayUsed) : 0;
  const noticeWeeks = statutoryNoticeWeeks(completeYears);
  const noticePay = round2(noticeWeeks * weeklyPay);
  const totalTerminationPayments = round2(statutoryPay + otherPayments);

  return {
    completeYears,
    countedYears,
    qualifies,
    yearRows,
    yearsUnder22,
    years22to40,
    years41plus,
    totalWeeks,
    weeksPayUsed,
    capApplied: weeklyPay > REDUNDANCY.weeklyPayCap,
    statutoryPay,
    noticeWeeks,
    noticePay,
    totalTerminationPayments,
    taxFreeUsed: round2(
      Math.min(totalTerminationPayments, TERMINATION_TAX_FREE_LIMIT),
    ),
    taxableExcess: round2(
      Math.max(0, totalTerminationPayments - TERMINATION_TAX_FREE_LIMIT),
    ),
  };
}

export { YEAR_MS };
