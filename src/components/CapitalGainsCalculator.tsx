"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateCapitalGains } from "@/lib/capital-gains";

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

export default function CapitalGainsCalculator() {
  const [gains, setGains] = useState("30000");
  const [income, setIncome] = useState("40000");

  const result = useMemo(
    () =>
      calculateCapitalGains({
        totalGains: parseAmount(gains),
        otherIncome: parseAmount(income),
      }),
    [gains, income],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="cgt-gains" className={labelClass}>
            Total capital gains in the year (£)
          </label>
          <input
            id="cgt-gains"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={gains}
            onChange={(e) => setGains(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sale price minus what the asset cost and the costs of
            buying and selling, added across everything sold in the
            tax year — before the £3,000 exempt amount.
          </p>
        </div>

        <div>
          <label htmlFor="cgt-income" className={labelClass}>
            Your other income in the same year (£)
          </label>
          <input
            id="cgt-income"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Salary, rent, savings interest and anything else taxed as
            income — it decides how much of the gain is taxed at 18%
            and how much at 24%.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.taxDue)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Capital Gains Tax — an effective rate of{" "}
          {result.effectiveRatePercent}% on the whole gain, leaving{" "}
          {gbp.format(result.gainAfterTax)} after tax
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Total gains
                </td>
                <td className="py-2">{gbp.format(parseAmount(gains))}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Annual exempt amount
                </td>
                <td className="py-2">− £3,000</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Taxable gain
                </td>
                <td className="py-2">{gbp.format(result.taxableGain)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Taxable income (after your Personal Allowance of{" "}
                  {gbp.format(result.personalAllowance)})
                </td>
                <td className="py-2">{gbp.format(result.taxableIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Gain taxed at 18% (inside the basic-rate band)
                </td>
                <td className="py-2">{gbp.format(result.gainAtLowerRate)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Gain taxed at 24% (above the band)
                </td>
                <td className="py-2">{gbp.format(result.gainAtHigherRate)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Capital Gains Tax due
                </td>
                <td className="py-2">{gbp.format(result.taxDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The gain stacks on top of your income: whatever is left of
            the £37,700 basic-rate band after your taxable income is
            taxed at 18%, and the rest at 24%. That is why the same
            gain costs less tax in a low-income year.
          </p>
          <p>
            This is an estimate on the standard rates. Losses brought
            forward, Business Asset Disposal Relief and a spouse&apos;s
            unused allowance can all change the bill — the page below
            explains where each applies.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Capital Gains Tax due"
        value={gbp.format(result.taxDue)}
      />
    </div>
  );
}
