import { SSP } from "./rates.ts";

/**
 * Statutory Sick Pay calculation — April 2026 rules.
 *
 * Weekly SSP amount  = min(£123.25, 80% of average weekly earnings)
 * Daily rate         = weekly amount ÷ qualifying days in the employee's week
 * Payable from       = the first full day of sickness (no waiting days)
 * Maximum            = 28 weeks per period of incapacity for work; sickness
 *                      spells 8 weeks or less apart are "linked" and share
 *                      the same 28-week entitlement.
 *
 * All day counts in this module are QUALIFYING days (the days the employee
 * normally works), never calendar days.
 */

export interface SspInput {
  /** Average weekly earnings, £ per week. */
  averageWeeklyEarnings: number;
  /** Qualifying days in the employee's normal working week (1–7). */
  qualifyingDaysPerWeek: number;
  /** Qualifying days the employee is absent in this sickness spell. */
  daysAbsent: number;
  /**
   * Qualifying days of SSP already paid in a linked previous sickness spell
   * (0 when there is no linked spell). These count towards the 28-week cap.
   */
  linkedSicknessDaysPaid?: number;
}

export interface SspResult {
  /** Weekly SSP amount, £ (the lower of the cap and 80% of AWE). */
  weeklyRate: number;
  /** Which of the two weekly-amount rules produced the weekly rate. */
  rateBasis: "statutory-cap" | "eighty-percent";
  /** Daily rate, £ per qualifying day. */
  dailyRate: number;
  /** Total qualifying days SSP can ever cover: 28 × qualifying days/week. */
  maxPayableDays: number;
  /** Linked days already paid, echoed back for the breakdown. */
  linkedDaysPaid: number;
  /** Qualifying days of THIS spell that SSP will actually pay for. */
  daysPayable: number;
  /** Absent qualifying days that fall beyond the entitlement (0 normally). */
  daysNotPayable: number;
  /** True when the linked-period 28-week cap cut this spell short. */
  cappedByLinkedPeriod: boolean;
  /** Total SSP payable for this spell, £. */
  totalPayable: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Round UP to the next penny. GOV.UK's official SSP "amounts to pay"
 * tables round the daily rate and the payable total up, not to the
 * nearest penny (accuracy audit F2, 7 Nov 2026: 7 of the 28 flat-rate
 * day combinations sat exactly 1p low under round-to-nearest). The
 * total is the ceiling of the EXACT daily rate × days — not the
 * ceilinged daily rate × days — so a full week still totals exactly
 * the weekly rate. The epsilon keeps values that are already exact
 * pennies (within float error) from jumping a penny.
 */
function ceil2(n: number): number {
  return Math.ceil((n - 1e-9) * 100) / 100;
}

function wholeDays(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export function calculateSsp(input: SspInput): SspResult {
  const awe = Math.max(0, input.averageWeeklyEarnings || 0);
  const qualifyingDays = Math.min(
    7,
    Math.max(1, Math.floor(input.qualifyingDaysPerWeek || 1)),
  );
  const absent = wholeDays(input.daysAbsent);
  const linked = wholeDays(input.linkedSicknessDaysPaid);

  // Weekly amount: the LOWER of the flat rate and 80% of AWE.
  const eightyPercentAmount = SSP.aweFraction * awe;
  const weeklyRateExact = Math.min(SSP.weeklyCap, eightyPercentAmount);
  const rateBasis: SspResult["rateBasis"] =
    eightyPercentAmount < SSP.weeklyCap ? "eighty-percent" : "statutory-cap";

  // Daily rate: weekly amount spread over the employee's qualifying days.
  const dailyRateExact = weeklyRateExact / qualifyingDays;

  // 28-week entitlement, shared with any linked previous spell.
  const maxPayableDays = SSP.maxWeeks * qualifyingDays;
  const remainingEntitlement = Math.max(0, maxPayableDays - linked);
  const daysPayable = Math.min(absent, remainingEntitlement);
  const daysNotPayable = absent - daysPayable;

  return {
    weeklyRate: round2(weeklyRateExact),
    rateBasis,
    dailyRate: ceil2(dailyRateExact),
    maxPayableDays,
    linkedDaysPaid: linked,
    daysPayable,
    daysNotPayable,
    cappedByLinkedPeriod: daysNotPayable > 0,
    totalPayable: ceil2(dailyRateExact * daysPayable),
  };
}
