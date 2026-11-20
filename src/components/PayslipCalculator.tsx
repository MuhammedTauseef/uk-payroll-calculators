"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import ResultDonut, { DONUT_COLORS } from "@/components/ResultDonut";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculatePayslipBreakdown } from "@/lib/payslip-calculator";
import {
  STUDENT_LOAN_PLANS,
  type StudentLoanPlanId,
} from "@/lib/student-loan";

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

type LoanChoice = "none" | StudentLoanPlanId;

export default function PayslipCalculator() {
  const [salary, setSalary] = useState("36000");
  const [taxCode, setTaxCode] = useState("1257L");
  const [pension, setPension] = useState("5");
  const [loan, setLoan] = useState<LoanChoice>("none");
  const [pgToo, setPgToo] = useState(false);

  const reset = () => {
    setSalary("36000");
    setTaxCode("1257L");
    setPension("5");
    setLoan("none");
    setPgToo(false);
  };

  const result = useMemo(
    () =>
      calculatePayslipBreakdown({
        annualSalary: parseAmount(salary),
        taxCode,
        pensionPercent: parseAmount(pension),
        studentLoanPlan: loan === "none" ? null : loan,
        postgraduateLoanToo: loan !== "none" && loan !== "postgraduate" && pgToo,
      }),
    [salary, taxCode, pension, loan, pgToo],
  );

  const rows: { label: string; value: string; negative?: boolean }[] = [
    { label: "Gross pay", value: gbp.format(result.grossMonthly) },
    ...(result.pensionMonthly > 0
      ? [
          {
            label: "Pension contribution (before tax, not before NI)",
            value: `− ${gbp.format(result.pensionMonthly)}`,
            negative: true,
          },
        ]
      : []),
    {
      label: `Income Tax (code ${result.taxCode})`,
      value: `− ${gbp.format(result.incomeTaxMonthly)}`,
      negative: true,
    },
    {
      label: "National Insurance",
      value: `− ${gbp.format(result.employeeNiMonthly)}`,
      negative: true,
    },
    ...(result.studentLoanMonthly > 0
      ? [
          {
            label: "Student loan repayment",
            value: `− ${gbp.format(result.studentLoanMonthly)}`,
            negative: true,
          },
        ]
      : []),
    { label: "Net pay — what lands in your account", value: gbp.format(result.netMonthly) },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <MoneySlider
          id="pc-salary"
          label="Your gross annual salary (£)"
          value={salary}
          onChange={setSalary}
          min={0}
          max={200000}
          step={500}
        />

        <div>
          <label htmlFor="pc-code" className={labelClass}>
            Your tax code
          </label>
          <input
            id="pc-code"
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            On your payslip or in your HMRC personal tax account.
            1257L is the standard code — the digits are your tax-free
            allowance in tens of pounds.
          </p>
        </div>

        <MoneySlider
          id="pc-pension"
          label="Your pension contribution (% of gross pay)"
          value={pension}
          onChange={setPension}
          min={0}
          max={40}
          step={0.5}
          hint="The auto-enrolment employee minimum is 5%. Modelled as a net-pay arrangement — it reduces your tax, not your National Insurance."
        />

        <div>
          <label htmlFor="pc-loan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="pc-loan"
            value={loan}
            onChange={(e) => setLoan(e.target.value as LoanChoice)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            {STUDENT_LOAN_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {loan !== "none" && loan !== "postgraduate" && (
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pgToo}
                onChange={(e) => setPgToo(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700"
              />
              <span>I also repay a Postgraduate Loan at the same time</span>
            </label>
          </div>
        )}

        {!result.taxCodeRecognised && (
          <p className="text-sm text-amber-700 dark:text-amber-400 sm:col-span-2">
            That tax code could not be read, so the standard 1257L
            figures are shown. Check the code on your last payslip.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your monthly payslip
        </h2>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netMonthly)} net
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          from {gbp.format(result.grossMonthly)} gross a month —{" "}
          {gbp.format(result.netAnnual)} net over the year
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-brand-100 dark:divide-brand-900">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="py-2 pr-3 font-medium text-slate-900 dark:text-slate-50">
                    {r.label}
                  </td>
                  <td className="py-2">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ResultDonut
          segments={[
            {
              label: "Take-home pay",
              value: result.netMonthly,
              displayValue: gbp.format(result.netMonthly),
              color: DONUT_COLORS.deep,
            },
            {
              label: "Income Tax",
              value: result.incomeTaxMonthly,
              displayValue: gbp.format(result.incomeTaxMonthly),
              color: DONUT_COLORS.accent,
            },
            {
              label: "National Insurance",
              value: result.employeeNiMonthly,
              displayValue: gbp.format(result.employeeNiMonthly),
              color: DONUT_COLORS.mid,
            },
            {
              label: "Pension contribution",
              value: result.pensionMonthly,
              displayValue: gbp.format(result.pensionMonthly),
              color: DONUT_COLORS.light,
            },
            {
              label: "Student loan repayment",
              value: result.studentLoanMonthly,
              displayValue: gbp.format(result.studentLoanMonthly),
              color: DONUT_COLORS.grey,
            },
          ]}
          centerLabel="Net pay"
          centerValue={gbp.format(result.netMonthly)}
        />

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Real PAYE is cumulative: the tax on one month depends on
            the pay and tax earlier in the tax year, so a month with a
            bonus or a mid-year start can differ. On a steady salary
            these figures are the ones your payslip will show.
          </p>
        </div>

        <ResultActions
          image={{
            title: "Payslip Calculator",
            headline: `${gbp.format(result.netMonthly)} net`,
            headlineNote: `Net pay per month, from ${gbp.format(result.grossMonthly)} gross`,
            rows: rows.map((r) => ({ label: r.label, value: r.value })),
            fileName: "payrollcalc-payslip-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Net pay per month"
        value={gbp.format(result.netMonthly)}
      />
    </div>
  );
}
