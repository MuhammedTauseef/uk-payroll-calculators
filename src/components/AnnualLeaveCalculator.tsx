"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateAnnualLeave,
  IRREGULAR_ACCRUAL_PERCENT,
  MAX_STATUTORY_LEAVE_DAYS,
  STATUTORY_LEAVE_WEEKS,
} from "@/lib/annualleave";
import type { AnnualLeaveMode } from "@/lib/annualleave";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtDays(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)} days`;
}

function fmtHours(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, "")} hours`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function AnnualLeaveCalculator() {
  const [mode, setMode] = useState<AnnualLeaveMode>("regular");

  // Regular-hours inputs.
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [hoursPerDay, setHoursPerDay] = useState("7.5");
  const [startBasis, setStartBasis] = useState<"full" | "partway">("full");
  const [leaveYearStart, setLeaveYearStart] = useState("2026-01-01");
  const [employmentStart, setEmploymentStart] = useState("2026-07-01");
  const [daysTaken, setDaysTaken] = useState("0");

  // Irregular-hours inputs.
  const [hoursWorked, setHoursWorked] = useState("100");
  const [hoursTaken, setHoursTaken] = useState("0");

  const daysNumber = parseAmount(daysPerWeek);
  const hoursPerDayNumber = parseAmount(hoursPerDay);
  const daysTakenNumber = parseAmount(daysTaken);
  const hoursWorkedNumber = parseAmount(hoursWorked);
  const hoursTakenNumber = parseAmount(hoursTaken);

  const result = useMemo(
    () =>
      calculateAnnualLeave({
        mode,
        daysPerWeek: daysNumber,
        hoursPerDay: hoursPerDayNumber,
        startedPartWay: startBasis === "partway",
        leaveYearStart,
        employmentStart,
        daysAlreadyTaken: daysTakenNumber,
        hoursWorked: hoursWorkedNumber,
        hoursAlreadyTaken: hoursTakenNumber,
      }),
    [
      mode,
      daysNumber,
      hoursPerDayNumber,
      startBasis,
      leaveYearStart,
      employmentStart,
      daysTakenNumber,
      hoursWorkedNumber,
      hoursTakenNumber,
    ],
  );

  const cappedAtMax =
    mode === "regular" &&
    STATUTORY_LEAVE_WEEKS * daysNumber > MAX_STATUTORY_LEAVE_DAYS;

  const regularOverTaken =
    mode === "regular" &&
    result.remainingDays !== null &&
    result.remainingDays < 0;
  const irregularOverTaken =
    mode === "irregular" &&
    result.remainingHoursBooked !== null &&
    result.remainingHoursBooked < 0;

  const stickyValue =
    mode === "regular"
      ? result.entitlementDays !== null
        ? `${fmtDays(result.entitlementDays)} this leave year`
        : "—"
      : result.accruedHoursBooked !== null
        ? `${result.accruedHoursBooked} hours accrued`
        : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="al-mode" className={labelClass}>
            How are the hours worked?
          </label>
          <select
            id="al-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as AnnualLeaveMode)}
            className={inputClass}
          >
            <option value="regular">
              Regular hours — same days every week
            </option>
            <option value="irregular">
              Irregular hours or part-year — leave builds up as you work
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Most staff are on regular hours. Pick irregular hours for
            casual, zero-hours, agency or term-time work — since April
            2024 that leave accrues at {IRREGULAR_ACCRUAL_PERCENT}% of
            the hours worked.
          </p>
        </div>

        {mode === "regular" ? (
          <>
            <div>
              <label htmlFor="al-days" className={labelClass}>
                Days worked per week
              </label>
              <input
                id="al-days"
                type="number"
                inputMode="decimal"
                min="0"
                max="7"
                step="0.5"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Half days count — enter 2.5 for two and a half days.
              </p>
            </div>

            <div>
              <label htmlFor="al-hours-day" className={labelClass}>
                Hours in a working day (optional)
              </label>
              <input
                id="al-hours-day"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Used to show the entitlement in hours as well as days.
                Clear it to skip the hours figures.
              </p>
            </div>

            <div>
              <label htmlFor="al-basis" className={labelClass}>
                Leave year
              </label>
              <select
                id="al-basis"
                value={startBasis}
                onChange={(e) =>
                  setStartBasis(e.target.value as "full" | "partway")
                }
                className={inputClass}
              >
                <option value="full">
                  Employed for the whole leave year
                </option>
                <option value="partway">
                  Started part-way through the leave year
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="al-taken" className={labelClass}>
                Days of leave already taken
              </label>
              <input
                id="al-taken"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={daysTaken}
                onChange={(e) => setDaysTaken(e.target.value)}
                className={inputClass}
              />
            </div>

            {startBasis === "partway" && (
              <>
                <div>
                  <label htmlFor="al-year-start" className={labelClass}>
                    Leave year starts
                  </label>
                  <input
                    id="al-year-start"
                    type="date"
                    value={leaveYearStart}
                    onChange={(e) => setLeaveYearStart(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    The date your employer&apos;s leave year begins — it
                    is in the contract or staff handbook.
                  </p>
                </div>
                <div>
                  <label htmlFor="al-job-start" className={labelClass}>
                    First day of the job
                  </label>
                  <input
                    id="al-job-start"
                    type="date"
                    value={employmentStart}
                    onChange={(e) => setEmploymentStart(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    The month you start in counts as a whole month of
                    entitlement, even if you start part-way through it.
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div>
              <label htmlFor="al-hours-worked" className={labelClass}>
                Hours worked (in the pay period or so far)
              </label>
              <input
                id="al-hours-worked"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Leave accrues on the hours actually worked — enter one
                pay period to see what that period earned, or the total
                so far this leave year.
              </p>
            </div>

            <div>
              <label htmlFor="al-hours-taken" className={labelClass}>
                Hours of leave already taken
              </label>
              <input
                id="al-hours-taken"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={hoursTaken}
                onChange={(e) => setHoursTaken(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {cappedAtMax && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Statutory entitlement is capped at {MAX_STATUTORY_LEAVE_DAYS}{" "}
          days a year, however many days a week you work — so a{" "}
          {daysNumber}-day week still gets {MAX_STATUTORY_LEAVE_DAYS}{" "}
          days, not {fmtDays(STATUTORY_LEAVE_WEEKS * daysNumber)}.
        </p>
      )}

      {(regularOverTaken || irregularOverTaken) && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          More leave has been taken than this entitlement allows. That
          can be right — many contracts give more than the statutory
          minimum — but if the contract gives only the minimum, check
          the figures with the employer.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your annual leave entitlement
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Annual leave calculation — inputs used
          </p>
          {mode === "regular" ? (
            <p>
              Pattern: {daysNumber} days a week
              {hoursPerDayNumber > 0
                ? `, ${hoursPerDayNumber} hours a day`
                : ""}
              {" · "}
              {startBasis === "partway"
                ? `Started part-way: leave year from ${leaveYearStart}, job from ${employmentStart} (${result.twelfthsRemaining} of 12 months)`
                : "Employed for the whole leave year"}
              {" · "}Leave already taken: {daysTakenNumber} days.
            </p>
          ) : (
            <p>
              Irregular hours: {hoursWorkedNumber} hours worked · Leave
              already taken: {hoursTakenNumber} hours.
            </p>
          )}
        </div>

        {mode === "regular" ? (
          <>
            <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {result.entitlementDays !== null
                ? fmtDays(result.entitlementDays)
                : "—"}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                this leave year
              </span>
            </p>
            {result.entitlementHours !== null && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {fmtHours(result.entitlementHours)} at {hoursPerDayNumber}{" "}
                hours a day
              </p>
            )}

            <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">Full-year entitlement: </dt>
                <dd className="inline">
                  {STATUTORY_LEAVE_WEEKS} weeks × {daysNumber} days a week ={" "}
                  {result.fullYearDays !== null
                    ? fmtDays(result.fullYearDays)
                    : "—"}
                  {cappedAtMax
                    ? ` (capped at ${MAX_STATUTORY_LEAVE_DAYS} days by law)`
                    : ""}
                  .
                </dd>
              </div>
              {startBasis === "partway" && (
                <div>
                  <dt className="inline font-medium">Part-year cut: </dt>
                  <dd className="inline">
                    employed for {result.twelfthsRemaining} of the 12
                    months of the leave year, so{" "}
                    {result.fullYearDays !== null
                      ? fmtDays(result.fullYearDays)
                      : "—"}{" "}
                    × {result.twelfthsRemaining}/12 ={" "}
                    {result.entitlementDays !== null
                      ? fmtDays(result.entitlementDays)
                      : "—"}
                    , rounded up to the nearest half day.
                  </dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium">Already taken: </dt>
                <dd className="inline">{fmtDays(daysTakenNumber)}.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Left to take: </dt>
                <dd className="inline">
                  <strong>
                    {result.remainingDays !== null
                      ? result.remainingDays > 0
                        ? fmtDays(result.remainingDays)
                        : "0 days"
                      : "—"}
                  </strong>
                  {result.remainingHours !== null &&
                    result.remainingDays !== null &&
                    result.remainingDays > 0 &&
                    ` (${fmtHours(result.remainingHours)})`}
                  {result.remainingDays !== null &&
                    result.remainingDays < 0 &&
                    ` — ${fmtDays(Math.abs(result.remainingDays))} more than this entitlement (see the note above)`}
                  .
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {result.accruedHoursBooked !== null
                ? `${result.accruedHoursBooked} hours`
                : "—"}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                of leave accrued
              </span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {hoursWorkedNumber} hours worked × {IRREGULAR_ACCRUAL_PERCENT}
              % ={" "}
              {result.accruedHoursExact !== null
                ? fmtHours(result.accruedHoursExact)
                : "—"}{" "}
              exactly
            </p>

            <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">How it is worked out: </dt>
                <dd className="inline">
                  for leave years beginning on or after 1 April 2024,
                  irregular-hours and part-year workers build up leave at{" "}
                  {IRREGULAR_ACCRUAL_PERCENT}% of the hours they work.
                  Accrued leave is rounded to the nearest whole hour,
                  halves up — the way GOV.UK works it out.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Already taken: </dt>
                <dd className="inline">{fmtHours(hoursTakenNumber)}.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Left to take: </dt>
                <dd className="inline">
                  <strong>
                    {result.remainingHoursBooked !== null
                      ? result.remainingHoursBooked > 0
                        ? fmtHours(result.remainingHoursBooked)
                        : "0 hours"
                      : "—"}
                  </strong>
                  {result.remainingHoursBooked !== null &&
                    result.remainingHoursBooked < 0 &&
                    ` — ${fmtHours(Math.abs(result.remainingHoursBooked))} more than has accrued (see the note above)`}
                  .
                </dd>
              </div>
            </dl>
          </>
        )}

        <PrintButton />
      </div>
      <StickyResultBar label="Annual leave" value={stickyValue} />
    </div>
  );
}
