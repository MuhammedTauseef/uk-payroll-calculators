"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateScotlandTax } from "@/lib/scotland-tax";
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

export default function ScotlandSalaryCalculator() {
  const [salary, setSalary] = useState("35000");
  const [pension, setPension] = useState("0");
  const [loan, setLoan] = useState<LoanChoice>("none");
  const [postgradToo, setPostgradToo] = useState(false);

  const reset = () => {
    setSalary("35000");
    setPension("0");
    setLoan("none");
    setPostgradToo(false);
  };

  const result = useMemo(
    () =>
      calculateScotlandTax({
        annualSalary: parseAmount(salary),
        pensionPercent: parseAmount(pension),
        studentLoanPlan: loan === "none" ? null : loan,
        postgraduateLoanToo: postgradToo && loan !== "none" && loan !== "postgraduate",
      }),
    [salary, pension, loan, postgradToo],
  );

  const diff = result.differencePerYear;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="scot-salary" className={labelClass}>
            Gross annual salary (£)
          </label>
          <input
            id="scot-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your pay before tax, for a job based anywhere — Scottish
            Income Tax follows where you live, not where you work.
          </p>
        </div>
        <div>
          <label htmlFor="scot-pension" className={labelClass}>
            Pension contribution (% of gross)
          </label>
          <input
            id="scot-pension"
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
          <label htmlFor="scot-loan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="scot-loan"
            value={loan}
            onChange={(e) => setLoan(e.target.value as LoanChoice)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            <option value="plan4">Plan 4 — Scotland (SAAS)</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan5">Plan 5</option>
            <option value="postgraduate">Postgraduate Loan</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Students who lived in Scotland when they applied are on
            Plan 4 — its 2026/27 threshold is £33,795 a year, the
            highest of any plan.
          </p>
        </div>
        {loan !== "none" && loan !== "postgraduate" && (
          <div className="flex items-start gap-2 pt-7">
            <input
              id="scot-pg"
              type="checkbox"
              checked={postgradToo}
              onChange={(e) => setPostgradToo(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
            />
            <label
              htmlFor="scot-pg"
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
          Your take-home pay
        </h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netMonthly)}
          <span className="text-base font-semibold text-slate-600 dark:text-slate-300">
            {" "}
            a month
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {gbp.format(result.netAnnual)} a year from{" "}
          {gbp.format(result.grossAnnual)} gross — you keep{" "}
          {result.effectiveKeepPercent}% of your pay. On the next
          £100 of pay you would keep £
          {(100 - result.marginalRatePercent).toFixed(2)} (a{" "}
          {result.marginalRatePercent}% marginal rate).
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-300">Gross pay</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-50">
              {gbp.format(result.grossAnnual)}
            </dd>
          </div>
          {result.pensionAnnual > 0 && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-600 dark:text-slate-300">
                Pension contribution
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-50">
                − {gbp.format(result.pensionAnnual)}
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-300">
              Scottish Income Tax
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-50">
              − {gbp.format(result.incomeTax)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-300">
              National Insurance (UK-wide)
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-50">
              − {gbp.format(result.employeeNationalInsurance)}
            </dd>
          </div>
          {result.studentLoan > 0 && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-600 dark:text-slate-300">
                Student loan repayment
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-50">
                − {gbp.format(result.studentLoan)}
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-brand-100 dark:border-brand-900 pt-2">
            <dt className="text-slate-600 dark:text-slate-300">
              Take-home pay
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-50">
              {gbp.format(result.netAnnual)} a year ·{" "}
              {gbp.format(result.netWeekly)} a week
            </dd>
          </div>
        </dl>

        <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Your Income Tax, band by band
        </h3>
        <table className="mt-2 w-full text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Band</th>
              <th className="py-1 pr-2 font-medium">Rate</th>
              <th className="py-1 pr-2 font-medium">Income in band</th>
              <th className="py-1 font-medium">Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-brand-100 dark:border-brand-900">
              <td className="py-1 pr-2">Personal Allowance</td>
              <td className="py-1 pr-2">0%</td>
              <td className="py-1 pr-2">{gbp.format(result.personalAllowance)}</td>
              <td className="py-1">£0.00</td>
            </tr>
            {result.bands
              .filter((b) => b.incomeInBand > 0)
              .map((b) => (
                <tr
                  key={b.name}
                  className="border-t border-brand-100 dark:border-brand-900"
                >
                  <td className="py-1 pr-2">{b.name} rate</td>
                  <td className="py-1 pr-2">{Math.round(b.rate * 100)}%</td>
                  <td className="py-1 pr-2">{gbp.format(b.incomeInBand)}</td>
                  <td className="py-1">{gbp.format(b.tax)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {diff === 0 ? (
            <>
              On this salary the Scottish bands and the rest-of-UK
              bands take the same Income Tax, so your take-home pay
              is the same on both sides of the border.
            </>
          ) : diff > 0 ? (
            <>
              In England, Wales or Northern Ireland the same pay
              would leave you {gbp.format(diff)} a year worse off
              — living in Scotland you take home{" "}
              {gbp.format(diff)} a year more, because the 19%
              starter rate outweighs the higher bands at this
              salary.
            </>
          ) : (
            <>
              In England, Wales or Northern Ireland the same pay
              would leave you {gbp.format(-diff)} a year more —
              the Scottish bands take{" "}
              {gbp.format(-diff)} a year more Income Tax at this
              salary (their Income Tax would be{" "}
              {gbp.format(result.restOfUk.incomeTax)} against your{" "}
              {gbp.format(result.incomeTax)}).
            </>
          )}
        </p>

        <ResultActions
          image={{
            title: "Scotland Take-Home Pay",
            headline: `${gbp.format(result.netMonthly)} a month`,
            headlineNote: `From ${gbp.format(result.grossAnnual)} gross, 2026/27 Scottish rates`,
            rows: [
              { label: "Gross pay", value: gbp.format(result.grossAnnual) },
              { label: "Scottish Income Tax", value: gbp.format(result.incomeTax) },
              {
                label: "National Insurance",
                value: gbp.format(result.employeeNationalInsurance),
              },
              { label: "Take-home pay", value: gbp.format(result.netAnnual) },
            ],
            fileName: "payrollcalc-scotland-take-home-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Take-home pay (Scotland)"
        value={`${gbp.format(result.netMonthly)} a month`}
      />
    </div>
  );
}
