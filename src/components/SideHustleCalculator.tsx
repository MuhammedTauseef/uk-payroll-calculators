"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateSideHustle, SIDE_HUSTLE } from "@/lib/side-hustle";

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

export default function SideHustleCalculator() {
  const [salary, setSalary] = useState("35000");
  const [sideIncome, setSideIncome] = useState("6000");
  const [expenses, setExpenses] = useState("500");

  const reset = () => {
    setSalary("35000");
    setSideIncome("6000");
    setExpenses("500");
  };

  const result = useMemo(
    () =>
      calculateSideHustle({
        salary: parseAmount(salary),
        sideIncome: parseAmount(sideIncome),
        expenses: parseAmount(expenses),
      }),
    [salary, sideIncome, expenses],
  );

  const deductionText =
    result.deductionKind === "full-relief"
      ? "covered in full by the £1,000 trading allowance — the profit counts as nil"
      : result.deductionKind === "trading-allowance"
        ? "the £1,000 trading allowance — it beats your expenses, so the calculator uses it"
        : "your actual expenses — they beat the £1,000 trading allowance, so the calculator uses them";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-3">
        <MoneySlider
          id="sh-salary"
          label="Your PAYE salary (£ a year)"
          value={salary}
          onChange={setSalary}
          min={0}
          max={150000}
          step={250}
          hint="Gross salary from your job, before tax. Leave it at 0 if the side income is your only income."
        />
        <MoneySlider
          id="sh-side-income"
          label="Side income (£ a year)"
          value={sideIncome}
          onChange={setSideIncome}
          min={0}
          max={100000}
          step={100}
          hint="Everything the side hustle brought in, before any costs — the figure the £1,000 test is applied to."
        />
        <MoneySlider
          id="sh-expenses"
          label="Side hustle expenses (£ a year)"
          value={expenses}
          onChange={setExpenses}
          min={0}
          max={50000}
          step={50}
          hint="Allowable costs — stock, fees, materials, software. The calculator compares them with the £1,000 allowance and uses whichever is bigger."
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2025/26 rules for England, Wales and Northern Ireland.
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          {result.underAllowance
            ? "Nothing to set aside — and nothing to declare"
            : "Extra tax to set aside for 2025/26"}
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Side hustle tax check — inputs used
          </p>
          <p>
            PAYE salary: {fmtMoney(result.salary)} · Side income:{" "}
            {fmtMoney(result.sideIncome)} · Expenses:{" "}
            {fmtMoney(result.expenses)}. 2025/26 rules, England,
            Wales and Northern Ireland.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.totalExtraTax)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {result.underAllowance
              ? " of extra tax"
              : " to set aside from the side hustle"}
          </span>
        </p>

        {result.underAllowance ? (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Gross side income of {fmtMoney(result.sideIncome)} is
            inside the £1,000 trading allowance, so the profit counts
            as nil: no Income Tax, no National Insurance, and usually
            nothing to tell HMRC. Keep records of the income anyway —
            and if the total passes £1,000 in a later year, this page
            works out the tax.
          </p>
        ) : (
          <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <div>
              <dt className="inline font-medium">Deduction used: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.deduction)}</strong> —{" "}
                {deductionText}. You never deduct both.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Taxable profit: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.taxableProfit)}</strong> —{" "}
                {fmtMoney(result.sideIncome)} of side income less the{" "}
                {fmtMoney(result.deduction)} deduction. It stacks on
                top of your {fmtMoney(result.salary)} salary, making{" "}
                {fmtMoney(result.combinedIncome)} in total.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">
                Extra Income Tax:{" "}
              </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.extraIncomeTax)}</strong> —
                the tax on {fmtMoney(result.combinedIncome)} (
                {fmtMoney(result.combinedTax)}) less the{" "}
                {fmtMoney(result.salaryOnlyTax)} your salary already
                pays through PAYE.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">
                Class 4 National Insurance:{" "}
              </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.class4Ni)}</strong>
                {result.taxableProfit > SIDE_HUSTLE.class4LowerLimit
                  ? " — 6% of the profit between £12,570 and £50,270, 2% above that. Your salary does not use up any of this band."
                  : " — none due, because the profit is below the £12,570 Class 4 threshold. Your salary does not change that: Class 4 looks at the profit alone."}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Class 2: </dt>
              <dd className="inline">
                {result.class2TreatedAsPaid
                  ? "your profit is over £6,845, so Class 2 counts as paid — it protects your State Pension record and costs you nothing."
                  : "your profit is under £6,845, so nothing is credited automatically. You can pay voluntary Class 2 at £3.50 a week (about £182 a year) to keep the year counting towards your State Pension."}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">You keep: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.netKept)}</strong> of the{" "}
                {fmtMoney(result.sideIncome)} — after the{" "}
                {fmtMoney(result.expenses)} of expenses and{" "}
                {fmtMoney(result.totalExtraTax)} of tax, an effective
                tax rate of {result.effectiveRatePercent}% on the side
                income.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Deadlines: </dt>
              <dd className="inline">
                register for Self Assessment by 5 October 2026, then
                file and pay by 31 January 2027. A first bill can also
                include a payment on account towards next year — an
                advance, not extra tax.
              </dd>
            </div>
          </dl>
        )}

        <ResultActions
          image={{
            title: "Side Hustle Tax Calculator UK",
            headline: fmtMoney(result.totalExtraTax),
            headlineNote: result.underAllowance
              ? "No extra tax — inside the £1,000 allowance, 2025/26"
              : "Extra tax to set aside, 2025/26",
            rows: [
              { label: "PAYE salary", value: fmtMoney(result.salary) },
              {
                label: "Side income",
                value: fmtMoney(result.sideIncome),
              },
              {
                label: "Taxable profit",
                value: fmtMoney(result.taxableProfit),
              },
              {
                label: "Extra Income Tax",
                value: fmtMoney(result.extraIncomeTax),
              },
              {
                label: "Class 4 NI",
                value: fmtMoney(result.class4Ni),
              },
              { label: "You keep", value: fmtMoney(result.netKept) },
            ],
            fileName: "payrollcalc-side-hustle-tax-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Extra tax to set aside"
        value={fmtMoney(result.totalExtraTax)}
      />
    </div>
  );
}
