"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { fmt, stoneToKg } from "@/lib/converters";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function StoneToKgConverter() {
  const [stones, setStones] = useState("12");
  const [pounds, setPounds] = useState("0");

  const stonesValue = parseAmount(stones);
  const poundsValue = parseAmount(pounds);
  const kg = useMemo(
    () => stoneToKg(stonesValue, poundsValue),
    [stonesValue, poundsValue],
  );
  const totalPounds = stonesValue * 14 + poundsValue;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="stkg-stones" className={labelClass}>
            Stones
          </label>
          <input
            id="stkg-stones"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={stones}
            onChange={(e) => setStones(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The stones part of your weight — 14 pounds to a stone.
          </p>
        </div>
        <div>
          <label htmlFor="stkg-pounds" className={labelClass}>
            Pounds (0–13)
          </label>
          <input
            id="stkg-pounds"
            type="number"
            inputMode="decimal"
            min="0"
            max="13.99"
            step="0.5"
            value={pounds}
            onChange={(e) => setPounds(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The pounds left over after the whole stones — most scales
            show this as the second number, e.g. 12 st 7 lb.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmt(kg, 2)} kg
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {fmt(stonesValue, 0)} st {fmt(poundsValue, poundsValue % 1 === 0 ? 0 : 1)} lb
          is {fmt(totalPounds, totalPounds % 1 === 0 ? 0 : 1)} lb in total — and
          a pound is 0.45359237 kg.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The working: ({fmt(stonesValue, 0)} × 14 +{" "}
            {fmt(poundsValue, poundsValue % 1 === 0 ? 0 : 1)}) lb × 0.45359237 ={" "}
            {fmt(kg, 2)} kg. One stone is 6.35029 kg.
          </p>
        </div>
        <PrintButton />
      </div>
      <StickyResultBar label="Weight in kilograms" value={`${fmt(kg, 2)} kg`} />
    </div>
  );
}
