"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateStudentLoan,
  STUDENT_LOAN_PLANS,
  type StudentLoanPlanId,
} from "@/lib/student-loan";

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

export default function StudentLoanCalculator() {
  const [income, setIncome] = useState("35000");
  const [plan, setPlan] = useState<StudentLoanPlanId>("plan2");
  const [pgToo, setPgToo] = useState(false);

  const incomeValue = parseAmount(income);
  const result = useMemo(
    () =>
      calculateStudentLoan({
        annualIncome: incomeValue,
        undergraduatePlan: plan === "postgraduate" ? null : plan,
        hasPostgraduateLoan: plan === "postgraduate" ? true : pgToo,
      }),
    [incomeValue, plan, pgToo],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="sl-income" className={labelClass}>
            Your gross annual income (£)
          </label>
          <input
            id="sl-income"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Salary before tax, including bonuses and overtime — the
            figure repayments are charged on.
          </p>
        </div>

        <div>
          <label htmlFor="sl-plan" className={labelClass}>
            Your student loan plan
          </label>
          <select
            id="sl-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as StudentLoanPlanId)}
            className={inputClass}
          >
            {STUDENT_LOAN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — repay over {gbp.format(p.annualThreshold)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Not sure? Plan 2 covers most English and Welsh students
            who started between 2012 and 2023; Plan 5 started in 2023.
          </p>
        </div>

        {plan !== "postgraduate" && (
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pgToo}
                onChange={(e) => setPgToo(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
              />
              <span>
                I also have a Postgraduate Loan — repay that at the
                same time (6% of income over £21,000, on top of the
                plan above)
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.totalMonthly)} a month
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {gbp.format(result.totalAnnual)} a year —{" "}
          {result.shareOfIncomePercent}% of your gross income
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {result.undergraduateThreshold !== null && (
                <tr>
                  <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                    Undergraduate plan repayment
                  </td>
                  <td className="py-2">
                    {gbp.format(result.undergraduateAnnual)} a year
                  </td>
                </tr>
              )}
              {result.postgraduateAnnual > 0 && (
                <tr>
                  <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                    Postgraduate Loan repayment
                  </td>
                  <td className="py-2">
                    {gbp.format(result.postgraduateAnnual)} a year
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income the repayment is charged on
                </td>
                <td className="py-2">{gbp.format(incomeValue)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Total repayment
                </td>
                <td className="py-2">
                  {gbp.format(result.totalAnnual)} a year ·{" "}
                  {gbp.format(result.totalMonthly)} a month
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The size of your loan balance makes no difference to the
            repayment — it is a percentage of income over the
            threshold, not a share of the debt. Below the threshold,
            nothing is taken.
          </p>
          <p>
            Through payroll the deduction is worked out on each
            period&apos;s pay against the monthly threshold, so a
            month with a bonus takes more; the annual figures here
            are the year&apos;s equivalent on a steady income.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Student loan repayment per month"
        value={gbp.format(result.totalMonthly)}
      />
    </div>
  );
}
