"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateDrawdown,
  monteCarloDrawdown,
  sustainableWithdrawal,
  DRAWDOWN_CONSTANTS,
  type DrawdownInput,
  type MonteCarloResult,
} from "@/lib/pension-drawdown";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function PensionDrawdownCalculator() {
  const [currentAge, setCurrentAge] = useState("60");
  const [pot, setPot] = useState("400000");
  const [cashMode, setCashMode] = useState<"none" | "25" | "custom">("25");
  const [customCash, setCustomCash] = useState("50000");
  const [annualWithdrawal, setAnnualWithdrawal] = useState("12000");
  const [indexWithdrawals, setIndexWithdrawals] = useState(true);
  const [growth, setGrowth] = useState("5");
  const [inflation, setInflation] = useState("2.5");
  const [statePension, setStatePension] = useState(
    String(DRAWDOWN_CONSTANTS.fullNewStatePension),
  );
  const [statePensionAge, setStatePensionAge] = useState("67");
  const [otherIncome, setOtherIncome] = useState("0");
  const [planToAge, setPlanToAge] = useState("95");
  const [simulation, setSimulation] = useState<MonteCarloResult | null>(null);

  const potNumber = parseAmount(pot);
  const taxFreeCashNow =
    cashMode === "25"
      ? Math.min(potNumber * 0.25, DRAWDOWN_CONSTANTS.lumpSumAllowance)
      : cashMode === "custom"
        ? parseAmount(customCash)
        : 0;

  const input: DrawdownInput = useMemo(
    () => ({
      currentAge: parseAmount(currentAge) || 60,
      pot: potNumber,
      taxFreeCashNow,
      annualWithdrawal: parseAmount(annualWithdrawal),
      indexWithdrawals,
      growthPercent: parseAmount(growth),
      inflationPercent: parseAmount(inflation),
      statePensionAnnual: parseAmount(statePension),
      statePensionAge: parseAmount(statePensionAge) || 67,
      otherIncomeAnnual: parseAmount(otherIncome),
      planToAge: parseAmount(planToAge) || 95,
    }),
    [
      currentAge, potNumber, taxFreeCashNow, annualWithdrawal, indexWithdrawals,
      growth, inflation, statePension, statePensionAge, otherIncome, planToAge,
    ],
  );

  const result = useMemo(() => calculateDrawdown(input), [input]);
  const sustainable = useMemo(() => sustainableWithdrawal(input), [input]);

  const headline = result.lastsToPlanAge
    ? `Lasts past age ${input.planToAge}`
    : `Runs out at age ${result.depletionAge}`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="pd-age" className={labelClass}>Your age now</label>
          <input id="pd-age" inputMode="numeric" value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pd-pot" className={labelClass}>Pension pot (£)</label>
          <input id="pd-pot" inputMode="decimal" value={pot}
            onChange={(e) => setPot(e.target.value)} className={inputClass} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Defined-contribution pensions only — SIPPs, personal and
            workplace money-purchase pots.
          </p>
        </div>
        <div>
          <label htmlFor="pd-cash" className={labelClass}>Tax-free cash at the start</label>
          <select id="pd-cash" value={cashMode}
            onChange={(e) => setCashMode(e.target.value as "none" | "25" | "custom")}
            className={inputClass}>
            <option value="25">Take 25% now ({gbp.format(Math.min(potNumber * 0.25, DRAWDOWN_CONSTANTS.lumpSumAllowance))})</option>
            <option value="none">None — leave it in the pot (25% of each withdrawal stays tax-free)</option>
            <option value="custom">Custom amount…</option>
          </select>
          {cashMode === "custom" && (
            <input inputMode="decimal" value={customCash}
              onChange={(e) => setCustomCash(e.target.value)}
              className={`${inputClass} mt-2`} aria-label="Custom tax-free cash amount" />
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tax-free cash is capped at the £268,275 Lump Sum Allowance
            across your lifetime.
          </p>
        </div>
        <div>
          <label htmlFor="pd-withdrawal" className={labelClass}>
            Withdrawal wanted per year (£, today&apos;s money)
          </label>
          <input id="pd-withdrawal" inputMode="decimal" value={annualWithdrawal}
            onChange={(e) => setAnnualWithdrawal(e.target.value)} className={inputClass} />
          <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={indexWithdrawals}
              onChange={(e) => setIndexWithdrawals(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300" />
            Rise with inflation each year
          </label>
        </div>
        <div>
          <label htmlFor="pd-growth" className={labelClass}>Expected investment growth (% a year)</label>
          <input id="pd-growth" inputMode="decimal" value={growth}
            onChange={(e) => setGrowth(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pd-inflation" className={labelClass}>Inflation (% a year)</label>
          <input id="pd-inflation" inputMode="decimal" value={inflation}
            onChange={(e) => setInflation(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pd-sp" className={labelClass}>State Pension per year (£, today&apos;s money)</label>
          <input id="pd-sp" inputMode="decimal" value={statePension}
            onChange={(e) => setStatePension(e.target.value)} className={inputClass} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Full new State Pension is £12,547.60 a year in 2026/27
            (£241.30 a week). Set 0 if you will not get it.
          </p>
        </div>
        <div>
          <label htmlFor="pd-spa" className={labelClass}>State Pension starts at age</label>
          <input id="pd-spa" inputMode="numeric" value={statePensionAge}
            onChange={(e) => setStatePensionAge(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pd-other" className={labelClass}>Other income per year (£, today&apos;s money)</label>
          <input id="pd-other" inputMode="decimal" value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)} className={inputClass} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rent, a defined-benefit pension, part-time work — taxed
            alongside your withdrawals.
          </p>
        </div>
        <div>
          <label htmlFor="pd-plan" className={labelClass}>Plan until age</label>
          <input id="pd-plan" inputMode="numeric" value={planToAge}
            onChange={(e) => setPlanToAge(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-slate-800/60 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {result.lastsToPlanAge
            ? `Your pot lasts past age ${input.planToAge}`
            : `Your pot runs out at age ${result.depletionAge}`}
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">Left at age {input.planToAge}</dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.potAtPlanAge)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">Total tax paid</dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.totalTax)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">Withdrawal that lasts to {input.planToAge}</dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(sustainable)} <span className="text-sm font-medium">a year</span>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Total withdrawn {gbp.format(result.totalWithdrawn)}, of which{" "}
          {gbp.format(result.totalTaxFree)} was tax-free. Tax uses the
          2026/27 bands held flat (£12,570 personal allowance, 20% to
          £50,270, 40% to £125,140, 45% above), and each withdrawal is
          treated as UFPLS — 25% tax-free until the £268,275 Lump Sum
          Allowance is used.
        </p>

        <div className="mt-4 print:hidden">
          <button
            type="button"
            onClick={() => setSimulation(monteCarloDrawdown(input))}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Test against 500 market ups and downs
          </button>
          {simulation && (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              In <strong>{simulation.lastedCount} of {simulation.runs}</strong>{" "}
              simulated market paths ({simulation.lastedPercent}%) the pot
              still lasted to age {input.planToAge}; the middle path ended
              with {gbp.format(simulation.medianPotAtPlanAge)}. Each year&apos;s
              return was drawn at random around your {growth}% average with a
              10% spread — an illustration of how much luck matters, not a
              probability about the real world.
            </p>
          )}
        </div>

        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3 font-semibold">Age</th>
                <th className="py-2 pr-3 font-semibold">Withdrawal</th>
                <th className="py-2 pr-3 font-semibold">Tax-free</th>
                <th className="py-2 pr-3 font-semibold">Tax</th>
                <th className="py-2 font-semibold">Pot at year end</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {result.years.map((y) => (
                <tr key={y.age} className={y.shortfall ? "text-red-600 dark:text-red-400" : undefined}>
                  <td className="py-2 pr-3">{y.age}</td>
                  <td className="py-2 pr-3">{gbp.format(y.withdrawal)}</td>
                  <td className="py-2 pr-3">{gbp.format(y.taxFreePart)}</td>
                  <td className="py-2 pr-3">{gbp.format(y.tax)}</td>
                  <td className="py-2">{gbp.format(y.potEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar label="Drawdown verdict" value={headline} />
    </div>
  );
}
