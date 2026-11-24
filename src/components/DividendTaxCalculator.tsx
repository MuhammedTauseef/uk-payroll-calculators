"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateDividendTax,
  optimiseSalaryDividend,
  type DividendBandId,
} from "@/lib/dividend-tax";
import type { StudentLoanPlanId } from "@/lib/student-loan";

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

function fmtWhole(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function fmtRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

const DIVIDEND_BAND_LABELS: Record<DividendBandId, string> = {
  "personal-allowance": "Covered by the Personal Allowance",
  "dividend-allowance": "Dividend allowance (£500)",
  basic: "Basic rate",
  higher: "Higher rate",
  additional: "Additional rate",
};

const SALARY_BAND_LABELS: Record<string, string> = {
  basic: "Basic rate",
  higher: "Higher rate",
  additional: "Additional rate",
};

type PlanChoice = "none" | StudentLoanPlanId;
type Mode = "tax" | "optimiser";

export default function DividendTaxCalculator() {
  const [mode, setMode] = useState<Mode>("tax");

  // Personal tax mode
  const [salary, setSalary] = useState("12570");
  const [dividends, setDividends] = useState("30000");
  const [other, setOther] = useState("0");
  const [sacrifice, setSacrifice] = useState("0");
  const [plan, setPlan] = useState<PlanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  // Optimiser mode
  const [profit, setProfit] = useState("50000");
  const [optPlan, setOptPlan] = useState<PlanChoice>("none");
  const [optPgToo, setOptPgToo] = useState(false);

  const reset = () => {
    setSalary("12570");
    setDividends("30000");
    setOther("0");
    setSacrifice("0");
    setPlan("none");
    setPgToo(false);
    setProfit("50000");
    setOptPlan("none");
    setOptPgToo(false);
  };

  const result = useMemo(
    () =>
      calculateDividendTax({
        salary: parseAmount(salary),
        dividends: parseAmount(dividends),
        otherIncome: parseAmount(other),
        salarySacrificePension: parseAmount(sacrifice),
        undergraduatePlan: plan === "none" ? null : plan,
        hasPostgraduateLoan: pgToo,
      }),
    [salary, dividends, other, sacrifice, plan, pgToo],
  );

  const opt = useMemo(
    () =>
      optimiseSalaryDividend({
        profit: parseAmount(profit),
        undergraduatePlan: optPlan === "none" ? null : optPlan,
        hasPostgraduateLoan: optPgToo,
      }),
    [profit, optPlan, optPgToo],
  );

  const planSelect = (
    id: string,
    value: PlanChoice,
    onChange: (p: PlanChoice) => void,
    pg: boolean,
    onPg: (b: boolean) => void,
    hint: string,
  ) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        Student loan plan
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as PlanChoice)}
        className={inputClass}
      >
        <option value="none">No student loan</option>
        <option value="plan1">Plan 1</option>
        <option value="plan2">Plan 2</option>
        <option value="plan4">Plan 4</option>
        <option value="plan5">Plan 5</option>
      </select>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={pg}
          onChange={(e) => onPg(e.target.checked)}
          className="h-4 w-4 accent-brand-700"
        />
        I also have a Postgraduate Loan
      </label>
    </div>
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div
        className="mb-5 flex gap-2 print:hidden"
        role="tablist"
        aria-label="Calculator mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "tax"}
          onClick={() => setMode("tax")}
          className={
            mode === "tax"
              ? "rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          }
        >
          My dividend tax
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "optimiser"}
          onClick={() => setMode("optimiser")}
          className={
            mode === "optimiser"
              ? "rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          }
        >
          Best salary &amp; dividend mix
        </button>
      </div>

      {mode === "tax" ? (
        <>
          <div className="grid gap-4 print:hidden sm:grid-cols-2">
            <MoneySlider
              id="dt-salary"
              label="Salary (£ a year)"
              value={salary}
              onChange={setSalary}
              min={0}
              max={200000}
              step={250}
              hint="Your gross salary before tax — for a director, the pay your company puts through payroll."
            />
            <MoneySlider
              id="dt-dividends"
              label="Dividends (£ a year)"
              value={dividends}
              onChange={setDividends}
              min={0}
              max={200000}
              step={250}
              hint="Gross dividends for the year, from your own company or any shares you hold outside an ISA."
            />
            <div>
              <label htmlFor="dt-other" className={labelClass}>
                Other income (£ a year)
              </label>
              <input
                id="dt-other"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={other}
                onChange={(e) => setOther(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Rental profit, a pension, anything else taxed as income.
                It stacks underneath the dividends, like the salary.
                Leave at 0 if there is none.
              </p>
            </div>
            <div>
              <label htmlFor="dt-sacrifice" className={labelClass}>
                Salary-sacrifice pension (£ a year)
              </label>
              <input
                id="dt-sacrifice"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={sacrifice}
                onChange={(e) => setSacrifice(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Pension contributions given up out of the salary before
                tax, National Insurance and student loan. Leave at 0 if
                you do not sacrifice salary.
              </p>
            </div>
            {planSelect(
              "dt-plan",
              plan,
              setPlan,
              pgToo,
              setPgToo,
              "Repayments are worked out on your TOTAL income — salary plus dividends — over the plan threshold, the Self Assessment basis.",
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
            Private by design: everything is worked out in your browser.
            Nothing you type here is sent to a server, stored or tracked.
            2026/27 rules; the salary is worked on the England, Wales
            and Northern Ireland bands — dividend tax itself is the
            same across the UK.
          </p>

          <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Your take-home pay
            </h2>

            <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                Dividend tax check — inputs used
              </p>
              <p>
                Salary: {fmtMoney(result.salary)} · Dividends:{" "}
                {fmtMoney(result.dividends)} · Other income:{" "}
                {fmtMoney(result.otherIncome)}. 2026/27 rules.
              </p>
            </div>

            <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {fmtMoney(result.takeHomeAnnual)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                a year — {fmtMoney(result.takeHomeMonthly)} a month
              </span>
            </p>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Dividend tax of <strong>{fmtMoney(result.dividendTax)}</strong>{" "}
              on dividends of {fmtMoney(result.dividends)}, stacked on top
              of a salary of {fmtMoney(result.payAfterSacrifice)}
              {result.otherIncome > 0
                ? ` and other income of ${fmtMoney(result.otherIncome)}`
                : ""}
              .
            </p>

            <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">Dividend tax: </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.dividendTax)}</strong> — the
                  first {fmtMoney(result.allowanceUsedByDividends)} of
                  dividends is covered by your Personal Allowance and the
                  next £500 by the dividend allowance; the rest is taxed
                  slice by slice in the breakdown below.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">
                  Income Tax on salary and other income:{" "}
                </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.nonDividendTax)}</strong> —
                  one Personal Allowance of{" "}
                  {fmtMoney(result.personalAllowance)} across everything.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">
                  Employee National Insurance:{" "}
                </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.employeeNi)}</strong> — charged
                  on the salary only. Dividends never carry National
                  Insurance.
                </dd>
              </div>
              {result.studentLoan > 0 && (
                <div>
                  <dt className="inline font-medium">Student loan: </dt>
                  <dd className="inline">
                    <strong>{fmtMoney(result.studentLoan)}</strong> —
                    charged on the total income, dividends included,
                    through Self Assessment.
                  </dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium">
                  Set aside for Self Assessment:{" "}
                </dt>
                <dd className="inline">
                  <strong>
                    {fmtMoney(result.selfAssessmentSetAsideMonthly)} a month
                  </strong>{" "}
                  ({fmtMoney(result.selfAssessmentSetAsideAnnual)} a year)
                  — your dividend tax
                  {result.studentLoan > 0 ? " and student loan are" : " is"}{" "}
                  not taken through PAYE, so this is the amount to keep
                  back for the January bill.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">
                  Employer NI (the company&apos;s cost):{" "}
                </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.employerNi)}</strong> — paid by
                  the company on the salary, on top of it. It is not taken
                  off your take-home above; in the optimiser it comes out
                  of the company&apos;s profit.
                </dd>
              </div>
            </dl>

            {result.inTaperZone && (
              <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <p>
                  <strong>£100,000 warning:</strong> your total income is{" "}
                  {fmtMoney(result.totalIncome)}, so your Personal
                  Allowance is being withdrawn — £1 of it for every £2
                  over £100,000
                  {result.personalAllowance === 0
                    ? ", and it has gone completely."
                    : "."}{" "}
                  Dividends count in full towards that total. A pension
                  contribution that brings the total back under £100,000
                  restores the allowance.
                </p>
              </div>
            )}
            {!result.inTaperZone && result.dividendsReachHigherBands && (
              <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Higher-rate dividends:</strong> your salary and
                  other income already fill the basic-rate band, so part
                  of your dividends is taxed at 35.75% (or 39.35%) instead
                  of 10.75%. Spreading dividends across tax years, or
                  between spouses each with their own allowance, is how
                  that is usually softened.
                </p>
              </div>
            )}

            <div className="mt-5 print:hidden">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                The breakdown — every slice, in the order HMRC stacks it
              </h3>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <table className="w-full text-left text-sm table-stack">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      <th className={thClass}>Slice</th>
                      <th className={thClass}>Amount</th>
                      <th className={thClass}>Rate</th>
                      <th className={thClass}>Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.nonDividendSlices.map((s) => (
                      <tr key={`nd-${s.band}`}>
                        <td className={tdClass}>
                          Salary &amp; other income —{" "}
                          {SALARY_BAND_LABELS[s.band]}
                        </td>
                        <td className={tdClass}>{fmtMoney(s.amount)}</td>
                        <td className={tdClass}>{fmtRate(s.rate)}</td>
                        <td className={tdClass}>{fmtMoney(s.tax)}</td>
                      </tr>
                    ))}
                    {result.dividendSlices.map((s) => (
                      <tr key={`d-${s.band}`}>
                        <td className={tdClass}>
                          Dividends — {DIVIDEND_BAND_LABELS[s.band]}
                        </td>
                        <td className={tdClass}>{fmtMoney(s.amount)}</td>
                        <td className={tdClass}>{fmtRate(s.rate)}</td>
                        <td className={tdClass}>{fmtMoney(s.tax)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className={`${tdClass} font-semibold`}>
                        Total Income Tax
                      </td>
                      <td className={tdClass}></td>
                      <td className={tdClass}></td>
                      <td className={`${tdClass} font-semibold`}>
                        {fmtMoney(result.totalIncomeTax)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
                The assumptions behind those numbers
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <li>
                  Personal Allowance £12,570, withdrawn by £1 for every £2
                  of total income over £100,000 (gone at £125,140).
                </li>
                <li>
                  Bands on taxable income: basic to £37,700, higher to
                  £125,140, additional above — salary at 20% / 40% / 45%,
                  dividends at 10.75% / 35.75% / 39.35%.
                </li>
                <li>
                  Dividend allowance £500 a year at 0%, inside the bands —
                  it uses up band room rather than sitting on top.
                </li>
                <li>
                  Employee NI on the salary only: 0% to £12,570, 8% to
                  £50,270, 2% above. Employer NI 15% on salary over
                  £5,000.
                </li>
                <li>
                  Salary sacrifice, if entered, comes off the salary
                  before tax, NI and student loan.
                </li>
              </ul>
            </div>

            <ResultActions
              image={{
                title: "Dividend Tax Calculator",
                headline: fmtMoney(result.takeHomeAnnual),
                headlineNote: "Take-home pay after dividend tax, 2026/27",
                rows: [
                  { label: "Salary", value: fmtMoney(result.salary) },
                  { label: "Dividends", value: fmtMoney(result.dividends) },
                  { label: "Dividend tax", value: fmtMoney(result.dividendTax) },
                  {
                    label: "Income Tax on salary",
                    value: fmtMoney(result.nonDividendTax),
                  },
                  {
                    label: "Employee NI",
                    value: fmtMoney(result.employeeNi),
                  },
                  {
                    label: "Set aside a month",
                    value: fmtMoney(result.selfAssessmentSetAsideMonthly),
                  },
                ],
                fileName: "payrollcalc-dividend-tax-result.png",
              }}
              onReset={reset}
            />
          </div>
          <StickyResultBar
            label="Take-home a month"
            value={fmtMoney(result.takeHomeMonthly)}
          />
        </>
      ) : (
        <>
          <div className="grid gap-4 print:hidden sm:grid-cols-2">
            <MoneySlider
              id="dt-profit"
              label="Company profit (£ a year)"
              value={profit}
              onChange={setProfit}
              min={0}
              max={500000}
              step={500}
              hint="Profit BEFORE your salary and employer NI are taken off — the pot the salary, the tax and the dividends all come out of."
            />
            {planSelect(
              "dt-opt-plan",
              optPlan,
              setOptPlan,
              optPgToo,
              setOptPgToo,
              "A loan changes the best split — repayments run on the salary and the dividends together.",
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
            The search tests director salaries from £5,000 to £50,270
            and runs the full loop on each one: salary and employer NI
            out of the profit, Corporation Tax on what is left, the
            rest paid as dividends, then your personal tax. One
            company, a 12-month accounting period, no other income, no
            pension — and only salaries the profit can actually afford
            (salary plus employer NI cannot exceed the profit).
          </p>

          <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              The best split of {fmtWhole(opt.profit)} of profit
            </h2>

            <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                Salary &amp; dividend optimiser — inputs used
              </p>
              <p>Company profit: {fmtMoney(opt.profit)}. 2026/27 rules.</p>
            </div>

            <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {fmtMoney(opt.best.takeHome)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                kept — salary {fmtMoney(opt.best.salary)} + dividends{" "}
                {fmtMoney(opt.best.dividends)}
              </span>
            </p>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Of the {fmtMoney(opt.profit)} of profit,{" "}
              {fmtMoney(opt.best.corporationTax)} goes in Corporation
              Tax and {fmtMoney(opt.best.personalTax)} in personal tax
              {opt.best.studentLoan > 0
                ? `, plus ${fmtMoney(opt.best.studentLoan)} of student loan`
                : ""}
              , leaving {fmtMoney(opt.best.takeHome)} in your pocket —{" "}
              {fmtMoney(opt.best.takeHomeMonthly)} a month.
            </p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 print:hidden">
              <table className="w-full text-left text-sm table-stack">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <th className={thClass}>Salary</th>
                    <th className={thClass}>Employer NI</th>
                    <th className={thClass}>Corporation Tax</th>
                    <th className={thClass}>Dividends</th>
                    <th className={thClass}>Personal tax</th>
                    <th className={thClass}>You keep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {opt.topSplits.map((s, i) => (
                    <tr
                      key={s.salary}
                      className={
                        i === 0
                          ? "font-semibold text-slate-900 dark:text-slate-50"
                          : undefined
                      }
                    >
                      <td className={tdClass}>
                        {fmtMoney(s.salary)}
                        {i === 0 ? " — best" : ""}
                      </td>
                      <td className={tdClass}>{fmtMoney(s.employerNi)}</td>
                      <td className={tdClass}>
                        {fmtMoney(s.corporationTax)}
                      </td>
                      <td className={tdClass}>{fmtMoney(s.dividends)}</td>
                      <td className={tdClass}>{fmtMoney(s.personalTax)}</td>
                      <td className={tdClass}>{fmtMoney(s.takeHome)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:hidden">
              {opt.evaluatedCount} salary points were tested. The
              runner-up splits are shown so you can see what the choice
              is worth — the gap between the best and the worst common
              split is usually four figures a year.
            </p>

            <ResultActions
              image={{
                title: "Best Salary & Dividend Mix",
                headline: fmtMoney(opt.best.takeHome),
                headlineNote: `Kept from ${fmtWhole(opt.profit)} of company profit, 2026/27`,
                rows: [
                  { label: "Salary", value: fmtMoney(opt.best.salary) },
                  {
                    label: "Employer NI",
                    value: fmtMoney(opt.best.employerNi),
                  },
                  {
                    label: "Corporation Tax",
                    value: fmtMoney(opt.best.corporationTax),
                  },
                  { label: "Dividends", value: fmtMoney(opt.best.dividends) },
                  {
                    label: "Personal tax",
                    value: fmtMoney(opt.best.personalTax),
                  },
                  {
                    label: "Take-home a month",
                    value: fmtMoney(opt.best.takeHomeMonthly),
                  },
                ],
                fileName: "payrollcalc-dividend-optimiser-result.png",
              }}
              onReset={reset}
            />
          </div>
          <StickyResultBar
            label="Best take-home a month"
            value={fmtMoney(opt.best.takeHomeMonthly)}
          />
        </>
      )}
    </div>
  );
}
