import { EMPLOYER_NI, PENSION } from "./rates.ts";

/**
 * Total cost of employment — what a salary really costs the employer.
 *
 *   total cost = gross salary
 *              + employer Class 1 National Insurance
 *              + employer workplace pension
 *              + any other employer costs the user adds
 *
 * Employer NICs use the standard category only (this tool is the
 * all-in cost view; the under-21 / apprentice categories and the
 * Employment Allowance live on the employer NI calculator):
 *
 *   employer NICs = max(0, salary − £5,000 Secondary Threshold) × 15%
 *
 * The pension is the employer's chosen percentage of qualifying
 * earnings — the slice of the salary inside the auto-enrolment band:
 *
 *   qualifying earnings = max(0, min(salary, £50,270) − £6,240)
 *   employer pension    = qualifying earnings × employer %
 *
 * The percentage defaults to the 3% auto-enrolment minimum in the UI
 * but is an input here, because many employers pay more than the
 * minimum. The band itself is never an input — it is a statutory
 * figure and comes from rates.ts.
 *
 * The Apprenticeship Levy is deliberately NOT part of this
 * calculation: it applies only to employers with an annual pay bill
 * over £3 million, and rates.ts carries no verified levy constants —
 * the page copy says so rather than the calculator guessing.
 *
 * RATES DATING: 2026/27 — the 15% rate, the £5,000 Secondary
 * Threshold and the £6,240–£50,270 qualifying-earnings band are all
 * confirmed unchanged for 2026/27 (verified against GOV.UK on
 * 7 November 2026). See EMPLOYER_NI and PENSION in rates.ts.
 */

export interface EmployerCostInput {
  /** Employee's annual gross salary, £ per year. */
  annualGrossSalary: number;
  /**
   * Employer pension contribution as a percentage of qualifying
   * earnings (3 = the auto-enrolment minimum 3%).
   */
  employerPensionPercent: number;
  /** Any other employer costs (benefits, insurance, kit), £ per year. */
  otherEmployerCostsAnnual: number;
}

export interface EmployerCostResult {
  /** Annual gross salary used, echoed for the breakdown, £. */
  annualGrossSalary: number;
  /** Secondary Threshold the NICs were charged above, £ per year. */
  thresholdApplied: number;
  /** Salary above the threshold — the part NICs are charged on, £. */
  earningsAboveThreshold: number;
  /** Employer NICs payable, £ per year. */
  employerNiPerYear: number;
  /** Employer NICs payable, £ per month (year ÷ 12). */
  employerNiPerMonth: number;
  /** Slice of the salary inside the pension qualifying-earnings band, £. */
  qualifyingEarnings: number;
  /** Employer pension percentage used, echoed (3 = 3%). */
  employerPensionPercent: number;
  /** Employer pension contribution, £ per year. */
  employerPensionPerYear: number;
  /** Employer pension contribution, £ per month (year ÷ 12). */
  employerPensionPerMonth: number;
  /** Other employer costs used, echoed, £ per year. */
  otherCostsPerYear: number;
  /** Other employer costs, £ per month (year ÷ 12). */
  otherCostsPerMonth: number;
  /** Everything on top of the salary: NICs + pension + other, £/year. */
  onCostsPerYear: number;
  /** Total cost of employing, £ per year. */
  totalCostPerYear: number;
  /** Total cost of employing, £ per month (year ÷ 12). */
  totalCostPerMonth: number;
  /** On-costs as a percentage of the salary (14.88 = 14.88%). */
  costUpliftPercent: number;
  /** Total cost as a multiple of the salary (1.15 = £1.15 per £1). */
  totalCostMultiple: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateEmployerCost(
  input: EmployerCostInput,
): EmployerCostResult {
  const salary = Math.max(0, input.annualGrossSalary || 0);
  const pensionPercent = Math.min(
    100,
    Math.max(0, input.employerPensionPercent || 0),
  );
  const other = Math.max(0, input.otherEmployerCostsAnnual || 0);

  // Employer NICs: 15% on the salary slice above the Secondary
  // Threshold (standard category).
  const threshold = EMPLOYER_NI.secondaryThresholdAnnual;
  const aboveExact = Math.max(0, salary - threshold);
  const niExact = aboveExact * EMPLOYER_NI.rate;

  // Employer pension: the chosen percentage of the salary slice
  // inside the qualifying-earnings band.
  const qualifyingExact = Math.max(
    0,
    Math.min(salary, PENSION.qualifyingEarningsUpperAnnual) -
      PENSION.qualifyingEarningsLowerAnnual,
  );
  const pensionExact = qualifyingExact * (pensionPercent / 100);

  const onCostsExact = niExact + pensionExact + other;
  const totalExact = salary + onCostsExact;

  return {
    annualGrossSalary: round2(salary),
    thresholdApplied: round2(threshold),
    earningsAboveThreshold: round2(aboveExact),
    employerNiPerYear: round2(niExact),
    employerNiPerMonth: round2(niExact / 12),
    qualifyingEarnings: round2(qualifyingExact),
    employerPensionPercent: pensionPercent,
    employerPensionPerYear: round2(pensionExact),
    employerPensionPerMonth: round2(pensionExact / 12),
    otherCostsPerYear: round2(other),
    otherCostsPerMonth: round2(other / 12),
    onCostsPerYear: round2(onCostsExact),
    totalCostPerYear: round2(totalExact),
    totalCostPerMonth: round2(totalExact / 12),
    costUpliftPercent:
      salary > 0 ? round2((onCostsExact / salary) * 100) : 0,
    totalCostMultiple: salary > 0 ? round2(totalExact / salary) : 0,
  };
}
