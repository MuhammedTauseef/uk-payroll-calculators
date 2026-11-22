"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateMarriageAllowance } from "@/lib/marriage-allowance";
import type { MarriageRegion } from "@/lib/marriage-allowance";
import { MARRIAGE_ALLOWANCE } from "@/lib/rates";

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

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

const VERDICT_TEXT: Record<string, { title: string; body: string }> = {
  "full-saving": {
    title: "Worth claiming — the full £252 a year",
    body: "The lower earner gives up none of the allowance they were using, and the higher earner pays enough tax to use the whole reduction. Claiming puts the full £252 a year back in the household.",
  },
  "partial-saving": {
    title: "Worth claiming — a part saving",
    body: "You gain as a couple, but not the full £252: either the higher earner does not pay £252 of tax to begin with, or the lower earner starts paying a little tax on the slice of income the transfer exposes. The figures below show both sides.",
  },
  "worse-off": {
    title: "Eligible — but you would be worse off",
    body: "On these incomes the extra tax the lower earner starts paying is more than the higher earner saves. Do not claim on these figures; check again if either income changes.",
  },
  "no-saving-recipient-pays-no-tax": {
    title: "No saving on these incomes",
    body: "Marriage Allowance only moves tax from one partner to the other. The higher earner here pays no Income Tax, so there is no tax bill for the £252 reduction to come off.",
  },
  "not-eligible-recipient-higher-rate": {
    title: "Not eligible — the higher earner pays more than the basic rate",
    body: "Marriage Allowance is only available where the partner receiving the allowance is a basic-rate taxpayer (a starter, basic or intermediate rate taxpayer in Scotland). A higher-rate income rules the couple out, however little the other partner earns.",
  },
  "not-eligible-transferor-taxpayer": {
    title: "Not eligible — both partners pay tax",
    body: "The partner giving up the allowance must be a non-taxpayer — income at or below the £12,570 Personal Allowance. On these figures both partners pay Income Tax, so there is no unused allowance to transfer.",
  },
};

export default function MarriageAllowanceCalculator() {
  const [incomeA, setIncomeA] = useState("8000");
  const [incomeB, setIncomeB] = useState("35000");
  const [region, setRegion] = useState<MarriageRegion>("EWNI");
  const [backdateYears, setBackdateYears] = useState("4");

  const reset = () => {
    setIncomeA("8000");
    setIncomeB("35000");
    setRegion("EWNI");
    setBackdateYears("4");
  };

  const result = useMemo(
    () =>
      calculateMarriageAllowance({
        incomeA: parseAmount(incomeA),
        incomeB: parseAmount(incomeB),
        region,
        backdateYears: parseAmount(backdateYears),
      }),
    [incomeA, incomeB, region, backdateYears],
  );

  const verdict = VERDICT_TEXT[result.verdict];
  const years = Math.min(4, Math.max(0, parseAmount(backdateYears)));
  const goodNews =
    result.verdict === "full-saving" || result.verdict === "partial-saving";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <MoneySlider
          id="ma-income-a"
          label="Your annual income (£)"
          value={incomeA}
          onChange={setIncomeA}
          min={0}
          max={150000}
          step={250}
          hint="Gross income for the tax year, from all sources — wages, pension, self-employment."
        />
        <MoneySlider
          id="ma-income-b"
          label="Your partner's annual income (£)"
          value={incomeB}
          onChange={setIncomeB}
          min={0}
          max={150000}
          step={250}
          hint="It does not matter which of you earns more — the calculator works out who transfers and who receives."
        />
        <div>
          <label htmlFor="ma-region" className={labelClass}>
            Where does the higher earner pay tax?
          </label>
          <select
            id="ma-region"
            value={region}
            onChange={(e) => setRegion(e.target.value as MarriageRegion)}
            className={inputClass}
          >
            <option value="EWNI">England, Wales or Northern Ireland</option>
            <option value="Scotland">Scotland</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Scotland has its own tax bands: the receiving partner
            must earn no more than £43,662 there, against £50,270
            elsewhere in the UK.
          </p>
        </div>
        <MoneySlider
          id="ma-backdate"
          label="Earlier years to backdate (0 to 4)"
          value={backdateYears}
          onChange={setBackdateYears}
          min={0}
          max={4}
          step={1}
          hint="Claims can reach back to the 2022/23 tax year. The backdated figure assumes your incomes were much the same in those years."
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        The calculator assumes you are married or in a civil
        partnership — living together does not count.
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          {verdict.title}
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Marriage Allowance check — inputs used
          </p>
          <p>
            Incomes: {fmtMoney(result.lowerIncome)} and{" "}
            {fmtMoney(result.higherIncome)} a year · Region:{" "}
            {region === "Scotland"
              ? "Scotland"
              : "England, Wales or Northern Ireland"}{" "}
            · Backdating: {years} earlier years. 2026/27 rules.
          </p>
        </div>

        {goodNews ? (
          <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
            {fmtMoney(result.netAnnualSaving)}
            <span className="text-base font-medium text-slate-600 dark:text-slate-300">
              {" "}
              saved a year as a couple
            </span>
          </p>
        ) : (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {verdict.body}
          </p>
        )}

        {goodNews && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {verdict.body}
          </p>
        )}

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Who transfers: </dt>
            <dd className="inline">
              the partner on {fmtMoney(result.lowerIncome)} gives up{" "}
              {fmtMoney(MARRIAGE_ALLOWANCE.transferAmount)} of their
              Personal Allowance — their own allowance falls to{" "}
              {fmtMoney(MARRIAGE_ALLOWANCE.transferorAllowanceAfter)}.
              They had {fmtMoney(result.transferorSpareAllowance)} of
              allowance unused.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              Higher earner saves:{" "}
            </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.recipientSaving)}</strong> a
              year — 20% of the {fmtMoney(MARRIAGE_ALLOWANCE.transferAmount)}{" "}
              transferred, capped at the {fmtMoney(result.recipientTaxBefore)}{" "}
              of tax they pay.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              Lower earner pays:{" "}
            </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.transferorExtraTax)}</strong>{" "}
              extra tax a year
              {result.transferorExtraTax > 0
                ? " — the slice of their income above £11,310 becomes taxable once the allowance is given up."
                : " — their income stays inside their reduced allowance."}
            </dd>
          </div>
          {goodNews && years > 0 && (
            <div>
              <dt className="inline font-medium">
                With backdating:{" "}
              </dt>
              <dd className="inline">
                {years} earlier {years === 1 ? "year adds" : "years add"}{" "}
                <strong>{fmtMoney(result.backdatedTotal)}</strong> as
                a lump sum, for{" "}
                <strong>{fmtMoney(result.totalWithCurrentYear)}</strong>{" "}
                in all including this year — assuming your incomes
                were much the same then.
              </dd>
            </div>
          )}
          {goodNews && (
            <div>
              <dt className="inline font-medium">Tax codes: </dt>
              <dd className="inline">
                after a claim, HMRC usually puts the receiving partner
                on {MARRIAGE_ALLOWANCE.recipientTaxCode} and the
                transferring partner on{" "}
                {MARRIAGE_ALLOWANCE.transferorTaxCode}. The lower
                earner applies, free, on GOV.UK — never through a
                claims company that keeps part of the refund.
              </dd>
            </div>
          )}
        </dl>

        <ResultActions
          image={{
            title: "Marriage Allowance Calculator",
            headline: goodNews
              ? fmtMoney(result.netAnnualSaving)
              : "No saving",
            headlineNote: goodNews
              ? "Saved a year as a couple, 2026/27"
              : "On these incomes, 2026/27",
            rows: [
              {
                label: "Lower income",
                value: fmtMoney(result.lowerIncome),
              },
              {
                label: "Higher income",
                value: fmtMoney(result.higherIncome),
              },
              {
                label: "Higher earner saves",
                value: fmtMoney(result.recipientSaving),
              },
              {
                label: "Lower earner pays",
                value: fmtMoney(result.transferorExtraTax),
              },
            ],
            fileName: "payrollcalc-marriage-allowance-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Saving a year"
        value={
          goodNews ? `${fmtMoney(result.netAnnualSaving)} a year` : "No saving"
        }
      />
    </div>
  );
}
