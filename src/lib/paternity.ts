import { SPP } from "./rates.ts";

/**
 * Statutory Paternity Pay (SPP) calculation — 2026/27 rules.
 *
 * Weekly SPP = the LOWER of £194.32 or 90% of average weekly earnings.
 * Paid for one or two weeks, chosen by the employee; since April 2024
 * the two weeks can be taken together or as two separate one-week
 * blocks, at any time in the first year after the birth (or adoption
 * placement).
 *
 * Input is the annual salary; average weekly earnings = salary / 52.
 */

export interface PaternityInput {
  /** Gross annual salary, £ per year. */
  annualSalary: number;
  /** Weeks of paternity leave being taken (1 or 2). */
  weeks: number;
}

export interface PaternityResult {
  /** Average weekly earnings derived from the salary, £/week. */
  averageWeeklyEarnings: number;
  /** Weekly SPP amount, £/week. */
  weeklyAmount: number;
  /** Which rule produced the weekly amount. */
  rateBasis: "statutory-cap" | "ninety-percent";
  /** Weeks being taken (clamped to 1–2). */
  weeks: number;
  /** Total SPP for the leave taken, £. */
  totalPay: number;
  /** Total if the full two weeks were taken, £. */
  totalForTwoWeeks: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculatePaternity(input: PaternityInput): PaternityResult {
  const salary = Math.max(0, input.annualSalary || 0);
  const awe = salary / 52;
  const ninetyPercent = SPP.aweFraction * awe;
  const weeklyExact = Math.min(SPP.weeklyRate, ninetyPercent);
  const weeks = Math.min(
    SPP.maxWeeks,
    Math.max(1, Math.floor(input.weeks || 1)),
  );

  return {
    averageWeeklyEarnings: round2(awe),
    weeklyAmount: round2(weeklyExact),
    rateBasis: ninetyPercent < SPP.weeklyRate ? "ninety-percent" : "statutory-cap",
    weeks,
    totalPay: round2(weeklyExact * weeks),
    totalForTwoWeeks: round2(weeklyExact * SPP.maxWeeks),
  };
}
