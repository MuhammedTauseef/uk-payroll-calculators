import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TakeHomeCalculator from "@/components/TakeHomeCalculator";
import { calculateTakeHome } from "@/lib/takehome";
import {
  EMPLOYEE_NI,
  INCOME_TAX,
  PAYE_RATES_LABEL,
  RATES_LAST_VERIFIED,
} from "@/lib/rates";

export const metadata: Metadata = pageMetadata(
  "/40k-after-tax-uk",
  "£40k After Tax UK — Take-Home Pay on a £40,000 Salary",
  "On a £40,000 salary in 2026/27 you take home £32,319.60 a year (£2,693.30 a month) after tax and National Insurance. Check any salary with the calculator.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const at40k = calculateTakeHome({ annualSalary: 40000 });
const comparison = [30000, 40000, 50000, 60000].map((s) => ({
  salary: s,
  result: calculateTakeHome({ annualSalary: s }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is £40,000 a year after tax in the UK?",
    answer:
      "In 2026/27, a £40,000 salary leaves £32,319.60 a year after Income Tax (£5,486) and employee National Insurance (£2,194.40). That is £2,693.30 a month, £621.53 a week or £124.31 a day, before pension contributions or student loan repayments.",
  },
  {
    question: "How is the tax on £40,000 worked out?",
    answer:
      "The first £12,570 is covered by the Personal Allowance and taxed at 0%. The remaining £27,430 falls inside the basic-rate band, so it is taxed at 20%, giving £5,486 of Income Tax. National Insurance is 8% of the same £27,430 slice (earnings between £12,570 and £50,270), which is £2,194.40.",
  },
  {
    question: "Is £40,000 a good salary in the UK?",
    answer:
      "It is above the UK median for full-time employees, and comfortably inside the basic-rate tax band — you keep about 81p of every pound overall. Whether it feels comfortable depends mostly on housing costs: the same take-home pay goes much further outside London and the South East.",
  },
  {
    question: "What is the take-home pay on £40,000 in Scotland?",
    answer:
      "Slightly different. Scotland sets its own income tax bands, with more bands and a higher top rate, so the Income Tax figure is not the same as in England, Wales and Northern Ireland. This calculator uses the England, Wales and Northern Ireland bands, so treat its result as an estimate if you pay Scottish income tax.",
  },
  {
    question: "Does the £40k take-home figure include pension contributions?",
    answer:
      "No. The figures on this page are Income Tax and National Insurance only. If you are in a workplace pension, your own contributions (often 5% of qualifying earnings under auto-enrolment) come off as well, and they usually reduce the tax you pay.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function FortyKAfterTaxPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          £40k After Tax UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On a £40,000 salary in 2026/27 you take home{" "}
          {gbp.format(at40k.netAnnual)} a year —{" "}
          {gbp.format(at40k.netMonthly)} a month — after{" "}
          {gbp.format(at40k.incomeTax)} of Income Tax and{" "}
          {gbp.format(at40k.employeeNationalInsurance)} of National
          Insurance. The calculator below starts at £40,000 and works for
          any salary: change the figure and the breakdown updates instantly.
        </p>
      </section>

      <TakeHomeCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The £40,000 breakdown, line by line
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Gross salary</td>
                <td className="px-4 py-2">{gbp.format(at40k.grossAnnual)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Personal Allowance (tax-free)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(at40k.personalAllowance)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Income Tax at 20% on {gbp.format(at40k.taxableIncome)}
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(at40k.incomeTax)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  National Insurance at 8% between{" "}
                  {gbp.format(EMPLOYEE_NI.primaryThresholdAnnual)} and{" "}
                  {gbp.format(EMPLOYEE_NI.upperEarningsLimitAnnual)}
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(at40k.employeeNationalInsurance)}
                </td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className="px-4 py-2">Take-home pay</td>
                <td className="px-4 py-2">
                  {gbp.format(at40k.netAnnual)} a year ·{" "}
                  {gbp.format(at40k.netMonthly)} a month ·{" "}
                  {gbp.format(at40k.netWeekly)} a week ·{" "}
                  {gbp.format(at40k.netDaily)} a day
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Nothing on a £40,000 salary reaches the 40% higher-rate band,
          which starts at{" "}
          {gbp.format(INCOME_TAX.personalAllowance + INCOME_TAX.basicRateBand)}{" "}
          of income with a full
          Personal Allowance — that is why every taxable pound is charged
          at 20% and every National Insurance pound at 8%.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay around £40,000
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Income Tax
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  National Insurance
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home / month
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparison.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 40000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className="px-4 py-2">{gbp.format(salary)}</td>
                  <td className="px-4 py-2">
                    {gbp.format(result.incomeTax)}
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.employeeNationalInsurance)}
                  </td>
                  <td className="px-4 py-2">{gbp.format(result.netAnnual)}</td>
                  <td className="px-4 py-2">
                    {gbp.format(result.netMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Notice how the jump from £50,000 to £60,000 keeps less of each
          extra pound: above {gbp.format(EMPLOYEE_NI.upperEarningsLimitAnnual)}{" "}
          the tax rate rises from 20% to 40%, while National Insurance
          falls from 8% to 2%, so £10,000 more gross brings roughly £5,800
          more take-home.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What else comes off a £40,000 salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The figures here are tax and National Insurance only. Two common
          deductions are not included. Workplace pension contributions —
          typically 5% of qualifying earnings from the employee under
          auto-enrolment — reduce take-home pay but also reduce the tax
          charged. Student loan repayments start once earnings pass your
          plan&apos;s threshold and take 9% of everything above it. If you
          employ staff, the cost on top of a £40,000 salary is covered by
          our{" "}
          <Link
            href="/employer-national-insurance-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            employer National Insurance calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rates used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Rate</th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Personal Allowance</td>
                <td className="px-4 py-2">
                  {gbp.format(INCOME_TAX.personalAllowance)} (reduced by £1
                  per £2 of income over{" "}
                  {gbp.format(INCOME_TAX.allowanceTaperThreshold)})
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Basic rate</td>
                <td className="px-4 py-2">
                  20% on the first {gbp.format(INCOME_TAX.basicRateBand)} of
                  taxable income
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Higher rate</td>
                <td className="px-4 py-2">
                  40% up to {gbp.format(INCOME_TAX.additionalRateThreshold)}{" "}
                  of income
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Additional rate</td>
                <td className="px-4 py-2">
                  45% on income over{" "}
                  {gbp.format(INCOME_TAX.additionalRateThreshold)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Employee National Insurance</td>
                <td className="px-4 py-2">
                  8% from {gbp.format(EMPLOYEE_NI.primaryThresholdAnnual)} to{" "}
                  {gbp.format(EMPLOYEE_NI.upperEarningsLimitAnnual)}, then 2%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {PAYE_RATES_LABEL} (England, Wales and Northern Ireland).
          Last verified: {RATES_LAST_VERIFIED}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div
              key={f.question}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {f.question}
              </h3>
              <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/pro-rata-salary-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Pro Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What a £40,000 role pays part-time — by hours or days per
              week, with pro-rata holiday entitlement.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/paternity-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Paternity Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory Paternity Pay for one or two weeks of leave, worked
              out from any salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
