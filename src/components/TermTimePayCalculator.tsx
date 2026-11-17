"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateTermTime } from "@/lib/term-time";

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

export default function TermTimePayCalculator() {
  const [fteSalary, setFteSalary] = useState("24000");
  const [weeks, setWeeks] = useState("39");
  const [ftHours, setFtHours] = useState("37.5");
  const [contractedHours, setContractedHours] = useState("37.5");

  const result = useMemo(
    () =>
      calculateTermTime({
        fteAnnualSalary: parseAmount(fteSalary),
        workingWeeksPerYear: parseAmount(weeks),
        fullTimeHoursPerWeek: parseAmount(ftHours),
        contractedHoursPerWeek: parseAmount(contractedHours),
      }),
    [fteSalary, weeks, ftHours, contractedHours],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="tt-salary" className={labelClass}>
            Full-time equivalent (FTE) annual salary (£)
          </label>
          <input
            id="tt-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={fteSalary}
            onChange={(e) => setFteSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The salary for the same job worked all year round — the
            figure on the pay scale or in the job advert.
          </p>
        </div>

        <div>
          <label htmlFor="tt-weeks" className={labelClass}>
            Contracted working weeks per year
          </label>
          <input
            id="tt-weeks"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The weeks actually worked — 38, 39 or 40 are typical in
            schools (39 is term time plus INSET days in many areas).
          </p>
        </div>

        <div>
          <label htmlFor="tt-ft-hours" className={labelClass}>
            Full-time hours per week
          </label>
          <input
            id="tt-ft-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={ftHours}
            onChange={(e) => setFtHours(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The full-time pattern for the job — 37.5 and 37 are both
            common; teachers&apos; directed time is different.
          </p>
        </div>

        <div>
          <label htmlFor="tt-hours" className={labelClass}>
            Contracted hours per week
          </label>
          <input
            id="tt-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={contractedHours}
            onChange={(e) => setContractedHours(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The hours worked in each working week. Leave this equal to
            the full-time hours if the job is full-time in term weeks.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Term-time pay — inputs used
          </p>
          <p>
            FTE salary {gbp.format(parseAmount(fteSalary))},{" "}
            {parseAmount(weeks)} working weeks a year,{" "}
            {parseAmount(contractedHours)} of {parseAmount(ftHours)}{" "}
            full-time hours per week.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.annualPay)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Term-time gross pay per year — {gbp.format(result.monthlyPay)} a
          month in twelve equal instalments
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Working weeks
                </td>
                <td className="py-2">{parseAmount(weeks)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Plus paid holiday weeks (5.6 × weeks ÷ 46.4)
                </td>
                <td className="py-2">{result.holidayWeeks}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Paid weeks the salary covers
                </td>
                <td className="py-2">{result.paidWeeks}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Pay per year
                </td>
                <td className="py-2">{gbp.format(result.annualPay)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Pay per month (÷ 12, paid all year round)
                </td>
                <td className="py-2">{gbp.format(result.monthlyPay)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Weekly equivalent (÷ 52.143)
                </td>
                <td className="py-2">{gbp.format(result.weeklyPay)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Without the holiday uplift (for comparison)
                </td>
                <td className="py-2">
                  {gbp.format(result.withoutUpliftAnnual)} —{" "}
                  {gbp.format(result.upliftAmount)} less
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The holiday uplift is included: the {result.holidayWeeks}{" "}
            holiday weeks are paid weeks, because holiday is earned on
            the weeks worked. A calculation that leaves them out —
            salary × weeks ÷ 52.143 and nothing more — underpays by{" "}
            {gbp.format(result.upliftAmount)} a year on these figures.
          </p>
          <p>
            Gross pay before tax, National Insurance and pension. Most
            term-time contracts spread the annual figure over twelve
            equal monthly payments, so the pay continues through the
            school holidays.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Term-time pay per year"
        value={gbp.format(result.annualPay)}
      />
    </div>
  );
}
