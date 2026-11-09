/**
 * Texas paycheck maths — United States (federal withholding + FICA;
 * Texas has no state income tax, so the state line is always $0).
 *
 * Every figure verified against IRS/SSA sources at build time
 * (9 November 2026):
 *   - IRS Publication 15-T (2026), "Federal Income Tax Withholding
 *     Methods" — Worksheet 1A and the STANDARD Percentage Method
 *     Tables for Automated Payroll Systems:
 *     https://www.irs.gov/publications/p15t
 *   - IRS Publication 15 (2026), "What's New" — the social security
 *     wage base limit is $184,500 for 2026; the Medicare rate is
 *     1.45%; a 0.9% Additional Medicare Tax is withheld on wages
 *     over $200,000 in a calendar year:
 *     https://www.irs.gov/publications/p15
 *   - SSA, "Contribution and Benefit Base" — 2026: $184,500:
 *     https://www.ssa.gov/oact/cola/cbb.html
 *
 * The rules, as the IRS states them:
 *   - Federal income tax withholding follows Worksheet 1A for a
 *     2020-or-later Form W-4 with the box in Step 2 NOT checked:
 *     annualise the period's taxable wages, subtract Step 4(b)
 *     deductions (none in this calculator beyond the pre-tax
 *     deductions entered, which already reduce taxable wages) plus
 *     the worksheet's built-in amount — $12,900 if married filing
 *     jointly, $8,600 otherwise — to get the Adjusted Annual Wage
 *     Amount, then apply the STANDARD annual percentage table for
 *     the filing status. The Step 3 amount (dependent and other
 *     credits) then reduces the annual withholding dollar for
 *     dollar, and the per-period withholding is the annual figure
 *     divided by the number of pay periods.
 *   - Social Security tax: 6.2% of wages up to the 2026 wage base
 *     of $184,500. Medicare tax: 1.45% of all wages with no wage
 *     base limit, plus 0.9% Additional Medicare Tax on wages paid
 *     in excess of $200,000 in a calendar year (withheld without
 *     regard to filing status, per Pub. 15).
 *   - Pre-tax deductions (for example a traditional 401(k)) reduce
 *     the wages federal income tax is figured on. They do NOT
 *     reduce Social Security or Medicare wages.
 *   - Texas levies no state income tax on wages, so no state
 *     withholding is figured at all.
 *
 * Display rule (the house rule, as on the UK calculators): every
 * money line is rounded to the cent and the totals are built from
 * the rounded lines, so the figures on the page always add up.
 */

export const TAX_YEAR = 2026;

/** Worksheet 1A, line 1g (Step 2 box not checked). */
export const WORKSHEET_1A_AMOUNT = {
  married: 12900,
  other: 8600,
} as const;

/** 2026 Social Security wage base (SSA / IRS Pub. 15 (2026)). */
export const SOCIAL_SECURITY_WAGE_BASE = 184500;
export const SOCIAL_SECURITY_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
/** Additional Medicare Tax withholding threshold (Pub. 15). */
export const ADDITIONAL_MEDICARE_THRESHOLD = 200000;

export type UsFilingStatus = "single" | "married" | "headOfHousehold";

export type UsPayFrequency =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "annual";

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
  { id: "annual", label: "Annual", periodsPerYear: 1, periodName: "year" },
];

export const FILING_STATUSES: { id: UsFilingStatus; label: string }[] = [
  { id: "single", label: "Single (or married filing separately)" },
  { id: "married", label: "Married filing jointly" },
  { id: "headOfHousehold", label: "Head of household" },
];

interface TaxBracket {
  /** Column A — the Adjusted Annual Wage Amount is at least this. */
  from: number;
  /** Column C — the tentative amount to withhold before the percentage. */
  base: number;
  /** Column D — the percentage applied to the excess over column A. */
  rate: number;
}

/**
 * 2026 STANDARD Withholding Rate Schedules — Percentage Method
 * Tables for Automated Payroll Systems (Pub. 15-T (2026), section
 * 1). Used when the Form W-4 is from 2020 or later and the box in
 * Step 2 is NOT checked (or the W-4 is from 2019 or earlier).
 */
const STANDARD_TABLES: Record<UsFilingStatus, TaxBracket[]> = {
  married: [
    { from: 0, base: 0, rate: 0 },
    { from: 19300, base: 0, rate: 0.1 },
    { from: 44100, base: 2480, rate: 0.12 },
    { from: 120100, base: 11600, rate: 0.22 },
    { from: 230700, base: 35932, rate: 0.24 },
    { from: 422850, base: 82048, rate: 0.32 },
    { from: 531750, base: 116896, rate: 0.35 },
    { from: 788000, base: 206583.5, rate: 0.37 },
  ],
  single: [
    { from: 0, base: 0, rate: 0 },
    { from: 7500, base: 0, rate: 0.1 },
    { from: 19900, base: 1240, rate: 0.12 },
    { from: 57900, base: 5800, rate: 0.22 },
    { from: 113200, base: 17966, rate: 0.24 },
    { from: 209275, base: 41024, rate: 0.32 },
    { from: 263725, base: 58448, rate: 0.35 },
    { from: 648100, base: 192979.25, rate: 0.37 },
  ],
  headOfHousehold: [
    { from: 0, base: 0, rate: 0 },
    { from: 15550, base: 0, rate: 0.1 },
    { from: 33250, base: 1770, rate: 0.12 },
    { from: 83000, base: 7740, rate: 0.22 },
    { from: 121250, base: 16155, rate: 0.24 },
    { from: 217300, base: 39207, rate: 0.32 },
    { from: 271750, base: 56631, rate: 0.35 },
    { from: 656150, base: 191171, rate: 0.37 },
  ],
};

/** Round to the cent, half up (the house display rule). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function tentativeAnnualWithholding(
  adjustedAnnualWage: number,
  filingStatus: UsFilingStatus,
): number {
  const table = STANDARD_TABLES[filingStatus];
  let bracket = table[0];
  for (const row of table) {
    if (adjustedAnnualWage >= row.from) bracket = row;
  }
  return bracket.base + bracket.rate * (adjustedAnnualWage - bracket.from);
}

export interface TexasPaycheckInput {
  payType: "salary" | "hourly";
  /** Used when payType is "salary". */
  annualSalary: number;
  /** Used when payType is "hourly". */
  hourlyRate: number;
  /** Used when payType is "hourly" — gross annual = rate × hours × 52. */
  hoursPerWeek: number;
  frequency: UsPayFrequency;
  filingStatus: UsFilingStatus;
  /** Form W-4 Step 3 total (dependent and other credits), per year. */
  dependentCreditsAnnual: number;
  /** Pre-tax deductions (for example a 401(k)), per pay period. */
  preTaxPerPeriod: number;
}

export interface TexasPaycheckResult {
  periodsPerYear: number;
  grossAnnual: number;
  grossPerPeriod: number;
  preTaxAnnual: number;
  preTaxPerPeriod: number;
  federalAnnual: number;
  federalPerPeriod: number;
  socialSecurityAnnual: number;
  socialSecurityPerPeriod: number;
  medicareAnnual: number;
  medicarePerPeriod: number;
  /** Always 0 — Texas has no state income tax. */
  stateAnnual: number;
  statePerPeriod: number;
  /** Pre-tax deductions + all taxes. Gross − total = net, exactly. */
  totalDeductionsAnnual: number;
  totalDeductionsPerPeriod: number;
  netAnnual: number;
  netPerPeriod: number;
  /** Taxes only (federal + Social Security + Medicare) ÷ gross pay. */
  effectiveTaxRatePercent: number;
}

export function calculateTexasPaycheck(
  input: TexasPaycheckInput,
): TexasPaycheckResult {
  const frequency =
    PAY_FREQUENCIES.find((f) => f.id === input.frequency) ??
    PAY_FREQUENCIES[1];
  const periods = frequency.periodsPerYear;

  const grossAnnual =
    input.payType === "salary"
      ? Math.max(0, input.annualSalary)
      : Math.max(0, input.hourlyRate) * Math.max(0, input.hoursPerWeek) * 52;

  const preTaxPerPeriod = roundMoney(Math.max(0, input.preTaxPerPeriod));
  const preTaxAnnual = roundMoney(preTaxPerPeriod * periods);

  // ---- Federal income tax (Worksheet 1A, Percentage Method) ----
  // Line 1a/1c: taxable wages exclude pre-tax deductions.
  const taxableWagesAnnual = Math.max(0, grossAnnual - preTaxAnnual);
  // Line 1g: the worksheet's built-in amount (Step 2 not checked).
  const worksheetAmount =
    input.filingStatus === "married"
      ? WORKSHEET_1A_AMOUNT.married
      : WORKSHEET_1A_AMOUNT.other;
  // Line 1i: Adjusted Annual Wage Amount (Step 4(b) taken as $0).
  const adjustedAnnualWage = Math.max(
    0,
    taxableWagesAnnual - worksheetAmount,
  );
  const tentativeAnnual = tentativeAnnualWithholding(
    adjustedAnnualWage,
    input.filingStatus,
  );
  // Step 3: credits reduce the annual withholding dollar for dollar.
  const federalAnnual = roundMoney(
    Math.max(0, tentativeAnnual - Math.max(0, input.dependentCreditsAnnual)),
  );

  // ---- FICA (on gross wages — pre-tax deductions do not reduce) ----
  const socialSecurityAnnual = roundMoney(
    Math.min(grossAnnual, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE,
  );
  const medicareAnnual = roundMoney(
    grossAnnual * MEDICARE_RATE +
      Math.max(0, grossAnnual - ADDITIONAL_MEDICARE_THRESHOLD) *
        ADDITIONAL_MEDICARE_RATE,
  );

  // ---- Per-period lines (rounded; totals built from them) ----
  const grossPerPeriod = roundMoney(grossAnnual / periods);
  const federalPerPeriod = roundMoney(federalAnnual / periods);
  const socialSecurityPerPeriod = roundMoney(socialSecurityAnnual / periods);
  const medicarePerPeriod = roundMoney(medicareAnnual / periods);

  const totalDeductionsAnnual = roundMoney(
    preTaxAnnual + federalAnnual + socialSecurityAnnual + medicareAnnual,
  );
  const totalDeductionsPerPeriod = roundMoney(
    preTaxPerPeriod +
      federalPerPeriod +
      socialSecurityPerPeriod +
      medicarePerPeriod,
  );

  const taxesAnnual = federalAnnual + socialSecurityAnnual + medicareAnnual;

  return {
    periodsPerYear: periods,
    grossAnnual: roundMoney(grossAnnual),
    grossPerPeriod,
    preTaxAnnual,
    preTaxPerPeriod,
    federalAnnual,
    federalPerPeriod,
    socialSecurityAnnual,
    socialSecurityPerPeriod,
    medicareAnnual,
    medicarePerPeriod,
    stateAnnual: 0,
    statePerPeriod: 0,
    totalDeductionsAnnual,
    totalDeductionsPerPeriod,
    netAnnual: roundMoney(grossAnnual - totalDeductionsAnnual),
    netPerPeriod: roundMoney(grossPerPeriod - totalDeductionsPerPeriod),
    effectiveTaxRatePercent:
      grossAnnual > 0 ? (taxesAnnual / grossAnnual) * 100 : 0,
  };
}
