/**
 * Pro-rata holiday entitlement maths — part-time patterns and
 * mid-year starters/leavers.
 *
 * This is the companion to annualleave.ts. That calculator starts
 * from the statutory 5.6 weeks for a regular pattern; this one starts
 * from the employer's own full-time entitlement (the contract figure,
 * usually 28 days including bank holidays) and pro-rates it — which
 * is the calculation employers and part-time staff actually ask for,
 * and the one the "pro rata holiday calculator" search asks for.
 *
 * The rules (Working Time Regulations 1998; GOV.UK "Holiday
 * entitlement: entitlement" and "Calculate holiday entitlement",
 * checked 16 November 2026):
 *
 *   - Contractual pro-rata: full-time entitlement × (employee days
 *     per week ÷ full-time days per week).
 *   - Statutory floor: whatever the contract maths gives, the worker
 *     must get at least 5.6 weeks of their own pattern — 5.6 × days
 *     per week, capped at 28 days. If the contract figure falls
 *     below the floor (a full-time entitlement under 28 days does
 *     this for some patterns), the floor replaces it. The result
 *     reports when the floor has been applied.
 *   - Mid-year starter or leaver: the full-year figure is scaled by
 *     twelfths of the leave year employed for — the same twelfths
 *     treatment GOV.UK uses on the annual leave calculator (the start
 *     month counts as a whole month), and the part-year figure is
 *     rounded up to the nearest half day.
 *   - Hours: entitlement in hours = entitlement days × hours in the
 *     employee's working day.
 *   - Irregular-hours and part-year workers are NOT this calculator's
 *     pattern: for leave years beginning on or after 1 April 2024
 *     they accrue at 12.07% of hours worked (see annualleave.ts) —
 *     the page explains this and links across.
 */

import { twelfthsEmployed } from "./annualleave.ts";

/** Statutory minimum paid holiday, in weeks of the worker's own pattern. */
export const STATUTORY_HOLIDAY_WEEKS = 5.6;

/** Statutory entitlement is limited to this many days a year. */
export const MAX_STATUTORY_LEAVE_DAYS = 28;

export type ProRataHolidayPeriod = "full" | "starter" | "leaver";

export interface ProRataHolidayInput {
  /** The employer's full-time entitlement, days a year (28 incl. bank holidays is the usual default). */
  fullTimeEntitlementDays: number;
  /** Days per week in the full-time pattern (usually 5). */
  fullTimeDaysPerWeek: number;
  /** Days per week the employee works. */
  employeeDaysPerWeek: number;
  /** Hours in the employee's working day, for the hours figures. 0 = no hours figures. */
  hoursPerDay: number;
  /** Full leave year, or a mid-year start / leaving date. */
  period: ProRataHolidayPeriod;
  /** First day of the leave year, ISO yyyy-mm-dd. */
  leaveYearStart: string;
  /** First day of the job (starter) or last day of the job (leaver), ISO yyyy-mm-dd. */
  startOrLeavingDate: string;
}

export interface ProRataHolidayResult {
  /** Full-time entitlement scaled by days per week, before the floor. */
  contractualDays: number;
  /** The statutory floor: 5.6 × employee days per week, capped at 28. */
  statutoryFloorDays: number;
  /** True when the floor replaced the (lower) contract figure. */
  floorApplied: boolean;
  /** Full-leave-year entitlement after the floor: max(contractual, floor). */
  fullYearDays: number;
  /** Twelfths of the leave year employed for (12 for a full year). */
  twelfths: number;
  /** Entitlement for this leave year in days, after any part-year cut. */
  entitlementDays: number;
  /** Entitlement in hours; null if no day length given. */
  entitlementHours: number | null;
  /** Full-year entitlement in hours; null if no day length given. */
  fullYearHours: number | null;
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

interface DateParts {
  year: number;
  month: number;
}

function parseIsoMonth(value: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function monthIndex(d: DateParts): number {
  return d.year * 12 + (d.month - 1);
}

/**
 * Twelfths of the leave year a LEAVER is employed for: the months
 * from the leave year's first month to the leaving month, inclusive
 * (the mirror image of twelfthsEmployed for starters — the leaving
 * month counts as a whole twelfth, the same whole-month treatment
 * GOV.UK applies at the start of a job).
 */
export function twelfthsToLeaving(
  leaveYearStart: string,
  leavingDate: string,
): number {
  const yearStart = parseIsoMonth(leaveYearStart);
  const leaving = parseIsoMonth(leavingDate);
  if (!yearStart || !leaving) return 12;

  const startIdx = monthIndex(yearStart);
  const endIdx = startIdx + 11;
  const leaveIdx = monthIndex(leaving);

  if (leaveIdx <= startIdx) return 1;
  if (leaveIdx > endIdx) return 12;
  return leaveIdx - startIdx + 1;
}

export function calculateProRataHoliday(
  input: ProRataHolidayInput,
): ProRataHolidayResult {
  const ftEntitlement = positive(input.fullTimeEntitlementDays);
  const ftDays = positive(input.fullTimeDaysPerWeek);
  const empDays = positive(input.employeeDaysPerWeek);
  const hoursPerDay = positive(input.hoursPerDay);

  const contractualExact =
    ftDays > 0 ? ftEntitlement * (empDays / ftDays) : 0;
  const floorExact = Math.min(
    MAX_STATUTORY_LEAVE_DAYS,
    STATUTORY_HOLIDAY_WEEKS * empDays,
  );
  const floorApplied = floorExact > contractualExact;
  const fullYearExact = Math.max(contractualExact, floorExact);
  const fullYearDays = round1(fullYearExact);

  const twelfths =
    input.period === "starter"
      ? twelfthsEmployed(input.leaveYearStart, input.startOrLeavingDate)
      : input.period === "leaver"
        ? twelfthsToLeaving(input.leaveYearStart, input.startOrLeavingDate)
        : 12;

  // A full 12 twelfths keeps the exact full-year figure; a part year
  // is rounded up to the nearest half day (GOV.UK's treatment).
  const entitlementDays =
    twelfths >= 12
      ? fullYearDays
      : round1(ceilHalfDay(fullYearExact * (twelfths / 12)));

  return {
    contractualDays: round1(contractualExact),
    statutoryFloorDays: round1(floorExact),
    floorApplied,
    fullYearDays,
    twelfths,
    entitlementDays,
    entitlementHours:
      hoursPerDay > 0 ? round2(entitlementDays * hoursPerDay) : null,
    fullYearHours:
      hoursPerDay > 0 ? round2(fullYearDays * hoursPerDay) : null,
  };
}
