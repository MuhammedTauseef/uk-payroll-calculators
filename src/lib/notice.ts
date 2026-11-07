/**
 * Statutory minimum notice — Employment Rights Act 1996, section 86.
 *
 * Employer giving notice:
 *   - under 1 month's service: no statutory minimum (the contract rules)
 *   - 1 month to 2 years' service: 1 week
 *   - 2+ years: 1 week per complete year of service, capped at 12 weeks
 *
 * Employee giving notice:
 *   - under 1 month's service: no statutory minimum
 *   - 1 month or more: 1 week (it does not rise with service)
 *
 * The contract's notice period applies when it is LONGER than the statutory
 * minimum; the effective notice is always the longer of the two. Notice
 * runs from the day AFTER it is given, so the earliest last working day is
 * the notice date plus the effective notice period.
 *
 * These are rules of law, not rates — they do not live in rates.ts and do
 * not change each April.
 */

export type NoticeGiver = "employer" | "employee";
export type NoticeUnit = "weeks" | "months";

export interface NoticeInput {
  /** Who is giving notice: the employer or the employee. */
  whoGivesNotice: NoticeGiver;
  /** First day of employment, ISO date (yyyy-mm-dd). */
  employmentStartDate: string;
  /** Date notice is given, ISO date (yyyy-mm-dd). */
  noticeDate: string;
  /** Notice period stated in the contract (0 if the contract says none). */
  contractNoticeValue: number;
  /** Unit of the contract notice period. Months convert at 52/12 weeks. */
  contractNoticeUnit: NoticeUnit;
}

export interface NoticeResult {
  /** Complete months of service at the notice date. */
  serviceCompleteMonths: number;
  /** Complete years of service at the notice date. */
  serviceCompleteYears: number;
  /** Statutory minimum notice, in weeks (rounded to 2 dp). */
  statutoryWeeks: number;
  /** Contract notice converted to weeks (rounded to 2 dp). */
  contractWeeks: number;
  /** The notice that actually applies — the longer of the two (2 dp). */
  effectiveWeeks: number;
  /** Which figure produced the effective notice. */
  effectiveSource: "statutory" | "contract" | "equal";
  /** Effective notice in whole days (effective weeks × 7, rounded). */
  effectiveDays: number;
  /** Earliest last working day, ISO date; null if a date was invalid. */
  lastWorkingDay: string | null;
}

/** Weeks in one month for the contract conversion: 52 weeks ÷ 12 months. */
export const WEEKS_PER_MONTH = 52 / 12;
/** The employer's statutory notice is capped at 12 weeks (s.86). */
export const MAX_EMPLOYER_STATUTORY_WEEKS = 12;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface Ymd {
  y: number;
  m: number;
  d: number;
}

function parseIsoDate(iso: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const ymd = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  if (ymd.m < 1 || ymd.m > 12 || ymd.d < 1 || ymd.d > 31) return null;
  return ymd;
}

function toUtcMs({ y, m, d }: Ymd): number {
  return Date.UTC(y, m - 1, d);
}

function toIso({ y, m, d }: Ymd): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addDays(date: Ymd, days: number): Ymd {
  const dt = new Date(toUtcMs(date) + days * 86_400_000);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

/** Complete calendar months between the start date and the notice date. */
export function completeMonthsOfService(start: Ymd, end: Ymd): number {
  if (toUtcMs(end) <= toUtcMs(start)) return 0;
  let months = (end.y - start.y) * 12 + (end.m - start.m);
  if (end.d < start.d) months -= 1;
  return Math.max(0, months);
}

/** Statutory minimum notice in weeks under s.86 for the given service. */
export function statutoryNoticeWeeks(
  whoGivesNotice: NoticeGiver,
  serviceCompleteMonths: number,
): number {
  if (serviceCompleteMonths < 1) return 0;
  if (whoGivesNotice === "employee") return 1;
  const years = Math.floor(serviceCompleteMonths / 12);
  if (years < 2) return 1;
  return Math.min(years, MAX_EMPLOYER_STATUTORY_WEEKS);
}

/** Convert a contract notice period to weeks. */
export function contractNoticeInWeeks(value: number, unit: NoticeUnit): number {
  const v = Math.max(0, value || 0);
  return unit === "months" ? v * WEEKS_PER_MONTH : v;
}

export function calculateNotice(input: NoticeInput): NoticeResult {
  const start = parseIsoDate(input.employmentStartDate);
  const notice = parseIsoDate(input.noticeDate);

  const serviceCompleteMonths =
    start && notice ? completeMonthsOfService(start, notice) : 0;
  const serviceCompleteYears = Math.floor(serviceCompleteMonths / 12);

  const statutoryExact = statutoryNoticeWeeks(
    input.whoGivesNotice,
    serviceCompleteMonths,
  );
  const contractExact = contractNoticeInWeeks(
    input.contractNoticeValue,
    input.contractNoticeUnit,
  );

  const effectiveExact = Math.max(statutoryExact, contractExact);
  const effectiveSource: NoticeResult["effectiveSource"] =
    statutoryExact === contractExact
      ? "equal"
      : statutoryExact > contractExact
        ? "statutory"
        : "contract";
  const effectiveDays = Math.round(effectiveExact * 7);

  return {
    serviceCompleteMonths,
    serviceCompleteYears,
    statutoryWeeks: round2(statutoryExact),
    contractWeeks: round2(contractExact),
    effectiveWeeks: round2(effectiveExact),
    effectiveSource,
    effectiveDays,
    // Notice runs from the day after it is given: last working day is the
    // notice date plus the whole effective period.
    lastWorkingDay: notice ? toIso(addDays(notice, effectiveDays)) : null,
  };
}

/** "Monday 6 April 2026" — UK long format for an ISO date. */
export function formatDateGB(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(toUtcMs(parsed)));
}
