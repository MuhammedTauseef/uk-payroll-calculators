"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { checkTaxCode } from "@/lib/taxcode";

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

export default function TaxCodeChecker() {
  const [taxCode, setTaxCode] = useState("1257L");
  const [salary, setSalary] = useState("30000");

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () => checkTaxCode(taxCode, salaryNumber > 0 ? salaryNumber : null),
    [taxCode, salaryNumber],
  );

  const stickyValue = !result.recognised
    ? "—"
    : result.kind === "no-tax"
      ? "No tax taken"
      : result.kind === "flat-rate"
        ? "No allowance"
        : result.allowance !== null
          ? gbp.format(result.allowance)
          : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="tc-code" className={labelClass}>
            Your tax code
          </label>
          <input
            id="tc-code"
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            className={inputClass}
            placeholder="1257L"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Exactly as it appears on your payslip or Tax Code Notice —
            for example 1257L, 1257L W1, BR, D0, NT, 0T, K475 or S1257L.
          </p>
        </div>
        <div>
          <label htmlFor="tc-salary" className={labelClass}>
            Your salary for the year (£, optional)
          </label>
          <input
            id="tc-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Add it to see how much more or less tax this code takes than
            the standard 1257L on the same pay.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {/* The verdict. */}
      <div className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-5 print:mt-0 print:border-slate-300 sm:p-6">
        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mb-4 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            HMRC tax code check — inputs used
          </p>
          <p>
            Tax code checked: {taxCode.trim() || "—"}
            {salaryNumber > 0
              ? ` · Salary entered: ${gbp.format(salaryNumber)} a year`
              : " · No salary entered"}
            .
          </p>
        </div>

        {!result.recognised ? (
          <div className="space-y-2">
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              We could not read that as a UK tax code
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {result.comparisonNote ??
                "Check the code on your latest payslip or Tax Code Notice and enter it exactly as printed."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-slate-800 pb-4 dark:border-slate-200">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {result.display}
              </p>
              {result.kind === "no-tax" ? (
                <p className="text-lg font-semibold text-brand-800 dark:text-brand-300">
                  No tax taken
                </p>
              ) : result.kind === "flat-rate" ? (
                <p className="text-lg font-semibold text-brand-800 dark:text-brand-300">
                  No tax-free allowance
                </p>
              ) : result.allowance !== null ? (
                <p className="text-lg font-semibold text-brand-800 dark:text-brand-300">
                  {gbp.format(result.allowance)} tax-free
                </p>
              ) : null}
            </div>

            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-900 dark:text-slate-50">
              {result.headline}
            </p>

            <dl className="space-y-2">
              {result.parts.map((part) => (
                <div
                  key={part.name}
                  className="grid gap-0.5 sm:grid-cols-[7rem_1fr] sm:gap-3"
                >
                  <dt className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    {part.name}
                  </dt>
                  <dd className="max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {part.meaning}
                  </dd>
                </div>
              ))}
            </dl>

            {result.taxUnderCode !== null &&
              result.taxUnderStandard !== null &&
              result.differencePerYear !== null &&
              result.differencePerMonth !== null &&
              result.salary !== null && (
                <div className="rounded-lg bg-brand-50 px-4 py-3 dark:bg-brand-900/30">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">
                    On a salary of {gbp.format(result.salary)}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <p className="flex flex-wrap justify-between gap-2">
                      <span>Income Tax under {result.display}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {gbp.format(result.taxUnderCode)} a year
                      </span>
                    </p>
                    <p className="flex flex-wrap justify-between gap-2">
                      <span>Income Tax under the standard 1257L</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {gbp.format(result.taxUnderStandard)} a year
                      </span>
                    </p>
                    <p className="flex flex-wrap justify-between gap-2 border-t border-brand-100 pt-1 dark:border-brand-900">
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {result.differencePerYear > 0
                          ? "Extra tax this code takes"
                          : result.differencePerYear < 0
                            ? "Tax this code saves"
                            : "Difference"}
                      </span>
                      <span className="font-bold text-brand-800 dark:text-brand-300">
                        {result.differencePerYear === 0
                          ? "£0 — the same"
                          : `${gbp.format(Math.abs(result.differencePerYear))} a year (${gbp.format(Math.abs(result.differencePerMonth))} a month)`}
                      </span>
                    </p>
                  </div>
                  {result.emergencyBasis && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Emergency codes tax each pay day on its own, so
                      individual payslips — especially the first ones —
                      can come out higher or lower than this steady-year
                      figure; the year usually evens out once HMRC puts
                      you on a cumulative code.
                    </p>
                  )}
                </div>
              )}

            {result.comparisonNote && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {result.comparisonNote}
              </p>
            )}

            {result.flags.length > 0 && (
              <div className="space-y-3">
                {result.flags.map((flag) => (
                  <div
                    key={flag.title}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      {flag.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/80">
                      {flag.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PrintButton />

      <StickyResultBar label="Tax-free allowance" value={stickyValue} />
    </div>
  );
}
