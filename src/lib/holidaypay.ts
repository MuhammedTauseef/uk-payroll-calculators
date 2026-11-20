import {
  IRREGULAR_ACCRUAL_RATE,
  STATUTORY_LEAVE_WEEKS,
} from "./annualleave.ts";

/**
 * Holiday PAY maths — the money side of UK statutory holiday, the
 * companion to annualleave.ts (which works out the entitlement in
 * days and hours; this library prices it in £).
 *
 * Rules verified against GOV.UK on 20 November 2026 ("Holiday
 * entitlement: pay" / "Calculate holiday entitlement", and the
 * January 2024 holiday pay and entitlement reforms guidance), with
 * the Acas irregular-hours guide agreeing on every figure:
 *
 *   REGULAR hours — a week's pay is the worker's normal weekly pay.
 *   One day of holiday pays a week's pay divided by the days worked
 *   in that week. The full statutory year (5.6 weeks) is worth
 *   5.6 × a week's pay.
 *
 *   VARIABLE pay (normal hours but pay varies, or no normal hours) —
 *   a week's pay is average pay over the 52-week holiday pay
 *   reference period (weeks with no pay are skipped, looking back up
 *   to 104 weeks). The calculator takes the average weekly pay as an
 *   input and applies the same daily-rate method.
 *
 *   IRREGULAR hours / part-year (leave years beginning on or after
 *   1 April 2024) — entitlement accrues at 12.07% of the hours worked
 *   in each pay period. Leave taken is paid at the worker's average
 *   hourly pay (52-week average). Accrued hours that can be booked
 *   round to the nearest whole hour, halves up (GOV.UK's rule).
 *
 *   ROLLED-UP holiday pay (irregular-hours and part-year workers
 *   ONLY) — the employer may pay holiday pay as an uplift of at least
 *   12.07% of the pay for the work done in each pay period, paid with
 *   that pay and shown as a separate item on the payslip. It is not
 *   lawful for regular-hours workers.
 *
 *   LEAVING a job — untaken statutory leave is paid in lieu by the
 *   formula (A × B) − C: A is the full-year entitlement in weeks,
 *   B is the proportion of the leave year that has passed (or been
 *   worked) when employment ends, C is the leave already taken in
 *   weeks. The result is multiplied by a week's pay.
 */

export type HolidayPayMode = "regular" | "irregular" | "rolledup" | "leaving";

export interface HolidayPayInput {
  mode: HolidayPayMode;
  /** Gross weekly pay (regular/leaving modes), £. */
  weeklyPay: number;
  /** Days worked per week in the worker's pattern (regular mode). */
  daysPerWeek: number;
  /** Days of holiday being priced (regular mode). */
  daysOfHoliday: number;
  /** Hours worked in the pay period (irregular mode). */
  hoursWorked: number;
  /** Average hourly pay (irregular mode), £. */
  hourlyRate: number;
  /** Pay for the work done in the pay period (rolled-up mode), £. */
  payForPeriod: number;
  /** Full-year entitlement in weeks (leaving mode; 5.6 statutory). */
  entitlementWeeks: number;
  /** Proportion of the leave year worked, 0–1 (leaving mode). */
  proportionOfYearWorked: number;
  /** Leave already taken this leave year, in weeks (leaving mode). */
  leaveTakenWeeks: number;
}

export interface HolidayPayResult {
  mode: HolidayPayMode;
  /** Daily rate of holiday pay (regular mode), £. */
  dailyRate: number | null;
  /** Pay for the days of holiday entered (regular mode), £. */
  payForDays: number | null;
  /** Value of the full 5.6-week statutory year (regular mode), £. */
  fullYearValue: number | null;
  /** Holiday hours accrued, exact (irregular mode). */
  accruedHoursExact: number | null;
  /** Holiday hours accrued, rounded to the nearest hour (irregular). */
  accruedHoursBooked: number | null;
  /** Pay value of the accrued holiday (irregular mode), £. */
  accruedPayValue: number | null;
  /** Rolled-up holiday pay uplift for the period (rolled-up mode), £. */
  rolledUpAmount: number | null;
  /** Total pay for the period including the uplift (rolled-up), £. */
  rolledUpTotal: number | null;
  /** (A × B) − C in weeks (leaving mode). */
  weeksOwed: number | null;
  /** Payment in lieu owed (leaving mode), £. */
  paymentInLieu: number | null;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/** Nearest whole hour, halves up (GOV.UK's accrued-leave rounding). */
function roundHourHalvesUp(n: number): number {
  return Math.floor(n + 0.5);
}

export function calculateHolidayPay(input: HolidayPayInput): HolidayPayResult {
  const base: HolidayPayResult = {
    mode: input.mode,
    dailyRate: null,
    payForDays: null,
    fullYearValue: null,
    accruedHoursExact: null,
    accruedHoursBooked: null,
    accruedPayValue: null,
    rolledUpAmount: null,
    rolledUpTotal: null,
    weeksOwed: null,
    paymentInLieu: null,
  };

  if (input.mode === "regular") {
    const weeklyPay = positive(input.weeklyPay);
    const daysPerWeek = positive(input.daysPerWeek);
    const days = positive(input.daysOfHoliday);
    const dailyRate = daysPerWeek > 0 ? weeklyPay / daysPerWeek : 0;
    return {
      ...base,
      dailyRate: round2(dailyRate),
      payForDays: round2(dailyRate * days),
      fullYearValue: round2(STATUTORY_LEAVE_WEEKS * weeklyPay),
    };
  }

  if (input.mode === "irregular") {
    const hours = positive(input.hoursWorked);
    const rate = positive(input.hourlyRate);
    const exact = hours * IRREGULAR_ACCRUAL_RATE;
    return {
      ...base,
      accruedHoursExact: round2(exact),
      accruedHoursBooked: roundHourHalvesUp(exact),
      accruedPayValue: round2(exact * rate),
    };
  }

  if (input.mode === "rolledup") {
    const pay = positive(input.payForPeriod);
    const uplift = pay * IRREGULAR_ACCRUAL_RATE;
    return {
      ...base,
      rolledUpAmount: round2(uplift),
      rolledUpTotal: round2(pay + uplift),
    };
  }

  // leaving
  const entitlement = positive(input.entitlementWeeks) || STATUTORY_LEAVE_WEEKS;
  const proportion = Math.min(1, Math.max(0, input.proportionOfYearWorked || 0));
  const taken = positive(input.leaveTakenWeeks);
  const weeklyPay = positive(input.weeklyPay);
  const weeksOwed = entitlement * proportion - taken;
  return {
    ...base,
    weeksOwed: round2(weeksOwed),
    paymentInLieu: round2(weeksOwed * weeklyPay),
  };
}
