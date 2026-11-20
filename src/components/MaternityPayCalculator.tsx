"use client";

import ResultActions from "@/components/ResultActions";
import ResultDonut, { DONUT_COLORS } from "@/components/ResultDonut";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateMaternityPay } from "@/lib/maternity-pay";
import { MATERNITY, SMP } from "@/lib/rates";

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

export default function MaternityPayCalculator() {
  const [salary, setSalary] = useState("36000");
  const [dueDate, setDueDate] = useState("2027-04-08");
  const [jobStart, setJobStart] = useState("2024-01-08");
  const [leaveStart, setLeaveStart] = useState("2027-03-14");

  const reset = () => {
    setSalary("36000");
    setDueDate("2027-04-08");
    setJobStart("2024-01-08");
    setLeaveStart("2027-03-14");
  };

  const salaryNumber = parseAmount(salary);

  const result = useMemo(
    () =>
      calculateMaternityPay({
        annualSalary: salaryNumber,
        dueDate,
        employmentStart: jobStart,
        leaveStart,
      }),
    [salaryNumber, dueDate, jobStart, leaveStart],
  );

  const { pay, keyDates } = result;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="smp-salary" className={labelClass}>
            Annual salary (£)
          </label>
          <input
            id="smp-salary"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your actual gross pay — if you work part-time, enter your
            part-time salary, not the full-time equivalent.
          </p>
        </div>
        <div>
          <label htmlFor="smp-due" className={labelClass}>
            Baby&apos;s due date
          </label>
          <input
            id="smp-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The date on your MATB1 certificate. Your key dates below
            are worked out from it.
          </p>
        </div>
        <div>
          <label htmlFor="smp-jobstart" className={labelClass}>
            First day with this employer
          </label>
          <input
            id="smp-jobstart"
            type="date"
            value={jobStart}
            onChange={(e) => setJobStart(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used to check the 26-week service rule.
          </p>
        </div>
        <div>
          <label htmlFor="smp-leavestart" className={labelClass}>
            Planned first day of leave
          </label>
          <input
            id="smp-leavestart"
            type="date"
            value={leaveStart}
            onChange={(e) => setLeaveStart(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used for the month-by-month view. Leave can start no
            earlier than 11 weeks before your due week.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Statutory Maternity Pay calculation — inputs used
          </p>
          <p>
            Annual salary: {gbp.format(salaryNumber)} · Due date:{" "}
            {dueDate} · Employed from: {jobStart} · Leave from:{" "}
            {leaveStart}.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(pay.totalPay)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Total Statutory Maternity Pay across {pay.paidWeeks} paid
          weeks — before tax and National Insurance, which are taken
          off SMP in the same way as wages.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Stage
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per week
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Stage total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pay.stages.map((s) => (
                <tr key={s.label}>
                  <td className="px-4 py-2">
                    {s.label} — {s.basis}
                  </td>
                  <td className="px-4 py-2">{gbp.format(s.weeklyAmount)}</td>
                  <td className="px-4 py-2">{gbp.format(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ResultDonut
          segments={pay.stages.map((s, i) => ({
            label: s.label,
            value: s.total,
            displayValue: gbp.format(s.total),
            color: i === 0 ? DONUT_COLORS.deep : DONUT_COLORS.light,
          }))}
          centerLabel="Total SMP"
          centerValue={gbp.format(pay.totalPay)}
        />

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Average weekly earnings: </dt>
            <dd className="inline">
              {gbp.format(pay.averageWeeklyEarnings)} (your salary
              divided by 52). The first 6 weeks pay 90% of this —{" "}
              {gbp.format(pay.earningsRelatedWeekly)} a week — and the
              remaining 33 weeks pay the lower of{" "}
              {gbp.format(SMP.weeklyRate)} or 90% of earnings, which for
              you is {gbp.format(pay.statutoryWeekly)} a week.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Eligibility check: </dt>
            <dd className="inline">
              {result.earningsTestMet
                ? `your average earnings of ${gbp.format(pay.averageWeeklyEarnings)} a week are above the ${gbp.format(MATERNITY.lowerEarningsLimitWeekly)} Lower Earnings Limit, so the earnings test is met`
                : `your average earnings of ${gbp.format(pay.averageWeeklyEarnings)} a week are BELOW the ${gbp.format(MATERNITY.lowerEarningsLimitWeekly)} Lower Earnings Limit, so SMP would not be payable on these figures — Maternity Allowance may be available instead`}
              {result.serviceTestMet === true &&
                "; and your start date meets the 26-week service rule for this due date"}
              {result.serviceTestMet === false &&
                "; BUT your start date does not give 26 weeks of service by the qualifying week for this due date, so SMP would not be payable — ask your employer for form SMP1 and look at Maternity Allowance"}
              .
            </dd>
          </div>
        </dl>

        {keyDates && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Your key dates
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <li>
                Qualifying week: {formatDateGB(keyDates.qualifyingWeekStart)}{" "}
                to {formatDateGB(keyDates.qualifyingWeekEnd)} — your pay in
                the 8 weeks up to this week sets your average earnings.
              </li>
              <li>
                Tell your employer by:{" "}
                {formatDateGB(keyDates.notificationDeadline)} (the end of
                the qualifying week).
              </li>
              <li>
                You needed to be employed from:{" "}
                {formatDateGB(keyDates.latestEmploymentStart)} or earlier to
                meet the 26-week rule.
              </li>
              <li>
                Earliest you can start leave:{" "}
                {formatDateGB(keyDates.earliestLeaveStart)} (11 weeks before
                your due week, which starts{" "}
                {formatDateGB(keyDates.expectedWeekStart)}).
              </li>
            </ul>
          </div>
        )}

        {result.monthlyBreakdown.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Month by month (gross, from your leave start date)
            </h3>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-sm table-stack">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.monthlyBreakdown.map((m) => (
                    <tr key={m.label}>
                      <td className="px-4 py-2">{m.label}</td>
                      <td className="px-4 py-2">{gbp.format(m.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Each week&apos;s pay is counted in the month in which that
              week of leave begins, so the first and last months are
              part-months. Your employer may pay monthly in arrears, so
              the payslip month can differ.
            </p>
          </div>
        )}

        <ResultActions
          image={{
            title: "Statutory Maternity Pay",
            headline: gbp.format(pay.totalPay),
            headlineNote: `Total across ${pay.paidWeeks} paid weeks`,
            rows: [
              ...pay.stages.map((s) => ({
                label: `${s.label} — ${s.basis}`,
                value: gbp.format(s.total),
              })),
              {
                label: "Average weekly earnings",
                value: gbp.format(pay.averageWeeklyEarnings),
              },
            ],
            fileName: "payrollcalc-maternity-pay-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Total SMP over 39 weeks"
        value={gbp.format(pay.totalPay)}
      />
    </div>
  );
}
