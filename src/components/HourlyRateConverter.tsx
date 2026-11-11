"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { convertHourlyRate } from "@/lib/hourly";
import type { ConversionDirection } from "@/lib/hourly";
import { NMW_BANDS } from "@/lib/overtime";
import type { NmwAgeBand } from "@/lib/overtime";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * An hourly rate for display: rounded to at most 4 decimal places
 * with trailing zeros trimmed (£15.38, £15.3846) — the same display
 * rule as the overtime calculator.
 */
function fmtRate(n: number): string {
  const r = Math.round((n + Number.EPSILON) * 10000) / 10000;
  return `£${r.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function fmtHours(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, "")} hours`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function HourlyRateConverter() {
  const [direction, setDirection] =
    useState<ConversionDirection>("hourlyToSalary");

  const [hourlyRate, setHourlyRate] = useState("15");
  const [annualSalary, setAnnualSalary] = useState("30000");
  const [hoursPerWeek, setHoursPerWeek] = useState("37.5");
  const [ageBand, setAgeBand] = useState<NmwAgeBand>("over21");

  const hourlyRateNumber = parseAmount(hourlyRate);
  const salaryNumber = parseAmount(annualSalary);
  const hoursNumber = parseAmount(hoursPerWeek);

  const result = useMemo(
    () =>
      convertHourlyRate({
        direction,
        hourlyRate: hourlyRateNumber,
        annualSalary: salaryNumber,
        hoursPerWeek: hoursNumber,
        ageBand,
      }),
    [direction, hourlyRateNumber, salaryNumber, hoursNumber, ageBand],
  );

  const bandLabel =
    NMW_BANDS.find((b) => b.id === ageBand)?.label ?? "21 and over";
  const noRate = result.hourlyRate <= 0;
  const nmwFailed = result.nmwPass === false;

  const stickyValue =
    direction === "hourlyToSalary"
      ? `${fmtMoney(result.annualSalary)} a year`
      : `${fmtRate(result.hourlyRate)} an hour`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="hr-direction" className={labelClass}>
            What are you converting?
          </label>
          <select
            id="hr-direction"
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as ConversionDirection)
            }
            className={inputClass}
          >
            <option value="hourlyToSalary">
              An hourly rate — into a salary
            </option>
            <option value="salaryToHourly">
              A salary — into an hourly rate
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Both directions run on the same figures: a year is 52
            weeks, and every amount is gross pay, before tax.
          </p>
        </div>

        {direction === "hourlyToSalary" ? (
          <div>
            <label htmlFor="hr-rate" className={labelClass}>
              Hourly rate (£)
            </label>
            <input
              id="hr-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="hr-salary" className={labelClass}>
              Annual salary (£)
            </label>
            <input
              id="hr-salary"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="hr-hours" className={labelClass}>
            Hours per week
          </label>
          <input
            id="hr-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The hours the pay covers — 37.5 and 40 are the common
            full-time weeks. The same salary is a lower hourly rate
            over more hours.
          </p>
        </div>

        <div>
          <label htmlFor="hr-band" className={labelClass}>
            Age band (for the minimum wage comparison)
          </label>
          <select
            id="hr-band"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as NmwAgeBand)}
            className={inputClass}
          >
            {NMW_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} — {fmtMoney(b.rate)} an hour
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noRate && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter{" "}
          {direction === "hourlyToSalary"
            ? "an hourly rate"
            : "a salary"}{" "}
          and the hours per week to see the conversion.
        </p>
      )}

      {nmwFailed && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          On these figures the hourly rate works out below the
          National Minimum Wage for this age band. Pay for the total
          hours worked must not average below the minimum — if this
          matches a real job or payslip, it is worth raising with the
          employer or Acas.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          {direction === "hourlyToSalary"
            ? "Your salary, gross"
            : "Your hourly rate, gross"}
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Hourly rate conversion — inputs used
          </p>
          <p>
            {direction === "hourlyToSalary"
              ? `Hourly rate: ${fmtRate(hourlyRateNumber)}`
              : `Salary: ${fmtMoney(salaryNumber)} a year`}
            {" · "}Hours per week: {hoursNumber}
            {" · "}Minimum wage band: {bandLabel} ({fmtMoney(result.nmwRate)}{" "}
            an hour). All figures gross, before tax.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {direction === "hourlyToSalary" ? (
            <>
              {fmtMoney(result.annualSalary)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                a year, before tax
              </span>
            </>
          ) : (
            <>
              {fmtRate(result.hourlyRate)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                an hour, before tax
              </span>
            </>
          )}
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Hourly rate: </dt>
            <dd className="inline">
              {direction === "hourlyToSalary" ? (
                <>{fmtRate(result.hourlyRate)} an hour.</>
              ) : (
                <>
                  {fmtMoney(salaryNumber)} a year ÷ 52 weeks ÷{" "}
                  {hoursNumber} hours = {fmtRate(result.hourlyRate)} an
                  hour.
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Weekly pay: </dt>
            <dd className="inline">
              {direction === "hourlyToSalary" ? (
                <>
                  {fmtRate(result.hourlyRate)} × {fmtHours(hoursNumber)}{" "}
                  = <strong>{fmtMoney(result.weeklyPay)}</strong>.
                </>
              ) : (
                <>
                  {fmtMoney(result.annualSalary)} ÷ 52 ={" "}
                  <strong>{fmtMoney(result.weeklyPay)}</strong>.
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Monthly pay: </dt>
            <dd className="inline">
              {fmtMoney(result.annualSalary)} ÷ 12 ={" "}
              <strong>{fmtMoney(result.monthlyPay)}</strong>.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Annual salary: </dt>
            <dd className="inline">
              {direction === "hourlyToSalary" ? (
                <>
                  {fmtRate(result.hourlyRate)} × {fmtHours(hoursNumber)}{" "}
                  × 52 weeks ={" "}
                  <strong>{fmtMoney(result.annualSalary)}</strong>.
                </>
              ) : (
                <>
                  <strong>{fmtMoney(result.annualSalary)}</strong> a
                  year.
                </>
              )}
            </dd>
          </div>
          {result.nmwPass !== null && (
            <div>
              <dt className="inline font-medium">
                Minimum wage comparison:{" "}
              </dt>
              <dd className="inline">
                {result.nmwPass ? (
                  <>
                    <strong>Above the floor.</strong>{" "}
                    {fmtRate(result.hourlyRate)} an hour is{" "}
                    {fmtMoney(result.nmwDifferencePerHour)} an hour
                    above the {fmtMoney(result.nmwRate)} minimum for{" "}
                    {bandLabel.toLowerCase()} — a minimum that itself
                    works out to {fmtMoney(result.nmwAnnualEquivalent)}{" "}
                    a year at {fmtHours(hoursNumber)} a week.
                  </>
                ) : (
                  <>
                    <strong>Below the floor.</strong>{" "}
                    {fmtRate(result.hourlyRate)} an hour is{" "}
                    {fmtMoney(Math.abs(result.nmwDifferencePerHour))}{" "}
                    an hour below the {fmtMoney(result.nmwRate)}{" "}
                    minimum for {bandLabel.toLowerCase()}, which works
                    out to {fmtMoney(result.nmwAnnualEquivalent)} a
                    year at {fmtHours(hoursNumber)} a week.
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>

        <PrintButton />
      </div>
      <StickyResultBar
        label={
          direction === "hourlyToSalary" ? "Annual salary" : "Hourly rate"
        }
        value={stickyValue}
      />
    </div>
  );
}
