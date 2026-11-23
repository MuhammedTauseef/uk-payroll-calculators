import {
  calculatePayslipBreakdown,
  type PayslipCalculatorResult,
} from "./payslip-calculator.ts";
import type { StudentLoanPlanId } from "./student-loan.ts";

/**
 * Reverse salary maths — UK, 2026/27: the gross salary required to
 * produce a target take-home pay.
 *
 * There is no formula to invert: Income Tax is charged in bands, the
 * Personal Allowance tapers away between £100,000 and £125,140,
 * employee NI changes rate at the Upper Earnings Limit, and student
 * loan repayments switch on at plan thresholds. So the solver runs
 * the site's shipped forward engine — calculatePayslipBreakdown()
 * from src/lib/payslip-calculator.ts, the same maths the payslip
 * calculator shows — inside a binary search over the gross salary,
 * to the penny:
 *
 *   required gross = the SMALLEST gross (to the penny) whose
 *   modelled take-home pay is at least the target.
 *
 * Everything the forward engine models is therefore modelled here,
 * identically: the tax code (1257L standard, with the £100,000
 * taper applied by the engine on the standard code), a pension
 * contribution as a percentage of gross under a net-pay arrangement
 * (it reduces the tax, not the NI), and student loan repayments on
 * GOV.UK's monthly thresholds for Plans 1, 2, 4 and 5 and the
 * Postgraduate Loan, including an undergraduate plan and a
 * Postgraduate Loan running together.
 *
 * And everything it does not model is not modelled here either:
 * Scottish Income Tax rates (the engine is England, Wales and
 * Northern Ireland), salary sacrifice (a different pension
 * arrangement from the net-pay one modelled), benefits in kind,
 * bonuses, and more than one job. The page says all of this.
 */

export interface ReverseSalaryInput {
  /** Target take-home pay, £ per year. */
  targetNetAnnual: number;
  /** HMRC tax code, e.g. "1257L". Blank = the standard 1257L. */
  taxCode: string;
  /** Employee pension contribution, % of gross salary (net-pay arrangement). */
  pensionPercent: number;
  /** Student loan plan, or null for none. Postgraduate can be added on top. */
  studentLoanPlan: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is repaid alongside an undergraduate plan. */
  postgraduateLoanToo: boolean;
}

export interface ReverseSalaryResult {
  /** The target the solver was set, £/year. */
  targetNetAnnual: number;
  /** Smallest gross whose take-home reaches the target, £/year. */
  requiredGrossAnnual: number;
  /** The same figure per month, £. */
  requiredGrossMonthly: number;
  /** The full forward breakdown at the required gross. */
  breakdown: PayslipCalculatorResult;
  /** Take-home actually achieved at the required gross, £/year. */
  achievedNetAnnual: number;
  /** Take-home actually achieved at the required gross, £/month. */
  achievedNetMonthly: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function forward(
  grossAnnual: number,
  input: ReverseSalaryInput,
): PayslipCalculatorResult {
  return calculatePayslipBreakdown({
    annualSalary: grossAnnual,
    taxCode: input.taxCode,
    pensionPercent: input.pensionPercent,
    studentLoanPlan: input.studentLoanPlan,
    postgraduateLoanToo: input.postgraduateLoanToo,
  });
}

export function calculateRequiredSalary(
  input: ReverseSalaryInput,
): ReverseSalaryResult {
  const target = Math.max(0, input.targetNetAnnual || 0);
  const targetPence = Math.round(target * 100);

  // Binary search in whole pence: find the smallest gross whose
  // modelled annual take-home is at least the target. The forward
  // engine's net pay is non-decreasing in the gross for every input
  // this solver accepts (bands, taper, thresholds and a proportional
  // pension all preserve the ordering), so the search is exact.
  let loPence = 0; // net(0) = 0, which is < any positive target
  let hiPence = Math.max(100, targetPence);
  // Grow the upper bound until it reaches the target. The cap is a
  // formality: at a £10,000,000 gross the take-home passes any
  // target the page will ever be given.
  const netPenceAt = (grossPence: number) =>
    Math.round(forward(grossPence / 100, input).netAnnual * 100);
  let guard = 0;
  while (netPenceAt(hiPence) < targetPence && guard < 40) {
    hiPence *= 2;
    guard += 1;
  }
  while (loPence + 1 < hiPence) {
    const midPence = Math.floor((loPence + hiPence) / 2);
    if (netPenceAt(midPence) >= targetPence) {
      hiPence = midPence;
    } else {
      loPence = midPence;
    }
  }

  const breakdown = forward(hiPence / 100, input);
  return {
    targetNetAnnual: round2(target),
    requiredGrossAnnual: round2(hiPence / 100),
    requiredGrossMonthly: round2(hiPence / 100 / 12),
    breakdown,
    achievedNetAnnual: breakdown.netAnnual,
    achievedNetMonthly: breakdown.netMonthly,
  };
}
