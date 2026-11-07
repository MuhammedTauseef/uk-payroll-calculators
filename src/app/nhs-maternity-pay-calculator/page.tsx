import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import MaternityCalculator from "@/components/MaternityCalculator";
import { calculateMaternity } from "@/lib/maternity";
import {
  MATERNITY,
  PAYE_RATES_LABEL,
  RATES_LAST_VERIFIED,
  SMP,
} from "@/lib/rates";

export const metadata: Metadata = pageMetadata(
  "/nhs-maternity-pay-calculator",
  "NHS Maternity Pay Calculator — AfC & SMP",
  "NHS maternity pay calculator: 8 weeks at full pay, 18 weeks at half pay plus SMP, then 13 weeks of SMP — or SMP only at the 2026/27 rate of £194.32 a week.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const exampleSalary = 31200;
const exampleNhs = calculateMaternity({
  annualSalary: exampleSalary,
  scheme: "nhs",
});
const exampleSmp = calculateMaternity({
  annualSalary: exampleSalary,
  scheme: "smp",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Who qualifies for NHS occupational maternity pay?",
    answer:
      "Under Agenda for Change (Section 15), you qualify if you have at least 12 months' continuous NHS service by the 11th week before your expected week of childbirth, and you intend to return to work for the NHS afterwards. If you do not qualify — for example, because you have not been in the NHS long enough — you are still entitled to Statutory Maternity Pay if you meet the SMP conditions.",
  },
  {
    question: "How is NHS maternity pay worked out?",
    answer:
      "NHS occupational maternity pay runs in three stages over 39 paid weeks: eight weeks at full pay, then 18 weeks at half pay plus Statutory Maternity Pay (provided the total is not more than full pay), then 13 weeks at the SMP rate. The remaining 13 weeks of the 52-week maternity leave are unpaid.",
  },
  {
    question: "How much is Statutory Maternity Pay in 2026/27?",
    answer:
      "For the first six weeks, SMP is 90% of your average weekly earnings. For the remaining 33 weeks it is the lower of £194.32 a week or 90% of your average weekly earnings. That £194.32 flat rate applies from 5 April 2026.",
  },
  {
    question: "What if I do not qualify for SMP?",
    answer:
      "If your earnings are too low or you have not worked for your employer long enough, you may be able to claim Maternity Allowance instead. It pays a standard weekly rate for up to 39 weeks and is claimed through the Jobcentre Plus or online, rather than through your employer.",
  },
  {
    question: "Is maternity pay taxed?",
    answer:
      "Yes. Both NHS occupational maternity pay and SMP are treated like normal pay: Income Tax and National Insurance are deducted through payroll, and pension contributions may continue depending on your scheme and your choices.",
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

export default function NhsMaternityPayCalculatorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          NHS Maternity Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This NHS maternity pay calculator works out your maternity pay
          under Agenda for Change: eight weeks at full pay, 18 weeks at
          half pay plus Statutory Maternity Pay, then 13 weeks of SMP.
          Enter your salary to see each stage, the weekly amounts and the
          total for your leave — or switch to SMP only.
        </p>
      </section>

      <MaternityCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does NHS maternity pay work?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          NHS staff who qualify for occupational maternity pay get a
          three-stage package spread over the first 39 weeks of leave.
          Weeks 1 to 8 are paid at your full normal pay. Weeks 9 to 26 are
          paid at half pay plus Statutory Maternity Pay — and if half pay
          plus SMP would add up to more than full pay, it is capped at full
          pay. Weeks 27 to 39 are paid at the SMP rate only. The last 13
          weeks of the 52-week maternity leave are unpaid.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Underneath the occupational package sits SMP, which is why the
          SMP rate still matters to NHS staff: it forms part of the
          half-pay stage and the whole of the third stage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Who qualifies for NHS occupational maternity pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The Agenda for Change occupational scheme broadly requires 12
          months&apos; continuous NHS service by the 11th week before your
          expected week of childbirth, and that you intend to return to
          NHS work after your leave. Service can include time with
          previous NHS employers. If you have changed trusts, tell both HR
          departments early so the service record is joined up.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If you do not qualify for the occupational scheme, you will
          usually still get Statutory Maternity Pay. SMP requires 26 weeks
          of continuous employment with the same employer by the 15th week
          before the expected week of childbirth, and average weekly
          earnings of at least {gbp.format(MATERNITY.lowerEarningsLimitWeekly)}{" "}
          a week (the 2026/27 Lower Earnings Limit).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A worked example: a salary of {gbp.format(exampleSalary)}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On a salary of {gbp.format(exampleSalary)} a year —{" "}
          {gbp.format(exampleNhs.averageWeeklyEarnings)} a week — the NHS
          occupational scheme pays {gbp.format(exampleNhs.totalPay)} over
          the leave: {gbp.format(exampleNhs.stages[0].weeklyAmount)} a week
          for the first eight weeks, then{" "}
          {gbp.format(exampleNhs.stages[1].weeklyAmount)} a week for the
          half-pay-plus-SMP stage, then{" "}
          {gbp.format(exampleNhs.stages[2].weeklyAmount)} a week of SMP.
          Statutory Maternity Pay alone on the same salary would pay{" "}
          {gbp.format(exampleSmp.totalPay)} — so the occupational scheme is
          worth{" "}
          {gbp.format(exampleNhs.totalPay - exampleSmp.totalPay)} more.
          Try your own salary in the calculator above.
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
                <td className="px-4 py-2">
                  SMP — first 6 weeks
                </td>
                <td className="px-4 py-2">90% of average weekly earnings</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  SMP — weeks 7 to 39 (flat rate)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(SMP.weeklyRate)} per week, or 90% of earnings if
                  lower
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">SMP — total paid weeks</td>
                <td className="px-4 py-2">{MATERNITY.totalPaidWeeks} weeks</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Minimum earnings to qualify for SMP
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
            href="/paternity-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Paternity Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory Paternity Pay for one or two weeks, at the same
              £194.32 statutory rate.
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
              Statutory Sick Pay under the April 2026 rules, from the first
              day of sickness.
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
