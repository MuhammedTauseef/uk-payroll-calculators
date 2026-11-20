"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import ResultDonut, { DONUT_COLORS } from "@/components/ResultDonut";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculatePayRise, type PayRiseMode } from "@/lib/pay-rise";
import type { StudentLoanPlanId } from "@/lib/student-loan";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function signed(value: number): string {
  if (value > 0) return `+${gbp.format(value)}`;
  return gbp.format(value);
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type LoanChoice = "none" | StudentLoanPlanId;

export default function PayRiseCalculator() {
  const [salary, setSalary] = useState("35000");
  const [mode, setMode] = useState<PayRiseMode>("percent");
  const [percent, setPercent] = useState("5");
  const [amount, setAmount] = useState("2000");
  const [target, setTarget] = useState("38000");
  const [hours, setHours] = useState("37.5");
  const [pension, setPension] = useState("0");
  const [loan, setLoan] = useState<LoanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  const reset = () => {
    setSalary("35000");
    setMode("percent");
    setPercent("5");
    setAmount("2000");
    setTarget("38000");
    setHours("37.5");
    setPension("0");
    setLoan("none");
    setPgToo(false);
  };

  const result = useMemo(
    () =>
      calculatePayRise({
        currentSalary: parseAmount(salary),
        mode,
        risePercent: parseAmount(percent),
        riseAmount: parseAmount(amount),
        targetSalary: parseAmount(target),
        hoursPerWeek: parseAmount(hours),
        pensionPercent: parseAmount(pension),
        studentLoanPlan: loan === "none" ? null : loan,
        postgraduateLoanToo: pgToo,
      }),
    [salary, mode, percent, amount, target, hours, pension, loan, pgToo],
  );

  const showDonut =
    result.grossRiseAnnual > 0 && result.keepPercent !== null;
  const donutSegments = showDonut
    ? [
        {
          label: "Extra take-home pay",
          value: Math.max(0, result.netRiseAnnual),
          displayValue: gbp.format(result.netRiseAnnual),
          color: DONUT_COLORS.deep,
        },
        ...(result.extraIncomeTax > 0
          ? [
              {
                label: "Extra Income Tax",
                value: result.extraIncomeTax,
                displayValue: gbp.format(result.extraIncomeTax),
                color: DONUT_COLORS.accent,
              },
            ]
          : []),
        ...(result.extraNationalInsurance > 0
          ? [
              {
                label: "Extra National Insurance",
                value: result.extraNationalInsurance,
                displayValue: gbp.format(result.extraNationalInsurance),
                color: DONUT_COLORS.light,
              },
            ]
          : []),
        ...(result.extraPension + result.extraStudentLoan > 0
          ? [
              {
                label: "Extra pension & student loan",
                value: result.extraPension + result.extraStudentLoan,
                displayValue: gbp.format(
                  result.extraPension + result.extraStudentLoan,
                ),
                color: DONUT_COLORS.pale,
              },
            ]
          : []),
      ]
    : [];

  const rows: { label: string; now: string; after: string; diff: string }[] = [
    {
      label: "Gross pay",
      now: gbp.format(result.current.grossAnnual),
      after: gbp.format(result.updated.grossAnnual),
      diff: signed(result.grossRiseAnnual),
    },
    {
      label: "Income Tax",
      now: gbp.format(result.current.incomeTaxAnnual),
      after: gbp.format(result.updated.incomeTaxAnnual),
      diff: signed(result.extraIncomeTax),
    },
    {
      label: "National Insurance",
      now: gbp.format(result.current.employeeNiAnnual),
      after: gbp.format(result.updated.employeeNiAnnual),
      diff: signed(result.extraNationalInsurance),
    },
    {
      label: "Pension contributions",
      now: gbp.format(result.current.pensionAnnual),
      after: gbp.format(result.updated.pensionAnnual),
      diff: signed(result.extraPension),
    },
    {
      label: "Student loan repayments",
      now: gbp.format(result.current.studentLoanAnnual),
      after: gbp.format(result.updated.studentLoanAnnual),
      diff: signed(result.extraStudentLoan),
    },
    {
      label: "Take-home pay",
      now: gbp.format(result.current.netAnnual),
      after: gbp.format(result.updated.netAnnual),
      diff: signed(result.netRiseAnnual),
    },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <MoneySlider
          id="pr-salary"
          label="Current salary (£ a year)"
          value={salary}
          onChange={setSalary}
          min={0}
          max={200000}
          step={500}
        />
        <div>
          <label htmlFor="pr-mode" className={labelClass}>
            How is the rise given?
          </label>
          <select
            id="pr-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as PayRiseMode)}
            className={inputClass}
          >
            <option value="percent">A percentage rise</option>
            <option value="amount">A flat amount</option>
            <option value="target">A target salary</option>
          </select>
        </div>

        {mode === "percent" && (
          <MoneySlider
            id="pr-percent"
            label="Pay rise (%)"
            value={percent}
            onChange={setPercent}
            min={0}
            max={30}
            step={0.5}
            hint="The percentage in your offer letter — 5% is a common annual rise."
          />
        )}
        {mode === "amount" && (
          <MoneySlider
            id="pr-amount"
            label="Pay rise amount (£ a year)"
            value={amount}
            onChange={setAmount}
            min={0}
            max={30000}
            step={100}
            hint="The extra gross pay a year, before tax — not the monthly figure."
          />
        )}
        {mode === "target" && (
          <MoneySlider
            id="pr-target"
            label="Target salary (£ a year)"
            value={target}
            onChange={setTarget}
            min={0}
            max={200000}
            step={500}
            hint="The new salary you have been offered or are negotiating towards."
          />
        )}

        <div>
          <label htmlFor="pr-hours" className={labelClass}>
            Hours worked per week
          </label>
          <input
            id="pr-hours"
            type="number"
            inputMode="decimal"
            min="0"
            max="168"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Only used for the hourly figures — 37.5 is a common
            full-time week.
          </p>
        </div>
        <div>
          <label htmlFor="pr-pension" className={labelClass}>
            Your pension contribution (% of pay)
          </label>
          <input
            id="pr-pension"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.5"
            value={pension}
            onChange={(e) => setPension(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Modelled as a net-pay arrangement, like most workplace
            pensions: it comes off before Income Tax, not before
            National Insurance. Leave at 0 to see the rise before
            pension.
          </p>
        </div>
        <div>
          <label htmlFor="pr-loan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="pr-loan"
            value={loan}
            onChange={(e) => setLoan(e.target.value as LoanChoice)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4 (Scotland)</option>
            <option value="plan5">Plan 5</option>
            <option value="postgraduate">Postgraduate Loan only</option>
          </select>
          {loan !== "none" && loan !== "postgraduate" && (
            <label className="mt-2 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pgToo}
                onChange={(e) => setPgToo(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              I also have a Postgraduate Loan
            </label>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result — the rise after tax
        </h2>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {signed(result.netRiseMonthly)} a month
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          extra take-home pay — {signed(result.netRiseAnnual)} a year.
          The gross rise is {gbp.format(result.grossRiseAnnual)} a year
          ({result.impliedRisePercent}% on{" "}
          {gbp.format(result.currentGrossAnnual)})
          {result.keepPercent !== null && (
            <>
              , and you keep {result.keepPercent}% of it after Income
              Tax, National Insurance
              {result.extraPension > 0 || parseAmount(pension) > 0
                ? ", pension"
                : ""}
              {result.extraStudentLoan > 0 ? " and student loan" : ""}.
            </>
          )}
        </p>

        <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            New salary: {gbp.format(result.newGrossAnnual)} a year —{" "}
            {gbp.format(result.newGrossMonthly)} a month,{" "}
            {gbp.format(result.newGrossWeekly)} a week,{" "}
            {gbp.format(result.newGrossHourly)} an hour at{" "}
            {parseAmount(hours)} hours a week. New take-home:{" "}
            {gbp.format(result.newNetMonthly)} a month (
            {gbp.format(result.newNetAnnual)} a year).
          </p>
          {result.personalAllowanceAfter <
            result.personalAllowanceBefore && (
            <p>
              Watch out: this rise takes you over £100,000, so your
              Personal Allowance falls from{" "}
              {gbp.format(result.personalAllowanceBefore)} to{" "}
              {gbp.format(result.personalAllowanceAfter)} — you lose
              £1 of allowance for every £2 earned over £100,000, which
              is why so little of this rise survives.
            </p>
          )}
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  A year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Now
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  After the rise
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2 font-medium">{r.label}</td>
                  <td className="px-4 py-2">{r.now}</td>
                  <td className="px-4 py-2">{r.after}</td>
                  <td className="px-4 py-2">{r.diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDonut && (
          <ResultDonut
            segments={donutSegments}
            centerLabel="Of the rise, you keep"
            centerValue={`${result.keepPercent}%`}
          />
        )}

        <ResultActions
          image={{
            title: "Pay Rise",
            headline: `${signed(result.netRiseMonthly)} a month extra take-home`,
            headlineNote: `On a gross rise of ${gbp.format(result.grossRiseAnnual)} a year (${result.impliedRisePercent}%)`,
            rows: [
              {
                label: "Current salary",
                value: gbp.format(result.currentGrossAnnual),
              },
              {
                label: "New salary",
                value: gbp.format(result.newGrossAnnual),
              },
              {
                label: "Extra take-home a year",
                value: signed(result.netRiseAnnual),
              },
              {
                label: "Share of the rise you keep",
                value:
                  result.keepPercent !== null
                    ? `${result.keepPercent}%`
                    : "—",
              },
            ],
            fileName: "payrollcalc-pay-rise-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Extra take-home a month"
        value={signed(result.netRiseMonthly)}
      />
    </div>
  );
}
