"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateEmployerCost } from "@/lib/employerCost";
import {
  EMPLOYER_NI,
  EMPLOYER_NI_RATES_LABEL,
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
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type SalaryPeriod = "annual" | "monthly";

export default function EmployerCostCalculator() {
  const [period, setPeriod] = useState<SalaryPeriod>("annual");
  const [salary, setSalary] = useState("30000");
  const [pensionPercent, setPensionPercent] = useState("3");
  const [otherCosts, setOtherCosts] = useState("0");

  const salaryNumber = parseAmount(salary);
  const annualSalary = period === "annual" ? salaryNumber : salaryNumber * 12;
  const pensionNumber = Math.min(100, Math.max(0, parseAmount(pensionPercent)));
  const otherNumber = parseAmount(otherCosts);

  const result = useMemo(
    () =>
      calculateEmployerCost({
        annualGrossSalary: annualSalary,
        employerPensionPercent: pensionNumber,
        otherEmployerCostsAnnual: otherNumber,
      }),
    [annualSalary, pensionNumber, otherNumber],
  );

  const ratePercent = EMPLOYER_NI.rate * 100;
  const minimumPercent = PENSION.employerMinimumRate * 100;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ec-salary" className={labelClass}>
            Employee&apos;s gross salary (£)
          </label>
          <div className="flex gap-2">
            <input
              id="ec-salary"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={inputClass}
            />
            <select
              id="ec-period"
              aria-label="Salary period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as SalaryPeriod)}
              className={inputClass}
            >
              <option value="annual">per year</option>
              <option value="monthly">per month</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gross pay before tax and National Insurance.
            {period === "monthly"
              ? ` That is ${gbp.format(annualSalary)} a year.`
              : ""}
          </p>
        </div>

        <div>
          <label htmlFor="ec-pension" className={labelClass}>
            Employer pension contribution (% of qualifying earnings)
          </label>
          <input
            id="ec-pension"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={pensionPercent}
            onChange={(e) => setPensionPercent(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The auto-enrolment minimum is {minimumPercent}%. Qualifying
            earnings are the slice of the salary between{" "}
            {gbp.format(PENSION.qualifyingEarningsLowerAnnual)} and{" "}
            {gbp.format(PENSION.qualifyingEarningsUpperAnnual)} a year.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="ec-other" className={labelClass}>
            Other employer costs (£ per year — optional)
          </label>
          <input
            id="ec-other"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Anything else this employee costs you each year — benefits,
            insurance, equipment, software seats — added exactly as
            entered.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Total cost of employing
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Employer cost calculation — inputs used
          </p>
          <p>
            Gross salary: {gbp.format(salaryNumber)}{" "}
            {period === "annual" ? "per year" : "per month"} (
            {gbp.format(annualSalary)} a year) · Employer pension:{" "}
            {pensionNumber}% of qualifying earnings · Other employer
            costs: {gbp.format(otherNumber)} a year.
          </p>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.totalCostPerYear)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            per year
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {gbp.format(result.totalCostPerMonth)} per month — a{" "}
          {gbp.format(result.annualGrossSalary)} salary really costs{" "}
          {gbp.format(result.totalCostPerYear)}.
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Gross salary: </dt>
            <dd className="inline">
              {gbp.format(result.annualGrossSalary)} per year.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              Employer National Insurance:{" "}
            </dt>
            <dd className="inline">
              {gbp.format(result.earningsAboveThreshold)} above the{" "}
              {gbp.format(result.thresholdApplied)} Secondary Threshold ×{" "}
              {ratePercent}% = {gbp.format(result.employerNiPerYear)} per
              year ({gbp.format(result.employerNiPerMonth)} per month).
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Employer pension: </dt>
            <dd className="inline">
              qualifying earnings of{" "}
              {gbp.format(result.qualifyingEarnings)} (the salary slice
              between {gbp.format(PENSION.qualifyingEarningsLowerAnnual)}{" "}
              and {gbp.format(PENSION.qualifyingEarningsUpperAnnual)}) ×{" "}
              {pensionNumber}% = {gbp.format(result.employerPensionPerYear)}{" "}
              per year ({gbp.format(result.employerPensionPerMonth)} per
              month).
            </dd>
          </div>
          {otherNumber > 0 && (
            <div>
              <dt className="inline font-medium">Other employer costs: </dt>
              <dd className="inline">
                {gbp.format(result.otherCostsPerYear)} per year (
                {gbp.format(result.otherCostsPerMonth)} per month), as
                entered.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">The cost on top: </dt>
            <dd className="inline">
              {gbp.format(result.onCostsPerYear)} a year on top of the
              salary — {result.costUpliftPercent.toFixed(2)}% more than
              the headline salary.
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Rates used: employer Class 1 rate {ratePercent}% above the{" "}
          {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)}-a-year
          Secondary Threshold ({EMPLOYER_NI_RATES_LABEL}); pension band{" "}
          {PENSION_RATES_LABEL}.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Total employer cost"
        value={`${gbp.format(result.totalCostPerYear)} per year`}
      />
    </div>
  );
}
