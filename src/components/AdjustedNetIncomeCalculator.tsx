"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  ANI_RULES,
  calculateAdjustedNetIncome,
  type AniTaxYear,
} from "@/lib/adjusted-net-income";

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

const BAR_MAX = 130000;

const THRESHOLDS: { limit: number; label: string; effect: string }[] = [
  {
    limit: ANI_RULES.hicbcStart,
    label: "£60,000",
    effect: "Child Benefit charge starts",
  },
  {
    limit: ANI_RULES.hicbcFull,
    label: "£80,000",
    effect: "Child Benefit fully repaid",
  },
  {
    limit: ANI_RULES.paTaperStart,
    label: "£100,000",
    effect: "Personal Allowance taper + childcare stops",
  },
  {
    limit: ANI_RULES.additionalRateThreshold,
    label: "£125,140",
    effect: "Personal Allowance gone · additional rate",
  },
];

export default function AdjustedNetIncomeCalculator() {
  const [taxYear, setTaxYear] = useState<AniTaxYear>("2026/27");
  const [employment, setEmployment] = useState("110000");
  const [selfEmployment, setSelfEmployment] = useState("");
  const [savings, setSavings] = useState("");
  const [dividends, setDividends] = useState("");
  const [property, setProperty] = useState("");
  const [other, setOther] = useState("");
  const [pensionNet, setPensionNet] = useState("8000");
  const [giftAidNet, setGiftAidNet] = useState("");

  const result = useMemo(
    () =>
      calculateAdjustedNetIncome({
        taxYear,
        employmentIncome: parseAmount(employment),
        selfEmploymentProfit: parseAmount(selfEmployment),
        savingsIncome: parseAmount(savings),
        dividendIncome: parseAmount(dividends),
        propertyIncome: parseAmount(property),
        otherIncome: parseAmount(other),
        pensionPaidNet: parseAmount(pensionNet),
        giftAidPaidNet: parseAmount(giftAidNet),
      }),
    [
      taxYear,
      employment,
      selfEmployment,
      savings,
      dividends,
      property,
      other,
      pensionNet,
      giftAidNet,
    ],
  );

  const ani = result.adjustedNetIncome;
  const barPct = Math.min(100, (ani / BAR_MAX) * 100);

  const incomeFields: {
    id: string;
    label: string;
    hint: string;
    value: string;
    set: (v: string) => void;
  }[] = [
    {
      id: "ani-employment",
      label: "Employment income (£)",
      hint: "Salary, wages, bonus and taxable benefits — before tax, and before any pension you pay yourself. Pay given up under salary sacrifice is already excluded.",
      value: employment,
      set: setEmployment,
    },
    {
      id: "ani-self-employment",
      label: "Self-employment profit (£)",
      hint: "Your taxable profit for the tax year, after expenses.",
      value: selfEmployment,
      set: setSelfEmployment,
    },
    {
      id: "ani-savings",
      label: "Savings income (£)",
      hint: "Interest from savings and bonds. It all counts, even the part covered by the Personal Savings Allowance.",
      value: savings,
      set: setSavings,
    },
    {
      id: "ani-dividends",
      label: "Dividend income (£)",
      hint: "Dividends from shares outside an ISA, including the part covered by the dividend allowance.",
      value: dividends,
      set: setDividends,
    },
    {
      id: "ani-property",
      label: "Property income (£)",
      hint: "Rental profit after allowable expenses.",
      value: property,
      set: setProperty,
    },
    {
      id: "ani-other",
      label: "Other income (£)",
      hint: "Pensions in payment, foreign income and anything else taxable.",
      value: other,
      set: setOther,
    },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ani-year" className={labelClass}>
            Tax year
          </label>
          <select
            id="ani-year"
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value as AniTaxYear)}
            className={inputClass}
          >
            <option value="2026/27">2026/27 (6 April 2026 – 5 April 2027)</option>
            <option value="2025/26">2025/26 (6 April 2025 – 5 April 2026)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The four thresholds and the £12,570 Personal Allowance are
            the same in both years — the year matters for your tax
            return, not for the maths.
          </p>
        </div>
        <div className="hidden sm:block" />
        {incomeFields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className={labelClass}>
              {f.label}
            </label>
            <input
              id={f.id}
              inputMode="decimal"
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {f.hint}
            </p>
          </div>
        ))}
        <div>
          <label htmlFor="ani-pension" className={labelClass}>
            Pension contributions you paid (£)
          </label>
          <input
            id="ani-pension"
            inputMode="decimal"
            value={pensionNet}
            onChange={(e) => setPensionNet(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Personal pension or SIPP payments where the provider adds
            basic-rate relief — enter what actually left your bank
            account and we gross it up (× 1.25). Leave out workplace
            pensions taken from your pay and employer contributions:
            they never reach your taxable income.
          </p>
        </div>
        <div>
          <label htmlFor="ani-giftaid" className={labelClass}>
            Gift Aid donations you paid (£)
          </label>
          <input
            id="ani-giftaid"
            inputMode="decimal"
            value={giftAidNet}
            onChange={(e) => setGiftAidNet(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What you actually gave to charity under Gift Aid — we gross
            it up (× 1.25) the way HMRC does.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-slate-800/60 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Your adjusted net income — {result.taxYear}
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Adjusted net income
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(ani)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Child Benefit charge
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {result.hicbcPercent}%
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              of Child Benefit repaid, if you or your partner claim it
            </p>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Personal Allowance
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.personalAllowance)}
            </dd>
            {result.personalAllowanceLost > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {gbp.format(result.personalAllowanceLost)} lost to the
                £100,000 taper
              </p>
            )}
          </div>
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-2 pr-3">Total taxable income</td>
                <td className="py-2 text-right font-medium">
                  {gbp.format(result.totalIncome)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Less pension contributions (grossed up)
                </td>
                <td className="py-2 text-right font-medium">
                  −{gbp.format(result.pensionGross)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Less Gift Aid donations (grossed up)
                </td>
                <td className="py-2 text-right font-medium">
                  −{gbp.format(result.giftAidGross)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Adjusted net income</td>
                <td className="py-2 text-right">{gbp.format(ani)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Where you sit against the four lines
          </h3>
          <div
            className="relative mt-3 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700"
            role="img"
            aria-label={`Your adjusted net income of ${gbp.format(ani)} on a scale to £130,000 with markers at £60,000, £80,000, £100,000 and £125,140`}
          >
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${barPct}%` }}
            />
            {THRESHOLDS.map((t) => (
              <div
                key={t.limit}
                className="absolute top-[-3px] h-4 w-0.5 bg-slate-500 dark:bg-slate-300"
                style={{ left: `${(t.limit / BAR_MAX) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative mt-1 h-4 text-[11px] text-slate-500 dark:text-slate-400">
            {THRESHOLDS.map((t) => (
              <span
                key={t.limit}
                className="absolute -translate-x-1/2"
                style={{ left: `${(t.limit / BAR_MAX) * 100}%` }}
              >
                {t.label}
              </span>
            ))}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm table-stack">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {THRESHOLDS.map((t) => {
                  const over = ani > t.limit || (t.limit === ANI_RULES.additionalRateThreshold && ani >= t.limit);
                  return (
                    <tr key={t.limit}>
                      <td className="py-2 pr-3 font-medium">{t.label}</td>
                      <td className="py-2 pr-3">{t.effect}</td>
                      <td className="py-2 text-right font-medium">
                        {over ? (
                          <span className="text-red-600 dark:text-red-400">
                            Over the line
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Under — {gbp.format(t.limit - ani)} of room
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {!result.taxFreeChildcareEligible && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ Over £100,000: Tax-Free Childcare and the funded
              childcare hours for working parents stop completely if
              this is your expected income — it is a cliff edge, not a
              taper. A gross pension contribution of{" "}
              {gbp.format(result.pensionGrossTo100k)} would bring you
              back to exactly £100,000; at relief at source that costs{" "}
              {gbp.format(result.pensionNetTo100k)} out of your own
              pocket.
            </p>
          )}
          {result.taxFreeChildcareEligible && ani > ANI_RULES.hicbcStart && (
            <p>
              You keep Tax-Free Childcare eligibility and your full or
              reduced Personal Allowance position is shown above — but
              between £60,000 and £80,000 the Child Benefit charge is
              live. A gross pension contribution of{" "}
              {gbp.format(result.pensionGrossTo60k)} would take you to
              £60,000 and end the charge; at relief at source that costs{" "}
              {gbp.format(result.pensionNetTo60k)} out of pocket.
            </p>
          )}
          {ani <= ANI_RULES.hicbcStart && (
            <p>
              You are under every line: no Child Benefit charge, the
              full £12,570 Personal Allowance, and Tax-Free Childcare
              eligibility kept. The line most people drift over without
              noticing is £60,000 — a bonus or a pay rise can move you
              across it mid-year, and the charge is worked out on the
              whole tax year.
            </p>
          )}
          {result.overAdditionalRateThreshold && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ At £125,140 and above your Personal Allowance is £0 and
              the additional rate of income tax (45% in England, Wales
              and Northern Ireland) applies.
            </p>
          )}
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Your adjusted net income"
        value={gbp.format(ani)}
      />
    </div>
  );
}
