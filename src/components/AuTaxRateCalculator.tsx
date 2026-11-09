"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateAuTax,
  RESIDENCY_OPTIONS,
  TAX_YEAR_LABEL,
} from "@/lib/au-tax";
import type { AuResidency } from "@/lib/au-tax";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function AuTaxRateCalculator() {
  const [income, setIncome] = useState("90000");
  const [residency, setResidency] = useState<AuResidency>("resident");
  const [medicare, setMedicare] = useState<"applies" | "exempt">("applies");

  const result = useMemo(
    () =>
      calculateAuTax({
        taxableIncome: parseAmount(income),
        residency,
        medicareLevyApplies: medicare === "applies",
      }),
    [income, residency, medicare],
  );

  const residencyLabel =
    RESIDENCY_OPTIONS.find((r) => r.id === residency)?.label ?? "Resident";
  const noIncome = result.taxableIncome <= 0;

  const lines: { label: string; value: number }[] = [
    { label: "Taxable income", value: result.taxableIncome },
    { label: "Income tax", value: -result.incomeTax },
    {
      label: result.medicareLevyApplied
        ? "Medicare levy (2%)"
        : "Medicare levy",
      value: -result.medicareLevy,
    },
  ];

  const stickyValue =
    result.taxableIncome > 0
      ? `${fmtMoney(result.netIncome)} net per year`
      : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="au-income" className={labelClass}>
            Annual taxable income ($)
          </label>
          <input
            id="au-income"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your taxable income for the year — for most employees
            that is your salary, before tax is taken out.
          </p>
        </div>

        <div>
          <label htmlFor="au-residency" className={labelClass}>
            Residency for tax purposes
          </label>
          <select
            id="au-residency"
            value={residency}
            onChange={(e) => setResidency(e.target.value as AuResidency)}
            className={inputClass}
          >
            {RESIDENCY_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Residents get the $18,200 tax-free threshold.
            Non-residents are taxed from the first dollar and do
            not pay the Medicare levy.
          </p>
        </div>

        <div>
          <label htmlFor="au-medicare" className={labelClass}>
            Medicare levy
          </label>
          <select
            id="au-medicare"
            value={residency === "nonResident" ? "exempt" : medicare}
            onChange={(e) =>
              setMedicare(e.target.value as "applies" | "exempt")
            }
            disabled={residency === "nonResident"}
            className={inputClass}
          >
            <option value="applies">Applies — charge the 2% levy</option>
            <option value="exempt">Exempt — no levy</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {residency === "nonResident"
              ? "Non-residents are not required to pay the Medicare levy (ATO), so the levy is always $0 here."
              : "Most residents pay the levy at 2% of taxable income. Choose Exempt only if an ATO exemption category covers you."}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noIncome && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter your annual taxable income to see your Australian
          tax figures.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your Australian tax — {TAX_YEAR_LABEL}
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Australia tax rate calculation — inputs used
          </p>
          <p>
            Taxable income: {fmtMoney(parseAmount(income))} a year
            {" · "}Residency: {residencyLabel}
            {" · "}Medicare levy:{" "}
            {result.medicareLevyApplied ? "applies (2%)" : "not charged"}
            {" · "}Income year: {TAX_YEAR_LABEL}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.netIncome)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            net income per year after {fmtMoney(result.totalTax)} of tax
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Marginal tax rate: {result.marginalRatePercent.toFixed(0)}% on
          your next dollar
          {result.medicareLevyApplied
            ? ` (${result.marginalTaxRatePercent.toFixed(0)}% income tax + 2% Medicare levy)`
            : ` (income tax only — no Medicare levy)`}
          . Effective tax rate:{" "}
          {result.effectiveTaxRatePercent.toFixed(2)}% — your total
          tax as a share of your taxable income.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-brand-200 dark:border-brand-800">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Line
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {lines.map((line) => (
                <tr key={line.label}>
                  <td className="py-2 pr-3">{line.label}</td>
                  <td className="py-2">
                    {line.value < 0
                      ? `−${fmtMoney(-line.value)}`
                      : fmtMoney(line.value)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold text-slate-900 dark:text-slate-50">
                <td className="py-2 pr-3">Total tax</td>
                <td className="py-2">−{fmtMoney(result.totalTax)}</td>
              </tr>
              <tr className="font-bold text-brand-800 dark:text-brand-300">
                <td className="py-2 pr-3">Net (after-tax) income</td>
                <td className="py-2">{fmtMoney(result.netIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar label="AU net income" value={stickyValue} />
    </div>
  );
}
