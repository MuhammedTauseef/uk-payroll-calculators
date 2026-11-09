/**
 * Overtime pay maths — UK.
 *
 * Every rule below was verified against GOV.UK at build time
 * (9 November 2026):
 *   - "Overtime: your rights"
 *     https://www.gov.uk/overtime-your-rights
 *   - "National Minimum Wage and National Living Wage rates"
 *     https://www.gov.uk/national-minimum-wage-rates
 *
 * The rules, as GOV.UK states them:
 *   - There is NO statutory right to an overtime premium in UK law.
 *     GOV.UK: "Employers do not have to pay workers for overtime" —
 *     whether overtime is paid at all, and at what rate, comes from
 *     the employment contract.
 *   - The statutory floor is the National Minimum Wage: "your
 *     average pay for the total hours you work must not fall below
 *     the National Minimum Wage". So the check that matters is the
 *     EFFECTIVE rate — total pay for the period ÷ total hours
 *     (normal + overtime) — against the minimum for the worker's
 *     age band, across the pay reference period.
 *   - Current rates (the April 2026 set, in force from 1 April
 *     2026; GOV.UK lists the April 2025 set — 21+ £12.21, 18–20
 *     £10.00, under 18 £7.55, apprentice £7.55 — as the previous
 *     rates): 21 and over £12.71 · 18 to 20 £10.85 · under 18 £8.00
 *     · apprentice £8.00.
 *   - The apprentice rate applies to apprentices under 19, and to
 *     apprentices aged 19 or over in the first year of their
 *     apprenticeship; after that, the age-band rate applies.
 *
 * The multipliers offered (1.0× flat, 1.25×, 1.5×, 2.0×, custom)
 * are common CONTRACT rates, not legal entitlements — the page
 * says so in plain words.
 */

export type OvertimeRateBasis = "hourly" | "salary";

export type NmwAgeBand = "over21" | "age18to20" | "under18" | "apprentice";

export interface NmwBand {
  id: NmwAgeBand;
  label: string;
  /** Statutory minimum hourly rate for the band, £ (April 2026). */
  rate: number;
}

/**
 * National Minimum Wage / National Living Wage bands — the April
 * 2026 rates from GOV.UK, verified 9 November 2026.
 */
export const NMW_BANDS: NmwBand[] = [
  { id: "over21", label: "21 and over (National Living Wage)", rate: 12.71 },
  { id: "age18to20", label: "18 to 20", rate: 10.85 },
  { id: "under18", label: "Under 18", rate: 8.0 },
  { id: "apprentice", label: "Apprentice", rate: 8.0 },
];

export function nmwBand(id: NmwAgeBand): NmwBand {
  return NMW_BANDS.find((b) => b.id === id) ?? NMW_BANDS[0];
}

export interface OvertimePreset {
  multiplier: number;
  label: string;
}

/** Common contract overtime rates — presets, not legal rights. */
export const OVERTIME_PRESETS: OvertimePreset[] = [
  { multiplier: 1, label: "Flat rate (1×) — no premium" },
  { multiplier: 1.25, label: "Time and a quarter (1.25×)" },
  { multiplier: 1.5, label: "Time and a half (1.5×)" },
  { multiplier: 2, label: "Double time (2×)" },
];

export interface OvertimeInput {
  /** Enter an hourly rate directly, or derive it from a salary. */
  basis: OvertimeRateBasis;
  /** Hourly rate in £, used when basis is "hourly". */
  hourlyRate: number;
  /** Annual salary in £, used when basis is "salary". */
  annualSalary: number;
  /** Contracted hours per week, used when basis is "salary". */
  contractedHoursPerWeek: number;
  /** Normal (contracted) hours worked in the period. */
  normalHours: number;
  /** Overtime hours worked in the period. */
  overtimeHours: number;
  /** Overtime multiplier from the contract (1 = flat, 1.5 = time and a half, 0 = unpaid). */
  multiplier: number;
  /** Age band for the National Minimum Wage check. */
  ageBand: NmwAgeBand;
}

export interface OvertimeResult {
  /**
   * The hourly rate the calculation runs on, £. When derived from a
   * salary this is salary ÷ 52 ÷ contracted hours per week, kept
   * exact — pay lines are rounded to the penny from it.
   */
  hourlyRate: number;
  /** hourlyRate × multiplier, £ (the rate each overtime hour is paid at). */
  overtimeHourlyRate: number;
  /** Pay for the normal hours: round2(hourlyRate × normalHours). */
  normalPay: number;
  /** Pay for the overtime hours: round2(hourlyRate × multiplier × overtimeHours). */
  overtimePay: number;
  /** normalPay + overtimePay (built from the rounded lines, so the printed figures add up). */
  totalPay: number;
  /** normalHours + overtimeHours. */
  totalHours: number;
  /**
   * totalPay ÷ totalHours, £/hour — the average the National
   * Minimum Wage floor is tested against. Null when no hours at all.
   */
  effectiveHourlyRate: number | null;
  /** The age band checked, echoed. */
  ageBand: NmwAgeBand;
  /** The band's statutory minimum, £/hour. */
  nmwRate: number;
  /**
   * True when the effective rate is at or above the band minimum.
   * Null when there are no hours to average over.
   */
  nmwPass: boolean | null;
  /**
   * nmwRate − effectiveHourlyRate, £/hour — how far below the floor
   * the average sits (0 or negative when the check passes). Null
   * when there are no hours.
   */
  nmwShortfallPerHour: number | null;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function calculateOvertime(input: OvertimeInput): OvertimeResult {
  const band = nmwBand(input.ageBand);

  // The hourly rate: entered directly, or derived from the salary
  // over the contracted week (annual ÷ 52 weeks ÷ hours per week —
  // the house ÷52 convention, as in prorata.ts).
  let hourlyRate = 0;
  if (input.basis === "salary") {
    const salary = positive(input.annualSalary);
    const hoursPerWeek = positive(input.contractedHoursPerWeek);
    hourlyRate = hoursPerWeek > 0 ? salary / 52 / hoursPerWeek : 0;
  } else {
    hourlyRate = positive(input.hourlyRate);
  }

  const normalHours = positive(input.normalHours);
  const overtimeHours = positive(input.overtimeHours);
  const multiplier = Math.max(0, input.multiplier || 0);

  // Pay lines are rounded to the penny first and the total is built
  // from those rounded lines, so the printed figures always add up
  // (the house display rule, as on the payslip).
  const normalPay = round2(hourlyRate * normalHours);
  const overtimePay = round2(hourlyRate * multiplier * overtimeHours);
  const totalPay = round2(normalPay + overtimePay);
  const totalHours = normalHours + overtimeHours;

  const effectiveHourlyRate =
    totalHours > 0 ? round2(totalPay / totalHours) : null;

  return {
    hourlyRate,
    overtimeHourlyRate: hourlyRate * multiplier,
    normalPay,
    overtimePay,
    totalPay,
    totalHours,
    effectiveHourlyRate,
    ageBand: band.id,
    nmwRate: band.rate,
    nmwPass:
      effectiveHourlyRate !== null
        ? effectiveHourlyRate >= band.rate
        : null,
    nmwShortfallPerHour:
      effectiveHourlyRate !== null
        ? round2(band.rate - effectiveHourlyRate)
        : null,
  };
}
