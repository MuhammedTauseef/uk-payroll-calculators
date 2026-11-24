import { INCOME_TAX } from "./rates.ts";
import {
  calculateStudentLoan,
  type StudentLoanPlanId,
} from "./student-loan.ts";
import {
  employeeNiFor,
  incomeTaxFor,
  personalAllowanceFor,
} from "./takehome.ts";

/**
 * Salary comparison — two salaries (two offers, or a current job
 * against a new one) run through the same UK 2026/27 rules and set
 * side by side (England, Wales and Northern Ireland Income Tax
 * bands; Scotland sets its own bands, which this hub does not
 * hold — the page says so. National Insurance is UK-wide).
 *
 * Each salary is worked by the verified helpers in takehome.ts
 * (incomeTaxFor / employeeNiFor / personalAllowanceFor) and the
 * student loan maths in student-loan.ts, on the pay left after
 * the employee pension:
 *
 *   - Employee pension is a percentage of the BASIC salary, taken
 *     off before tax, National Insurance and student loan — the
 *     salary-sacrifice / net-pay basis, the same basis as the
 *     second job calculator. A bonus is NOT pensionable here (the
 *     usual scheme rule), so it is taxed in full. A
 *     relief-at-source pension gives a slightly different NI
 *     figure; the page says so.
 *   - Employer pension is a percentage of the basic salary the
 *     employer adds on top. It is never taxed in the comparison —
 *     it belongs to the TOTAL REWARD view: gross pay + employer
 *     pension, the like-for-like figure two offers should be
 *     judged on when their pension schemes differ.
 *
 * THE THREE COMPARISON NUMBERS:
 *   - Take-home difference: what actually lands in the bank,
 *     Salary B minus Salary A, a year and a month.
 *   - "You keep X% of the rise": the take-home difference as a
 *     share of the GROSS difference. £40,000 → £60,000 keeps
 *     65.19% — the missing third is the 40% band and 2% NI the
 *     rise runs into. When B pays less than A the same ratio
 *     reads as the share of the cut that reaches the bank.
 *   - Marginal rate at Salary B: tax + NI + student loan on the
 *     NEXT £100 of pay at B, measured by running the bands £100
 *     higher. Inside the £100,000–£125,140 Personal Allowance
 *     taper it is 62% (71% with a 9% student loan) — the 60% tax
 *     trap, which the result flags by name whenever a salary
 *     lands in the zone, never silently.
 */

export interface SalaryOfferInput {
  /** Basic gross salary, £/year. */
  salary: number;
  /** Bonus, £/year — taxed in full, not pensionable. */
  bonus?: number;
  /** Employee pension, % of the basic salary (0–100), sacrifice / net-pay basis. */
  employeePensionPercent?: number;
  /** Employer pension, % of the basic salary (0–100), paid on top. */
  employerPensionPercent?: number;
  /** Hours worked a week — drives the hourly figures. Default 37.5. */
  hoursPerWeek?: number;
}

export interface SalaryComparisonInput {
  a: SalaryOfferInput;
  b: SalaryOfferInput;
  /** Undergraduate student loan plan, if any — the same person, so one plan for both offers. */
  undergraduatePlan?: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is also held. */
  hasPostgraduateLoan?: boolean;
}

export interface OfferBreakdown {
  /** Basic gross salary, £/year. */
  grossSalary: number;
  /** Bonus, £/year. */
  bonus: number;
  /** Salary + bonus — the gross pay the tax is charged on, £/year. */
  grossPay: number;
  /** Employee pension taken from the salary, £/year. */
  employeePension: number;
  /** Pay left after the employee pension, £/year. */
  payAfterPension: number;
  /** Employer pension paid on top, £/year. */
  employerPension: number;
  /** Personal Allowance at this pay (tapered over £100,000), £. */
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoan: number;
  /** Income Tax + NI + student loan, £/year. */
  totalDeductions: number;
  /** Cash take-home, £/year, £/month, £/week. */
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  takeHomeWeekly: number;
  /** Gross pay per hour worked, £. */
  grossHourly: number;
  /** Cash take-home per hour worked, £. */
  takeHomeHourly: number;
  /** Deductions as a share of gross pay, 0–100. */
  effectiveDeductionPercent: number;
  /** Take-home as a share of gross pay, 0–100. */
  keepPercent: number;
  /** Tax + NI + loan on the next £100 of pay, 0–100. */
  marginalRatePercent: number;
  /** Gross pay + employer pension — the like-for-like offer value, £/year. */
  totalReward: number;
  /** Take-home + employee pension + employer pension — cash plus everything banked in the pension, £/year. */
  totalValue: number;
  /** Pay passes £50,270 — the 40% band has started. */
  crossesHigherRate: boolean;
  /** Pay is inside £100,000–£125,140 — the Personal Allowance is being withdrawn (the 60% tax trap). */
  inTaperZone: boolean;
  /** Pay is at or over £125,140 — the Personal Allowance has gone completely. */
  allowanceGone: boolean;
}

export interface SalaryComparisonResult {
  a: OfferBreakdown;
  b: OfferBreakdown;
  /** Salary B gross pay − Salary A gross pay, £/year. */
  grossDifference: number;
  /** Salary B take-home − Salary A take-home, £/year and £/month. */
  takeHomeDifferenceAnnual: number;
  takeHomeDifferenceMonthly: number;
  /**
   * The take-home difference as a share of the gross difference,
   * 0–100 — "you keep X% of the rise". Null when the two gross
   * pays are equal (there is no rise to share out).
   */
  keepPercentOfDifference: number | null;
  /** Salary B total reward − Salary A total reward, £/year. */
  totalRewardDifference: number;
  /** Which offer pays more cash take-home. */
  takeHomeWinner: "A" | "B" | "equal";
  /** Which offer is worth more on total reward (gross + employer pension). */
  totalRewardWinner: "A" | "B" | "equal";
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clampPercent(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function deductionsAt(
  pay: number,
  loanInput: {
    undergraduatePlan: StudentLoanPlanId | null;
    hasPostgraduateLoan: boolean;
  },
): number {
  return (
    incomeTaxFor(pay) +
    employeeNiFor(pay) +
    calculateStudentLoan({ annualIncome: pay, ...loanInput }).totalAnnual
  );
}

function calculateOffer(
  input: SalaryOfferInput,
  loanInput: {
    undergraduatePlan: StudentLoanPlanId | null;
    hasPostgraduateLoan: boolean;
  },
): OfferBreakdown {
  const grossSalary = Math.max(0, input.salary || 0);
  const bonus = Math.max(0, input.bonus || 0);
  const grossPay = grossSalary + bonus;
  const employeePension =
    (grossSalary * clampPercent(input.employeePensionPercent)) / 100;
  const employerPension =
    (grossSalary * clampPercent(input.employerPensionPercent)) / 100;
  const pay = grossPay - employeePension;

  const personalAllowance = personalAllowanceFor(pay);
  const incomeTax = incomeTaxFor(pay);
  const nationalInsurance = employeeNiFor(pay);
  const studentLoan = calculateStudentLoan({
    annualIncome: pay,
    ...loanInput,
  }).totalAnnual;
  const totalDeductions = incomeTax + nationalInsurance + studentLoan;
  const takeHome = pay - totalDeductions;

  const hours =
    input.hoursPerWeek && input.hoursPerWeek > 0 ? input.hoursPerWeek : 37.5;
  const annualHours = hours * 52;

  // The marginal rate is measured, not tabled: run the same bands
  // £100 higher and see what the extra £100 loses. Inside the
  // taper this picks up the withdrawn allowance on its own —
  // £100 more pay, £50 less allowance, £150 more taxable income.
  const marginalRatePercent =
    pay > 0
      ? round2(deductionsAt(pay + 100, loanInput) - deductionsAt(pay, loanInput))
      : 0;

  return {
    grossSalary: round2(grossSalary),
    bonus: round2(bonus),
    grossPay: round2(grossPay),
    employeePension: round2(employeePension),
    payAfterPension: round2(pay),
    employerPension: round2(employerPension),
    personalAllowance: round2(personalAllowance),
    taxableIncome: round2(Math.max(0, pay - personalAllowance)),
    incomeTax: round2(incomeTax),
    nationalInsurance: round2(nationalInsurance),
    studentLoan: round2(studentLoan),
    totalDeductions: round2(totalDeductions),
    takeHomeAnnual: round2(takeHome),
    takeHomeMonthly: round2(takeHome / 12),
    takeHomeWeekly: round2(takeHome / 52),
    grossHourly: round2(grossPay / annualHours),
    takeHomeHourly: round2(takeHome / annualHours),
    effectiveDeductionPercent:
      grossPay > 0 ? round2((totalDeductions / grossPay) * 100) : 0,
    keepPercent: grossPay > 0 ? round2((takeHome / grossPay) * 100) : 100,
    marginalRatePercent,
    totalReward: round2(grossPay + employerPension),
    totalValue: round2(takeHome + employeePension + employerPension),
    crossesHigherRate:
      pay > INCOME_TAX.personalAllowance + INCOME_TAX.basicRateBand,
    inTaperZone:
      pay > INCOME_TAX.allowanceTaperThreshold &&
      pay < INCOME_TAX.additionalRateThreshold,
    allowanceGone: pay >= INCOME_TAX.additionalRateThreshold,
  };
}

export function calculateSalaryComparison(
  input: SalaryComparisonInput,
): SalaryComparisonResult {
  const loanInput = {
    undergraduatePlan: input.undergraduatePlan ?? null,
    hasPostgraduateLoan: input.hasPostgraduateLoan ?? false,
  };
  const a = calculateOffer(input.a, loanInput);
  const b = calculateOffer(input.b, loanInput);

  const grossDifference = b.grossPay - a.grossPay;
  const takeHomeDifference = b.takeHomeAnnual - a.takeHomeAnnual;
  const totalRewardDifference = b.totalReward - a.totalReward;

  return {
    a,
    b,
    grossDifference: round2(grossDifference),
    takeHomeDifferenceAnnual: round2(takeHomeDifference),
    takeHomeDifferenceMonthly: round2(takeHomeDifference / 12),
    keepPercentOfDifference:
      grossDifference !== 0
        ? round2((takeHomeDifference / grossDifference) * 100)
        : null,
    totalRewardDifference: round2(totalRewardDifference),
    takeHomeWinner:
      takeHomeDifference > 0.005 ? "B" : takeHomeDifference < -0.005 ? "A" : "equal",
    totalRewardWinner:
      totalRewardDifference > 0.005
        ? "B"
        : totalRewardDifference < -0.005
          ? "A"
          : "equal",
  };
}
