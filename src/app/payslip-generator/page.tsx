import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PayslipGenerator from "@/components/PayslipGenerator";
import { calculatePayslip } from "@/lib/payslip";
import { calculateTakeHome } from "@/lib/takehome";
import {
  EMPLOYEE_NI,
  INCOME_TAX,
  PAYE_RATES_LABEL,
  RATES_LAST_VERIFIED,
} from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/payslip-generator",
  "Payslip Generator — Free UK Payslip",
  "Free UK payslip generator: add employer, employee, gross pay and tax code to build a payslip with tax, National Insurance and net pay. Print or save as PDF.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const example = calculatePayslip({
  employerName: "Example Company Ltd",
  employeeName: "Worked example",
  frequency: "monthly",
  grossPerPeriod: 2500,
  taxCode: "1257L",
});
const exampleAnnual = calculateTakeHome({ annualSalary: 30000 });

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What must a UK payslip show by law?",
    answer:
      "Under section 8 of the Employment Rights Act 1996, an itemised pay statement must show: the gross amount of pay; the amount and purpose of each variable deduction (such as Income Tax and National Insurance); the total of any fixed deductions; the net amount payable; and, where the net is paid in parts, the amount and date of each part payment. Since April 2019 it must also show the number of hours worked where pay varies with time worked.",
  },
  {
    question: "Do employers legally have to give a payslip?",
    answer:
      "Yes. Every employee and every worker — including agency and zero-hours workers — is entitled to a payslip on or before the day they are paid. It can be paper or electronic. A small number of employments are excluded (for example the armed forces and merchant seamen), but for ordinary employment there is no opt-out: if you are paid, you get a payslip.",
  },
  {
    question: "What does tax code 1257L mean?",
    answer:
      "The numbers in a tax code are your tax-free Personal Allowance in tens of pounds: 1257 means £12,570 a year you can earn before Income Tax starts. The letter shows why you get that allowance — L means you are entitled to the standard Personal Allowance. Other common codes: BR taxes everything at 20%, D0 at 40%, 0T gives no allowance, NT deducts no tax, and a K code adds an amount to your taxable pay instead of giving an allowance.",
  },
  {
    question: "Is this payslip generator free, and what happens to my data?",
    answer:
      "It is completely free, with no sign-up. The calculation runs entirely in your browser: the names, pay and tax code you type are never sent to a server, stored or tracked. Close the tab and everything is gone. If you want to keep the payslip, use the Print / Save as PDF button.",
  },
  {
    question: "Can I use a generated payslip as proof of income?",
    answer:
      "No. This generator produces an estimate from the figures you enter, for checking your pay, testing a tax code or preparing your own records. A lender, landlord or agency will ask for the payslip issued by your employer's payroll, because that is the document backed by the employer's HMRC reporting. Never present a self-made payslip as if an employer had issued it.",
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

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Payslip Generator",
  url: `${AppConfig.siteUrl}/payslip-generator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

export default function PayslipGeneratorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Payslip Generator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Create a UK payslip in under a minute. Enter the employer and
          employee names, the gross pay for the month or week and the tax
          code, and this free generator works out the Income Tax, employee
          National Insurance and net pay on a clean payslip you can print
          or save as a PDF.
        </p>
      </section>

      <PayslipGenerator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this payslip generator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Four steps. First, type the employer&apos;s name and the
          employee&apos;s name exactly as they should appear on the
          payslip. Second, choose monthly or weekly pay and enter the gross
          pay for one period — before tax, not the amount that lands in
          the bank. Third, enter the tax code from the employee&apos;s
          latest payslip or HMRC notice (1257L is the standard code for
          2026/27 — if you are not sure what a code means, our{" "}
          <Link
            href="/hmrc-tax-code-checker"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            tax code checker
          </Link>{" "}
          decodes it). Fourth, check the payslip, then use the Print / Save as
          PDF button to keep a copy. Nothing leaves your browser at any
          point.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: {gbp.format(2500)} a month on code 1257L
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Gross pay (one month)</td>
                <td className="px-4 py-2">{gbp.format(example.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Gross pay for the year ({gbp.format(2500)} × 12)
                </td>
                <td className="px-4 py-2">{gbp.format(example.grossAnnual)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Income Tax — {gbp.format(exampleAnnual.taxableIncome)} of
                  taxable pay at 20%, for the year
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(example.incomeTaxAnnual)} (
                  {gbp.format(example.incomeTaxPerPeriod)} a month)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employee National Insurance — 8% of the same slice, for
                  the year
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(example.employeeNiAnnual)} (
                  {gbp.format(example.employeeNiPerPeriod)} a month)
                </td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className="px-4 py-2">Net pay</td>
                <td className="px-4 py-2">
                  {gbp.format(example.netPerPeriod)} a month ·{" "}
                  {gbp.format(example.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The first {gbp.format(INCOME_TAX.personalAllowance)} of the{" "}
          {gbp.format(30000)} salary is covered by the Personal Allowance
          in code 1257L, so only{" "}
          {gbp.format(exampleAnnual.taxableIncome)} is taxed — and it all
          falls inside the 20% basic-rate band and the 8% National
          Insurance band, which is why both deductions are a flat share of
          the same slice. The same salary run through our{" "}
          <Link
            href="/40k-after-tax-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            take-home pay calculator
          </Link>{" "}
          gives exactly the same answer, and the{" "}
          <Link
            href="/blog/take-home-pay"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            take-home pay guide
          </Link>{" "}
          explains the bands behind it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What a UK payslip must show
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A payslip is not just a courtesy — it is a legal document.
          Section 8 of the Employment Rights Act 1996 gives every employee
          and worker the right to an itemised pay statement on or before
          payday, showing:
        </p>
        <ul className="max-w-2xl list-disc space-y-1 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>the gross amount of wages or salary;</li>
          <li>
            the amount and purpose of each variable deduction — Income Tax
            and National Insurance in the usual case;
          </li>
          <li>
            the total of any fixed deductions (an employer may describe
            these once in a separate standing statement, updated at least
            yearly);
          </li>
          <li>the net amount payable;</li>
          <li>
            where the net is paid in more than one part, the amount and
            date of each part payment;
          </li>
          <li>
            since April 2019, the number of hours worked, where pay varies
            according to the time worked.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This generator covers the standard tax and National Insurance
          lines. If a real payslip also carries pension contributions, a
          student loan repayment, an attachment of earnings or a salary
          sacrifice, those lines belong on it too — add them up separately,
          because they are not part of this estimate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How accurate is a generated payslip?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          For a steady salary on the standard code, the figures here match
          payroll exactly, because they use the same 2026/27 rates as our
          take-home calculator. Two honest limits. First, real PAYE is
          cumulative: the tax on an actual March payslip depends on
          everything earned since April, so a month with a bonus, a pay
          rise or a mid-year start will not match a single-period estimate.
          Second, this generator shows Income Tax and employee National
          Insurance only — not pension contributions, student loan
          repayments or any other deduction. If you are the employer, the
          cost sitting on top of the payslip is covered by our{" "}
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
          Rates used by this generator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
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
                <td className="px-4 py-2">Personal Allowance (code 1257L)</td>
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

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The same tax and National Insurance maths from the other
              direction: enter an annual salary and see the take-home pay
              per year, month and week.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/hmrc-tax-code-checker"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Tax Code Checker
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Every payslip carries a tax code — check what yours means:
              the allowance it gives you, what each letter stands for, and
              what it costs against the standard 1257L.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the checker →
            </span>
          </Link>
          <Link
            href="/employer-national-insurance-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer National Insurance Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Issuing the payslip costs more than the salary on it: work
              out employer Class 1 NICs and the total cost of employing
              someone in 2026/27.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/overtime-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Overtime Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The extra hours on the payslip: overtime pay at the rate
              in your contract — flat, time and a quarter, time and a
              half or double time — with a National Minimum Wage check
              on the average over all hours worked.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/ir35-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              IR35 Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Contractors are paid differently inside IR35: check
              whether a contract is inside or outside the off-payroll
              rules, and compare the take-home pay either way on the
              day rate.
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
