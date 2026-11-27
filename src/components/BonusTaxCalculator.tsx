"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateBonus, type BonusStudentLoanPlan } from "@/lib/bonus";
import { STUDENT_LOAN_PLANS } from "@/lib/student-loan";

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

export default function BonusTaxCalculator() {
  const [salary, setSalary] = useState("45000");
  const [bonus, setBonus] = useState("5000");
  const [plan, setPlan] = useState<BonusStudentLoanPlan>("none");
  const [sacrifice, setSacrifice] = useState("0");

  const reset = () => {
    setSalary("45000");
    setBonus("5000");
    setPlan("none");
    setSacrifice("0");
  };

  const result = useMemo(
    () =>
      calculateBonus({
        annualSalary: parseAmount(salary),
        bonus: parseAmount(bonus),
        studentLoanPlan: plan,
        sacrificePercent: parseAmount(sacrifice),
      }),
    [salary, bonus, plan, sacrifice],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="bonus-salary" className={labelClass}>
            Annual salary (£)
          </label>
          <input
            id="bonus-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your gross salary for the year, before the bonus. The
            bonus is taxed where it lands on top of this.
          </p>
        </div>
        <div>
          <label htmlFor="bonus-amount" className={labelClass}>
            Bonus (£)
          </label>
          <input
            id="bonus-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The gross bonus, before any deductions.
          </p>
        </div>
        <div>
          <label htmlFor="bonus-plan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="bonus-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as BonusStudentLoanPlan)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            {STUDENT_LOAN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {Math.round(p.rate * 100)}% over{" "}
                {gbp.format(p.annualThreshold)} a year
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bonuses count as earnings for student loan repayments, so
            the plan rate comes off the bonus as well.
          </p>
        </div>
        <div>
          <label htmlFor="bonus-sacrifice" className={labelClass}>
            Bonus sacrificed into pension (%)
          </label>
          <input
            id="bonus-sacrifice"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="1"
            value={sacrifice}
            onChange={(e) => setSacrifice(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            If your employer offers bonus sacrifice, the part given
            up into your pension is not taxed at all — no Income Tax,
            National Insurance or student loan on it.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Bonus tax calculation — inputs used
          </p>
          <p>
            Salary: {gbp.format(parseAmount(salary))} · Bonus:{" "}
            {gbp.format(parseAmount(bonus))} · Student loan plan:{" "}
            {plan === "none"
              ? "none"
              : (STUDENT_LOAN_PLANS.find((p) => p.id === plan)?.label ??
                plan)}{" "}
            · Sacrificed into pension:{" "}
            {gbp.format(result.sacrificedAmount)}.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netBonus)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Kept from a {gbp.format(result.grossBonus)} bonus on a{" "}
          {gbp.format(result.annualSalary)} salary
          {result.sacrificedAmount > 0 && (
            <>
              {" "}
              — with a further {gbp.format(result.sacrificedAmount)}{" "}
              going into your pension untaxed
            </>
          )}
          . The deductions on the cash bonus come to{" "}
          {result.marginalRatePercent}% of it.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Gross bonus</td>
                <td className="px-4 py-2">
                  {gbp.format(result.grossBonus)}
                </td>
              </tr>
              {result.sacrificedAmount > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Sacrificed into pension — not taxed
                  </td>
                  <td className="px-4 py-2">
                    −{gbp.format(result.sacrificedAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2">Income Tax on the bonus</td>
                <td className="px-4 py-2">
                  −{gbp.format(result.incomeTaxOnBonus)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employee National Insurance on the bonus
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(result.employeeNiOnBonus)}
                </td>
              </tr>
              {result.studentLoanOnBonus > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Student loan repayment on the bonus
                  </td>
                  <td className="px-4 py-2">
                    −{gbp.format(result.studentLoanOnBonus)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2 font-medium">
                  Bonus in hand
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(result.netBonus)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {result.personalAllowanceAfter < result.personalAllowanceBefore && (
            <div>
              <dt className="inline font-medium">The 60% trap: </dt>
              <dd className="inline">
                this bonus cuts your Personal Allowance from{" "}
                {gbp.format(result.personalAllowanceBefore)} to{" "}
                {gbp.format(result.personalAllowanceAfter)} — £1 of
                allowance is lost for every £2 of income over
                £100,000, which is why the tax on this bonus works
                out at an effective 60% before National Insurance.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">In the month itself: </dt>
            <dd className="inline">
              these are the true figures for the year. The payslip in
              the bonus month can take more than this, because PAYE
              treats the month&apos;s pay largely on its own — on a
              cumulative tax code the Income Tax corrects itself
              through later payslips, but National Insurance is
              worked out per pay period and is not refunded.
            </dd>
          </div>
        </dl>

        <ResultActions
          image={{
            title: "Tax on Bonus",
            headline: gbp.format(result.netBonus),
            headlineNote: `Kept from a ${gbp.format(result.grossBonus)} bonus on a ${gbp.format(result.annualSalary)} salary`,
            rows: [
              {
                label: "Income Tax on bonus",
                value: gbp.format(result.incomeTaxOnBonus),
              },
              {
                label: "National Insurance on bonus",
                value: gbp.format(result.employeeNiOnBonus),
              },
              ...(result.studentLoanOnBonus > 0
                ? [
                    {
                      label: "Student loan on bonus",
                      value: gbp.format(result.studentLoanOnBonus),
                    },
                  ]
                : []),
              {
                label: "Total deductions",
                value: gbp.format(result.totalDeductions),
              },
            ],
            fileName: "payrollcalc-bonus-tax-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Bonus kept after tax"
        value={gbp.format(result.netBonus)}
      />
    </div>
  );
}
