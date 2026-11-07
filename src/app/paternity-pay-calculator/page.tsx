import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PaternityCalculator from "@/components/PaternityCalculator";
import { calculatePaternity } from "@/lib/paternity";
import {
  MATERNITY,
  PAYE_RATES_LABEL,
  RATES_LAST_VERIFIED,
  SPP,
} from "@/lib/rates";

export const metadata: Metadata = pageMetadata(
  "/paternity-pay-calculator",
  "Paternity Pay Calculator — Statutory Pay",
  "Work out Statutory Paternity Pay for one or two weeks of leave at the 2026/27 rate: the lower of £194.32 a week or 90% of average weekly earnings.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const exampleSalary = 31200;
const example = calculatePaternity({ annualSalary: exampleSalary, weeks: 2 });

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Statutory Paternity Pay in 2026/27?",
    answer:
      "Statutory Paternity Pay is the lower of £194.32 a week or 90% of your average weekly earnings. On a salary of £31,200 a year (£600 a week), 90% of earnings is £540, so you get the flat rate of £194.32 a week — £388.64 for the full two weeks.",
  },
  {
    question: "Who qualifies for Statutory Paternity Pay?",
    answer:
      "You must have worked for the same employer continuously for at least 26 weeks by the 15th week before the baby is due, still be employed by them when the baby is born, and earn at least £129 a week on average (the 2026/27 Lower Earnings Limit). You also need to be the baby's father, the mother's partner, or an intended parent in a surrogacy or adoption arrangement.",
  },
  {
    question: "Can I take my two weeks of paternity leave separately?",
    answer:
      "Yes. Since April 2024 you can take the two weeks as one block of two, or as two separate blocks of one week each, at any point in the first year after the birth or adoption placement. You generally need to give 28 days' notice for each period of leave.",
  },
  {
    question: "Does my employer have to pay full pay during paternity leave?",
    answer:
      "No — the legal minimum is Statutory Paternity Pay. Many employers offer more under their own paternity or family-leave policies, sometimes full pay for part or all of the leave. Check your contract or staff handbook, because occupational pay is common in larger organisations.",
  },
  {
    question: "Can employers claim SPP back from HMRC?",
    answer:
      "Yes, unlike Statutory Sick Pay. Employers recover Statutory Paternity Pay through their payroll: 92% of what they pay, or 109% if their total Class 1 National Insurance bill for the previous tax year was £45,000 or less.",
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

export default function PaternityPayCalculatorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Paternity Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this paternity pay calculator to work out Statutory Paternity
          Pay for one or two weeks of leave. SPP pays the lower of{" "}
          {gbp.format(SPP.weeklyRate)} a week or 90% of average weekly
          earnings. Enter your salary, choose how many weeks you are
          taking, and see the weekly amount and the total straight away.
        </p>
      </section>

      <PaternityCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does Statutory Paternity Pay work?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Statutory Paternity Pay is paid by the employer through the
          normal payroll for up to two weeks of paternity leave. The
          weekly amount is whichever is lower: the flat statutory rate of{" "}
          {gbp.format(SPP.weeklyRate)}, or 90% of the employee&apos;s
          average weekly earnings. Most full-time employees earn enough
          that the flat rate applies; the 90% rule mainly affects lower
          earners, whose SPP is 90% of what they usually take home in a
          week.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On a salary of {gbp.format(exampleSalary)} a year, average
          weekly earnings are {gbp.format(example.averageWeeklyEarnings)},
          so SPP is the flat rate of {gbp.format(example.weeklyAmount)} a
          week — {gbp.format(example.totalPay)} for the full two weeks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Who qualifies for paternity pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          To get Statutory Paternity Pay you need 26 weeks of continuous
          employment with the same employer by the 15th week before the
          expected week of childbirth, you must still be employed by them
          when the baby is born, and your average weekly earnings must be
          at least {gbp.format(MATERNITY.lowerEarningsLimitWeekly)} a week
          — the 2026/27 Lower Earnings Limit. Similar rules apply for
          adoption and surrogacy, measured against the matching week
          instead of the due date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Taking the two weeks separately
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The rules changed in April 2024. Fathers and partners no longer
          have to take their two weeks together, or in the first weeks
          after the birth: the leave can be split into two separate
          one-week blocks and taken at any point in the first year. That
          makes it easier to save a week for later — for example, for when
          the mother returns to work. Notice of 28 days is generally
          needed for each block.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A note for employers
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Employers pay SPP through payroll but can recover most of it
          from HMRC: 92% of the SPP paid, rising to 109% if the
          employer&apos;s total Class 1 National Insurance for the
          previous tax year was £45,000 or less. Any occupational top-up
          above SPP is the employer&apos;s own cost. If you are working
          out the full cost of employing someone, our{" "}
          <Link
            href="/employer-national-insurance-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            employer National Insurance calculator
          </Link>{" "}
          shows the NICs on top of salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Statutory rates used by this calculator
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
                <td className="px-4 py-2">SPP flat weekly rate</td>
                <td className="px-4 py-2">
                  {gbp.format(SPP.weeklyRate)} per week
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">SPP earnings-related amount</td>
                <td className="px-4 py-2">
                  {SPP.aweFraction * 100}% of average weekly earnings, if
                  lower
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Maximum SPP</td>
                <td className="px-4 py-2">{SPP.maxWeeks} weeks</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Minimum earnings to qualify
                </td>
                <td className="px-4 py-2">
                  {gbp.format(MATERNITY.lowerEarningsLimitWeekly)} per week
                  (Lower Earnings Limit)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {PAYE_RATES_LABEL}. Last verified: {RATES_LAST_VERIFIED}.
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
            href="/nhs-maternity-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              NHS Maternity Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Maternity pay under Agenda for Change, or Statutory Maternity
              Pay only — stage by stage.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              £40k After Tax UK
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Take-home pay on a £40,000 salary after Income Tax and
              National Insurance — and a calculator for any salary.
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
