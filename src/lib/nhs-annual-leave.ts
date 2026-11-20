/**
 * NHS annual leave maths — Agenda for Change (AfC) entitlement in
 * days and hours, the companion to nhs-pay.ts.
 *
 * Rules verified on 20 November 2026 against:
 *   - Section 13 (and Table 6) of the NHS Terms and Conditions of
 *     Service Handbook (Agenda for Change), as published by the NHS
 *     Staff Council and summarised by NHS Employers: on appointment
 *     27 days of annual leave, after 5 years of reckonable service
 *     29 days, after 10 years 33 days, in each case PLUS general
 *     public holidays — 8 in England, Scotland and Wales, 10 in
 *     Northern Ireland (which adds St Patrick's Day and the
 *     12 July holiday).
 *   - NHS Wales: one extra day at every tier (28 / 30 / 34 days),
 *     as published in NHS Wales health board annual leave policies
 *     (e.g. Cwm Taf Morgannwg University Health Board policy
 *     WOD63) and the Public Health Wales remuneration report.
 *   - NHS Scotland: the full-time week for AfC staff reduced to
 *     36 hours from 1 April 2026 (pay protected), so a Scottish
 *     full-time day is 7.2 hours — confirmed on NHS Scotland's own
 *     workforce calculator pages. Everywhere else the full-time
 *     week is 37.5 hours and a day is 7.5 hours.
 *
 * Method (the handbook's own, Section 13): entitlement is held in
 * HOURS. A part-time member of staff gets the full-time hours
 * scaled by contracted hours ÷ full-time week hours. The annual
 * leave element and the public holiday element are scaled
 * separately and shown separately, because the two are booked
 * differently.
 *
 * ROUNDING RULE (applied consistently everywhere in this file):
 * every hour figure is rounded to 2 decimal places (the nearest
 * 0.01 of an hour) and every day figure to 1 decimal place. The
 * public holiday element is NOT rounded up to the nearest half
 * day: some trusts apply that rounding under paragraph 13.6 of
 * the handbook, and the page says so, but the calculator shows
 * the straight pro-rata so the printed formula reconciles to the
 * penny with the result.
 *
 * Starters and leavers: entitlement accrues by DAYS — the days
 * worked in the leave year (1 April to 31 March) divided by the
 * days in that leave year (365, or 366 when it contains a
 * 29 February). A point exactly halfway through the leave year
 * therefore accrues exactly half the full-year hours.
 */

export type NhsNation =
  | "england"
  | "wales"
  | "scotland"
  | "northern-ireland";

export type NhsServiceBand = "under-5" | "5-to-10" | "10-plus";

export type NhsLeaveMode = "full-year" | "joiner" | "leaver";

export interface NhsNationRules {
  /** Full-time annual leave in days, by service band. */
  leaveDays: Record<NhsServiceBand, number>;
  /** General public holidays a year, in days. */
  publicHolidays: number;
  /** The full-time contracted week, in hours. */
  fullTimeWeekHours: number;
}

export const NHS_NATION_RULES: Record<NhsNation, NhsNationRules> = {
  england: {
    leaveDays: { "under-5": 27, "5-to-10": 29, "10-plus": 33 },
    publicHolidays: 8,
    fullTimeWeekHours: 37.5,
  },
  wales: {
    // One extra day at every tier (NHS Wales enhancement).
    leaveDays: { "under-5": 28, "5-to-10": 30, "10-plus": 34 },
    publicHolidays: 8,
    fullTimeWeekHours: 37.5,
  },
  scotland: {
    leaveDays: { "under-5": 27, "5-to-10": 29, "10-plus": 33 },
    publicHolidays: 8,
    // 36-hour full-time week from 1 April 2026, so a day is 7.2 hours.
    fullTimeWeekHours: 36,
  },
  "northern-ireland": {
    leaveDays: { "under-5": 27, "5-to-10": 29, "10-plus": 33 },
    // 8 general public holidays plus St Patrick's Day and 12 July.
    publicHolidays: 10,
    fullTimeWeekHours: 37.5,
  },
};

export const NHS_NATION_LABELS: Record<NhsNation, string> = {
  england: "England",
  wales: "Wales",
  scotland: "Scotland",
  "northern-ireland": "Northern Ireland",
};

export const NHS_SERVICE_BAND_LABELS: Record<NhsServiceBand, string> = {
  "under-5": "Under 5 years",
  "5-to-10": "5 to 10 years",
  "10-plus": "10 years or more",
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round1(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function positive(n: number | undefined): number {
  if (!n || Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

/** Hours in one day of leave: a fifth of the full-time week. */
export function nhsDayHours(nation: NhsNation): number {
  return NHS_NATION_RULES[nation].fullTimeWeekHours / 5;
}

export interface NhsAnnualLeaveInput {
  nation: NhsNation;
  serviceBand: NhsServiceBand;
  /** Contracted hours a week. */
  contractedHours: number;
}

export interface NhsAnnualLeaveResult {
  nation: NhsNation;
  serviceBand: NhsServiceBand;
  /** Full-time annual leave for the band, in days. */
  leaveDays: number;
  /** Public holidays a year, in days. */
  publicHolidays: number;
  /** Hours in one day of leave for this nation. */
  dayHours: number;
  /** The nation's full-time week, in hours. */
  fullTimeWeekHours: number;
  /** Contracted hours used, after clamping to the full-time week. */
  contractedHours: number;
  /** Annual leave entitlement in hours (pro-rata). */
  leaveHours: number;
  /** Public holiday entitlement in hours (pro-rata). */
  publicHolidayHours: number;
  /** Leave + public holidays, in hours. */
  totalHours: number;
  /** The total expressed in days of this nation's day length. */
  totalDays: number;
}

export function calculateNhsAnnualLeave(
  input: NhsAnnualLeaveInput,
): NhsAnnualLeaveResult {
  const rules = NHS_NATION_RULES[input.nation];
  const dayHours = rules.fullTimeWeekHours / 5;
  const contracted = Math.min(
    positive(input.contractedHours),
    rules.fullTimeWeekHours,
  );
  const ratio =
    rules.fullTimeWeekHours > 0 ? contracted / rules.fullTimeWeekHours : 0;
  const leaveDays = rules.leaveDays[input.serviceBand];
  const leaveHours = round2(leaveDays * dayHours * ratio);
  const publicHolidayHours = round2(
    rules.publicHolidays * dayHours * ratio,
  );
  const totalHours = round2(leaveHours + publicHolidayHours);
  return {
    nation: input.nation,
    serviceBand: input.serviceBand,
    leaveDays,
    publicHolidays: rules.publicHolidays,
    dayHours,
    fullTimeWeekHours: rules.fullTimeWeekHours,
    contractedHours: contracted,
    leaveHours,
    publicHolidayHours,
    totalHours,
    totalDays: dayHours > 0 ? round1(totalHours / dayHours) : 0,
  };
}

/** The NHS leave year containing a date: 1 April to 31 March. */
export function nhsLeaveYearFor(dateISO: string): {
  startISO: string;
  endISO: string;
  daysInYear: number;
} {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  // On or after 1 April, the leave year started this calendar year.
  const startYear = date >= Date.UTC(y, 3, 1) ? y : y - 1;
  const start = Date.UTC(startYear, 3, 1);
  const end = Date.UTC(startYear + 1, 2, 31);
  const daysInYear = Math.round((end - start) / 86_400_000) + 1;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  return { startISO: iso(start), endISO: iso(end), daysInYear };
}

/**
 * The fraction of the leave year a starter or leaver works.
 * Leaver: days from the leave year's first day to the leaving
 * date, counting both the first day and the leaving day. Joiner:
 * days from the start date to the leave year's last day, counting
 * both. Divided by the days in the leave year.
 */
export function nhsFractionOfYear(
  dateISO: string,
  mode: "joiner" | "leaver",
): number {
  const { startISO, endISO, daysInYear } = nhsLeaveYearFor(dateISO);
  const parse = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  };
  const date = parse(dateISO);
  const days =
    mode === "leaver"
      ? Math.round((date - parse(startISO)) / 86_400_000) + 1
      : Math.round((parse(endISO) - date) / 86_400_000) + 1;
  return Math.min(1, Math.max(0, days / daysInYear));
}

export interface NhsAccrualResult {
  /** The full-year result the accrual was scaled from. */
  fullYear: NhsAnnualLeaveResult;
  /** Fraction of the leave year worked, 0–1. */
  fraction: number;
  /** Accrued annual leave, in hours. */
  accruedLeaveHours: number;
  /** Accrued public holiday element, in hours. */
  accruedPublicHolidayHours: number;
  /** Accrued leave + public holidays, in hours. */
  accruedTotalHours: number;
  /** Leave already taken, in hours. */
  takenHours: number;
  /**
   * Accrued minus taken: what is still owed to the worker in
   * hours. Negative when more was taken than had accrued.
   */
  balanceHours: number;
}

/** Scale a full-year result down to the part of the year worked. */
export function accrueNhsLeave(
  fullYear: NhsAnnualLeaveResult,
  fraction: number,
  takenHours = 0,
): NhsAccrualResult {
  const f = Math.min(1, Math.max(0, fraction || 0));
  const accruedLeaveHours = round2(fullYear.leaveHours * f);
  const accruedPublicHolidayHours = round2(
    fullYear.publicHolidayHours * f,
  );
  const accruedTotalHours = round2(
    accruedLeaveHours + accruedPublicHolidayHours,
  );
  const taken = positive(takenHours);
  return {
    fullYear,
    fraction: f,
    accruedLeaveHours,
    accruedPublicHolidayHours,
    accruedTotalHours,
    takenHours: taken,
    balanceHours: round2(accruedTotalHours - taken),
  };
}
