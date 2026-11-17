"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  fmt,
  imperialGallonsToLitres,
  litresToImperialGallons,
  litresToUsGallons,
} from "@/lib/converters";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type Direction = "litres-to-gallons" | "gallons-to-litres";

export default function LitresToGallonsConverter() {
  const [value, setValue] = useState("50");
  const [direction, setDirection] = useState<Direction>("litres-to-gallons");

  const inputValue = parseAmount(value);
  const litres = useMemo(
    () =>
      direction === "litres-to-gallons"
        ? inputValue
        : imperialGallonsToLitres(inputValue),
    [inputValue, direction],
  );
  const imperial = useMemo(
    () => litresToImperialGallons(litres),
    [litres],
  );
  const us = useMemo(() => litresToUsGallons(litres), [litres]);
  const headline =
    direction === "litres-to-gallons"
      ? `${fmt(imperial, 2)} UK gal`
      : `${fmt(litres, 1)} litres`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="lgal-direction" className={labelClass}>
            Convert
          </label>
          <select
            id="lgal-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className={inputClass}
          >
            <option value="litres-to-gallons">Litres → Gallons</option>
            <option value="gallons-to-litres">UK gallons → Litres</option>
          </select>
        </div>
        <div>
          <label htmlFor="lgal-value" className={labelClass}>
            {direction === "litres-to-gallons" ? "Volume in litres" : "Volume in UK (imperial) gallons"}
          </label>
          <input
            id="lgal-value"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A fuel tank, a water butt, a fish tank — in the UK a gallon
            is the imperial gallon of 4.54609 litres, not the smaller
            US gallon.
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
          {fmt(litres, litres % 1 === 0 ? 0 : 1)} litres is{" "}
          {fmt(imperial, 2)} UK (imperial) gallons — or {fmt(us, 2)} US
          gallons.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The working: {fmt(litres, litres % 1 === 0 ? 0 : 1)} ÷ 4.54609 ={" "}
            {fmt(imperial, 2)} imperial gallons. The US gallon is smaller
            (3.78541 litres), which is why the US figure is always the
            bigger number — and why US fuel-economy figures never match
            UK ones.
            {direction === "gallons-to-litres" &&
              ` Backwards: ${fmt(inputValue, inputValue % 1 === 0 ? 0 : 1)} UK gallons × 4.54609 = ${fmt(litres, 1)} litres.`}
          </p>
        </div>
        <PrintButton />
      </div>
      <StickyResultBar
        label={direction === "litres-to-gallons" ? "Volume in UK gallons" : "Volume in litres"}
        value={headline}
      />
    </div>
  );
}
