"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateVat, VAT_RATE_PRESETS, type VatMode } from "@/lib/vat";

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

export default function VatCalculator() {
  const [mode, setMode] = useState<VatMode>("add");
  const [amount, setAmount] = useState("100");
  const [rateChoice, setRateChoice] = useState("20");
  const [customRate, setCustomRate] = useState("20");

  const ratePercent =
    rateChoice === "custom" ? parseAmount(customRate) : Number(rateChoice);
  const amountNumber = parseAmount(amount);

  const result = useMemo(
    () => calculateVat({ amount: amountNumber, ratePercent, mode }),
    [amountNumber, ratePercent, mode],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="vat-mode" className={labelClass}>
            What do you want to do?
          </label>
          <select
            id="vat-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as VatMode)}
            className={inputClass}
          >
            <option value="add">Add VAT to a net amount</option>
            <option value="remove">Remove VAT from a gross amount</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Net means before VAT; gross means the price with VAT already
            included.
          </p>
        </div>

        <div>
          <label htmlFor="vat-rate" className={labelClass}>
            VAT rate
          </label>
          <select
            id="vat-rate"
            value={rateChoice}
            onChange={(e) => setRateChoice(e.target.value)}
            className={inputClass}
          >
            {VAT_RATE_PRESETS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
            <option value="custom">Custom rate…</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Most goods and services use the 20% standard rate.
          </p>
        </div>

        {rateChoice === "custom" && (
          <div>
            <label htmlFor="vat-custom-rate" className={labelClass}>
              Custom VAT rate (%)
            </label>
            <input
              id="vat-custom-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="vat-amount" className={labelClass}>
            {mode === "add" ? "Net amount (£)" : "Gross amount (£)"}
          </label>
          <input
            id="vat-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === "add"
              ? "The price before VAT is added."
              : "The full price, including VAT."}
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
            VAT calculation — inputs used
          </p>
          <p>
            {mode === "add" ? "Adding" : "Removing"} VAT at {ratePercent}%
            on {gbp.format(amountNumber)}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.gross)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Gross amount, including VAT at {ratePercent}%
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Net amount (before VAT)
                </td>
                <td className="py-2">{gbp.format(result.net)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  VAT at {ratePercent}%
                </td>
                <td className="py-2">{gbp.format(result.vat)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Gross amount (with VAT)
                </td>
                <td className="py-2">{gbp.format(result.gross)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {mode === "add"
            ? `${gbp.format(result.net)} × ${(1 + ratePercent / 100).toFixed(2)} = ${gbp.format(result.gross)} — the VAT on top is ${gbp.format(result.vat)}.`
            : `${gbp.format(result.gross)} ÷ ${(1 + ratePercent / 100).toFixed(2)} = ${gbp.format(result.net)} — the VAT inside that price is ${gbp.format(result.vat)}.`}{" "}
          Amounts are rounded to the nearest penny.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Gross amount (with VAT)"
        value={gbp.format(result.gross)}
      />
    </div>
  );
}
