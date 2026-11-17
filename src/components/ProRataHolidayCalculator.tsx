"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateProRataHoliday,
  type ProRataHolidayPeriod,
} from "@/lib/prorata-holiday";

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

export default function ProRataHolidayCalculator() {
  const [ftEntitlement, setFtEntitlement] = useState("28");
  const [ftDays, setFtDays] = useState("5");
  const [empDays, setEmpDays] = useState("3");
  const [hoursPerDay, setHoursPerDay] = useState("7.5");
  const [period, setPeriod] = useState<ProRataHolidayPeriod>("full");
  const [leaveYearStart, setLeaveYearStart] = useState("2026-01-01");
  const [eventDate, setEventDate] = useState("2026-07-01");

  const result = useMemo(
    () =>
      calculateProRataHoliday({
        fullTimeEntitlementDays: parseAmount(ftEntitlement),
        fullTimeDaysPerWeek: parseAmount(ftDays),
        employeeDaysPerWeek: parseAmount(empDays),
        hoursPerDay: parseAmount(hoursPerDay),
        period,
        leaveYearStart,
        startOrLeavingDate: eventDate,
      }),
    [ftEntitlement, ftDays, empDays, hoursPerDay, period, leaveYearStart, eventDate],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="prh-ft-entitlement" className={labelClass}>
            Full-time holiday entitlement (days a year)
          </label>
          <input
            id="prh-ft-entitlement"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={ftEntitlement}
            onChange={(e) => setFtEntitlement(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What a full-time worker gets, including bank holidays if
            they are inside the total. 28 is the usual figure.
          </p>
        </div>

        <div>
          <label htmlFor="prh-ft-days" className={labelClass}>
            Full-time days per week
          </label>
          <input
            id="prh-ft-days"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={ftDays}
            onChange={(e) => setFtDays(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The full-time pattern the entitlement belongs to — usually
            5.
          </p>
        </div>

        <div>
          <label htmlFor="prh-emp-days" className={labelClass}>
            Days per week the employee works
          </label>
          <input
            id="prh-emp-days"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={empDays}
            onChange={(e) => setEmpDays(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Half days count: 2.5 is two full days plus a half day.
          </p>
        </div>

        <div>
          <label htmlFor="prh-hours" className={labelClass}>
            Hours in their working day
          </label>
          <input
            id="prh-hours"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used to give the answer in hours as well as days — many
            employers record leave in hours.
          </p>
        </div>

        <div>
          <label htmlFor="prh-period" className={labelClass}>
            Full year, starting or leaving?
          </label>
          <select
            id="prh-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as ProRataHolidayPeriod)}
            className={inputClass}
          >
            <option value="full">Full leave year</option>
            <option value="starter">Starts part-way through the year</option>
            <option value="leaver">Leaves part-way through the year</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Starters and leavers only get the part of the year they
            are employed for, worked out in twelfths.
          </p>
        </div>

        {period !== "full" && (
          <>
            <div>
              <label htmlFor="prh-year-start" className={labelClass}>
                Leave year starts
              </label>
              <input
                id="prh-year-start"
                type="date"
                value={leaveYearStart}
                onChange={(e) => setLeaveYearStart(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Often 1 January or 1 April — check the contract.
              </p>
            </div>

            <div>
              <label htmlFor="prh-event-date" className={labelClass}>
                {period === "starter" ? "First day of the job" : "Last day of the job"}
              </label>
              <input
                id="prh-event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The month they start or leave in counts as a whole
                month of the leave year.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Pro-rata holiday — inputs used
          </p>
          <p>
            Full-time entitlement {ftEntitlement} days on {ftDays} days a
            week; employee works {empDays} days a week
            {period !== "full"
              ? `; ${period === "starter" ? "started" : "leaving"} ${eventDate} in a leave year from ${leaveYearStart}`
              : ""}
            .
          </p>
        </div>

        <p className="mt-2 text-3xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {result.entitlementDays} days
          {result.entitlementHours !== null &&
            ` — ${result.entitlementHours} hours`}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Holiday entitlement for this leave year
          {period !== "full" && ` (${result.twelfths} of 12 twelfths)`}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Contract pro-rata (before the legal floor)
                </td>
                <td className="py-2">{result.contractualDays} days</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Statutory floor (5.6 weeks of their pattern)
                </td>
                <td className="py-2">{result.statutoryFloorDays} days</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Full-year entitlement
                </td>
                <td className="py-2">
                  {result.fullYearDays} days
                  {result.fullYearHours !== null &&
                    ` — ${result.fullYearHours} hours`}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  This leave year
                </td>
                <td className="py-2">
                  {result.entitlementDays} days
                  {result.entitlementHours !== null &&
                    ` — ${result.entitlementHours} hours`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {result.floorApplied ? (
            <p>
              The statutory floor has been applied: the contract maths
              gave {result.contractualDays} days, but the law guarantees
              5.6 weeks of the employee&apos;s own pattern —{" "}
              {result.statutoryFloorDays} days — so the higher figure is
              the entitlement.
            </p>
          ) : (
            <p>
              The contract figure is at or above the statutory floor of{" "}
              {result.statutoryFloorDays} days (5.6 weeks of the
              employee&apos;s own pattern), so the contract figure is the
              entitlement.
            </p>
          )}
          <p>
            Bank holidays that fall on the employee&apos;s working days
            usually come out of this total if they are inside the
            full-time figure you entered.
          </p>
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Holiday entitlement this leave year"
        value={`${result.entitlementDays} days`}
      />
    </div>
  );
}
