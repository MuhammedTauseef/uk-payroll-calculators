"use client";

import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculatePaternity } from "@/lib/paternity";
import { SPP } from "@/lib/rates";

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

export default function PaternityCalculator() {
  const [salary, setSalary] = useState("31200");
  const [weeks, setWeeks] = useState(2);

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () => calculatePaternity({ annualSalary: salaryNumber, weeks }),
    [salaryNumber, weeks],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="pat-salary" className={labelClass}>
            Annual salary (£)
          </label>
          <input
            id="pat-salary"
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
          <label htmlFor="pat-weeks" className={labelClass}>
            Weeks of paternity leave
          </label>
          <select
            id="pat-weeks"
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className={inputClass}
          >
            <option value={1}>1 week</option>
            <option value={2}>2 weeks</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            The two weeks can be taken together or as two separate
            one-week blocks in the first year after the birth.
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
            Statutory Paternity Pay calculation — inputs used
          </p>
          <p>
            Annual salary: {gbp.format(salaryNumber)} · Weeks of leave:{" "}
            {weeks}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800">
          {gbp.format(result.totalPay)}
        </p>
        <p className="text-sm text-slate-600">
          Total Statutory Paternity Pay for {weeks} week{weeks > 1 ? "s" : ""}{" "}
          of leave
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <dt className="inline font-medium">Weekly SPP amount: </dt>
            <dd className="inline">
              {gbp.format(result.weeklyAmount)} —{" "}
              {result.rateBasis === "ninety-percent"
                ? `90% of average weekly earnings (${gbp.format(result.averageWeeklyEarnings)} a week), because that is lower than the ${gbp.format(SPP.weeklyRate)} flat rate`
                : `the flat statutory rate, because 90% of average weekly earnings is higher than ${gbp.format(SPP.weeklyRate)}`}
              .
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">If you took both weeks: </dt>
            <dd className="inline">
              {gbp.format(result.totalForTwoWeeks)} in total.
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600">
          SPP is paid by the employer through the normal payroll, in the
          same way as ordinary wages. Many employers top it up to full pay
          under their own policies — check your contract or staff handbook.
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
        label={`Total SPP for ${weeks} week${weeks > 1 ? "s" : ""}`}
        value={gbp.format(result.totalPay)}
      />
    </div>
  );
}
