/**
 * US paycheck maths — federal income tax (annualized estimate
 * method), FICA, and state tax for Texas and Florida ($0 — no
 * state income tax), Ohio (the HB 96 flat tax, plus optional city
 * and school-district income taxes), Colorado (a flat tax on
 * federal taxable income, the FAMLI premium and the Denver
 * occupational privilege tax), Arizona (a flat tax on Arizona
 * taxable income), Illinois (a flat tax on federal AGI less the
 * personal exemption), North Carolina (a flat tax on federal AGI
 * less the NC standard and child deductions), Pennsylvania (a
 * flat tax on gross compensation, local EIT / Philadelphia wage
 * tax, and the employee UC contribution), New Jersey (graduated
 * gross income tax plus the employee UI, TDI and FLI
 * contributions) and Oregon (graduated tax with the federal-tax
 * subtraction and exemption credit, the statewide transit tax
 * and the Paid Leave Oregon employee contribution).
 *
 * The method is the annualized estimate used by the mainstream
 * paycheck calculators (the ADP / SmartAsset class): the year's
 * pay is figured once, on annual figures, then divided by the
 * number of pay periods. It is an estimate of the tax on the
 * year's income — not a replication of an employer's per-period
 * withholding worksheet, so a real pay stub can differ by small
 * amounts (a W-4 with the Step 2 box checked, Step 4
 * adjustments, or mid-year job changes all move the real
 * withholding; the estimate assumes one job held all year on a
 * standard W-4).
 *
 * Every constant verified against official sources at build time
 * (federal: 19 November 2026; states: 22 November 2026):
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
 *   - Colorado Department of Revenue — form DR 1098 (the 2026
 *     Colorado Withholding Worksheet for Employers, Step 2c)
 *     and form DR 0104: Colorado income tax is a flat 4.40% of
 *     federal taxable income. No TABOR rate reduction applies
 *     for tax year 2026 — the State Controller certified on
 *     8 September 2026 that fiscal 2025–26 revenue came in
 *     $175.9M below the Referendum C cap:
 *     https://tax.colorado.gov/
 *   - Colorado FAMLI Division — the 2026 premium is 0.88% of
 *     wages up to the Social Security wage base, split evenly:
 *     a 0.44% employee share. Employers with 10 or more
 *     employees owe the other 0.44%; smaller employers owe no
 *     employer share; any employer may pay the employee share
 *     (the calculator models the employee paying it):
 *     https://famli.colorado.gov/
 *   - City and County of Denver, Tax Guide Topic 61 — the
 *     employee occupational privilege tax is $5.75 a month,
 *     owed for any month the employee earns at least $500
 *     working in Denver:
 *     https://www.denvergov.org/
 *   - Arizona Department of Revenue / A.R.S. §43-1011 — for tax
 *     year 2023 and beyond, Arizona taxes taxable income at a
 *     flat 2.5%. The standard deduction (A.R.S. §43-1041) is
 *     $15,750 single / $31,500 MFJ / $23,625 HoH before the
 *     inflation adjustment §43-1041(H) mandates "in the same
 *     manner" as federal §63 — which for 2026 gives exactly the
 *     federal amounts ($16,100 / $32,200 / $24,150 / $16,100);
 *     the derivation is disclosed on the Arizona page:
 *     https://azdor.gov/
 *   - Florida Department of Revenue (GT-800025) — Florida does
 *     not impose a personal income tax; the reemployment tax is
 *     employer-only and by law cannot be deducted from wages:
 *     https://floridarevenue.com/
 *   - Illinois Department of Revenue / 35 ILCS 5/201 and
 *     5/204 — a flat 4.95% of net income; the 2026 personal
 *     exemption is $2,925 per person, and no exemption is
 *     allowed once federal AGI exceeds $250,000 ($500,000 for
 *     a joint return):
 *     https://tax.illinois.gov/
 *   - North Carolina Department of Revenue / N.C.G.S.
 *     §105-153.7 — a flat 3.99% for tax years after 2025;
 *     §105-153.5(a) standard deductions ($12,750 single and
 *     MFS / $25,500 MFJ / $19,125 head of household) and the
 *     §105-153.5(a1) child deduction of $500–$3,000 per
 *     qualifying child, banded by federal AGI:
 *     https://www.ncdor.gov/
 *   - Pennsylvania Department of Revenue / 72 P.S. §7302 — a
 *     flat 3.07% on gross compensation with no standard
 *     deduction or personal exemption; employee 401(k)
 *     contributions are taxable compensation in Pennsylvania,
 *     while §125 health premiums (and HSA contributions routed
 *     through a §125 plan) are excluded (PA PIT Guide;
 *     DOR ruling PIT-06-005). Local earned income tax under
 *     Act 32 is modelled at the rate the user enters, on the
 *     same compensation base; the Philadelphia wage tax (City
 *     of Philadelphia, rates in force from 1 July 2026:
 *     3.735% residents, 3.425% non-residents) is charged on
 *     full gross pay. The employee unemployment compensation
 *     contribution is 0.07% of all gross wages (PA L&I):
 *     https://www.pa.gov/
 *   - New Jersey Division of Taxation / N.J.S.A. 54A:2-1 — the
 *     graduated gross income tax (2026 Form NJ-1040-ES rate
 *     schedules: Table A for single and married filing
 *     separately, Table B for married filing jointly and head
 *     of household), a $1,000 personal exemption ($2,000 on a
 *     joint return), and no tax owed at or below $10,000 of
 *     gross income ($20,000 joint / head of household). 401(k)
 *     deferrals are excluded from NJ wages; §125 health
 *     premiums and HSA contributions are not (TB-39(R)).
 *     NJ Department of Labor — the 2026 worker contributions:
 *     unemployment + workforce funds 0.425% of the first
 *     $44,800, temporary disability 0.19% and family leave
 *     0.23% of the first $171,100:
 *     https://www.nj.gov/
 *   - Oregon Department of Revenue, Publication 150-206-436
 *     (Rev. 12-31-25) — the 2026 withholding schedules
 *     (4.75% / 6.75% / 8.75% / 9.9%), the federal-tax
 *     subtraction capped at $8,750 and phased out by wages,
 *     the withholding standard deduction ($2,910 single, MFS
 *     and head of household; $5,820 joint) and the $263
 *     exemption credit. The statewide transit tax is 0.1% of
 *     Oregon wages (ORS 320.550). Paid Leave Oregon — the
 *     employee share is 60% of the 1% contribution rate,
 *     0.6% of wages up to $184,500 for 2026:
 *     https://www.oregon.gov/dor/
 *
 * Display rule (the house rule, as on the UK calculators): every
 * money line is rounded to the cent and the totals are built
 * from the rounded lines, so the figures on the page add up.
 */

export const TAX_YEAR = 2026;

export type UsStateCode =
  | "TX"
  | "OH"
  | "CO"
  | "AZ"
  | "FL"
  | "IL"
  | "NC"
  | "PA"
  | "NJ"
  | "OR";

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

/** Colorado: the flat income-tax rate on federal taxable income. */
export const COLORADO_TAX_RATE = 0.044;
/** Colorado FAMLI: the 2026 employee share of the premium. */
export const FAMLI_EMPLOYEE_RATE = 0.0044;
/** Colorado FAMLI: premiums apply only to wages up to this base. */
export const FAMLI_WAGE_BASE = SOCIAL_SECURITY_WAGE_BASE;
/** Denver employee OPT: the flat amount owed per month. */
export const DENVER_OPT_MONTHLY = 5.75;
/** Denver employee OPT: the monthly Denver earnings that trigger it. */
export const DENVER_OPT_MONTHLY_EARNINGS_THRESHOLD = 500;

/** Arizona: the flat rate on Arizona taxable income (A.R.S. §43-1011). */
export const ARIZONA_TAX_RATE = 0.025;
/**
 * Arizona standard deductions for 2026 — the A.R.S. §43-1041
 * statutory amounts ($15,750 / $31,500 / $23,625 / $15,750) after
 * the §43-1041(H) inflation adjustment, which is made "in the
 * same manner" as the federal §63 adjustment and so lands on
 * exactly the federal 2026 figures. Derived, and disclosed as
 * derived on the Arizona page.
 */
export const ARIZONA_STANDARD_DEDUCTIONS: Record<UsFilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  hoh: 24150,
  mfs: 16100,
};

/** Illinois: the flat rate on net income (35 ILCS 5/201). */
export const ILLINOIS_TAX_RATE = 0.0495;
/** Illinois: the 2026 personal exemption, per exemption claimed. */
export const ILLINOIS_EXEMPTION_AMOUNT = 2925;
/** Illinois: AGI above this wipes the exemption out entirely (35 ILCS 5/204(g)). */
export const ILLINOIS_EXEMPTION_AGI_CLIFF: Record<UsFilingStatus, number> = {
  single: 250000,
  mfj: 500000,
  hoh: 250000,
  mfs: 250000,
};

/** North Carolina: the flat rate for tax years after 2025 (G.S. 105-153.7). */
export const NC_TAX_RATE = 0.0399;
/** North Carolina standard deductions (G.S. 105-153.5(a)). */
export const NC_STANDARD_DEDUCTIONS: Record<UsFilingStatus, number> = {
  single: 12750,
  mfj: 25500,
  hoh: 19125,
  mfs: 12750,
};

/**
 * North Carolina child deduction per qualifying child
 * (G.S. 105-153.5(a1)), banded by federal AGI. The bands are
 * [agiCeiling, deductionPerChild] pairs, checked in order.
 */
export const NC_CHILD_DEDUCTION_BANDS: Record<
  UsFilingStatus,
  [number, number][]
> = {
  mfj: [
    [40000, 3000],
    [60000, 2500],
    [80000, 2000],
    [100000, 1500],
    [120000, 1000],
    [140000, 500],
  ],
  hoh: [
    [30000, 3000],
    [45000, 2500],
    [60000, 2000],
    [75000, 1500],
    [90000, 1000],
    [105000, 500],
  ],
  single: [
    [20000, 3000],
    [30000, 2500],
    [40000, 2000],
    [50000, 1500],
    [60000, 1000],
    [70000, 500],
  ],
  mfs: [
    [20000, 3000],
    [30000, 2500],
    [40000, 2000],
    [50000, 1500],
    [60000, 1000],
    [70000, 500],
  ],
};

/** Pennsylvania: the flat rate on gross compensation (72 P.S. §7302). */
export const PA_TAX_RATE = 0.0307;
/** Pennsylvania: the employee UC contribution rate, on all gross wages. */
export const PA_UC_RATE = 0.0007;
/** Philadelphia wage tax, from 1 July 2026 — residents. */
export const PHILLY_RESIDENT_RATE = 0.03735;
/** Philadelphia wage tax, from 1 July 2026 — non-residents. */
export const PHILLY_NONRESIDENT_RATE = 0.03425;

/**
 * New Jersey bracket TOPS and rates (N.J.S.A. 54A:2-1, as printed
 * in the 2026 NJ-1040-ES instructions). Table A: single and
 * married filing separately. Table B: married filing jointly
 * and head of household.
 */
export const NJ_TABLE_A_TOPS = [
  20000, 35000, 40000, 75000, 500000, 1000000,
];
export const NJ_TABLE_A_RATES = [
  0.014, 0.0175, 0.035, 0.05525, 0.0637, 0.0897, 0.1075,
];
export const NJ_TABLE_B_TOPS = [
  20000, 50000, 70000, 80000, 150000, 500000, 1000000,
];
export const NJ_TABLE_B_RATES = [
  0.014, 0.0175, 0.0245, 0.035, 0.05525, 0.0637, 0.0897, 0.1075,
];
/** New Jersey personal exemption: $1,000, doubled on a joint return. */
export const NJ_EXEMPTION_SINGLE = 1000;
export const NJ_EXEMPTION_JOINT = 2000;
/** New Jersey filing thresholds: no tax owed at or below these gross incomes. */
export const NJ_FILING_THRESHOLDS: Record<UsFilingStatus, number> = {
  single: 10000,
  mfs: 10000,
  mfj: 20000,
  hoh: 20000,
};
/** NJ worker contributions, 2026 (NJ Department of Labor). */
export const NJ_UI_RATE = 0.00425;
export const NJ_UI_WAGE_BASE = 44800;
export const NJ_TDI_RATE = 0.0019;
export const NJ_TDI_WAGE_BASE = 171100;
export const NJ_FLI_RATE = 0.0023;
export const NJ_FLI_WAGE_BASE = 171100;

/**
 * Oregon bracket TOPS and rates (DOR Publication 150-206-436,
 * Rev. 12-31-25). Schedule S: single and married filing
 * separately. Schedule M: married filing jointly and head of
 * household.
 */
export const OR_SCHEDULE_S_TOPS = [4550, 11400, 125000];
export const OR_SCHEDULE_M_TOPS = [9100, 22800, 250000];
export const OR_BRACKET_RATES = [0.0475, 0.0675, 0.0875, 0.099];
/** Oregon withholding standard deduction (Publication 150-206-436). */
export const OR_STANDARD_DEDUCTIONS: Record<UsFilingStatus, number> = {
  single: 2910,
  mfs: 2910,
  hoh: 2910,
  mfj: 5820,
};
/** Oregon exemption credit, per exemption (2026). */
export const OR_EXEMPTION_CREDIT = 263;
/** Oregon federal-tax subtraction: the maximum before the phase-out. */
export const OR_SUBTRACTION_MAX = 8750;
/** Oregon statewide transit tax rate, on Oregon wages (ORS 320.550). */
export const OR_TRANSIT_RATE = 0.001;
/** Paid Leave Oregon: the 2026 employee contribution rate and wage cap. */
export const OR_PAID_LEAVE_RATE = 0.006;
export const OR_PAID_LEAVE_WAGE_CAP = 184500;

/** Round to the cent, half up (the house display rule). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Tax through a bracket schedule of tops + rates (the last rate runs upward). */
export function bracketScheduleTax(
  taxableIncome: number,
  tops: number[],
  rates: number[],
): number {
  const taxable = Math.max(0, taxableIncome);
  let tax = 0;
  let lower = 0;
  for (let i = 0; i < rates.length; i++) {
    const top = i < tops.length ? tops[i] : Number.POSITIVE_INFINITY;
    if (taxable > lower) {
      tax += (Math.min(taxable, top) - lower) * rates[i];
    }
    lower = top;
  }
  return tax;
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

/** NC child deduction per qualifying child, from federal AGI. */
export function ncChildDeductionPerChild(
  filingStatus: UsFilingStatus,
  federalAgi: number,
): number {
  for (const [ceiling, amount] of NC_CHILD_DEDUCTION_BANDS[filingStatus]) {
    if (federalAgi <= ceiling) return amount;
  }
  return 0;
}

/**
 * Oregon's federal-tax subtraction cap, phased down by Oregon
 * wages (Publication 150-206-436, withholding version): the
 * single schedule steps down $1,750 for every $5,000 of wages
 * from $125,000 to $145,000; the married schedule steps down
 * $1,750 for every $10,000 from $250,000 to $290,000.
 */
export function oregonSubtractionCap(
  oregonWages: number,
  filingStatus: UsFilingStatus,
): number {
  if (filingStatus === "mfj") {
    if (oregonWages < 250000) return OR_SUBTRACTION_MAX;
    if (oregonWages >= 290000) return 0;
    const steps = Math.floor((oregonWages - 250000) / 10000);
    return Math.max(0, OR_SUBTRACTION_MAX - 1750 * (steps + 1));
  }
  if (oregonWages < 125000) return OR_SUBTRACTION_MAX;
  if (oregonWages >= 145000) return 0;
  const steps = Math.floor((oregonWages - 125000) / 5000);
  return Math.max(0, OR_SUBTRACTION_MAX - 1750 * (steps + 1));
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
  /** HSA contribution, $ per pay period (pre-tax, cafeteria plan). Optional — the newer state pages. */
  hsaPerPeriod?: number;
  /** Form W-4 Step 4(a): other income (not from jobs), $ per year. Optional. */
  otherIncomeAnnual?: number;
  /** Form W-4 Step 4(b): deductions beyond the standard deduction, $ per year. Optional. */
  step4bDeductionsAnnual?: number;
  /** Colorado only: the worker works in Denver (employee OPT). Optional. */
  worksInDenver?: boolean;
  /** Illinois only: exemptions claimed on the IL-W-4 (defaults by filing status). Optional. */
  ilExemptionCount?: number;
  /** North Carolina only: children qualifying for the federal child tax credit. Optional. */
  ncChildCount?: number;
  /** Pennsylvania only: local EIT rate, % — applied to the PA compensation base. Optional. */
  paEitRatePercent?: number;
  /** Pennsylvania only: the Philadelphia wage-tax preset, if any. Optional. */
  paPhilly?: "none" | "resident" | "nonresident";
}

export interface UsPaycheckExtraLine {
  id: string;
  label: string;
  annual: number;
  perPeriod: number;
}

export interface UsPaycheckResult {
  periodsPerYear: number;
  periodName: string;
  grossAnnual: number;
  grossPerPeriod: number;
  /** 401(k) + health premiums + HSA — the pre-tax total. */
  preTaxAnnual: number;
  preTaxPerPeriod: number;
  preTax401kAnnual: number;
  preTax401kPerPeriod: number;
  healthAnnual: number;
  healthPerPeriod: number;
  /** HSA contributions (0 unless entered). */
  hsaAnnual: number;
  hsaPerPeriod: number;
  /** The federal taxable income the federal tax is figured on. */
  taxableIncome: number;
  federalAnnual: number;
  federalPerPeriod: number;
  socialSecurityAnnual: number;
  socialSecurityPerPeriod: number;
  medicareAnnual: number;
  medicarePerPeriod: number;
  /** State income tax — always 0 for Texas and Florida. */
  stateAnnual: number;
  statePerPeriod: number;
  /** Ohio city income tax (0 elsewhere / at a 0% rate). */
  cityAnnual: number;
  cityPerPeriod: number;
  /** Ohio school-district income tax (0 elsewhere / at a 0% rate). */
  schoolAnnual: number;
  schoolPerPeriod: number;
  /**
   * State-specific extra deduction lines beyond the state
   * income tax itself: Colorado FAMLI + Denver OPT, the
   * Pennsylvania local tax and UC contribution, the New Jersey
   * UI / TDI / FLI contributions, and Oregon's transit tax and
   * Paid Leave contribution. Empty for the other states.
   */
  extraLines: UsPaycheckExtraLine[];
  extraWithholdingAnnual: number;
  extraWithholdingPerPeriod: number;
  postTaxAnnual: number;
  postTaxPerPeriod: number;
  /** Everything that comes off: pre-tax + all taxes + extra withholding + post-tax. */
  totalDeductionsAnnual: number;
  totalDeductionsPerPeriod: number;
  netAnnual: number;
  netPerPeriod: number;
  /** All taxes and state contributions (not deductions) as a share of gross pay. */
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
  const hsaPerPeriod = roundMoney(Math.max(0, input.hsaPerPeriod ?? 0));
  const hsaAnnual = roundMoney(hsaPerPeriod * periods);
  const preTaxAnnual = roundMoney(
    preTax401kAnnual + healthAnnual + hsaAnnual,
  );

  // ---- Federal income tax ----
  // Income-tax wages: gross less the pre-tax lines. Form W-4
  // Step 4(a) other income raises the base and Step 4(b)
  // deductions lower it; neither touches the FICA wages below.
  const federalWages = Math.max(0, grossAnnual - preTaxAnnual);
  const taxableIncome = Math.max(
    0,
    federalWages +
      Math.max(0, input.otherIncomeAnnual ?? 0) -
      Math.max(0, input.step4bDeductionsAnnual ?? 0) -
      STANDARD_DEDUCTIONS[input.filingStatus],
  );
  const brackets = federalBracketTax(taxableIncome, input.filingStatus);
  const federalAnnual = roundMoney(
    Math.max(
      0,
      brackets.tax - Math.max(0, input.dependentsCreditAnnual),
    ),
  );

  // ---- FICA ----
  // FICA wages: gross less the cafeteria-plan premiums (health
  // and HSA) only — a 401(k) does NOT reduce Social Security or
  // Medicare wages.
  const ficaWages = Math.max(0, grossAnnual - healthAnnual - hsaAnnual);
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
  const extraAnnuals: { id: string; label: string; annual: number }[] = [];
  const addExtra = (id: string, label: string, annual: number) => {
    extraAnnuals.push({ id, label, annual: roundMoney(annual) });
  };

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

  if (input.state === "CO") {
    // Colorado taxes federal taxable income at one flat rate
    // (Colorado DOR, forms DR 0104 / DR 1098).
    stateAnnual = roundMoney(COLORADO_TAX_RATE * taxableIncome);
    // FAMLI: the employee share of the premium, on FICA wages
    // up to the Social Security wage base.
    addExtra(
      "famli",
      "Colorado FAMLI premium (0.44%)",
      FAMLI_EMPLOYEE_RATE * Math.min(ficaWages, FAMLI_WAGE_BASE),
    );
    // Denver employee OPT: a flat monthly amount for every
    // month Denver earnings reach the threshold — modelled as
    // $5.75 × 12 when the average month clears it.
    if (
      input.worksInDenver &&
      grossAnnual / 12 >= DENVER_OPT_MONTHLY_EARNINGS_THRESHOLD
    ) {
      addExtra(
        "denver-opt",
        "Denver occupational privilege tax",
        DENVER_OPT_MONTHLY * 12,
      );
    }
  }

  if (input.state === "AZ") {
    // Arizona starts from federal AGI and subtracts its own
    // standard deduction (A.R.S. §§43-1001, 43-1041).
    const azTaxable = Math.max(
      0,
      federalWages - ARIZONA_STANDARD_DEDUCTIONS[input.filingStatus],
    );
    stateAnnual = roundMoney(ARIZONA_TAX_RATE * azTaxable);
  }

  if (input.state === "IL") {
    // Illinois starts from federal AGI — no federal standard
    // deduction — less $2,925 per exemption; the exemption is
    // lost entirely over the AGI cliff (35 ILCS 5/204(g)).
    const defaultCount = input.filingStatus === "mfj" ? 2 : 1;
    const claimed = Math.max(
      0,
      Math.floor(input.ilExemptionCount ?? defaultCount),
    );
    const overCliff =
      federalWages > ILLINOIS_EXEMPTION_AGI_CLIFF[input.filingStatus];
    const exemptionTotal = overCliff
      ? 0
      : claimed * ILLINOIS_EXEMPTION_AMOUNT;
    stateAnnual = roundMoney(
      ILLINOIS_TAX_RATE * Math.max(0, federalWages - exemptionTotal),
    );
  }

  if (input.state === "NC") {
    // North Carolina starts from federal AGI, less the NC
    // standard deduction and the per-child deduction.
    const childDeduction =
      ncChildDeductionPerChild(input.filingStatus, federalWages) *
      Math.max(0, Math.floor(input.ncChildCount ?? 0));
    const ncTaxable = Math.max(
      0,
      federalWages -
        NC_STANDARD_DEDUCTIONS[input.filingStatus] -
        childDeduction,
    );
    stateAnnual = roundMoney(NC_TAX_RATE * ncTaxable);
  }

  if (input.state === "PA") {
    // Pennsylvania taxes gross compensation: the 401(k) stays
    // in the base; §125 health premiums and HSA contributions
    // routed through the cafeteria plan come out (PA PIT
    // Guide). The UC contribution falls on full gross wages.
    const paBase = Math.max(0, grossAnnual - healthAnnual - hsaAnnual);
    stateAnnual = roundMoney(PA_TAX_RATE * paBase);
    const philly = input.paPhilly ?? "none";
    if (philly !== "none") {
      // The Philadelphia wage tax replaces the local EIT and is
      // charged on full gross pay — pre-tax lines stay in.
      addExtra(
        "pa-local",
        philly === "resident"
          ? "Philadelphia wage tax (resident)"
          : "Philadelphia wage tax (non-resident)",
        (philly === "resident"
          ? PHILLY_RESIDENT_RATE
          : PHILLY_NONRESIDENT_RATE) * grossAnnual,
      );
    } else if ((input.paEitRatePercent ?? 0) > 0) {
      addExtra(
        "pa-local",
        "Local earned income tax (EIT)",
        paBase * (Math.max(0, input.paEitRatePercent ?? 0) / 100),
      );
    }
    addExtra(
      "pa-uc",
      "Pennsylvania unemployment contribution (0.07%)",
      PA_UC_RATE * grossAnnual,
    );
  }

  if (input.state === "NJ") {
    // New Jersey taxes gross income less the 401(k) and the
    // personal exemption — §125 health premiums and HSA
    // contributions stay in the NJ base (TB-39(R)). No tax is
    // owed at or below the filing threshold.
    const exemption =
      input.filingStatus === "mfj"
        ? NJ_EXEMPTION_JOINT
        : NJ_EXEMPTION_SINGLE;
    const njTaxable = Math.max(
      0,
      grossAnnual - preTax401kAnnual - exemption,
    );
    const useTableB =
      input.filingStatus === "mfj" || input.filingStatus === "hoh";
    stateAnnual =
      grossAnnual <= NJ_FILING_THRESHOLDS[input.filingStatus]
        ? 0
        : roundMoney(
            bracketScheduleTax(
              njTaxable,
              useTableB ? NJ_TABLE_B_TOPS : NJ_TABLE_A_TOPS,
              useTableB ? NJ_TABLE_B_RATES : NJ_TABLE_A_RATES,
            ),
          );
    // The 2026 worker contributions to the state plans.
    addExtra(
      "nj-ui",
      "New Jersey unemployment & workforce (0.425%)",
      NJ_UI_RATE * Math.min(grossAnnual, NJ_UI_WAGE_BASE),
    );
    addExtra(
      "nj-tdi",
      "New Jersey temporary disability (0.19%)",
      NJ_TDI_RATE * Math.min(grossAnnual, NJ_TDI_WAGE_BASE),
    );
    addExtra(
      "nj-fli",
      "New Jersey family leave (0.23%)",
      NJ_FLI_RATE * Math.min(grossAnnual, NJ_FLI_WAGE_BASE),
    );
  }

  if (input.state === "OR") {
    // Oregon wages (ORS 316.162) are gross less the pre-tax
    // lines. The federal-tax subtraction is capped and phased
    // out by those wages; the exemption credit is a credit
    // against the bracket tax, lost over its own wage cliff.
    const orWages = federalWages;
    const subtraction = Math.min(
      federalAnnual,
      oregonSubtractionCap(orWages, input.filingStatus),
    );
    const orBase = Math.max(
      0,
      orWages - subtraction - OR_STANDARD_DEDUCTIONS[input.filingStatus],
    );
    const useScheduleM =
      input.filingStatus === "mfj" || input.filingStatus === "hoh";
    const bracketTax = bracketScheduleTax(
      orBase,
      useScheduleM ? OR_SCHEDULE_M_TOPS : OR_SCHEDULE_S_TOPS,
      OR_BRACKET_RATES,
    );
    const creditCliff = input.filingStatus === "mfj" ? 200000 : 100000;
    const allowances =
      orWages > creditCliff ? 0 : input.filingStatus === "mfj" ? 2 : 1;
    stateAnnual = roundMoney(
      Math.max(0, bracketTax - OR_EXEMPTION_CREDIT * allowances),
    );
    addExtra(
      "or-transit",
      "Oregon statewide transit tax (0.1%)",
      OR_TRANSIT_RATE * orWages,
    );
    addExtra(
      "or-paid-leave",
      "Paid Leave Oregon contribution (0.6%)",
      OR_PAID_LEAVE_RATE * Math.min(grossAnnual, OR_PAID_LEAVE_WAGE_CAP),
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
  const preTaxPerPeriod = roundMoney(
    preTax401kPerPeriod + healthPerPeriod + hsaPerPeriod,
  );
  const federalPerPeriod = per(federalAnnual);
  const socialSecurityPerPeriod = per(socialSecurityAnnual);
  const medicarePerPeriod = per(medicareAnnual);
  const statePerPeriod = per(stateAnnual);
  const cityPerPeriod = per(cityAnnual);
  const schoolPerPeriod = per(schoolAnnual);
  const extraLines: UsPaycheckExtraLine[] = extraAnnuals.map((line) => ({
    id: line.id,
    label: line.label,
    annual: line.annual,
    perPeriod: per(line.annual),
  }));
  const extraLinesAnnual = roundMoney(
    extraLines.reduce((sum, line) => sum + line.annual, 0),
  );
  const extraLinesPerPeriod = roundMoney(
    extraLines.reduce((sum, line) => sum + line.perPeriod, 0),
  );

  const totalDeductionsAnnual = roundMoney(
    preTaxAnnual +
      federalAnnual +
      socialSecurityAnnual +
      medicareAnnual +
      stateAnnual +
      cityAnnual +
      schoolAnnual +
      extraLinesAnnual +
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
      extraLinesPerPeriod +
      extraPerPeriod +
      postTaxPerPeriod,
  );

  const taxesAnnual =
    federalAnnual +
    socialSecurityAnnual +
    medicareAnnual +
    stateAnnual +
    cityAnnual +
    schoolAnnual +
    extraLinesAnnual;

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
    hsaAnnual,
    hsaPerPeriod,
    taxableIncome: roundMoney(taxableIncome),
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
    extraLines,
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
