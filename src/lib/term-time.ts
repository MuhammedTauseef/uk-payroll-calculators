/**
 * Term-time-only pay maths.
 *
 * A term-time worker is contracted for part of the year (38–40 weeks
 * is typical in schools) but is usually paid in twelve equal monthly
 * instalments. The pay has to cover two things: the weeks worked, and
 * the paid holiday that attaches to those weeks. The standard
 * construction — the one school and local-authority payrolls use —
 * works in weeks:
 *
 *   holiday weeks = 5.6 × (weeks worked ÷ 46.4)
 *   paid weeks    = weeks worked + holiday weeks
 *   annual pay    = FTE salary × (paid weeks ÷ 52.143)
 *
 * 5.6 is the statutory holiday entitlement in weeks; 46.4 is the
 * number of weeks actually worked in a full year (52.143 − 5.6,
 * conventionally written 46.4 — the same base the 12.07% accrual rate
 * comes from: 5.6 ÷ 46.4 = 12.07%); 52.143 is the number of weeks in
 * a year (365 ÷ 7).
 *
 * THE UPLIFT IS THE POINT. A widely used shortcut — FTE salary ×
 * weeks worked ÷ 52.143, with no holiday weeks added — underpays,
 * because it prices the worked weeks but never pays the holiday that
 * attaches to them. This calculator always includes the uplift, and
 * shows what the shortcut would have given so the difference is
 * visible. The uplift is the same proportion as the 12.07% accrual
 * the Working Time Regulations apply to part-year workers for leave
 * years beginning on or after 1 April 2024 (5.6 ÷ 46.4 = 12.07%):
 * holiday is earned on the weeks worked, and it has to be paid.
 *
 * Where the contracted hours differ from the full-time pattern, the
 * result is scaled by contracted ÷ full-time hours (capped at 1 —
 * more than full-time hours is not a term-time pro-rata).
 *
 * Rules checked against ACAS guidance on holiday pay and the Working
 * Time Regulations 1998, 16 November 2026.
 */

/** Statutory minimum paid holiday, weeks a year. */
export const STATUTORY_HOLIDAY_WEEKS = 5.6;

/** Weeks actually worked in a full year: 52.143 − 5.6, written 46.4. */
export const FULL_YEAR_WORKING_WEEKS = 46.4;

/** Weeks in a year: 365 ÷ 7. */
export const WEEKS_IN_YEAR = 52.143;

export interface TermTimeInput {
  /** Full-time-equivalent annual gross salary, £. */
  fteAnnualSalary: number;
  /** Contracted working weeks a year (e.g. 38, 39, 40). */
  workingWeeksPerYear: number;
  /** Hours per week in the full-time pattern. */
  fullTimeHoursPerWeek: number;
  /** Contracted hours per week in the term-time pattern. */
  contractedHoursPerWeek: number;
}

export interface TermTimeResult {
  /** Paid holiday weeks the working weeks attract: 5.6 × weeks ÷ 46.4. */
  holidayWeeks: number;
  /** Weeks the annual pay covers: working weeks + holiday weeks. */
  paidWeeks: number;
  /** Contracted ÷ full-time hours, capped at 1. */
  hoursFraction: number;
  /** Term-time annual gross pay, £. */
  annualPay: number;
  /** Annual ÷ 12 — the equal monthly instalment term-time pay is usually spread into. */
  monthlyPay: number;
  /** Annual ÷ 52.143 — the weekly equivalent across the whole year. */
  weeklyPay: number;
  /** What the no-uplift shortcut (weeks ÷ 52.143 only) would give, £. */
  withoutUpliftAnnual: number;
  /** The value of the holiday uplift: annualPay − withoutUpliftAnnual, £. */
  upliftAmount: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function calculateTermTime(input: TermTimeInput): TermTimeResult {
  const fte = positive(input.fteAnnualSalary);
  const weeks = positive(input.workingWeeksPerYear);
  const ftHours = positive(input.fullTimeHoursPerWeek);
  const contractedHours = positive(input.contractedHoursPerWeek);

  const hoursFractionExact =
    ftHours > 0 ? Math.min(1, contractedHours / ftHours) : 0;

  const holidayWeeksExact =
    STATUTORY_HOLIDAY_WEEKS * (weeks / FULL_YEAR_WORKING_WEEKS);
  const paidWeeksExact = weeks + holidayWeeksExact;

  const annualExact =
    fte * (paidWeeksExact / WEEKS_IN_YEAR) * hoursFractionExact;
  const withoutUpliftExact =
    fte * (weeks / WEEKS_IN_YEAR) * hoursFractionExact;

  return {
    holidayWeeks: round2(holidayWeeksExact),
    paidWeeks: round2(paidWeeksExact),
    hoursFraction: round4(hoursFractionExact),
    annualPay: round2(annualExact),
    monthlyPay: round2(annualExact / 12),
    weeklyPay: round2(annualExact / WEEKS_IN_YEAR),
    withoutUpliftAnnual: round2(withoutUpliftExact),
    upliftAmount: round2(annualExact - withoutUpliftExact),
  };
}
