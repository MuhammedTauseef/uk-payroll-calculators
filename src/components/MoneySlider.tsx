"use client";

import type { ReactNode } from "react";

/**
 * A number field with a slider directly underneath, the two kept in
 * sync — the input pattern adopted across the calculators in the
 * Phase-1 UX pass (the visitor can type an exact figure or drag).
 * Purely presentational: it holds no state of its own, so the
 * calculator's maths and defaults are untouched. The slider clamps
 * its own position to its range; the typed field still accepts any
 * figure, including ones beyond the slider's end.
 */

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function MoneySlider({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  disabled = false,
  className,
  trailing,
}: {
  id: string;
  label: string;
  /** The field's current text, exactly as the calculator holds it. */
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Optional control rendered beside the number field (e.g. a period select). */
  trailing?: ReactNode;
}) {
  const numeric = parseAmount(value);
  const sliderValue = Math.min(max, Math.max(min, numeric));

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
        {trailing}
      </div>
      <input
        type="range"
        aria-label={`${label} — slider`}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-2 w-full cursor-pointer accent-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
      />
      {hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
