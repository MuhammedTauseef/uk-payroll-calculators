"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateOvertime,
  NMW_BANDS,
  OVERTIME_PRESETS,
} from "@/lib/overtime";
import type { NmwAgeBand, OvertimeRateBasis } from "@/lib/overtime";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * An hourly rate for display: rounded to at most 4 decimal places
 * with trailing zeros trimmed (£12.21, £18.315, £15.3846) — enough
 * precision that a reader checking rate × hours on a calculator
 * lands on the printed pay line after penny rounding.
 */
function fmtRate(n: number): string {
  const r = Math.round((n + Number.EPSILON) * 10000) / 10000;
  return `£${r.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function fmtHours(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, "")} hours`;
}

function fmtMultiplier(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, "")}×`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

const CUSTOM = "custom";

export default function OvertimeCalculator() {
  const [basis, setBasis] = useState<OvertimeRateBasis>("hourly");

  // Hourly-rate inputs.
  const [hourlyRate, setHourlyRate] = useState("12.21");

  // Salary inputs (the hourly rate is derived from these).
  const [annualSalary, setAnnualSalary] = useState("30000");
  const [contractedHours, setContractedHours] = useState("37.5");

  // Hours and overtime rate.
  const [normalHours, setNormalHours] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("10");
  const [preset, setPreset] = useState<string>("1.5");
  const [customMultiplier, setCustomMultiplier] = useState("1.75");

  // National Minimum Wage check.
  const [ageBand, setAgeBand] = useState<NmwAgeBand>("over21");

  const hourlyRateNumber = parseAmount(hourlyRate);
  const salaryNumber = parseAmount(annualSalary);
  const contractedHoursNumber = parseAmount(contractedHours);
  const normalHoursNumber = parseAmount(normalHours);
  const overtimeHoursNumber = parseAmount(overtimeHours);
  const multiplierNumber =
    preset === CUSTOM ? parseAmount(customMultiplier) : Number(preset);

  const result = useMemo(
    () =>
      calculateOvertime({
        basis,
        hourlyRate: hourlyRateNumber,
        annualSalary: salaryNumber,
        contractedHoursPerWeek: contractedHoursNumber,
        normalHours: normalHoursNumber,
        overtimeHours: overtimeHoursNumber,
        multiplier: multiplierNumber,
        ageBand,
      }),
    [
      basis,
      hourlyRateNumber,
      salaryNumber,
      contractedHoursNumber,
      normalHoursNumber,
      overtimeHoursNumber,
      multiplierNumber,
      ageBand,
    ],
  );

  const bandLabel =
    NMW_BANDS.find((b) => b.id === ageBand)?.label ?? "21 and over";
  const nmwFailed = result.nmwPass === false;
  const noRate = result.hourlyRate <= 0;

  const stickyValue =
    result.totalHours > 0 ? `${fmtMoney(result.totalPay)} total pay` : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ot-basis" className={labelClass}>
            How is the pay worked out?
          </label>
          <select
            id="ot-basis"
            value={basis}
            onChange={(e) => setBasis(e.target.value as OvertimeRateBasis)}
            className={inputClass}
          >
            <option value="hourly">An hourly rate</option>
            <option value="salary">
              A salary — work my hourly rate out for me
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Salaried staff have an hourly rate too once the salary is
            split over the contracted hours — that is the rate overtime
            and the minimum wage check run on.
          </p>
        </div>

        {basis === "hourly" ? (
          <div>
            <label htmlFor="ot-rate" className={labelClass}>
              Hourly rate (£)
            </label>
            <input
              id="ot-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="ot-salary" className={labelClass}>
                Annual salary (£)
              </label>
              <input
                id="ot-salary"
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ot-contracted" className={labelClass}>
                Contracted hours per week
              </label>
              <input
                id="ot-contracted"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={contractedHours}
                onChange={(e) => setContractedHours(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The hours the salary covers — the rate is the salary ÷
                52 weeks ÷ these hours.
              </p>
            </div>
          </>
        )}

        <div>
          <label htmlFor="ot-normal" className={labelClass}>
            Normal hours in the period
          </label>
          <input
            id="ot-normal"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={normalHours}
            onChange={(e) => setNormalHours(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            One pay period at a time — a week, or the hours in a
            monthly pay period.
          </p>
        </div>

        <div>
          <label htmlFor="ot-overtime" className={labelClass}>
            Overtime hours in the period
          </label>
          <input
            id="ot-overtime"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ot-preset" className={labelClass}>
            Overtime rate (from the contract)
          </label>
          <select
            id="ot-preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className={inputClass}
          >
            {OVERTIME_PRESETS.map((p) => (
              <option key={p.multiplier} value={String(p.multiplier)}>
                {p.label}
              </option>
            ))}
            <option value={CUSTOM}>Custom rate…</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            There is no legal right to an overtime premium — the rate
            is whatever the contract says, and overtime can lawfully be
            flat or even unpaid. The contract is the first place to
            check.
          </p>
        </div>

        {preset === CUSTOM && (
          <div>
            <label htmlFor="ot-custom" className={labelClass}>
              Custom multiplier (× the hourly rate)
            </label>
            <input
              id="ot-custom"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter 0 for unpaid overtime — the minimum wage check
              below is the one that catches that.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="ot-band" className={labelClass}>
            Age band (for the minimum wage check)
          </label>
          <select
            id="ot-band"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as NmwAgeBand)}
            className={inputClass}
          >
            {NMW_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} — {fmtMoney(b.rate)} an hour
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noRate && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter an hourly rate
          {basis === "salary"
            ? " — a salary and the contracted hours per week"
            : ""}{" "}
          to see your overtime pay figures.
        </p>
      )}

      {nmwFailed && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          On these figures the average pay for the hours worked falls
          below the National Minimum Wage for this age band. Average
          pay must not fall below the minimum across the pay reference
          period — if this matches a real payslip, it is worth raising
          with the employer or Acas.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your overtime pay
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Overtime calculation — inputs used
          </p>
          <p>
            {basis === "salary"
              ? `Salary: ${fmtMoney(salaryNumber)} a year over ${contractedHoursNumber} contracted hours a week (hourly rate ${fmtRate(result.hourlyRate)})`
              : `Hourly rate: ${fmtRate(result.hourlyRate)}`}
            {" · "}Normal hours: {normalHoursNumber}
            {" · "}Overtime hours: {overtimeHoursNumber} at{" "}
            {fmtMultiplier(multiplierNumber)}
            {" · "}Minimum wage band: {bandLabel} ({fmtMoney(result.nmwRate)}{" "}
            an hour).
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.totalPay)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            total pay for the period
          </span>
        </p>
        {result.effectiveHourlyRate !== null && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {fmtRate(result.effectiveHourlyRate)} an hour on average over{" "}
            {fmtHours(result.totalHours)}
          </p>
        )}

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Hourly rate: </dt>
            <dd className="inline">
              {basis === "salary" ? (
                <>
                  {fmtMoney(salaryNumber)} a year ÷ 52 weeks ÷{" "}
                  {contractedHoursNumber} hours ={" "}
                  {fmtRate(result.hourlyRate)} an hour.
                </>
              ) : (
                <>{fmtRate(result.hourlyRate)} an hour.</>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Normal pay: </dt>
            <dd className="inline">
              {fmtHours(normalHoursNumber)} × {fmtRate(result.hourlyRate)} ={" "}
              <strong>{fmtMoney(result.normalPay)}</strong>.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Overtime pay: </dt>
            <dd className="inline">
              {fmtHours(overtimeHoursNumber)} × {fmtRate(result.hourlyRate)} ×{" "}
              {fmtMultiplier(multiplierNumber)} ={" "}
              <strong>{fmtMoney(result.overtimePay)}</strong> (overtime rate{" "}
              {fmtRate(result.overtimeHourlyRate)} an hour).
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Total pay: </dt>
            <dd className="inline">
              {fmtMoney(result.normalPay)} + {fmtMoney(result.overtimePay)} ={" "}
              <strong>{fmtMoney(result.totalPay)}</strong>.
            </dd>
          </div>
          {result.effectiveHourlyRate !== null && (
            <div>
              <dt className="inline font-medium">Average hourly rate: </dt>
              <dd className="inline">
                {fmtMoney(result.totalPay)} ÷ {fmtHours(result.totalHours)} ={" "}
                {fmtRate(result.effectiveHourlyRate)} an hour — the figure
                the minimum wage floor is tested against.
              </dd>
            </div>
          )}
          {result.nmwPass !== null && (
            <div>
              <dt className="inline font-medium">Minimum wage check: </dt>
              <dd className="inline">
                {result.nmwPass ? (
                  <>
                    <strong>Passes.</strong>{" "}
                    {fmtRate(result.effectiveHourlyRate ?? 0)} an hour is at
                    or above the {fmtMoney(result.nmwRate)} minimum for{" "}
                    {bandLabel.toLowerCase()}.
                  </>
                ) : (
                  <>
                    <strong>Below the floor.</strong>{" "}
                    {fmtRate(result.effectiveHourlyRate ?? 0)} an hour is{" "}
                    {fmtMoney(result.nmwShortfallPerHour ?? 0)} an hour below
                    the {fmtMoney(result.nmwRate)} minimum for{" "}
                    {bandLabel.toLowerCase()} — average pay for the total
                    hours worked must not fall below the National Minimum
                    Wage.
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>

        <PrintButton />
      </div>
      <StickyResultBar label="Overtime pay" value={stickyValue} />
    </div>
  );
}
