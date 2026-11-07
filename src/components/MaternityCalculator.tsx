"use client";

import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateMaternity, type MaternityScheme } from "@/lib/maternity";
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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700";

export default function MaternityCalculator() {
  const [salary, setSalary] = useState("31200");
  const [scheme, setScheme] = useState<MaternityScheme>("nhs");

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () => calculateMaternity({ annualSalary: salaryNumber, scheme }),
    [salaryNumber, scheme],
  );

  const schemeLabel =
    scheme === "nhs" ? "NHS occupational maternity pay" : "Statutory Maternity Pay only";

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none">
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
          <p className="mt-1 text-xs text-slate-500">
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
          <p className="mt-1 text-xs text-slate-500">
            Choose NHS if you qualify for occupational maternity pay;
            otherwise choose the statutory scheme every employer pays.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Your result
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 print:block">
          <p className="font-semibold text-slate-900">
            Maternity pay calculation — inputs used
          </p>
          <p>
            Annual salary: {gbp.format(salaryNumber)} · Scheme: {schemeLabel}
            .
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800">
          {gbp.format(result.totalPay)}
        </p>
        <p className="text-sm text-slate-600">
          Total maternity pay over the full leave ({schemeLabel})
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100">
                <th className="py-2 pr-3 font-semibold text-slate-700">
                  Stage
                </th>
                <th className="py-2 pr-3 font-semibold text-slate-700">
                  Per week
                </th>
                <th className="py-2 font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {result.stages.map((s) => (
                <tr key={s.label}>
                  <td className="py-2 pr-3">
                    <span className="font-medium text-slate-900">
                      {s.label}
                    </span>
                    <span className="block text-xs text-slate-500">
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

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <dt className="inline font-medium">Paid weeks: </dt>
            <dd className="inline">
              {result.paidWeeks} of {MATERNITY.leaveWeeks} weeks of leave are
              paid; the rest is unpaid.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Averaged over the year: </dt>
            <dd className="inline">
              {gbp.format(result.averageMonthlyAcrossLeave)} a month across
              the full 52 weeks of leave.
            </dd>
          </div>
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

        <p className="mt-3 text-sm text-slate-600">
          This is an estimate. The exact SMP amounts are worked out from
          average weekly earnings in a specific eight-week period before
          the qualifying week, so the figures from payroll can differ
          slightly.
        </p>

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
        label="Total maternity pay"
        value={gbp.format(result.totalPay)}
      />
    </div>
  );
}
