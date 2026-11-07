"use client";

import { useMemo, useState } from "react";
import { calculateSsp } from "@/lib/ssp";
import { SSP } from "@/lib/rates";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700";

export default function SspCalculator() {
  const [awe, setAwe] = useState("500");
  const [qualifyingDays, setQualifyingDays] = useState(5);
  const [daysAbsent, setDaysAbsent] = useState("6");
  const [hasLinked, setHasLinked] = useState(false);
  const [linkedDays, setLinkedDays] = useState("");

  const aweNumber = parseAmount(awe);
  const absentNumber = Math.max(0, Math.floor(parseAmount(daysAbsent)));
  const linkedNumber = hasLinked ? Math.max(0, Math.floor(parseAmount(linkedDays))) : 0;

  const result = useMemo(
    () =>
      calculateSsp({
        averageWeeklyEarnings: aweNumber,
        qualifyingDaysPerWeek: qualifyingDays,
        daysAbsent: absentNumber,
        linkedSicknessDaysPaid: linkedNumber,
      }),
    [aweNumber, qualifyingDays, absentNumber, linkedNumber],
  );

  const eightyPercentAmount = SSP.aweFraction * aweNumber;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300 print:shadow-none">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="awe" className={labelClass}>
            Average weekly earnings (£)
          </label>
          <input
            id="awe"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={awe}
            onChange={(e) => setAwe(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            The employee&apos;s normal weekly pay before tax.
          </p>
        </div>

        <div>
          <label htmlFor="qualifying" className={labelClass}>
            Qualifying days per week
          </label>
          <select
            id="qualifying"
            value={qualifyingDays}
            onChange={(e) => setQualifyingDays(Number(e.target.value))}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                {d} day{d > 1 ? "s" : ""} a week
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            The days the employee normally works each week.
          </p>
        </div>

        <div>
          <label htmlFor="absent" className={labelClass}>
            Days absent this spell (qualifying days)
          </label>
          <input
            id="absent"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={daysAbsent}
            onChange={(e) => setDaysAbsent(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Count only the days the employee would normally have worked.
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Linked previous sickness?
          </label>
          <div className="flex items-center gap-2 pt-2">
            <input
              id="linked"
              type="checkbox"
              checked={hasLinked}
              onChange={(e) => setHasLinked(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <label htmlFor="linked" className="text-sm text-slate-700">
              The employee was off sick within the last 8 weeks
            </label>
          </div>
          {hasLinked && (
            <div className="mt-3">
              <label htmlFor="linked-days" className={labelClass}>
                SSP days already paid in that spell (qualifying days)
              </label>
              <input
                id="linked-days"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={linkedDays}
                onChange={(e) => setLinkedDays(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5 print:mt-0 print:border-slate-300">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Your result
        </h3>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 print:block">
          <p className="font-semibold text-slate-900">
            Statutory Sick Pay calculation — inputs used
          </p>
          <p>
            Average weekly earnings: {gbp.format(aweNumber)} · Qualifying
            days per week: {qualifyingDays} · Qualifying days absent this
            spell: {absentNumber}
            {hasLinked
              ? ` · SSP days already paid in a linked spell: ${linkedNumber}`
              : " · No linked previous sickness"}
            .
          </p>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800">
          {gbp.format(result.totalPayable)}
        </p>
        <p className="text-sm text-slate-600">
          Total Statutory Sick Pay for this spell
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <dt className="inline font-medium">Weekly SSP amount: </dt>
            <dd className="inline">
              {gbp.format(result.weeklyRate)} —{" "}
              {result.rateBasis === "eighty-percent"
                ? `80% of average weekly earnings (${gbp.format(eightyPercentAmount)}), because that is lower than the ${gbp.format(SSP.weeklyCap)} flat rate`
                : `the flat statutory rate, because 80% of average weekly earnings (${gbp.format(eightyPercentAmount)}) is higher`}
              .
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Daily rate: </dt>
            <dd className="inline">
              {gbp.format(result.dailyRate)} — the weekly amount divided by{" "}
              {qualifyingDays} qualifying day{qualifyingDays > 1 ? "s" : ""}.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Days payable: </dt>
            <dd className="inline">
              {result.daysPayable} of {absentNumber} absent qualifying days,
              paid from the first full day of sickness (no waiting days).
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">28-week entitlement: </dt>
            <dd className="inline">
              {result.maxPayableDays} qualifying days in total
              {result.linkedDaysPaid > 0
                ? `, of which ${result.linkedDaysPaid} were already paid in the linked spell`
                : ""}
              .
            </dd>
          </div>
        </dl>

        {result.cappedByLinkedPeriod && (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            The 28-week maximum has been reached: {result.daysNotPayable} of
            the absent days are not payable because the linked spells have
            used up the entitlement.
          </p>
        )}

        <p className="mt-3 text-sm text-slate-600">
          SSP is paid by the employer through the normal payroll. Employers
          cannot reclaim SSP from HMRC.
        </p>

        <div className="print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 rounded-full border border-brand-700 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50"
          >
            Print / save this result
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Opens your browser&apos;s print view with a clean summary of
            this calculation — choose &ldquo;Save as PDF&rdquo; there to
            keep a copy.
          </p>
        </div>
      </div>
    </div>
  );
}
