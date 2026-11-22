/**
 * Teacher pay and take-home maths — England, STPCD scales.
 *
 * Pay data: School Teachers' Pay and Conditions Document (STPCD)
 * 2025 and 2026, Department for Education — advisory pay points
 * (Annex 3/4), TLR and SEN ranges (Part 4), leadership and leading
 * practitioner ranges. The 2026/27 award is 3.5% from 1 September
 * 2026 (unqualified minimum +5%).
 *
 * Take-home: income tax and National Insurance for the tax year
 * that contains the school year (2025/26 scales are paired with
 * 2025/26 tax; 2026/27 scales with 2026/27 tax — the rates are
 * frozen and identical, the student-loan thresholds differ),
 * Teachers' Pension Scheme member tiers (bands uprated each
 * April), student loans at the GOV.UK employer thresholds.
 *
 * Method notes:
 * - TPS member rate is a single tier rate on the whole of the
 *   member's actual pensionable pay (not banded slices), set by
 *   the tier the actual pay falls in — part-time members are
 *   tiered on what they actually earn, not the FTE salary.
 * - Pension contributions and AVCs are deducted under a net-pay
 *   arrangement: they reduce taxable pay, but NOT the pay that
 *   National Insurance and student loans are charged on.
 * - TLR and SEN payments are pensionable, and are pro-rated by
 *   the FTE fraction for part-time teachers (the standard STPCD
 *   treatment; schools may set TLR values by proportion of the
 *   responsibility from September 2026 — the contract governs).
 * - The Personal Allowance tapers by £1 per £2 of adjusted net
 *   income above £100,000.
 *
 * Checked against STPCD 2025 (16 July 2025) and STPCD 2026,
 * GOV.UK employer rates and thresholds 2025/26 and 2026/27, and
 * Teachers' Pensions contribution tiers, 22 November 2026.
 */

export type PayYear = "2026-27" | "2025-26";
export type RegionId = "rest" | "fringe" | "outer" | "inner";

export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "rest", label: "Rest of England" },
  { id: "fringe", label: "London Fringe" },
  { id: "outer", label: "Outer London" },
  { id: "inner", label: "Inner London" },
];

export type ScaleId = "main" | "upper" | "unqualified" | "lead" | "leadership";

export const SCALES: { id: ScaleId; label: string }[] = [
  { id: "main", label: "Main Pay Range (M1–M6)" },
  { id: "upper", label: "Upper Pay Range (U1–U3)" },
  { id: "unqualified", label: "Unqualified Teacher (UQ1–UQ6)" },
  { id: "lead", label: "Lead Practitioner (LP1–LP18)" },
  { id: "leadership", label: "Leadership (L1–L43)" },
];

/** Advisory pay points: [rest, fringe, outer, inner]. */
type Points = Record<string, [number, number, number, number]>;

const MAIN_2627: Points = {
  M1: [34069, 35602, 39196, 41729],
  M2: [36042, 37647, 41246, 43713],
  M3: [38400, 39979, 43403, 45787],
  M4: [40941, 42513, 45673, 47961],
  M5: [43529, 45070, 48438, 50666],
  M6: [46940, 48479, 52241, 54131],
};
const UPPER_2627: Points = {
  U1: [49134, 50625, 54047, 59650],
  U2: [50956, 52442, 56047, 62581],
  U3: [52835, 54328, 58120, 64684],
};
const UNQUAL_2627: Points = {
  UQ1: [23732, 24909, 27727, 29336],
  UQ2: [26075, 27589, 30412, 32018],
  UQ3: [28758, 30272, 33094, 34702],
  UQ4: [31124, 32636, 35465, 37068],
  UQ5: [33811, 35321, 38146, 39747],
  UQ6: [36494, 38004, 40831, 42429],
};
const LEAD_2627: Points = {
  LP1: [53847, 55331, 58120, 64022],
  LP2: [55198, 56682, 59472, 65375],
  LP3: [56576, 58060, 60843, 66760],
  LP4: [57983, 59475, 62261, 68166],
  LP5: [59427, 60921, 63705, 69619],
  LP6: [60917, 62409, 65189, 71102],
  LP7: [62559, 64050, 66834, 72748],
  LP8: [64000, 65487, 68275, 74186],
  LP9: [65600, 67088, 69869, 75780],
  LP10: [67285, 68770, 71558, 77464],
  LP11: [69029, 70515, 73297, 79207],
  LP12: [70621, 72113, 74897, 80805],
  LP13: [72385, 73878, 76666, 82568],
  LP14: [74191, 75679, 78459, 84372],
  LP15: [76037, 77520, 80304, 86213],
  LP16: [78059, 79547, 82331, 88241],
  LP17: [79850, 81349, 84126, 90035],
  LP18: [81861, 83346, 86136, 92042],
};
const LEADERSHIP_2627: Points = {
  L1: [53586, 55060, 57837, 63709],
  L2: [54927, 56404, 59182, 65057],
  L3: [56298, 57776, 60545, 66434],
  L4: [57699, 59185, 61955, 67832],
  L5: [59137, 60624, 63393, 69278],
  L6: [60619, 62102, 64871, 70754],
  L7: [62251, 63738, 66509, 72390],
  L8: [63688, 65166, 67940, 73824],
  L9: [65278, 66758, 69529, 75409],
  L10: [66956, 68435, 71207, 77086],
  L11: [68691, 70169, 72940, 78820],
  L12: [70275, 71759, 74530, 80411],
  L13: [72032, 73517, 76288, 82164],
  L14: [73827, 75310, 78074, 83960],
  L15: [75664, 77141, 79912, 85790],
  L16: [77676, 79158, 81928, 87811],
  L17: [79460, 80953, 83715, 89596],
  L18: [81457, 82939, 85715, 91594],
  L19: [83478, 84957, 87736, 93612],
  L20: [85547, 87036, 89801, 95683],
  L21: [87664, 89153, 91921, 97799],
  L22: [89842, 91326, 94088, 99975],
  L23: [92065, 93545, 96314, 102193],
  L24: [94349, 95836, 98602, 104485],
  L25: [96694, 98174, 100945, 106824],
  L26: [99086, 100571, 103335, 109215],
  L27: [101540, 103021, 105791, 111668],
  L28: [104059, 105536, 108311, 114189],
  L29: [106637, 108119, 110884, 116772],
  L30: [109291, 110764, 113539, 119421],
  L31: [111990, 113475, 116247, 122125],
  L32: [114774, 116260, 119021, 124902],
  L33: [117624, 119111, 121880, 127759],
  L34: [120532, 122018, 124786, 130666],
  L35: [123528, 125014, 127778, 133661],
  L36: [126587, 128068, 130834, 136716],
  L37: [129733, 131218, 133988, 139871],
  L38: [132943, 134426, 137197, 143074],
  L39: [136184, 137662, 140432, 146313],
  L40: [139581, 141070, 143839, 149719],
  L41: [143069, 144551, 147322, 153209],
  L42: [146653, 148138, 150901, 156785],
  L43: [148829, 150301, 153042, 158863],
};

const MAIN_2526: Points = {
  M1: [32916, 34398, 37870, 40317],
  M2: [34823, 36373, 39851, 42234],
  M3: [37101, 38627, 41935, 44238],
  M4: [39556, 41075, 44128, 46339],
  M5: [42057, 43545, 46800, 48952],
  M6: [45352, 46839, 50474, 52300],
};
const UPPER_2526: Points = {
  U1: [47472, 48913, 52219, 57632],
  U2: [49232, 50668, 54151, 60464],
  U3: [51048, 52490, 56154, 62496],
};
const UNQUAL_2526: Points = {
  UQ1: [22601, 24066, 26789, 28343],
  UQ2: [25193, 26656, 29383, 30935],
  UQ3: [27785, 29248, 31974, 33528],
  UQ4: [30071, 31532, 34265, 35814],
  UQ5: [32667, 34126, 36856, 38402],
  UQ6: [35259, 36718, 39450, 40994],
};

export const PAY_POINTS: Record<PayYear, Partial<Record<ScaleId, Points>>> = {
  "2026-27": {
    main: MAIN_2627,
    upper: UPPER_2627,
    unqualified: UNQUAL_2627,
    lead: LEAD_2627,
    leadership: LEADERSHIP_2627,
  },
  "2025-26": {
    main: MAIN_2526,
    upper: UPPER_2526,
    unqualified: UNQUAL_2526,
  },
};

export const ALLOWANCE_RANGES: Record<
  PayYear,
  { tlr1: [number, number]; tlr2: [number, number]; tlr3: [number, number]; sen: [number, number] }
> = {
  "2026-27": { tlr1: [10531, 17819], tlr2: [3651, 8913], tlr3: [727, 3600], sen: [2885, 5690] },
  "2025-26": { tlr1: [10174, 17216], tlr2: [3527, 8611], tlr3: [702, 3478], sen: [2787, 5497] },
};

/** TPS member tiers: [upper edge of band, rate]. Rate applies to the whole salary. */
const TPS_TIERS: Record<PayYear, [number, number][]> = {
  "2026-27": [
    [36198.99, 0.074],
    [48727.99, 0.089],
    [57776.99, 0.099],
    [76572.99, 0.105],
    [104413.99, 0.116],
    [Infinity, 0.12],
  ],
  "2025-26": [
    [34872.99, 0.074],
    [46943.99, 0.089],
    [55660.99, 0.099],
    [73768.99, 0.105],
    [100590.99, 0.116],
    [Infinity, 0.12],
  ],
};

export const TPS_EMPLOYER_RATE = 0.2868;

export type LoanPlan = "none" | "plan1" | "plan2" | "plan4" | "plan5";

const LOAN_THRESHOLDS: Record<PayYear, Record<Exclude<LoanPlan, "none">, number>> = {
  "2026-27": { plan1: 26900, plan2: 29385, plan4: 33795, plan5: 25000 },
  "2025-26": { plan1: 26065, plan2: 28470, plan4: 32745, plan5: 25000 },
};
const PG_THRESHOLD = 21000;
const PG_RATE = 0.06;
const LOAN_RATE = 0.09;

const PERSONAL_ALLOWANCE = 12570;
const BASIC_BAND = 37700; // taxable above PA taxed at 20% up to this width
const HIGHER_LIMIT = 125140; // total income where 45% starts (and PA reaches 0)

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/**
 * Parse a UK tax code into a personal allowance and a flat-rate
 * override. Handles 1257L-style codes, 0T, BR, D0, D1, NT and K
 * codes. Scottish (S) and Welsh (C) prefixes are stripped — the
 * allowance is the same; Scottish bands differ and are out of
 * scope (the page says so).
 */
export function parseTaxCode(raw: string): {
  allowance: number;
  flatRate: number | null;
  noTax: boolean;
} {
  let code = (raw || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!code) code = "1257L";
  if (code.startsWith("S") || code.startsWith("C")) code = code.slice(1);
  if (code === "NT") return { allowance: 0, flatRate: null, noTax: true };
  if (code === "BR") return { allowance: 0, flatRate: 0.2, noTax: false };
  if (code === "D0") return { allowance: 0, flatRate: 0.4, noTax: false };
  if (code === "D1") return { allowance: 0, flatRate: 0.45, noTax: false };
  const kMatch = code.match(/^K(\d+)/);
  if (kMatch) {
    return { allowance: -Number(kMatch[1]) * 10, flatRate: null, noTax: false };
  }
  const m = code.match(/^(\d+)/);
  if (m) return { allowance: Number(m[1]) * 10, flatRate: null, noTax: false };
  return { allowance: PERSONAL_ALLOWANCE, flatRate: null, noTax: false };
}

export function tpsRateFor(year: PayYear, pensionablePay: number): number {
  for (const [edge, rate] of TPS_TIERS[year]) {
    if (pensionablePay <= edge) return rate;
  }
  return 0.12;
}

export interface TeacherPayInput {
  year: PayYear;
  /** Full-time-equivalent annual salary from the scale point (or a custom salary), £. */
  fteSalary: number;
  /** FTE fraction actually worked: 1 = full time, 0.6 = three days a week. */
  fteFraction: number;
  /** Full-time annual value of the TLR payment, £ (pro-rated by fteFraction). */
  tlrAnnual: number;
  /** Full-time annual value of the SEN allowance, £ (pro-rated by fteFraction). */
  senAnnual: number;
  /** Member of the Teachers' Pension Scheme. */
  pensionMember: boolean;
  /** Additional voluntary contributions, £ per month. */
  avcMonthly: number;
  /** Tax code as it appears on the payslip, e.g. "1257L". */
  taxCode: string;
  /** Undergraduate student loan plan (payroll deducts one at a time). */
  loanPlan: LoanPlan;
  /** Postgraduate loan as well. */
  postgraduateLoan: boolean;
}

export interface TeacherPayResult {
  grossAnnual: number;
  grossMonthly: number;
  pensionRate: number;
  pensionAnnual: number;
  avcAnnual: number;
  taxablePay: number;
  personalAllowance: number;
  incomeTaxAnnual: number;
  niAnnual: number;
  studentLoanAnnual: number;
  postgraduateLoanAnnual: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  employerPensionAnnual: number;
  /** CARE pension built up in one year: pensionable pay ÷ 57. */
  careAccrualAnnual: number;
}

export function calculateTeacherPay(input: TeacherPayInput): TeacherPayResult {
  const fte = Math.min(1, Math.max(0.01, input.fteFraction || 1));
  const basePay = positive(input.fteSalary) * fte;
  const allowances = (positive(input.tlrAnnual) + positive(input.senAnnual)) * fte;
  const gross = basePay + allowances;

  const pensionRate = input.pensionMember ? tpsRateFor(input.year, gross) : 0;
  const pension = gross * pensionRate;
  const avc = Math.min(positive(input.avcMonthly) * 12, gross);
  const taxablePay = Math.max(0, gross - pension - avc);

  // Income tax (England bands; allowance tapers above £100k of
  // adjusted net income, which here is taxablePay before the
  // allowance itself is applied).
  const code = parseTaxCode(input.taxCode);
  let tax = 0;
  let allowanceUsed = code.allowance;
  if (code.noTax) {
    tax = 0;
    allowanceUsed = 0;
  } else if (code.flatRate !== null) {
    tax = taxablePay * code.flatRate;
    allowanceUsed = 0;
  } else {
    let allowance = code.allowance;
    if (allowance > 0 && taxablePay > 100000) {
      allowance = Math.max(0, allowance - Math.floor((taxablePay - 100000) / 2));
    }
    allowanceUsed = allowance;
    const taxable = Math.max(0, taxablePay - allowance);
    const basic = Math.min(taxable, BASIC_BAND);
    const higher = Math.min(
      Math.max(0, taxable - BASIC_BAND),
      Math.max(0, HIGHER_LIMIT - PERSONAL_ALLOWANCE - BASIC_BAND),
    );
    const additional = Math.max(0, taxable - BASIC_BAND - higher);
    tax = basic * 0.2 + higher * 0.4 + additional * 0.45;
  }

  // National Insurance (category A): charged on gross, not
  // reduced by pension or AVCs.
  const niMain = Math.min(Math.max(0, gross - 12570), 50270 - 12570) * 0.08;
  const niUpper = Math.max(0, gross - 50270) * 0.02;
  const ni = niMain + niUpper;

  // Student loans: charged on gross above the plan threshold.
  let loan = 0;
  if (input.loanPlan !== "none") {
    const threshold = LOAN_THRESHOLDS[input.year][input.loanPlan];
    loan = Math.max(0, gross - threshold) * LOAN_RATE;
  }
  const pg = input.postgraduateLoan
    ? Math.max(0, gross - PG_THRESHOLD) * PG_RATE
    : 0;

  const net = gross - pension - avc - tax - ni - loan - pg;

  return {
    grossAnnual: round2(gross),
    grossMonthly: round2(gross / 12),
    pensionRate,
    pensionAnnual: round2(pension),
    avcAnnual: round2(avc),
    taxablePay: round2(taxablePay),
    personalAllowance: round2(allowanceUsed),
    incomeTaxAnnual: round2(tax),
    niAnnual: round2(ni),
    studentLoanAnnual: round2(loan),
    postgraduateLoanAnnual: round2(pg),
    netAnnual: round2(net),
    netMonthly: round2(net / 12),
    netWeekly: round2(net / 52.143),
    employerPensionAnnual: round2(gross * TPS_EMPLOYER_RATE),
    careAccrualAnnual: round2(gross / 57),
  };
}

/** Salary for a scale point in a region, or 0 if the year/scale has no published points. */
export function pointSalary(
  year: PayYear,
  scale: ScaleId,
  point: string,
  region: RegionId,
): number {
  const table = PAY_POINTS[year][scale];
  if (!table || !table[point]) return 0;
  const idx = { rest: 0, fringe: 1, outer: 2, inner: 3 }[region];
  return table[point][idx];
}
