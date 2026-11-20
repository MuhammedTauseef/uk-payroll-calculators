"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useRef, useState } from "react";
import { calculateRedundancy } from "@/lib/redundancy";
import { REDUNDANCY } from "@/lib/rates";

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

export default function RedundancyCalculator() {
  const [dob, setDob] = useState("1981-06-15");
  const [start, setStart] = useState("2011-11-15");
  const [end, setEnd] = useState("2026-11-15");
  const [weeklyPay, setWeeklyPay] = useState("600");
  const [otherPayments, setOtherPayments] = useState("0");

  const resultRef = useRef<HTMLDivElement>(null);
  const reset = () => {
    setDob("1981-06-15");
    setStart("2011-11-15");
    setEnd("2026-11-15");
    setWeeklyPay("600");
    setOtherPayments("0");
  };

  const weeklyPayNumber = parseAmount(weeklyPay);
  const otherPaymentsNumber = parseAmount(otherPayments);

  const result = useMemo(
    () =>
      calculateRedundancy({
        dateOfBirth: dob,
        employmentStart: start,
        employmentEnd: end,
        grossWeeklyPay: weeklyPayNumber,
        otherTerminationPayments: otherPaymentsNumber,
      }),
    [dob, start, end, weeklyPayNumber, otherPaymentsNumber],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="red-dob" className={labelClass}>
            Date of birth
          </label>
          <input
            id="red-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your age in each year of service sets how many weeks&apos;
            pay that year earns.
          </p>
        </div>
        <div>
          <label htmlFor="red-weekly" className={labelClass}>
            Gross weekly pay (£)
          </label>
          <input
            id="red-weekly"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={weeklyPay}
            onChange={(e) => setWeeklyPay(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Before tax. If your pay varies, use the average of the 12
            weeks before you were given notice.
          </p>
        </div>
        <div>
          <label htmlFor="red-start" className={labelClass}>
            First day of employment
          </label>
          <input
            id="red-start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="red-end" className={labelClass}>
            Date the employment ends
          </label>
          <input
            id="red-end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Normally the date your notice period finishes.
          </p>
        </div>
        <div>
          <label htmlFor="red-other" className={labelClass}>
            Other termination payments (£, optional)
          </label>
          <input
            id="red-other"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={otherPayments}
            onChange={(e) => setOtherPayments(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ex-gratia or settlement amounts only — not notice pay. Used
            for the £30,000 tax-free check below.
          </p>
        </div>
      </div>

      <div
        ref={resultRef}
        className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Statutory redundancy pay calculation — inputs used
          </p>
          <p>
            Born {dob} · employed {start} to {end} · gross weekly pay{" "}
            {gbp.format(weeklyPayNumber)}.
          </p>
        </div>

        {result.qualifies ? (
          <>
            <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {gbp.format(result.statutoryPay)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Statutory redundancy pay — {result.totalWeeks} weeks&apos;
              pay for {result.countedYears} counted years of service
              {result.completeYears > result.countedYears
                ? ` (you have ${result.completeYears} complete years; only the most recent 20 count)`
                : ""}
              .
            </p>

            <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">How the weeks add up: </dt>
                <dd className="inline">
                  {result.years41plus > 0 &&
                    `${result.years41plus} year${result.years41plus > 1 ? "s" : ""} at 1.5 weeks (aged 41 or over)`}
                  {result.years41plus > 0 &&
                    (result.years22to40 > 0 || result.yearsUnder22 > 0) &&
                    ", "}
                  {result.years22to40 > 0 &&
                    `${result.years22to40} year${result.years22to40 > 1 ? "s" : ""} at 1 week (aged 22 to 40)`}
                  {result.years22to40 > 0 && result.yearsUnder22 > 0 && ", "}
                  {result.yearsUnder22 > 0 &&
                    `${result.yearsUnder22} year${result.yearsUnder22 > 1 ? "s" : ""} at half a week (under 22)`}
                  {" — "}
                  {result.totalWeeks} weeks in total.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">A week&apos;s pay: </dt>
                <dd className="inline">
                  {result.capApplied
                    ? `your ${gbp.format(weeklyPayNumber)} a week counts as ${gbp.format(REDUNDANCY.weeklyPayCap)}, the statutory cap for dismissals on or after 6 April 2026`
                    : `${gbp.format(result.weeksPayUsed)} a week — below the ${gbp.format(REDUNDANCY.weeklyPayCap)} statutory cap, so your full week's pay counts`}
                  .
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Statutory notice pay: </dt>
                <dd className="inline">
                  your employer must give at least {result.noticeWeeks}{" "}
                  week{result.noticeWeeks > 1 ? "s" : ""} of notice, worth{" "}
                  {gbp.format(result.noticePay)} at your weekly pay if you
                  are not required to work it and your contract does not
                  say otherwise. Notice pay is separate from redundancy
                  pay and is taxed as earnings.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Tax: </dt>
                <dd className="inline">
                  redundancy pay is tax-free. Your whole package of{" "}
                  {gbp.format(result.totalTerminationPayments)} uses{" "}
                  {gbp.format(result.taxFreeUsed)} of the £30,000 tax-free
                  limit for termination payments
                  {result.taxableExcess > 0
                    ? `, so ${gbp.format(result.taxableExcess)} above the limit is taxed as earnings`
                    : " — nothing above the limit to tax"}
                  .
                </dd>
              </div>
            </dl>

            {result.yearRows.length > 0 && (
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <table className="w-full text-left text-sm table-stack">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Year of service
                      </th>
                      <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Age at its start
                      </th>
                      <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Weeks earned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.yearRows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{row.label}</td>
                        <td className="px-4 py-2">{row.ageAtStart}</td>
                        <td className="px-4 py-2">{row.weeksEarned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              £0
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {result.completeYears === 1
                ? "One complete year of service is not enough: statutory redundancy pay needs at least 2 complete years with the same employer. You would still be entitled to your notice pay, any accrued holiday pay and any enhanced amount your contract promises."
                : "Statutory redundancy pay needs at least 2 complete years of continuous service with the same employer, and the dates above give fewer than that. Check the start and end dates — if the service is under 2 years, there is no statutory payment, though notice pay and accrued holiday pay are still owed."}
            </p>
            <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">Tax-free check: </dt>
                <dd className="inline">
                  the other termination payments you entered (
                  {gbp.format(result.totalTerminationPayments)}) use{" "}
                  {gbp.format(result.taxFreeUsed)} of the £30,000 tax-free
                  limit
                  {result.taxableExcess > 0
                    ? `, so ${gbp.format(result.taxableExcess)} is taxed as earnings`
                    : ""}
                  .
                </dd>
              </div>
            </dl>
          </>
        )}

        <ResultActions
          targetRef={resultRef}
          fileName="payrollcalc-redundancy-pay-result.png"
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Statutory redundancy pay"
        value={gbp.format(result.statutoryPay)}
      />
    </div>
  );
}
