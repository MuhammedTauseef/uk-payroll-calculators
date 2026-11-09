"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateTakeHome } from "@/lib/takehome";

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

export default function TakeHomeCalculator() {
  const [salary, setSalary] = useState("40000");

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () => calculateTakeHome({ annualSalary: salaryNumber }),
    [salaryNumber],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="th-salary" className={labelClass}>
            Annual salary (£)
          </label>
          <input
            id="th-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gross pay for a full year, before tax. Try £40,000 — or any
            salary you want to check.
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
            Take-home pay calculation — inputs used
          </p>
          <p>Annual salary: {gbp.format(salaryNumber)}.</p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netAnnual)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Take-home pay per year — {gbp.format(result.netMonthly)} a month
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Gross salary
                </td>
                <td className="py-2">{gbp.format(result.grossAnnual)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income Tax
                </td>
                <td className="py-2">
                  −{gbp.format(result.incomeTax)}
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Personal Allowance {gbp.format(result.personalAllowance)}{" "}
                    · taxable income {gbp.format(result.taxableIncome)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Employee National Insurance
                </td>
                <td className="py-2">
                  −{gbp.format(result.employeeNationalInsurance)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Take-home pay
                </td>
                <td className="py-2 font-semibold text-slate-900 dark:text-slate-50">
                  {gbp.format(result.netAnnual)} a year ·{" "}
                  {gbp.format(result.netMonthly)} a month ·{" "}
                  {gbp.format(result.netWeekly)} a week ·{" "}
                  {gbp.format(result.netDaily)} a day
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          You keep {result.effectiveKeepPercent}% of your gross pay. These
          figures are before pension contributions, student loan repayments
          and any other deductions, and they use the England, Wales and
          Northern Ireland tax bands — Scotland&apos;s bands are different.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Take-home pay per month"
        value={gbp.format(result.netMonthly)}
      />
    </div>
  );
}
