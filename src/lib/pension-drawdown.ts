/**
 * UK pension drawdown calculator maths — 2026/27 rules.
 *
 * Model (deliberately simple, and the page says so):
 *  - Withdrawals are taken at the start of each tax year, UFPLS-style:
 *    25% of each withdrawal is tax-free until the Lump Sum Allowance
 *    (£268,275) is used up, after which withdrawals are fully taxable.
 *    An optional tax-free lump sum can be taken at the start instead.
 *  - The pot grows at the expected return after each withdrawal.
 *  - Income tax uses the 2026/27 England, Wales and Northern Ireland
 *    bands, held flat for the whole projection: personal allowance
 *    £12,570 (tapered £1 per £2 of income over £100,000), 20% to
 *    £50,270, 40% to £125,140, 45% above.
 *  - The State Pension and other income are taxed alongside the
 *    taxable part of the withdrawal. Withdrawals and the State
 *    Pension rise with inflation each year when index-linking is on.
 *  - The Monte Carlo run repeats the same engine with yearly returns
 *    drawn from a normal distribution around the expected return, so
 *    the "plans that lasted" share is comparable with the headline
 *    projection. It is an illustration of spread, not a probability
 *    about the real world.
 */

export interface DrawdownInput {
  /** Age at the start of the plan. */
  currentAge: number;
  /** Pension pot at the start, £. */
  pot: number;
  /** Tax-free lump sum taken immediately, £ (25% of pot max, LSA-capped). */
  taxFreeCashNow: number;
  /** Gross withdrawal wanted each year, in today's money, £. */
  annualWithdrawal: number;
  /** Rise withdrawals with inflation each year. */
  indexWithdrawals: boolean;
  /** Expected average investment return, % a year. */
  growthPercent: number;
  /** Inflation, % a year. */
  inflationPercent: number;
  /** State Pension, £ a year in today's money (0 = none). */
  statePensionAnnual: number;
  /** Age the State Pension starts. */
  statePensionAge: number;
  /** Other taxable income, £ a year in today's money. */
  otherIncomeAnnual: number;
  /** Age the plan must last to. */
  planToAge: number;
}

export interface DrawdownYear {
  age: number;
  potStart: number;
  withdrawal: number;
  taxFreePart: number;
  taxablePart: number;
  statePension: number;
  otherIncome: number;
  tax: number;
  potEnd: number;
  /** True when the pot could not pay the full withdrawal this year. */
  shortfall: boolean;
}

export interface DrawdownResult {
  years: DrawdownYear[];
  /** Age at which the pot runs out, or null if it lasts to planToAge. */
  depletionAge: number | null;
  totalWithdrawn: number;
  totalTax: number;
  totalTaxFree: number;
  potAtPlanAge: number;
  lastsToPlanAge: boolean;
}

export const DRAWDOWN_CONSTANTS = {
  lumpSumAllowance: 268275,
  personalAllowance: 12570,
  basicRateLimit: 50270,
  additionalRateThreshold: 125140,
  /** Full new State Pension 2026/27: £241.30 a week × 52. */
  fullNewStatePension: 12547.6,
} as const;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** 2026/27 income tax (England/Wales/NI) on a total taxable income. */
export function incomeTax2026(totalIncome: number): number {
  const income = Math.max(0, totalIncome || 0);
  let allowance: number = DRAWDOWN_CONSTANTS.personalAllowance;
  if (income > 100000) {
    allowance = Math.max(0, allowance - (income - 100000) / 2);
  }
  const basicTop = DRAWDOWN_CONSTANTS.basicRateLimit;
  const addTop = DRAWDOWN_CONSTANTS.additionalRateThreshold;
  let tax = 0;
  const basicBand = Math.max(0, Math.min(income, basicTop) - allowance);
  tax += basicBand * 0.2;
  const higherBand = Math.max(0, Math.min(income, addTop) - basicTop);
  tax += higherBand * 0.4;
  const additionalBand = Math.max(0, income - addTop);
  tax += additionalBand * 0.45;
  return round2(tax);
}

interface EngineOptions {
  /** Per-year growth rates (decimals); falls back to the flat rate. */
  yearlyReturns?: number[];
}

function runEngine(input: DrawdownInput, options: EngineOptions = {}): DrawdownResult {
  const years: DrawdownYear[] = [];
  const inflation = (input.inflationPercent || 0) / 100;
  const flatGrowth = (input.growthPercent || 0) / 100;

  let pot = Math.max(0, input.pot || 0);
  const lumpNow = Math.min(
    Math.max(0, input.taxFreeCashNow || 0),
    DRAWDOWN_CONSTANTS.lumpSumAllowance,
    pot,
  );
  pot -= lumpNow;
  let taxFreeUsed = lumpNow;

  let totalWithdrawn = 0;
  let totalTax = 0;
  let totalTaxFree = lumpNow;
  let depletionAge: number | null = null;

  const totalYears = Math.max(0, input.planToAge - input.currentAge);

  for (let i = 0; i < totalYears; i++) {
    const age = input.currentAge + i;
    const inflFactor = Math.pow(1 + inflation, i);
    const wanted = input.indexWithdrawals
      ? (input.annualWithdrawal || 0) * inflFactor
      : input.annualWithdrawal || 0;
    const statePension =
      age >= input.statePensionAge
        ? (input.statePensionAnnual || 0) * inflFactor
        : 0;
    const otherIncome = (input.otherIncomeAnnual || 0) * inflFactor;

    const potStart = pot;
    const withdrawal = Math.min(wanted, pot);
    const shortfall = withdrawal < wanted - 0.005 && wanted > 0;

    // UFPLS: 25% tax-free until the Lump Sum Allowance runs out.
    const taxFreeRoom = Math.max(0, DRAWDOWN_CONSTANTS.lumpSumAllowance - taxFreeUsed);
    const taxFreePart = Math.min(withdrawal * 0.25, taxFreeRoom);
    const taxablePart = withdrawal - taxFreePart;
    taxFreeUsed += taxFreePart;

    const tax = incomeTax2026(taxablePart + statePension + otherIncome);

    pot = pot - withdrawal;
    const growth = options.yearlyReturns ? options.yearlyReturns[i] ?? flatGrowth : flatGrowth;
    pot = pot * (1 + growth);
    if (pot < 0.005) pot = 0;

    years.push({
      age,
      potStart: round2(potStart),
      withdrawal: round2(withdrawal),
      taxFreePart: round2(taxFreePart),
      taxablePart: round2(taxablePart),
      statePension: round2(statePension),
      otherIncome: round2(otherIncome),
      tax,
      potEnd: round2(pot),
      shortfall,
    });
    totalWithdrawn += withdrawal;
    totalTax += tax;
    totalTaxFree += taxFreePart;

    if (pot <= 0 && depletionAge === null) {
      depletionAge = age + 1;
      // Keep looping so later years show the State Pension still arriving.
      if (wanted <= 0) break;
    }
    if (pot <= 0 && statePension <= 0 && otherIncome <= 0 && i > 0 && withdrawal <= 0) break;
  }

  const lasts = depletionAge === null;
  return {
    years,
    depletionAge,
    totalWithdrawn: round2(totalWithdrawn),
    totalTax: round2(totalTax),
    totalTaxFree: round2(totalTaxFree),
    potAtPlanAge: round2(pot),
    lastsToPlanAge: lasts,
  };
}

export function calculateDrawdown(input: DrawdownInput): DrawdownResult {
  return runEngine(input);
}

/**
 * The largest annual withdrawal (today's money) that makes the pot
 * last exactly to planToAge, found by bisection on the same engine.
 */
export function sustainableWithdrawal(input: DrawdownInput): number {
  let lo = 0;
  let hi = Math.max(input.pot, input.annualWithdrawal * 2, 1000);
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    const res = runEngine({ ...input, annualWithdrawal: mid });
    if (res.lastsToPlanAge && res.potAtPlanAge > 100) {
      lo = mid;
    } else if (res.lastsToPlanAge) {
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 10) break;
  }
  return round2(lo);
}

/** Deterministic PRNG so every visitor sees the same simulation for the same inputs. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(rand: () => number): number {
  // Box–Muller.
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export interface MonteCarloResult {
  runs: number;
  lastedCount: number;
  lastedPercent: number;
  medianPotAtPlanAge: number;
}

/**
 * Repeat the plan across `runs` simulated market paths: each year's
 * return is drawn from a normal distribution centred on the expected
 * return with the given standard deviation (default 10%).
 */
export function monteCarloDrawdown(
  input: DrawdownInput,
  runs = 500,
  volatilityPercent = 10,
): MonteCarloResult {
  const totalYears = Math.max(1, input.planToAge - input.currentAge);
  const mean = (input.growthPercent || 0) / 100;
  const sd = volatilityPercent / 100;
  const rand = mulberry32(20261119);
  let lasted = 0;
  const endPots: number[] = [];

  for (let r = 0; r < runs; r++) {
    const yearlyReturns: number[] = [];
    for (let i = 0; i < totalYears; i++) {
      yearlyReturns.push(mean + normalRandom(rand) * sd);
    }
    const res = runEngine(input, { yearlyReturns });
    if (res.lastsToPlanAge) lasted++;
    endPots.push(res.potAtPlanAge);
  }
  endPots.sort((a, b) => a - b);
  const median = endPots[Math.floor(endPots.length / 2)] ?? 0;
  return {
    runs,
    lastedCount: lasted,
    lastedPercent: Math.round((lasted / runs) * 1000) / 10,
    medianPotAtPlanAge: round2(median),
  };
}
