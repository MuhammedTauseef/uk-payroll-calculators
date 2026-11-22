"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { convertDayRate } from "@/lib/day-rate";
import type { DayRateDirection } from "@/lib/day-rate";

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

export default function DayRateCalculator() {
  const [direction, setDirection] =
    useState<DayRateDirection>("rateToSalary");
  const [dayRate, setDayRate] = useState("300");
  const [targetSalary, setTargetSalary] = useState("50000");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [bankHolidays, setBankHolidays] = useState("8");
  const [holidayDays, setHolidayDays] = useState("25");
  const [otherDaysOff, setOtherDaysOff] = useState("0");
  const [hoursPerDay, setHoursPerDay] = useState("7.5");
  const [uplift, setUplift] = useState("30");

  const reset = () => {
    setDirection("rateToSalary");
    setDayRate("300");
    setTargetSalary("50000");
    setDaysPerWeek("5");
    setBankHolidays("8");
    setHolidayDays("25");
    setOtherDaysOff("0");
    setHoursPerDay("7.5");
    setUplift("30");
  };

  const result = useMemo(
    () =>
      convertDayRate({
        direction,
        dayRate: parseAmount(dayRate),
        targetAnnualSalary: parseAmount(targetSalary),
        daysPerWeek: parseAmount(daysPerWeek),
        bankHolidaysPerYear: parseAmount(bankHolidays),
        holidayDaysPerYear: parseAmount(holidayDays),
        otherDaysOffPerYear: parseAmount(otherDaysOff),
        hoursPerDay: parseAmount(hoursPerDay),
        upliftPercent: parseAmount(uplift),
      }),
    [
      direction,
      dayRate,
      targetSalary,
      daysPerWeek,
      bankHolidays,
      holidayDays,
      otherDaysOff,
      hoursPerDay,
      uplift,
    ],
  );

  const noDays = result.billableDays <= 0;
  const noRate = result.dayRate <= 0;

  const stickyValue =
    direction === "rateToSalary"
      ? `${fmtMoney(result.grossAnnual)} a year`
      : `${fmtMoney(result.dayRate)} a day`;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label
            htmlFor="dr-direction"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            What are you converting?
          </label>
          <select
            id="dr-direction"
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as DayRateDirection)
            }
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          >
            <option value="rateToSalary">
              A day rate — into a yearly figure
            </option>
            <option value="salaryToRate">
              A salary — into the day rate it needs
            </option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Both directions use the same billable days, built from
            your week and your time off below — never a hidden
            standard year.
          </p>
        </div>

        {direction === "rateToSalary" ? (
          <MoneySlider
            id="dr-rate"
            label="Day rate (£)"
            value={dayRate}
            onChange={setDayRate}
            min={0}
            max={2000}
            step={5}
          />
        ) : (
          <MoneySlider
            id="dr-salary"
            label="Target salary (£ a year)"
            value={targetSalary}
            onChange={setTargetSalary}
            min={0}
            max={250000}
            step={500}
            hint="The gross salary you want the contract work to match, before the uplift below is added for the benefits a salary carries."
          />
        )}

        <MoneySlider
          id="dr-days-week"
          label="Days worked per week"
          value={daysPerWeek}
          onChange={setDaysPerWeek}
          min={1}
          max={7}
          step={1}
        />
        <MoneySlider
          id="dr-bank-holidays"
          label="Bank holidays not worked (per year)"
          value={bankHolidays}
          onChange={setBankHolidays}
          min={0}
          max={15}
          step={1}
          hint="8 in England and Wales, more in Scotland and Northern Ireland. Set 0 if you work them."
        />
        <MoneySlider
          id="dr-holiday"
          label="Holiday days taken (per year)"
          value={holidayDays}
          onChange={setHolidayDays}
          min={0}
          max={60}
          step={1}
          hint="Days you plan not to bill. A permanent job carries at least 28 days of paid leave including bank holidays — contractors fund their own."
        />
        <MoneySlider
          id="dr-other-off"
          label="Other days off (per year)"
          value={otherDaysOff}
          onChange={setOtherDaysOff}
          min={0}
          max={60}
          step={1}
          hint="Sickness, training and gaps between contracts — days with no invoice."
        />
        <MoneySlider
          id="dr-hours"
          label="Hours per day"
          value={hoursPerDay}
          onChange={setHoursPerDay}
          min={1}
          max={16}
          step={0.5}
          hint="For the hourly equivalent — 7.5 and 8 are the common contract days."
        />
        {direction === "salaryToRate" && (
          <MoneySlider
            id="dr-uplift"
            label="Benefits uplift (%)"
            value={uplift}
            onChange={setUplift}
            min={0}
            max={60}
            step={5}
            hint="The standard 30% stands for the employer pension, paid holiday, sick pay and employer National Insurance a salary carries and a day rate must fund itself."
          />
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {(noDays || noRate) && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          {noDays
            ? "Those days off use up the whole year — reduce the holiday or other days off so some billable days remain."
            : "Enter a day rate or a target salary to see the conversion."}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          {direction === "rateToSalary"
            ? "Your contract value, gross"
            : "The day rate you need to charge"}
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Day rate calculation — inputs used
          </p>
          <p>
            {direction === "rateToSalary"
              ? `Day rate: ${fmtMoney(parseAmount(dayRate))}`
              : `Target salary: ${fmtMoney(parseAmount(targetSalary))} a year, uplift ${parseAmount(uplift)}%`}
            {" · "}Billable days: {result.billableDays} (
            {parseAmount(daysPerWeek)} days a week × 52, less{" "}
            {parseAmount(bankHolidays)} bank holidays,{" "}
            {parseAmount(holidayDays)} holiday days and{" "}
            {parseAmount(otherDaysOff)} other days off). Take-home
            estimate on 2026/27 England, Wales and Northern Ireland
            PAYE rules, before pension and student loan.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {direction === "rateToSalary" ? (
            <>
              {fmtMoney(result.grossAnnual)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                a year, before tax
              </span>
            </>
          ) : (
            <>
              {fmtMoney(result.dayRate)}
              <span className="text-base font-medium text-slate-600 dark:text-slate-300">
                {" "}
                a day, before tax
              </span>
            </>
          )}
        </p>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Billable days: </dt>
            <dd className="inline">
              {parseAmount(daysPerWeek)} days a week × 52 ={" "}
              {parseAmount(daysPerWeek) * 52}, less{" "}
              {parseAmount(bankHolidays)} bank holidays,{" "}
              {parseAmount(holidayDays)} holiday days and{" "}
              {parseAmount(otherDaysOff)} other days off ={" "}
              <strong>{result.billableDays} days</strong> you can
              actually invoice.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Day rate: </dt>
            <dd className="inline">
              {direction === "rateToSalary" ? (
                <>{fmtMoney(parseAmount(dayRate))} a day.</>
              ) : (
                <>
                  {fmtMoney(result.grossAnnual)} needed ÷{" "}
                  {result.billableDays} billable days ={" "}
                  <strong>{fmtMoney(result.dayRate)}</strong> a day.
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Weekly and monthly: </dt>
            <dd className="inline">
              <strong>{fmtMoney(result.weeklyRate)}</strong> a week ·{" "}
              <strong>{fmtMoney(result.monthlyGross)}</strong> a month
              on average.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Hourly equivalent: </dt>
            <dd className="inline">
              {fmtMoney(result.dayRate)} ÷ {parseAmount(hoursPerDay)}{" "}
              hours = <strong>{fmtMoney(result.hourlyRate)}</strong>{" "}
              an hour.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              {direction === "rateToSalary"
                ? "Permanent-salary equivalent: "
                : "Gross amount the rate must produce: "}
            </dt>
            <dd className="inline">
              {direction === "rateToSalary" ? (
                <>
                  about <strong>{fmtMoney(result.equivalentSalary)}</strong>{" "}
                  — the contract value with the {parseAmount(uplift)}%
                  benefits loading taken back out, so it can be
                  compared with a salaried job on equal terms.
                </>
              ) : (
                <>
                  <strong>{fmtMoney(result.grossAnnual)}</strong> a
                  year — your {fmtMoney(result.equivalentSalary)}{" "}
                  target plus the {parseAmount(uplift)}% uplift for
                  the benefits a salary carries.
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">
              Take-home estimate:{" "}
            </dt>
            <dd className="inline">
              taxed as employment income (the inside IR35 and
              umbrella position), the gross figure leaves{" "}
              <strong>{fmtMoney(result.takeHomeAnnual)}</strong> a
              year — {fmtMoney(result.takeHomeMonthly)} a month —
              after {fmtMoney(result.incomeTax)} Income Tax and{" "}
              {fmtMoney(result.employeeNationalInsurance)} employee
              National Insurance, before pension contributions and
              student loan repayments.
            </dd>
          </div>
        </dl>

        <ResultActions
          image={{
            title: "Day Rate Calculator",
            headline:
              direction === "rateToSalary"
                ? fmtMoney(result.grossAnnual)
                : fmtMoney(result.dayRate),
            headlineNote:
              direction === "rateToSalary"
                ? "Gross annual contract value, before tax"
                : "Day rate needed, before tax",
            rows: [
              { label: "Day rate", value: fmtMoney(result.dayRate) },
              {
                label: "Billable days",
                value: `${result.billableDays}`,
              },
              {
                label: "Gross per year",
                value: fmtMoney(result.grossAnnual),
              },
              {
                label: "Take-home estimate",
                value: fmtMoney(result.takeHomeAnnual),
              },
            ],
            fileName: "payrollcalc-day-rate-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label={direction === "rateToSalary" ? "Gross per year" : "Day rate"}
        value={stickyValue}
      />
    </div>
  );
}
