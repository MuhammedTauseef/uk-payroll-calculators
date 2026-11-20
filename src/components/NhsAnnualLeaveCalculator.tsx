"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import ResultDonut, { DONUT_COLORS } from "@/components/ResultDonut";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  accrueNhsLeave,
  calculateNhsAnnualLeave,
  nhsFractionOfYear,
  nhsLeaveYearFor,
  NHS_NATION_LABELS,
  NHS_SERVICE_BAND_LABELS,
  type NhsLeaveMode,
  type NhsNation,
  type NhsServiceBand,
} from "@/lib/nhs-annual-leave";

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Hours with at most 2 decimals: 262.5, 131.25, 116. */
function fmtHours(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("en-GB", {
    maximumFractionDigits: 2,
  });
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function NhsAnnualLeaveCalculator() {
  const [mode, setMode] = useState<NhsLeaveMode>("full-year");
  const [nation, setNation] = useState<NhsNation>("england");
  const [serviceBand, setServiceBand] = useState<NhsServiceBand>("under-5");
  const [hours, setHours] = useState("37.5");
  const [shiftLength, setShiftLength] = useState("7.5");
  const [carryOver, setCarryOver] = useState("0");
  const [taken, setTaken] = useState("0");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [leavingDate, setLeavingDate] = useState("2026-09-30");

  const reset = () => {
    setMode("full-year");
    setNation("england");
    setServiceBand("under-5");
    setHours("37.5");
    setShiftLength("7.5");
    setCarryOver("0");
    setTaken("0");
    setStartDate("2026-10-01");
    setLeavingDate("2026-09-30");
  };

  const fullYear = useMemo(
    () =>
      calculateNhsAnnualLeave({
        nation,
        serviceBand,
        contractedHours: parseAmount(hours),
      }),
    [nation, serviceBand, hours],
  );

  const activeDate = mode === "joiner" ? startDate : leavingDate;
  const fraction = useMemo(
    () =>
      mode === "full-year"
        ? 1
        : nhsFractionOfYear(activeDate, mode === "joiner" ? "joiner" : "leaver"),
    [mode, activeDate],
  );
  const leaveYear = useMemo(
    () => nhsLeaveYearFor(activeDate),
    [activeDate],
  );
  const accrual = useMemo(
    () =>
      accrueNhsLeave(
        fullYear,
        fraction,
        mode === "leaver" ? parseAmount(taken) : 0,
      ),
    [fullYear, fraction, mode, taken],
  );

  const carryOverHours = parseAmount(carryOver);
  const takenHoursFullYear = parseAmount(taken);
  const balanceFullYear =
    Math.round((fullYear.totalHours + carryOverHours - takenHoursFullYear) * 100) / 100;

  const shift = parseAmount(shiftLength);
  const shiftsFor = (h: number) =>
    shift > 0 ? Math.round((h / shift) * 10) / 10 : null;

  const headlineHours =
    mode === "full-year"
      ? fullYear.totalHours
      : mode === "joiner"
        ? accrual.accruedTotalHours
        : accrual.balanceHours;

  const tableRows: { label: string; value: string }[] =
    mode === "full-year"
      ? [
          {
            label: `Annual leave (${fullYear.leaveDays} days full-time)`,
            value: `${fmtHours(fullYear.leaveHours)} hours`,
          },
          {
            label: `Public holidays (${fullYear.publicHolidays} days full-time)`,
            value: `${fmtHours(fullYear.publicHolidayHours)} hours`,
          },
          {
            label: "Total entitlement",
            value: `${fmtHours(fullYear.totalHours)} hours (${fullYear.totalDays} days)`,
          },
          ...(carryOverHours > 0
            ? [
                {
                  label: "Carried over from last year",
                  value: `${fmtHours(carryOverHours)} hours`,
                },
              ]
            : []),
          ...(takenHoursFullYear > 0
            ? [
                {
                  label: "Already taken or booked",
                  value: `${fmtHours(takenHoursFullYear)} hours`,
                },
              ]
            : []),
          ...(carryOverHours > 0 || takenHoursFullYear > 0
            ? [
                {
                  label: "Remaining balance",
                  value: `${fmtHours(balanceFullYear)} hours`,
                },
              ]
            : []),
          ...(shiftsFor(fullYear.totalHours) !== null
            ? [
                {
                  label: `In ${fmtHours(shift)}-hour shifts`,
                  value: `${shiftsFor(fullYear.totalHours)} shifts`,
                },
              ]
            : []),
        ]
      : [
          {
            label: "Leave year",
            value: `${leaveYear.startISO} to ${leaveYear.endISO}`,
          },
          {
            label:
              mode === "joiner"
                ? "Fraction of the year remaining"
                : "Fraction of the year worked",
            value: `${Math.round(fraction * 1000) / 10}%`,
          },
          {
            label: "Full-year entitlement",
            value: `${fmtHours(fullYear.totalHours)} hours`,
          },
          {
            label: "Accrued annual leave",
            value: `${fmtHours(accrual.accruedLeaveHours)} hours`,
          },
          {
            label: "Accrued public holidays",
            value: `${fmtHours(accrual.accruedPublicHolidayHours)} hours`,
          },
          {
            label: "Accrued total",
            value: `${fmtHours(accrual.accruedTotalHours)} hours`,
          },
          ...(mode === "leaver"
            ? [
                {
                  label: "Already taken",
                  value: `${fmtHours(accrual.takenHours)} hours`,
                },
                {
                  label:
                    accrual.balanceHours >= 0
                      ? "Still owed to you"
                      : "Taken beyond what you had built up",
                  value: `${fmtHours(Math.abs(accrual.balanceHours))} hours`,
                },
              ]
            : []),
          ...(shiftsFor(accrual.accruedTotalHours) !== null
            ? [
                {
                  label: `In ${fmtHours(shift)}-hour shifts`,
                  value: `${shiftsFor(accrual.accruedTotalHours)} shifts`,
                },
              ]
            : []),
        ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="print:hidden">
        <label htmlFor="nal-mode" className={labelClass}>
          What do you want to work out?
        </label>
        <select
          id="nal-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as NhsLeaveMode)}
          className={inputClass}
        >
          <option value="full-year">My full leave year entitlement</option>
          <option value="joiner">I started during the leave year</option>
          <option value="leaver">I am leaving during the leave year</option>
        </select>
      </div>

      <div className="mt-4 grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="nal-nation" className={labelClass}>
            Where do you work?
          </label>
          <select
            id="nal-nation"
            value={nation}
            onChange={(e) => setNation(e.target.value as NhsNation)}
            className={inputClass}
          >
            {(Object.keys(NHS_NATION_LABELS) as NhsNation[]).map((n) => (
              <option key={n} value={n}>
                {NHS_NATION_LABELS[n]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {nation === "scotland"
              ? "Scotland's full-time week is 36 hours from 1 April 2026, so a day of leave is 7.2 hours."
              : nation === "northern-ireland"
                ? "Northern Ireland has 10 public holidays a year, not 8."
                : nation === "wales"
                  ? "Wales adds one extra day of leave at every length of service."
                  : "8 public holidays a year, on a 37.5-hour full-time week."}
          </p>
        </div>
        <div>
          <label htmlFor="nal-service" className={labelClass}>
            Length of NHS service
          </label>
          <select
            id="nal-service"
            value={serviceBand}
            onChange={(e) => setServiceBand(e.target.value as NhsServiceBand)}
            className={inputClass}
          >
            {(Object.keys(NHS_SERVICE_BAND_LABELS) as NhsServiceBand[]).map(
              (b) => (
                <option key={b} value={b}>
                  {NHS_SERVICE_BAND_LABELS[b]} — {NHS_NATION_LABELS[nation]}{" "}
                  {nation === "wales"
                    ? { "under-5": 28, "5-to-10": 30, "10-plus": 34 }[b]
                    : { "under-5": 27, "5-to-10": 29, "10-plus": 33 }[b]}{" "}
                  days
                </option>
              ),
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Service with any NHS employer counts — you do not start again
            when you move trusts.
          </p>
        </div>
        <MoneySlider
          id="nal-hours"
          label="Contracted hours per week"
          value={hours}
          onChange={setHours}
          min={0}
          max={40}
          step={0.5}
          hint={`Full time is ${fullYear.fullTimeWeekHours} hours in ${NHS_NATION_LABELS[nation]}. Anything above that is counted as full time — overtime does not add leave.`}
        />
        <div>
          <label htmlFor="nal-shift" className={labelClass}>
            Your usual shift length (hours)
          </label>
          <input
            id="nal-shift"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={shiftLength}
            onChange={(e) => setShiftLength(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used only to express your leave in shifts — 7.5 for a standard
            day, 12 or 12.5 for long shifts.
          </p>
        </div>

        {mode === "full-year" && (
          <>
            <div>
              <label htmlFor="nal-carry" className={labelClass}>
                Hours carried over from last year (optional)
              </label>
              <input
                id="nal-carry"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={carryOver}
                onChange={(e) => setCarryOver(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="nal-taken" className={labelClass}>
                Hours already taken or booked (optional)
              </label>
              <input
                id="nal-taken"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={taken}
                onChange={(e) => setTaken(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        {mode === "joiner" && (
          <div>
            <label htmlFor="nal-start" className={labelClass}>
              Your start date
            </label>
            <input
              id="nal-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The NHS leave year runs 1 April to 31 March. Your first
              year&apos;s leave is the share of the year from this date to
              31 March.
            </p>
          </div>
        )}

        {mode === "leaver" && (
          <>
            <div>
              <label htmlFor="nal-leaving" className={labelClass}>
                Your last working day
              </label>
              <input
                id="nal-leaving"
                type="date"
                value={leavingDate}
                onChange={(e) => setLeavingDate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Leave builds up day by day from 1 April to this date.
              </p>
            </div>
            <div>
              <label htmlFor="nal-taken-leaver" className={labelClass}>
                Hours already taken this leave year
              </label>
              <input
                id="nal-taken-leaver"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={taken}
                onChange={(e) => setTaken(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {fmtHours(headlineHours)} hours
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          {mode === "full-year" &&
            `${fullYear.totalDays} days of ${fullYear.dayHours} hours — ${fullYear.leaveDays} days of annual leave plus ${fullYear.publicHolidays} public holidays, at ${fmtHours(fullYear.contractedHours)} contracted hours a week in ${NHS_NATION_LABELS[nation]}.`}
          {mode === "joiner" &&
            `built up from your start date to 31 March — ${Math.round(fraction * 1000) / 10}% of the full-year ${fmtHours(fullYear.totalHours)} hours.`}
          {mode === "leaver" &&
            (accrual.balanceHours >= 0
              ? `still owed to you on your last day — you had built up ${fmtHours(accrual.accruedTotalHours)} hours and have taken ${fmtHours(accrual.takenHours)}.`
              : `taken beyond the ${fmtHours(accrual.accruedTotalHours)} hours you had built up by your last day.`)}
        </p>

        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {mode === "full-year" && (
            <p>
              Your annual leave is {fmtHours(fullYear.leaveHours)} hours and
              your public holiday entitlement is{" "}
              {fmtHours(fullYear.publicHolidayHours)} hours. The two are
              added together into one pot of {fmtHours(fullYear.totalHours)}{" "}
              hours; public holidays that fall on your working days are
              booked out of it.
              {carryOverHours > 0 || takenHoursFullYear > 0
                ? ` With carry-over and leave already taken counted, your remaining balance is ${fmtHours(balanceFullYear)} hours.`
                : ""}
            </p>
          )}
          {mode === "joiner" && (
            <p>
              A full year at your hours would be{" "}
              {fmtHours(fullYear.totalHours)} hours. From {startDate} to the
              end of the leave year on {leaveYear.endISO} is{" "}
              {Math.round(fraction * 1000) / 10}% of the year, so your first
              year&apos;s entitlement is{" "}
              {fmtHours(accrual.accruedTotalHours)} hours —{" "}
              {fmtHours(accrual.accruedLeaveHours)} of annual leave and{" "}
              {fmtHours(accrual.accruedPublicHolidayHours)} of public
              holidays.
            </p>
          )}
          {mode === "leaver" && accrual.balanceHours >= 0 && (
            <p>
              Untaken built-up leave is paid in your final pay — the{" "}
              holiday pay calculator on this site prices it in pounds once
              you know the hours. If you would rather take the time, the{" "}
              {fmtHours(accrual.balanceHours)} hours have to be fitted in
              before your last day by agreement with your manager.
            </p>
          )}
          {mode === "leaver" && accrual.balanceHours < 0 && (
            <p>
              You have taken {fmtHours(Math.abs(accrual.balanceHours))}{" "}
              hours more than you had built up. Your employer can only take
              the value back out of your final pay if your contract or a
              written agreement allows it — it is not automatic.
            </p>
          )}
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-2 font-medium">{row.label}</td>
                  <td className="px-4 py-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mode === "full-year" && (
          <ResultDonut
            segments={[
              {
                label: "Annual leave",
                value: fullYear.leaveHours,
                displayValue: `${fmtHours(fullYear.leaveHours)} hours`,
                color: DONUT_COLORS.deep,
              },
              {
                label: "Public holidays",
                value: fullYear.publicHolidayHours,
                displayValue: `${fmtHours(fullYear.publicHolidayHours)} hours`,
                color: DONUT_COLORS.light,
              },
            ]}
            centerLabel="Total leave"
            centerValue={`${fmtHours(fullYear.totalHours)} hours`}
          />
        )}
        {mode === "joiner" && (
          <ResultDonut
            segments={[
              {
                label: "Accrued annual leave",
                value: accrual.accruedLeaveHours,
                displayValue: `${fmtHours(accrual.accruedLeaveHours)} hours`,
                color: DONUT_COLORS.deep,
              },
              {
                label: "Accrued public holidays",
                value: accrual.accruedPublicHolidayHours,
                displayValue: `${fmtHours(accrual.accruedPublicHolidayHours)} hours`,
                color: DONUT_COLORS.light,
              },
            ]}
            centerLabel="Accrued"
            centerValue={`${fmtHours(accrual.accruedTotalHours)} hours`}
          />
        )}
        {mode === "leaver" && accrual.balanceHours >= 0 && (
          <ResultDonut
            segments={[
              {
                label: "Still owed to you",
                value: accrual.balanceHours,
                displayValue: `${fmtHours(accrual.balanceHours)} hours`,
                color: DONUT_COLORS.deep,
              },
              {
                label: "Already taken",
                value: accrual.takenHours,
                displayValue: `${fmtHours(accrual.takenHours)} hours`,
                color: DONUT_COLORS.light,
              },
            ]}
            centerLabel="Built up"
            centerValue={`${fmtHours(accrual.accruedTotalHours)} hours`}
          />
        )}
        {mode === "leaver" && accrual.balanceHours < 0 && (
          <ResultDonut
            segments={[
              {
                label: "You had built up",
                value: accrual.accruedTotalHours,
                displayValue: `${fmtHours(accrual.accruedTotalHours)} hours`,
                color: DONUT_COLORS.light,
              },
              {
                label: "Taken beyond that",
                value: Math.abs(accrual.balanceHours),
                displayValue: `${fmtHours(Math.abs(accrual.balanceHours))} hours`,
                color: DONUT_COLORS.accent,
              },
            ]}
            centerLabel="Taken"
            centerValue={`${fmtHours(accrual.takenHours)} hours`}
          />
        )}

        <ResultActions
          image={{
            title: "NHS Annual Leave",
            headline: `${fmtHours(headlineHours)} hours`,
            headlineNote:
              mode === "full-year"
                ? `${fullYear.leaveDays} days + ${fullYear.publicHolidays} public holidays in ${NHS_NATION_LABELS[nation]}`
                : mode === "joiner"
                  ? `Accrued from ${startDate} to 31 March`
                  : accrual.balanceHours >= 0
                    ? `Still owed on leaving on ${leavingDate}`
                    : `Taken beyond accrual by ${leavingDate}`,
            rows: tableRows.slice(0, 6),
            fileName: "payrollcalc-nhs-annual-leave-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label={
          mode === "full-year"
            ? "Total annual leave"
            : mode === "joiner"
              ? "Leave built up this year"
              : "Leave still owed"
        }
        value={`${fmtHours(headlineHours)} hours`}
      />
    </div>
  );
}
