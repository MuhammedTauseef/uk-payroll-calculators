"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateSecondJob,
  type SecondJobTaxCodeChoice,
} from "@/lib/second-job";
import type { StudentLoanPlanId } from "@/lib/student-loan";

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

function fmtWhole(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";

type PlanChoice = "none" | StudentLoanPlanId;

export default function SecondJobCalculator() {
  const [job1, setJob1] = useState("35000");
  const [job2, setJob2] = useState("10000");
  const [pension1, setPension1] = useState("0");
  const [pension2, setPension2] = useState("0");
  const [split, setSplit] = useState("100");
  const [job2Code, setJob2Code] = useState<SecondJobTaxCodeChoice>("BR");
  const [plan, setPlan] = useState<PlanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  const reset = () => {
    setJob1("35000");
    setJob2("10000");
    setPension1("0");
    setPension2("0");
    setSplit("100");
    setJob2Code("BR");
    setPlan("none");
    setPgToo(false);
  };

  const result = useMemo(
    () =>
      calculateSecondJob({
        job1Salary: parseAmount(job1),
        job2Salary: parseAmount(job2),
        job1PensionPercent: parseAmount(pension1),
        job2PensionPercent: parseAmount(pension2),
        allowanceOnJob1Percent: parseAmount(split),
        job2TaxCode: job2Code,
        undergraduatePlan: plan === "none" ? null : plan,
        hasPostgraduateLoan: pgToo,
      }),
    [job1, job2, pension1, pension2, split, job2Code, plan, pgToo],
  );

  const ps = result.payslip;
  const diffAbs = Math.abs(ps.difference);

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <MoneySlider
          id="sj-job1"
          label="Main job salary (£ a year)"
          value={job1}
          onChange={setJob1}
          min={0}
          max={200000}
          step={250}
          hint="Gross pay from the job your Personal Allowance sits on — usually the one you earn most from."
        />
        <MoneySlider
          id="sj-job2"
          label="Second job salary (£ a year)"
          value={job2}
          onChange={setJob2}
          min={0}
          max={200000}
          step={250}
          hint="Gross pay from the second job, before tax. Part-time, weekend and evening jobs all count."
        />
        <div>
          <label htmlFor="sj-pension1" className={labelClass}>
            Pension / salary sacrifice — main job (% of pay)
          </label>
          <input
            id="sj-pension1"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            value={pension1}
            onChange={(e) => setPension1(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Taken off the pay before tax, National Insurance and student
            loan — the salary-sacrifice / net-pay basis. Leave at 0 if
            you do not pay into a pension from this job.
          </p>
        </div>
        <div>
          <label htmlFor="sj-pension2" className={labelClass}>
            Pension / salary sacrifice — second job (% of pay)
          </label>
          <input
            id="sj-pension2"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            value={pension2}
            onChange={(e) => setPension2(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Same basis as the main job. Many second jobs have no pension
            at all — leave at 0 then.
          </p>
        </div>
        <div>
          <label htmlFor="sj-plan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="sj-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as PlanChoice)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4</option>
            <option value="plan5">Plan 5</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Repayments are worked out on your TOTAL pay from both jobs
            over the plan threshold — not job by job.
          </p>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={pgToo}
              onChange={(e) => setPgToo(e.target.checked)}
              className="h-4 w-4 accent-brand-700"
            />
            I also have a Postgraduate Loan
          </label>
        </div>
        <div>
          <label htmlFor="sj-code" className={labelClass}>
            Second job&apos;s tax code (for the payslip view)
          </label>
          <select
            id="sj-code"
            value={job2Code}
            onChange={(e) =>
              setJob2Code(e.target.value as SecondJobTaxCodeChoice)
            }
            className={inputClass}
          >
            <option value="BR">BR — everything at 20%</option>
            <option value="D0">D0 — everything at 40%</option>
            <option value="D1">D1 — everything at 45%</option>
            <option value="0T">0T — no allowance on this job</option>
            <option value="SPLIT">
              A normal code holding its share of the allowance
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The code on the second job&apos;s payslip. BR is the usual
            one. This changes what is deducted month by month — never
            the year&apos;s final bill.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sj-split" className={labelClass}>
            Personal Allowance on the main job
          </label>
          <select
            id="sj-split"
            value={split}
            onChange={(e) => setSplit(e.target.value)}
            className={inputClass}
          >
            <option value="100">All of it (100%) — the usual setup</option>
            <option value="75">75% on the main job, 25% on the second</option>
            <option value="50">Split 50 / 50</option>
            <option value="25">25% on the main job, 75% on the second</option>
            <option value="0">All of it on the second job</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            HMRC can split your allowance between jobs if you ask.
            Splitting changes the payslip deductions only — the tax
            itself is always charged on the two incomes added together.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2026/27 rules for England, Wales and Northern Ireland.
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          What the second job really pays you
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Second job tax check — inputs used
          </p>
          <p>
            Main job: {fmtMoney(result.job1.gross)} · Second job:{" "}
            {fmtMoney(result.job2.gross)}. 2026/27 rules, England, Wales
            and Northern Ireland.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtWhole(result.keepPer100)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            kept of every £100 the second job pays —{" "}
            {fmtMoney(result.keepFromJob2Monthly)} a month
          </span>
        </p>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Combined take-home pay from both jobs:{" "}
          <strong>{fmtMoney(result.takeHomeAnnual)}</strong> a year (
          {fmtMoney(result.takeHomeMonthly)} a month) on combined pay of{" "}
          {fmtMoney(result.combinedGross)}.
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Income Tax: </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.incomeTax)}</strong> — charged on
              the two jobs added together ({fmtMoney(result.combinedPay)}{" "}
              after pension), with one Personal Allowance of{" "}
              {fmtMoney(result.personalAllowance)} between them. The
              second job alone adds {fmtMoney(result.job2.incomeTax)} of
              that tax.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">National Insurance: </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.totalNationalInsurance)}</strong>{" "}
              — worked out on each job separately:{" "}
              {fmtMoney(result.job1.nationalInsurance)} on the main job
              and {fmtMoney(result.job2.nationalInsurance)} on the
              second.
              {result.job2.nationalInsurance === 0 &&
              result.job2.gross > 0
                ? " The second job pays none at all, because its pay is under its own £12,570 threshold — every job gets one."
                : " Each job gets its own £12,570 threshold, so two jobs pay less NI than one job on the combined salary would."}
            </dd>
          </div>
          {result.totalStudentLoan > 0 && (
            <div>
              <dt className="inline font-medium">Student loan: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.totalStudentLoan)}</strong> —
                charged on the total pay from both jobs over the plan
                threshold; the second job adds{" "}
                {fmtMoney(result.job2.studentLoan)} of it.
              </dd>
            </div>
          )}
          {result.totalPension > 0 && (
            <div>
              <dt className="inline font-medium">Pension: </dt>
              <dd className="inline">
                <strong>{fmtMoney(result.totalPension)}</strong> goes
                into pensions across the two jobs, before tax — it is
                part of what you keep, just not in this month&apos;s pay.
              </dd>
            </div>
          )}
        </dl>

        {(result.inTaperZone || result.crossesHigherRate) && (
          <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {result.inTaperZone ? (
              <p>
                <strong>£100,000 warning:</strong> your combined pay is
                over £100,000, so your Personal Allowance is being
                withdrawn — £1 of it for every £2 over the line. In that
                zone each extra £100 from the second job is effectively
                taxed at 60% before National Insurance. Paying more into
                a pension can bring the combined figure back under
                £100,000 and restore the allowance.
              </p>
            ) : (
              <p>
                <strong>£50,270 warning:</strong> your combined pay
                passes £50,270, so part of the second job is taxed at
                the 40% higher rate even if neither job reaches it on
                its own. That is the usual reason a second job
                &ldquo;looks&rdquo; over-taxed.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            The payslip view — what the employers actually deduct
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Your main job&apos;s employer (code {ps.job1Code}) deducts{" "}
            {fmtMoney(ps.job1TaxDeducted)} of tax over the year; the
            second job&apos;s employer (code {ps.job2Code}) deducts{" "}
            {fmtMoney(ps.job2TaxDeducted)}. Together that is{" "}
            {fmtMoney(ps.totalTaxDeducted)} against a true bill of{" "}
            {fmtMoney(ps.trueIncomeTax)}.
          </p>
          {diffAbs < 0.005 ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              The two payslips land exactly on the bill — nothing to
              refund and nothing extra to pay.
            </p>
          ) : ps.difference > 0 ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>
                You are overpaying by {fmtMoney(diffAbs)} a year (
                {fmtMoney(Math.abs(ps.differencePerMonth))} a month).
              </strong>{" "}
              Too much tax is being taken through the payslips. HMRC
              normally refunds it after the tax year ends through a P800
              calculation — or sooner if you ask HMRC to change the
              codes. National Insurance needs no refund: it is charged
              per job, so the payslips already get it right.
            </p>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>
                You are underpaying by {fmtMoney(diffAbs)} a year (
                {fmtMoney(Math.abs(ps.differencePerMonth))} a month).
              </strong>{" "}
              The payslips are not taking enough. HMRC will collect the
              difference after the year ends, usually by reducing a tax
              code — worth knowing before it arrives as a smaller pay
              packet.
            </p>
          )}
        </div>

        <ResultActions
          image={{
            title: "Second Job Tax Calculator",
            headline: fmtMoney(result.takeHomeAnnual),
            headlineNote: "Combined take-home from two jobs, 2026/27",
            rows: [
              { label: "Main job", value: fmtMoney(result.job1.gross) },
              { label: "Second job", value: fmtMoney(result.job2.gross) },
              { label: "Income Tax", value: fmtMoney(result.incomeTax) },
              {
                label: "National Insurance",
                value: fmtMoney(result.totalNationalInsurance),
              },
              {
                label: "Kept from the second job",
                value: fmtMoney(result.keepFromJob2Annual),
              },
              {
                label: "Take-home a month",
                value: fmtMoney(result.takeHomeMonthly),
              },
            ],
            fileName: "payrollcalc-second-job-tax-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Kept from the second job, a month"
        value={fmtMoney(result.keepFromJob2Monthly)}
      />
    </div>
  );
}
