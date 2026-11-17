"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateAnnuity,
  type AnnuityEscalation,
  type AnnuityGuaranteeYears,
} from "@/lib/annuity";

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

export default function AnnuityCalculator() {
  const [pot, setPot] = useState("100000");
  const [taxFree, setTaxFree] = useState("25");
  const [age, setAge] = useState("65");
  const [life, setLife] = useState("single");
  const [escalation, setEscalation] = useState<AnnuityEscalation>("level");
  const [guarantee, setGuarantee] = useState("0");

  const potNumber = parseAmount(pot);
  const taxFreePercent = Math.min(100, Math.max(0, parseAmount(taxFree)));
  const ageNumber = Math.min(100, Math.max(18, Math.floor(parseAmount(age)) || 65));
  const guaranteeYears = (Number(guarantee) || 0) as AnnuityGuaranteeYears;

  const result = useMemo(
    () =>
      calculateAnnuity({
        pot: potNumber,
        taxFreePercent,
        age: ageNumber,
        jointLife: life === "joint",
        escalation,
        guaranteeYears,
      }),
    [potNumber, taxFreePercent, ageNumber, life, escalation, guaranteeYears],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="annuity-pot" className={labelClass}>
            Pension pot (£)
          </label>
          <input
            id="annuity-pot"
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={pot}
            onChange={(e) => setPot(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The whole pot, before any tax-free cash comes off.
          </p>
        </div>

        <div>
          <label htmlFor="annuity-tax-free" className={labelClass}>
            Tax-free cash taken first (%)
          </label>
          <input
            id="annuity-tax-free"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="1"
            value={taxFree}
            onChange={(e) => setTaxFree(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Usually 25% — the most that can normally be taken tax-free.
            Only what is left buys the annuity.
          </p>
        </div>

        <div>
          <label htmlFor="annuity-age" className={labelClass}>
            Age at purchase
          </label>
          <input
            id="annuity-age"
            type="number"
            inputMode="numeric"
            min="55"
            max="75"
            step="1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rates are anchored at ages 55 to 75 — the older you buy,
            the higher the income per £100,000.
          </p>
        </div>

        <div>
          <label htmlFor="annuity-life" className={labelClass}>
            Single or joint life?
          </label>
          <select
            id="annuity-life"
            value={life}
            onChange={(e) => setLife(e.target.value)}
            className={inputClass}
          >
            <option value="single">Single life — stops at your death</option>
            <option value="joint">
              Joint life — 50% continues to a spouse or partner
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Joint life pays less at the start because it is expected
            to pay out for longer.
          </p>
        </div>

        <div>
          <label htmlFor="annuity-escalation" className={labelClass}>
            Do payments rise over time?
          </label>
          <select
            id="annuity-escalation"
            value={escalation}
            onChange={(e) =>
              setEscalation(e.target.value as AnnuityEscalation)
            }
            className={inputClass}
          >
            <option value="level">Level — the same every year</option>
            <option value="fixed3">Rising 3% a year</option>
            <option value="rpi">Rising with inflation (RPI)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rising payments start lower — the increase has to be paid
            for out of the early years.
          </p>
        </div>

        <div>
          <label htmlFor="annuity-guarantee" className={labelClass}>
            Guarantee period
          </label>
          <select
            id="annuity-guarantee"
            value={guarantee}
            onChange={(e) => setGuarantee(e.target.value)}
            className={inputClass}
          >
            <option value="0">None</option>
            <option value="5">5 years</option>
            <option value="10">10 years</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            If you die inside the guarantee period, payments continue
            to your estate for the rest of it.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your estimate
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Annuity estimate — inputs used
          </p>
          <p>
            Pot {gbp.format(potNumber)}, {taxFreePercent}% tax-free cash,
            bought at {ageNumber},{" "}
            {life === "joint" ? "joint life (50%)" : "single life"},{" "}
            {escalation === "level"
              ? "level payments"
              : escalation === "fixed3"
                ? "payments rising 3% a year"
                : "payments rising with RPI"}
            , {guaranteeYears === 0 ? "no guarantee" : `${guaranteeYears}-year guarantee`}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.annualIncome)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Estimated annuity income per year —{" "}
          {gbp.format(result.monthlyIncome)} a month
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Tax-free cash taken first
                </td>
                <td className="py-2">{gbp.format(result.taxFreeCash)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Pot left to buy the annuity
                </td>
                <td className="py-2">{gbp.format(result.annuitisedPot)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Rate used (income per £100,000)
                </td>
                <td className="py-2">{gbp.format(result.ratePer100k)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income per year
                </td>
                <td className="py-2">{gbp.format(result.annualIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Income per month
                </td>
                <td className="py-2">{gbp.format(result.monthlyIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            This is an estimate from typical November 2026 market
            rates for a buyer in good health — not a quote. A real
            quote depends on the provider, your health and postcode,
            and the options chosen, and can be higher or lower.
            Annuity income is taxed as income, like a salary.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Estimated annuity income per year"
        value={gbp.format(result.annualIncome)}
      />
    </div>
  );
}
