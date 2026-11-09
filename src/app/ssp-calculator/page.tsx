import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SspCalculator from "@/components/SspCalculator";
import { SSP_GUIDES } from "@/components/GuideSections";
import {
  EMPLOYMENT_ALLOWANCE,
  RATES_LAST_VERIFIED,
  RATES_RULES_LABEL,
  REDUNDANCY,
  SMP,
  SSP,
} from "@/lib/rates";

export const metadata = pageMetadata(
  "/ssp-calculator",
  "SSP Calculator — Statutory Sick Pay Calculator",
  "Free SSP calculator: work out Statutory Sick Pay under the April 2026 rules — the lower of £123.25 a week or 80% of average weekly earnings, from day one.",
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Do waiting days still apply to SSP?",
    answer:
      "No. Under the April 2026 rules, Statutory Sick Pay is payable from the first full day of sickness. The old system of three unpaid waiting days no longer applies.",
  },
  {
    question: "Is there a lower earnings limit for SSP?",
    answer:
      "No. The April 2026 rules removed the lower earnings limit for Statutory Sick Pay, so an employee does not have to earn a minimum amount before SSP can be paid. The amount is still capped at the lower of £123.25 a week or 80% of average weekly earnings.",
  },
  {
    question: "How much SSP will I get per week?",
    answer:
      "The weekly amount is whichever is lower: the flat rate of £123.25, or 80% of your average weekly earnings. If you earn £500 a week, 80% is £400, so you get the flat rate of £123.25. If you earn £100 a week, 80% is £80, so you get £80.",
  },
  {
    question: "What if I am off sick again soon after returning to work?",
    answer:
      "Sickness spells separated by eight weeks or less are called linked periods. They are treated as one period, and the 28-week maximum applies across all of them together — which is why the calculator asks about linked previous sickness.",
  },
  {
    question: "Can my employer claim SSP back from HMRC?",
    answer:
      "No. Employers cannot reclaim SSP from HMRC. Statutory Sick Pay is a cost the employer must meet in full; there is no rebate or recovery scheme for it.",
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

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function SspCalculatorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          SSP Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this SSP calculator to work out Statutory Sick Pay under the
          April 2026 rules. Enter the employee&apos;s average weekly earnings
          and the qualifying days they normally work, and the calculator shows
          the weekly rate, the daily rate and the total payable from the first
          full day of sickness.
        </p>
      </section>

      <SspCalculator />

      <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What to do next
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Fit notes and self-certification
            </h3>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              For the first 7 days of sickness, an employee can self-certify
              — they simply tell the employer they are too sick to work, and
              no evidence is needed. For sickness lasting longer than 7 days
              (counting non-working days), the employer can ask for a fit
              note from a doctor or other healthcare professional. This is
              general guidance only, not legal advice.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              The SSP1 form
            </h3>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              When an employee&apos;s SSP is coming to an end — or they do
              not qualify for SSP at all — the employer must give them form
              SSP1. The employee uses the SSP1 to claim other support, such
              as Universal Credit or Employment and Support Allowance (ESA),
              so it should be handed over in good time before the SSP runs
              out, not after.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Keep SSP records
            </h3>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
              Keep a record of every sickness spell — the dates, the
              qualifying days paid and the SSP amounts — with your payroll
              records, and hold them for at least three years. HMRC can ask
              to see them, and the records are what prove the 28-week
              entitlement has been tracked correctly across linked spells.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is Statutory Sick Pay calculated?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The weekly amount is the lower of two figures: the flat statutory
          rate of {gbp.format(SSP.weeklyCap)} a week, or{" "}
          {SSP.aweFraction * 100}% of the employee&apos;s average weekly
          earnings. That weekly amount is then divided by the number of
          qualifying days in the employee&apos;s normal week to give a daily
          rate, and the daily rate is paid for each qualifying day the
          employee is absent. Nothing is held back at the start — payment runs
          from the first full day of sickness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When does SSP start, and how long can it be paid for?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          SSP starts on the first full day of sickness and can be paid for up
          to {SSP.maxWeeks} weeks in one period of incapacity for work. If an
          employee returns to work and goes off sick again within eight weeks,
          the two spells are linked: they count as one period, and the{" "}
          {SSP.maxWeeks}-week limit covers both spells together. Once the{" "}
          {SSP.maxWeeks} weeks are used up, no further SSP is payable until a
          new, unlinked period begins.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are qualifying days?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Qualifying days are the days of the week the employee normally
          works — for a standard Monday-to-Friday pattern, that is five
          qualifying days. SSP is only ever paid for qualifying days: a
          weekend day in the middle of a sickness spell does not count for a
          Monday-to-Friday employee, because it is not a day they would
          normally have worked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Can employers reclaim SSP from HMRC?
        </h2>
        <p className="max-w-2xl rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 px-4 py-3 text-base font-medium leading-relaxed text-brand-900 dark:text-brand-100">
          Employers cannot reclaim SSP from HMRC.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Statutory Sick Pay is paid by the employer through the normal
          payroll, in the same way as ordinary wages, and the full cost sits
          with the employer. There is no scheme that pays any of it back, so
          the figures from this calculator are the amounts the employer both
          pays the employee and bears as a cost.
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
                <td className="px-4 py-2">SSP flat weekly rate</td>
                <td className="px-4 py-2">{gbp.format(SSP.weeklyCap)} per week</td>
              </tr>
              <tr>
                <td className="px-4 py-2">SSP alternative weekly amount</td>
                <td className="px-4 py-2">
                  {SSP.aweFraction * 100}% of average weekly earnings
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">SSP maximum entitlement</td>
                <td className="px-4 py-2">{SSP.maxWeeks} weeks</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Statutory Maternity Pay (flat weekly rate)
                </td>
                <td className="px-4 py-2">{gbp.format(SMP.weeklyRate)} per week</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Redundancy pay — weekly pay cap</td>
                <td className="px-4 py-2">{gbp.format(REDUNDANCY.weeklyPayCap)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Redundancy pay — maximum total</td>
                <td className="px-4 py-2">
                  {gbp.format(REDUNDANCY.maxStatutoryPay)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Employment Allowance</td>
                <td className="px-4 py-2">
                  {gbp.format(EMPLOYMENT_ALLOWANCE.annualAmount)} per year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {RATES_RULES_LABEL}. Last verified: {RATES_LAST_VERIFIED}.
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Guides and answers about SSP
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SSP_GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {g.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {g.description}
              </p>
              <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/annual-leave-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Annual Leave Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Holiday entitlement keeps building up while an employee is
              off sick — work out the statutory annual leave in days and
              hours: 5.6 weeks a year, part-time pro-rata, part-year
              starters and the 12.07% accrual for irregular hours.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/pro-rata-salary-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Pro Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Part-time pay from the full-time salary, by hours or days
              per week: pro-rata annual, monthly and weekly pay, and the
              FTE fraction.
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
