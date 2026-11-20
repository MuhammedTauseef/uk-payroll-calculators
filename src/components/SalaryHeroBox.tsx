"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateTakeHome } from "@/lib/takehome";

/**
 * The homepage hero salary box (UX Phase 3, Izafa 2, 2026-11-20):
 * type a salary the way people actually write it — 75, 120k, 45000,
 * £50,000 — and see the estimated take-home straight away, without
 * hunting for the right calculator first.
 *
 * The maths is NOT a copy: it calls the same calculateTakeHome the
 * take-home calculator page uses, with that page's standard
 * assumptions (England/Wales/NI rules, no pension or student loan
 * deductions — the box says so). The full breakdown is one tap away
 * on the take-home calculator itself.
 */

const CHIPS: { label: string; value: string }[] = [
  { label: "£75k", value: "75k" },
  { label: "£120,000", value: "120000" },
  { label: "£50k", value: "50k" },
  { label: "£10k", value: "10k" },
];

function parseSalary(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/[£,\s]/g, "");
  if (!s) return null;
  let multiplier = 1;
  if (s.endsWith("k")) {
    multiplier = 1000;
    s = s.slice(0, -1);
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const annual = Number(s) * multiplier;
  if (!Number.isFinite(annual) || annual < 1000 || annual > 2_000_000) {
    return null;
  }
  return annual;
}

const gbp0 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export default function SalaryHeroBox() {
  const [raw, setRaw] = useState("");

  const result = useMemo(() => {
    const salary = parseSalary(raw);
    if (salary === null) return null;
    const takeHome = calculateTakeHome({ annualSalary: salary });
    return { salary, takeHome };
  }, [raw]);

  const showHint = raw.trim().length > 0 && result === null;

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-5 text-left shadow-lg backdrop-blur">
      <label
        htmlFor="hero-salary"
        className="block text-sm font-semibold text-slate-900 dark:text-slate-50"
      >
        What&apos;s your take-home pay?
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="hero-salary"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Type a salary — try 75, 120k or £50,000"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        />
        <Link
          href="/40k-after-tax-uk"
          className="flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-brand-800"
        >
          Full breakdown
        </Link>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span>Try:</span>
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setRaw(chip.value)}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 font-medium text-slate-600 dark:text-slate-300 transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {result && (
        <p role="status" className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On {gbp0.format(result.salary)} a year, take-home pay is about{" "}
          <strong className="text-slate-900 dark:text-slate-50">
            {gbp0.format(result.takeHome.netAnnual)} a year
          </strong>{" "}
          ({gbp0.format(result.takeHome.netMonthly)} a month) — before
          pension and student loan deductions.{" "}
          <Link
            href="/40k-after-tax-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline"
          >
            See the full breakdown →
          </Link>
        </p>
      )}
      {showHint && (
        <p role="status" className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Type a yearly salary — for example 45000, 75 or 120k.
        </p>
      )}
    </div>
  );
}
