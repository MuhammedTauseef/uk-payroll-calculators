import {
  employeeNiFor,
  incomeTaxFor,
  personalAllowanceFor,
} from "./takehome.ts";
import {
  studentLoanPlan,
  studentLoanRepaymentFor,
  type StudentLoanPlanId,
} from "./student-loan.ts";

/**
 * Tax on a bonus — England, Wales and Northern Ireland, 2026/27.
 *
 * A bonus is ordinary earnings paid through PAYE (GOV.UK "Bonuses"
 * and the employer payroll guidance): there is no separate bonus
 * tax rate. What the bonus costs depends on where it lands on top
 * of the salary, so this calculation runs the site's take-home
 * engine twice — on the salary alone and on salary plus bonus —
 * and reports the difference:
 *   - Income Tax at the marginal bands the bonus passes through,
 *     including the Personal Allowance taper between £100,000 and
 *     £125,140, which takes £1 of allowance for every £2 of extra
 *     income and makes the effective marginal tax rate in that
 *     band 60%.
 *   - Employee Class 1 National Insurance (8% between the Primary
 *     Threshold and the Upper Earnings Limit, 2% above it).
 *   - Student loan repayments, where a plan is chosen, at 9%
 *     (Plans 1, 2, 4 and 5) or 6% (Postgraduate) of the bonus —
 *     the thresholds are already used up by the salary at these
 *     income levels, so the whole bonus is above the threshold.
 *
 * Two real-world effects the annual figures cannot show, and
 * which the page explains rather than calculates:
 *   - PAYE works the bonus month out largely on its own: payroll
 *     annualises the month's pay, so a large one-off bonus can be
 *     taxed in the month as if the higher rate applied all year.
 *     On a cumulative tax code the over-deduction unwinds through
 *     later payslips in the same tax year (or by refund after it).
 *   - National Insurance, unlike Income Tax, is worked out per
 *     pay period and is not cumulative, so NI taken in the bonus
 *     month is not refunded later even if the year's income turns
 *     out lower.
 *
 * Salary sacrifice: where part or all of the bonus is sacrificed
 * into a pension under a valid salary sacrifice arrangement, that
 * part is not pay at all — no Income Tax, National Insurance or
 * student loan repayment is due on it — so the calculation taxes
 * only the part of the bonus actually taken as cash.
 */

export type BonusStudentLoanPlan = StudentLoanPlanId | "none";

export interface BonusInput {
  /** Gross annual salary before the bonus, £ per year. */
  annualSalary: number;
  /** Gross bonus, £. */
  bonus: number;
  /** Student loan plan to include, or "none". */
  studentLoanPlan: BonusStudentLoanPlan;
  /** Percentage of the bonus given up into a pension by salary sacrifice, 0–100. */
  sacrificePercent: number;
}

export interface BonusResult {
  annualSalary: number;
  grossBonus: number;
  /** Amount of the bonus sacrificed into a pension, £. */
  sacrificedAmount: number;
  /** Bonus taken as cash — the part that is taxed, £. */
  taxableBonus: number;
  /** Income Tax caused by the cash bonus, £. */
  incomeTaxOnBonus: number;
  /** Employee National Insurance caused by the cash bonus, £. */
  employeeNiOnBonus: number;
  /** Student loan repayment caused by the cash bonus, £. */
  studentLoanOnBonus: number;
  /** Tax + NI + student loan on the cash bonus, £. */
  totalDeductions: number;
  /** Cash bonus kept after deductions, £. */
  netBonus: number;
  /** Share of the whole gross bonus kept in cash, 0–100 (the sacrificed part is in the pension on top). */
  keepPercentOfGross: number;
  /** Effective deduction rate on the cash bonus, 0–100. */
  marginalRatePercent: number;
  /** Personal Allowance on the salary alone, £. */
  personalAllowanceBefore: number;
  /** Personal Allowance on salary plus cash bonus, £. */
  personalAllowanceAfter: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function nonNegative(n: number): number {
  return Math.max(0, n || 0);
}

export function calculateBonus(input: BonusInput): BonusResult {
  const salary = nonNegative(input.annualSalary);
  const bonus = nonNegative(input.bonus);
  const sacrificePercent = Math.min(100, Math.max(0, input.sacrificePercent || 0));
  const sacrificedAmount = round2((bonus * sacrificePercent) / 100);
  const taxableBonus = round2(bonus - sacrificedAmount);

  const incomeTaxOnBonus = round2(
    incomeTaxFor(salary + taxableBonus) - incomeTaxFor(salary),
  );
  const employeeNiOnBonus = round2(
    employeeNiFor(salary + taxableBonus) - employeeNiFor(salary),
  );
  const studentLoanOnBonus =
    input.studentLoanPlan === "none"
      ? 0
      : round2(
          studentLoanRepaymentFor(
            salary + taxableBonus,
            studentLoanPlan(input.studentLoanPlan),
          ) -
            studentLoanRepaymentFor(
              salary,
              studentLoanPlan(input.studentLoanPlan),
            ),
        );

  const totalDeductions = round2(
    incomeTaxOnBonus + employeeNiOnBonus + studentLoanOnBonus,
  );
  const netBonus = round2(taxableBonus - totalDeductions);

  return {
    annualSalary: round2(salary),
    grossBonus: round2(bonus),
    sacrificedAmount,
    taxableBonus,
    incomeTaxOnBonus,
    employeeNiOnBonus,
    studentLoanOnBonus,
    totalDeductions,
    netBonus,
    keepPercentOfGross:
      bonus > 0 ? round2((netBonus / bonus) * 100) : 100,
    marginalRatePercent:
      taxableBonus > 0 ? round2((totalDeductions / taxableBonus) * 100) : 0,
    personalAllowanceBefore: round2(personalAllowanceFor(salary)),
    personalAllowanceAfter: round2(personalAllowanceFor(salary + taxableBonus)),
  };
}
