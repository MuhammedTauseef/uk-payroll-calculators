"use client";

import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateProRata, STATUTORY_HOLIDAY_WEEKS } from "@/lib/prorata";
import type { ProRataMode } from "@/lib/prorata";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700";

export default function ProRataCalculator() {
  const [salary, setSalary] = useState("40000");
  const [mode, setMode] = useState<ProRataMode>("hours");
  const [fullTimeHours, setFullTimeHours] = useState("37.5");
  const [partTimeHours, setPartTimeHours] = useState("22.5");
  const [fullTimeDays, setFullTimeDays] = useState("5");
  const [partTimeDays, setPartTimeDays] = useState("3");

  const salaryNumber = parseAmount(salary);
  const ftHoursNumber = parseAmount(fullTimeHours);
  const ptHoursNumber = parseAmount(partTimeHours);
  const ftDaysNumber = parseAmount(fullTimeDays);
  const ptDaysNumber = parseAmount(partTimeDays);

  const result = useMemo(
    () =>
      calculateProRata({
        fullTimeAnnualSalary: salaryNumber,
        mode,
        fullTimeHoursPerWeek: ftHoursNumber,
        partTimeHoursPerWeek: ptHoursNumber,
        fullTimeDaysPerWeek: ftDaysNumber,
        partTimeDaysPerWeek: ptDaysNumber,
      }),
    [salaryNumber, mode, ftHoursNumber, ptHoursNumber, ftDaysNumber, ptDaysNumber],
  );

  const overFullTime =
    mode === "hours"
      ? ftHoursNumber > 0 && ptHoursNumber > ftHoursNumber
      : ftDaysNumber > 0 && ptDaysNumber > ftDaysNumber;

  const ftePercent = Math.round(result.fteFraction * 1000) / 10;

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ft-salary" className={labelClass}>
            Full-time annual salary (£)
          </label>
          <input
            id="ft-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            What the job pays at 100% — the full-time equivalent salary.
          </p>
        </div>

        <div>
          <label htmlFor="mode" className={labelClass}>
            Work out the fraction by
          </label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ProRataMode)}
            className={inputClass}
          >
            <option value="hours">Hours per week</option>
            <option value="days">Days per week</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Use whichever your contract states — the fraction is the same
            either way for a standard working pattern.
          </p>
        </div>

        <div>
          <label htmlFor="ft-hours" className={labelClass}>
            Full-time hours per week
          </label>
          <input
            id="ft-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={fullTimeHours}
            onChange={(e) => setFullTimeHours(e.target.value)}
            className={inputClass}
            disabled={mode === "days"}
          />
        </div>

        <div>
          <label htmlFor="pt-hours" className={labelClass}>
            Part-time hours per week
          </label>
          <input
            id="pt-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={partTimeHours}
            onChange={(e) => setPartTimeHours(e.target.value)}
            className={inputClass}
            disabled={mode === "days"}
          />
        </div>

        <div>
          <label htmlFor="ft-days" className={labelClass}>
            Full-time days per week
          </label>
          <input
            id="ft-days"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={fullTimeDays}
            onChange={(e) => setFullTimeDays(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Needed for the holiday figure, whichever mode you pick.
          </p>
        </div>

        <div>
          <label htmlFor="pt-days" className={labelClass}>
            Part-time days per week
          </label>
          <input
            id="pt-days"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={partTimeDays}
            onChange={(e) => setPartTimeDays(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {overFullTime && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 print:hidden">
          The part-time amount is more than the full-time amount, so the
          fraction is capped at 1.0 FTE (100%). Hours beyond the full-time
          pattern are normally overtime, not pro-rata pay.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Your pro-rata pay
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 print:block">
          <p className="font-semibold text-slate-900">
            Pro-rata salary calculation — inputs used
          </p>
          <p>
            Full-time annual salary: {gbp.format(salaryNumber)} · Fraction
            worked out by:{" "}
            {mode === "hours"
              ? `hours per week (${ptHoursNumber} of ${ftHoursNumber} hours)`
              : `days per week (${ptDaysNumber} of ${ftDaysNumber} days)`}{" "}
            · Working pattern for holiday: {ptDaysNumber} of {ftDaysNumber}{" "}
            days a week.
          </p>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800">
          {gbp.format(result.annualSalary)}
          <span className="text-base font-medium text-slate-600">
            {" "}
            per year
          </span>
        </p>
        <p className="text-sm text-slate-600">
          {result.fteFraction} FTE — {ftePercent}% of the full-time salary
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <dt className="inline font-medium">Monthly pay: </dt>
            <dd className="inline">
              {gbp.format(result.monthlySalary)} (annual salary ÷ 12).
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Weekly pay: </dt>
            <dd className="inline">
              {gbp.format(result.weeklySalary)} (annual salary ÷ 52).
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">How it is worked out: </dt>
            <dd className="inline">
              {gbp.format(salaryNumber)} × (
              {mode === "hours"
                ? `${ptHoursNumber} ÷ ${ftHoursNumber} hours`
                : `${ptDaysNumber} ÷ ${ftDaysNumber} days`}
              ) = {gbp.format(salaryNumber)} × {result.fteFraction} ={" "}
              {gbp.format(result.annualSalary)}.
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Holiday entitlement (separate from pay)
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            <strong>{result.holidayDaysPerYear} days a year</strong> of paid
            holiday — the statutory minimum of {STATUTORY_HOLIDAY_WEEKS}{" "}
            weeks, expressed in this working pattern:{" "}
            {STATUTORY_HOLIDAY_WEEKS} × {result.holidayBasisDaysPerWeek} days
            a week = {result.holidayDaysPerYear} days. Bank holidays are
            usually counted inside this total.
          </p>
        </div>

        <div className="print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 rounded-full border border-brand-700 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50"
          >
            Print / save this result
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Opens your browser&apos;s print view with a clean summary of
            this calculation — choose &ldquo;Save as PDF&rdquo; there to
            keep a copy.
          </p>
        </div>
      </div>
      <StickyResultBar
        label="Pro-rata pay"
        value={`${gbp.format(result.annualSalary)} per year`}
      />
    </div>
  );
}
