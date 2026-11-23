"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateRequiredSalary } from "@/lib/reverse-salary";
import {
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

type LoanChoice = "none" | StudentLoanPlanId;
type Mode = "target" | "lifestyle";
type Period = "month" | "year";

const LIFESTYLE_FIELDS = [
  { id: "rent", label: "Rent or mortgage (£ a month)", hint: "Your share, if you split it." },
  { id: "councilTax", label: "Council tax (£ a month)", hint: "" },
  { id: "bills", label: "Bills & utilities (£ a month)", hint: "Energy, water, broadband, phone." },
  { id: "food", label: "Food & groceries (£ a month)", hint: "" },
  { id: "transport", label: "Transport (£ a month)", hint: "Car, fuel, railcard, fares." },
  { id: "subscriptions", label: "Subscriptions & fun (£ a month)", hint: "Streaming, gym, going out." },
  { id: "savings", label: "Savings goal (£ a month)", hint: "What you want left over to save." },
  { id: "other", label: "Everything else (£ a month)", hint: "Clothes, gifts, the unexpected." },
] as const;

type LifestyleId = (typeof LIFESTYLE_FIELDS)[number]["id"];

const LIFESTYLE_DEFAULTS: Record<LifestyleId, string> = {
  rent: "1200",
  councilTax: "150",
  bills: "180",
  food: "350",
  transport: "180",
  subscriptions: "40",
  savings: "200",
  other: "100",
};

export default function ReverseSalaryCalculator() {
  const [mode, setMode] = useState<Mode>("target");
  const [target, setTarget] = useState("2500");
  const [period, setPeriod] = useState<Period>("month");
  const [costs, setCosts] =
    useState<Record<LifestyleId, string>>(LIFESTYLE_DEFAULTS);
  const [taxCode, setTaxCode] = useState("1257L");
  const [pension, setPension] = useState("0");
  const [loan, setLoan] = useState<LoanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  const reset = () => {
    setMode("target");
    setTarget("2500");
    setPeriod("month");
    setCosts(LIFESTYLE_DEFAULTS);
    setTaxCode("1257L");
    setPension("0");
    setLoan("none");
    setPgToo(false);
  };

  const lifestyleMonthly = LIFESTYLE_FIELDS.reduce(
    (sum, f) => sum + parseAmount(costs[f.id]),
    0,
  );
  const targetMonthly =
    mode === "lifestyle"
      ? lifestyleMonthly
      : period === "month"
        ? parseAmount(target)
        : parseAmount(target) / 12;

  const result = useMemo(
    () =>
      calculateRequiredSalary({
        targetNetAnnual: targetMonthly * 12,
        taxCode,
        pensionPercent: parseAmount(pension),
        studentLoanPlan: loan === "none" ? null : loan,
        postgraduateLoanToo:
          loan !== "none" && loan !== "postgraduate" && pgToo,
      }),
    [targetMonthly, taxCode, pension, loan, pgToo],
  );
  const b = result.breakdown;

  const rows: { label: string; monthly: string; annual: string }[] = [
    {
      label: "Gross pay",
      monthly: gbp.format(b.grossMonthly),
      annual: gbp.format(b.grossAnnual),
    },
    ...(b.pensionMonthly > 0
      ? [
          {
            label: "Pension contribution (before tax, not before NI)",
            monthly: `− ${gbp.format(b.pensionMonthly)}`,
            annual: `− ${gbp.format(b.pensionAnnual)}`,
          },
        ]
      : []),
    {
      label: `Income Tax (code ${b.taxCode})`,
      monthly: `− ${gbp.format(b.incomeTaxMonthly)}`,
      annual: `− ${gbp.format(b.incomeTaxAnnual)}`,
    },
    {
      label: "National Insurance",
      monthly: `− ${gbp.format(b.employeeNiMonthly)}`,
      annual: `− ${gbp.format(b.employeeNiAnnual)}`,
    },
    ...(b.studentLoanMonthly > 0
      ? [
          {
            label: "Student loan repayment",
            monthly: `− ${gbp.format(b.studentLoanMonthly)}`,
            annual: `− ${gbp.format(b.studentLoanAnnual)}`,
          },
        ]
      : []),
    {
      label: "Take-home pay — your target",
      monthly: gbp.format(b.netMonthly),
      annual: gbp.format(b.netAnnual),
    },
  ];

  const modeButton = (m: Mode, text: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={
        mode === m
          ? "rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50"
      }
    >
      {text}
    </button>
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="print:hidden">
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
          {modeButton("target", "I know the take-home I need")}
          {modeButton("lifestyle", "Build it from my monthly costs")}
        </div>

        {mode === "target" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MoneySlider
              id="rs-target"
              label={
                period === "month"
                  ? "Take-home pay you need (£ a month)"
                  : "Take-home pay you need (£ a year)"
              }
              value={target}
              onChange={setTarget}
              min={0}
              max={period === "month" ? 10000 : 120000}
              step={period === "month" ? 50 : 500}
              hint="The amount that must land in your account after tax, NI, pension and student loan — the figure your budget runs on."
              trailing={
                <select
                  aria-label="Target period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2.5 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
                >
                  <option value="month">per month</option>
                  <option value="year">per year</option>
                </select>
              }
            />
          </div>
        ) : (
          <div className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {LIFESTYLE_FIELDS.map((f) => (
                <div key={f.id}>
                  <label htmlFor={`rs-${f.id}`} className={labelClass}>
                    {f.label}
                  </label>
                  <input
                    id={`rs-${f.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={10}
                    value={costs[f.id]}
                    onChange={(e) =>
                      setCosts((c) => ({ ...c, [f.id]: e.target.value }))
                    }
                    className={inputClass}
                  />
                  {f.hint && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {f.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Your costs add up to{" "}
              <strong>{gbp.format(lifestyleMonthly)} a month</strong> —{" "}
              {gbp.format(lifestyleMonthly * 12)} a year of take-home pay
              to find. The salary below is the gross that leaves exactly
              that in your account.
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="rs-code" className={labelClass}>
              Your tax code
            </label>
            <input
              id="rs-code"
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              1257L is the standard code. Leave it unless yours is
              different — it is on your payslip.
            </p>
          </div>

          <MoneySlider
            id="rs-pension"
            label="Your pension contribution (% of gross pay)"
            value={pension}
            onChange={setPension}
            min={0}
            max={40}
            step={0.5}
            hint="The auto-enrolment employee minimum is 5%. Modelled as a net-pay arrangement — it reduces your tax, not your NI."
          />

          <div>
            <label htmlFor="rs-loan" className={labelClass}>
              Student loan plan
            </label>
            <select
              id="rs-loan"
              value={loan}
              onChange={(e) => setLoan(e.target.value as LoanChoice)}
              className={inputClass}
            >
              <option value="none">No student loan</option>
              {STUDENT_LOAN_PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {loan !== "none" && loan !== "postgraduate" && (
            <div className="sm:col-span-3">
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={pgToo}
                  onChange={(e) => setPgToo(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
                />
                <span>I also repay a Postgraduate Loan at the same time</span>
              </label>
            </div>
          )}

          {!b.taxCodeRecognised && (
            <p className="text-sm text-amber-700 dark:text-amber-400 sm:col-span-3">
              That tax code could not be read, so the standard 1257L
              figures are shown. Check the code on your last payslip.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2026/27 rules for England, Wales and Northern Ireland.
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          The gross salary you need, 2026/27
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Required salary — inputs used
          </p>
          <p>
            Take-home target: {gbp.format(result.targetNetAnnual)} a
            year · Tax code: {b.taxCode} · Pension:{" "}
            {parseAmount(pension)}% · Student loan:{" "}
            {loan === "none" ? "none" : loan}. 2026/27 rules, England,
            Wales and Northern Ireland.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.requiredGrossAnnual)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            a year — {gbp.format(result.requiredGrossMonthly)} a month
            gross
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          At that salary your take-home is{" "}
          {gbp.format(result.achievedNetMonthly)} a month (
          {gbp.format(result.achievedNetAnnual)} a year) — your target,
          reached. The solver returns the smallest gross whose
          take-home is at least the target, so you are never left a
          penny short.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-brand-900">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  At that salary, each month
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per month
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                    {r.label}
                  </td>
                  <td className="py-2">{r.monthly}</td>
                  <td className="py-2">{r.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ResultActions
          image={{
            title: "Required Salary Calculator",
            headline: `${gbp.format(result.requiredGrossAnnual)} gross`,
            headlineNote: `Gross salary needed to take home ${gbp.format(result.targetNetAnnual)} a year, 2026/27`,
            rows: [
              {
                label: "Take-home target",
                value: `${gbp.format(result.targetNetAnnual)} a year`,
              },
              {
                label: "Gross salary needed",
                value: gbp.format(result.requiredGrossAnnual),
              },
              { label: "Income Tax", value: gbp.format(b.incomeTaxAnnual) },
              {
                label: "National Insurance",
                value: gbp.format(b.employeeNiAnnual),
              },
              ...(b.pensionAnnual > 0
                ? [
                    {
                      label: "Pension",
                      value: gbp.format(b.pensionAnnual),
                    },
                  ]
                : []),
              ...(b.studentLoanAnnual > 0
                ? [
                    {
                      label: "Student loan",
                      value: gbp.format(b.studentLoanAnnual),
                    },
                  ]
                : []),
              {
                label: "Take-home achieved",
                value: gbp.format(result.achievedNetAnnual),
              },
            ],
            fileName: "payrollcalc-required-salary-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Gross salary you need"
        value={`${gbp.format(result.requiredGrossAnnual)} a year`}
      />
    </div>
  );
}
