/**
 * Salary Calculator Switzerland — gross-to-net for employees,
 * tax year 2026, ordinary assessment (ordentliche Veranlagung).
 *
 * Built 22 November 2026 for the "salary calculator switzerland"
 * keyword (Semrush CH: 880/month, KD 33, CPC $1.07 — VERIFIED by
 * owner adjudication: live google.ch top-5 holds strict weak
 * slots nettoflow AS 9 and walletswiss AS 7; the declining trend
 * was adjudicated small-market noise). Rival teardown (22 Nov
 * 2026): abacushand's canton comparison does not compute cantonal
 * tax at all (the reader types in their own "effective combined
 * tax rates") and its per-canton pages cover only 5 cantons;
 * nettoflow is an hourly-wage tool; walletswiss covers 26 cantons
 * but states in its own FAQ that it uses 2025 factors; expertini
 * shows a single net figure with no breakdown and no year. This
 * calculator computes every line for all 26 cantons on 2026
 * tariffs and prints its assumptions on the page.
 *
 * FIGURES — verified 22 November 2026 against official sources:
 *   - AHV/IV/EO employee 5.3% (4.35 + 0.70 + 0.25), no cap; ALV
 *     employee 1.1% up to CHF 148,200, solidarity contribution
 *     (ALVZ) 0% — Federal Social Insurance Office (BSV),
 *     "Beiträge an die Sozialversicherungen", Stand 1.1.2026.
 *   - NBU (non-occupational accident): no statutory rate exists;
 *     the BSV Taschenstatistik 2026 puts the average employee
 *     premium at 1.15% of salary. The calculator exposes it as an
 *     editable field defaulting to 1.15%.
 *   - BVG/LPP 2026 (BSV, "Beträge gültig ab 1. Januar 2026"):
 *     entry threshold CHF 22,680; coordination deduction
 *     CHF 26,460; minimum coordinated salary CHF 3,780; maximum
 *     insured salary CHF 90,720 (maximum coordinated CHF 64,260).
 *     Statutory total rates by age band: 7% (25–34), 10% (35–44),
 *     15% (45–54), 18% (55–65); the employer pays at least half
 *     (Art. 66 BVG). Model assumption, stated on the page: age
 *     band 35–44 and a 50% employee share → 5% of the coordinated
 *     salary. Many employers insure more than the legal minimum,
 *     so real payslips often deduct more.
 *   - Federal direct tax tariff 2026: ESTV Form 58c (2026) and
 *     Rundschreiben 2-215-D-2025-d (Art. 36 DBG). Single and
 *     married/single-parent tariffs below; CHF 263 per child off
 *     the tax (Art. 36 Abs. 2bis); no tax under CHF 25 (Abs. 3).
 *     The official table rounds income down to full CHF 100
 *     steps; this calculator applies the marginal rates to the
 *     exact franc, which can differ by a few francs.
 *   - Federal deductions (DBG): social contributions in full;
 *     professional expenses flat 3% of salary after social
 *     contributions, min CHF 2,000, max CHF 4,000 (Art. 26);
 *     insurance-premium flat CHF 1,800 single / CHF 3,700 married
 *     plus CHF 700 per child (Art. 33); child deduction
 *     CHF 6,800 per child (Art. 35); married deduction CHF 2,800.
 *   - Cantonal tariffs and 2026 multipliers: ESTV Kantonsblatt
 *     (February 2026) and the ESTV Steuerfuss tables for natural
 *     persons 2026, per canton as documented in CANTONS below.
 *     Municipal tax uses the cantonal capital's 2026 multiplier
 *     as the documented default. Cantonal taxable income uses the
 *     same standard flats as the federal computation (social
 *     contributions, the 3% professional flat, an insurance
 *     flat — the federal amounts, with sourced cantonal overrides
 *     for ZH, ZG, BL and BE — and the federal CHF 6,800 child
 *     deduction, with sourced overrides for ZH, ZG and BE), plus
 *     the personal deductions documented for ZG and BE. Real
 *     cantonal rules differ in detail; the page says so.
 *   - Church tax: where a canton levies it, the calculator
 *     applies the average of the canton's Reformed and Catholic
 *     2026 multipliers (documented per canton) when the church
 *     member toggle is on.
 *
 * Out of scope (the page says so): withholding tax (Quellensteuer)
 * for permit B/L holders, wealth tax, pillar 3a and other
 * individual deductions, employer-specific pension plans above
 * the BVG legal minimum, and non-capital municipalities (the
 * capital's multiplier is the stated default).
 */

/* ------------------------------------------------------------------ */
/* Social insurance (federal, BSV 2026)                                */
/* ------------------------------------------------------------------ */

export const SWISS_SOCIAL = {
  /** AHV/IV/EO employee rate (4.35 + 0.70 + 0.25), no cap. */
  ahvRate: 0.053,
  /** ALV (unemployment) employee rate. */
  alvRate: 0.011,
  /** ALV salary cap, CHF/year; solidarity contribution is 0%. */
  alvCap: 148200,
  /** NBU default: BSV Taschenstatistik 2026 average, % of salary. */
  nbuDefaultPercent: 1.15,
  /** BVG entry threshold, CHF/year (2026). */
  bvgEntryThreshold: 22680,
  /** BVG coordination deduction, CHF/year (2026). */
  bvgCoordinationDeduction: 26460,
  /** BVG minimum coordinated salary, CHF/year (2026). */
  bvgMinCoordinated: 3780,
  /** BVG maximum insured salary, CHF/year (2026). */
  bvgMaxInsured: 90720,
  /** BVG maximum coordinated salary, CHF/year (2026). */
  bvgMaxCoordinated: 64260,
  /**
   * Employee BVG rate on the coordinated salary: the 35–44 age
   * band's statutory total is 10% and the employer must pay at
   * least half (Art. 66 BVG) → 5% employee share (assumption).
   */
  bvgEmployeeRate: 0.05,
} as const;

/* ------------------------------------------------------------------ */
/* Federal direct tax (ESTV Form 58c, 2026; Art. 36 DBG)               */
/* ------------------------------------------------------------------ */

/** [upper bound of the band (CHF), marginal rate %]. */
type Bracket = readonly [number, number];

const INF = Number.POSITIVE_INFINITY;

const FEDERAL_SINGLE: Bracket[] = [
  [15200, 0], [33200, 0.77], [43500, 0.88], [58000, 2.64],
  [76200, 2.97], [82100, 5.94], [108900, 6.6], [141500, 8.8],
  [185100, 11], [793900, 13.2], [INF, 11.5],
];

const FEDERAL_MARRIED: Bracket[] = [
  [29700, 0], [53400, 1], [61300, 2], [79100, 3], [94900, 4],
  [108700, 5], [120600, 6], [130500, 7], [138400, 8],
  [144300, 9], [148300, 10], [150400, 11], [152400, 12],
  [941300, 13], [INF, 11.5],
];

/** Tax from a marginal-bracket tariff; optional marginal-rate cap. */
function bracketTax(
  brackets: Bracket[],
  income: number,
  capRate?: number,
): number {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of brackets) {
    if (income <= lower) break;
    const r = capRate !== undefined ? Math.min(rate, capRate) : rate;
    tax += (Math.min(income, upper) - lower) * (r / 100);
    lower = upper;
  }
  return tax;
}

/**
 * A bracket tariff that switches to a flat rate on the WHOLE
 * income above a threshold (several cantons cap progression this
 * way, e.g. LU, GL, SO, SH, AI, SG, GR, NW, AR, SZ).
 */
interface BracketSet {
  brackets: Bracket[];
  /** Above this income the whole income is taxed at `rate` %. */
  wholeAbove?: { threshold: number; rate: number };
}

function bracketSetTax(set: BracketSet, income: number): number {
  if (set.wholeAbove && income > set.wholeAbove.threshold) {
    return (income * set.wholeAbove.rate) / 100;
  }
  return bracketTax(set.brackets, income);
}

/** Full splitting / Teilsplitting: tax = F(income / d) × d. */
function splitTax(
  set: BracketSet,
  income: number,
  divisor: number,
): number {
  return bracketSetTax(set, income / divisor) * divisor;
}

/* ------------------------------------------------------------------ */
/* Canton models                                                       */
/* ------------------------------------------------------------------ */

type TariffKind =
  | "brackets" // einfache Steuer from brackets, multipliers apply
  | "flat" // flat % einfache Steuer (UR, OW)
  | "average" // average-rate barème, interpolate between anchors (FR)
  | "bl" // formula tariff with CPI conversion (BL)
  | "bs" // direct tariff, no multiplier (BS)
  | "vd" // family quotient (VD)
  | "vs"; // average-rate barème giving the cantonal tax directly (VS)

export interface Canton {
  code: string;
  name: string;
  /** Cantonal capital — its municipal multiplier is the default. */
  capital: string;
  kind: TariffKind;
  single?: BracketSet;
  /** Married bracket set, where the canton has its own (else splitting). */
  married?: BracketSet;
  /** Splitting divisor for married / single-parent (else married set or single set). */
  splitting?: number;
  flatRate?: number;
  /** Average-rate anchors: [income, average rate %] (FR). */
  avgAnchors?: readonly (readonly [number, number])[];
  /** Cap every marginal rate at this % (TI 2026 transitional rule). */
  capMarginalRate?: number;
  /** Cantonal multiplier on the simple tax (ESTV Steuerfuss 2026). */
  cantonMult?: number;
  /** Municipal multiplier of the capital, on the simple tax. */
  communeMult?: number;
  /** Municipal tax as a multiple of the CANTONAL tax (BL 0.65, VS 1.10). */
  communeOnCantonal?: number;
  /** Church multipliers on the simple tax: [Reformed, Catholic]. */
  churchOnSimple?: readonly [number, number];
  /** Church tax as % of the cantonal tax: [Reformed, Catholic] (JU). */
  churchOnCantonalPct?: readonly [number, number];
  /** Flat personal tax added after multipliers (ZH CHF 24). */
  personalTax?: number;
  /** Insurance-premium flat override, single (CHF/year). */
  insuranceSingle?: number;
  /** Child deduction override (CHF/child/year). */
  childDeduction?: number;
  /** Personal deduction: single CHF/year (ZG, BE). */
  personalDeductionSingle?: number;
  /** Personal deduction: married or single with children (ZG, BE). */
  personalDeductionFamily?: number;
  /** Extra household deduction for a single householder (BE CHF 2,400). */
  householdDeductionSingle?: number;
  /** Tax credit per child off the cantonal tax (BL 750, SH 320, TG 100). */
  childTaxCredit?: number;
}

const bs = (brackets: Bracket[], wholeRate?: number): BracketSet => {
  if (wholeRate === undefined) return { brackets };
  const threshold = brackets[brackets.length - 1][0];
  return { brackets, wholeAbove: { threshold, rate: wholeRate } };
};

/**
 * The 26 cantons. Tariffs: ESTV Kantonsblatt (Feb 2026) per-canton
 * law as cited; multipliers: ESTV Steuerfuss natural persons 2026
 * (canton / capital commune / Reformed / Catholic church).
 */
export const CANTONS: Canton[] = [
  {
    code: "ZH", name: "Zurich", capital: "Zurich", kind: "brackets",
    // StG ZH §35. Cross-checked: simple tax on CHF 84,000 = CHF 4,730.
    single: bs([[7000, 0], [12000, 2], [16800, 3], [24800, 4], [34500, 5], [45700, 6], [58800, 7], [76400, 8], [110400, 9], [144100, 10], [197400, 11], [266700, 12], [INF, 13]]),
    married: bs([[14100, 0], [20500, 2], [28600, 3], [38400, 4], [49600, 5], [64100, 6], [96300, 7], [128700, 8], [177200, 9], [235100, 10], [298000, 11], [370600, 12], [INF, 13]]),
    cantonMult: 0.95, communeMult: 1.19, churchOnSimple: [0.1, 0.1],
    personalTax: 24, insuranceSingle: 2900, childDeduction: 9400,
  },
  {
    code: "BE", name: "Bern", capital: "Bern", kind: "brackets",
    // StG BE Art. 42; deductions Art. 40 (insurance CHF 2,450,
    // child CHF 8,000, personal CHF 5,200 per person + CHF 2,400
    // household deduction for a single householder).
    single: bs([[3300, 1.95], [6600, 2.9], [16400, 3.6], [32500, 4.15], [59400, 4.45], [86300, 5], [113200, 5.6], [140100, 5.75], [167000, 5.9], [193900, 6.05], [231600, 6.15], [318500, 6.3], [470600, 6.4], [INF, 6.5]]),
    married: bs([[3300, 1.55], [6600, 1.65], [16400, 2.85], [32500, 3.65], [59400, 3.8], [86300, 4.3], [113200, 4.85], [140100, 5.2], [181800, 5.7], [236100, 5.85], [290400, 5.95], [344700, 6.2], [486000, 6.4], [INF, 6.5]]),
    cantonMult: 2.975, communeMult: 1.54, churchOnSimple: [0.184, 0.19],
    insuranceSingle: 2450, childDeduction: 8000,
    personalDeductionSingle: 5200, personalDeductionFamily: 10400,
    householdDeductionSingle: 2400,
  },
  {
    code: "LU", name: "Lucerne", capital: "Lucerne", kind: "brackets",
    // StG LU §57; above the top band the whole income is taxed at
    // 5.7% (single) / 5.6% (married).
    single: bs([[9900, 0], [12300, 0.5], [15500, 1], [16700, 2], [17900, 3], [20800, 4], [25100, 4.5], [110100, 5], [163900, 5.25], [190100, 5.5], [2096800, 5.8]], 5.7),
    married: bs([[19900, 0], [24000, 0.5], [25000, 1.5], [26200, 2.5], [28300, 3], [32500, 3.5], [99200, 4.5], [138100, 5], [159200, 5.5], [1425500, 5.8]], 5.6),
    cantonMult: 1.45, communeMult: 1.45, churchOnSimple: [0.25, 0.23],
  },
  {
    code: "UR", name: "Uri", capital: "Altdorf", kind: "flat",
    // StG UR Art. 42: flat 7.1% simple tax, no married tariff.
    flatRate: 7.1,
    cantonMult: 1.0, communeMult: 0.95, churchOnSimple: [1.15, 0.82],
  },
  {
    code: "SZ", name: "Schwyz", capital: "Schwyz", kind: "brackets",
    // StG SZ §§36/36a; married: Teilsplitting 1.9. Above CHF 433,500
    // the whole income is taxed at 5%. Special rule (see compute):
    // above CHF 258,800 the commune/church base is 3.65% of the
    // whole income (§36 alone).
    single: bs([[1500, 0.25], [2800, 0.5], [3900, 0.75], [4900, 1], [5900, 1.25], [7000, 1.5], [8300, 1.75], [10100, 2], [12500, 2.25], [16100, 2.5], [22000, 2.75], [30200, 3], [40700, 3.25], [52300, 3.5], [61600, 3.65], [258800, 3.9], [433500, 7]], 5),
    splitting: 1.9,
    cantonMult: 1.1, communeMult: 1.75, churchOnSimple: [0.25, 0.26],
  },
  {
    code: "OW", name: "Obwalden", capital: "Sarnen", kind: "flat",
    // StG OW Art. 38: flat 1.8% simple tax, no married tariff.
    flatRate: 1.8,
    cantonMult: 3.25, communeMult: 3.86, churchOnSimple: [0.54, 0.54],
  },
  {
    code: "NW", name: "Nidwalden", capital: "Stans", kind: "brackets",
    // StG NW Art. 40; married: Teilsplitting 1.85. Progression cap:
    // above CHF 166,300 the tax is 2.75% of the whole income.
    single: bs([[11600, 0], [14000, 0.5], [15200, 1], [16400, 1.2], [17600, 1.4], [18800, 1.6], [20000, 1.8], [21200, 2], [22400, 2.2], [23600, 2.4], [24800, 2.6], [32800, 2.8], [50100, 2.9], [81300, 3], [116000, 3.1], [148800, 3.2], [166000, 3.3]], 2.75),
    splitting: 1.85,
    cantonMult: 2.61, communeMult: 2.35, churchOnSimple: [0.26, 0.4],
  },
  {
    code: "GL", name: "Glarus", capital: "Glarus", kind: "brackets",
    // StG GL Art. 34; married: splitting 1.7. Above CHF 464,200 the
    // whole income is taxed at 17%. Canton multiplier 0.597 =
    // 58% plus the 1.7% building-tax surcharge.
    single: bs([[10300, 0], [20600, 8], [30900, 11], [51600, 13], [103200, 15], [154700, 16], [257900, 17.5], [412600, 19], [464200, 21]], 17),
    splitting: 1.7,
    cantonMult: 0.597, communeMult: 0.61, churchOnSimple: [0.075, 0.08],
  },
  {
    code: "ZG", name: "Zug", capital: "Zug", kind: "brackets",
    // StG ZG §35 (Tarif 2025, unchanged); deductions §33: personal
    // CHF 12,000 single / CHF 24,000 family, child CHF 12,600,
    // insurance CHF 4,560 (ESTV-calculator model). The cantonal
    // rent deduction (30% of rent, max CHF 10,800) needs an actual
    // rent figure and is not modelled — the page says so.
    single: bs([[1100, 0.5], [3300, 1], [6100, 2], [10100, 3], [15300, 3.25], [21100, 3.5], [26900, 4], [34900, 4.5], [46400, 5.5], [59700, 5.5], [74700, 6.5], [94800, 8], [120100, 10], [149900, 9], [INF, 8]]),
    married: bs([[2200, 0.5], [6600, 1], [12200, 2], [20200, 3], [30600, 3.25], [42200, 3.5], [53800, 4], [69800, 4.5], [92800, 5.5], [119400, 5.5], [149400, 6.5], [189600, 8], [240200, 10], [299800, 9], [INF, 8]]),
    cantonMult: 0.78, communeMult: 0.52, churchOnSimple: [0.06, 0.0595],
    insuranceSingle: 4560, childDeduction: 12600,
    personalDeductionSingle: 12000, personalDeductionFamily: 24000,
  },
  {
    code: "FR", name: "Fribourg", capital: "Fribourg", kind: "average",
    // LICD FR art. 37: average-rate barème (rate interpolated
    // linearly between anchors); married: full splitting.
    avgAnchors: [[5200, 1], [17499, 4.1598], [17500, 4.1745], [31399, 6.2031], [31400, 6.2139], [48299, 8.0283], [48300, 8.0352], [63799, 9.0978], [63800, 9.1042], [77599, 9.981], [77600, 9.9846], [102099, 10.863], [102100, 10.8662], [128699, 11.7142], [128700, 11.7172], [155999, 12.5332], [156000, 12.5355], [180999, 13.1082], [181000, 13.1097], [207099, 13.4997], [INF, 13.5]],
    splitting: 2,
    cantonMult: 0.96, communeMult: 0.8, churchOnSimple: [0.09, 0.06],
  },
  {
    code: "SO", name: "Solothurn", capital: "Solothurn", kind: "brackets",
    // StG SO §44; married: splitting 1.9. Above CHF 319,900 the
    // whole income is taxed at 10.5%.
    single: bs([[12400, 0], [16500, 4.5], [20600, 5], [23700, 6.5], [25800, 8], [28900, 9], [40200, 9.5], [55700, 10], [101100, 10.5], [319900, 11.5]], 10.5),
    splitting: 1.9,
    cantonMult: 1.04, communeMult: 1.12, churchOnSimple: [0.16, 0.21],
  },
  {
    code: "BS", name: "Basel-Stadt", capital: "Basel", kind: "bs",
    // StG BS §36 (Tarif 2025): the tariff IS the cantonal tax (city
    // included, no multiplier). Church tax = 8% of the cantonal tax.
    single: bs([[212500, 21], [316300, 27.25], [INF, 28.25]]),
    married: bs([[424900, 21], [632500, 27.25], [INF, 28.25]]),
  },
  {
    code: "BL", name: "Basel-Landschaft", capital: "Liestal", kind: "bl",
    // StG BL §34: formula tariff (2005) with CPI conversion
    // k = 116.0/104.0 (LIK June 2025 vs June 2004); married: full
    // splitting. Commune (Liestal) = 65% of the cantonal tax.
    // Church: Reformed 0.55% of taxable income, Catholic 6.75% of
    // the cantonal tax. Child tax credit CHF 750 per child.
    splitting: 2,
    communeOnCantonal: 0.65, insuranceSingle: 2000, childTaxCredit: 750,
  },
  {
    code: "SH", name: "Schaffhausen", capital: "Schaffhausen", kind: "brackets",
    // StG SH Art. 38 (Tarif 2010); married: splitting 1.9. Above
    // CHF 210,100 the whole income is taxed at 9.9%. Child tax
    // credit CHF 320 per child (Art. 192a).
    single: bs([[6300, 0], [6600, 1], [8300, 2], [10400, 3], [12700, 4], [20600, 5], [28500, 6], [36400, 7], [44300, 8], [56900, 9], [69500, 10], [141000, 11], [210100, 12]], 9.9),
    splitting: 1.9,
    cantonMult: 0.76, communeMult: 0.83, churchOnSimple: [0.13, 0.13],
    childTaxCredit: 320,
  },
  {
    code: "AR", name: "Appenzell Ausserrhoden", capital: "Herisau", kind: "brackets",
    // StG AR Art. 39 (Tarif 2024, indexed); above the top band the
    // whole income is taxed at 2.6%.
    single: bs([[8300, 0], [9900, 0.6], [11500, 1], [15700, 1.5], [27200, 1.8], [41800, 2.2], [54300, 2.4], [74100, 2.6], [88700, 2.7], [125200, 2.8], [260800, 2.9]], 2.6),
    married: bs([[16700, 0], [18800, 0.5], [21900, 0.9], [27100, 1.4], [36500, 1.7], [52100, 1.9], [67700, 2.2], [88600, 2.5], [114700, 2.7], [177300, 2.8], [417200, 2.9]], 2.6),
    cantonMult: 3.3, communeMult: 4.1, churchOnSimple: [0.6, 0.47],
  },
  {
    code: "AI", name: "Appenzell Innerrhoden", capital: "Appenzell", kind: "brackets",
    // StG AI Art. 38 (Tarif 2001); married: full splitting. Above
    // CHF 200,000 the whole income is taxed at 8%.
    single: bs([[3000, 0], [6000, 1], [9000, 2], [12000, 3], [15000, 4], [18000, 5], [22000, 6], [26000, 7], [30000, 7.5], [40000, 8], [74000, 8.5], [140000, 9], [200000, 8.5]], 8),
    splitting: 2,
    cantonMult: 0.96, communeMult: 0.56, churchOnSimple: [0.1, 0.1],
  },
  {
    code: "SG", name: "St. Gallen", capital: "St. Gallen", kind: "brackets",
    // StG SG Art. 50; married: full splitting. Above CHF 264,500
    // the whole income is taxed at 8.5%.
    single: bs([[11600, 0], [15800, 4], [33800, 6], [60300, 8], [98400, 9.2], [264500, 9.4]], 8.5),
    splitting: 2,
    cantonMult: 1.05, communeMult: 1.38, churchOnSimple: [0.25, 0.26],
  },
  {
    code: "GR", name: "Graubünden", capital: "Chur", kind: "brackets",
    // StG GR Art. 39 (Tarif 2025); married: splitting 1.9. Above
    // CHF 780,440 the whole income is taxed at 11%. Commune and
    // church multipliers are percentages of the simple tax (ESTV
    // note 7), like the cantonal one.
    single: bs([[16895, 0], [17985, 2.5], [19075, 4], [20165, 5], [21255, 6], [22345, 6.5], [24525, 7], [31065, 8], [35425, 8.5], [39785, 9], [44145, 9.5], [65945, 10.3], [87745, 10.6], [109545, 10.7], [218545, 11.2], [327545, 11.3], [436545, 11.4], [780440, 11.6]], 11),
    splitting: 1.9,
    cantonMult: 0.92, communeMult: 0.88, churchOnSimple: [0.145, 0.09],
  },
  {
    code: "AG", name: "Aargau", capital: "Aarau", kind: "brackets",
    // StG AG §43 (Tarif 2025); married: full splitting.
    single: bs([[4300, 0], [8100, 1], [12000, 2], [16200, 3], [20500, 4], [25700, 5], [33100, 6], [41700, 7], [51300, 8], [63100, 8.5], [74800, 9], [110100, 9.5], [176400, 10], [352700, 10.5], [INF, 11]]),
    splitting: 2,
    cantonMult: 1.03, communeMult: 0.96, churchOnSimple: [0.15, 0.19],
  },
  {
    code: "TG", name: "Thurgau", capital: "Frauenfeld", kind: "brackets",
    // StG TG §37 (Tarif 2025); married: full splitting. Child tax
    // credit CHF 100 per child (§188a).
    single: bs([[12200, 0], [14600, 2], [16800, 3], [18900, 4], [21000, 5], [36800, 6], [84400, 7], [158400, 7.5], [INF, 8]]),
    splitting: 2,
    cantonMult: 1.09, communeMult: 1.42, churchOnSimple: [0.16, 0.16],
    childTaxCredit: 100,
  },
  {
    code: "TI", name: "Ticino", capital: "Bellinzona", kind: "brackets",
    // LT TI art. 35 (Tarif 2025). 2026 transitional rule (art.
    // 309g/h): marginal rates above 14% are capped at 14%. No
    // church tax is modelled for Ticino (none in the ESTV table).
    single: bs([[12500, 0.16], [17400, 5.232], [20800, 5.949], [26000, 3.923], [30100, 7.499], [39900, 9.461], [52700, 10.377], [58100, 10.988], [73000, 11.8], [91400, 11.597], [113900, 12.47], [227800, 13.08], [380600, 14.04], [INF, 14.5]]),
    married: bs([[20400, 0.145], [24800, 3.923], [28200, 4.36], [33100, 2.616], [42300, 3.923], [47800, 6.54], [60600, 7.848], [79800, 10.116], [90400, 11.074], [122600, 12.645], [141000, 12.034], [183200, 12.906], [227800, 13.777], [303900, 14.302], [761400, 14.65], [INF, 14.5]]),
    capMarginalRate: 14,
    cantonMult: 1.0, communeMult: 0.93,
  },
  {
    code: "VD", name: "Vaud", capital: "Lausanne", kind: "vd",
    // LI VD art. 47 (Barème 2026) with the family quotient: parts
    // 1 single, 1.8 married, 1.3 single parent, +0.5 per child.
    // Cantonal = base × 1.55 × 0.95 (2026 reduction of 5%);
    // communal (Lausanne) = base × 0.785. No church tax.
    single: bs([[1600, 1], [3400, 2], [5100, 3], [8300, 4], [11900, 5], [15100, 6], [23600, 7], [40500, 8], [57200, 9], [74400, 10], [91200, 11], [108100, 12], [135000, 12.5], [162000, 13], [192500, 13.5], [223000, 14], [256000, 14.5], [291700, 15], [INF, 15.5]]),
  },
  {
    code: "VS", name: "Valais", capital: "Sion", kind: "vs",
    // LF VS art. 32 (Barème 2026): average-rate barème whose tax
    // anchors sit at the class tops (see VS_TAX_ANCHORS); the
    // barème gives the CANTONAL tax directly. Married: cantonal
    // tax −35%, clamped to [CHF 680, CHF 4,900] and never above
    // the tax itself; children: CHF 300 per child off the
    // cantonal tax (art. 31a). Communal (Sion) = 110% of the
    // cantonal tax. Church: Catholic 3% of the communal tax,
    // Reformed none listed — the member toggle applies the 1.5%
    // average of the two.
  },
  {
    code: "GE", name: "Geneva", capital: "Geneva", kind: "brackets",
    // LIPP GE art. 41 (Barème indexé 2026); married: full
    // splitting. Cantonal = simple × 1.475 × 0.88 (the 12% rebate,
    // ESTV note 9); communal (Geneva) = simple × 0.4549. Church
    // tax is a voluntary contribution in Geneva — the member
    // toggle applies 16% of the cantonal tax as a documented
    // approximation (churchOnCantonalPct with equal values).
    single: bs([[18700, 0], [22530, 7.3], [24784, 8.2], [27036, 9.1], [29290, 10], [34922, 10.9], [39428, 11.3], [43935, 12.3], [48441, 12.8], [77730, 13.2], [127297, 14.2], [171231, 15], [193762, 15.6], [277125, 15.8], [295150, 16], [415688, 16.8], [651131, 17.6], [INF, 18]]),
    splitting: 2,
    cantonMult: 1.475 * 0.88, communeMult: 0.4549,
    churchOnCantonalPct: [16, 16],
  },
  {
    code: "NE", name: "Neuchâtel", capital: "Neuchâtel", kind: "brackets",
    // LCdir NE art. 40b (Barème 2024–2026). Married: the rate of
    // 52% of the income applies — equivalent to splitting with
    // divisor 1/0.52 ≈ 1.9231.
    single: bs([[7700, 0], [10300, 1.98], [15500, 3.96], [20600, 7.92], [30900, 11.484], [41200, 11.781], [51500, 12.177], [61800, 12.672], [72100, 13.167], [82400, 13.662], [92700, 14.058], [103000, 14.355], [113300, 14.652], [123600, 14.949], [133900, 15.246], [144200, 15.345], [154500, 15.444], [164800, 15.543], [175100, 15.741], [185400, 15.939], [195700, 16.038], [206000, 16.038], [309000, 13.365], [412000, 13.6125], [INF, 13.86]]),
    splitting: 1 / 0.52,
    cantonMult: 1.24, communeMult: 0.65, churchOnSimple: [0.11, 0.11],
  },
  {
    code: "JU", name: "Jura", capital: "Delémont", kind: "brackets",
    // LI JU art. 35 (Tarif 2026). Church tax is a percentage of
    // the cantonal tax (ESTV note 6): Reformed 8.1%, Catholic 6.4%.
    single: bs([[6900, 0], [14700, 1.667], [28700, 3.149], [50500, 4.029], [92700, 4.909], [205200, 5.558], [INF, 5.789]]),
    married: bs([[12600, 0], [18800, 0.88], [28100, 2.269], [48400, 3.242], [90600, 4.122], [203100, 4.771], [437600, 5.697], [INF, 5.789]]),
    cantonMult: 2.85, communeMult: 1.9,
    churchOnCantonalPct: [8.1, 6.4],
  },
];

/** Valais tax anchors: [class top (CHF), cantonal tax at that top]. */
const VS_TAX_ANCHORS: readonly (readonly [number, number])[] = [
  [6300, 126], [12700, 355.5], [19000, 701.4], [25400, 1167.95],
  [38100, 2399.45], [50800, 3910.35], [63500, 5713.35],
  [76200, 7998.2], [88900, 10486.8], [101600, 13203.95],
  [114300, 15200.65], [127000, 17144], [139700, 18929.05],
  [152400, 20726.1], [165100, 22535.65], [177800, 24358.05],
  [190500, 26193.2], [203200, 28041], [215900, 29901.5],
  [228700, 31789.3], [241400, 33675.3], [254100, 35574],
];

/** BL formula tariff (2005 values) before the CPI conversion. */
function blFormula(x: number): number {
  if (x < 15000) return 0;
  if (x <= 40000) {
    return -0.81773 * x + 0.08972 * x * (Math.log(x) - 1) + 744.3;
  }
  if (x <= 100000) {
    return -0.323806 * x + 0.043109 * x * (Math.log(x) - 1) - 1120.1564;
  }
  if (x <= 1150000) {
    return 0.052296 * x + 0.010441 * x * (Math.log(x) - 1) - 4386.9376;
  }
  return 211306.15 + 0.1862 * (x - 1150000);
}

/** CPI conversion for BL: LIK June 2025 (116.0) over June 2004 (104.0). */
const BL_K = 116.0 / 104.0;

function blTax(income: number, splitting?: number): number {
  const base = (y: number) => blFormula(y / BL_K) * BL_K;
  if (splitting) return base(income / splitting) * splitting;
  return base(income);
}

/** Average rate (%) at an income, interpolated between anchors. */
function averageRate(anchors: readonly (readonly [number, number])[], income: number): number {
  if (income <= 0) return 0;
  let prevIncome = 0;
  let prevRate = 0;
  for (const [bound, rate] of anchors) {
    if (income <= bound) {
      if (!Number.isFinite(bound)) return rate;
      const span = bound - prevIncome;
      return span > 0
        ? prevRate + ((rate - prevRate) * (income - prevIncome)) / span
        : rate;
    }
    prevIncome = bound;
    prevRate = rate;
  }
  return prevRate;
}

/* ------------------------------------------------------------------ */
/* Inputs and results                                                  */
/* ------------------------------------------------------------------ */

export type SwissMaritalStatus = "single" | "married" | "single-parent";

export interface SwissInput {
  /** Gross salary for the year, CHF (13th salary already included). */
  grossAnnual: number;
  /** Canton code, e.g. "ZH" — one of CANTONS. */
  canton: string;
  maritalStatus: SwissMaritalStatus;
  /** Number of children (for deductions and the federal reduction). */
  children: number;
  /** Member of a recognised church — church tax applies. */
  churchMember: boolean;
  /** NBU premium, % of salary (default: BSV average 1.15). */
  nbuPercent: number;
}

export interface SwissResult {
  grossAnnual: number;
  canton: Canton;
  maritalStatus: SwissMaritalStatus;
  children: number;
  churchMember: boolean;
  nbuPercent: number;
  /* Social insurance lines */
  ahv: number;
  alv: number;
  nbu: number;
  bvg: number;
  /** Coordinated salary the BVG contribution is charged on. */
  bvgCoordinatedSalary: number;
  socialTotal: number;
  /* Taxable incomes */
  federalTaxable: number;
  cantonalTaxable: number;
  /* Tax lines */
  federalTax: number;
  cantonalTax: number;
  municipalTax: number;
  churchTax: number;
  /** Flat personal tax (Zurich only, CHF 24). */
  personalTax: number;
  taxTotal: number;
  /* Bottom line */
  totalDeductions: number;
  netAnnual: number;
  /** Total deductions as a share of gross, 0–100. */
  effectiveRatePercent: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function cantonByCode(code: string): Canton {
  return CANTONS.find((c) => c.code === code) ?? CANTONS[0];
}

/** BVG employee contribution on the coordinated salary (2026 rules). */
export function bvgFor(gross: number): { coordinated: number; employee: number } {
  if (gross < SWISS_SOCIAL.bvgEntryThreshold) {
    return { coordinated: 0, employee: 0 };
  }
  const coordinated = clamp(
    Math.min(gross, SWISS_SOCIAL.bvgMaxInsured) -
      SWISS_SOCIAL.bvgCoordinationDeduction,
    SWISS_SOCIAL.bvgMinCoordinated,
    SWISS_SOCIAL.bvgMaxCoordinated,
  );
  return { coordinated, employee: coordinated * SWISS_SOCIAL.bvgEmployeeRate };
}

/** Federal direct tax (2026 tariff, child reduction, CHF 25 floor). */
export function federalTaxFor(
  taxable: number,
  familyTariff: boolean,
  children: number,
): number {
  let tax = bracketTax(familyTariff ? FEDERAL_MARRIED : FEDERAL_SINGLE, Math.max(0, taxable));
  tax -= 263 * children;
  if (tax < 25) tax = 0;
  return Math.max(0, tax);
}

/** The simple tax (einfache Steuer) for bracket/flat/average cantons. */
function simpleTaxFor(
  canton: Canton,
  taxable: number,
  family: boolean,
): number {
  const x = Math.max(0, taxable);
  if (canton.kind === "flat") {
    return (x * (canton.flatRate ?? 0)) / 100;
  }
  if (canton.kind === "average") {
    const anchors = canton.avgAnchors ?? [];
    if (family && canton.splitting) {
      const half = x / canton.splitting;
      return half * (averageRate(anchors, half) / 100) * canton.splitting;
    }
    return x * (averageRate(anchors, x) / 100);
  }
  // brackets
  const singleSet = canton.single ?? { brackets: [] };
  if (family) {
    if (canton.married) {
      return canton.capMarginalRate !== undefined
        ? bracketTax(canton.married.brackets, x, canton.capMarginalRate)
        : bracketSetTax(canton.married, x);
    }
    if (canton.splitting) {
      const half = x / canton.splitting;
      const t = canton.capMarginalRate !== undefined
        ? bracketTax(singleSet.brackets, half, canton.capMarginalRate)
        : bracketSetTax(singleSet, half);
      return t * canton.splitting;
    }
  }
  return canton.capMarginalRate !== undefined
    ? bracketTax(singleSet.brackets, x, canton.capMarginalRate)
    : bracketSetTax(singleSet, x);
}

/** Cantonal tax for Valais: the barème gives it directly. */
function vsCantonalTax(
  taxable: number,
  family: boolean,
  isMarried: boolean,
  children: number,
): number {
  const x = Math.max(0, taxable);
  let tax: number;
  if (x < 500) tax = 0;
  else if (x <= 6300) tax = x * 0.02;
  else if (x > 254100) tax = x * 0.14;
  else {
    // Interpolate the average rate between the anchor points
    // (bound, tax at that bound) — LF VS art. 32 al. 2.
    let prevBound = 6300;
    let prevRate = 2; // 126 / 6,300
    tax = x * 0.02;
    for (const [bound, taxAtBound] of VS_TAX_ANCHORS) {
      const rate = (taxAtBound / bound) * 100;
      if (x <= bound) {
        const r = prevRate + ((rate - prevRate) * (x - prevBound)) / (bound - prevBound);
        tax = (x * r) / 100;
        break;
      }
      prevBound = bound;
      prevRate = rate;
      tax = (x * rate) / 100;
    }
  }
  if (isMarried) {
    const reduction = clamp(tax * 0.35, 680, 4900);
    tax = Math.max(0, tax - Math.min(reduction, tax));
  }
  if (family) {
    tax = Math.max(0, tax - 300 * children);
  }
  return tax;
}

/** Exported for verification: the simple tax of a canton. */
export function cantonSimpleTaxFor(
  cantonCode: string,
  taxable: number,
  family: boolean,
): number {
  return simpleTaxFor(cantonByCode(cantonCode), taxable, family);
}

/** Exported for verification: the BL formula tax (before credits). */
export function blTaxFor(taxable: number, family: boolean): number {
  return blTax(taxable, family ? 2 : undefined);
}

interface CantonTaxLines {
  cantonal: number;
  municipal: number;
  church: number;
  personal: number;
}

function cantonTaxLines(
  canton: Canton,
  taxable: number,
  family: boolean,
  isMarried: boolean,
  children: number,
  churchMember: boolean,
): CantonTaxLines {
  const x = Math.max(0, taxable);
  let cantonal = 0;
  let municipal = 0;
  let church = 0;

  if (canton.kind === "bs") {
    // Direct tariff — the figure is the cantonal tax itself.
    cantonal = bracketSetTax(
      (family ? canton.married : canton.single) ?? { brackets: [] },
      x,
    );
    if (churchMember) church = cantonal * 0.08;
    return { cantonal, municipal, church, personal: 0 };
  }

  if (canton.kind === "bl") {
    const simple = blTax(x, family ? canton.splitting : undefined);
    cantonal = simple; // BL's formula already includes the 104% canton factor
    municipal = cantonal * (canton.communeOnCantonal ?? 0);
    if (churchMember) {
      // Average of Reformed (0.55% of taxable income) and Catholic
      // (6.75% of the cantonal tax).
      church = (x * 0.0055 + cantonal * 0.0675) / 2;
    }
    cantonal = Math.max(0, cantonal - (canton.childTaxCredit ?? 0) * children);
    return { cantonal, municipal, church, personal: 0 };
  }

  if (canton.kind === "vd") {
    const set = canton.single ?? { brackets: [] };
    const parts =
      (isMarried ? 1.8 : family ? 1.3 : 1) + 0.5 * children;
    const base = bracketSetTax(set, x / parts) * parts;
    cantonal = base * 1.55 * 0.95;
    municipal = base * 0.785;
    return { cantonal, municipal, church, personal: 0 };
  }

  if (canton.kind === "vs") {
    cantonal = vsCantonalTax(x, family, isMarried, children);
    municipal = cantonal * 1.1;
    if (churchMember) church = municipal * 0.015;
    return { cantonal, municipal, church, personal: 0 };
  }

  // brackets / flat / average with multipliers on the simple tax.
  // SZ special rule (§36): above CHF 258,800 of taxable income the
  // commune and church multipliers apply to 3.65% of the whole
  // income instead of the full simple tax.
  const simple = simpleTaxFor(canton, x, family);
  const communeBase =
    canton.code === "SZ" && x > 258800 ? x * 0.0365 : simple;
  cantonal = simple * (canton.cantonMult ?? 0);
  if (canton.communeOnCantonal !== undefined) {
    municipal = cantonal * canton.communeOnCantonal;
  } else {
    municipal = communeBase * (canton.communeMult ?? 0);
  }
  if (churchMember) {
    if (canton.churchOnSimple) {
      const avg = (canton.churchOnSimple[0] + canton.churchOnSimple[1]) / 2;
      church = communeBase * avg;
    } else if (canton.churchOnCantonalPct) {
      const avg =
        (canton.churchOnCantonalPct[0] + canton.churchOnCantonalPct[1]) / 2;
      church = cantonal * (avg / 100);
    }
  }

  cantonal = Math.max(0, cantonal - (canton.childTaxCredit ?? 0) * children);
  return {
    cantonal,
    municipal,
    church,
    personal: canton.personalTax ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* The calculator                                                      */
/* ------------------------------------------------------------------ */

export function calculateSwissSalary(input: SwissInput): SwissResult {
  const gross = Math.max(0, input.grossAnnual || 0);
  const canton = cantonByCode(input.canton);
  const children = Math.max(0, Math.floor(input.children || 0));
  const isMarried = input.maritalStatus === "married";
  const family = isMarried || input.maritalStatus === "single-parent";
  const nbuPercent = clamp(input.nbuPercent || 0, 0, 10);

  /* Social insurance */
  const ahv = gross * SWISS_SOCIAL.ahvRate;
  const alv = Math.min(gross, SWISS_SOCIAL.alvCap) * SWISS_SOCIAL.alvRate;
  const nbu = gross * (nbuPercent / 100);
  const bvg = bvgFor(gross);
  const socialTotal = ahv + alv + nbu + bvg.employee;

  /* Standard deductions shared by the federal and cantonal bases */
  const netSalary = gross - socialTotal;
  const professional = clamp(netSalary * 0.03, 2000, 4000);
  const federalInsurance = (isMarried ? 3700 : 1800) + 700 * children;

  const federalTaxable = Math.max(
    0,
    gross -
      socialTotal -
      professional -
      federalInsurance -
      6800 * children -
      (isMarried ? 2800 : 0),
  );

  const cantonInsurance =
    canton.insuranceSingle !== undefined
      ? canton.insuranceSingle * (isMarried ? 2 : 1) + 700 * children
      : federalInsurance;
  let personalDeduction = 0;
  if (canton.personalDeductionSingle !== undefined) {
    personalDeduction = family
      ? (canton.personalDeductionFamily ?? canton.personalDeductionSingle)
      : canton.personalDeductionSingle;
  }
  // BE: the CHF 2,400 household deduction goes to a householder
  // who is not married (single, with or without children).
  const householdDeduction = !isMarried
    ? (canton.householdDeductionSingle ?? 0)
    : 0;
  const cantonalTaxable = Math.max(
    0,
    gross -
      socialTotal -
      professional -
      cantonInsurance -
      (canton.childDeduction ?? 6800) * children -
      personalDeduction -
      householdDeduction,
  );

  const federalTax = federalTaxFor(federalTaxable, family, children);
  const lines = cantonTaxLines(
    canton,
    cantonalTaxable,
    family,
    isMarried,
    children,
    input.churchMember,
  );

  const taxTotal =
    federalTax + lines.cantonal + lines.municipal + lines.church + lines.personal;
  const totalDeductions = socialTotal + taxTotal;
  const netAnnual = gross - totalDeductions;

  return {
    grossAnnual: round2(gross),
    canton,
    maritalStatus: input.maritalStatus,
    children,
    churchMember: input.churchMember,
    nbuPercent,
    ahv: round2(ahv),
    alv: round2(alv),
    nbu: round2(nbu),
    bvg: round2(bvg.employee),
    bvgCoordinatedSalary: round2(bvg.coordinated),
    socialTotal: round2(socialTotal),
    federalTaxable: round2(federalTaxable),
    cantonalTaxable: round2(cantonalTaxable),
    federalTax: round2(federalTax),
    cantonalTax: round2(lines.cantonal),
    municipalTax: round2(lines.municipal),
    churchTax: round2(lines.church),
    personalTax: round2(lines.personal),
    taxTotal: round2(taxTotal),
    totalDeductions: round2(totalDeductions),
    netAnnual: round2(netAnnual),
    effectiveRatePercent:
      gross > 0 ? round2((totalDeductions / gross) * 100) : 0,
  };
}
