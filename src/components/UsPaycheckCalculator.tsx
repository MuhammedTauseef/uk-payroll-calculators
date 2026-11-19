"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateUsPaycheck,
  FILING_STATUSES,
  PAY_FREQUENCIES,
  TAX_YEAR,
} from "@/lib/us-paycheck";
import type {
  UsFilingStatus,
  UsPayFrequency,
  UsStateCode,
} from "@/lib/us-paycheck";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

const STATE_NAMES: Record<UsStateCode, string> = {
  TX: "Texas",
  OH: "Ohio",
};

export default function UsPaycheckCalculator({
  state,
}: {
  state: UsStateCode;
}) {
  const stateName = STATE_NAMES[state];
  const pfx = state.toLowerCase();
  const isOhio = state === "OH";

  const [payType, setPayType] = useState<"salary" | "hourly">("salary");
  const [annualSalary, setAnnualSalary] = useState(
    isOhio ? "65000" : "100000",
  );
  const [hourlyRate, setHourlyRate] = useState("25");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("0");
  const [frequency, setFrequency] = useState<UsPayFrequency>("biweekly");
  const [filingStatus, setFilingStatus] = useState<UsFilingStatus>("single");
  const [dependentsCredit, setDependentsCredit] = useState("0");
  const [k401Percent, setK401Percent] = useState("0");
  const [healthPremium, setHealthPremium] = useState("0");
  const [extraWithholding, setExtraWithholding] = useState("0");
  const [postTax, setPostTax] = useState("0");
  const [cityRate, setCityRate] = useState("0");
  const [schoolRate, setSchoolRate] = useState("0");

  const result = useMemo(
    () =>
      calculateUsPaycheck({
        state,
        payType,
        annualSalary: parseAmount(annualSalary),
        hourlyRate: parseAmount(hourlyRate),
        hoursPerWeek: parseAmount(hoursPerWeek),
        overtimeHoursPerWeek: parseAmount(overtimeHours),
        frequency,
        filingStatus,
        dependentsCreditAnnual: parseAmount(dependentsCredit),
        preTax401kPercent: parseAmount(k401Percent),
        healthPremiumPerPeriod: parseAmount(healthPremium),
        extraWithholdingPerPeriod: parseAmount(extraWithholding),
        postTaxDeductionsPerPeriod: parseAmount(postTax),
        cityRatePercent: parseAmount(cityRate),
        schoolRatePercent: parseAmount(schoolRate),
      }),
    [
      state,
      payType,
      annualSalary,
      hourlyRate,
      hoursPerWeek,
      overtimeHours,
      frequency,
      filingStatus,
      dependentsCredit,
      k401Percent,
      healthPremium,
      extraWithholding,
      postTax,
      cityRate,
      schoolRate,
    ],
  );

  const frequencyMeta =
    PAY_FREQUENCIES.find((f) => f.id === frequency) ?? PAY_FREQUENCIES[1];
  const statusLabel =
    FILING_STATUSES.find((s) => s.id === filingStatus)?.label ?? "Single";
  const noPay = result.grossAnnual <= 0;

  const lines: { label: string; perPeriod: number; annual: number }[] = [
    {
      label: "Gross pay",
      perPeriod: result.grossPerPeriod,
      annual: result.grossAnnual,
    },
    ...(result.preTax401kAnnual > 0
      ? [
          {
            label: "401(k) contribution (pre-tax)",
            perPeriod: -result.preTax401kPerPeriod,
            annual: -result.preTax401kAnnual,
          },
        ]
      : []),
    ...(result.healthAnnual > 0
      ? [
          {
            label: "Health insurance premium (pre-tax)",
            perPeriod: -result.healthPerPeriod,
            annual: -result.healthAnnual,
          },
        ]
      : []),
    {
      label: "Federal income tax",
      perPeriod: -result.federalPerPeriod,
      annual: -result.federalAnnual,
    },
    {
      label: "Social Security (6.2%)",
      perPeriod: -result.socialSecurityPerPeriod,
      annual: -result.socialSecurityAnnual,
    },
    {
      label: "Medicare (1.45%)",
      perPeriod: -result.medicarePerPeriod,
      annual: -result.medicareAnnual,
    },
    ...(isOhio
      ? [
          {
            label: "Ohio state income tax",
            perPeriod: -result.statePerPeriod,
            annual: -result.stateAnnual,
          },
          ...(result.cityAnnual > 0
            ? [
                {
                  label: "City income tax",
                  perPeriod: -result.cityPerPeriod,
                  annual: -result.cityAnnual,
                },
              ]
            : []),
          ...(result.schoolAnnual > 0
            ? [
                {
                  label: "School district income tax",
                  perPeriod: -result.schoolPerPeriod,
                  annual: -result.schoolAnnual,
                },
              ]
            : []),
        ]
      : [
          {
            label: "Texas state income tax",
            perPeriod: 0,
            annual: 0,
          },
        ]),
    ...(result.extraWithholdingAnnual > 0
      ? [
          {
            label: "Extra federal withholding (W-4 Step 4)",
            perPeriod: -result.extraWithholdingPerPeriod,
            annual: -result.extraWithholdingAnnual,
          },
        ]
      : []),
    ...(result.postTaxAnnual > 0
      ? [
          {
            label: "Post-tax deductions",
            perPeriod: -result.postTaxPerPeriod,
            annual: -result.postTaxAnnual,
          },
        ]
      : []),
  ];

  const stickyValue =
    result.grossAnnual > 0
      ? `${fmtMoney(result.netPerPeriod)} net per ${frequencyMeta.periodName}`
      : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor={`${pfx}-paytype`} className={labelClass}>
            How are you paid?
          </label>
          <select
            id={`${pfx}-paytype`}
            value={payType}
            onChange={(e) => setPayType(e.target.value as "salary" | "hourly")}
            className={inputClass}
          >
            <option value="salary">An annual salary</option>
            <option value="hourly">An hourly rate</option>
          </select>
        </div>

        {payType === "salary" ? (
          <div>
            <label htmlFor={`${pfx}-salary`} className={labelClass}>
              Annual salary ($)
            </label>
            <input
              id={`${pfx}-salary`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor={`${pfx}-rate`} className={labelClass}>
                Hourly rate ($)
              </label>
              <input
                id={`${pfx}-rate`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${pfx}-hours`} className={labelClass}>
                Hours per week
              </label>
              <input
                id={`${pfx}-hours`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${pfx}-overtime`} className={labelClass}>
                Overtime hours per week (paid at 1.5×)
              </label>
              <input
                id={`${pfx}-overtime`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor={`${pfx}-frequency`} className={labelClass}>
            Pay frequency
          </label>
          <select
            id={`${pfx}-frequency`}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as UsPayFrequency)}
            className={inputClass}
          >
            {PAY_FREQUENCIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${pfx}-status`} className={labelClass}>
            Filing status (Form W-4, Step 1)
          </label>
          <select
            id={`${pfx}-status`}
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as UsFilingStatus)}
            className={inputClass}
          >
            {FILING_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The estimate assumes one job held all year on a standard
            W-4 — the Step 2 box not checked.
          </p>
        </div>

        <div>
          <label htmlFor={`${pfx}-credits`} className={labelClass}>
            Dependent credits — W-4 Step 3 total ($ per year)
          </label>
          <input
            id={`${pfx}-credits`}
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={dependentsCredit}
            onChange={(e) => setDependentsCredit(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Usually $2,000 per dependent under 17 and $500 per other
            dependent. It comes straight off the federal tax.
          </p>
        </div>

        <div>
          <label htmlFor={`${pfx}-k401`} className={labelClass}>
            401(k) contribution (% of gross pay, pre-tax)
          </label>
          <input
            id={`${pfx}-k401`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={k401Percent}
            onChange={(e) => setK401Percent(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A traditional 401(k) lowers the federal income tax — but
            Social Security and Medicare are still figured on the
            full gross pay.
          </p>
        </div>

        <div>
          <label htmlFor={`${pfx}-health`} className={labelClass}>
            Health insurance premium ($ per pay period, pre-tax)
          </label>
          <input
            id={`${pfx}-health`}
            type="number"
            inputMode="decimal"
            min="0"
            step="5"
            value={healthPremium}
            onChange={(e) => setHealthPremium(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Premiums paid through a cafeteria plan reduce both the
            income-tax wages and the Social Security / Medicare
            wages.
          </p>
        </div>

        <div>
          <label htmlFor={`${pfx}-extra`} className={labelClass}>
            Extra withholding ($ per pay period, W-4 Step 4)
          </label>
          <input
            id={`${pfx}-extra`}
            type="number"
            inputMode="decimal"
            min="0"
            step="5"
            value={extraWithholding}
            onChange={(e) => setExtraWithholding(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${pfx}-posttax`} className={labelClass}>
            Post-tax deductions ($ per pay period)
          </label>
          <input
            id={`${pfx}-posttax`}
            type="number"
            inputMode="decimal"
            min="0"
            step="5"
            value={postTax}
            onChange={(e) => setPostTax(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            For example a Roth 401(k) contribution or a union due —
            taken after every tax.
          </p>
        </div>

        {isOhio && (
          <>
            <div>
              <label htmlFor={`${pfx}-city`} className={labelClass}>
                City income tax rate (%)
              </label>
              <input
                id={`${pfx}-city`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={cityRate}
                onChange={(e) => setCityRate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Most big Ohio cities charge 2.5% (Columbus, Cleveland,
                Toledo, Akron, Dayton); Cincinnati is 2.1%. Enter 0 if
                you do not live or work in a taxing city.
              </p>
            </div>
            <div>
              <label htmlFor={`${pfx}-school`} className={labelClass}>
                School district income tax rate (%)
              </label>
              <input
                id={`${pfx}-school`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.25"
                value={schoolRate}
                onChange={(e) => setSchoolRate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Only some Ohio school districts levy one — rates run
                from 0.25% to 2%. The Ohio Department of
                Taxation&apos;s Finder tool lists yours.
              </p>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked.
      </p>

      {noPay && (
        <p className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 print:hidden">
          Enter a salary — or an hourly rate and your hours per week —
          to see your {stateName} paycheck figures.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your {stateName} paycheck
        </h2>

        {/* Print-only recap of the inputs (the form itself is not printed). */}
        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            {stateName} paycheck calculation — inputs used
          </p>
          <p>
            {payType === "salary"
              ? `Salary: ${fmtMoney(parseAmount(annualSalary))} a year`
              : `Hourly: ${fmtMoney(parseAmount(hourlyRate))} an hour × ${parseAmount(hoursPerWeek)} hours a week + ${parseAmount(overtimeHours)} overtime hours`}
            {" · "}Pay frequency: {frequencyMeta.label}
            {" · "}Filing status: {statusLabel}
            {" · "}W-4 Step 3 credits: {fmtMoney(parseAmount(dependentsCredit))} a year
            {" · "}401(k): {parseAmount(k401Percent)}% of gross
            {" · "}Health premium: {fmtMoney(parseAmount(healthPremium))} per period
            {isOhio
              ? ` · City rate: ${parseAmount(cityRate)}% · School district rate: ${parseAmount(schoolRate)}%`
              : ""}
            {" · "}Tax year: {TAX_YEAR}.
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtMoney(result.netPerPeriod)}
          <span className="text-base font-medium text-slate-600 dark:text-slate-300">
            {" "}
            net pay per {frequencyMeta.periodName} ·{" "}
            {fmtMoney(result.netAnnual)} a year
          </span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Effective tax rate: {result.effectiveTaxRatePercent.toFixed(2)}%
          {" · "}Marginal federal bracket:{" "}
          {result.marginalFederalRatePercent.toFixed(0)}%
          {" · "}You keep {result.keepCentsPerDollar.toFixed(1)}¢ of every
          $1 you earn.
          {isOhio ? (
            <>
              {" "}
              Ohio state, city and school taxes are included above at
              the rates you entered.
            </>
          ) : (
            <>
              {" "}
              Texas state income tax: <strong>$0.00</strong> — Texas has
              no state income tax.
            </>
          )}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-brand-200 dark:border-brand-800">
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Line
                </th>
                <th className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                  Per {frequencyMeta.periodName}
                </th>
                <th className="py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {lines.map((line) => (
                <tr key={line.label}>
                  <td className="py-2 pr-3">{line.label}</td>
                  <td className="py-2 pr-3">
                    {line.perPeriod < 0
                      ? `−${fmtMoney(-line.perPeriod)}`
                      : fmtMoney(line.perPeriod)}
                  </td>
                  <td className="py-2">
                    {line.annual < 0
                      ? `−${fmtMoney(-line.annual)}`
                      : fmtMoney(line.annual)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold text-slate-900 dark:text-slate-50">
                <td className="py-2 pr-3">Total deductions</td>
                <td className="py-2 pr-3">
                  −{fmtMoney(result.totalDeductionsPerPeriod)}
                </td>
                <td className="py-2">
                  −{fmtMoney(result.totalDeductionsAnnual)}
                </td>
              </tr>
              <tr className="font-bold text-brand-800 dark:text-brand-300">
                <td className="py-2 pr-3">Net pay</td>
                <td className="py-2 pr-3">{fmtMoney(result.netPerPeriod)}</td>
                <td className="py-2">{fmtMoney(result.netAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar label={`${stateName} net pay`} value={stickyValue} />
    </div>
  );
}
