import { MATERNITY, NHS_MATERNITY, SMP } from "./rates.ts";

/**
 * Maternity pay calculation — Statutory Maternity Pay (SMP) and, for NHS
 * staff who qualify, NHS occupational maternity pay (Agenda for Change).
 *
 * SMP (39 paid weeks):
 *   weeks 1–6   90% of average weekly earnings
 *   weeks 7–39  the lower of £194.32 or 90% of average weekly earnings
 *   weeks 40–52 unpaid
 *
 * NHS occupational scheme (52-week leave):
 *   weeks 1–8   full pay
 *   weeks 9–26  half pay + SMP (capped at full pay)
 *   weeks 27–39 SMP only
 *   weeks 40–52 unpaid
 *
 * Input is the annual salary; average weekly earnings (AWE) = salary / 52,
 * which is how the result is normally estimated before the baby is due.
 * The relevant-period AWE an employer calculates at the time can differ
 * slightly (it uses a specific 8-week window), so results are estimates.
 */

export type MaternityScheme = "smp" | "nhs";

export interface MaternityInput {
  /** Gross annual salary, £ per year. */
  annualSalary: number;
  /** Which scheme to calculate: statutory only, or NHS occupational. */
  scheme: MaternityScheme;
}

export interface MaternityStage {
  /** Stage label, e.g. "Weeks 1–6". */
  label: string;
  /** What the stage pays, in plain English. */
  basis: string;
  /** Number of weeks in the stage. */
  weeks: number;
  /** Weekly amount during the stage, £ (0 when unpaid). */
  weeklyAmount: number;
  /** Stage total, £. */
  total: number;
}

export interface MaternityResult {
  /** Average weekly earnings derived from the salary, £/week. */
  averageWeeklyEarnings: number;
  /** 90% of AWE — the earnings-related weekly amount, £/week. */
  earningsRelatedWeekly: number;
  /** SMP flat-stage weekly amount (lower of £194.32 and 90% of AWE). */
  statutoryWeekly: number;
  /** Stage-by-stage breakdown, in order. */
  stages: MaternityStage[];
  /** Total pay across the whole leave, £. */
  totalPay: number;
  /** Total paid weeks (stages with a non-zero amount). */
  paidWeeks: number;
  /** Average monthly pay across the 52-week leave, £. */
  averageMonthlyAcrossLeave: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateMaternity(input: MaternityInput): MaternityResult {
  const salary = Math.max(0, input.annualSalary || 0);
  const awe = salary / 52;
  const earningsRelated = MATERNITY.aweFraction * awe;
  const statutory = Math.min(SMP.weeklyRate, earningsRelated);

  const stages: MaternityStage[] = [];

  if (input.scheme === "nhs") {
    const fullPayWeeks = NHS_MATERNITY.fullPayWeeks; // 8
    const halfPayWeeks = NHS_MATERNITY.halfPayEndWeek - fullPayWeeks; // 18
    const smpOnlyWeeks =
      MATERNITY.totalPaidWeeks - NHS_MATERNITY.halfPayEndWeek; // 13
    const unpaidWeeks = MATERNITY.leaveWeeks - MATERNITY.totalPaidWeeks; // 13
    // Half pay + SMP, never more than full pay.
    const halfPayWeekly = Math.min(awe, awe / 2 + statutory);

    stages.push(
      {
        label: `Weeks 1–${fullPayWeeks}`,
        basis: "Full pay (NHS occupational)",
        weeks: fullPayWeeks,
        weeklyAmount: round2(awe),
        total: round2(awe * fullPayWeeks),
      },
      {
        label: `Weeks ${fullPayWeeks + 1}–${NHS_MATERNITY.halfPayEndWeek}`,
        basis: "Half pay plus SMP (capped at full pay)",
        weeks: halfPayWeeks,
        weeklyAmount: round2(halfPayWeekly),
        total: round2(halfPayWeekly * halfPayWeeks),
      },
      {
        label: `Weeks ${NHS_MATERNITY.halfPayEndWeek + 1}–${MATERNITY.totalPaidWeeks}`,
        basis: "SMP only",
        weeks: smpOnlyWeeks,
        weeklyAmount: round2(statutory),
        total: round2(statutory * smpOnlyWeeks),
      },
      {
        label: `Weeks ${MATERNITY.totalPaidWeeks + 1}–${MATERNITY.leaveWeeks}`,
        basis: "Unpaid leave",
        weeks: unpaidWeeks,
        weeklyAmount: 0,
        total: 0,
      },
    );
  } else {
    const relatedWeeks = MATERNITY.earningsRelatedWeeks; // 6
    const flatWeeks = MATERNITY.totalPaidWeeks - relatedWeeks; // 33
    const unpaidWeeks = MATERNITY.leaveWeeks - MATERNITY.totalPaidWeeks; // 13

    stages.push(
      {
        label: `Weeks 1–${relatedWeeks}`,
        basis: "90% of average weekly earnings (SMP)",
        weeks: relatedWeeks,
        weeklyAmount: round2(earningsRelated),
        total: round2(earningsRelated * relatedWeeks),
      },
      {
        label: `Weeks ${relatedWeeks + 1}–${MATERNITY.totalPaidWeeks}`,
        basis: "SMP flat rate (or 90% of earnings if lower)",
        weeks: flatWeeks,
        weeklyAmount: round2(statutory),
        total: round2(statutory * flatWeeks),
      },
      {
        label: `Weeks ${MATERNITY.totalPaidWeeks + 1}–${MATERNITY.leaveWeeks}`,
        basis: "Unpaid leave",
        weeks: unpaidWeeks,
        weeklyAmount: 0,
        total: 0,
      },
    );
  }

  const totalPay = round2(stages.reduce((sum, s) => sum + s.total, 0));
  const paidWeeks = stages
    .filter((s) => s.weeklyAmount > 0)
    .reduce((sum, s) => sum + s.weeks, 0);

  return {
    averageWeeklyEarnings: round2(awe),
    earningsRelatedWeekly: round2(earningsRelated),
    statutoryWeekly: round2(statutory),
    stages,
    totalPay,
    paidWeeks,
    averageMonthlyAcrossLeave: round2((totalPay / MATERNITY.leaveWeeks) * (52 / 12)),
  };
}
