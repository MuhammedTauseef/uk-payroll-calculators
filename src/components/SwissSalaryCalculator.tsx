"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateSwissSalary,
  CANTONS,
  SWISS_SOCIAL,
  type SwissMaritalStatus,
} from "@/lib/swiss-salary";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtCHF(n: number): string {
  return `CHF ${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function SwissSalaryCalculator() {
  const [salary, setSalary] = useState("100000");
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");
  const [thirteenth, setThirteenth] = useState(false);
  const [canton, setCanton] = useState("ZH");
  const [maritalStatus, setMaritalStatus] =
    useState<SwissMaritalStatus>("single");
  const [children, setChildren] = useState("0");
  const [churchMember, setChurchMember] = useState(false);
  const [nbuPercent, setNbuPercent] = useState(
    String(SWISS_SOCIAL.nbuDefaultPercent),
  );

  const reset = () => {
    setSalary("100000");
    setPeriod("annual");
    setThirteenth(false);
    setCanton("ZH");
    setMaritalStatus("single");
    setChildren("0");
    setChurchMember(false);
    setNbuPercent(String(SWISS_SOCIAL.nbuDefaultPercent));
  };

  const entered = parseAmount(salary);
  const paymentsPerYear = period === "monthly" ? (thirteenth ? 13 : 12) : 12;
  const grossAnnual =
    period === "monthly" ? entered * paymentsPerYear : entered;

  const result = useMemo(
    () =>
      calculateSwissSalary({
        grossAnnual,
        canton,
        maritalStatus,
        children: parseAmount(children),
        churchMember,
        nbuPercent: parseAmount(nbuPercent),
      }),
    [grossAnnual, canton, maritalStatus, children, churchMember, nbuPercent],
  );

  const netPerPayment = result.netAnnual / paymentsPerYear;

  const rows: { label: string; value: number; kind: "minus" | "total" | "net" }[] = [
    { label: "AHV/IV/EO (old age, disability, loss of earnings) — 5.3%", value: result.ahv, kind: "minus" },
    { label: "ALV (unemployment insurance) — 1.1% up to CHF 148,200", value: result.alv, kind: "minus" },
    { label: `NBU (non-occupational accident) — ${result.nbuPercent}%`, value: result.nbu, kind: "minus" },
    { label: "BVG/LPP pension fund (2nd pillar)", value: result.bvg, kind: "minus" },
    { label: "Federal direct tax", value: result.federalTax, kind: "minus" },
    { label: `Cantonal tax (${result.canton.name})`, value: result.cantonalTax, kind: "minus" },
    { label: `Municipal tax (${result.canton.capital})`, value: result.municipalTax, kind: "minus" },
  ];
  if (result.churchTax > 0) {
    rows.push({ label: "Church tax", value: result.churchTax, kind: "minus" });
  }
  if (result.personalTax > 0) {
    rows.push({ label: "Personal tax (Zurich)", value: result.personalTax, kind: "minus" });
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <MoneySlider
          id="ch-salary"
          label={
            period === "monthly"
              ? "Gross salary (CHF a month)"
              : "Gross salary (CHF a year)"
          }
          value={salary}
          onChange={setSalary}
          min={0}
          max={period === "monthly" ? 25000 : 300000}
          step={period === "monthly" ? 100 : 1000}
          hint="Your gross salary before any deductions — the figure in your employment contract."
          trailing={
            <select
              aria-label="Salary period"
              className={`${inputClass} w-auto`}
              value={period}
              onChange={(e) => setPeriod(e.target.value as "annual" | "monthly")}
            >
              <option value="annual">per year</option>
              <option value="monthly">per month</option>
            </select>
          }
        />
        <div>
          <label htmlFor="ch-canton" className={labelClass}>
            Canton of residence
          </label>
          <select
            id="ch-canton"
            className={inputClass}
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
          >
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            All 26 cantons. Municipal tax uses the cantonal capital,{" "}
            {result.canton.capital} — your own commune may differ.
          </p>
        </div>
        <div>
          <label htmlFor="ch-marital" className={labelClass}>
            Marital status
          </label>
          <select
            id="ch-marital"
            className={inputClass}
            value={maritalStatus}
            onChange={(e) =>
              setMaritalStatus(e.target.value as SwissMaritalStatus)
            }
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="single-parent">Single parent</option>
          </select>
        </div>
        <div>
          <label htmlFor="ch-children" className={labelClass}>
            Children
          </label>
          <select
            id="ch-children"
            className={inputClass}
            value={children}
            onChange={(e) => setChildren(e.target.value)}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ch-nbu" className={labelClass}>
            NBU premium (% of salary)
          </label>
          <input
            id="ch-nbu"
            className={inputClass}
            inputMode="decimal"
            value={nbuPercent}
            onChange={(e) => setNbuPercent(e.target.value)}
          />
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Non-occupational accident insurance, if your employer
            passes it to you. 1.15% is the national average (BSV);
            your payslip shows your own rate.
          </p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
              checked={thirteenth}
              disabled={period === "annual"}
              onChange={(e) => setThirteenth(e.target.checked)}
            />
            My monthly salary is paid 13 times a year
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
              checked={churchMember}
              onChange={(e) => setChurchMember(e.target.checked)}
            />
            I am a member of a recognised church (church tax)
          </label>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2026 rules, ordinary assessment (not withholding tax).
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your net salary in {result.canton.name}, 2026
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Switzerland salary check — inputs used
          </p>
          <p>
            Gross: {fmtCHF(result.grossAnnual)} a year · Canton:{" "}
            {result.canton.name} · Status:{" "}
            {result.maritalStatus === "married"
              ? "Married"
              : result.maritalStatus === "single-parent"
                ? "Single parent"
                : "Single"}{" "}
            · Children: {result.children} · Church tax:{" "}
            {result.churchMember ? "yes" : "no"} · NBU:{" "}
            {result.nbuPercent}%. 2026 rules, ordinary assessment.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtCHF(result.netAnnual)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            net a year — {fmtCHF(netPerPayment)} per salary payment
          </span>
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  Gross salary
                </td>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  {fmtCHF(result.grossAnnual)}
                </td>
              </tr>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2">− {fmtCHF(row.value)}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  Total deductions
                </td>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  − {fmtCHF(result.totalDeductions)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  Net salary
                </td>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  {fmtCHF(result.netAnnual)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Effective rate: </dt>
            <dd className="inline">
              <strong>{result.effectiveRatePercent}%</strong> of your
              gross salary goes to social insurance and tax combined
              — social contributions of {fmtCHF(result.socialTotal)}{" "}
              (including BVG pension on a coordinated salary of{" "}
              {fmtCHF(result.bvgCoordinatedSalary)}) and tax of{" "}
              {fmtCHF(result.taxTotal)}.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Taxable income: </dt>
            <dd className="inline">
              {fmtCHF(result.federalTaxable)} for federal tax and{" "}
              {fmtCHF(result.cantonalTaxable)} for cantonal tax —
              your gross minus social contributions, the 3%
              professional-expenses flat rate and the standard
              insurance and child deductions.
            </dd>
          </div>
        </dl>

        <ResultActions
          image={{
            title: "Salary Calculator Switzerland",
            headline: fmtCHF(result.netAnnual),
            headlineNote: `Net salary in ${result.canton.name}, 2026`,
            rows: [
              { label: "Gross salary", value: fmtCHF(result.grossAnnual) },
              { label: "Social contributions", value: fmtCHF(result.socialTotal) },
              { label: "Federal tax", value: fmtCHF(result.federalTax) },
              { label: "Cantonal tax", value: fmtCHF(result.cantonalTax) },
              { label: "Municipal tax", value: fmtCHF(result.municipalTax) },
              { label: "Net salary", value: fmtCHF(result.netAnnual) },
            ],
            fileName: "payrollcalc-switzerland-salary-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Net salary a year"
        value={fmtCHF(result.netAnnual)}
      />
    </div>
  );
}
