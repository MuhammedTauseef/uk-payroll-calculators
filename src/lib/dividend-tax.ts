import { DIVIDEND_TAX, EMPLOYER_NI, INCOME_TAX } from "./rates.ts";
import { calculateCorporationTax } from "./corporation-tax.ts";
import {
  calculateStudentLoan,
  type StudentLoanPlanId,
} from "./student-loan.ts";
import { employeeNiFor, personalAllowanceFor } from "./takehome.ts";

/**
 * Dividend tax — personal tax on salary + dividends, UK 2026/27.
 *
 * Rates basis: GOV.UK "Tax on dividends", fetched and checked on
 * 23 November 2026, agreeing exactly with DIVIDEND_TAX in
 * rates.ts (verified there on 9 November 2026): a £500 dividend
 * allowance each year, then 10.75% at the basic rate, 35.75% at
 * the higher rate and 39.35% at the additional rate. GOV.UK's own
 * worked example on that page — £29,570 of wages plus £3,000 of
 * dividends pays 10.75% on £2,500 of dividends (£268.75) — is
 * reproduced as a verification case in
 * scripts/verify-dividend-tax.ts.
 *
 * THE STACKING — the part tools get wrong, and the order this
 * engine follows (GOV.UK: "add your total dividend income to your
 * other income... you may pay tax at more than one rate"):
 *   1. One Personal Allowance for the TOTAL income (salary +
 *      other income + dividends), tapered by £1 for every £2 over
 *      £100,000 — personalAllowanceFor() in takehome.ts, fed the
 *      total, not the salary alone.
 *   2. The allowance is set against non-dividend income FIRST
 *      (salary, then other income); dividends, the top slice,
 *      take whatever allowance is left.
 *   3. Taxable income then fills the bands in the same order:
 *      non-dividend income first at the salary rates (20% / 40% /
 *      45% on the England, Wales and Northern Ireland bands in
 *      INCOME_TAX), dividends stacked on top of it.
 *   4. The £500 dividend allowance sits INSIDE the bands: the
 *      first £500 of dividends in the taxable stack is charged at
 *      0% but still uses up band room, pushing later dividends
 *      higher. The rest is charged slice by slice at the dividend
 *      rate of the band each slice lands in.
 *
 * National Insurance: employee Class 1 on the salary only
 * (employeeNiFor in takehome.ts) — dividends and other income
 * carry no employee NI, which is most of why directors take them.
 * Employer NI on the salary (15% over the £5,000 secondary
 * threshold, EMPLOYER_NI in rates.ts) is a COMPANY cost: it is
 * reported separately and is NOT taken off the personal
 * take-home here — but in the optimiser below it comes out of
 * the company's profit before anything is shared out.
 *
 * Salary sacrifice: the optional pension £ comes off the salary
 * before tax, NI and student loan (the salary-sacrifice basis),
 * exactly as in second-job.ts. It also reduces the employer NI
 * base, as a real sacrifice does.
 *
 * Student loan: the year's liability on the TOTAL income over
 * the plan threshold, through calculateStudentLoan() in
 * student-loan.ts — the Self Assessment basis, which is the one
 * that applies to dividend income (PAYE only ever sees the
 * salary). The Self Assessment set-aside this page quotes is
 * therefore the dividend tax plus the student loan: the two
 * amounts PAYE does not collect.
 *
 * SCOTLAND: dividend tax is charged at the same rates, with the
 * same £500 allowance, everywhere in the UK — dividends are not
 * devolved. What differs for a Scottish taxpayer is the tax on
 * the SALARY underneath, which uses Scotland's own bands; this
 * hub's engines hold the England, Wales and Northern Ireland
 * bands, so the salary figures here are on those bands and the
 * page says so plainly.
 */

export interface DividendTaxInput {
  /** Gross salary, £/year (before any salary sacrifice). */
  salary: number;
  /** Gross dividends, £/year. */
  dividends: number;
  /** Other non-savings income (rental profit, pension...), £/year. */
  otherIncome?: number;
  /** Salary-sacrifice pension taken off the salary, £/year. */
  salarySacrificePension?: number;
  /** Undergraduate student loan plan, if any. */
  undergraduatePlan?: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is also held. */
  hasPostgraduateLoan?: boolean;
}

export type DividendBandId =
  | "personal-allowance"
  | "dividend-allowance"
  | "basic"
  | "higher"
  | "additional";

export interface DividendSlice {
  band: DividendBandId;
  /** The slice of dividends in this band, £. */
  amount: number;
  /** Dividend tax rate charged on the slice, 0–1. */
  rate: number;
  /** Tax on the slice, £. */
  tax: number;
}

export interface IncomeBandSlice {
  band: "basic" | "higher" | "additional";
  /** The slice of non-dividend taxable income in this band, £. */
  amount: number;
  /** Salary Income Tax rate charged on the slice, 0–1. */
  rate: number;
  /** Tax on the slice, £. */
  tax: number;
}

export interface DividendTaxResult {
  /** Gross salary entered, £/year. */
  salary: number;
  /** Salary sacrifice taken off the salary, £/year. */
  salarySacrifice: number;
  /** Salary left after the sacrifice — the pay actually taxed, £/year. */
  payAfterSacrifice: number;
  /** Gross dividends entered, £/year. */
  dividends: number;
  /** Other income entered, £/year. */
  otherIncome: number;
  /** Salary (after sacrifice) + other income + dividends, £/year. */
  totalIncome: number;
  /** The single Personal Allowance for the total income, £. */
  personalAllowance: number;
  /** Of the allowance, the part used by salary + other income, £. */
  allowanceUsedByOtherIncome: number;
  /** Of the allowance, the part left covering dividends, £. */
  allowanceUsedByDividends: number;
  /** Taxable non-dividend income (after the allowance), £. */
  nonDividendTaxable: number;
  /** Income Tax on the salary + other income, £/year. */
  nonDividendTax: number;
  /** The salary-tax band slices behind nonDividendTax. */
  nonDividendSlices: IncomeBandSlice[];
  /** The dividend stack, slice by slice, in order. */
  dividendSlices: DividendSlice[];
  /** Total dividend tax, £/year. */
  dividendTax: number;
  /** Employee National Insurance on the salary, £/year. */
  employeeNi: number;
  /** Employer National Insurance on the salary — a company cost, £/year. */
  employerNi: number;
  /** Student loan on the total income, £/year. */
  studentLoan: number;
  /** Salary tax + dividend tax (excludes NI and loan), £/year. */
  totalIncomeTax: number;
  /** Cash take-home: pay received less tax, NI and loan, £/year. */
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  /** Dividend tax + student loan — what Self Assessment collects, £/year. */
  selfAssessmentSetAsideAnnual: number;
  selfAssessmentSetAsideMonthly: number;
  /** Total income over £100,000 — the Personal Allowance is tapering. */
  inTaperZone: boolean;
  /** Some dividends land in the higher or additional band. */
  dividendsReachHigherBands: boolean;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

type BandId = "basic" | "higher" | "additional";

interface RawSlice {
  band: BandId;
  amount: number;
  rate: number;
  tax: number;
}

/**
 * Charge `amount` of taxable income that starts at position
 * `start` in the taxable stack, slice by slice, at the three
 * band rates given. Band edges are the INCOME_TAX taxable-income
 * edges: basic to £37,700, higher to £125,140, additional above.
 * Slice tax is returned unrounded; callers round the total.
 */
function bandSlices(
  start: number,
  amount: number,
  rates: { basic: number; higher: number; additional: number },
): RawSlice[] {
  const edges: { band: BandId; from: number; to: number; rate: number }[] = [
    { band: "basic", from: 0, to: INCOME_TAX.basicRateBand, rate: rates.basic },
    {
      band: "higher",
      from: INCOME_TAX.basicRateBand,
      to: INCOME_TAX.additionalRateThreshold,
      rate: rates.higher,
    },
    {
      band: "additional",
      from: INCOME_TAX.additionalRateThreshold,
      to: Number.POSITIVE_INFINITY,
      rate: rates.additional,
    },
  ];
  const slices: RawSlice[] = [];
  let pos = Math.max(0, start);
  let left = Math.max(0, amount);
  for (const edge of edges) {
    if (left <= 0) break;
    if (pos >= edge.to) continue;
    const take = Math.min(left, edge.to - pos);
    if (take > 0) {
      slices.push({
        band: edge.band,
        amount: take,
        rate: edge.rate,
        tax: take * edge.rate,
      });
      pos += take;
      left -= take;
    }
  }
  return slices;
}

export function calculateDividendTax(
  input: DividendTaxInput,
): DividendTaxResult {
  const grossSalary = Math.max(0, input.salary || 0);
  const sacrifice = Math.min(
    grossSalary,
    Math.max(0, input.salarySacrificePension || 0),
  );
  const pay = grossSalary - sacrifice;
  const other = Math.max(0, input.otherIncome || 0);
  const dividends = Math.max(0, input.dividends || 0);

  const nonDividendIncome = pay + other;
  const totalIncome = nonDividendIncome + dividends;

  // 1–2. One allowance for the total, set against non-dividend
  // income first; dividends take what is left.
  const personalAllowance = personalAllowanceFor(totalIncome);
  const allowanceToNonDividend = Math.min(personalAllowance, nonDividendIncome);
  const allowanceToDividends = personalAllowance - allowanceToNonDividend;

  // 3. Non-dividend income fills the bands first, at salary rates.
  const nonDividendTaxable = nonDividendIncome - allowanceToNonDividend;
  const nonDividendRaw = bandSlices(0, nonDividendTaxable, {
    basic: INCOME_TAX.basicRate,
    higher: INCOME_TAX.higherRate,
    additional: INCOME_TAX.additionalRate,
  });
  const nonDividendTaxRaw = nonDividendRaw.reduce((s, x) => s + x.tax, 0);

  // 4. Dividends stack on top: allowance first, then the £500
  // dividend allowance inside the bands, then band by band.
  const dividendSlices: DividendSlice[] = [];
  if (allowanceToDividends > 0) {
    dividendSlices.push({
      band: "personal-allowance",
      amount: round2(allowanceToDividends),
      rate: 0,
      tax: 0,
    });
  }
  const dividendsInBands = dividends - allowanceToDividends;
  const dividendAllowancePart = Math.min(
    DIVIDEND_TAX.allowance,
    Math.max(0, dividendsInBands),
  );
  if (dividendAllowancePart > 0) {
    dividendSlices.push({
      band: "dividend-allowance",
      amount: round2(dividendAllowancePart),
      rate: 0,
      tax: 0,
    });
  }
  const rest = Math.max(0, dividendsInBands - dividendAllowancePart);
  const restStart = nonDividendTaxable + dividendAllowancePart;
  const restRaw = bandSlices(restStart, rest, {
    basic: DIVIDEND_TAX.basicRate,
    higher: DIVIDEND_TAX.higherRate,
    additional: DIVIDEND_TAX.additionalRate,
  });
  let dividendTaxRaw = 0;
  for (const s of restRaw) {
    dividendTaxRaw += s.tax;
    dividendSlices.push({
      band: s.band,
      amount: round2(s.amount),
      rate: s.rate,
      tax: round2(s.tax),
    });
  }

  const employeeNi = employeeNiFor(pay);
  const employerNi =
    Math.max(0, pay - EMPLOYER_NI.secondaryThresholdAnnual) * EMPLOYER_NI.rate;
  const studentLoan = calculateStudentLoan({
    annualIncome: totalIncome,
    undergraduatePlan: input.undergraduatePlan ?? null,
    hasPostgraduateLoan: input.hasPostgraduateLoan ?? false,
  }).totalAnnual;

  const nonDividendTax = round2(nonDividendTaxRaw);
  const dividendTax = round2(dividendTaxRaw);
  const cashIn = pay + other + dividends;
  const takeHome =
    cashIn - nonDividendTax - dividendTax - employeeNi - studentLoan;
  const setAside = dividendTax + studentLoan;

  return {
    salary: round2(grossSalary),
    salarySacrifice: round2(sacrifice),
    payAfterSacrifice: round2(pay),
    dividends: round2(dividends),
    otherIncome: round2(other),
    totalIncome: round2(totalIncome),
    personalAllowance: round2(personalAllowance),
    allowanceUsedByOtherIncome: round2(allowanceToNonDividend),
    allowanceUsedByDividends: round2(allowanceToDividends),
    nonDividendTaxable: round2(nonDividendTaxable),
    nonDividendTax,
    nonDividendSlices: nonDividendRaw.map((s) => ({
      band: s.band,
      amount: round2(s.amount),
      rate: s.rate,
      tax: round2(s.tax),
    })),
    dividendSlices,
    dividendTax,
    employeeNi: round2(employeeNi),
    employerNi: round2(employerNi),
    studentLoan: round2(studentLoan),
    totalIncomeTax: round2(nonDividendTax + dividendTax),
    takeHomeAnnual: round2(takeHome),
    takeHomeMonthly: round2(takeHome / 12),
    selfAssessmentSetAsideAnnual: round2(setAside),
    selfAssessmentSetAsideMonthly: round2(setAside / 12),
    inTaperZone: totalIncome > INCOME_TAX.allowanceTaperThreshold,
    dividendsReachHigherBands: restRaw.some((s) => s.band !== "basic"),
  };
}

/**
 * THE OPTIMISER — the split neither competitor works out.
 *
 * Given the company's profit BEFORE the director's pay (the
 * profit the company has to share out), this searches director
 * salaries from £5,000 to £50,270 — every £250, plus £12,570 and
 * the £50,270 band top exactly — and for each one runs the whole
 * loop honestly:
 *   salary + employer NI come out of the profit (both are
 *   deductible), Corporation Tax is charged on what is left
 *   (calculateCorporationTax, one company, so the full £50,000 /
 *   £250,000 limits), every remaining pound of after-tax profit
 *   is taken as dividends, and the personal tax on the pair is
 *   worked by calculateDividendTax.
 * The winner is the split with the highest personal take-home;
 * the top three are returned for the comparison table.
 *
 * Stated assumptions (also stated on the page): a 12-month
 * accounting period, one company with no associates, no other
 * income, no pension contributions, and all after-tax profit
 * actually paid out as dividends in the same tax year.
 *
 * AFFORDABILITY: a salary is only searched if the company can
 * pay it out of the profit — salary + the employer NI on it
 * must not exceed the profit. (Without that rule the search
 * "wins" by paying a £50,000 salary out of £50,000 of profit
 * and quietly ignoring the £6,750 of employer NI the company
 * does not have.) The exact affordability boundary — every
 * pound of profit taken as salary — is itself a candidate.
 */
export interface SalaryDividendOptimiserInput {
  /** Company profit before director's salary and employer NI, £. */
  profit: number;
  /** Undergraduate student loan plan, if any. */
  undergraduatePlan?: StudentLoanPlanId | null;
  /** True when a Postgraduate Loan is also held. */
  hasPostgraduateLoan?: boolean;
}

export interface SalaryDividendSplit {
  /** Director's salary in this split, £/year. */
  salary: number;
  /** Employer NI on that salary — a company cost, £/year. */
  employerNi: number;
  /** Profit left for Corporation Tax after salary + employer NI, £. */
  taxableProfit: number;
  /** Corporation Tax on that profit, £. */
  corporationTax: number;
  /** Dividends paid from the after-tax profit, £. */
  dividends: number;
  /** Personal Income Tax (salary tax + dividend tax), £/year. */
  personalTax: number;
  /** Employee NI on the salary, £/year. */
  employeeNi: number;
  /** Student loan for the year, £. */
  studentLoan: number;
  /** Personal take-home from the split, £/year. */
  takeHome: number;
  takeHomeMonthly: number;
}

export interface SalaryDividendOptimiserResult {
  /** Company profit the search ran on, £. */
  profit: number;
  /** The winning split. */
  best: SalaryDividendSplit;
  /** The three best splits, best first. */
  topSplits: SalaryDividendSplit[];
  /** How many salary points were evaluated. */
  evaluatedCount: number;
}

/**
 * One named split, worked end to end — exported for
 * verification. This is the raw mechanics (taxable profit
 * floored at £0); the optimiser above is what restricts the
 * search to salaries the profit can actually afford.
 */
export function salaryDividendSplitFor(
  profit: number,
  salary: number,
  loan?: {
    undergraduatePlan?: StudentLoanPlanId | null;
    hasPostgraduateLoan?: boolean;
  },
): SalaryDividendSplit {
  const p = Math.max(0, profit || 0);
  const s = Math.max(0, salary || 0);
  const employerNi =
    Math.max(0, s - EMPLOYER_NI.secondaryThresholdAnnual) * EMPLOYER_NI.rate;
  const taxableProfit = Math.max(0, p - s - employerNi);
  const ct = calculateCorporationTax({
    profit: taxableProfit,
    associatedCompanies: 1,
  });
  const dividends = Math.max(0, taxableProfit - ct.tax);
  const personal = calculateDividendTax({
    salary: s,
    dividends,
    undergraduatePlan: loan?.undergraduatePlan ?? null,
    hasPostgraduateLoan: loan?.hasPostgraduateLoan ?? false,
  });
  return {
    salary: round2(s),
    employerNi: round2(employerNi),
    taxableProfit: round2(taxableProfit),
    corporationTax: ct.tax,
    dividends: round2(dividends),
    personalTax: personal.totalIncomeTax,
    employeeNi: personal.employeeNi,
    studentLoan: personal.studentLoan,
    takeHome: personal.takeHomeAnnual,
    takeHomeMonthly: personal.takeHomeMonthly,
  };
}

export function optimiseSalaryDividend(
  input: SalaryDividendOptimiserInput,
): SalaryDividendOptimiserResult {
  const profit = Math.max(0, input.profit || 0);
  const loan = {
    undergraduatePlan: input.undergraduatePlan ?? null,
    hasPostgraduateLoan: input.hasPostgraduateLoan ?? false,
  };

  const employerNiOn = (s: number) =>
    Math.max(0, s - EMPLOYER_NI.secondaryThresholdAnnual) * EMPLOYER_NI.rate;
  const affordable = (s: number) => s + employerNiOn(s) <= profit + 1e-9;

  const candidates = new Set<number>();
  const cap = Math.min(INCOME_TAX.personalAllowance + INCOME_TAX.basicRateBand, profit);
  for (let s = 5000; s <= cap; s += 250) candidates.add(s);
  candidates.add(5000);
  candidates.add(INCOME_TAX.personalAllowance); // £12,570 exactly
  // The affordability boundary: salary + employer NI = profit.
  if (profit > 0) {
    const boundary =
      profit <= EMPLOYER_NI.secondaryThresholdAnnual
        ? profit
        : (profit + EMPLOYER_NI.secondaryThresholdAnnual * EMPLOYER_NI.rate) /
          (1 + EMPLOYER_NI.rate);
    candidates.add(Math.floor(boundary * 100) / 100);
  }
  if (candidates.size === 0) candidates.add(0);

  const splits = [...candidates]
    .filter((s) => s >= 0 && affordable(s))
    .map((s) => salaryDividendSplitFor(profit, s, loan))
    .sort((a, b) => b.takeHome - a.takeHome || a.salary - b.salary);

  const best = splits[0] ?? salaryDividendSplitFor(profit, 0, loan);
  return {
    profit: round2(profit),
    best,
    topSplits: splits.slice(0, 3),
    evaluatedCount: splits.length,
  };
}
