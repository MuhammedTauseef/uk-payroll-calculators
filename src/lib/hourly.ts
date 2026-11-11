/**
 * Hourly rate ⇄ annual salary conversion maths — UK.
 *
 * Built 11 November 2026 for the "hourly rate converter uk"
 * keyword (Semrush UK: 1,600/month, KD 19 — weak slot timetally.uk,
 * AS 11 band-edge). The conversion itself is arithmetic, not law;
 * the only statutory figures here are the National Minimum Wage
 * bands, imported from overtime.ts so the two tools can never
 * disagree — the April 2026 GOV.UK rates verified there on
 * 9 November 2026:
 *   21 and over £12.71 · 18 to 20 £10.85 · under 18 £8.00 ·
 *   apprentice £8.00.
 *   https://www.gov.uk/national-minimum-wage-rates
 *
 * Conventions (the house rules, as in prorata.ts and overtime.ts):
 *   - A year is 52 weeks: salary ÷ 52 ÷ contracted hours per week
 *     gives the hourly rate; hourly rate × hours × 52 gives the
 *     salary. (Some converters spread pay over 52.14 or 260 working
 *     days; this hub uses 52 everywhere, so every tool agrees.)
 *   - Each money line is rounded to the penny from the exact
 *     product (rate × hours, rate × hours × 52, salary ÷ 12), never
 *     from an already-rounded line — so £12.71 × 37.5 hours × 52
 *     prints as exactly £24,784.50 a year, the figure a reader
 *     checking on a calculator gets. (Multiplying the rounded
 *     weekly line by 52 instead would drift it by pennies.)
 *   - Everything is GROSS pay — before Income Tax and National
 *     Insurance. The page says so wherever a figure appears; the
 *     take-home calculator is the tool for after-tax figures.
 */

import { nmwBand } from "./overtime.ts";
import type { NmwAgeBand } from "./overtime.ts";

export type ConversionDirection = "hourlyToSalary" | "salaryToHourly";

export interface HourlyConversionInput {
  direction: ConversionDirection;
  /** Hourly rate in £, used when direction is "hourlyToSalary". */
  hourlyRate: number;
  /** Annual salary in £, used when direction is "salaryToHourly". */
  annualSalary: number;
  /** Hours worked per week the figure is spread over. */
  hoursPerWeek: number;
  /** Age band for the National Minimum Wage comparison. */
  ageBand: NmwAgeBand;
}

export interface HourlyConversionResult {
  /**
   * The hourly rate in play, £ — entered directly, or derived as
   * salary ÷ 52 ÷ hours per week and kept exact; the money lines
   * below are rounded from it.
   */
  hourlyRate: number;
  /** Gross annual salary, £ — entered, or round2(hourlyRate × hoursPerWeek × 52). */
  annualSalary: number;
  /** Gross weekly pay: round2(hourlyRate × hoursPerWeek), or round2(annualSalary ÷ 52). */
  weeklyPay: number;
  /** Gross monthly pay: round2(annualSalary ÷ 12). */
  monthlyPay: number;
  /** Hours per week the conversion ran on, echoed. */
  hoursPerWeek: number;
  /** The age band checked, echoed. */
  ageBand: NmwAgeBand;
  /** The band's statutory minimum, £/hour (April 2026). */
  nmwRate: number;
  /**
   * True when the hourly rate is at or above the band minimum.
   * Compared on the rate rounded to 4 decimal places — the precision
   * the pages print — so a rate that prints as £12.71 passes.
   * Null when there is no rate to compare (no hours entered).
   */
  nmwPass: boolean | null;
  /** hourlyRate − nmwRate, £/hour, rounded to the penny (negative when below the floor). */
  nmwDifferencePerHour: number;
  /**
   * What the band minimum itself works out to over a year at these
   * hours, £ — the annual figure a minimum-wage job at this many
   * hours actually pays, rounded once from the exact product like
   * every other annual figure here.
   */
  nmwAnnualEquivalent: number;
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

export function convertHourlyRate(
  input: HourlyConversionInput,
): HourlyConversionResult {
  const band = nmwBand(input.ageBand);
  const hoursPerWeek = positive(input.hoursPerWeek);

  let hourlyRate = 0;
  let weeklyPay = 0;
  let annualSalary = 0;

  if (input.direction === "salaryToHourly") {
    const salary = positive(input.annualSalary);
    hourlyRate = hoursPerWeek > 0 ? salary / 52 / hoursPerWeek : 0;
    weeklyPay = round2(salary / 52);
    annualSalary = round2(salary);
  } else {
    hourlyRate = positive(input.hourlyRate);
    weeklyPay = round2(hourlyRate * hoursPerWeek);
    annualSalary = round2(hourlyRate * hoursPerWeek * 52);
  }

  const monthlyPay = round2(annualSalary / 12);

  return {
    hourlyRate,
    annualSalary,
    weeklyPay,
    monthlyPay,
    hoursPerWeek,
    ageBand: band.id,
    nmwRate: band.rate,
    nmwPass: hourlyRate > 0 ? round4(hourlyRate) >= band.rate : null,
    nmwDifferencePerHour: round2(hourlyRate - band.rate),
    nmwAnnualEquivalent: round2(band.rate * hoursPerWeek * 52),
  };
}
