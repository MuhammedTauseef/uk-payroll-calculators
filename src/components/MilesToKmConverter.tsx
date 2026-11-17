"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { fmt, kmToMiles, milesToKm } from "@/lib/converters";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type Direction = "miles-to-km" | "km-to-miles";

export default function MilesToKmConverter() {
  const [value, setValue] = useState("26.2");
  const [direction, setDirection] = useState<Direction>("miles-to-km");

  const inputValue = parseAmount(value);
  const result = useMemo(
    () =>
      direction === "miles-to-km"
        ? milesToKm(inputValue)
        : kmToMiles(inputValue),
    [inputValue, direction],
  );
  const resultLabel = direction === "miles-to-km" ? "km" : "miles";
  const headline = `${fmt(result, 2)} ${resultLabel}`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="mikm-direction" className={labelClass}>
            Convert
          </label>
          <select
            id="mikm-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className={inputClass}
          >
            <option value="miles-to-km">Miles → Kilometres</option>
            <option value="km-to-miles">Kilometres → Miles</option>
          </select>
        </div>
        <div>
          <label htmlFor="mikm-value" className={labelClass}>
            {direction === "miles-to-km" ? "Distance in miles" : "Distance in kilometres"}
          </label>
          <input
            id="mikm-value"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A road distance, a race distance or a sat-nav figure — UK
            signs are in miles, most of the world works in kilometres.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {headline}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {direction === "miles-to-km"
            ? `${fmt(inputValue, inputValue % 1 === 0 ? 0 : 1)} miles × 1.60934 = ${fmt(result, 2)} km.`
            : `${fmt(inputValue, inputValue % 1 === 0 ? 0 : 1)} km ÷ 1.60934 = ${fmt(result, 2)} miles.`}
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            One mile is 1.60934 kilometres. For a rough mental check,
            multiply miles by 8 and divide by 5 — close enough for a
            road sign, never for a race result.
          </p>
        </div>
        <PrintButton />
      </div>
      <StickyResultBar
        label={direction === "miles-to-km" ? "Distance in kilometres" : "Distance in miles"}
        value={headline}
      />
    </div>
  );
}
