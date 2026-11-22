/**
 * Day rate ⇄ annual salary conversion maths — UK contractors,
 * freelancers and interim staff, 2026/27.
 *
 * Built 22 November 2026 for the "day rate calculator" keyword
 * (Semrush UK: 1,300/month, KD 19 — VERIFIED strict weak slot:
 * dayratecalculator.co.uk, AS 8, holds live #1 on roughly 319
 * visits a month). Competitor teardown (22 Nov 2026): the #1
 * page's simple calculator is only the rule of thumb
 * (salary × 1.3 ÷ 228) and its full calculator hides a 5–10
 * minute cost form behind an email prompt; its figures are
 * "gross of any taxes" with no take-home estimate, no IR35
 * pointer and no rate table. This tool fills those gaps: both
 * conversion directions, an editable working-days build-up, a
 * PAYE take-home estimate from the hub's own take-home engine,
 * and a permanent-salary equivalent.
 *
 * Conventions (the house rules, as in hourly.ts):
 *   - Billable days are BUILT, not assumed: days per week × 52,
 *     minus bank holidays, minus the reader's own holiday days,
 *     minus any other days off (sickness, gaps between
 *     contracts). Defaults: 5 days a week, 8 bank holidays
 *     (England & Wales), 25 holiday days → 227 billable days.
 *   - The take-home estimate runs the gross annual figure
 *     through calculateTakeHome (takehome.ts) — England, Wales
 *     and Northern Ireland 2026/27 PAYE rules — and is labelled
 *     on the page as the employment-style estimate (inside IR35
 *     or umbrella work is taxed this way). It is before pension
 *     contributions and student loan repayments.
 *   - The permanent-salary equivalent divides the gross annual
 *     contract value by (1 + uplift): the widely used 30%
 *     uplift stands for the employer pension, paid holiday,
 *     sick pay and employer National Insurance a permanent
 *     salary carries and a day rate has to fund itself. The
 *     uplift is an input, not a hidden constant.
 *   - Each money line is rounded to the penny from the exact
 *     product, never from an already-rounded line.
 */

import { calculateTakeHome } from "./takehome.ts";

export type DayRateDirection = "rateToSalary" | "salaryToRate";

export interface DayRateInput {
  direction: DayRateDirection;
  /** Day rate in £, used when direction is "rateToSalary". */
  dayRate: number;
  /** Target gross annual salary in £, used when direction is "salaryToRate". */
  targetAnnualSalary: number;
  /** Days worked per week, normally 5. */
  daysPerWeek: number;
  /** Bank holidays per year not worked (8 in England & Wales). */
  bankHolidaysPerYear: number;
  /** Holiday days taken per year. */
  holidayDaysPerYear: number;
  /** Other days off per year: sickness, training, gaps between contracts. */
  otherDaysOffPerYear: number;
  /** Hours in a working day, for the hourly equivalent. */
  hoursPerDay: number;
  /** Benefits uplift % applied in the salary-to-rate direction. */
  upliftPercent: number;
}

export interface DayRateResult {
  /** Days that can actually be billed in the year. */
  billableDays: number;
  /** Gross annual contract value in the rate direction; the
   *  grossed-up annual amount the target salary needs in the
   *  salary direction. */
  grossAnnual: number;
  /** The day rate: the input in one direction, the answer in the other. */
  dayRate: number;
  /** Day rate × days per week. */
  weeklyRate: number;
  /** Gross annual ÷ 12. */
  monthlyGross: number;
  /** Day rate ÷ hours per day. */
  hourlyRate: number;
  /** In the salary direction: the target salary itself. In the
   *  rate direction: gross annual ÷ (1 + uplift) — the permanent
   *  salary the contract value roughly matches. */
  equivalentSalary: number;
  /** Employment-style take-home on the gross annual figure. */
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  incomeTax: number;
  employeeNationalInsurance: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function billableDaysFor(input: {
  daysPerWeek: number;
  bankHolidaysPerYear: number;
  holidayDaysPerYear: number;
  otherDaysOffPerYear: number;
}): number {
  const days =
    Math.max(0, input.daysPerWeek || 0) * 52 -
    Math.max(0, input.bankHolidaysPerYear || 0) -
    Math.max(0, input.holidayDaysPerYear || 0) -
    Math.max(0, input.otherDaysOffPerYear || 0);
  return Math.max(0, Math.round(days));
}

export function convertDayRate(input: DayRateInput): DayRateResult {
  const billableDays = billableDaysFor(input);
  const daysPerWeek = Math.max(0, input.daysPerWeek || 0);
  const hoursPerDay = Math.max(0, input.hoursPerDay || 0);
  const uplift = Math.max(0, input.upliftPercent || 0) / 100;

  let dayRate = 0;
  let grossAnnual = 0;
  let equivalentSalary = 0;

  if (input.direction === "rateToSalary") {
    dayRate = Math.max(0, input.dayRate || 0);
    grossAnnual = dayRate * billableDays;
    equivalentSalary = uplift > -1 ? grossAnnual / (1 + uplift) : grossAnnual;
  } else {
    equivalentSalary = Math.max(0, input.targetAnnualSalary || 0);
    grossAnnual = equivalentSalary * (1 + uplift);
    dayRate = billableDays > 0 ? grossAnnual / billableDays : 0;
  }

  const takeHome = calculateTakeHome({ annualSalary: grossAnnual });

  return {
    billableDays,
    grossAnnual: round2(grossAnnual),
    dayRate: round2(dayRate),
    weeklyRate: round2(dayRate * daysPerWeek),
    monthlyGross: round2(grossAnnual / 12),
    hourlyRate: hoursPerDay > 0 ? round2(dayRate / hoursPerDay) : 0,
    equivalentSalary: round2(equivalentSalary),
    takeHomeAnnual: takeHome.netAnnual,
    takeHomeMonthly: takeHome.netMonthly,
    incomeTax: takeHome.incomeTax,
    employeeNationalInsurance: takeHome.employeeNationalInsurance,
  };
}
