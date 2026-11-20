import { MATERNITY } from "./rates.ts";
import { calculateMaternity, type MaternityResult } from "./maternity.ts";

/**
 * General Statutory Maternity Pay — the dates and eligibility layer
 * around calculateMaternity() (which does the stage maths and is
 * shared with the NHS occupational tool).
 *
 * Date rules (GOV.UK "Maternity pay and leave" and the employer SMP
 * guide, verified 20 November 2026):
 *   - The expected week of childbirth (EWC) is the week (Sunday to
 *     Saturday) in which the baby is due.
 *   - The qualifying week is the 15th week before the EWC.
 *   - To qualify on service, the employee must have been employed
 *     continuously by the same employer for 26 weeks by the end of
 *     the qualifying week — so the latest possible start date is
 *     26 weeks before the qualifying week ends.
 *   - To qualify on earnings, average weekly earnings in the relevant
 *     period (the 8 weeks ending with the last pay day on or before
 *     the end of the qualifying week) must be at least the Lower
 *     Earnings Limit (£129 a week for 2026/27).
 *   - Leave (and SMP) can start no earlier than the beginning of the
 *     11th week before the EWC.
 *   - The employee must tell the employer by the end of the
 *     qualifying week (15 weeks before the due week) that she is
 *     pregnant and when she wants leave to start.
 *
 * The pay estimate itself uses annual salary ÷ 52 as average weekly
 * earnings, like the rest of this hub; the employer's own relevant-
 * period figure can differ slightly, and the page says so.
 */

export interface MaternityPayInput {
  /** Gross annual salary, £ per year. */
  annualSalary: number;
  /** Baby's due date, ISO yyyy-mm-dd. */
  dueDate: string;
  /** First day of employment with this employer, ISO yyyy-mm-dd. */
  employmentStart: string;
  /** Planned first day of maternity leave, ISO yyyy-mm-dd (optional). */
  leaveStart: string;
}

export interface MaternityKeyDates {
  /** Sunday starting the expected week of childbirth. */
  expectedWeekStart: string;
  /** Sunday starting the qualifying week (15th week before the EWC). */
  qualifyingWeekStart: string;
  /** Saturday ending the qualifying week. */
  qualifyingWeekEnd: string;
  /** Latest date to have started the job and still meet the 26-week rule. */
  latestEmploymentStart: string;
  /** Earliest date leave can start (11 weeks before the EWC). */
  earliestLeaveStart: string;
  /** Date by which the employer must be told (end of qualifying week). */
  notificationDeadline: string;
}

export interface MaternityPayResult {
  /** Stage maths from calculateMaternity (SMP scheme). */
  pay: MaternityResult;
  /** Key dates, or null when no valid due date was given. */
  keyDates: MaternityKeyDates | null;
  /** True when the employment start meets the 26-week service test. */
  serviceTestMet: boolean | null;
  /** True when salary-derived AWE meets the Lower Earnings Limit. */
  earningsTestMet: boolean;
  /** Month-by-month gross SMP from the leave start (if given). */
  monthlyBreakdown: { label: string; amount: number }[];
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

export function maternityKeyDates(dueDate: string): MaternityKeyDates | null {
  const due = parseIsoDate(dueDate);
  if (!due) return null;
  const dueMs = toMs(due);
  // Sunday on or before the due date starts the expected week.
  const dayOfWeek = new Date(dueMs).getUTCDay(); // 0 = Sunday
  const ewcStartMs = dueMs - dayOfWeek * DAY_MS;
  const qualifyingStartMs = ewcStartMs - 15 * WEEK_MS;
  const qualifyingEndMs = qualifyingStartMs + 6 * DAY_MS;
  return {
    expectedWeekStart: toIso(fromMs(ewcStartMs)),
    qualifyingWeekStart: toIso(fromMs(qualifyingStartMs)),
    qualifyingWeekEnd: toIso(fromMs(qualifyingEndMs)),
    latestEmploymentStart: toIso(fromMs(qualifyingEndMs - 26 * WEEK_MS)),
    earliestLeaveStart: toIso(fromMs(ewcStartMs - 11 * WEEK_MS)),
    notificationDeadline: toIso(fromMs(qualifyingEndMs)),
  };
}

export function calculateMaternityPay(
  input: MaternityPayInput,
): MaternityPayResult {
  const pay = calculateMaternity({
    annualSalary: Math.max(0, input.annualSalary || 0),
    scheme: "smp",
  });
  const keyDates = maternityKeyDates(input.dueDate);
  const earningsTestMet =
    pay.averageWeeklyEarnings >= MATERNITY.lowerEarningsLimitWeekly;

  let serviceTestMet: boolean | null = null;
  const start = parseIsoDate(input.employmentStart);
  if (keyDates && start) {
    const latest = parseIsoDate(keyDates.latestEmploymentStart);
    if (latest) serviceTestMet = toMs(start) <= toMs(latest);
  }

  // Month-by-month split: walk the 39 paid weeks from the leave
  // start, assigning each week's pay to the calendar month in which
  // that week begins, then the unpaid weeks at £0 the same way.
  const monthlyBreakdown: { label: string; amount: number }[] = [];
  const leaveStart = parseIsoDate(input.leaveStart);
  if (leaveStart) {
    const startMs = toMs(leaveStart);
    const weeklyAmounts: number[] = [];
    for (const stage of pay.stages) {
      for (let i = 0; i < stage.weeks; i += 1) {
        weeklyAmounts.push(stage.weeklyAmount);
      }
    }
    const byMonth = new Map<string, number>();
    weeklyAmounts.forEach((amount, i) => {
      const weekStart = new Date(startMs + i * WEEK_MS);
      const label = weekStart.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      byMonth.set(label, round2((byMonth.get(label) || 0) + amount));
    });
    for (const [label, amount] of byMonth) {
      monthlyBreakdown.push({ label, amount });
    }
  }

  return { pay, keyDates, serviceTestMet, earningsTestMet, monthlyBreakdown };
}
