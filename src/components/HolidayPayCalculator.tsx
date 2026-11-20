"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useRef, useState } from "react";
import {
  calculateHolidayPay,
  type HolidayPayMode,
} from "@/lib/holidaypay";
import { IRREGULAR_ACCRUAL_PERCENT } from "@/lib/annualleave";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function HolidayPayCalculator() {
  const [mode, setMode] = useState<HolidayPayMode>("regular");
  const [weeklyPay, setWeeklyPay] = useState("600");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [daysOfHoliday, setDaysOfHoliday] = useState("10");
  const [hoursWorked, setHoursWorked] = useState("120");
  const [hourlyRate, setHourlyRate] = useState("12.50");
  const [payForPeriod, setPayForPeriod] = useState("1000");
  const [weeksIntoYear, setWeeksIntoYear] = useState("26");
  const [leaveTakenWeeks, setLeaveTakenWeeks] = useState("1");

  const resultRef = useRef<HTMLDivElement>(null);
  const reset = () => {
    setMode("regular");
    setWeeklyPay("600");
    setDaysPerWeek("5");
    setDaysOfHoliday("10");
    setHoursWorked("120");
    setHourlyRate("12.50");
    setPayForPeriod("1000");
    setWeeksIntoYear("26");
    setLeaveTakenWeeks("1");
  };

  const result = useMemo(
    () =>
      calculateHolidayPay({
        mode,
        weeklyPay: parseAmount(weeklyPay),
        daysPerWeek: parseAmount(daysPerWeek),
        daysOfHoliday: parseAmount(daysOfHoliday),
        hoursWorked: parseAmount(hoursWorked),
        hourlyRate: parseAmount(hourlyRate),
        payForPeriod: parseAmount(payForPeriod),
        entitlementWeeks: 5.6,
        proportionOfYearWorked: Math.min(
          1,
          Math.max(0, parseAmount(weeksIntoYear) / 52),
        ),
        leaveTakenWeeks: parseAmount(leaveTakenWeeks),
      }),
    [
      mode,
      weeklyPay,
      daysPerWeek,
      daysOfHoliday,
      hoursWorked,
      hourlyRate,
      payForPeriod,
      weeksIntoYear,
      leaveTakenWeeks,
    ],
  );

  const headline =
    mode === "regular"
      ? result.payForDays
      : mode === "irregular"
        ? result.accruedPayValue
        : mode === "rolledup"
          ? result.rolledUpAmount
          : result.paymentInLieu;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="print:hidden">
        <label htmlFor="hp-mode" className={labelClass}>
          What do you want to work out?
        </label>
        <select
          id="hp-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as HolidayPayMode)}
          className={inputClass}
        >
          <option value="regular">
            Pay for holiday I am taking (regular hours)
          </option>
          <option value="irregular">
            Holiday built up on irregular hours (12.07% accrual)
          </option>
          <option value="rolledup">
            Rolled-up holiday pay for a pay period
          </option>
          <option value="leaving">
            Holiday pay owed when leaving a job
          </option>
        </select>
      </div>

      <div className="mt-4 grid gap-4 print:hidden sm:grid-cols-2">
        {mode === "regular" && (
          <>
            <div>
              <label htmlFor="hp-weekly" className={labelClass}>
                Gross weekly pay (£)
              </label>
              <input
                id="hp-weekly"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={weeklyPay}
                onChange={(e) => setWeeklyPay(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                For a salary, divide the annual amount by 52. If your
                pay varies, use your average over the last 52 weeks you
                were paid.
              </p>
            </div>
            <div>
              <label htmlFor="hp-days-week" className={labelClass}>
                Days worked per week
              </label>
              <input
                id="hp-days-week"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hp-days" className={labelClass}>
                Days of holiday to price
              </label>
              <input
                id="hp-days"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={daysOfHoliday}
                onChange={(e) => setDaysOfHoliday(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        {mode === "irregular" && (
          <>
            <div>
              <label htmlFor="hp-hours" className={labelClass}>
                Hours worked in the pay period
              </label>
              <input
                id="hp-hours"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Holiday builds up at {IRREGULAR_ACCRUAL_PERCENT}% of the
                hours you work, for leave years starting on or after
                1 April 2024.
              </p>
            </div>
            <div>
              <label htmlFor="hp-rate" className={labelClass}>
                Average hourly pay (£)
              </label>
              <input
                id="hp-rate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your average over the last 52 weeks you were paid —
                the rate holiday is paid at when you take it.
              </p>
            </div>
          </>
        )}

        {mode === "rolledup" && (
          <div>
            <label htmlFor="hp-period-pay" className={labelClass}>
              Pay for the work done in this pay period (£)
            </label>
            <input
              id="hp-period-pay"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={payForPeriod}
              onChange={(e) => setPayForPeriod(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Rolled-up holiday pay is at least {IRREGULAR_ACCRUAL_PERCENT}%
              on top of this amount, paid with it and shown as a
              separate item on the payslip.
            </p>
          </div>
        )}

        {mode === "leaving" && (
          <>
            <div>
              <label htmlFor="hp-weekly-leave" className={labelClass}>
                Gross weekly pay (£)
              </label>
              <input
                id="hp-weekly-leave"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={weeklyPay}
                onChange={(e) => setWeeklyPay(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hp-weeks-into" className={labelClass}>
                Weeks of the leave year worked when you leave
              </label>
              <input
                id="hp-weeks-into"
                type="number"
                inputMode="decimal"
                min="0"
                max="52"
                step="1"
                value={weeksIntoYear}
                onChange={(e) => setWeeksIntoYear(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Count from the start of your leave year to your last
                day. 26 weeks is exactly half the year.
              </p>
            </div>
            <div>
              <label htmlFor="hp-taken" className={labelClass}>
                Holiday already taken this leave year (weeks)
              </label>
              <input
                id="hp-taken"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.2"
                value={leaveTakenWeeks}
                onChange={(e) => setLeaveTakenWeeks(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                In weeks of your own pattern — 5 days is 1 week on a
                five-day week. This uses the statutory 5.6-week
                entitlement; if your contract gives more, the same
                method applies to the extra days by agreement.
              </p>
            </div>
          </>
        )}
      </div>

      <div
        ref={resultRef}
        className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {headline !== null ? gbp.format(headline) : "—"}
        </p>

        {mode === "regular" && (
          <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              Pay for {parseAmount(daysOfHoliday)} days of holiday at a
              daily rate of {gbp.format(result.dailyRate ?? 0)} — your
              weekly pay of {gbp.format(parseAmount(weeklyPay))} divided
              by {parseAmount(daysPerWeek)} working days.
            </p>
            <p>
              Your full statutory year of 5.6 weeks is worth{" "}
              {gbp.format(result.fullYearValue ?? 0)} in total at this
              rate of pay.
            </p>
          </div>
        )}

        {mode === "irregular" && (
          <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              {parseAmount(hoursWorked)} hours worked builds up{" "}
              {result.accruedHoursExact} hours of holiday (
              {IRREGULAR_ACCRUAL_PERCENT}% of hours worked) —{" "}
              {result.accruedHoursBooked} whole hours you can book,
              because accrued leave rounds to the nearest hour.
            </p>
            <p>
              Paid at your average hourly rate of{" "}
              {gbp.format(parseAmount(hourlyRate))}, that holiday is
              worth {gbp.format(result.accruedPayValue ?? 0)} when you
              take it.
            </p>
          </div>
        )}

        {mode === "rolledup" && (
          <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              Rolled-up holiday pay on{" "}
              {gbp.format(parseAmount(payForPeriod))} of pay is{" "}
              {gbp.format(result.rolledUpAmount ?? 0)} (
              {IRREGULAR_ACCRUAL_PERCENT}%), so the pay packet for the
              period is {gbp.format(result.rolledUpTotal ?? 0)} in
              total.
            </p>
            <p>
              The holiday part must be shown as its own separate item
              on the payslip. Rolled-up pay is only lawful for
              irregular-hours and part-year workers — everyone else
              must be paid when they take the holiday.
            </p>
          </div>
        )}

        {mode === "leaving" && (
          <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {(result.weeksOwed ?? 0) >= 0 ? (
              <p>
                The statutory formula (A × B) − C: 5.6 weeks ×{" "}
                {Math.round(
                  Math.min(1, Math.max(0, parseAmount(weeksIntoYear) / 52)) *
                    100,
                )}
                % of the year worked ={" "}
                {(5.6 * Math.min(1, Math.max(0, parseAmount(weeksIntoYear) / 52))).toFixed(2)}{" "}
                weeks built up, minus {parseAmount(leaveTakenWeeks)}{" "}
                weeks taken, leaves {result.weeksOwed} weeks owed —{" "}
                {gbp.format(result.paymentInLieu ?? 0)} at{" "}
                {gbp.format(parseAmount(weeklyPay))} a week, payable
                with your final pay.
              </p>
            ) : (
              <p>
                You have taken {Math.abs(result.weeksOwed ?? 0)} weeks
                more holiday than you had built up by your leaving date
                ({gbp.format(Math.abs(result.paymentInLieu ?? 0))} at
                your weekly pay). Your employer can only take this back
                from your final pay if your contract or a written
                agreement allows it — it is not automatic.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mode === "regular" && (
                <>
                  <tr>
                    <td className="px-4 py-2 font-medium">Daily rate of holiday pay</td>
                    <td className="px-4 py-2">{gbp.format(result.dailyRate ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Days of holiday priced</td>
                    <td className="px-4 py-2">{parseAmount(daysOfHoliday)} days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Pay for those days</td>
                    <td className="px-4 py-2">{gbp.format(result.payForDays ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Value of the full 5.6-week year</td>
                    <td className="px-4 py-2">{gbp.format(result.fullYearValue ?? 0)}</td>
                  </tr>
                </>
              )}
              {mode === "irregular" && (
                <>
                  <tr>
                    <td className="px-4 py-2 font-medium">Hours worked</td>
                    <td className="px-4 py-2">{parseAmount(hoursWorked)} hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Accrual rate</td>
                    <td className="px-4 py-2">{IRREGULAR_ACCRUAL_PERCENT}% of hours worked</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Holiday built up (exact)</td>
                    <td className="px-4 py-2">{result.accruedHoursExact} hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Whole hours you can book</td>
                    <td className="px-4 py-2">{result.accruedHoursBooked} hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Value when you take it</td>
                    <td className="px-4 py-2">
                      {gbp.format(result.accruedPayValue ?? 0)} at {gbp.format(parseAmount(hourlyRate))} an hour
                    </td>
                  </tr>
                </>
              )}
              {mode === "rolledup" && (
                <>
                  <tr>
                    <td className="px-4 py-2 font-medium">Pay for the work done</td>
                    <td className="px-4 py-2">{gbp.format(parseAmount(payForPeriod))}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Rolled-up uplift ({IRREGULAR_ACCRUAL_PERCENT}%)</td>
                    <td className="px-4 py-2">{gbp.format(result.rolledUpAmount ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Total pay for the period</td>
                    <td className="px-4 py-2">{gbp.format(result.rolledUpTotal ?? 0)}</td>
                  </tr>
                </>
              )}
              {mode === "leaving" && (
                <>
                  <tr>
                    <td className="px-4 py-2 font-medium">A — full-year entitlement</td>
                    <td className="px-4 py-2">5.6 weeks</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">B — proportion of the year worked</td>
                    <td className="px-4 py-2">
                      {Math.round(
                        Math.min(1, Math.max(0, parseAmount(weeksIntoYear) / 52)) * 100,
                      )}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Built up (A × B)</td>
                    <td className="px-4 py-2">
                      {(
                        5.6 *
                        Math.min(1, Math.max(0, parseAmount(weeksIntoYear) / 52))
                      ).toFixed(2)}{" "}
                      weeks
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">C — holiday already taken</td>
                    <td className="px-4 py-2">{parseAmount(leaveTakenWeeks)} weeks</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Owed ((A × B) − C)</td>
                    <td className="px-4 py-2">
                      {result.weeksOwed} weeks = {gbp.format(result.paymentInLieu ?? 0)} at{" "}
                      {gbp.format(parseAmount(weeklyPay))} a week
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <ResultActions
          targetRef={resultRef}
          fileName="payrollcalc-holiday-pay-result.png"
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label={
          mode === "regular"
            ? "Pay for the holiday entered"
            : mode === "irregular"
              ? "Value of holiday built up"
              : mode === "rolledup"
                ? "Rolled-up holiday pay"
                : "Payment in lieu owed"
        }
        value={headline !== null ? gbp.format(headline) : "—"}
      />
    </div>
  );
}
