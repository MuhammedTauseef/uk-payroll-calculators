"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  STANDARD_ALLOWANCE_BY_YEAR,
  TAPER_RULES,
  calculateTaperedAnnualAllowance,
  carryForwardYears,
  type TaperTaxYear,
} from "@/lib/tapered-annual-allowance";

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

export default function TaperedAnnualAllowanceCalculator() {
  const [taxYear, setTaxYear] = useState<TaperTaxYear>("2026/27");
  const [employment, setEmployment] = useState("270000");
  const [selfEmployment, setSelfEmployment] = useState("");
  const [property, setProperty] = useState("");
  const [savings, setSavings] = useState("");
  const [dividends, setDividends] = useState("");
  const [other, setOther] = useState("");
  const [pensionNet, setPensionNet] = useState("");
  const [contributionsGross, setContributionsGross] = useState("");
  const [employer, setEmployer] = useState("10000");
  const [sacrifice, setSacrifice] = useState("");
  const [giftAidNet, setGiftAidNet] = useState("");
  const [flexiblyAccessed, setFlexiblyAccessed] = useState(false);
  const [plannedSavings, setPlannedSavings] = useState("");
  const [marginalRate, setMarginalRate] = useState("45");
  // Carry forward, keyed by tax-year label so switching the main
  // tax year keeps each earlier year's figures separate. A blank
  // savings box is treated as "that year's allowance was fully
  // used" — carry forward is only counted when the user enters
  // savings below the year's allowance.
  const [cfSavings, setCfSavings] = useState<Record<string, string>>({});
  const [cfAllowance, setCfAllowance] = useState<Record<string, string>>({});

  const years = carryForwardYears(taxYear);

  const result = useMemo(
    () =>
      calculateTaperedAnnualAllowance({
        taxYear,
        employmentIncome: parseAmount(employment),
        selfEmploymentProfit: parseAmount(selfEmployment),
        propertyIncome: parseAmount(property),
        savingsIncome: parseAmount(savings),
        dividendIncome: parseAmount(dividends),
        otherIncome: parseAmount(other),
        pensionPaidNet: parseAmount(pensionNet),
        contributionsGross: parseAmount(contributionsGross),
        employerContributions: parseAmount(employer),
        salarySacrifice: parseAmount(sacrifice),
        giftAidPaidNet: parseAmount(giftAidNet),
        flexiblyAccessed,
        plannedSavings: parseAmount(plannedSavings),
        marginalRatePercent: parseAmount(marginalRate),
        carryForward: years.map((y) => {
          const allowanceStr = cfAllowance[y];
          const allowance =
            allowanceStr !== undefined && allowanceStr !== ""
              ? parseAmount(allowanceStr)
              : (STANDARD_ALLOWANCE_BY_YEAR[y] ?? TAPER_RULES.standardAllowance);
          const savingsStr = cfSavings[y];
          return {
            year: y,
            allowance,
            pensionSavings:
              savingsStr === undefined || savingsStr === ""
                ? allowance
                : parseAmount(savingsStr),
          };
        }),
      }),
    [
      taxYear,
      employment,
      selfEmployment,
      property,
      savings,
      dividends,
      other,
      pensionNet,
      contributionsGross,
      employer,
      sacrifice,
      giftAidNet,
      flexiblyAccessed,
      plannedSavings,
      marginalRate,
      cfSavings,
      cfAllowance,
      years,
    ],
  );

  const incomeFields: {
    id: string;
    label: string;
    hint: string;
    value: string;
    set: (v: string) => void;
  }[] = [
    {
      id: "taper-employment",
      label: "Employment income (£)",
      hint: "Salary, bonus and taxable benefits before tax. Enter pay AFTER any salary sacrifice (sacrifice is a separate box below) but BEFORE workplace pension contributions taken under a net-pay arrangement.",
      value: employment,
      set: setEmployment,
    },
    {
      id: "taper-self-employment",
      label: "Self-employment profit (£)",
      hint: "Your taxable profit for the tax year, after expenses.",
      value: selfEmployment,
      set: setSelfEmployment,
    },
    {
      id: "taper-property",
      label: "Property income (£)",
      hint: "Rental profit after allowable expenses.",
      value: property,
      set: setProperty,
    },
    {
      id: "taper-savings",
      label: "Savings income (£)",
      hint: "Interest from savings and bonds. It all counts, even the part covered by the Personal Savings Allowance.",
      value: savings,
      set: setSavings,
    },
    {
      id: "taper-dividends",
      label: "Dividend income (£)",
      hint: "Dividends from shares outside an ISA, including the part covered by the dividend allowance.",
      value: dividends,
      set: setDividends,
    },
    {
      id: "taper-other",
      label: "Other income (£)",
      hint: "Pensions in payment, trust and foreign income, and anything else taxable.",
      value: other,
      set: setOther,
    },
  ];

  const escapeTotal = result.plannedSavings + result.escapeContributionGross;
  const escapeRestoredAvailable = TAPER_RULES.standardAllowance + result.totalCarryForward;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="taper-year" className={labelClass}>
            Tax year
          </label>
          <select
            id="taper-year"
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value as TaperTaxYear)}
            className={inputClass}
          >
            <option value="2026/27">2026/27 (6 April 2026 – 5 April 2027)</option>
            <option value="2025/26">2025/26 (6 April 2025 – 5 April 2026)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The £60,000 allowance and both income limits are the same
            in both years — the year matters for your tax return and
            for which earlier years feed carry forward.
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
          <label htmlFor="taper-pension-net" className={labelClass}>
            Personal pension contributions you paid (£)
          </label>
          <input
            id="taper-pension-net"
            inputMode="decimal"
            value={pensionNet}
            onChange={(e) => setPensionNet(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Personal pension or SIPP payments where the provider adds
            basic-rate relief — enter what actually left your bank
            account and we gross it up (× 1.25). These reduce your
            threshold income only.
          </p>
        </div>
        <div>
          <label htmlFor="taper-contributions-gross" className={labelClass}>
            Workplace pension taken from your pay before tax (£)
          </label>
          <input
            id="taper-contributions-gross"
            inputMode="decimal"
            value={contributionsGross}
            onChange={(e) => setContributionsGross(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Contributions under a net-pay arrangement, or paid gross
            with relief claimed on your return — the gross amount.
            They come off your income, then go back into adjusted
            income, so they do not dodge the taper.
          </p>
        </div>
        <div>
          <label htmlFor="taper-employer" className={labelClass}>
            Employer pension contributions (£)
          </label>
          <input
            id="taper-employer"
            inputMode="decimal"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What your employer pays in, not counting anything you
            sacrificed (next box). In a defined benefit scheme (NHS,
            teachers, civil service) enter the pension input amount
            from your annual benefit statement instead.
          </p>
        </div>
        <div>
          <label htmlFor="taper-sacrifice" className={labelClass}>
            Salary sacrificed into your pension (£)
          </label>
          <input
            id="taper-sacrifice"
            inputMode="decimal"
            value={sacrifice}
            onChange={(e) => setSacrifice(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pay given up for pension contributions under an
            arrangement made after 8 July 2015. HMRC adds it back to
            threshold income and counts it as an employer saving in
            adjusted income — sacrifice alone cannot escape the taper.
          </p>
        </div>
        <div>
          <label htmlFor="taper-giftaid" className={labelClass}>
            Gift Aid donations you paid (£)
          </label>
          <input
            id="taper-giftaid"
            inputMode="decimal"
            value={giftAidNet}
            onChange={(e) => setGiftAidNet(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Optional, and shown in the breakdown for one reason: Gift
            Aid does NOT reduce threshold or adjusted income. It
            reduces adjusted net income — the Child Benefit test —
            instead.
          </p>
        </div>
        <div>
          <label htmlFor="taper-planned" className={labelClass}>
            Total pension savings this year (£)
          </label>
          <input
            id="taper-planned"
            inputMode="decimal"
            value={plannedSavings}
            onChange={(e) => setPlannedSavings(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Everything going into your pensions this year — yours,
            your employer&apos;s and any defined benefit growth — so
            we can show any excess and its tax charge. Leave blank to
            skip.
          </p>
        </div>
        <div>
          <label htmlFor="taper-rate" className={labelClass}>
            Your marginal income tax rate
          </label>
          <select
            id="taper-rate"
            value={marginalRate}
            onChange={(e) => setMarginalRate(e.target.value)}
            className={inputClass}
          >
            <option value="45">45% — additional rate</option>
            <option value="40">40% — higher rate</option>
            <option value="20">20% — basic rate</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used only to estimate the tax charge on any excess over
            your available allowance.
          </p>
        </div>
        <div className="flex items-start gap-3 pt-1">
          <input
            id="taper-mpaa"
            type="checkbox"
            checked={flexiblyAccessed}
            onChange={(e) => setFlexiblyAccessed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
          />
          <label htmlFor="taper-mpaa" className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">I have flexibly accessed a pension</span>{" "}
            — for example taking taxable cash or income from a SIPP.
            This triggers the £10,000 money purchase annual allowance
            (MPAA), which no taper and no carry forward can change.
          </label>
        </div>
      </div>

      <div className="mt-6 print:hidden">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Carry forward — pension savings in the last three tax years
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Leave a year blank if its allowance was fully used. If you
          were tapered in a year, replace its allowance with your
          tapered figure. You must have been a pension scheme member
          in a year to carry forward from it.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {years.map((y) => (
            <div key={y} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{y}</p>
              <label htmlFor={`cf-savings-${y}`} className="mt-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Pension savings (£)
              </label>
              <input
                id={`cf-savings-${y}`}
                inputMode="decimal"
                value={cfSavings[y] ?? ""}
                onChange={(e) => setCfSavings((s) => ({ ...s, [y]: e.target.value }))}
                className={inputClass}
              />
              <label htmlFor={`cf-allowance-${y}`} className="mt-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Allowance that year (£)
              </label>
              <input
                id={`cf-allowance-${y}`}
                inputMode="decimal"
                value={cfAllowance[y] ?? String(STANDARD_ALLOWANCE_BY_YEAR[y] ?? 60000)}
                onChange={(e) => setCfAllowance((s) => ({ ...s, [y]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-slate-800/60 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Your tapered annual allowance — {result.taxYear}
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Threshold income
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.thresholdIncome)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.thresholdTestPassed
                ? "Over the £200,000 line"
                : "At or under £200,000 — the taper cannot apply"}
            </p>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Adjusted income
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.adjustedIncome)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.adjustedTestPassed
                ? "Over the £260,000 line"
                : "At or under £260,000 — no reduction"}
            </p>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Your annual allowance
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.mpaaApplies ? result.moneyPurchaseAllowance : result.taperedAllowance)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.mpaaApplies
                ? "Money purchase allowance (MPAA) — see below"
                : result.tapered
                  ? `${gbp.format(result.reduction)} tapered away from £60,000`
                  : "The full £60,000 — no taper"}
            </p>
          </div>
        </dl>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-2 pr-3">Total taxable income</td>
                <td className="py-2 text-right font-medium">{gbp.format(result.totalIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Less pension contributions taken off before tax</td>
                <td className="py-2 text-right font-medium">
                  −{gbp.format(result.totalIncome - result.netIncome)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Net income</td>
                <td className="py-2 text-right">{gbp.format(result.netIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Less your personal contributions, grossed up (× 1.25)</td>
                <td className="py-2 text-right font-medium">−{gbp.format(result.rasGross)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Add back salary sacrificed after 8 July 2015</td>
                <td className="py-2 text-right font-medium">
                  +{gbp.format(parseAmount(sacrifice))}
                </td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Threshold income</td>
                <td className="py-2 text-right">{gbp.format(result.thresholdIncome)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Net income, plus contributions taken off before tax, employer
                  contributions and sacrificed pay
                </td>
                <td className="py-2 text-right font-medium">{gbp.format(result.adjustedIncome)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Adjusted income</td>
                <td className="py-2 text-right">{gbp.format(result.adjustedIncome)}</td>
              </tr>
              {parseAmount(giftAidNet) > 0 && (
                <tr>
                  <td className="py-2 pr-3">
                    Gift Aid donations of {gbp.format(parseAmount(giftAidNet))} — counted in
                    neither measure (they reduce adjusted net income, not these)
                  </td>
                  <td className="py-2 text-right font-medium">£0 effect</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {result.totalCarryForward > 0 && (
          <div className="mt-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Carry forward and your available allowance
            </h3>
            <table className="mt-2 w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-3 font-semibold">Tax year</th>
                  <th className="py-2 pr-3 font-semibold">Allowance</th>
                  <th className="py-2 pr-3 font-semibold">Savings</th>
                  <th className="py-2 text-right font-semibold">Unused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {result.carryForwardYears.map((y) => (
                  <tr key={y.year}>
                    <td className="py-2 pr-3 font-medium">{y.year}</td>
                    <td className="py-2 pr-3">{gbp.format(y.allowance)}</td>
                    <td className="py-2 pr-3">{gbp.format(y.pensionSavings)}</td>
                    <td className="py-2 text-right font-medium">{gbp.format(y.unused)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 pr-3" colSpan={3}>
                    Available allowance for {result.taxYear} ({gbp.format(result.taperedAllowance)} +{" "}
                    {gbp.format(result.totalCarryForward)} carried forward)
                  </td>
                  <td className="py-2 text-right">{gbp.format(result.availableAllowance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {!result.tapered && !result.mpaaApplies && (
            <p>
              <strong>Good news — you are not tapered.</strong>{" "}
              {result.thresholdTestPassed
                ? "Your adjusted income is over £260,000, but the taper needs both tests, and your threshold income is the one that matters most: keep it at £200,000 or below and the full £60,000 allowance is yours whatever your adjusted income."
                : "Neither income measure is over its line, so you keep the full £60,000 annual allowance. The measure to watch is threshold income: a bonus, a bigger employer contribution year or a defined benefit jump can push you over without your salary changing."}
            </p>
          )}
          {result.tapered && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ You are tapered: your annual allowance for {result.taxYear} is{" "}
              {gbp.format(result.taperedAllowance)} — {gbp.format(result.reduction)} has been
              tapered away. Every further £2 of adjusted income costs another £1 of
              allowance until the £10,000 floor at £360,000.
            </p>
          )}
          {result.tapered && result.escapeContributionGross > 0 && (
            <p>
              <strong>Escape the taper:</strong> a gross personal pension contribution of{" "}
              {gbp.format(result.escapeContributionGross)} — {gbp.format(result.escapeContributionNet)}{" "}
              out of your own pocket at relief at source — would pull your threshold income
              down to exactly £200,000 and switch the taper off, restoring the full
              £60,000 allowance.
              {escapeTotal > escapeRestoredAvailable &&
                ` Careful: the contribution itself counts as pension savings, and with the savings you entered it would total ${gbp.format(escapeTotal)} against a restored available allowance of ${gbp.format(escapeRestoredAvailable)} — the overshoot would face a tax charge, so the full escape only works if your other savings leave room.`}
            </p>
          )}
          {result.mpaaApplies && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ The money purchase annual allowance applies: money purchase (defined
              contribution) savings are capped at {gbp.format(result.moneyPurchaseAllowance)}{" "}
              a year, with no taper and no carry forward on top. Your other pension
              savings sit under the alternative annual allowance of{" "}
              {gbp.format(result.alternativeAllowance)} (the tapered figure of{" "}
              {gbp.format(result.taperedAllowance)} less the £10,000 MPAA), which can
              still use carry forward.
            </p>
          )}
          {result.plannedSavings > 0 && result.excess > 0 && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ Your planned savings of {gbp.format(result.plannedSavings)} exceed your
              available allowance of {gbp.format(result.availableAllowance)} by{" "}
              {gbp.format(result.excess)}. The excess is added to your taxable income:
              at {marginalRate}% the tax charge is about {gbp.format(result.chargeEstimate)},
              declared on your Self Assessment return (your pension scheme may be able
              to pay it through Scheme Pays).
            </p>
          )}
          {result.plannedSavings > 0 && result.excess === 0 && (
            <p>
              Your planned savings of {gbp.format(result.plannedSavings)} fit inside
              your available allowance of {gbp.format(result.availableAllowance)} — no
              annual allowance charge on these figures.
            </p>
          )}
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Your annual allowance"
        value={gbp.format(result.mpaaApplies ? result.moneyPurchaseAllowance : result.taperedAllowance)}
      />
    </div>
  );
}
