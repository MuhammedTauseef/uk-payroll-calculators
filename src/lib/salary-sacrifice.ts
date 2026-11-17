import { EMPLOYER_NI } from "./rates.ts";
import {
  calculateTakeHome,
  type TakeHomeResult,
} from "./takehome.ts";

/**
 * Salary sacrifice (pension) maths — UK, 2026/27.
 *
 * Under a salary sacrifice arrangement the contract is rewritten: the
 * employee gives up part of their gross salary and the employer pays
 * that amount into the pension instead. Because the sacrificed amount
 * is never salary, it escapes BOTH Income Tax and employee National
 * Insurance — unlike an ordinary pension contribution from net pay,
 * which saves tax but not NI. The employer also pays no employer
 * National Insurance on the sacrificed amount.
 *
 * All tax and NI figures come from the verified take-home functions
 * (src/lib/takehome.ts, 2026/27 bands from rates.ts): the "after"
 * position is simply take-home pay on the reduced salary. Employer NI
 * uses the EMPLOYER_NI constants: 15% on earnings above the £5,000
 * secondary threshold.
 *
 * Two limits the page states and the calculator does not model:
 * sacrifice cannot take contractual pay below the National Minimum
 * Wage, and total pension contributions count towards the £60,000
 * pension annual allowance. Sacrifice also lowers the salary that
 * statutory payments (maternity pay, etc.) and mortgage references
 * are based on — flagged on the page, not in the numbers.
 */

export interface SalarySacrificeInput {
  /** Gross annual salary before sacrifice, £. */
  grossSalary: number;
  /** Amount sacrificed into the pension, £/year. */
  sacrificeAnnual: number;
}

export interface SalarySacrificeResult {
  grossSalary: number;
  sacrificeAnnual: number;
  /** Contractual salary after sacrifice, £/year. */
  reducedSalary: number;
  before: TakeHomeResult;
  after: TakeHomeResult;
  /** Income Tax saved by sacrificing, £/year. */
  incomeTaxSaved: number;
  /** Employee National Insurance saved, £/year. */
  employeeNiSaved: number;
  /** Total employee saving, £/year. */
  totalSaved: number;
  /** Take-home given up to put `sacrificeAnnual` in the pension, £/year. */
  takeHomeCost: number;
  /** Take-home cost per £1 of pension contribution, pence. */
  costPerPoundPence: number;
  /** Employer NI on the full salary, £/year. */
  employerNiBefore: number;
  /** Employer NI on the reduced salary, £/year. */
  employerNiAfter: number;
  /** Employer NI saved, £/year — some employers add this to the pension. */
  employerNiSaved: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Employer Class 1 NI on a salary: 15% above the £5,000 secondary threshold. */
export function employerNiFor(salary: number): number {
  const s = Math.max(0, salary || 0);
  return (
    Math.max(0, s - EMPLOYER_NI.secondaryThresholdAnnual) * EMPLOYER_NI.rate
  );
}

export function calculateSalarySacrifice(
  input: SalarySacrificeInput,
): SalarySacrificeResult {
  const gross = Math.max(0, input.grossSalary || 0);
  const sacrifice = Math.min(gross, Math.max(0, input.sacrificeAnnual || 0));
  const reduced = gross - sacrifice;

  const before = calculateTakeHome({ annualSalary: gross });
  const after = calculateTakeHome({ annualSalary: reduced });

  const taxSaved = before.incomeTax - after.incomeTax;
  const niSaved =
    before.employeeNationalInsurance - after.employeeNationalInsurance;
  const employerBefore = employerNiFor(gross);
  const employerAfter = employerNiFor(reduced);

  return {
    grossSalary: round2(gross),
    sacrificeAnnual: round2(sacrifice),
    reducedSalary: round2(reduced),
    before,
    after,
    incomeTaxSaved: round2(taxSaved),
    employeeNiSaved: round2(niSaved),
    totalSaved: round2(taxSaved + niSaved),
    takeHomeCost: round2(before.netAnnual - after.netAnnual),
    costPerPoundPence:
      sacrifice > 0
        ? round2(((before.netAnnual - after.netAnnual) / sacrifice) * 100)
        : 0,
    employerNiBefore: round2(employerBefore),
    employerNiAfter: round2(employerAfter),
    employerNiSaved: round2(employerBefore - employerAfter),
  };
}
