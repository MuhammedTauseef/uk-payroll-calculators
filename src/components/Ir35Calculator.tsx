"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  IR35_QUESTIONS,
  assessStatus,
  calculateIr35,
} from "@/lib/ir35";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type YesNo = "" | "yes" | "no";

export default function Ir35Calculator() {
  const [dayRate, setDayRate] = useState("500");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [weeksPerYear, setWeeksPerYear] = useState("46");

  // One answer per status question; "" means unanswered.
  const [answers, setAnswers] = useState<YesNo[]>(
    () => IR35_QUESTIONS.map(() => ""),
  );

  const dayRateNumber = parseAmount(dayRate);
  const daysPerWeekNumber = parseAmount(daysPerWeek);
  const weeksPerYearNumber = parseAmount(weeksPerYear);

  const result = useMemo(
    () =>
      calculateIr35({
        dayRate: dayRateNumber,
        daysPerWeek: daysPerWeekNumber,
        weeksPerYear: weeksPerYearNumber,
      }),
    [dayRateNumber, daysPerWeekNumber, weeksPerYearNumber],
  );

  const answeredCount = answers.filter((a) => a !== "").length;
  const allAnswered = answeredCount === IR35_QUESTIONS.length;
  const status = useMemo(() => {
    if (!allAnswered) return null;
    const insideAnswers = IR35_QUESTIONS.map(
      (q, i) => answers[i] === q.insideAnswer,
    );
    return assessStatus(insideAnswers);
  }, [answers, allAnswered]);

  const noRate = result.grossAnnual <= 0;

  const stickyValue = noRate
    ? "—"
    : `Inside IR35 take-home ${fmtMoney(result.insideTakeHome)} a year`;

  function setAnswer(index: number, value: YesNo) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-3">
        <div>
          <label htmlFor="ir35-rate" className={labelClass}>
            Day rate (£)
          </label>
          <input
            id="ir35-rate"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What the client pays per day, before tax.
          </p>
        </div>
        <div>
          <label htmlFor="ir35-days" className={labelClass}>
            Days per week
          </label>
          <input
            id="ir35-days"
            type="number"
            inputMode="decimal"
            min="0"
            max="7"
            step="0.5"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ir35-weeks" className={labelClass}>
            Weeks per year
          </label>
          <input
            id="ir35-weeks"
            type="number"
            inputMode="decimal"
            min="0"
            max="52"
            step="1"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            46 weeks leaves about six weeks off; 52 is a full year.
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900 dark:text-slate-50 print:hidden">
        Part 1 — Is this contract inside or outside IR35?
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 print:hidden">
        Answer the eight questions about how the work is actually done —
        not just what the contract says. This is guidance only: HMRC’s
        CEST tool is the official checker, and HMRC stands by a CEST
        result given on accurate information.
      </p>

      <div className="mt-4 grid gap-4 print:hidden sm:grid-cols-2">
        {IR35_QUESTIONS.map((q, i) => {
          const answered = answers[i] !== "";
          const pointsInside = answered && answers[i] === q.insideAnswer;
          return (
            <div key={q.id}>
              <label htmlFor={`ir35-q-${q.id}`} className={labelClass}>
                {i + 1}. {q.question}
              </label>
              <select
                id={`ir35-q-${q.id}`}
                value={answers[i]}
                onChange={(e) => setAnswer(i, e.target.value as YesNo)}
                className={inputClass}
              >
                <option value="">— Choose —</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {answered && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {pointsInside ? q.insideReading : q.outsideReading}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noRate && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter a day rate, days per week and weeks per year to see the
          tax comparison.
        </p>
      )}

      {!allAnswered && (
        <p className="mt-4 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 print:hidden">
          Status check: {answeredCount} of 8 questions answered — answer
          them all to see whether this contract looks inside or outside
          IR35.
        </p>
      )}

      {status && (
        <div
          className={`mt-4 rounded-xl border p-5 print:mt-0 ${
            status.verdict === "inside"
              ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
              : status.verdict === "borderline"
                ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
                : "border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30"
          }`}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            Your status indication
          </h2>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {status.headline}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {status.insidePoints} of {status.totalQuestions} answers point
            towards employment.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {status.explanation}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Part 2 — Inside vs outside: what the same contract pays
        </h2>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.grossAnnual)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            contract value a year
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {fmtMoney(dayRateNumber)} a day × {daysPerWeekNumber} days a
          week × {weeksPerYearNumber} weeks a year.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Inside IR35 — deemed employment
            </h3>
            <dl className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">Income Tax: </dt>
                <dd className="inline">{fmtMoney(result.insideIncomeTax)} a year.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Employee National Insurance: </dt>
                <dd className="inline">{fmtMoney(result.insideEmployeeNi)} a year.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Take-home pay: </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.insideTakeHome)}</strong> a year
                  ({result.insideKeepPercent}% of the contract value).
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Employer NI the fee-payer pays on top: </dt>
                <dd className="inline">
                  {fmtMoney(result.insideEmployerNi)} a year — 15% of the
                  contract value above £5,000. It is not deducted from
                  your pay, but it is part of what the engagement costs
                  the client.
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Student loan is not deducted by the deemed employer — you
              pay it through Self Assessment.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Outside IR35 — limited company (simplified)
            </h3>
            <dl className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <div>
                <dt className="inline font-medium">Director’s salary: </dt>
                <dd className="inline">
                  {fmtMoney(result.outsideSalary)} a year
                  {result.outsideSalaryTax > 0 && (
                    <> — Income Tax {fmtMoney(result.outsideSalaryTax)} (the Personal Allowance tapers at this income)</>
                  )}
                  .
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Employer NI on the salary: </dt>
                <dd className="inline">
                  {fmtMoney(result.outsideEmployerNi)} — a one-director
                  company cannot claim the Employment Allowance.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Company profit: </dt>
                <dd className="inline">{fmtMoney(result.outsideProfit)}.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Corporation Tax: </dt>
                <dd className="inline">{fmtMoney(result.outsideCorporationTax)}.</dd>
              </div>
              <div>
                <dt className="inline font-medium">Dividends: </dt>
                <dd className="inline">
                  {fmtMoney(result.outsideDividends)} — all post-tax profit
                  taken as dividends.
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Dividend tax: </dt>
                <dd className="inline">{fmtMoney(result.outsideDividendTax)} (after the £500 dividend allowance).</dd>
              </div>
              <div>
                <dt className="inline font-medium">Take-home pay: </dt>
                <dd className="inline">
                  <strong>{fmtMoney(result.outsideTakeHome)}</strong> a year
                  ({result.outsideKeepPercent}% of the contract value).
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {result.betterRoute === "equal" ? (
            <>
              On these figures both routes pay the same:{" "}
              <strong>{fmtMoney(result.insideTakeHome)}</strong> a year.
            </>
          ) : (
            <>
              <strong>
                {result.betterRoute === "inside" ? "Inside IR35" : "Outside IR35"}
              </strong>{" "}
              pays{" "}
              <strong>{fmtMoney(Math.abs(result.difference))}</strong> a year
              more on these figures —{" "}
              {fmtMoney(result.insideTakeHome)} inside against{" "}
              {fmtMoney(result.outsideTakeHome)} outside. That gap is the
              tax difference only: it does not count pension
              contributions, keeping money in the company, or the cost
              of running a company.
            </>
          )}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Simplified model: one director, a salary of exactly the
          Personal Allowance (£12,570), no other income, no expenses,
          no pension contributions, no VAT, and every pound of
          post-tax profit taken as dividends in the same tax year.
          England, Wales and Northern Ireland tax bands, 2026/27
          rates. Real companies keep money in the company, pay
          pension contributions and time dividends — all of which
          change the answer. This is a starting point, not advice.
        </p>

        <PrintButton />
      </div>
      <StickyResultBar label="Inside IR35 take-home" value={stickyValue} />
    </div>
  );
}
