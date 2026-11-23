"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateMaternity,
  spreadMonthlyAmount,
  type MaternityScheme,
} from "@/lib/maternity";
import { MATERNITY, SMP } from "@/lib/rates";

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

export default function MaternityCalculator() {
  const [salary, setSalary] = useState("31200");
  const [scheme, setScheme] = useState<MaternityScheme>("nhs");
  const [spread, setSpread] = useState<"staged" | "9" | "12">("staged");

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () => calculateMaternity({ annualSalary: salaryNumber, scheme }),
    [salaryNumber, scheme],
  );

  // Spreading applies to NHS occupational pay (Agenda for Change, by prior
  // agreement with the employer) — it is not an option on SMP alone.
  const spreadActive = scheme === "nhs" && spread !== "staged";
  const spreadMonths = spreadActive ? Number(spread) : 0;
  const spreadMonthly = spreadActive
    ? spreadMonthlyAmount(result.totalPay, spreadMonths)
    : 0;

  const schemeLabel =
    scheme === "nhs" ? "NHS occupational maternity pay" : "Statutory Maternity Pay only";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="mat-salary" className={labelClass}>
            Annual salary (£)
          </label>
          <input
            id="mat-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gross pay for a full year. Weekly pay is worked out as salary
            divided by 52.
          </p>
        </div>

        <div>
          <label htmlFor="mat-scheme" className={labelClass}>
            Maternity pay scheme
          </label>
          <select
            id="mat-scheme"
            value={scheme}
            onChange={(e) => setScheme(e.target.value as MaternityScheme)}
            className={inputClass}
          >
            <option value="nhs">
              NHS occupational pay (Agenda for Change)
            </option>
            <option value="smp">Statutory Maternity Pay only</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Choose NHS if you qualify for occupational maternity pay;
            otherwise choose the statutory scheme every employer pays.
          </p>
        </div>

        {scheme === "nhs" && (
          <div>
            <label htmlFor="mat-spread" className={labelClass}>
              Spread the pay evenly?
            </label>
            <select
              id="mat-spread"
              value={spread}
              onChange={(e) => setSpread(e.target.value as "staged" | "9" | "12")}
              className={inputClass}
            >
              <option value="staged">No — pay stage by stage (standard)</option>
              <option value="9">Yes — equal amounts over 9 months</option>
              <option value="12">Yes — equal amounts over 12 months</option>
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Agenda for Change lets you agree with your employer to spread
              occupational pay evenly instead of in stages. The total you
              receive is exactly the same.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Maternity pay calculation — inputs used
          </p>
          <p>
            Annual salary: {gbp.format(salaryNumber)} · Scheme: {schemeLabel}
            .
          </p>
          {spreadActive && (
            <p>
              Pay spread: equal monthly amounts over {spreadMonths} months (
              {gbp.format(spreadMonthly)} a month).
            </p>
          )}
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.totalPay)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Total maternity pay over the full leave ({schemeLabel})
        </p>

        {spreadActive && (
          <div className="mt-4 rounded-lg border border-brand-200 dark:border-brand-800 bg-white/70 dark:bg-slate-900/40 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Spread evenly over {spreadMonths} months
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {gbp.format(spreadMonthly)}{" "}
              <span className="text-sm font-medium">a month</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The same {gbp.format(result.totalPay)} total, paid in equal
              monthly amounts instead of stage by stage (figures rounded to
              the nearest penny). Spreading is not automatic — it has to be
              agreed with your employer in advance, so ask payroll before
              your leave starts.
            </p>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-brand-900">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Stage
                </th>
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Per week
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {result.stages.map((s) => (
                <tr key={s.label}>
                  <td className="py-2 pr-3">
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {s.label}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {s.basis}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{gbp.format(s.weeklyAmount)}</td>
                  <td className="py-2">{gbp.format(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Paid weeks: </dt>
            <dd className="inline">
              {result.paidWeeks} of {MATERNITY.leaveWeeks} weeks of leave are
              paid; the rest is unpaid.
            </dd>
          </div>
          {!spreadActive && (
            <div>
              <dt className="inline font-medium">Averaged over the year: </dt>
              <dd className="inline">
                {gbp.format(result.averageMonthlyAcrossLeave)} a month across
                the full 52 weeks of leave.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">Weekly pay used: </dt>
            <dd className="inline">
              {gbp.format(result.averageWeeklyEarnings)} a week. The SMP
              flat stage pays {gbp.format(result.statutoryWeekly)} a week —
              the lower of {gbp.format(SMP.weeklyRate)} and 90% of weekly
              pay.
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          This is an estimate. The exact SMP amounts are worked out from
          average weekly earnings in a specific eight-week period before
          the qualifying week, so the figures from payroll can differ
          slightly.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Total maternity pay"
        value={gbp.format(result.totalPay)}
      />
    </div>
  );
}
