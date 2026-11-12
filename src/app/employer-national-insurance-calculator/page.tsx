import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import EmployerNiCalculator from "@/components/EmployerNiCalculator";
import {
  EMPLOYER_NI,
  EMPLOYER_NI_RATES_LABEL,
  EMPLOYER_NI_RATES_VERIFIED,
  EMPLOYMENT_ALLOWANCE,
} from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";

export const metadata = pageMetadata(
  "/employer-national-insurance-calculator",
  "Employer National Insurance Calculator",
  "Free employer National Insurance calculator: employer Class 1 NICs at 15% above the £5,000 Secondary Threshold, with the Employment Allowance and total cost.",
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much employer National Insurance do I pay on a £30,000 salary?",
    answer:
      "On a £30,000 salary the NICs are charged on the £25,000 above the £5,000 Secondary Threshold: £25,000 × 15% = £3,750 a year, which is £312.50 a month. If you claim the Employment Allowance, your bill is reduced by up to £10,500 across all your employees, so a single £30,000 employee's NICs would be fully covered by the allowance.",
  },
  {
    question: "What is the Secondary Threshold?",
    answer:
      "The Secondary Threshold is the level of earnings above which an employer starts paying Class 1 National Insurance on an employee's pay. For 2026/27 it is £5,000 a year (£417 a month). Earnings at or below it attract no employer NICs; the 15% rate applies only to the part of the salary above the threshold, not to the whole salary.",
  },
  {
    question: "Can a company whose only employee is a director claim the Employment Allowance?",
    answer:
      "No. A company where the sole employee is also a director cannot claim the Employment Allowance — the rule exists to stop the allowance being used purely to reduce the NICs on a director's own salary. Companies with at least one other employee on the payroll can generally claim.",
  },
  {
    question: "Is employer National Insurance the same as employee National Insurance?",
    answer:
      "No — they are two separate charges on the same pay. The employee pays primary Class 1 contributions, deducted from their wages; the employer pays secondary Class 1 contributions on top of the wages, which is an extra cost of employing someone and never comes out of the employee's pay. This calculator covers only the employer's contributions.",
  },
  {
    question: "When do employer NI rates change?",
    answer:
      "Employer National Insurance rates and thresholds are set by the government and normally change at the start of a tax year in April — most recently in April 2025, when the rate rose to 15% and the Secondary Threshold fell to £5,000 a year; those figures stayed the same for 2026/27. Always check the current figures on GOV.UK before running payroll, because a Budget can change them with effect from the next April.",
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
  name: "Employer National Insurance Calculator",
  url: `${AppConfig.siteUrl}/employer-national-insurance-calculator`,
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

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const RATES_TABLE: { item: string; amount: string }[] = [
  {
    item: "Employer Class 1 rate (main rate)",
    amount: `${EMPLOYER_NI.rate * 100}% of earnings above the threshold`,
  },
  {
    item: "Secondary Threshold",
    amount: `${gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)} per year (about £417 per month)`,
  },
  {
    item: "Under-21 / apprentice-under-25 rate",
    amount: `0% on earnings up to ${gbp.format(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)} per year`,
  },
  {
    item: "Upper secondary threshold (under 21s, apprentices under 25)",
    amount: `${gbp.format(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)} per year — the main rate applies above it`,
  },
  {
    item: "Employment Allowance",
    amount: `${gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} per year off the employer NIC bill`,
  },
];

export default function EmployerNationalInsuranceCalculatorPage() {
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
          Employer National Insurance Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this employer National Insurance calculator to work out the
          employer&apos;s Class 1 National Insurance cost of an
          employee&apos;s salary. Enter the annual gross salary, and the
          calculator shows the employer NICs per year and per month, and the
          total cost of employing that person, before and after the
          Employment Allowance.
        </p>
      </section>

      <EmployerNiCalculator />

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Paying staff every month?{" "}
        <a
          href="https://go.zoho.com/tjEU"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          Zoho Payroll
        </a>{" "}
        runs the calculation, payslips and filings in one place.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is employer National Insurance calculated?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Employer (secondary) Class 1 National Insurance is charged at{" "}
          {EMPLOYER_NI.rate * 100}% on the part of an employee&apos;s pay
          above the Secondary Threshold of{" "}
          {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)} a year — the
          first {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)} of
          earnings attracts no employer NICs at all. So on a{" "}
          {gbp.format(30000)} salary the charge is ({gbp.format(30000)} −{" "}
          {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)}) ×{" "}
          {EMPLOYER_NI.rate * 100}% = {gbp.format(25000)} ×{" "}
          {EMPLOYER_NI.rate * 100}% = {gbp.format(3750)} a year. The charge
          is the employer&apos;s cost, on top of the salary — it is never
          deducted from the employee&apos;s pay.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the employer NI rates for 2026/27?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Employer NI rates are set for each tax year, and the figures in
          the table below are the 2026/27 rates this calculator uses —
          verified against GOV.UK on 7 November 2026. They were set by the
          April 2025 change, when the main rate rose to{" "}
          {EMPLOYER_NI.rate * 100}% and the Secondary Threshold fell to{" "}
          {gbp.format(EMPLOYER_NI.secondaryThresholdAnnual)} a year, and
          they continue unchanged for 2026/27. Always check GOV.UK&apos;s
          employer National Insurance rates page before running payroll,
          because a Budget can change them from the next April.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate or threshold
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Amount (2026/27)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RATES_TABLE.map((row) => (
                <tr key={row.item}>
                  <td className="px-4 py-2">{row.item}</td>
                  <td className="px-4 py-2">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {EMPLOYER_NI_RATES_LABEL}. Figures verified:{" "}
          {EMPLOYER_NI_RATES_VERIFIED}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the Employment Allowance?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The Employment Allowance reduces an employer&apos;s National
          Insurance bill by up to{" "}
          {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} a year. It is
          claimed through payroll and applied against the employer&apos;s
          total Class 1 NICs until the{" "}
          {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} is used up — it
          can reduce the bill to zero, but never below it. Most employers
          can claim it. The main exclusion is a company whose only employee
          is a director, which cannot claim. In this calculator, ticking the
          allowance shows its effect on one employee: their NICs are
          covered until the allowance runs out.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Do employers pay National Insurance for under-21s and apprentices?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Not on most of their pay. For employees under 21, and for
          apprentices under 25, the employer rate is 0% on earnings up to
          the upper secondary threshold of{" "}
          {gbp.format(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)} a year.
          Only earnings above that level attract the main{" "}
          {EMPLOYER_NI.rate * 100}% rate — so on a {gbp.format(60000)}{" "}
          salary for an under-21 employee, the charge is ({gbp.format(60000)}{" "}
          − {gbp.format(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)}) ×{" "}
          {EMPLOYER_NI.rate * 100}% = {gbp.format(1459.5)} a year, compared
          with {gbp.format(8250)} for a standard employee at the same
          salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the total cost of employing someone?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          More than the salary. The minimum true cost is the gross salary
          plus the employer&apos;s National Insurance on top — a{" "}
          {gbp.format(30000)} salary costs {gbp.format(33750)} once the{" "}
          {gbp.format(3750)} of employer NICs is added (before any
          Employment Allowance). On top of that, most employers must also
          contribute at least 3% of qualifying earnings to a workplace
          pension under auto-enrolment, and there may be further costs such
          as apprenticeship levy, insurance and equipment. This calculator
          covers the salary plus employer NICs — the two figures every
          employer faces on every hire — and you can switch on the pension
          option to add the auto-enrolment employer minimum on top.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.question} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
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
            href="/payslip-generator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Generator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The employee&apos;s side of the same payroll run: build a
              payslip showing the employee&apos;s Income Tax and National
              Insurance on any gross pay, ready to print.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the generator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What the employee actually keeps: take-home pay on any salary
              after Income Tax and employee National Insurance, per year,
              month and week.
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
