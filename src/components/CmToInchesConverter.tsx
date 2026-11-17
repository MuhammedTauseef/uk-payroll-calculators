"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { cmToFeetInches, cmToInches, fmt, inchesToCm } from "@/lib/converters";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type Direction = "cm-to-inches" | "inches-to-cm";

export default function CmToInchesConverter() {
  const [value, setValue] = useState("170");
  const [direction, setDirection] = useState<Direction>("cm-to-inches");

  const inputValue = parseAmount(value);
  const inches = useMemo(
    () =>
      direction === "cm-to-inches"
        ? cmToInches(inputValue)
        : inputValue,
    [inputValue, direction],
  );
  const cm = useMemo(
    () =>
      direction === "cm-to-inches"
        ? inputValue
        : inchesToCm(inputValue),
    [inputValue, direction],
  );
  const feetInches = useMemo(() => cmToFeetInches(cm), [cm]);
  const headline =
    direction === "cm-to-inches"
      ? `${fmt(inches, 2)} in`
      : `${fmt(cm, 1)} cm`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="cmin-direction" className={labelClass}>
            Convert
          </label>
          <select
            id="cmin-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className={inputClass}
          >
            <option value="cm-to-inches">Centimetres → Inches</option>
            <option value="inches-to-cm">Inches → Centimetres</option>
          </select>
        </div>
        <div>
          <label htmlFor="cmin-value" className={labelClass}>
            {direction === "cm-to-inches" ? "Length in centimetres" : "Length in inches"}
          </label>
          <input
            id="cmin-value"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A height, a waist measurement, a screen size or a piece of
            furniture — one inch is exactly 2.54 cm.
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
          {fmt(cm, cm % 1 === 0 ? 0 : 1)} cm is {fmt(inches, 2)} inches —{" "}
          {feetInches.feet} ft {fmt(feetInches.inches, 1)} in in feet and
          inches.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The working: {fmt(cm, cm % 1 === 0 ? 0 : 1)} cm ÷ 2.54 ={" "}
            {fmt(inches, 2)} in. Twelve inches make a foot, so the whole
            feet are {feetInches.feet} and the inches left over are{" "}
            {fmt(feetInches.inches, 1)}.
          </p>
        </div>
        <PrintButton />
      </div>
      <StickyResultBar
        label={direction === "cm-to-inches" ? "Length in inches" : "Length in centimetres"}
        value={headline}
      />
    </div>
  );
}
