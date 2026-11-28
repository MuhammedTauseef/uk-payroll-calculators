"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateMonthlySalary,
  type MonthlySalaryPeriod,
} from "@/lib/monthly-salary";
import type { StudentLoanPlanId } from "@/lib/student-loan";

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

type LoanChoice = "none" | StudentLoanPlanId;

const PERIOD_LABELS: Record<MonthlySalaryPeriod, string> = {
  monthly: "a month",
  annual: "a year",
  weekly: "a week",
};

export default function MonthlySalaryCalculator() {
  const [amount, setAmount] = useState("3000");
  const [period, setPeriod] = useState<MonthlySalaryPeriod>("monthly");
  const [pension, setPension] = useState("0");
  const [loan, setLoan] = useState<LoanChoice>("none");
  const [postgradToo, setPostgradToo] = useState(false);

  const reset = () => {
    setAmount("3000");
    setPeriod("monthly");
    setPension("0");
    setLoan("none");
    setPostgradToo(false);
  };

  const result = useMemo(
    () =>
      calculateMonthlySalary({
        amount: parseAmount(amount),
        period,
        pensionPercent: parseAmount(pension),
        studentLoanPlan: loan === "none" ? null : loan,
        postgraduateLoanToo: postgradToo && loan !== "none" && loan !== "postgraduate",
      }),
    [amount, period, pension, loan, postgradToo],
  );

  const rows: { label: string; monthly: number; annual: number }[] = [
    { label: "Gross pay", monthly: result.grossMonthly, annual: result.grossAnnual },
    ...(result.pensionAnnual > 0
      ? [{ label: "Pension contribution", monthly: -result.pensionMonthly, annual: -result.pensionAnnual }]
      : []),
    { label: "Income Tax", monthly: -result.incomeTaxMonthly, annual: -result.incomeTaxAnnual },
    { label: "National Insurance", monthly: -result.employeeNiMonthly, annual: -result.employeeNiAnnual },
    ...(result.studentLoanAnnual > 0
      ? [{ label: "Student loan repayment", monthly: -result.studentLoanMonthly, annual: -result.studentLoanAnnual }]
      : []),
    { label: "Take-home pay", monthly: result.netMonthly, annual: result.netAnnual },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ms-amount" className={labelClass}>
            Your gross pay (£)
          </label>
          <input
            id="ms-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The figure on your contract or job offer, before tax —
            enter it the way you know it.
          </p>
        </div>
        <div>
          <label htmlFor="ms-period" className={labelClass}>
            That figure is…
          </label>
          <select
            id="ms-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as MonthlySalaryPeriod)}
            className={inputClass}
          >
            <option value="monthly">Per month</option>
            <option value="annual">Per year</option>
            <option value="weekly">Per week</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You entered pay {PERIOD_LABELS[period]} — that is{" "}
            {gbp.format(result.grossAnnual)} a year.
          </p>
        </div>
        <div>
          <label htmlFor="ms-pension" className={labelClass}>
            Pension contribution (% of gross)
          </label>
          <input
            id="ms-pension"
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
            Modelled as a net-pay arrangement: it comes off before
            Income Tax, but not before National Insurance. Leave at
            0 if you have no pension.
          </p>
        </div>
        <div>
          <label htmlFor="ms-loan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="ms-loan"
            value={loan}
            onChange={(e) => setLoan(e.target.value as LoanChoice)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4 — Scotland (SAAS)</option>
            <option value="plan5">Plan 5</option>
            <option value="postgraduate">Postgraduate Loan</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Repayments are worked out on the plan&apos;s monthly
            threshold, as payroll does it.
          </p>
        </div>
        {loan !== "none" && loan !== "postgraduate" && (
          <div className="flex items-start gap-2">
            <input
              id="ms-pg"
              type="checkbox"
              checked={postgradToo}
              onChange={(e) => setPostgradToo(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
            />
            <label
              htmlFor="ms-pg"
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              I also repay a Postgraduate Loan on top (6% over
              £21,000 a year)
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your monthly take-home pay
        </h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netMonthly)}
          <span className="text-base font-semibold text-slate-600 dark:text-slate-300">
            {" "}
            a month
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {gbp.format(result.netAnnual)} a year ·{" "}
          {gbp.format(result.netWeekly)} a week ·{" "}
          {gbp.format(result.netDaily)} a working day — you keep{" "}
          {result.effectiveKeepPercent}% of your{" "}
          {gbp.format(result.grossMonthly)} gross monthly pay.
        </p>

        <table className="mt-4 w-full text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Each month</th>
              <th className="py-1 pr-2 font-medium">Per month</th>
              <th className="py-1 font-medium">Per year</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-t border-brand-100 dark:border-brand-900"
              >
                <td className="py-1 pr-2">{row.label}</td>
                <td className="py-1 pr-2">
                  {row.monthly < 0 ? "− " : ""}
                  {gbp.format(Math.abs(row.monthly))}
                </td>
                <td className="py-1">
                  {row.annual < 0 ? "− " : ""}
                  {gbp.format(Math.abs(row.annual))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ResultActions
          image={{
            title: "Monthly Take-Home Pay",
            headline: `${gbp.format(result.netMonthly)} a month`,
            headlineNote: `From ${gbp.format(result.grossMonthly)} gross a month, 2026/27 rates`,
            rows: [
              { label: "Gross pay (monthly)", value: gbp.format(result.grossMonthly) },
              { label: "Income Tax (monthly)", value: gbp.format(result.incomeTaxMonthly) },
              { label: "National Insurance (monthly)", value: gbp.format(result.employeeNiMonthly) },
              { label: "Take-home pay (monthly)", value: gbp.format(result.netMonthly) },
            ],
            fileName: "payrollcalc-monthly-salary-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Take-home pay"
        value={`${gbp.format(result.netMonthly)} a month`}
      />
    </div>
  );
}
