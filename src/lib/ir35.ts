/**
 * IR35 (off-payroll working) maths — UK.
 *
 * Every rule below was verified against GOV.UK at build time
 * (9 November 2026):
 *   - "Understanding off-payroll working (IR35)"
 *     https://www.gov.uk/guidance/understanding-off-payroll-working-ir35
 *   - "Check employment status for tax (CEST)"
 *     https://www.gov.uk/guidance/check-employment-status-for-tax
 *   - "Corporation Tax rates, expenses and reliefs"
 *     https://www.gov.uk/corporation-tax-rates
 *   - "Tax on dividends"
 *     https://www.gov.uk/tax-on-dividends
 *   - "Claim Employment Allowance"
 *     https://www.gov.uk/claim-employment-allowance
 *
 * The rules, as GOV.UK states them:
 *   - The off-payroll rules apply if a worker providing services
 *     through their own intermediary (usually a limited company, a
 *     personal service company) would have been an employee if they
 *     had provided the services directly. The rules apply
 *     contract by contract.
 *   - In most cases the CLIENT decides the worker's employment
 *     status for tax and issues a status determination statement
 *     (SDS) with reasons. Only where the client is a SMALL
 *     private-sector business does the worker's intermediary decide.
 *   - If the worker is deemed employed, the deemed employer must
 *     deduct Income Tax and employee National Insurance from the
 *     fees paid to the intermediary, and must pay employer National
 *     Insurance (and Apprenticeship Levy, where it applies) to HMRC.
 *     Deemed employers do NOT deduct student or postgraduate loan
 *     repayments — the worker pays those through Self Assessment.
 *   - HMRC's CEST tool gives HMRC's view of a worker's status, and
 *     HMRC will stand by a CEST result as long as the information
 *     given was accurate and follows its guidance. This
 *     calculator's status check is guidance only — it is not CEST
 *     and it is not a determination.
 *   - Corporation Tax: 25% main rate on profits over £250,000,
 *     19% small profits rate on profits of £50,000 or less, with
 *     Marginal Relief between the two.
 *   - Dividend tax (2026/27): a £500 dividend allowance each year,
 *     then 10.75% at the basic rate, 35.75% at the higher rate and
 *     39.35% at the additional rate.
 *   - A company with just one director who is the only employee
 *     liable for secondary Class 1 National Insurance CANNOT claim
 *     the Employment Allowance — so the employer NI on the
 *     director's salary in the outside-IR35 comparison is shown
 *     in full.
 *
 * REUSE RULE: no PAYE rate is re-derived or hard-coded here. Income
 * Tax and employee NI on the inside-IR35 leg come from the verified
 * functions in takehome.ts (incomeTaxFor, employeeNiFor); the
 * employer NI rate and thresholds, the Corporation Tax rates and the
 * dividend tax rates all come from rates.ts.
 *
 * The outside-IR35 comparison is a SIMPLIFIED limited-company model
 * with its assumptions stated on the page: one director, a salary of
 * exactly the Personal Allowance (£12,570), no other income, no
 * expenses, no pension contributions, no VAT, and every pound of
 * post-tax profit taken as dividends in the same tax year. Real
 * companies keep money in the company, pay pension contributions
 * and time dividends — all of which change the answer — so the
 * comparison is a like-for-like starting point, not advice.
 */
import {
  CORPORATION_TAX,
  DIVIDEND_TAX,
  EMPLOYER_NI,
  INCOME_TAX,
} from "./rates.ts";
import {
  employeeNiFor,
  incomeTaxFor,
  personalAllowanceFor,
} from "./takehome.ts";

/** The director's salary in the simplified outside-IR35 model, £/year. */
export const OUTSIDE_SALARY = INCOME_TAX.personalAllowance;

/**
 * The eight status factors behind the questionnaire. Each question
 * is worded so that the answer pointing TOWARDS employment (inside
 * IR35) is the one the question names first in its hint. The three
 * classic tests — control, substitution and mutuality of obligation —
 * come first, because HMRC's CEST tool asks about them first too.
 */
export interface Ir35Question {
  id: string;
  question: string;
  /** The answer ("yes" or "no") that points towards employment. */
  insideAnswer: "yes" | "no";
  /** What the answer means when it points towards employment. */
  insideReading: string;
  /** What the answer means when it points towards self-employment. */
  outsideReading: string;
}

export const IR35_QUESTIONS: Ir35Question[] = [
  {
    id: "control",
    insideAnswer: "yes",
    question:
      "Does the client decide what work you do, and when, where and how you do it?",
    insideReading:
      "The client controls the work — an employee's position.",
    outsideReading:
      "You decide how the work is done — a self-employed position.",
  },
  {
    id: "substitution",
    insideAnswer: "no",
    question:
      "Could you send someone else to do the work instead of you?",
    insideReading:
      "No — the client wants you personally, which points to employment.",
    outsideReading:
      "Yes, you can send a substitute — a self-employed position.",
  },
  {
    id: "mutuality",
    insideAnswer: "yes",
    question:
      "Must the client offer you work, and must you accept it when it is offered?",
    insideReading:
      "Yes, there is an obligation on both sides — an employee's position.",
    outsideReading:
      "No — either side can say no, which points to self-employment.",
  },
  {
    id: "financial-risk",
    insideAnswer: "no",
    question:
      "Do you carry financial risk — paying to put mistakes right, or going unpaid if the work is not done?",
    insideReading:
      "No — the client carries the risk, which points to employment.",
    outsideReading:
      "Yes — you carry the risk, which points to self-employment.",
  },
  {
    id: "integration",
    insideAnswer: "yes",
    question:
      "Are you treated like the client's own staff — a line manager, appraisals, staff meetings, a company email address?",
    insideReading:
      "Yes — you are part of the client's organisation, which points to employment.",
    outsideReading:
      "No — you stay outside the organisation, which points to self-employment.",
  },
  {
    id: "equipment",
    insideAnswer: "yes",
    question: "Does the client provide the equipment you work with?",
    insideReading:
      "Yes — the client provides it, which points to employment.",
    outsideReading:
      "No — you provide your own, which points to self-employment.",
  },
  {
    id: "other-clients",
    insideAnswer: "no",
    question: "Do you work for other clients at the same time?",
    insideReading:
      "No — one client only, which points to employment.",
    outsideReading:
      "Yes — several clients, which points to self-employment.",
  },
  {
    id: "benefits",
    insideAnswer: "yes",
    question:
      "Does the client pay you holiday pay, sick pay or a pension?",
    insideReading:
      "Yes — employee benefits, which point to employment.",
    outsideReading:
      "No — no employee benefits, which points to self-employment.",
  },
];

export type Ir35Verdict = "outside" | "borderline" | "inside";

export interface Ir35StatusResult {
  /** Answers pointing towards employment, out of 8. */
  insidePoints: number;
  totalQuestions: number;
  verdict: Ir35Verdict;
  headline: string;
  explanation: string;
}

/**
 * Score the eight status answers. `insideAnswers[i]` is true when
 * the answer to IR35_QUESTIONS[i] points towards employment.
 * 0–2 inside answers: likely outside. 3–5: borderline — the
 * contract needs a proper look (run HMRC's CEST tool). 6–8:
 * likely inside.
 */
export function assessStatus(insideAnswers: boolean[]): Ir35StatusResult {
  const insidePoints = insideAnswers.filter(Boolean).length;
  const totalQuestions = IR35_QUESTIONS.length;
  if (insidePoints <= 2) {
    return {
      insidePoints,
      totalQuestions,
      verdict: "outside",
      headline: "Likely outside IR35",
      explanation:
        "Most of your answers point away from employment — you decide how the work is done, you can send a substitute, and you carry your own risk. That is the shape of a genuinely self-employed engagement, but this is guidance only: run HMRC's CEST tool and keep the result with the contract.",
    };
  }
  if (insidePoints <= 5) {
    return {
      insidePoints,
      totalQuestions,
      verdict: "borderline",
      headline: "Borderline — needs a proper check",
      explanation:
        "Your answers are mixed, and mixed is where IR35 disputes live. No single factor decides it — control, substitution and mutuality of obligation carry the most weight, and the contract's written terms matter as much as the day-to-day reality. Run HMRC's CEST tool on the real contract before you agree the rate.",
    };
  }
  return {
    insidePoints,
    totalQuestions,
    verdict: "inside",
    headline: "Likely inside IR35",
    explanation:
      "Most of your answers point towards employment — the client controls the work, you cannot send a substitute, and you are treated like staff. On this shape of engagement the off-payroll rules are likely to apply, so the tax comparison below is the one that matters, and the client should be issuing a status determination statement.",
  };
}

export interface Ir35Input {
  /** Day rate charged to the client, £. */
  dayRate: number;
  /** Billable days per week. */
  daysPerWeek: number;
  /** Billable weeks per year (46 allows roughly six weeks off). */
  weeksPerYear: number;
}

export interface Ir35Comparison {
  /** dayRate × daysPerWeek × weeksPerYear, £/year. */
  grossAnnual: number;
  // Inside IR35 — deemed employment on the full contract value.
  insideIncomeTax: number;
  insideEmployeeNi: number;
  insideTakeHome: number;
  /** Employer NI the fee-payer pays on top of the contract value. */
  insideEmployerNi: number;
  /** Inside take-home as a share of the contract value, 0–100. */
  insideKeepPercent: number;
  // Outside IR35 — simplified limited-company model.
  outsideSalary: number;
  /** Income Tax on the salary slice (only above the tapered allowance). */
  outsideSalaryTax: number;
  /** Employer NI on the salary (Employment Allowance not claimable). */
  outsideEmployerNi: number;
  /** Company profit: revenue − salary − employer NI. */
  outsideProfit: number;
  outsideCorporationTax: number;
  /** Post-tax profit, all taken as dividends. */
  outsideDividends: number;
  outsideDividendTax: number;
  outsideTakeHome: number;
  outsideKeepPercent: number;
  /** outsideTakeHome − insideTakeHome, £/year (negative = inside wins). */
  difference: number;
  betterRoute: "inside" | "outside" | "equal";
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/**
 * Corporation Tax on a company profit, £/year.
 * 19% at or below £50,000, 25% at or above £250,000, Marginal
 * Relief between the two: tax = 25% × profit − 3/200 × (£250,000
 * − profit). The relief keeps the bill continuous at both ends.
 */
export function corporationTaxFor(profit: number): number {
  const p = Math.max(0, profit);
  if (p <= CORPORATION_TAX.smallProfitsLimit) {
    return p * CORPORATION_TAX.smallProfitsRate;
  }
  if (p >= CORPORATION_TAX.mainRateLimit) {
    return p * CORPORATION_TAX.mainRate;
  }
  return (
    p * CORPORATION_TAX.mainRate -
    CORPORATION_TAX.marginalReliefFraction *
      (CORPORATION_TAX.mainRateLimit - p)
  );
}

/**
 * Dividend tax on `dividends` when the worker also receives
 * `salary` in the same tax year. The salary sits at the bottom of
 * the tax bands; the Personal Allowance is worked out on the
 * combined income (taper included); the £500 dividend allowance
 * is the first £500 of the dividend slice, taxed at 0%.
 */
export function dividendTaxFor(dividends: number, salary: number): number {
  const totalIncome = Math.max(0, salary) + Math.max(0, dividends);
  const pa = personalAllowanceFor(totalIncome);
  const taxableTotal = Math.max(0, totalIncome - pa);
  // The salary occupies the bottom of the taxable income.
  const salaryTaxable = Math.max(0, salary - pa);
  const dividendTaxable = Math.max(0, taxableTotal - salaryTaxable);
  const afterAllowance = Math.max(
    0,
    dividendTaxable - DIVIDEND_TAX.allowance,
  );
  if (afterAllowance <= 0) return 0;
  // Room left in each band above the salary slice.
  const basicRoom = Math.max(0, INCOME_TAX.basicRateBand - salaryTaxable);
  const basicPart = Math.min(afterAllowance, basicRoom);
  const afterBasic = afterAllowance - basicPart;
  const higherCeiling =
    INCOME_TAX.basicRateBand +
    (INCOME_TAX.additionalRateThreshold - INCOME_TAX.basicRateBand);
  const higherRoom = Math.max(
    0,
    higherCeiling - Math.max(salaryTaxable, INCOME_TAX.basicRateBand),
  );
  const higherPart = Math.min(afterBasic, higherRoom);
  const additionalPart = afterBasic - higherPart;
  return (
    basicPart * DIVIDEND_TAX.basicRate +
    higherPart * DIVIDEND_TAX.higherRate +
    additionalPart * DIVIDEND_TAX.additionalRate
  );
}

/**
 * Income Tax on the salary slice of the outside-IR35 model. The
 * salary is £12,570 — inside the full Personal Allowance at low
 * incomes, so no tax — but once combined income passes £100,000
 * the allowance tapers and part of the salary becomes taxable at
 * the basic rate.
 */
export function salaryTaxFor(salary: number, dividends: number): number {
  const pa = personalAllowanceFor(salary + dividends);
  const salaryTaxable = Math.max(0, salary - pa);
  // The salary slice sits at the bottom of the bands, so it is
  // always taxed at the basic rate (it never reaches £37,700).
  return salaryTaxable * INCOME_TAX.basicRate;
}

export function calculateIr35(input: Ir35Input): Ir35Comparison {
  const dayRate = positive(input.dayRate);
  const daysPerWeek = positive(input.daysPerWeek);
  const weeksPerYear = positive(input.weeksPerYear);
  const grossAnnual = dayRate * daysPerWeek * weeksPerYear;

  // --- Inside IR35: deemed employment on the full contract value.
  const insideIncomeTax = incomeTaxFor(grossAnnual);
  const insideEmployeeNi = employeeNiFor(grossAnnual);
  const insideTakeHome = grossAnnual - insideIncomeTax - insideEmployeeNi;
  const insideEmployerNi =
    Math.max(0, grossAnnual - EMPLOYER_NI.secondaryThresholdAnnual) *
    EMPLOYER_NI.rate;

  // --- Outside IR35: simplified limited-company model.
  // The salary cannot exceed the contract value: a company with
  // no revenue cannot pay a £12,570 salary out of nothing.
  const outsideSalary = Math.min(OUTSIDE_SALARY, grossAnnual);
  // The salary tax depends on the combined income, so it is
  // computed once the dividends are known below.
  const outsideEmployerNi =
    Math.max(0, outsideSalary - EMPLOYER_NI.secondaryThresholdAnnual) *
    EMPLOYER_NI.rate;
  const outsideProfit = Math.max(
    0,
    grossAnnual - outsideSalary - outsideEmployerNi,
  );
  const outsideCorporationTax = corporationTaxFor(outsideProfit);
  const outsideDividends = Math.max(
    0,
    outsideProfit - outsideCorporationTax,
  );
  const outsideDividendTax = dividendTaxFor(outsideDividends, outsideSalary);
  const outsideSalaryTaxFinal = salaryTaxFor(outsideSalary, outsideDividends);
  const outsideTakeHome =
    outsideSalary -
    outsideSalaryTaxFinal +
    outsideDividends -
    outsideDividendTax;

  const difference = outsideTakeHome - insideTakeHome;

  // DISPLAY ROUNDING RULE (the house rule, as on the payslip):
  // every figure the page prints is rounded to the penny first,
  // and each printed total is then built from those rounded lines.
  const r = (n: number) => round2(n);
  const insideTaxShown = r(insideIncomeTax);
  const insideNiShown = r(insideEmployeeNi);
  const insideTakeHomeShown = r(grossAnnual - insideTaxShown - insideNiShown);
  const outsideSalaryTaxShown = r(outsideSalaryTaxFinal);
  const outsideDivTaxShown = r(outsideDividendTax);
  const outsideTakeHomeShown = r(
    outsideSalary -
      outsideSalaryTaxShown +
      r(outsideDividends) -
      outsideDivTaxShown,
  );

  return {
    grossAnnual: r(grossAnnual),
    insideIncomeTax: insideTaxShown,
    insideEmployeeNi: insideNiShown,
    insideTakeHome: insideTakeHomeShown,
    insideEmployerNi: r(insideEmployerNi),
    insideKeepPercent:
      grossAnnual > 0 ? r((insideTakeHomeShown / grossAnnual) * 100) : 100,
    outsideSalary: r(outsideSalary),
    outsideSalaryTax: outsideSalaryTaxShown,
    outsideEmployerNi: r(outsideEmployerNi),
    outsideProfit: r(outsideProfit),
    outsideCorporationTax: r(outsideCorporationTax),
    outsideDividends: r(outsideDividends),
    outsideDividendTax: outsideDivTaxShown,
    outsideTakeHome: outsideTakeHomeShown,
    outsideKeepPercent:
      grossAnnual > 0 ? r((outsideTakeHomeShown / grossAnnual) * 100) : 100,
    difference: r(outsideTakeHomeShown - insideTakeHomeShown),
    betterRoute:
      Math.abs(outsideTakeHomeShown - insideTakeHomeShown) < 0.01
        ? "equal"
        : outsideTakeHomeShown > insideTakeHomeShown
          ? "outside"
          : "inside",
  };
}
