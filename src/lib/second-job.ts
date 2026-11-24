import { EMPLOYEE_NI, INCOME_TAX } from "./rates.ts";
import { calculatePayslip } from "./payslip.ts";
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
 * Second job tax — two PAYE jobs taxed together, UK 2026/27
 * (England, Wales and Northern Ireland Income Tax bands; Scotland
 * sets its own bands, which this hub does not hold — the page says
 * so. National Insurance is UK-wide, so the NI figures hold for
 * Scotland too).
 *
 * THE TWO RULES THE WHOLE TOOL TURNS ON:
 *   - Income Tax is charged on the COMBINED income of both jobs,
 *     with ONE Personal Allowance between them (tapered away over
 *     £100,000 of combined income). The band maths is the verified
 *     incomeTaxFor() in takehome.ts, fed the combined figure.
 *   - Employee National Insurance is calculated PER JOB: each
 *     employment gets its own Primary Threshold (£12,570 a year)
 *     and its own Upper Earnings Limit (£50,270), exactly as HMRC's
 *     Class 1 rules work them — employeeNiFor() applied to each
 *     job separately. This is the behaviour most simple tools get
 *     wrong (they run NI on the combined salary and overstate it):
 *     a £35,000 job plus a £10,000 job pays NI of £1,794.40, all on
 *     the first job, and £0 on the second — not the £2,594.40 a
 *     single £45,000 salary would pay. GOV.UK basis: "Rates and
 *     thresholds for employers 2026 to 2027" (Class 1 thresholds
 *     are per employment), verified 7 November 2026 via rates.ts.
 *
 * Student loan: the annual liability is worked out on the TOTAL
 * income over the plan threshold, through calculateStudentLoan()
 * in student-loan.ts — not per job. (In-year, each employer
 * deducts on that job alone, so the payslip estimate below does
 * not try to split the loan; the page says so.)
 *
 * Pension / salary sacrifice: an optional percentage of each
 * job's pay, taken off that job's pay BEFORE tax, National
 * Insurance and student loan — the salary-sacrifice / net-pay
 * basis. It is labelled as that basis in the component and on the
 * page; a relief-at-source scheme (where the provider claims the
 * basic-rate relief and NI is charged on the full pay) gives a
 * slightly different NI figure, and the page says so.
 *
 * THE PAYSLIP ESTIMATE: alongside the true liability, the result
 * shows what the two employers will actually deduct in the year,
 * using the verified payslip engine (calculatePayslip in
 * payslip.ts) on each job with the tax code that job carries:
 *   - Job 1 carries the chosen share of the Personal Allowance as
 *     a normal numbered code (100% share = 1257L).
 *   - Job 2 carries BR (20% flat), D0 (40% flat), D1 (45% flat),
 *     0T (no allowance), or a normal code holding the REST of the
 *     allowance when the allowance is split.
 *   The gap between the two employers' total and the true
 *   liability is the over- or under-payment HMRC settles after
 *   the year ends (P800) or by adjusting a code — the refund
 *   story the page explains. The estimate annualises each job's
 *   monthly pay, like the payslip generator does; a code changed
 *   mid-year changes the in-year picture, and the page says so.
 */

export type SecondJobTaxCodeChoice = "BR" | "D0" | "D1" | "0T" | "SPLIT";

export interface SecondJobInput {
  /** Main job gross salary, £/year. */
  job1Salary: number;
  /** Second job gross salary, £/year. */
  job2Salary: number;
  /** Pension / salary sacrifice on job 1, % of that job's pay (0–100). */
  job1PensionPercent?: number;
  /** Pension / salary sacrifice on job 2, % of that job's pay (0–100). */
  job2PensionPercent?: number;
  /**
   * Share of the Personal Allowance placed on job 1, % (0–100).
   * The rest sits on job 2. Default 100 — the usual HMRC setup.
   * This changes only what is deducted through the payslips, never
   * the year's true bill.
   */
  allowanceOnJob1Percent?: number;
  /** The tax code the second job carries, for the payslip estimate. */
  job2TaxCode?: SecondJobTaxCodeChoice;
  /** Undergraduate student loan plan, if any. */
  undergraduatePlan?: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is also held. */
  hasPostgraduateLoan?: boolean;
}

export interface SecondJobBreakdown {
  /** Gross salary of this job, £/year. */
  gross: number;
  /** Pension / sacrifice taken from this job, £/year. */
  pension: number;
  /** Pay left after the pension deduction, £/year. */
  payAfterPension: number;
  /**
   * Income Tax attributed to this job, £/year. Job 1 carries the
   * tax it would pay standing alone; job 2 carries the EXTRA tax
   * the combined calculation adds on top of that — the marginal
   * cost of the second job.
   */
  incomeTax: number;
  /** Employee National Insurance on this job alone, £/year. */
  nationalInsurance: number;
  /** Student loan attributed the same way as the tax, £/year. */
  studentLoan: number;
  /** Cash take-home from this job after its attributed deductions. */
  takeHome: number;
}

export interface SecondJobPayslipEstimate {
  /** The tax code job 1 is modelled with, e.g. "1257L". */
  job1Code: string;
  /** Income Tax job 1's employer deducts over the year, £. */
  job1TaxDeducted: number;
  /** The tax code job 2 is modelled with, e.g. "BR" or "629L". */
  job2Code: string;
  /** Income Tax job 2's employer deducts over the year, £. */
  job2TaxDeducted: number;
  /** Both employers' Income Tax added together, £/year. */
  totalTaxDeducted: number;
  /** The year's true Income Tax liability, £. */
  trueIncomeTax: number;
  /**
   * totalTaxDeducted − trueIncomeTax, £/year. Positive: too much
   * was deducted — a refund is due. Negative: too little — HMRC
   * will collect the rest.
   */
  difference: number;
  differencePerMonth: number;
}

export interface SecondJobResult {
  job1: SecondJobBreakdown;
  job2: SecondJobBreakdown;
  /** Both gross salaries added together, £/year. */
  combinedGross: number;
  /** Both jobs' pay after pension deductions, £/year. */
  combinedPay: number;
  /** Total pension / sacrifice across both jobs, £/year. */
  totalPension: number;
  /** The single Personal Allowance for the combined income, £. */
  personalAllowance: number;
  taxableIncome: number;
  /** True Income Tax on the combined income, £/year. */
  incomeTax: number;
  totalNationalInsurance: number;
  totalStudentLoan: number;
  totalDeductions: number;
  /** Combined take-home pay, £/year and £/month. */
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  /** Cash kept from the second job after everything it causes, £/year. */
  keepFromJob2Annual: number;
  keepFromJob2Monthly: number;
  /** Of each £100 the second job pays (gross), how much is kept, £. */
  keepPer100: number;
  /** Share of the second job's gross pay lost to pension + the extra tax, NI and loan it causes, 0–100. */
  job2DeductionPercent: number;
  /** Combined pay passes £50,270 — some of the second job is taxed at 40%. */
  crossesHigherRate: boolean;
  /** Combined pay is over £100,000 — the Personal Allowance is tapering. */
  inTaperZone: boolean;
  /** Job 2's pay passes its own £12,570 Primary Threshold, so it pays NI. */
  job2PaysNi: boolean;
  payslip: SecondJobPayslipEstimate;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clampPercent(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/**
 * The numbered tax code that carries an allowance of `allowance`
 * pounds, as HMRC builds it: the tax-free amount with its final
 * digit replaced by a letter. Allowances land on a whole £10;
 * anything at or below zero is a 0T code.
 */
function codeForAllowance(allowance: number): string {
  const floored = Math.floor(Math.max(0, allowance) / 10) * 10;
  if (floored <= 0) return "0T";
  return `${floored / 10}L`;
}

/** What one employer deducts in Income Tax over a year on `pay`. */
function employerTaxFor(pay: number, taxCode: string): number {
  if (pay <= 0) return 0;
  return calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: pay / 12,
    taxCode,
  }).incomeTaxAnnual;
}

export function calculateSecondJob(input: SecondJobInput): SecondJobResult {
  const gross1 = Math.max(0, input.job1Salary || 0);
  const gross2 = Math.max(0, input.job2Salary || 0);
  const pension1 = (gross1 * clampPercent(input.job1PensionPercent)) / 100;
  const pension2 = (gross2 * clampPercent(input.job2PensionPercent)) / 100;
  const pay1 = gross1 - pension1;
  const pay2 = gross2 - pension2;
  const combinedPay = pay1 + pay2;

  // --- the true liability -------------------------------------------
  const personalAllowance = personalAllowanceFor(combinedPay);
  const incomeTax = incomeTaxFor(combinedPay);
  const ni1 = employeeNiFor(pay1);
  const ni2 = employeeNiFor(pay2);
  const loanInput = {
    undergraduatePlan: input.undergraduatePlan ?? null,
    hasPostgraduateLoan: input.hasPostgraduateLoan ?? false,
  };
  const loanCombined = calculateStudentLoan({
    annualIncome: combinedPay,
    ...loanInput,
  }).totalAnnual;
  const loanJob1Alone = calculateStudentLoan({
    annualIncome: pay1,
    ...loanInput,
  }).totalAnnual;

  // Job 1 standing alone, then job 2 as everything it adds.
  const taxJob1Alone = incomeTaxFor(pay1);
  const extraTax = incomeTax - taxJob1Alone;
  const extraLoan = loanCombined - loanJob1Alone;

  const job1: SecondJobBreakdown = {
    gross: round2(gross1),
    pension: round2(pension1),
    payAfterPension: round2(pay1),
    incomeTax: round2(taxJob1Alone),
    nationalInsurance: round2(ni1),
    studentLoan: round2(loanJob1Alone),
    takeHome: round2(pay1 - taxJob1Alone - ni1 - loanJob1Alone),
  };
  const job2: SecondJobBreakdown = {
    gross: round2(gross2),
    pension: round2(pension2),
    payAfterPension: round2(pay2),
    incomeTax: round2(extraTax),
    nationalInsurance: round2(ni2),
    studentLoan: round2(extraLoan),
    takeHome: round2(pay2 - extraTax - ni2 - extraLoan),
  };

  const totalNi = ni1 + ni2;
  const totalDeductions = incomeTax + totalNi + loanCombined;
  const takeHome = combinedPay - totalDeductions;

  // --- the payslip estimate ------------------------------------------
  const split = clampPercent(input.allowanceOnJob1Percent ?? 100) / 100;
  const allowanceJob1 = personalAllowance * split;
  const allowanceJob2 = personalAllowance - allowanceJob1;
  const job1Code = codeForAllowance(allowanceJob1);
  const choice = input.job2TaxCode ?? "BR";
  const job2Code =
    choice === "SPLIT" ? codeForAllowance(allowanceJob2) : choice;
  const job1TaxDeducted = employerTaxFor(pay1, job1Code);
  const job2TaxDeducted = employerTaxFor(pay2, job2Code);
  const totalDeducted = job1TaxDeducted + job2TaxDeducted;
  const difference = totalDeducted - incomeTax;

  return {
    job1,
    job2,
    combinedGross: round2(gross1 + gross2),
    combinedPay: round2(combinedPay),
    totalPension: round2(pension1 + pension2),
    personalAllowance: round2(personalAllowance),
    taxableIncome: round2(Math.max(0, combinedPay - personalAllowance)),
    incomeTax: round2(incomeTax),
    totalNationalInsurance: round2(totalNi),
    totalStudentLoan: round2(loanCombined),
    totalDeductions: round2(totalDeductions),
    takeHomeAnnual: round2(takeHome),
    takeHomeMonthly: round2(takeHome / 12),
    keepFromJob2Annual: round2(job2.takeHome),
    keepFromJob2Monthly: round2(job2.takeHome / 12),
    keepPer100:
      gross2 > 0 ? round2((job2.takeHome / gross2) * 100) : 100,
    job2DeductionPercent:
      gross2 > 0
        ? round2(100 - (job2.takeHome / gross2) * 100)
        : 0,
    crossesHigherRate:
      combinedPay > INCOME_TAX.personalAllowance + INCOME_TAX.basicRateBand,
    inTaperZone: combinedPay > INCOME_TAX.allowanceTaperThreshold,
    job2PaysNi: pay2 > EMPLOYEE_NI.primaryThresholdAnnual,
    payslip: {
      job1Code,
      job1TaxDeducted: round2(job1TaxDeducted),
      job2Code,
      job2TaxDeducted: round2(job2TaxDeducted),
      totalTaxDeducted: round2(totalDeducted),
      trueIncomeTax: round2(incomeTax),
      difference: round2(difference),
      differencePerMonth: round2(difference / 12),
    },
  };
}
