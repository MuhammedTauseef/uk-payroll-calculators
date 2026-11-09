import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import ProRataCalculator from "@/components/ProRataCalculator";
import { STATUTORY_HOLIDAY_WEEKS } from "@/lib/prorata";
import { RATES_RULES_LABEL } from "@/lib/rates";

export const metadata = pageMetadata(
  "/pro-rata-salary-calculator",
  "Pro Rata Salary Calculator — Part-Time Pay & FTE",
  "Free pro rata salary calculator: part-time pay from the full-time salary by hours or days per week, the FTE fraction, and pro-rata holiday entitlement.",
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What does pro rata mean?",
    answer:
      "Pro rata is Latin for 'in proportion'. A pro-rata salary is the full-time salary scaled by the fraction of full-time hours or days actually worked — work 60% of the full-time pattern and the pro-rata salary is 60% of the full-time salary. The same proportional principle applies to holiday, bonuses and most other benefits.",
  },
  {
    question: "How do I work out pro-rata pay for 3 days a week?",
    answer:
      "Divide the days worked by the full-time days, then multiply the full-time salary by that fraction. Three days out of five is 3 ÷ 5 = 0.6, so a £40,000 full-time salary becomes £40,000 × 0.6 = £24,000 a year, or £2,000 a month. In FTE terms that is a 0.6 FTE role.",
  },
  {
    question: "How is pro-rata holiday entitlement worked out?",
    answer:
      "The statutory minimum is 5.6 weeks of paid holiday a year. For a part-time worker you express those 5.6 weeks in their own working days: someone working 3 days a week gets 5.6 × 3 = 16.8 days a year. It is the same 5.6 weeks a full-time worker gets — just counted in smaller weeks. Bank holidays normally come out of this total.",
  },
  {
    question: "Are bonuses and pension contributions pro-rated too?",
    answer:
      "Usually, yes. Under the Part-time Workers (Prevention of Less Favourable Treatment) Regulations 2000, a part-time worker must not be treated less favourably than a comparable full-time worker unless the difference is objectively justified — so pay, holiday, bonuses and pension access are normally all scaled by the same pro-rata fraction.",
  },
  {
    question: "What is the difference between FTE and pro-rata salary?",
    answer:
      "FTE (full-time equivalent) is the fraction itself — 0.6 FTE means 60% of a full-time role. The pro-rata salary is what you get when you apply that fraction to the full-time salary. Job adverts often quote either the full-time salary with the FTE fraction, or the actual pro-rata salary, so it is worth checking which figure you are looking at.",
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

const RULES_TABLE: { item: string; rule: string }[] = [
  {
    item: "FTE fraction",
    rule: "Part-time hours (or days) ÷ full-time hours (or days), capped at 1.0",
  },
  {
    item: "Pro-rata annual salary",
    rule: "Full-time annual salary × FTE fraction",
  },
  { item: "Monthly pay", rule: "Pro-rata annual salary ÷ 12" },
  { item: "Weekly pay", rule: "Pro-rata annual salary ÷ 52" },
  {
    item: "Statutory holiday",
    rule: `${STATUTORY_HOLIDAY_WEEKS} weeks × days worked per week, in days`,
  },
];

export default function ProRataSalaryCalculatorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Pro Rata Salary Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this pro-rata salary calculator to work out what a part-time
          role pays compared with the full-time salary. Enter the full-time
          salary and the part-time hours or days, and the calculator shows
          the pro-rata annual, monthly and weekly pay, the FTE fraction and
          the holiday entitlement in days.
        </p>
      </section>

      <ProRataCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is a pro-rata salary calculated?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          In three steps. First, work out the fraction of full-time work:
          part-time hours divided by full-time hours (or part-time days
          divided by full-time days). Second, multiply the full-time salary
          by that fraction to get the pro-rata annual salary. Third, divide
          by 12 for monthly pay or by 52 for weekly pay. For example, a{" "}
          {gbp.format(40000)} full-time salary at 22.5 hours against a
          37.5-hour full-time week is {gbp.format(40000)} × (22.5 ÷ 37.5) ={" "}
          {gbp.format(40000)} × 0.6 = {gbp.format(24000)} a year —{" "}
          {gbp.format(2000)} a month.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does FTE mean?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          FTE stands for full-time equivalent. It expresses a part-time role
          as a fraction of one full-time role: 1.0 FTE is a full-time job,
          0.6 FTE is 60% of one, and 0.5 FTE is half. Employers use it in job
          adverts (where the salary quoted may be the full-time figure, not
          the amount actually paid) and in workforce planning, where several
          part-time roles can be added together — two 0.5 FTE posts equal
          one full-time post.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much holiday does a part-time worker get?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The statutory minimum paid holiday is {STATUTORY_HOLIDAY_WEEKS}{" "}
          weeks a year for every worker, full-time or part-time. For a
          part-time worker the weeks are simply smaller: at 3 days a week
          the entitlement is {STATUTORY_HOLIDAY_WEEKS} × 3 = 16.8 days, and
          at 4 days a week it is {STATUTORY_HOLIDAY_WEEKS} × 4 = 22.4 days.
          Bank holidays are usually counted within this total — if the
          workplace closes on a bank holiday that falls on a working day,
          that day comes out of the entitlement. Some employers give more
          than the statutory minimum; the contract says.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Can a part-time worker be paid a lower hourly rate?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Not just for being part-time. The Part-time Workers (Prevention of
          Less Favourable Treatment) Regulations 2000 say a part-time worker
          must not be treated less favourably than a comparable full-time
          worker unless the employer can objectively justify it. In practice
          that means the same hourly rate and the same benefits, scaled by
          the pro-rata fraction — which is exactly the calculation this page
          performs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rules used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  How it is worked out
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RULES_TABLE.map((row) => (
                <tr key={row.item}>
                  <td className="px-4 py-2">{row.item}</td>
                  <td className="px-4 py-2">{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The {STATUTORY_HOLIDAY_WEEKS}-week holiday minimum comes from the
          Working Time Regulations 1998. Figures on this site follow the{" "}
          {RATES_RULES_LABEL.charAt(0).toLowerCase() +
            RATES_RULES_LABEL.slice(1)}
          .
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
            href="/annual-leave-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Annual Leave Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The holiday figure in full: statutory annual leave for
              regular and irregular hours — 5.6 weeks in your own working
              days, part-year starters, the 12.07% accrual, and what is
              left after the leave already taken.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/ssp-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              SSP Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory Sick Pay under the April 2026 rules: the weekly
              rate, the daily rate and the total payable from the first
              full day of sickness.
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
              Worked extra hours on top of the contracted ones?
              Overtime pay at the contract rate — flat, time and a
              quarter, time and a half or double time — worked out from
              the salary-derived hourly rate, with a minimum wage check
              on the average.
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
