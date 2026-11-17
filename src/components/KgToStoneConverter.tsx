"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { fmt, kgToPounds, kgToStoneParts } from "@/lib/converters";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function KgToStoneConverter() {
  const [kg, setKg] = useState("76");

  const kgValue = parseAmount(kg);
  const parts = useMemo(() => kgToStoneParts(kgValue), [kgValue]);
  const pounds = useMemo(() => kgToPounds(kgValue), [kgValue]);

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="kgst-kg" className={labelClass}>
            Your weight in kilograms
          </label>
          <input
            id="kgst-kg"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The kilogram figure — from a metric scale, a medical letter
            or a gym programme.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {parts.stones} st {fmt(parts.pounds, 1)} lb
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {fmt(kgValue, kgValue % 1 === 0 ? 0 : 1)} kg is {fmt(parts.totalStone, 2)}{" "}
          stone in decimal — {fmt(pounds, 1)} lb altogether.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The working: {fmt(kgValue, kgValue % 1 === 0 ? 0 : 1)} kg × 0.157473 ={" "}
            {fmt(parts.totalStone, 2)} stone; the whole stones are{" "}
            {parts.stones}, and the {fmt(parts.totalStone - parts.stones, 2)} of a
            stone left over is {fmt(parts.pounds, 1)} lb (14 lb to a stone).
          </p>
        </div>
        <PrintButton />
      </div>
      <StickyResultBar
        label="Weight in stones and pounds"
        value={`${parts.stones} st ${fmt(parts.pounds, 1)} lb`}
      />
    </div>
  );
}
