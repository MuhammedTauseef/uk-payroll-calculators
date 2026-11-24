import { NEONATAL, type NeonatalTaxYear } from "./rates.ts";

/**
 * Statutory Neonatal Care Pay (SNCP) — the calculation and
 * eligibility layer.
 *
 * Rules (GOV.UK "Statutory Neonatal Care Pay and Leave: employer
 * guide", "Manually calculate Statutory Neonatal Care Pay" and
 * "Rates and thresholds for employers", verified 24 November 2026):
 *   - The right applies to babies born on or after 6 April 2025
 *     whose neonatal care starts within 28 days of birth, to
 *     parents employed in England, Scotland or Wales.
 *   - Neonatal Care Leave is a day-one right: one week of leave
 *     for every 7 consecutive full days the baby spends in
 *     neonatal care, up to 12 weeks, taken within 68 weeks of
 *     the birth.
 *   - SNCP pays the SAME amount every week — the lower of the
 *     tax year's flat rate or 90% of average weekly earnings.
 *     Unlike SMP there is no higher-rate first-6-weeks stage.
 *   - To be paid, the employee must also pass two tests: 26
 *     weeks' continuous service ending with the qualifying week,
 *     and average weekly earnings at or above the Lower Earnings
 *     Limit (£125 a week in 2025/26, £129 in 2026/27).
 *   - The qualifying week is the 15th week before the expected
 *     week of childbirth if the employee is also entitled to
 *     SMP or SPP, the matching week if entitled to SAP, and
 *     otherwise the week immediately before the baby enters
 *     neonatal care. This calculator uses the "otherwise" week
 *     (the week before care started); a parent who passed the
 *     SMP/SPP service test on the earlier week passes this one
 *     too, and the page says so.
 *
 * Average weekly earnings are an input here, not derived from a
 * salary: SNCP claims usually start at short notice, with the
 * employer's relevant-period figure already known, and the page
 * explains how that figure is worked out.
 */

export interface NeonatalInput {
  /** Tax year the pay falls in. */
  taxYear: NeonatalTaxYear;
  /** Average weekly earnings in the relevant period, £/week. */
  averageWeeklyEarnings: number;
  /** Consecutive full days the baby spent in neonatal care. */
  daysInCare: number;
  /** Baby's date of birth, ISO yyyy-mm-dd. */
  birthDate: string;
  /** Date neonatal care started, ISO yyyy-mm-dd. */
  careStartDate: string;
  /** First day of employment with this employer, ISO yyyy-mm-dd. */
  employmentStart: string;
}

export interface NeonatalWeekRow {
  /** Week number within the pay period, from 1. */
  week: number;
  /** SNCP payable for that week, £. */
  amount: number;
  /** Running total up to and including that week, £. */
  cumulative: number;
}

export interface NeonatalResult {
  taxYear: NeonatalTaxYear;
  /** Flat statutory weekly rate for the tax year, £/week. */
  flatRate: number;
  /** Lower Earnings Limit for the tax year, £/week. */
  lowerEarningsLimitWeekly: number;
  /** 90% of average weekly earnings, £/week. */
  ninetyPercentOfAwe: number;
  /** Weekly SNCP amount (the lower of the two), £/week. */
  weeklyAmount: number;
  /** Which rule produced the weekly amount. */
  rateBasis: "statutory-cap" | "ninety-percent";
  /** Whole weeks of leave/pay earned (days ÷ 7, capped at 12). */
  weeksEntitled: number;
  /** Total SNCP across the entitled weeks, £. */
  totalPay: number;
  /** Week-by-week amounts with a running total. */
  weekByWeek: NeonatalWeekRow[];
  /** Baby born on or after 6 April 2025 (null: no birth date given). */
  bornInScheme: boolean | null;
  /** Care started within 28 days of birth (null: a date is missing). */
  careWithinWindow: boolean | null;
  /** 26-week service test (null: dates needed are missing). */
  serviceTestMet: boolean | null;
  /** Saturday ending the qualifying week, ISO, or null. */
  qualifyingWeekEnd: string | null;
  /** Latest job start date that still passes the service test, ISO, or null. */
  latestEmploymentStart: string | null;
  /** Earnings test: AWE at or above the Lower Earnings Limit. */
  earningsTestMet: boolean;
  /** True when every test that can be checked passes and at least one week is earned. */
  eligible: boolean;
  /** Plain-English reason for each failed test (empty when eligible). */
  failedReasons: string[];
  /** What the employer can reclaim at the standard 92%, £. */
  employerRecoveryStandard: number;
  /** What the employer can reclaim with Small Employers' Relief, £. */
  employerRecoverySmall: number;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseIsoDate(value: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function toMs(d: DateParts): number {
  return Date.UTC(d.year, d.month - 1, d.day);
}

function fromMs(ms: number): DateParts {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function toIso(d: DateParts): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.year}-${p(d.month)}-${p(d.day)}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateNeonatal(input: NeonatalInput): NeonatalResult {
  const year = NEONATAL.years[input.taxYear];
  const awe = Math.max(0, input.averageWeeklyEarnings || 0);
  const days = Math.max(0, Math.floor(input.daysInCare || 0));

  const ninetyPercent = NEONATAL.aweFraction * awe;
  const weeklyExact = Math.min(year.weeklyRate, ninetyPercent);
  const weeksEntitled = Math.min(
    NEONATAL.maxWeeks,
    Math.floor(days / 7),
  );
  const totalPay = round2(weeklyExact * weeksEntitled);

  const weekByWeek: NeonatalWeekRow[] = [];
  for (let i = 1; i <= weeksEntitled; i += 1) {
    weekByWeek.push({
      week: i,
      amount: round2(weeklyExact),
      cumulative: round2(weeklyExact * i),
    });
  }

  const birth = parseIsoDate(input.birthDate);
  const careStart = parseIsoDate(input.careStartDate);
  const jobStart = parseIsoDate(input.employmentStart);

  const schemeStart = parseIsoDate(NEONATAL.schemeStartDate);
  const bornInScheme =
    birth && schemeStart ? toMs(birth) >= toMs(schemeStart) : null;

  let careWithinWindow: boolean | null = null;
  if (birth && careStart) {
    const gapDays = Math.round((toMs(careStart) - toMs(birth)) / DAY_MS);
    careWithinWindow =
      gapDays >= 0 && gapDays <= NEONATAL.careStartWindowDays;
  }

  // Qualifying week (the "otherwise" case): the Sunday-to-Saturday
  // week immediately before the week in which neonatal care starts.
  // Its Saturday is the day before that Sunday.
  let qualifyingWeekEnd: string | null = null;
  let latestEmploymentStart: string | null = null;
  let serviceTestMet: boolean | null = null;
  if (careStart) {
    const careMs = toMs(careStart);
    const dayOfWeek = new Date(careMs).getUTCDay(); // 0 = Sunday
    const careWeekSundayMs = careMs - dayOfWeek * DAY_MS;
    const qwEndMs = careWeekSundayMs - DAY_MS;
    const latestMs = qwEndMs - 26 * WEEK_MS;
    qualifyingWeekEnd = toIso(fromMs(qwEndMs));
    latestEmploymentStart = toIso(fromMs(latestMs));
    if (jobStart) serviceTestMet = toMs(jobStart) <= latestMs;
  }

  const earningsTestMet = awe >= year.lowerEarningsLimitWeekly;

  const failedReasons: string[] = [];
  if (weeksEntitled === 0) {
    failedReasons.push(
      "the baby spent fewer than 7 consecutive days in neonatal care, so no week of leave or pay has been earned yet",
    );
  }
  if (bornInScheme === false) {
    failedReasons.push(
      "the baby was born before 6 April 2025, when the scheme started",
    );
  }
  if (careWithinWindow === false) {
    failedReasons.push(
      "the neonatal care did not start within 28 days of the birth",
    );
  }
  if (serviceTestMet === false) {
    failedReasons.push(
      "the job start date does not give 26 weeks of continuous service by the end of the qualifying week",
    );
  }
  if (!earningsTestMet) {
    failedReasons.push(
      `average weekly earnings are below the ${input.taxYear} Lower Earnings Limit of £${year.lowerEarningsLimitWeekly} a week`,
    );
  }

  const eligible =
    weeksEntitled > 0 &&
    bornInScheme !== false &&
    careWithinWindow !== false &&
    serviceTestMet !== false &&
    earningsTestMet;

  return {
    taxYear: input.taxYear,
    flatRate: year.weeklyRate,
    lowerEarningsLimitWeekly: year.lowerEarningsLimitWeekly,
    ninetyPercentOfAwe: round2(ninetyPercent),
    weeklyAmount: round2(weeklyExact),
    rateBasis: ninetyPercent < year.weeklyRate ? "ninety-percent" : "statutory-cap",
    weeksEntitled,
    totalPay,
    weekByWeek,
    bornInScheme,
    careWithinWindow,
    serviceTestMet,
    qualifyingWeekEnd,
    latestEmploymentStart,
    earningsTestMet,
    eligible,
    failedReasons,
    employerRecoveryStandard: round2(totalPay * NEONATAL.standardRecovery),
    employerRecoverySmall: round2(totalPay * year.smallEmployerRecovery),
  };
}
