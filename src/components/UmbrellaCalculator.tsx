"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateUmbrella } from "@/lib/umbrella";

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

export default function UmbrellaCalculator() {
  const [rate, setRate] = useState("300");
  const [rateType, setRateType] = useState<"day" | "hour">("day");
  const [hoursPerDay, setHoursPerDay] = useState("7.5");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [weeks, setWeeks] = useState("46");
  const [margin, setMargin] = useState("25");

  const result = useMemo(
    () =>
      calculateUmbrella({
        rate: parseAmount(rate),
        rateType,
        hoursPerDay: parseAmount(hoursPerDay),
        daysPerWeek: parseAmount(daysPerWeek),
        weeksPerYear: parseAmount(weeks),
        marginPerWeek: parseAmount(margin),
      }),
    [rate, rateType, hoursPerDay, daysPerWeek, weeks, margin],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="um-rate" className={labelClass}>
            Assignment (umbrella) rate (£)
          </label>
          <div className="flex gap-2">
            <input
              id="um-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={inputClass}
            />
            <select
              aria-label="Rate type"
              value={rateType}
              onChange={(e) => setRateType(e.target.value as "day" | "hour")}
              className="w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
            >
              <option value="day">per day</option>
              <option value="hour">per hour</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The rate the agency pays the umbrella — the higher
            &quot;umbrella rate&quot;, not the PAYE rate. It has to
            cover every employment cost below.
          </p>
        </div>

        {rateType === "hour" && (
          <div>
            <label htmlFor="um-hours" className={labelClass}>
              Hours per day
            </label>
            <input
              id="um-hours"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="um-days" className={labelClass}>
            Days worked per week
          </label>
          <input
            id="um-days"
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
          <label htmlFor="um-weeks" className={labelClass}>
            Weeks worked per year
          </label>
          <input
            id="um-weeks"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            46 is a full year with six weeks off; use your real
            contract length if it is shorter.
          </p>
        </div>

        <div>
          <label htmlFor="um-margin" className={labelClass}>
            Umbrella margin (£ per week)
          </label>
          <input
            id="um-margin"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The umbrella&apos;s fee — typically £15–£30 a week. It
            comes off before anything else is worked out.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.takeHome.netAnnual)} a year
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          take-home pay — {gbp.format(result.netMonthly)} a month,{" "}
          {gbp.format(result.netPerWorkedWeek)} per worked week,{" "}
          {result.shareOfAssignmentPercent}% of the assignment income
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Assignment income (rate × time)
                </td>
                <td className="py-2">{gbp.format(result.assignmentIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Umbrella margin
                </td>
                <td className="py-2">− {gbp.format(result.marginAnnual)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Employer National Insurance (15% over £5,000)
                </td>
                <td className="py-2">− {gbp.format(result.employerNi)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Apprenticeship levy (0.5%)
                </td>
                <td className="py-2">− {gbp.format(result.apprenticeshipLevy)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Your gross salary
                </td>
                <td className="py-2">{gbp.format(result.grossSalary)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  of which holiday pay (12.07% accrual)
                </td>
                <td className="py-2">{gbp.format(result.holidayPayElement)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income Tax
                </td>
                <td className="py-2">− {gbp.format(result.takeHome.incomeTax)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Employee National Insurance
                </td>
                <td className="py-2">
                  − {gbp.format(result.takeHome.employeeNationalInsurance)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Take-home pay
                </td>
                <td className="py-2">{gbp.format(result.takeHome.netAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The gap between the assignment rate and your salary is not
            the umbrella keeping the difference — it is the employer
            costs the rate was built to carry. An umbrella that quotes
            a much higher take-home on the same rate is usually leaving
            one of these lines out.
          </p>
          <p>
            Before pension contributions: auto-enrolment contributions
            would come off the gross salary on top of the figures
            above. Expenses are not deducted — since 2016 most
            umbrella workers cannot claim tax relief on travel and
            subsistence.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Umbrella take-home per year"
        value={gbp.format(result.takeHome.netAnnual)}
      />
    </div>
  );
}
