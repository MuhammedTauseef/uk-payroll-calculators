"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  buildTaxableProfit,
  calculateCorporationTax,
  corporationTaxDates,
  formatGbDate,
  MARGINAL_BAND_RATE_PERCENT,
} from "@/lib/corporation-tax";

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

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

type Mode = "direct" | "build";

export default function CorporationTaxCalculator() {
  const [mode, setMode] = useState<Mode>("direct");

  // Direct mode
  const [profit, setProfit] = useState("80000");

  // Build mode
  const [acctProfit, setAcctProfit] = useState("95000");
  const [entertaining, setEntertaining] = useState("2400");
  const [depreciation, setDepreciation] = useState("6000");
  const [otherAddBack, setOtherAddBack] = useState("0");
  const [capitalAllowances, setCapitalAllowances] = useState("9400");
  const [losses, setLosses] = useState("4000");
  const [rdRelief, setRdRelief] = useState("0");
  const [otherRelief, setOtherRelief] = useState("0");

  // Shared
  const [companies, setCompanies] = useState("1");
  const [periodEnd, setPeriodEnd] = useState("2026-03-31");

  const reset = () => {
    setProfit("80000");
    setAcctProfit("95000");
    setEntertaining("2400");
    setDepreciation("6000");
    setOtherAddBack("0");
    setCapitalAllowances("9400");
    setLosses("4000");
    setRdRelief("0");
    setOtherRelief("0");
    setCompanies("1");
    setPeriodEnd("2026-03-31");
  };

  const built = useMemo(
    () =>
      buildTaxableProfit({
        accountingProfit: parseAmount(acctProfit),
        addBackEntertaining: parseAmount(entertaining),
        addBackDepreciation: parseAmount(depreciation),
        addBackOther: parseAmount(otherAddBack),
        capitalAllowances: parseAmount(capitalAllowances),
        lossesBroughtForward: parseAmount(losses),
        rdRelief: parseAmount(rdRelief),
        otherRelief: parseAmount(otherRelief),
      }),
    [
      acctProfit,
      entertaining,
      depreciation,
      otherAddBack,
      capitalAllowances,
      losses,
      rdRelief,
      otherRelief,
    ],
  );

  const taxableProfit =
    mode === "direct" ? parseAmount(profit) : built.taxableProfit;
  const companiesCount = Math.max(1, Math.floor(parseAmount(companies)) || 1);

  const result = useMemo(
    () =>
      calculateCorporationTax({
        profit: taxableProfit,
        associatedCompanies: companiesCount,
      }),
    [taxableProfit, companiesCount],
  );

  const dates = useMemo(
    () => corporationTaxDates(periodEnd, taxableProfit),
    [periodEnd, taxableProfit],
  );

  const taxSharePercent =
    result.profit > 0 ? (result.tax / result.profit) * 100 : 0;
  const keptSharePercent = 100 - taxSharePercent;

  const moneyField = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    hint: string,
  ) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );

  const sharedFields = (
    <>
      <div>
        <label htmlFor="ct-companies" className={labelClass}>
          Associated companies (including this one)
        </label>
        <input
          id="ct-companies"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={companies}
          onChange={(e) => setCompanies(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Companies under common control share the limits — the
          £50,000 and £250,000 are divided by this number. Most
          one-company directors enter 1. A company that stayed
          dormant all period does not count.
        </p>
      </div>
      <div>
        <label htmlFor="ct-period-end" className={labelClass}>
          Accounting period ends
        </label>
        <input
          id="ct-period-end"
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Usually your company&apos;s year end. It sets the two
          deadlines under the result: pay 9 months and 1 day later,
          file the CT600 12 months later.
        </p>
      </div>
    </>
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
          aria-selected={mode === "direct"}
          onClick={() => setMode("direct")}
          className={
            mode === "direct"
              ? "rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          }
        >
          I know my taxable profit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "build"}
          onClick={() => setMode("build")}
          className={
            mode === "build"
              ? "rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
          }
        >
          Build my taxable profit
        </button>
      </div>

      {mode === "direct" ? (
        <div className="grid gap-4 print:hidden sm:grid-cols-2">
          <MoneySlider
            id="ct-profit"
            label="Taxable profit (£)"
            value={profit}
            onChange={setProfit}
            min={0}
            max={1000000}
            step={500}
            hint="Profit AFTER allowable expenses, capital allowances and losses — the figure the tax is charged on, not turnover. Not sure? Use the “Build my taxable profit” tab."
          />
          {sharedFields}
        </div>
      ) : (
        <div className="grid gap-4 print:hidden sm:grid-cols-2">
          <MoneySlider
            id="ct-acct-profit"
            label="Profit in the accounts (£)"
            value={acctProfit}
            onChange={setAcctProfit}
            min={0}
            max={1000000}
            step={500}
            hint="The profit before tax in your accounts — the starting point. Tax then adjusts it, step by step, below."
          />
          {moneyField(
            "ct-entertaining",
            "Client entertaining (£)",
            entertaining,
            setEntertaining,
            "Specifically disallowed by HMRC — it goes back in. Staff entertaining is different and usually allowable; leave it out.",
          )}
          {moneyField(
            "ct-depreciation",
            "Depreciation (£)",
            depreciation,
            setDepreciation,
            "The depreciation charged in the accounts. It is added back, and capital allowances come off instead, below.",
          )}
          {moneyField(
            "ct-other-addback",
            "Other disallowable costs (£)",
            otherAddBack,
            setOtherAddBack,
            "Anything else the accounts deducted that the tax rules do not allow — fines and penalties are the usual ones.",
          )}
          {moneyField(
            "ct-capital-allowances",
            "Capital allowances (£)",
            capitalAllowances,
            setCapitalAllowances,
            "Annual Investment Allowance and writing-down allowances on equipment, machinery and vehicles for the period.",
          )}
          {moneyField(
            "ct-losses",
            "Losses brought forward (£)",
            losses,
            setLosses,
            "Trading losses from earlier periods you are using now. Only the amount this period's profit can absorb counts here.",
          )}
          {moneyField(
            "ct-rd",
            "R&D relief (£)",
            rdRelief,
            setRdRelief,
            "The relief amount for research and development spending, if you claim it. Leave at 0 if you do not.",
          )}
          {moneyField(
            "ct-other-relief",
            "Other reliefs (£)",
            otherRelief,
            setOtherRelief,
            "Any other relief deducted in reaching taxable profit. Leave at 0 if there is none.",
          )}
          {sharedFields}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2026/27 rules, a 12-month accounting period, and Marginal
        Relief on the standard basis (no franked investment income, so
        augmented profits equal taxable profits).
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your Corporation Tax
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Corporation Tax check — inputs used
          </p>
          <p>
            {mode === "direct"
              ? `Taxable profit: ${fmtMoney(result.profit)}.`
              : `Profit in the accounts: ${fmtMoney(built.accountingProfit)}, taxable profit built: ${fmtMoney(built.taxableProfit)}.`}{" "}
            Associated companies: {result.associatedCompanies}. Accounting
            period ends {formatGbDate(dates.periodEnd)}. 2026/27 rules.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.tax)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            on {fmtWhole(result.profit)} of taxable profit — an effective
            rate of {result.effectiveRatePercent.toFixed(2)}%
          </span>
        </p>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {result.regime === "small" && (
            <>
              Your profit sits inside the small profits band: everything
              is charged at 19%, up to your limit of{" "}
              {fmtWhole(result.smallProfitsLimit)}
              {result.associatedCompanies > 1
                ? ` (£50,000 divided by ${result.associatedCompanies} associated companies)`
                : ""}
              .
            </>
          )}
          {result.regime === "marginal" && (
            <>
              Your profit sits in the Marginal Relief band between{" "}
              {fmtWhole(result.smallProfitsLimit)} and{" "}
              {fmtWhole(result.mainRateLimit)}. The tax starts at 25%
              and Marginal Relief hands some of it back, so the rate
              climbs gradually from 19% towards 25% instead of jumping.
            </>
          )}
          {result.regime === "main" && (
            <>
              Your profit is at or over your main-rate limit of{" "}
              {fmtWhole(result.mainRateLimit)}
              {result.associatedCompanies > 1
                ? ` (£250,000 divided by ${result.associatedCompanies} associated companies)`
                : ""}
              , so everything is charged at the 25% main rate.
            </>
          )}
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Profit after tax: </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.profitAfterTax)}</strong> — what is
              left in the company, the pot dividends are paid from.
            </dd>
          </div>
          {result.regime === "marginal" && (
            <div>
              <dt className="inline font-medium">Marginal Relief: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.marginalRelief)}</strong> — (
                {fmtWhole(result.mainRateLimit)} −{" "}
                {fmtWhole(result.profit)}) × 3/200. Without it the bill
                would be {fmtMoney(result.profit * 0.25)}.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">Set aside a month: </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.monthlySetAside)}</strong> — the
              bill spread over 12 months, so the payment date never
              arrives as a surprise.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Your limits: </dt>
            <dd className="inline">
              19% up to {fmtWhole(result.smallProfitsLimit)}, 25% from{" "}
              {fmtWhole(result.mainRateLimit)}
              {result.associatedCompanies > 1
                ? ` — the £50,000 and £250,000 limits divided by ${result.associatedCompanies} associated companies`
                : ""}
              .
            </dd>
          </div>
        </dl>

        {result.profit > 0 && (
          <div className="mt-5 print:hidden">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Where your profit goes
            </h3>
            <div
              className="mt-2 flex h-7 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
              role="img"
              aria-label={`Profit after tax ${keptSharePercent.toFixed(1)} percent, Corporation Tax ${taxSharePercent.toFixed(1)} percent`}
            >
              <div
                className="bg-brand-600"
                style={{ width: `${keptSharePercent}%` }}
              />
              <div
                className="bg-amber-400"
                style={{ width: `${taxSharePercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Profit after tax {keptSharePercent.toFixed(1)}% (
              {fmtMoney(result.profitAfterTax)}) · Corporation Tax{" "}
              {taxSharePercent.toFixed(1)}% ({fmtMoney(result.tax)})
            </p>
          </div>
        )}

        {result.regime === "marginal" && (
          <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              <strong>The 26.5% trap:</strong> inside this band, each
              extra £1 of profit carries {MARGINAL_BAND_RATE_PERCENT}p of
              tax — 25p of main rate plus 1.5p of Marginal Relief lost.
              That makes this the most expensive band to sit in, and the
              band where a company pension contribution (which reduces
              the profit) saves the most per pound.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 print:hidden">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Your two deadlines — period ending {formatGbDate(dates.periodEnd)}
          </h3>
          {dates.largeCompany ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Taxable profits over{" "}
              {fmtWhole(dates.instalmentThreshold)} put the company in
              the large-company regime: there is no single payment date.
              Corporation Tax is paid in <strong>quarterly
              instalments</strong>, the first falling in the seventh
              month of the accounting period. The £1.5 million threshold
              is itself divided between the companies in a 51% group, so
              a grouped company can be “large” on less. The CT600 filing
              deadline stays the same:{" "}
              <strong>{formatGbDate(dates.filingDeadline)}</strong>.
            </p>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>Pay by {formatGbDate(dates.paymentDeadline)}</strong>{" "}
              — 9 months and 1 day after the period ends.{" "}
              <strong>File the CT600 by{" "}
              {formatGbDate(dates.filingDeadline)}</strong> — 12 months
              after it ends. You pay before you file; the two dates are
              not the same, and the payment one comes first.
            </p>
          )}
        </div>

        {mode === "build" && (
          <div className="mt-5 print:hidden">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              The bridge — from the accounts to taxable profit
            </h3>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-sm table-stack">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <th className={thClass}>Step</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Running total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {built.steps.map((s) => (
                    <tr
                      key={s.label}
                      className={
                        s.kind === "result"
                          ? "font-semibold text-slate-900 dark:text-slate-50"
                          : undefined
                      }
                    >
                      <td className={tdClass}>{s.label}</td>
                      <td className={tdClass}>
                        {s.kind === "start" || s.kind === "result"
                          ? fmtMoney(s.amount)
                          : `${s.amount >= 0 ? "+" : "−"} ${fmtMoney(Math.abs(s.amount))}`}
                      </td>
                      <td className={tdClass}>{fmtMoney(s.runningTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {built.unusedDeductions > 0 && (
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Your deductions exceed the profit by{" "}
                {fmtMoney(built.unusedDeductions)} — taxable profit
                cannot go below £0. In real life the unused losses are
                not lost: they carry forward (or may be carried back),
                which your CT600 handles.
              </p>
            )}
          </div>
        )}

        <ResultActions
          image={{
            title: "Corporation Tax Calculator",
            headline: fmtMoney(result.tax),
            headlineNote: `Corporation Tax on ${fmtWhole(result.profit)} of profit, 2026/27`,
            rows: [
              { label: "Taxable profit", value: fmtMoney(result.profit) },
              {
                label: "Effective rate",
                value: `${result.effectiveRatePercent.toFixed(2)}%`,
              },
              {
                label: "Marginal Relief",
                value: fmtMoney(result.marginalRelief),
              },
              {
                label: "Profit after tax",
                value: fmtMoney(result.profitAfterTax),
              },
              {
                label: "Set aside a month",
                value: fmtMoney(result.monthlySetAside),
              },
              {
                label: "Pay by",
                value: dates.largeCompany
                  ? "Quarterly instalments"
                  : formatGbDate(dates.paymentDeadline),
              },
            ],
            fileName: "payrollcalc-corporation-tax-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Set aside a month"
        value={fmtMoney(result.monthlySetAside)}
      />
    </div>
  );
}
