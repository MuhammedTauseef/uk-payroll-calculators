import { EMPLOYER_NI, EMPLOYMENT_ALLOWANCE, PENSION } from "./rates.ts";

/**
 * Employer Class 1 National Insurance (secondary contributions).
 *
 *   employer NICs = (annual gross salary − threshold) × 15%
 *
 * charged only on the part of the salary above the threshold:
 *   - standard employees: the Secondary Threshold, £5,000 a year
 *   - employees under 21 and apprentices under 25: a 0% rate applies up
 *     to the upper secondary threshold, £50,270 a year, so the main rate
 *     only bites on earnings above that higher figure
 *
 * The Employment Allowance then reduces the employer's total NIC bill by
 * up to £10,500 a year (never below £0). It is a bill-level reduction —
 * claiming it for a single employee simply means that employee's NICs are
 * covered until the allowance is used up.
 *
 * Optional employer pension (auto-enrolment minimum): when switched on,
 * the employer also pays 3% of qualifying earnings — the slice of the
 * salary inside the £6,240–£50,270-a-year band (2026/27 figures,
 * unchanged from 2025/26):
 *
 *   qualifying earnings = max(0, min(salary, £50,270) − £6,240)
 *   employer pension    = qualifying earnings × 3%
 *
 * and that pension is added to the total cost of employing. When the
 * toggle is off, every pension figure below is 0 and the totals are the
 * salary + NICs only, exactly as before.
 *
 * RATES DATING: the April 2025 change set the 15% rate and the £5,000
 * threshold, and the pension band is likewise the long-standing figure;
 * GOV.UK confirms all of them unchanged for 2026/27 (verified against
 * GOV.UK on 7 November 2026), and they are labelled as 2026/27 rates
 * everywhere they appear. See EMPLOYER_NI and PENSION in rates.ts.
 */

export interface EmployerNiInput {
  /** Employee's annual gross salary, £ per year. */
  annualGrossSalary: number;
  /**
   * True for employees under 21 and apprentices under 25, whose earnings
   * attract a 0% employer rate up to the upper secondary threshold.
   */
  reducedRateCategory: boolean;
  /** True if the employer claims the Employment Allowance. */
  employmentAllowanceEligible: boolean;
  /**
   * Optional: also include the auto-enrolment employer minimum pension
   * contribution (3% of qualifying earnings). Defaults to off.
   */
  includeEmployerPension?: boolean;
}

export interface EmployerNiResult {
  /** Annual gross salary used, echoed for the breakdown, £. */
  annualGrossSalary: number;
  /** Threshold the NICs were charged above, £ per year. */
  thresholdApplied: number;
  /** Salary above the threshold — the part NICs are charged on, £. */
  earningsAboveThreshold: number;
  /** Employer NICs before any Employment Allowance, £ per year. */
  grossEmployerNi: number;
  /** Employment Allowance actually used (capped at the NIC bill), £. */
  employmentAllowanceApplied: number;
  /** Employer NICs payable, £ per year. */
  employerNiPerYear: number;
  /** Employer NICs payable, £ per month (year ÷ 12). */
  employerNiPerMonth: number;
  /**
   * Slice of the salary inside the pension qualifying-earnings band, £.
   * Only calculated when the pension toggle is on; 0 when it is off.
   */
  qualifyingEarningsForPension: number;
  /** Employer pension contribution (3% of qualifying earnings), £/year. */
  employerPensionPerYear: number;
  /** Employer pension contribution, £ per month (year ÷ 12). */
  employerPensionPerMonth: number;
  /**
   * Total cost of employing: salary + employer NICs, plus the employer
   * pension when the pension toggle is on, £ per year.
   */
  totalCostPerYear: number;
  /** Total cost of employing, £ per month (year ÷ 12). */
  totalCostPerMonth: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateEmployerNi(input: EmployerNiInput): EmployerNiResult {
  const salary = Math.max(0, input.annualGrossSalary || 0);

  const threshold = input.reducedRateCategory
    ? EMPLOYER_NI.youngWorkerUpperThresholdAnnual
    : EMPLOYER_NI.secondaryThresholdAnnual;

  const aboveExact = Math.max(0, salary - threshold);
  const grossExact = aboveExact * EMPLOYER_NI.rate;

  // The allowance reduces the bill by up to its annual amount, floored
  // at £0 — it can never make the bill negative.
  const allowanceApplied = input.employmentAllowanceEligible
    ? Math.min(grossExact, EMPLOYMENT_ALLOWANCE.annualAmount)
    : 0;
  const netExact = grossExact - allowanceApplied;

  // Employer pension (optional): 3% of the salary slice inside the
  // qualifying-earnings band. Not calculated at all when the toggle is
  // off, so every pension figure stays 0 and the totals are unchanged.
  let qualifyingEarningsExact = 0;
  let pensionExact = 0;
  if (input.includeEmployerPension) {
    qualifyingEarningsExact = Math.max(
      0,
      Math.min(salary, PENSION.qualifyingEarningsUpperAnnual) -
        PENSION.qualifyingEarningsLowerAnnual,
    );
    pensionExact = qualifyingEarningsExact * PENSION.employerMinimumRate;
  }

  const totalExact = salary + netExact + pensionExact;

  return {
    annualGrossSalary: round2(salary),
    thresholdApplied: round2(threshold),
    earningsAboveThreshold: round2(aboveExact),
    grossEmployerNi: round2(grossExact),
    employmentAllowanceApplied: round2(allowanceApplied),
    employerNiPerYear: round2(netExact),
    employerNiPerMonth: round2(netExact / 12),
    qualifyingEarningsForPension: round2(qualifyingEarningsExact),
    employerPensionPerYear: round2(pensionExact),
    employerPensionPerMonth: round2(pensionExact / 12),
    totalCostPerYear: round2(totalExact),
    totalCostPerMonth: round2(totalExact / 12),
  };
}
