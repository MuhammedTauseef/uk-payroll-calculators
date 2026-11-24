"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateNeonatal } from "@/lib/neonatal";
import type { NeonatalTaxYear } from "@/lib/rates";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatDateGB(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function NeonatalCarePayCalculator() {
  const [taxYear, setTaxYear] = useState<NeonatalTaxYear>("2026-27");
  const [awe, setAwe] = useState("450");
  const [days, setDays] = useState("21");
  const [birthDate, setBirthDate] = useState("2026-10-05");
  const [careStart, setCareStart] = useState("2026-10-05");
  const [jobStart, setJobStart] = useState("2024-01-08");

  const reset = () => {
    setTaxYear("2026-27");
    setAwe("450");
    setDays("21");
    setBirthDate("2026-10-05");
    setCareStart("2026-10-05");
    setJobStart("2024-01-08");
  };

  const result = useMemo(
    () =>
      calculateNeonatal({
        taxYear,
        averageWeeklyEarnings: parseAmount(awe),
        daysInCare: parseAmount(days),
        birthDate,
        careStartDate: careStart,
        employmentStart: jobStart,
      }),
    [taxYear, awe, days, birthDate, careStart, jobStart],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="sncp-taxyear" className={labelClass}>
            Tax year the pay falls in
          </label>
          <select
            id="sncp-taxyear"
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value as NeonatalTaxYear)}
            className={inputClass}
          >
            <option value="2026-27">2026/27 — £194.32 a week</option>
            <option value="2025-26">2025/26 — £187.18 a week</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The flat rate and the earnings limit both change each April.
          </p>
        </div>
        <div>
          <label htmlFor="sncp-awe" className={labelClass}>
            Average weekly earnings (£)
          </label>
          <input
            id="sncp-awe"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={awe}
            onChange={(e) => setAwe(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gross pay per week in the relevant 8-week period — for a
            salaried employee, roughly the annual salary divided by 52.
          </p>
        </div>
        <div>
          <label htmlFor="sncp-days" className={labelClass}>
            Days the baby spent in neonatal care
          </label>
          <input
            id="sncp-days"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consecutive days. Every full 7 days earns one week of leave
            and pay, up to 12 weeks.
          </p>
        </div>
        <div>
          <label htmlFor="sncp-birth" className={labelClass}>
            Baby&apos;s date of birth
          </label>
          <input
            id="sncp-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The scheme covers babies born on or after 6 April 2025.
          </p>
        </div>
        <div>
          <label htmlFor="sncp-carestart" className={labelClass}>
            Date neonatal care started
          </label>
          <input
            id="sncp-carestart"
            type="date"
            value={careStart}
            onChange={(e) => setCareStart(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Care must start within 28 days of the birth. This date also
            sets the qualifying week for the service check.
          </p>
        </div>
        <div>
          <label htmlFor="sncp-jobstart" className={labelClass}>
            First day with this employer
          </label>
          <input
            id="sncp-jobstart"
            type="date"
            value={jobStart}
            onChange={(e) => setJobStart(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used to check the 26-week service rule for pay. Leave itself
            is a day-one right.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Statutory Neonatal Care Pay calculation — inputs used
          </p>
          <p>
            Tax year: {taxYear} · Average weekly earnings:{" "}
            {gbp.format(parseAmount(awe))} · Days in neonatal care:{" "}
            {days} · Born: {birthDate} · Care from: {careStart} ·
            Employed from: {jobStart}.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.totalPay)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Total Statutory Neonatal Care Pay across{" "}
          {result.weeksEntitled}{" "}
          {result.weeksEntitled === 1 ? "week" : "weeks"} —{" "}
          {gbp.format(result.weeklyAmount)} a week, before tax and
          National Insurance, which are taken off in the same way as
          wages.
        </p>

        {!result.eligible && (
          <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              On these figures, Statutory Neonatal Care Pay would not
              be payable, because:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {result.failedReasons.map((reason) => (
                <li key={reason}>{reason}.</li>
              ))}
            </ul>
            <p className="mt-2">
              Neonatal Care Leave itself is a day-one right, so the
              time off may still be available unpaid. If your employer
              says you do not qualify for pay, they must explain why in
              writing within 28 days of your notice for pay.
            </p>
          </div>
        )}

        {result.weekByWeek.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                    Week
                  </th>
                  <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                    Pay for the week
                  </th>
                  <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.weekByWeek.map((row) => (
                  <tr key={row.week}>
                    <td className="px-4 py-2">Week {row.week}</td>
                    <td className="px-4 py-2">{gbp.format(row.amount)}</td>
                    <td className="px-4 py-2">
                      {gbp.format(row.cumulative)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Weekly amount: </dt>
            <dd className="inline">
              the lower of the {taxYear} flat rate of{" "}
              {gbp.format(result.flatRate)} and 90% of average weekly
              earnings ({gbp.format(result.ninetyPercentOfAwe)}) — for
              you, {gbp.format(result.weeklyAmount)} a week, the same
              in every week. Unlike maternity pay there is no
              higher-rate opening stage.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Eligibility check: </dt>
            <dd className="inline">
              {result.earningsTestMet
                ? `your average earnings of ${gbp.format(parseAmount(awe))} a week are at or above the ${gbp.format(result.lowerEarningsLimitWeekly)} Lower Earnings Limit, so the earnings test is met`
                : `your average earnings of ${gbp.format(parseAmount(awe))} a week are BELOW the ${gbp.format(result.lowerEarningsLimitWeekly)} Lower Earnings Limit, so the pay would not be payable on these figures`}
              {result.serviceTestMet === true &&
                "; and your start date meets the 26-week service rule"}
              {result.serviceTestMet === false &&
                "; BUT your start date does not give 26 weeks of service by the qualifying week, so the pay would not be payable on these dates"}
              {result.bornInScheme === false &&
                "; and the baby was born before the scheme started on 6 April 2025"}
              {result.careWithinWindow === false &&
                "; and the care did not start within 28 days of the birth"}
              . You must also still be employed in the week before the
              pay starts, which this calculator cannot check.
            </dd>
          </div>
          {result.latestEmploymentStart && (
            <div>
              <dt className="inline font-medium">Key date: </dt>
              <dd className="inline">
                the qualifying week ends{" "}
                {result.qualifyingWeekEnd
                  ? formatDateGB(result.qualifyingWeekEnd)
                  : ""}
                , so you needed to be employed from{" "}
                {formatDateGB(result.latestEmploymentStart)} or earlier
                to meet the 26-week rule. If you also qualify for
                maternity or paternity pay for this baby, the qualifying
                week is the earlier one used for that claim — passing
                that service test means you pass this one too.
              </dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium">Employer reclaim: </dt>
            <dd className="inline">
              your employer can claim back{" "}
              {gbp.format(result.employerRecoveryStandard)} of this
              total from HMRC (92%), or{" "}
              {gbp.format(result.employerRecoverySmall)} if they
              qualify for Small Employers&apos; Relief.
            </dd>
          </div>
        </dl>

        <ResultActions
          image={{
            title: "Statutory Neonatal Care Pay",
            headline: gbp.format(result.totalPay),
            headlineNote: `Total across ${result.weeksEntitled} weeks at ${gbp.format(result.weeklyAmount)} a week`,
            rows: [
              {
                label: "Weekly SNCP",
                value: gbp.format(result.weeklyAmount),
              },
              {
                label: "Weeks entitled",
                value: String(result.weeksEntitled),
              },
              {
                label: "Average weekly earnings",
                value: gbp.format(parseAmount(awe)),
              },
              {
                label: "Flat rate cap",
                value: gbp.format(result.flatRate),
              },
            ],
            fileName: "payrollcalc-neonatal-care-pay-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label={`Total SNCP over ${result.weeksEntitled} weeks`}
        value={gbp.format(result.totalPay)}
      />
    </div>
  );
}
