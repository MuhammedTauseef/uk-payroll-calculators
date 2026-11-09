"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateNotice,
  formatDateGB,
  WEEKS_PER_MONTH,
} from "@/lib/notice";
import type { NoticeGiver, NoticeUnit } from "@/lib/notice";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function weeksLabel(weeks: number): string {
  if (weeks === 0) return "no notice";
  const rounded = Math.round(weeks * 100) / 100;
  return `${rounded} week${rounded === 1 ? "" : "s"}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function NoticeCalculator() {
  const [who, setWho] = useState<NoticeGiver>("employer");
  const [startDate, setStartDate] = useState("2021-01-04");
  const [noticeDate, setNoticeDate] = useState(todayIso);
  const [contractValue, setContractValue] = useState("4");
  const [contractUnit, setContractUnit] = useState<NoticeUnit>("weeks");

  const contractNumber = Math.max(0, parseAmount(contractValue));

  const result = useMemo(
    () =>
      calculateNotice({
        whoGivesNotice: who,
        employmentStartDate: startDate,
        noticeDate,
        contractNoticeValue: contractNumber,
        contractNoticeUnit: contractUnit,
      }),
    [who, startDate, noticeDate, contractNumber, contractUnit],
  );

  const datesInverted = startDate !== "" && noticeDate !== "" && noticeDate < startDate;
  const serviceRemainderMonths = result.serviceCompleteMonths % 12;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="who" className={labelClass}>
            Who is giving notice?
          </label>
          <select
            id="who"
            value={who}
            onChange={(e) => setWho(e.target.value as NoticeGiver)}
            className={inputClass}
          >
            <option value="employer">The employer</option>
            <option value="employee">The employee</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The statutory minimum is different in each direction.
          </p>
        </div>

        <div>
          <label htmlFor="start-date" className={labelClass}>
            Employment start date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The employee&apos;s first day of employment.
          </p>
        </div>

        <div>
          <label htmlFor="notice-date" className={labelClass}>
            Date notice is given
          </label>
          <input
            id="notice-date"
            type="date"
            value={noticeDate}
            onChange={(e) => setNoticeDate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Notice starts running from the day after this date.
          </p>
        </div>

        <div>
          <label htmlFor="contract-value" className={labelClass}>
            Notice period in the contract
          </label>
          <div className="flex gap-2">
            <input
              id="contract-value"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              className={inputClass}
            />
            <select
              id="contract-unit"
              aria-label="Contract notice unit"
              value={contractUnit}
              onChange={(e) => setContractUnit(e.target.value as NoticeUnit)}
              className={inputClass}
            >
              <option value="weeks">weeks</option>
              <option value="months">months</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter 0 if the contract gives no notice period. Months are
            converted at 52 ÷ 12 ≈ {WEEKS_PER_MONTH.toFixed(2)} weeks per
            month.
          </p>
        </div>
      </div>

      {datesInverted && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          The notice date is before the start date, so the length of service
          counts as zero. Check the two dates.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Notice period calculation — inputs used
          </p>
          <p>
            Notice given by:{" "}
            {who === "employer" ? "the employer" : "the employee"} ·
            Employment start date: {formatDateGB(startDate)} · Date notice
            is given: {formatDateGB(noticeDate)} · Notice period in the
            contract:{" "}
            {contractNumber === 0
              ? "none entered"
              : `${contractNumber} ${contractUnit}`}
            .
          </p>
        </div>
        {result.lastWorkingDay ? (
          <>
            <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
              {formatDateGB(result.lastWorkingDay)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Earliest last working day
            </p>
          </>
        ) : (
          <p className="mt-2 text-base text-slate-700 dark:text-slate-300">
            Enter both dates to see the earliest last working day.
          </p>
        )}

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Length of service: </dt>
            <dd className="inline">
              {result.serviceCompleteYears} complete year
              {result.serviceCompleteYears === 1 ? "" : "s"}
              {serviceRemainderMonths > 0
                ? ` and ${serviceRemainderMonths} complete month${serviceRemainderMonths === 1 ? "" : "s"}`
                : ""}{" "}
              at the date notice is given.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Statutory minimum notice: </dt>
            <dd className="inline">
              {weeksLabel(result.statutoryWeeks)}
              {result.statutoryWeeks === 0
                ? " — with under one month's service there is no statutory minimum, so the contract position applies"
                : who === "employer"
                  ? " — the employer's minimum under the Employment Rights Act 1996, based on complete years of service"
                  : " — the employee's minimum under the Employment Rights Act 1996 once they have a month's service"}
              .
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Contract notice: </dt>
            <dd className="inline">
              {contractNumber === 0
                ? "none entered — no contract notice period"
                : `${contractNumber} ${contractUnit}${
                    contractUnit === "months"
                      ? `, which is ${weeksLabel(result.contractWeeks)} (months × 52 ÷ 12)`
                      : ""
                  }`}
              .
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Notice that applies: </dt>
            <dd className="inline">
              {weeksLabel(result.effectiveWeeks)} ({result.effectiveDays}{" "}
              days) —{" "}
              {result.effectiveSource === "statutory"
                ? "the statutory minimum is longer than the contract period, so the statutory minimum wins"
                : result.effectiveSource === "contract"
                  ? "the contract period is longer than the statutory minimum, so the contract wins"
                  : "the statutory minimum and the contract period are the same"}
              .
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          The notice period runs from the day after notice is given, so the
          earliest last working day is the notice date plus the full notice
          period. Either side can agree a longer period than the minimum.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Earliest last working day"
        value={result.lastWorkingDay ? formatDateGB(result.lastWorkingDay) : "Enter both dates"}
      />
    </div>
  );
}
