"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useEffect, useMemo, useState } from "react";
import { calculatePayslip } from "@/lib/payslip";
import type { PayFrequency } from "@/lib/payslip";

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

export default function PayslipGenerator() {
  const [employerName, setEmployerName] = useState("Example Company Ltd");
  const [employeeName, setEmployeeName] = useState("Jamie Smith");
  const [frequency, setFrequency] = useState<PayFrequency>("monthly");
  const [grossPay, setGrossPay] = useState("2500");
  const [taxCode, setTaxCode] = useState("1257L");
  const [payDate, setPayDate] = useState("");

  // Default the pay date to today, set after mount so the server-rendered
  // page and the first client render agree.
  useEffect(() => {
    setPayDate(new Date().toISOString().slice(0, 10));
  }, []);

  const grossNumber = parseAmount(grossPay);

  const result = useMemo(
    () =>
      calculatePayslip({
        employerName,
        employeeName,
        frequency,
        grossPerPeriod: grossNumber,
        taxCode,
      }),
    [employerName, employeeName, frequency, grossNumber, taxCode],
  );

  const periodLabel = frequency === "weekly" ? "Weekly" : "Monthly";
  const payDateLabel = payDate
    ? new Date(`${payDate}T12:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="ps-employer" className={labelClass}>
            Employer name
          </label>
          <input
            id="ps-employer"
            type="text"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            className={inputClass}
            placeholder="Example Company Ltd"
          />
        </div>
        <div>
          <label htmlFor="ps-employee" className={labelClass}>
            Employee name
          </label>
          <input
            id="ps-employee"
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className={inputClass}
            placeholder="Employee name"
          />
        </div>
        <div>
          <label htmlFor="ps-frequency" className={labelClass}>
            Paid
          </label>
          <select
            id="ps-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as PayFrequency)}
            className={inputClass}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label htmlFor="ps-gross" className={labelClass}>
            Gross pay per {frequency === "weekly" ? "week" : "month"} (£)
          </label>
          <input
            id="ps-gross"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={grossPay}
            onChange={(e) => setGrossPay(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ps-taxcode" className={labelClass}>
            Tax code
          </label>
          <input
            id="ps-taxcode"
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            className={inputClass}
            placeholder="1257L"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Leave as 1257L for the standard code. BR, D0, D1, NT, 0T and K
            codes are handled too.
            {!result.taxCodeRecognised && (
              <>
                {" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  That code was not recognised, so the standard 1257L
                  figures are shown.
                </span>
              </>
            )}
          </p>
        </div>
        <div>
          <label htmlFor="ps-paydate" className={labelClass}>
            Pay date
          </label>
          <input
            id="ps-paydate"
            type="date"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {grossNumber <= 0 && (
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300 print:hidden">
          Enter a gross pay amount to see your payslip figures.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 print:hidden">
        Private by design: everything is worked out in your browser.
        Nothing you type here is sent to a server, stored or tracked — the
        payslip exists only on this page until you print or save it.
      </p>

      {/* The payslip document itself. */}
      <div className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-5 print:mt-0 print:border-slate-400 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-slate-800 pb-4 dark:border-slate-200">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {employerName.trim() || "Employer name"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {periodLabel} payslip
            </p>
          </div>
          <p className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-slate-50">
            Payslip
          </p>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500 dark:text-slate-400">
              Employee:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {employeeName.trim() || "Employee name"}
            </span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">
              Pay date:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {payDateLabel}
            </span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">
              Tax code:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {result.taxCode}
            </span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">
              NI category:{" "}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              A (standard)
            </span>
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                  Gross pay ({frequency === "weekly" ? "this week" : "this month"})
                </td>
                <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-50">
                  {gbp.format(result.grossPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                  Income Tax
                </td>
                <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                  −{gbp.format(result.incomeTaxPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                  National Insurance (employee)
                </td>
                <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                  −{gbp.format(result.employeeNiPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                  Total deductions
                </td>
                <td className="py-2 text-right text-slate-700 dark:text-slate-300">
                  −{gbp.format(result.totalDeductionsPerPeriod)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-brand-50 px-4 py-3 dark:bg-brand-900/30 print:border print:border-slate-300">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">
            Net pay
          </p>
          <p className="text-2xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
            {gbp.format(result.netPerPeriod)}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Year-to-date equivalent on this pay rate: gross{" "}
          {gbp.format(result.grossAnnual)}, Income Tax{" "}
          {gbp.format(result.incomeTaxAnnual)}, National Insurance{" "}
          {gbp.format(result.employeeNiAnnual)}, net{" "}
          {gbp.format(result.netAnnual)}. Tax-free allowance used:{" "}
          {gbp.format(result.allowanceUsed)}. Estimated with the 2026/27
          England, Wales and Northern Ireland bands, assuming this pay is
          the same every period; real PAYE is cumulative, and pension,
          student loan and other deductions are not included.
        </p>
      </div>

      <PrintButton label="Print / save this payslip" printedWhat="the payslip on its own" />

      <StickyResultBar
        label={`Net pay per ${frequency === "weekly" ? "week" : "month"}`}
        value={gbp.format(result.netPerPeriod)}
      />
    </div>
  );
}
