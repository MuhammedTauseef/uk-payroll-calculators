"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateCms } from "@/lib/cms";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseCount(value: string, fallback: number): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function CmsCalculator() {
  const [period, setPeriod] = useState<"year" | "week">("year");
  const [income, setIncome] = useState("26000");
  const [children, setChildren] = useState("1");
  const [otherChildren, setOtherChildren] = useState("0");
  const [benefits, setBenefits] = useState("no");
  const [nights, setNights] = useState("0");
  const [collection, setCollection] = useState("direct");

  const incomeNumber = parseAmount(income);
  const grossWeeklyIncome =
    period === "year" ? incomeNumber / 52 : incomeNumber;
  const qualifyingChildren = Math.max(1, parseCount(children, 1));
  const otherChildrenCount = parseCount(otherChildren, 0);
  const sharedCareNights = Math.min(365, parseCount(nights, 0));
  const collectAndPay = collection === "collect";

  const result = useMemo(
    () =>
      calculateCms({
        grossWeeklyIncome,
        qualifyingChildren,
        otherChildren: otherChildrenCount,
        receivesBenefits: benefits === "yes",
        sharedCareNights,
        collectAndPay,
      }),
    [
      grossWeeklyIncome,
      qualifyingChildren,
      otherChildrenCount,
      benefits,
      sharedCareNights,
      collectAndPay,
    ],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="cms-income" className={labelClass}>
            Paying parent&apos;s gross income (£)
          </label>
          <input
            id="cms-income"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gross means before tax. The CMS takes the yearly figure from
            HMRC and converts it to a weekly amount.
          </p>
        </div>

        <div>
          <label htmlFor="cms-period" className={labelClass}>
            Is that per year or per week?
          </label>
          <select
            id="cms-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "year" | "week")}
            className={inputClass}
          >
            <option value="year">Per year</option>
            <option value="week">Per week</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {period === "year"
              ? `${gbp.format(incomeNumber)} a year is ${gbp.format(grossWeeklyIncome)} a week.`
              : `${gbp.format(incomeNumber)} a week is ${gbp.format(incomeNumber * 52)} a year.`}
          </p>
        </div>

        <div>
          <label htmlFor="cms-children" className={labelClass}>
            Children you are working out maintenance for
          </label>
          <input
            id="cms-children"
            type="number"
            inputMode="numeric"
            min="1"
            max="10"
            step="1"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The children who live mainly with the receiving parent. Three
            or more are charged at the same percentages.
          </p>
        </div>

        <div>
          <label htmlFor="cms-other-children" className={labelClass}>
            Other children living with the paying parent
          </label>
          <input
            id="cms-other-children"
            type="number"
            inputMode="numeric"
            min="0"
            max="10"
            step="1"
            value={otherChildren}
            onChange={(e) => setOtherChildren(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Their own children in the paying parent&apos;s household —
            these reduce the income the percentages are applied to.
          </p>
        </div>

        <div>
          <label htmlFor="cms-nights" className={labelClass}>
            Overnight stays with the paying parent (nights per year)
          </label>
          <input
            id="cms-nights"
            type="number"
            inputMode="numeric"
            min="0"
            max="365"
            step="1"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Shared care only counts from 52 nights a year (about one
            night a week) upwards.
          </p>
        </div>

        <div>
          <label htmlFor="cms-benefits" className={labelClass}>
            Does the paying parent receive benefits?
          </label>
          <select
            id="cms-benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            className={inputClass}
          >
            <option value="no">No</option>
            <option value="yes">Yes — the flat rate applies</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A paying parent on benefits pays the £7 flat rate, whatever
            their other income.
          </p>
        </div>

        <div>
          <label htmlFor="cms-collection" className={labelClass}>
            How will payments be made?
          </label>
          <select
            id="cms-collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className={inputClass}
          >
            <option value="direct">Direct Pay — no fees</option>
            <option value="collect">Collect &amp; Pay — CMS collects it</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Collect &amp; Pay adds 20% for the paying parent and takes 4%
            from what the receiving parent gets.
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
            CMS calculation — inputs used
          </p>
          <p>
            Gross income {gbp.format(grossWeeklyIncome)} a week,{" "}
            {qualifyingChildren}{" "}
            {qualifyingChildren === 1 ? "child" : "children"},{" "}
            {otherChildrenCount} other{" "}
            {otherChildrenCount === 1 ? "child" : "children"},{" "}
            {sharedCareNights} shared-care nights a year
            {benefits === "yes" ? ", paying parent on benefits" : ""}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.weekly)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Child maintenance per week — {result.rateLabel}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per week
                </td>
                <td className="py-2">{gbp.format(result.weekly)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per month (weekly × 52 ÷ 12)
                </td>
                <td className="py-2">{gbp.format(result.monthly)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Per year (weekly × 52)
                </td>
                <td className="py-2">{gbp.format(result.annual)}</td>
              </tr>
              {result.collectAndPayPayerWeekly !== null &&
                result.collectAndPayReceiverWeekly !== null && (
                  <>
                    <tr>
                      <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                        Collect &amp; Pay: paying parent pays (+20% fee)
                      </td>
                      <td className="py-2">
                        {gbp.format(result.collectAndPayPayerWeekly)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                        Collect &amp; Pay: receiving parent receives (−4% fee)
                      </td>
                      <td className="py-2">
                        {gbp.format(result.collectAndPayReceiverWeekly)}
                      </td>
                    </tr>
                  </>
                )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            How this figure was reached
          </p>
          {result.steps.map((step) => (
            <p key={step}>{step}</p>
          ))}
          <p>
            This is an estimate of what the Child Maintenance Service
            would work out on these figures. The CMS decides the actual
            amount, and variations, pension payments and the annual
            review can change it.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Child maintenance per week"
        value={gbp.format(result.weekly)}
      />
    </div>
  );
}
