"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  AFC_BANDS,
  calculateNhsPay,
  nhsPensionRateFor,
  NHS_FULL_TIME_HOURS,
} from "@/lib/nhs-pay";

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

export default function NhsPayCalculator() {
  const [bandIndex, setBandIndex] = useState(3); // Band 5
  const [stepIndex, setStepIndex] = useState(0); // Entry
  const [hours, setHours] = useState("37.5");
  const [pensionEdited, setPensionEdited] = useState<string | null>(null);

  const band = AFC_BANDS[bandIndex];
  const hoursNumber = parseAmount(hours);

  // The pension tier follows the (pro-rata) pensionable pay; the field
  // shows that tier until the user types their own rate.
  const tierRate = useMemo(() => {
    const step = band.steps[Math.min(stepIndex, band.steps.length - 1)];
    const gross = step.annual * (hoursNumber / NHS_FULL_TIME_HOURS || 0);
    return nhsPensionRateFor(gross);
  }, [band, stepIndex, hoursNumber]);
  const pensionValue = pensionEdited ?? String(tierRate);
  const pensionRate = parseAmount(pensionValue);

  const result = useMemo(
    () =>
      calculateNhsPay({
        bandIndex,
        stepIndex: Math.min(stepIndex, band.steps.length - 1),
        hoursPerWeek: hoursNumber,
        pensionRatePercent: pensionRate,
      }),
    [bandIndex, stepIndex, band, hoursNumber, pensionRate],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="nhs-band" className={labelClass}>
            Agenda for Change band
          </label>
          <select
            id="nhs-band"
            value={bandIndex}
            onChange={(e) => {
              setBandIndex(Number(e.target.value));
              setStepIndex(0);
              setPensionEdited(null);
            }}
            className={inputClass}
          >
            {AFC_BANDS.map((b, i) => (
              <option key={b.band} value={i}>
                {b.band}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {band.roles}.
          </p>
        </div>

        <div>
          <label htmlFor="nhs-step" className={labelClass}>
            Pay step point
          </label>
          <select
            id="nhs-step"
            value={Math.min(stepIndex, band.steps.length - 1)}
            onChange={(e) => {
              setStepIndex(Number(e.target.value));
              setPensionEdited(null);
            }}
            className={inputClass}
          >
            {band.steps.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label} — {gbp.format(s.annual)} ({s.yearsLabel})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You move up a step after the years shown, subject to the pay
            progression rules.
          </p>
        </div>

        <div>
          <label htmlFor="nhs-hours" className={labelClass}>
            Hours per week
          </label>
          <input
            id="nhs-hours"
            type="number"
            inputMode="decimal"
            min="0"
            max="80"
            step="0.5"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setPensionEdited(null);
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Full time is 37.5 hours. Fewer hours pro-rata the salary — the
            hourly rate stays the same.
          </p>
        </div>

        <div>
          <label htmlFor="nhs-pension" className={labelClass}>
            NHS pension contribution (%)
          </label>
          <input
            id="nhs-pension"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={pensionValue}
            onChange={(e) => setPensionEdited(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Set automatically from the 2025/26 contribution tiers for
            your pay — change it if yours differs.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            NHS pay calculation — inputs used
          </p>
          <p>
            {result.band}, {result.stepLabel.toLowerCase()} step ·{" "}
            {hoursNumber} hours a week · pension {pensionRate}%.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.grossAnnual)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Gross pay a year — {result.band}, {result.stepLabel.toLowerCase()}{" "}
          step, {hoursNumber} hours a week (full-time rate{" "}
          {gbp.format(result.fullTimeAnnual)}, {gbp.format(result.hourlyRate)}{" "}
          an hour)
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-brand-900">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Pay
                </th>
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Gross
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home (est.)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per year
                </td>
                <td className="py-2 pr-3">{gbp.format(result.grossAnnual)}</td>
                <td className="py-2">{gbp.format(result.netAnnual)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per month
                </td>
                <td className="py-2 pr-3">{gbp.format(result.grossMonthly)}</td>
                <td className="py-2">{gbp.format(result.netMonthly)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per week
                </td>
                <td className="py-2 pr-3">{gbp.format(result.grossWeekly)}</td>
                <td className="py-2">{gbp.format(result.netWeekly)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Pension: </dt>
            <dd className="inline">
              {gbp.format(result.pensionAnnual)} a year (
              {gbp.format(result.pensionMonthly)} a month) at {pensionRate}%
              of pensionable pay.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Income Tax: </dt>
            <dd className="inline">
              {gbp.format(result.incomeTax)} a year, worked out on pay
              after pension contributions.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">National Insurance: </dt>
            <dd className="inline">
              {gbp.format(result.employeeNationalInsurance)} a year.
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          This is an estimate: it uses basic England pay without the
          London High Cost Area Supplement, unsocial-hours enhancements
          or overtime, and the standard tax code with no student loan.
          Your payslip can differ.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Estimated take-home per month"
        value={gbp.format(result.netMonthly)}
      />
    </div>
  );
}
