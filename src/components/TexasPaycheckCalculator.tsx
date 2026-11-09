"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateTexasPaycheck,
  FILING_STATUSES,
  PAY_FREQUENCIES,
  TAX_YEAR,
} from "@/lib/texas-paycheck";
import type { UsFilingStatus, UsPayFrequency } from "@/lib/texas-paycheck";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function TexasPaycheckCalculator() {
  const [payType, setPayType] = useState<"salary" | "hourly">("salary");
  const [annualSalary, setAnnualSalary] = useState("60000");
  const [hourlyRate, setHourlyRate] = useState("25");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [frequency, setFrequency] = useState<UsPayFrequency>("biweekly");
  const [filingStatus, setFilingStatus] = useState<UsFilingStatus>("single");
  const [dependentCredits, setDependentCredits] = useState("0");
  const [preTax, setPreTax] = useState("0");

  const result = useMemo(
    () =>
      calculateTexasPaycheck({
        payType,
        annualSalary: parseAmount(annualSalary),
        hourlyRate: parseAmount(hourlyRate),
        hoursPerWeek: parseAmount(hoursPerWeek),
        frequency,
        filingStatus,
        dependentCreditsAnnual: parseAmount(dependentCredits),
        preTaxPerPeriod: parseAmount(preTax),
      }),
    [
      payType,
      annualSalary,
      hourlyRate,
      hoursPerWeek,
      frequency,
      filingStatus,
      dependentCredits,
      preTax,
    ],
  );

  const frequencyMeta =
    PAY_FREQUENCIES.find((f) => f.id === frequency) ?? PAY_FREQUENCIES[1];
  const statusLabel =
    FILING_STATUSES.find((s) => s.id === filingStatus)?.label ?? "Single";
  const noPay = result.grossAnnual <= 0;

  const lines: { label: string; perPeriod: number; annual: number }[] = [
    { label: "Gross pay", perPeriod: result.grossPerPeriod, annual: result.grossAnnual },
    ...(result.preTaxAnnual > 0
      ? [
          {
            label: "Pre-tax deductions (for example a 401(k))",
            perPeriod: -result.preTaxPerPeriod,
            annual: -result.preTaxAnnual,
          },
        ]
      : []),
    {
      label: "Federal income tax withheld",
      perPeriod: -result.federalPerPeriod,
      annual: -result.federalAnnual,
    },
    {
      label: "Social Security (6.2%)",
      perPeriod: -result.socialSecurityPerPeriod,
      annual: -result.socialSecurityAnnual,
    },
    {
      label: "Medicare (1.45%)",
      perPeriod: -result.medicarePerPeriod,
      annual: -result.medicareAnnual,
    },
    {
      label: "Texas state income tax",
      perPeriod: 0,
      annual: 0,
    },
  ];

  const stickyValue =
    result.grossAnnual > 0
      ? `${fmtMoney(result.netPerPeriod)} net per ${frequencyMeta.periodName}`
      : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="tx-paytype" className={labelClass}>
            How are you paid?
          </label>
          <select
            id="tx-paytype"
            value={payType}
            onChange={(e) => setPayType(e.target.value as "salary" | "hourly")}
            className={inputClass}
          >
            <option value="salary">An annual salary</option>
            <option value="hourly">An hourly rate</option>
          </select>
        </div>

        {payType === "salary" ? (
          <div>
            <label htmlFor="tx-salary" className={labelClass}>
              Annual salary ($)
            </label>
            <input
              id="tx-salary"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="tx-rate" className={labelClass}>
                Hourly rate ($)
              </label>
              <input
                id="tx-rate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="tx-hours" className={labelClass}>
                Hours per week
              </label>
              <input
                id="tx-hours"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="tx-frequency" className={labelClass}>
            Pay frequency
          </label>
          <select
            id="tx-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as UsPayFrequency)}
            className={inputClass}
          >
            {PAY_FREQUENCIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-status" className={labelClass}>
            Filing status (Form W-4, Step 1)
          </label>
          <select
            id="tx-status"
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as UsFilingStatus)}
            className={inputClass}
          >
            {FILING_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Worked out on the standard withholding schedule — the W-4
            Step 2 box is treated as not checked, which is how most
            payroll is set up for one job.
          </p>
        </div>

        <div>
          <label htmlFor="tx-credits" className={labelClass}>
            Dependent credits — W-4 Step 3 total ($ per year)
          </label>
          <input
            id="tx-credits"
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={dependentCredits}
            onChange={(e) => setDependentCredits(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The annual amount from Step 3 of your Form W-4 — usually
            $2,000 per dependent under 17 and $500 per other
            dependent. It comes straight off the federal tax withheld.
          </p>
        </div>

        <div>
          <label htmlFor="tx-pretax" className={labelClass}>
            Other pre-tax deductions ($ per pay period)
          </label>
          <input
            id="tx-pretax"
            type="number"
            inputMode="decimal"
            min="0"
            step="10"
            value={preTax}
            onChange={(e) => setPreTax(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            For example a traditional 401(k) contribution. Pre-tax
            deductions lower the federal income tax withheld, but
            Social Security and Medicare are still figured on the
            full gross pay.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noPay && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter a salary — or an hourly rate and your hours per week —
          to see your Texas paycheck figures.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your Texas paycheck
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Texas paycheck calculation — inputs used
          </p>
          <p>
            {payType === "salary"
              ? `Salary: ${fmtMoney(parseAmount(annualSalary))} a year`
              : `Hourly: ${fmtMoney(parseAmount(hourlyRate))} an hour × ${parseAmount(hoursPerWeek)} hours a week`}
            {" · "}Pay frequency: {frequencyMeta.label}
            {" · "}Filing status: {statusLabel}
            {" · "}W-4 Step 3 credits: {fmtMoney(parseAmount(dependentCredits))} a year
            {" · "}Pre-tax deductions: {fmtMoney(parseAmount(preTax))} per period
            {" · "}Tax year: {TAX_YEAR}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.netPerPeriod)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            net pay per {frequencyMeta.periodName} ·{" "}
            {fmtMoney(result.netAnnual)} a year
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Effective tax rate: {result.effectiveTaxRatePercent.toFixed(2)}% —
          that is federal income tax, Social Security and Medicare
          together as a share of gross pay. Texas state income tax:{" "}
          <strong>$0.00</strong> — Texas has no state income tax.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-brand-200 dark:border-brand-800">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Line
                </th>
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Per {frequencyMeta.periodName}
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {lines.map((line) => (
                <tr key={line.label}>
                  <td className="py-2 pr-3">{line.label}</td>
                  <td className="py-2 pr-3">
                    {line.perPeriod < 0
                      ? `−${fmtMoney(-line.perPeriod)}`
                      : fmtMoney(line.perPeriod)}
                  </td>
                  <td className="py-2">
                    {line.annual < 0
                      ? `−${fmtMoney(-line.annual)}`
                      : fmtMoney(line.annual)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold text-slate-900 dark:text-slate-50">
                <td className="py-2 pr-3">Total deductions</td>
                <td className="py-2 pr-3">
                  −{fmtMoney(result.totalDeductionsPerPeriod)}
                </td>
                <td className="py-2">
                  −{fmtMoney(result.totalDeductionsAnnual)}
                </td>
              </tr>
              <tr className="font-bold text-brand-800 dark:text-brand-300">
                <td className="py-2 pr-3">Net pay</td>
                <td className="py-2 pr-3">{fmtMoney(result.netPerPeriod)}</td>
                <td className="py-2">{fmtMoney(result.netAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar label="Texas net pay" value={stickyValue} />
    </div>
  );
}
