"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateSalaryComparison,
  type OfferBreakdown,
} from "@/lib/salary-comparison";
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

function fmtSigned(n: number): string {
  if (Math.abs(n) < 0.005) return "£0.00";
  return `${n > 0 ? "+" : "−"}£${Math.abs(n).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300";

type PlanChoice = "none" | StudentLoanPlanId;

function OfferFields({
  prefix,
  title,
  salary,
  setSalary,
  bonus,
  setBonus,
  employeePension,
  setEmployeePension,
  employerPension,
  setEmployerPension,
  hours,
  setHours,
}: {
  prefix: string;
  title: string;
  salary: string;
  setSalary: (v: string) => void;
  bonus: string;
  setBonus: (v: string) => void;
  employeePension: string;
  setEmployeePension: (v: string) => void;
  employerPension: string;
  setEmployerPension: (v: string) => void;
  hours: string;
  setHours: (v: string) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </legend>
      <MoneySlider
        id={`${prefix}-salary`}
        label="Gross salary (£ a year)"
        value={salary}
        onChange={setSalary}
        min={0}
        max={200000}
        step={250}
      />
      <div>
        <label htmlFor={`${prefix}-bonus`} className={labelClass}>
          Bonus (£ a year)
        </label>
        <input
          id={`${prefix}-bonus`}
          type="number"
          inputMode="decimal"
          min={0}
          step={100}
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Taxed exactly like salary. Leave at 0 if the offer has none.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}-ee-pen`} className={labelClass}>
            Your pension (% of salary)
          </label>
          <input
            id={`${prefix}-ee-pen`}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={employeePension}
            onChange={(e) => setEmployeePension(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-er-pen`} className={labelClass}>
            Employer pension (% of salary)
          </label>
          <input
            id={`${prefix}-er-pen`}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={employerPension}
            onChange={(e) => setEmployerPension(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
        Your pension comes off before tax, National Insurance and
        student loan — the salary-sacrifice / net-pay basis. The
        employer&apos;s pension is paid on top and counts in the
        total reward below.
      </p>
      <div>
        <label htmlFor={`${prefix}-hours`} className={labelClass}>
          Hours a week
        </label>
        <input
          id={`${prefix}-hours`}
          type="number"
          inputMode="decimal"
          min={1}
          max={80}
          step={0.5}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          For the hourly figures — the honest way to compare a
          part-time offer with a full-time one.
        </p>
      </div>
    </fieldset>
  );
}

function Bar({
  label,
  value,
  max,
  money,
  highlight = false,
}: {
  label: string;
  value: number;
  max: number;
  money: string;
  highlight?: boolean;
}) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-50">
          {money}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={
            highlight
              ? "h-full rounded-full bg-brand-600 dark:bg-brand-400"
              : "h-full rounded-full bg-slate-400 dark:bg-slate-500"
          }
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function OfferColumn({
  title,
  offer,
  winner,
}: {
  title: string;
  offer: OfferBreakdown;
  winner: boolean;
}) {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Gross pay (salary + bonus)", value: fmtMoney(offer.grossPay) },
    ...(offer.employeePension > 0
      ? [{ label: "Your pension", value: `−${fmtMoney(offer.employeePension)}` }]
      : []),
    { label: "Income Tax", value: `−${fmtMoney(offer.incomeTax)}` },
    { label: "National Insurance", value: `−${fmtMoney(offer.nationalInsurance)}` },
    ...(offer.studentLoan > 0
      ? [{ label: "Student loan", value: `−${fmtMoney(offer.studentLoan)}` }]
      : []),
    {
      label: "Take-home a year",
      value: fmtMoney(offer.takeHomeAnnual),
      strong: true,
    },
    { label: "Take-home a month", value: fmtMoney(offer.takeHomeMonthly) },
    { label: "Take-home a week", value: fmtMoney(offer.takeHomeWeekly) },
    {
      label: "Take-home an hour",
      value: fmtMoney(offer.takeHomeHourly),
    },
    {
      label: "Deductions (share of gross)",
      value: `${offer.effectiveDeductionPercent}%`,
    },
    {
      label: "Marginal rate on the next £100",
      value: `${offer.marginalRatePercent}%`,
    },
    ...(offer.employerPension > 0
      ? [
          {
            label: "Employer pension (on top)",
            value: fmtMoney(offer.employerPension),
          },
          {
            label: "Total reward",
            value: fmtMoney(offer.totalReward),
            strong: true,
          },
        ]
      : []),
  ];
  return (
    <div
      className={
        winner
          ? "rounded-xl border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-900 p-4"
          : "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
      }
    >
      <h3 className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
        {winner && (
          <span className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:text-brand-200">
            More take-home
          </span>
        )}
      </h3>
      <dl className="mt-3 space-y-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-600 dark:text-slate-400">{row.label}</dt>
            <dd
              className={
                row.strong
                  ? "font-semibold text-slate-900 dark:text-slate-50"
                  : "text-slate-800 dark:text-slate-200"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function SalaryComparisonCalculator() {
  const [salaryA, setSalaryA] = useState("40000");
  const [bonusA, setBonusA] = useState("0");
  const [eePenA, setEePenA] = useState("0");
  const [erPenA, setErPenA] = useState("0");
  const [hoursA, setHoursA] = useState("37.5");
  const [salaryB, setSalaryB] = useState("60000");
  const [bonusB, setBonusB] = useState("0");
  const [eePenB, setEePenB] = useState("0");
  const [erPenB, setErPenB] = useState("0");
  const [hoursB, setHoursB] = useState("37.5");
  const [plan, setPlan] = useState<PlanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  const reset = () => {
    setSalaryA("40000");
    setBonusA("0");
    setEePenA("0");
    setErPenA("0");
    setHoursA("37.5");
    setSalaryB("60000");
    setBonusB("0");
    setEePenB("0");
    setErPenB("0");
    setHoursB("37.5");
    setPlan("none");
    setPgToo(false);
  };

  const result = useMemo(
    () =>
      calculateSalaryComparison({
        a: {
          salary: parseAmount(salaryA),
          bonus: parseAmount(bonusA),
          employeePensionPercent: parseAmount(eePenA),
          employerPensionPercent: parseAmount(erPenA),
          hoursPerWeek: parseAmount(hoursA) || 37.5,
        },
        b: {
          salary: parseAmount(salaryB),
          bonus: parseAmount(bonusB),
          employeePensionPercent: parseAmount(eePenB),
          employerPensionPercent: parseAmount(erPenB),
          hoursPerWeek: parseAmount(hoursB) || 37.5,
        },
        undergraduatePlan: plan === "none" ? null : plan,
        hasPostgraduateLoan: pgToo,
      }),
    [
      salaryA, bonusA, eePenA, erPenA, hoursA,
      salaryB, bonusB, eePenB, erPenB, hoursB,
      plan, pgToo,
    ],
  );

  const { a, b } = result;
  const diff = result.takeHomeDifferenceAnnual;
  const diffMonthly = result.takeHomeDifferenceMonthly;
  const barMax = Math.max(a.takeHomeAnnual, b.takeHomeAnnual);
  const rewardMax = Math.max(a.totalReward, b.totalReward);
  const taperOffer = a.inTaperZone ? "A" : b.inTaperZone ? "B" : null;
  const goneOffer = a.allowanceGone ? "A" : b.allowanceGone ? "B" : null;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-8 print:hidden sm:grid-cols-2">
        <OfferFields
          prefix="sc-a"
          title="Salary A — current job"
          salary={salaryA}
          setSalary={setSalaryA}
          bonus={bonusA}
          setBonus={setBonusA}
          employeePension={eePenA}
          setEmployeePension={setEePenA}
          employerPension={erPenA}
          setEmployerPension={setErPenA}
          hours={hoursA}
          setHours={setHoursA}
        />
        <OfferFields
          prefix="sc-b"
          title="Salary B — the other offer"
          salary={salaryB}
          setSalary={setSalaryB}
          bonus={bonusB}
          setBonus={setBonusB}
          employeePension={eePenB}
          setEmployeePension={setEePenB}
          employerPension={erPenB}
          setEmployerPension={setErPenB}
          hours={hoursB}
          setHours={setHoursB}
        />
        <div className="sm:col-span-2">
          <label htmlFor="sc-plan" className={labelClass}>
            Student loan plan (the same plan applies to both offers)
          </label>
          <select
            id="sc-plan"
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
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
        2026/27 rules for England, Wales and Northern Ireland.
      </p>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          The comparison
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Salary comparison — inputs used
          </p>
          <p>
            Salary A: {fmtMoney(a.grossPay)} gross · Salary B:{" "}
            {fmtMoney(b.grossPay)} gross. 2026/27 rules, England, Wales
            and Northern Ireland.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtSigned(diffMonthly)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            a month — {fmtMoney(Math.abs(diff))} a year{" "}
            {Math.abs(diff) < 0.005
              ? "separates the two"
              : `more take-home from Salary ${diff > 0 ? "B" : "A"}`}
          </span>
        </p>
        {result.keepPercentOfDifference !== null &&
          Math.abs(result.grossDifference) > 0 && (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              The gross difference is {fmtMoney(Math.abs(result.grossDifference))}{" "}
              a year, and {fmtMoney(Math.abs(diff))} of it reaches your
              bank — <strong>you keep {result.keepPercentOfDifference}% of
              the {result.grossDifference > 0 ? "rise" : "difference"}</strong>.
              The rest goes in Income Tax, National Insurance
              {a.studentLoan + b.studentLoan > 0 ? " and student loan" : ""} —
              at Salary B the next £100 of pay loses{" "}
              {fmtWhole(b.marginalRatePercent)} to deductions.
            </p>
          )}

        <div className="mt-5 space-y-3">
          <Bar
            label="Salary A — take-home a year"
            value={a.takeHomeAnnual}
            max={barMax}
            money={fmtMoney(a.takeHomeAnnual)}
            highlight={result.takeHomeWinner === "A"}
          />
          <Bar
            label="Salary B — take-home a year"
            value={b.takeHomeAnnual}
            max={barMax}
            money={fmtMoney(b.takeHomeAnnual)}
            highlight={result.takeHomeWinner === "B"}
          />
          {(a.employerPension > 0 || b.employerPension > 0) && (
            <>
              <Bar
                label="Salary A — total reward a year"
                value={a.totalReward}
                max={rewardMax}
                money={fmtMoney(a.totalReward)}
              />
              <Bar
                label="Salary B — total reward a year"
                value={b.totalReward}
                max={rewardMax}
                money={fmtMoney(b.totalReward)}
              />
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Total reward is gross pay plus the employer&apos;s
                pension. On total reward Salary{" "}
                {result.totalRewardWinner === "equal"
                  ? "A and Salary B are level"
                  : `${result.totalRewardWinner} is worth ${fmtMoney(Math.abs(result.totalRewardDifference))} a year more`}
                {result.totalRewardWinner !== result.takeHomeWinner &&
                result.totalRewardWinner !== "equal"
                  ? " — the opposite order from the take-home, because the pension is doing the work."
                  : "."}
              </p>
            </>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <OfferColumn
            title="Salary A"
            offer={a}
            winner={result.takeHomeWinner === "A"}
          />
          <OfferColumn
            title="Salary B"
            offer={b}
            winner={result.takeHomeWinner === "B"}
          />
        </div>

        {(taperOffer || goneOffer) && (
          <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {taperOffer ? (
              <p>
                <strong>
                  The 60% tax trap — Salary {taperOffer} sits between
                  £100,000 and £125,140:
                </strong>{" "}
                past £100,000 the Personal Allowance is withdrawn at
                £1 for every £2 of extra income, so each extra £100
                of pay is effectively taxed at 60% before National
                Insurance — {fmtWhole((taperOffer === "A" ? a : b).marginalRatePercent)}%
                of it goes in deductions altogether. A pension
                contribution that brings pay back under £100,000
                restores the allowance.
              </p>
            ) : (
              <p>
                <strong>Salary {goneOffer} is past £125,140:</strong>{" "}
                the Personal Allowance has been withdrawn completely
                — £12,570 of it gone. Just under that line, between
                £100,000 and £125,140, the withdrawal makes the
                effective tax rate 60% before National Insurance.
              </p>
            )}
          </div>
        )}

        <ResultActions
          image={{
            title: "Salary Comparison Calculator",
            headline: fmtSigned(diffMonthly),
            headlineNote: "Take-home difference a month, B vs A, 2026/27",
            rows: [
              { label: "Salary A gross", value: fmtMoney(a.grossPay) },
              { label: "Salary A take-home", value: fmtMoney(a.takeHomeAnnual) },
              { label: "Salary B gross", value: fmtMoney(b.grossPay) },
              { label: "Salary B take-home", value: fmtMoney(b.takeHomeAnnual) },
              {
                label: "Difference a year",
                value: fmtSigned(diff),
              },
              ...(result.keepPercentOfDifference !== null
                ? [
                    {
                      label: "Kept from the rise",
                      value: `${result.keepPercentOfDifference}%`,
                    },
                  ]
                : []),
            ],
            fileName: "payrollcalc-salary-comparison-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Take-home difference a month (B − A)"
        value={fmtSigned(diffMonthly)}
      />
    </div>
  );
}
