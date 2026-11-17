"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateSalarySacrifice } from "@/lib/salary-sacrifice";

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

export default function SalarySacrificeCalculator() {
  const [salary, setSalary] = useState("40000");
  const [monthly, setMonthly] = useState("200");

  const sacrificeAnnual = parseAmount(monthly) * 12;
  const result = useMemo(
    () =>
      calculateSalarySacrifice({
        grossSalary: parseAmount(salary),
        sacrificeAnnual,
      }),
    [salary, sacrificeAnnual],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ss-salary" className={labelClass}>
            Your gross annual salary (£)
          </label>
          <input
            id="ss-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The salary before any sacrifice — the figure in your
            contract today.
          </p>
        </div>

        <div>
          <label htmlFor="ss-monthly" className={labelClass}>
            Amount to sacrifice into your pension (£ per month)
          </label>
          <input
            id="ss-monthly"
            type="number"
            inputMode="decimal"
            min="0"
            step="10"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {gbp.format(sacrificeAnnual)} a year. Your contract is
            rewritten at the lower salary and your employer pays this
            into the pension instead.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.sacrificeAnnual)} into your pension
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          costs you {gbp.format(result.takeHomeCost)} of take-home pay
          — {result.costPerPoundPence}p given up for every £1 in the
          pension, because you save {gbp.format(result.totalSaved)} of
          tax and National Insurance
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-brand-900">
                <th className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-50"></th>
                <th className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-50">
                  Without sacrifice
                </th>
                <th className="py-2 font-semibold text-slate-900 dark:text-slate-50">
                  With sacrifice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Contractual salary
                </td>
                <td className="py-2">{gbp.format(result.grossSalary)}</td>
                <td className="py-2">{gbp.format(result.reducedSalary)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income Tax
                </td>
                <td className="py-2">{gbp.format(result.before.incomeTax)}</td>
                <td className="py-2">{gbp.format(result.after.incomeTax)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Employee National Insurance
                </td>
                <td className="py-2">
                  {gbp.format(result.before.employeeNationalInsurance)}
                </td>
                <td className="py-2">
                  {gbp.format(result.after.employeeNationalInsurance)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Take-home pay
                </td>
                <td className="py-2">{gbp.format(result.before.netAnnual)}</td>
                <td className="py-2">{gbp.format(result.after.netAnnual)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Paid into your pension
                </td>
                <td className="py-2">£0</td>
                <td className="py-2">{gbp.format(result.sacrificeAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Your employer also saves {gbp.format(result.employerNiSaved)}{" "}
            of employer National Insurance on these figures. Some
            employers add that saving to the pension contribution —
            ask yours before you sign; it is not automatic.
          </p>
          <p>
            Sacrifice cannot take your contractual pay below the
            National Minimum Wage, and it lowers the salary that
            statutory payments and mortgage references are based on.
            The page below covers both.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Tax + NI saved per year"
        value={gbp.format(result.totalSaved)}
      />
    </div>
  );
}
