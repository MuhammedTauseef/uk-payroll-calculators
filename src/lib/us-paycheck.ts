/**
 * US paycheck maths — federal income tax (annualized estimate
 * method), FICA, and state tax for Texas ($0 — no state income
 * tax) and Ohio (the HB 96 flat tax, plus optional city and
 * school-district income taxes).
 *
 * The method is the annualized estimate used by the mainstream
 * paycheck calculators (the ADP / SmartAsset class): the year's
 * pay is figured once, on annual figures, then divided by the
 * number of pay periods. It is an estimate of the tax on the
 * year's income — not a replication of an employer's per-period
 * IRS Publication 15-T withholding worksheet, so a real pay stub
 * can differ by small amounts (a W-4 with the Step 2 box checked,
 * Step 4 adjustments, or mid-year job changes all move the real
 * withholding; the estimate assumes one job held all year on a
 * standard W-4).
 *
 * Every constant verified against official sources at build time
 * (19 November 2026):
 *   - IRS Revenue Procedure 2025-32 — the 2026 federal rate
 *     brackets and standard deductions (single $16,100, married
 *     filing jointly $32,200, head of household $24,150, married
 *     filing separately $16,100):
 *     https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
 *   - IRS Publication 15-T (2026) — federal withholding methods
 *     and the treatment of pre-tax deductions and W-4 Step 3
 *     credits: https://www.irs.gov/publications/p15t
 *   - SSA, "Contribution and Benefit Base" — the 2026 Social
 *     Security wage base is $184,500; Social Security 6.2%,
 *     Medicare 1.45%, Additional Medicare Tax 0.9% over the
 *     filing-status threshold ($200,000 single / head of
 *     household, $250,000 married filing jointly, $125,000
 *     married filing separately):
 *     https://www.ssa.gov/oact/cola/cbb.html
 *   - Texas Comptroller — Texas levies no personal income tax:
 *     https://comptroller.texas.gov/taxes/
 *   - Ohio Department of Taxation / Ohio Revised Code 5747.02 —
 *     the HB 96 flat tax (no tax on the first $26,050 of Ohio
 *     taxable income, then a $332 base amount plus 2.75% of the
 *     excess over $26,050) and the personal exemption amounts
 *     by income band:
 *     https://tax.ohio.gov/
 *
 * Display rule (the house rule, as on the UK calculators): every
 * money line is rounded to the cent and the totals are built
 * from the rounded lines, so the figures on the page add up.
 */

export const TAX_YEAR = 2026;

export type UsStateCode = "TX" | "OH";

export type UsFilingStatus = "single" | "mfj" | "hoh" | "mfs";

export type UsPayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const PAY_FREQUENCIES: {
  id: UsPayFrequency;
  label: string;
  periodsPerYear: number;
  periodName: string;
}[] = [
  { id: "weekly", label: "Weekly", periodsPerYear: 52, periodName: "week" },
  {
    id: "biweekly",
    label: "Every 2 weeks (biweekly)",
    periodsPerYear: 26,
    periodName: "paycheck",
  },
  {
    id: "semimonthly",
    label: "Twice a month (semimonthly)",
    periodsPerYear: 24,
    periodName: "paycheck",
  },
  { id: "monthly", label: "Monthly", periodsPerYear: 12, periodName: "month" },
];

export const FILING_STATUSES: { id: UsFilingStatus; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "mfj", label: "Married filing jointly" },
  { id: "hoh", label: "Head of household" },
  { id: "mfs", label: "Married filing separately" },
];

/** 2026 standard deductions (Rev. Proc. 2025-32). */
export const STANDARD_DEDUCTIONS: Record<UsFilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  hoh: 24150,
  mfs: 16100,
};

/**
 * 2026 federal bracket TOPS (the taxable-income ceiling of each
 * bracket, in order) — the seventh bracket runs from the last
 * top upward at 37%.
 */
export const BRACKET_TOPS: Record<UsFilingStatus, number[]> = {
  single: [12400, 50400, 105700, 201775, 256225, 640600],
  mfj: [24800, 100800, 211400, 403550, 512450, 768700],
  hoh: [17700, 67450, 105700, 201750, 256200, 640600],
  mfs: [12400, 50400, 105700, 201775, 256225, 384350],
};

/** The seven federal rates, in bracket order. */
export const BRACKET_RATES = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];

/** 2026 FICA constants (SSA / IRS). */
export const SOCIAL_SECURITY_WAGE_BASE = 184500;
export const SOCIAL_SECURITY_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLDS: Record<UsFilingStatus, number> = {
  single: 200000,
  hoh: 200000,
  mfj: 250000,
  mfs: 125000,
};

/** Ohio: no state tax on Ohio taxable income up to this amount (HB 96). */
export const OHIO_TAX_FREE_TOP = 26050;
/** Ohio: flat-tax base amount due at the top of the free band. */
export const OHIO_FLAT_BASE = 332;
/** Ohio: the single flat rate above the free band. */
export const OHIO_FLAT_RATE = 0.0275;

/** Round to the cent, half up (the house display rule). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Federal income tax on a taxable-income figure, plus the
 * marginal rate (the rate on the next dollar at that income).
 */
export function federalBracketTax(
  taxableIncome: number,
  filingStatus: UsFilingStatus,
): { tax: number; marginalRatePercent: number } {
  const taxable = Math.max(0, taxableIncome);
  const tops = BRACKET_TOPS[filingStatus];
  let tax = 0;
  let lower = 0;
  let marginal = BRACKET_RATES[0];
  for (let i = 0; i < BRACKET_RATES.length; i++) {
    const top = i < tops.length ? tops[i] : Number.POSITIVE_INFINITY;
    if (taxable > lower) {
      tax += (Math.min(taxable, top) - lower) * BRACKET_RATES[i];
      marginal = BRACKET_RATES[i];
    }
    lower = top;
  }
  return { tax, marginalRatePercent: marginal * 100 };
}

/**
 * Ohio personal exemption, by gross income (MAGI proxy — the
 * bands the Ohio Department of Taxation publishes): $2,350 up
 * to $40,000, $2,100 up to $80,000, $1,850 below $500,000, and
 * no exemption at $500,000 or more.
 */
export function ohioPersonalExemption(grossAnnual: number): number {
  if (grossAnnual <= 40000) return 2350;
  if (grossAnnual <= 80000) return 2100;
  if (grossAnnual < 500000) return 1850;
  return 0;
}

/** Ohio state income tax on an Ohio taxable-income figure (HB 96). */
export function ohioStateTax(ohioTaxableIncome: number): number {
  const taxable = Math.max(0, ohioTaxableIncome);
  if (taxable <= OHIO_TAX_FREE_TOP) return 0;
  return OHIO_FLAT_BASE + OHIO_FLAT_RATE * (taxable - OHIO_TAX_FREE_TOP);
}

export interface UsPaycheckInput {
  state: UsStateCode;
  payType: "salary" | "hourly";
  /** Used when payType is "salary". */
  annualSalary: number;
  /** Used when payType is "hourly". */
  hourlyRate: number;
  /** Regular hours per week (hourly). */
  hoursPerWeek: number;
  /** Overtime hours per week (hourly), paid at 1.5× the rate. */
  overtimeHoursPerWeek: number;
  frequency: UsPayFrequency;
  filingStatus: UsFilingStatus;
  /** Form W-4 Step 3 total (dependent and other credits), per year. */
  dependentsCreditAnnual: number;
  /** Traditional 401(k) contribution, % of gross pay (pre-tax). */
  preTax401kPercent: number;
  /** Health-insurance premium, $ per pay period (pre-tax). */
  healthPremiumPerPeriod: number;
  /** Extra federal withholding requested on the W-4, $ per pay period. */
  extraWithholdingPerPeriod: number;
  /** Post-tax deductions (for example a Roth 401(k)), $ per pay period. */
  postTaxDeductionsPerPeriod: number;
  /** Ohio only: city income-tax rate, % — applied to Medicare wages. */
  cityRatePercent: number;
  /** Ohio only: school-district income-tax rate, % — applied to Ohio taxable income. */
  schoolRatePercent: number;
}

export interface UsPaycheckResult {
  periodsPerYear: number;
  periodName: string;
  grossAnnual: number;
  grossPerPeriod: number;
  /** 401(k) + health premiums — the pre-tax total. */
  preTaxAnnual: number;
  preTaxPerPeriod: number;
  preTax401kAnnual: number;
  preTax401kPerPeriod: number;
  healthAnnual: number;
  healthPerPeriod: number;
  federalAnnual: number;
  federalPerPeriod: number;
  socialSecurityAnnual: number;
  socialSecurityPerPeriod: number;
  medicareAnnual: number;
  medicarePerPeriod: number;
  /** State income tax — always 0 for Texas. */
  stateAnnual: number;
  statePerPeriod: number;
  /** Ohio city income tax (0 elsewhere / at a 0% rate). */
  cityAnnual: number;
  cityPerPeriod: number;
  /** Ohio school-district income tax (0 elsewhere / at a 0% rate). */
  schoolAnnual: number;
  schoolPerPeriod: number;
  extraWithholdingAnnual: number;
  extraWithholdingPerPeriod: number;
  postTaxAnnual: number;
  postTaxPerPeriod: number;
  /** Everything that comes off: pre-tax + all taxes + extra withholding + post-tax. */
  totalDeductionsAnnual: number;
  totalDeductionsPerPeriod: number;
  netAnnual: number;
  netPerPeriod: number;
  /** All taxes (not deductions) as a share of gross pay. */
  effectiveTaxRatePercent: number;
  /** The federal bracket the top dollar of taxable income sits in. */
  marginalFederalRatePercent: number;
  /** Net pay as cents kept out of every $1 of gross pay. */
  keepCentsPerDollar: number;
}

export function calculateUsPaycheck(input: UsPaycheckInput): UsPaycheckResult {
  const frequency =
    PAY_FREQUENCIES.find((f) => f.id === input.frequency) ??
    PAY_FREQUENCIES[1];
  const periods = frequency.periodsPerYear;

  const grossAnnual =
    input.payType === "salary"
      ? Math.max(0, input.annualSalary)
      : Math.max(0, input.hourlyRate) *
        (Math.max(0, input.hoursPerWeek) +
          1.5 * Math.max(0, input.overtimeHoursPerWeek)) *
        52;

  // ---- Pre-tax lines ----
  const preTax401kAnnual = roundMoney(
    grossAnnual * (Math.max(0, input.preTax401kPercent) / 100),
  );
  const healthPerPeriod = roundMoney(
    Math.max(0, input.healthPremiumPerPeriod),
  );
  const healthAnnual = roundMoney(healthPerPeriod * periods);
  const preTaxAnnual = roundMoney(preTax401kAnnual + healthAnnual);

  // ---- Federal income tax ----
  // Income-tax wages: gross less the 401(k) and the health premium.
  const federalWages = Math.max(0, grossAnnual - preTaxAnnual);
  const taxableIncome = Math.max(
    0,
    federalWages - STANDARD_DEDUCTIONS[input.filingStatus],
  );
  const brackets = federalBracketTax(taxableIncome, input.filingStatus);
  const federalAnnual = roundMoney(
    Math.max(
      0,
      brackets.tax - Math.max(0, input.dependentsCreditAnnual),
    ),
  );

  // ---- FICA ----
  // FICA wages: gross less the health premium only — a 401(k)
  // does NOT reduce Social Security or Medicare wages.
  const ficaWages = Math.max(0, grossAnnual - healthAnnual);
  const socialSecurityAnnual = roundMoney(
    Math.min(ficaWages, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE,
  );
  const medicareAnnual = roundMoney(
    ficaWages * MEDICARE_RATE +
      Math.max(
        0,
        ficaWages - ADDITIONAL_MEDICARE_THRESHOLDS[input.filingStatus],
      ) *
        ADDITIONAL_MEDICARE_RATE,
  );

  // ---- State / local taxes ----
  let stateAnnual = 0;
  let cityAnnual = 0;
  let schoolAnnual = 0;
  if (input.state === "OH") {
    const ohioTaxable = Math.max(
      0,
      grossAnnual - preTaxAnnual - ohioPersonalExemption(grossAnnual),
    );
    stateAnnual = roundMoney(ohioStateTax(ohioTaxable));
    cityAnnual = roundMoney(
      ficaWages * (Math.max(0, input.cityRatePercent) / 100),
    );
    schoolAnnual = roundMoney(
      ohioTaxable * (Math.max(0, input.schoolRatePercent) / 100),
    );
  }

  // ---- Flat per-period lines ----
  const extraPerPeriod = roundMoney(
    Math.max(0, input.extraWithholdingPerPeriod),
  );
  const extraWithholdingAnnual = roundMoney(extraPerPeriod * periods);
  const postTaxPerPeriod = roundMoney(
    Math.max(0, input.postTaxDeductionsPerPeriod),
  );
  const postTaxAnnual = roundMoney(postTaxPerPeriod * periods);

  // ---- Per-period lines (rounded; totals built from them) ----
  const per = (annual: number) => roundMoney(annual / periods);
  const grossPerPeriod = per(grossAnnual);
  const preTax401kPerPeriod = per(preTax401kAnnual);
  const preTaxPerPeriod = roundMoney(preTax401kPerPeriod + healthPerPeriod);
  const federalPerPeriod = per(federalAnnual);
  const socialSecurityPerPeriod = per(socialSecurityAnnual);
  const medicarePerPeriod = per(medicareAnnual);
  const statePerPeriod = per(stateAnnual);
  const cityPerPeriod = per(cityAnnual);
  const schoolPerPeriod = per(schoolAnnual);

  const totalDeductionsAnnual = roundMoney(
    preTaxAnnual +
      federalAnnual +
      socialSecurityAnnual +
      medicareAnnual +
      stateAnnual +
      cityAnnual +
      schoolAnnual +
      extraWithholdingAnnual +
      postTaxAnnual,
  );
  const totalDeductionsPerPeriod = roundMoney(
    preTaxPerPeriod +
      federalPerPeriod +
      socialSecurityPerPeriod +
      medicarePerPeriod +
      statePerPeriod +
      cityPerPeriod +
      schoolPerPeriod +
      extraPerPeriod +
      postTaxPerPeriod,
  );

  const taxesAnnual =
    federalAnnual +
    socialSecurityAnnual +
    medicareAnnual +
    stateAnnual +
    cityAnnual +
    schoolAnnual;

  return {
    periodsPerYear: periods,
    periodName: frequency.periodName,
    grossAnnual: roundMoney(grossAnnual),
    grossPerPeriod,
    preTaxAnnual,
    preTaxPerPeriod,
    preTax401kAnnual,
    preTax401kPerPeriod,
    healthAnnual,
    healthPerPeriod,
    federalAnnual,
    federalPerPeriod,
    socialSecurityAnnual,
    socialSecurityPerPeriod,
    medicareAnnual,
    medicarePerPeriod,
    stateAnnual,
    statePerPeriod,
    cityAnnual,
    cityPerPeriod,
    schoolAnnual,
    schoolPerPeriod,
    extraWithholdingAnnual,
    extraWithholdingPerPeriod: extraPerPeriod,
    postTaxAnnual,
    postTaxPerPeriod,
    totalDeductionsAnnual,
    totalDeductionsPerPeriod,
    netAnnual: roundMoney(grossAnnual - totalDeductionsAnnual),
    netPerPeriod: roundMoney(grossPerPeriod - totalDeductionsPerPeriod),
    effectiveTaxRatePercent:
      grossAnnual > 0 ? (taxesAnnual / grossAnnual) * 100 : 0,
    marginalFederalRatePercent:
      taxableIncome > 0 ? brackets.marginalRatePercent : 0,
    keepCentsPerDollar:
      grossAnnual > 0
        ? ((grossAnnual - totalDeductionsAnnual) / grossAnnual) * 100
        : 0,
  };
}
