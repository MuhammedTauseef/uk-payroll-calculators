"use client";

import { useMemo, useState } from "react";
import { calculateEmployerNi } from "@/lib/employerNi";
import {
  EMPLOYER_NI,
  EMPLOYER_NI_RATES_LABEL,
  EMPLOYMENT_ALLOWANCE,
  PENSION,
  PENSION_RATES_LABEL,
} from "@/lib/rates";

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

type SalaryPeriod = "annual" | "monthly";

export default function EmployerNiCalculator() {
  const [period, setPeriod] = useState<SalaryPeriod>("annual");
  const [salary, setSalary] = useState("30000");
  const [category, setCategory] = useState<"standard" | "reduced">("standard");
  const [allowance, setAllowance] = useState(false);
  const [pension, setPension] = useState(false);

  const salaryNumber = parseAmount(salary);
  const annualSalary = period === "annual" ? salaryNumber : salaryNumber * 12;

  const result = useMemo(
    () =>
      calculateEmployerNi({
        annualGrossSalary: annualSalary,
        reducedRateCategory: category === "reduced",
        employmentAllowanceEligible: allowance,
        includeEmployerPension: pension,
      }),
    [annualSalary, category, allowance, pension],
  );

  const ratePercent = EMPLOYER_NI.rate * 100;
  const pensionPercent = PENSION.employerMinimumRate * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="salary" className={labelClass}>
            Employee&apos;s gross salary (£)
          </label>
          <div className="flex gap-2">
            <input
              id="salary"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={inputClass}
            />
            <select
              id="period"
              aria-label="Salary period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as SalaryPeriod)}
              className={inputClass}
            >
              <option value="annual">per year</option>
              <option value="monthly">per month</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Gross pay before tax and National Insurance.
            {period === "monthly"
              ? ` That is ${gbp.format(annualSalary)} a year.`
              : ""}
          </p>
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Employee category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as "standard" | "reduced")
            }
            className={inputClass}
          >
            <option value="standard">Standard (21 or over)</option>
            <option value="reduced">
              Under 21, or apprentice under 25
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Under-21s and younger apprentices attract a 0% employer rate up
            to {gbp.format(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)} a
            year.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={allowance}
              onChange={(e) => setAllowance(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <span>
              We claim the Employment Allowance (
              {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} a year off the
              employer NIC bill)
            </span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            The allowance comes off the employer&apos;s total NIC bill for
            the year, so for a single employee it covers their NICs until
            the {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} is used up.
            Most employers can claim; a company whose only employee is a
            director cannot.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={pension}
              onChange={(e) => setPension(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <span>
              Include employer pension contributions (auto-enrolment
              minimum: {pensionPercent}% of qualifying earnings)
            </span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Qualifying earnings are the slice of the salary between{" "}
            {gbp.format(PENSION.qualifyingEarningsLowerAnnual)} and{" "}
            {gbp.format(PENSION.qualifyingEarningsUpperAnnual)} a year.
            Many employers pay more than the minimum — this shows the
            legal minimum only. Pension figures: {PENSION_RATES_LABEL}.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Employer National Insurance cost
        </h3>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800">
          {gbp.format(result.employerNiPerYear)}
          <span className="text-base font-medium text-slate-600">
            {" "}
            per year
          </span>
        </p>
        <p className="text-sm text-slate-600">
          {gbp.format(result.employerNiPerMonth)} per month
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <dt className="inline font-medium">Earnings above the threshold: </dt>
            <dd className="inline">
              {gbp.format(result.annualGrossSalary)} salary −{" "}
              {gbp.format(result.thresholdApplied)}{" "}
              {category === "reduced"
                ? "upper secondary threshold for under-21s and apprentices under 25 (0% rate up to this level)"
                : "Secondary Threshold"}{" "}
              = {gbp.format(result.earningsAboveThreshold)}.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              NICs before the Employment Allowance:{" "}
            </dt>
            <dd className="inline">
              {gbp.format(result.earningsAboveThreshold)} × {ratePercent}% ={" "}
              {gbp.format(result.grossEmployerNi)} per year.
            </dd>
          </div>
          {allowance && (
            <div>
              <dt className="inline font-medium">Employment Allowance: </dt>
              <dd className="inline">
                −{gbp.format(result.employmentAllowanceApplied)} (up to{" "}
                {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} a year,
                never taking the bill below £0).
              </dd>
            </div>
          )}
          {pension && (
            <div>
              <dt className="inline font-medium">Employer pension: </dt>
              <dd className="inline">
                qualifying earnings of{" "}
                {gbp.format(result.qualifyingEarningsForPension)} (the
                salary slice between{" "}
                {gbp.format(PENSION.qualifyingEarningsLowerAnnual)} and{" "}
                {gbp.format(PENSION.qualifyingEarningsUpperAnnual)}) ×{" "}
                {pensionPercent}% ={" "}
                {gbp.format(result.employerPensionPerYear)} per year (
                {gbp.format(result.employerPensionPerMonth)} per month) —{" "}
                {PENSION_RATES_LABEL}.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">Total cost of employing: </dt>
            <dd className="inline">
              {gbp.format(result.annualGrossSalary)} salary +{" "}
              {gbp.format(result.employerNiPerYear)} employer NICs
              {pension
                ? ` + ${gbp.format(result.employerPensionPerYear)} employer pension`
                : ""}{" "}
              = {gbp.format(result.totalCostPerYear)} per year (
              {gbp.format(result.totalCostPerMonth)} per month)
              {pension
                ? ", before any other employment costs."
                : ", before pension contributions and any other employment costs."}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600">
          Rates used: employer Class 1 rate {ratePercent}% above the{" "}
          {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)}-a-year Secondary
          Threshold — {EMPLOYER_NI_RATES_LABEL}.
        </p>
      </div>
    </div>
  );
}
