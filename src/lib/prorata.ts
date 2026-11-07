/**
 * Pro-rata salary maths.
 *
 * A part-time salary is the full-time salary scaled by the fraction of
 * full-time work actually done:
 *
 *   pro-rata salary = full-time salary × (part-time amount ÷ full-time amount)
 *
 * The fraction can be measured in hours per week or in days per week; the
 * result is the full-time equivalent (FTE) fraction (0.6 FTE = 60% of
 * full-time). The fraction can never exceed 1 — working more than the
 * full-time pattern is overtime territory, not pro-rata.
 *
 * Holiday: the statutory minimum paid holiday is 5.6 weeks a year
 * (Working Time Regulations 1998). For someone working D days a week that
 * is 5.6 × D days a year — the same 5.6 weeks, expressed in their own
 * working days. This is a rule of law, not a rate, so it lives here
 * rather than in rates.ts.
 */

export type ProRataMode = "hours" | "days";

/** Statutory minimum paid holiday, in weeks of the worker's own pattern. */
export const STATUTORY_HOLIDAY_WEEKS = 5.6;

export interface ProRataInput {
  /** Full-time (100% FTE) annual gross salary, £. */
  fullTimeAnnualSalary: number;
  /** Measure the fraction by hours per week or by days per week. */
  mode: ProRataMode;
  /** Contracted hours in the full-time pattern, per week. */
  fullTimeHoursPerWeek: number;
  /** Contracted hours in the part-time pattern, per week. */
  partTimeHoursPerWeek: number;
  /** Days worked in the full-time pattern, per week (usually 5). */
  fullTimeDaysPerWeek: number;
  /** Days worked in the part-time pattern, per week. */
  partTimeDaysPerWeek: number;
}

export interface ProRataResult {
  /** Mode the fraction was measured in, echoed for the breakdown. */
  mode: ProRataMode;
  /** Full-time equivalent fraction, e.g. 0.6 for 60% of full-time. */
  fteFraction: number;
  /** Pro-rata annual gross salary, £. */
  annualSalary: number;
  /** Pro-rata monthly gross salary (annual ÷ 12), £. */
  monthlySalary: number;
  /** Pro-rata weekly gross salary (annual ÷ 52), £. */
  weeklySalary: number;
  /** Days per week the holiday figure is based on. */
  holidayBasisDaysPerWeek: number;
  /** Statutory holiday entitlement in days: 5.6 × days per week. */
  holidayDaysPerYear: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round1(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function calculateProRata(input: ProRataInput): ProRataResult {
  const fullTimeSalary = positive(input.fullTimeAnnualSalary);

  // The FTE fraction from whichever measure the visitor picked, capped
  // at 1 (you cannot be more than 100% of full-time on a pro-rata basis).
  const fullAmount = positive(
    input.mode === "hours"
      ? input.fullTimeHoursPerWeek
      : input.fullTimeDaysPerWeek,
  );
  const partAmount = positive(
    input.mode === "hours"
      ? input.partTimeHoursPerWeek
      : input.partTimeDaysPerWeek,
  );
  const fteExact =
    fullAmount > 0 ? Math.min(1, partAmount / fullAmount) : 0;

  const annualExact = fullTimeSalary * fteExact;

  // Holiday is counted in days worked per week. The days measure uses the
  // part-time days directly; the hours measure uses the part-time days
  // when given, and otherwise derives them from the full-time pattern.
  const partTimeDays = positive(input.partTimeDaysPerWeek);
  const fullTimeDays = positive(input.fullTimeDaysPerWeek);
  const holidayBasisDays =
    partTimeDays > 0 ? partTimeDays : fullTimeDays * fteExact;

  return {
    mode: input.mode,
    fteFraction: round4(fteExact),
    annualSalary: round2(annualExact),
    monthlySalary: round2(annualExact / 12),
    weeklySalary: round2(annualExact / 52),
    holidayBasisDaysPerWeek: round2(holidayBasisDays),
    holidayDaysPerYear: round1(STATUTORY_HOLIDAY_WEEKS * holidayBasisDays),
  };
}
