"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculatePilon, type PenpBasis } from "@/lib/pilon";
import { TERMINATION } from "@/lib/rates";

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

export default function PilonCalculator() {
  const [basis, setBasis] = useState<PenpBasis>("days");
  const [basicPay, setBasicPay] = useState("3000");
  const [payPeriodDays, setPayPeriodDays] = useState("30.42");
  const [unworkedMonths, setUnworkedMonths] = useState("3");
  const [unworkedDays, setUnworkedDays] = useState("84");
  const [taxedAsEarnings, setTaxedAsEarnings] = useState("0");
  const [award, setAward] = useState("10000");
  const [redundancy, setRedundancy] = useState("0");
  const [otherIncome, setOtherIncome] = useState("27000");

  const reset = () => {
    setBasis("days");
    setBasicPay("3000");
    setPayPeriodDays("30.42");
    setUnworkedMonths("3");
    setUnworkedDays("84");
    setTaxedAsEarnings("0");
    setAward("10000");
    setRedundancy("0");
    setOtherIncome("27000");
  };

  const result = useMemo(
    () =>
      calculatePilon({
        basis,
        basicPayPerPeriod: parseAmount(basicPay),
        payPeriodDays: parseAmount(payPeriodDays),
        unworkedMonths: parseAmount(unworkedMonths),
        unworkedDays: parseAmount(unworkedDays),
        taxedAsEarnings: parseAmount(taxedAsEarnings),
        terminationAward: parseAmount(award),
        statutoryRedundancyPay: parseAmount(redundancy),
        otherTaxableIncome: parseAmount(otherIncome),
      }),
    [
      basis,
      basicPay,
      payPeriodDays,
      unworkedMonths,
      unworkedDays,
      taxedAsEarnings,
      award,
      redundancy,
      otherIncome,
    ],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="pilon-basis" className={labelClass}>
            How is the unworked notice measured?
          </label>
          <select
            id="pilon-basis"
            value={basis}
            onChange={(e) => setBasis(e.target.value as PenpBasis)}
            className={inputClass}
          >
            <option value="days">In days (the general formula)</option>
            <option value="months">
              In whole months (monthly paid, notice in whole months)
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            HMRC&apos;s formula has a shortcut where the notice period
            is a whole number of months and pay is a fixed monthly
            amount — the answer is the same either way in most cases.
          </p>
        </div>
        <div>
          <label htmlFor="pilon-bp" className={labelClass}>
            Basic pay in the last pay period (£)
          </label>
          <input
            id="pilon-bp"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={basicPay}
            onChange={(e) => setBasicPay(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            BP in the formula: basic pay only, before any salary
            sacrifice is deducted. Leave out overtime, bonuses,
            commission, allowances and benefits.
          </p>
        </div>
        {basis === "days" ? (
          <>
            <div>
              <label htmlFor="pilon-p" className={labelClass}>
                Days in that pay period (P)
              </label>
              <input
                id="pilon-p"
                type="number"
                inputMode="decimal"
                min="1"
                step="0.01"
                value={payPeriodDays}
                onChange={(e) => setPayPeriodDays(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                30.42 is the average month HMRC uses for monthly-paid
                staff; use 7 for weekly pay, or the exact days in the
                last pay period.
              </p>
            </div>
            <div>
              <label htmlFor="pilon-d" className={labelClass}>
                Days of notice not worked (D)
              </label>
              <input
                id="pilon-d"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={unworkedDays}
                onChange={(e) => setUnworkedDays(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Calendar days from the day after employment ends to
                the day the notice period would have ended. 12 weeks
                of notice not worked is 84 days.
              </p>
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="pilon-dm" className={labelClass}>
              Whole months of notice not worked (D)
            </label>
            <input
              id="pilon-dm"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={unworkedMonths}
              onChange={(e) => setUnworkedMonths(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The whole calendar months between the end of employment
              and the date the notice would have expired.
            </p>
          </div>
        )}
        <div>
          <label htmlFor="pilon-t" className={labelClass}>
            Already taxed as earnings (£)
          </label>
          <input
            id="pilon-t"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={taxedAsEarnings}
            onChange={(e) => setTaxedAsEarnings(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            T in the formula: a contractual pay in lieu of notice
            amount, or anything else paid in connection with leaving
            that has already gone through PAYE as earnings. Holiday
            pay and termination bonuses do not go here.
          </p>
        </div>
        <div>
          <label htmlFor="pilon-award" className={labelClass}>
            Termination payment (£)
          </label>
          <input
            id="pilon-award"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={award}
            onChange={(e) => setAward(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The ex-gratia / settlement amount paid in connection with
            leaving, not counting statutory redundancy pay. PENP can
            never be more than this.
          </p>
        </div>
        <div>
          <label htmlFor="pilon-redundancy" className={labelClass}>
            Statutory redundancy pay (£, if any)
          </label>
          <input
            id="pilon-redundancy"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={redundancy}
            onChange={(e) => setRedundancy(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Statutory redundancy pay is never part of PENP, but it
            does share the £30,000 exemption with the rest of the
            package.
          </p>
        </div>
        <div>
          <label htmlFor="pilon-other" className={labelClass}>
            Other taxable income this tax year (£)
          </label>
          <input
            id="pilon-other"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pay already received this tax year, so the estimate below
            taxes the PENP at your real marginal rate.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            PENP calculation — inputs used
          </p>
          <p>
            Basic pay: {gbp.format(parseAmount(basicPay))} per pay
            period · Unworked notice: {result.dUsed}{" "}
            {result.basis === "months" ? "months" : "days"} · Pay
            period: {result.pUsed}{" "}
            {result.basis === "months" ? "(months basis)" : "days"} ·
            Already taxed as earnings:{" "}
            {gbp.format(parseAmount(taxedAsEarnings))} · Termination
            payment: {gbp.format(parseAmount(award))}.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.penp)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Post-employment notice pay (PENP) — the part of the
          termination payment taxed as earnings, with Income Tax and
          National Insurance, exactly like pay. It never qualifies
          for the £30,000 exemption. After estimated tax of{" "}
          {gbp.format(result.taxOnPenp)} and employee National
          Insurance of {gbp.format(result.niOnPenp)}, the PENP is
          worth about {gbp.format(result.netPenp)} in hand.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Basic pay for the unworked notice — (BP × D) ÷ P
                </td>
                <td className="px-4 py-2">
                  {gbp.format(result.grossNoticePay)}
                </td>
              </tr>
              {result.taxedAsEarnings > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Less amounts already taxed as earnings (T)
                  </td>
                  <td className="px-4 py-2">
                    −{gbp.format(result.taxedAsEarnings)}
                  </td>
                </tr>
              )}
              {result.cappedByAward && (
                <tr>
                  <td className="px-4 py-2">
                    Capped at the termination payment itself
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.terminationAward)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2 font-medium">
                  PENP — taxed as earnings
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(result.penp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Estimated Income Tax on the PENP
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(result.taxOnPenp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Estimated employee National Insurance on the PENP
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(result.niOnPenp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">
                  PENP in hand, after tax and NI
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(result.netPenp)}
                </td>
              </tr>
              {result.terminationAward > 0 && (
                <>
                  <tr>
                    <td className="px-4 py-2">
                      Rest of the termination payment (after PENP)
                    </td>
                    <td className="px-4 py-2">
                      {gbp.format(result.remainderOfAward)}
                    </td>
                  </tr>
                  {result.statutoryRedundancyPay > 0 && (
                    <tr>
                      <td className="px-4 py-2">
                        Statutory redundancy pay
                      </td>
                      <td className="px-4 py-2">
                        {gbp.format(result.statutoryRedundancyPay)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-2">
                      Covered by the £
                      {TERMINATION.taxFreeThreshold.toLocaleString("en-GB")}{" "}
                      exemption
                    </td>
                    <td className="px-4 py-2">
                      {gbp.format(result.taxFreeAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">
                      {result.taxableExcess > 0
                        ? "Above the exemption — taxable as the top slice of income"
                        : "Above the exemption"}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {gbp.format(result.taxableExcess)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">The order matters: </dt>
            <dd className="inline">
              HMRC takes the PENP out of the termination payment
              first and taxes it as earnings. Only what is left —
              plus any statutory redundancy pay — is measured against
              the £30,000 exemption.
              {result.taxableExcess > 0 && (
                <>
                  {" "}
                  On these figures {gbp.format(result.taxableExcess)}{" "}
                  sits above the exemption: it is taxed as the top
                  slice of income, and the employer also owes Class
                  1A National Insurance on it.
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Estimate, not a payslip: </dt>
            <dd className="inline">
              the tax and National Insurance on the PENP are estimated
              by stacking it on the other taxable income entered
              above. The employer works the real figures out through
              PAYE on the payment date, and a tax code that does not
              match the year&apos;s income can move the amount taken
              on the day.
            </dd>
          </div>
        </dl>

        <ResultActions
          image={{
            title: "PENP (Pay in Lieu of Notice)",
            headline: gbp.format(result.penp),
            headlineNote: "Post-employment notice pay — taxed as earnings",
            rows: [
              {
                label: "Basic pay for unworked notice",
                value: gbp.format(result.grossNoticePay),
              },
              {
                label: "Already taxed as earnings (T)",
                value: gbp.format(result.taxedAsEarnings),
              },
              {
                label: "Estimated tax + NI on PENP",
                value: gbp.format(result.taxOnPenp + result.niOnPenp),
              },
              {
                label: "PENP in hand",
                value: gbp.format(result.netPenp),
              },
            ],
            fileName: "payrollcalc-pilon-penp-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="PENP — taxed as earnings"
        value={gbp.format(result.penp)}
      />
    </div>
  );
}
