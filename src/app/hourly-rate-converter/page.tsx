import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import HourlyRateConverter from "@/components/HourlyRateConverter";
import { convertHourlyRate } from "@/lib/hourly";
import { NMW_BANDS } from "@/lib/overtime";

import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/hourly-rate-converter",
  "Hourly Rate Converter UK — Hourly Pay to Salary",
  "Free UK hourly rate converter: turn an hourly rate into a weekly, monthly and annual salary, or a salary back into an hourly rate — with a minimum wage comparison.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtRate(n: number): string {
  const r = Math.round((n + Number.EPSILON) * 10000) / 10000;
  return `£${r.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

// Worked example figures — computed by the same conversion function
// the tool above runs, so the page can never disagree with itself.
const exHourly = convertHourlyRate({
  direction: "hourlyToSalary",
  hourlyRate: 15,
  annualSalary: 0,
  hoursPerWeek: 37.5,
  ageBand: "over21",
});

const exSalary = convertHourlyRate({
  direction: "salaryToHourly",
  hourlyRate: 0,
  annualSalary: 30000,
  hoursPerWeek: 37.5,
  ageBand: "over21",
});

// A salary that looks respectable until the hours are counted:
// £24,000 over a 40-hour week.
const exLowSalary = convertHourlyRate({
  direction: "salaryToHourly",
  hourlyRate: 0,
  annualSalary: 24000,
  hoursPerWeek: 40,
  ageBand: "over21",
});

// Common hourly rates on a 37.5-hour week, converted by the tool's
// own maths for the table below.
const RATE_ROWS = [12.71, 13, 14, 15, 16, 18, 20, 25].map((rate) => ({
  rate,
  result: convertHourlyRate({
    direction: "hourlyToSalary",
    hourlyRate: rate,
    annualSalary: 0,
    hoursPerWeek: 37.5,
    ageBand: "over21",
  }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I convert an hourly rate to an annual salary?",
    answer: `Multiply the hourly rate by your hours per week, then by 52 weeks. At £15 an hour on a 37.5-hour week that is £15 × 37.5 = ${fmtMoney(exHourly.weeklyPay)} a week, and ${fmtMoney(exHourly.weeklyPay)} × 52 = ${fmtMoney(exHourly.annualSalary)} a year, or ${fmtMoney(exHourly.monthlyPay)} a month. The hours matter as much as the rate: the same £15 an hour on a 40-hour week is £31,200 a year.`,
  },
  {
    question: "How do I work out my hourly rate from my salary?",
    answer: `Divide the salary by 52 weeks, then by your contracted hours per week. A £30,000 salary on a 37.5-hour week is £30,000 ÷ 52 ÷ 37.5 = ${fmtRate(exSalary.hourlyRate)} an hour. This is the rate that counts for comparing job offers fairly — and the rate the minimum wage floor is tested against if you work unpaid extra hours.`,
  },
  {
    question: "Why does this converter use 52 weeks in a year?",
    answer:
      "A year has 52 full weeks (plus one or two days), and UK payroll works in weekly and monthly periods built on that. Some converters use 52.14 weeks or count 260 working days, which gives a slightly different answer. This hub uses 52 in every tool — the overtime, pro-rata and take-home calculators included — so the figures agree with each other whichever one you use.",
  },
  {
    question: "What does the National Minimum Wage work out to per year?",
    answer: `At the April 2026 rate of £12.71 an hour for workers aged 21 and over, a 37.5-hour week pays ${fmtMoney(RATE_ROWS[0].result.annualSalary)} a year, and a 40-hour week pays £26,436.80 — before tax. A job advertised as a salary can hide a rate below the floor: £24,000 over a 40-hour week is ${fmtRate(exLowSalary.hourlyRate)} an hour, which is below the legal minimum for this age band.`,
  },
  {
    question: "Is the converted salary before or after tax?",
    answer:
      "Before tax. Every figure here is gross pay — Income Tax and National Insurance still come off in payroll, so your take-home pay will be lower than the salary shown. To see the after-tax figure for a salary, run it through the take-home pay calculator, which applies the current tax and National Insurance rules.",
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
  name: "Hourly Rate Converter",
  url: `${AppConfig.siteUrl}/hourly-rate-converter`,
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

export default function HourlyRateConverterPage() {
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
          Hourly Rate Converter
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Convert an hourly rate into a weekly, monthly and annual
          salary — or turn a salary back into the hourly rate it really
          pays — using your hours per week. Every figure is gross pay,
          before tax, and each result is checked against the National
          Minimum Wage for your age band. Free, nothing to sign up for.
        </p>
      </section>

      <HourlyRateConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this hourly rate converter
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This converter is part of UK Payroll Calculators, a free hub
          of UK payroll calculators built on the April 2026 rules — no
          sign-up, no accounts, and every figure worked out in your
          browser. Pick a direction, enter the hourly rate or the
          salary and the hours per week it covers, and the tool shows
          the weekly, monthly and annual figures side by side. It then
          compares the hourly rate with the National Minimum Wage for
          your age band — because a salary only means something once
          you know the rate it works out to over the hours actually
          worked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you convert an hourly rate into a salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Hourly rate × hours per week × 52 weeks. At £15 an hour on a
          37.5-hour week: £15 × 37.5 = {fmtMoney(exHourly.weeklyPay)}{" "}
          a week, {fmtMoney(exHourly.weeklyPay)} × 52 ={" "}
          {fmtMoney(exHourly.annualSalary)} a year, and{" "}
          {fmtMoney(exHourly.annualSalary)} ÷ 12 ={" "}
          {fmtMoney(exHourly.monthlyPay)} a month. The table shows the
          same conversion for the rates readers ask about most, all on
          a 37.5-hour week:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Hourly rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per week
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per month
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RATE_ROWS.map((row) => (
                <tr key={row.rate}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {fmtRate(row.rate)} an hour
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.weeklyPay)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.monthlyPay)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.annualSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The first row is the National Living Wage itself — £12.71 an
          hour from April 2026 — which is why a full-time minimum-wage
          job on a 37.5-hour week is advertised at around{" "}
          {fmtMoney(RATE_ROWS[0].result.annualSalary)} a year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you work out an hourly rate from a salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Divide the salary by 52, then by the contracted hours in a
          week. A £30,000 salary on a 37.5-hour contract is £30,000 ÷
          52 ÷ 37.5 = {fmtRate(exSalary.hourlyRate)} an hour. Spread
          the same salary over a 40-hour week and the rate falls to
          £14.42 an hour — which is why two jobs advertised at the same
          salary can pay quite differently per hour, and why the
          contracted hours in the job advert matter. If extra hours are
          part of the job, the{" "}
          <Link href="/overtime-calculator" className={linkClass}>
            overtime calculator
          </Link>{" "}
          runs the same derived rate through the overtime rates in the
          contract and checks the average against the minimum wage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Can a salary hide an hourly rate below the minimum wage?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Yes. The minimum wage test is on the rate, not the headline
          salary: pay for the total hours worked must average at or
          above the floor for the age band. £24,000 sounds like a
          respectable starting salary, but over a 40-hour week it is{" "}
          {fmtRate(exLowSalary.hourlyRate)} an hour —{" "}
          {fmtMoney(Math.abs(exLowSalary.nmwDifferencePerHour))} an
          hour below the £12.71 National Living Wage for workers aged
          21 and over, and not lawful pay for the hours. Unpaid extra
          hours pull a salary down the same way. The current rates,
          from April 2026:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Age band
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Minimum hourly rate (April 2026)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year at 37.5 hours a week
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NMW_BANDS.map((band) => {
                const annual = convertHourlyRate({
                  direction: "hourlyToSalary",
                  hourlyRate: band.rate,
                  annualSalary: 0,
                  hoursPerWeek: 37.5,
                  ageBand: band.id,
                });
                return (
                  <tr key={band.id}>
                    <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                      {band.label}
                    </td>
                    <td className="px-4 py-2">{fmtMoney(band.rate)}</td>
                    <td className="px-4 py-2">{fmtMoney(annual.annualSalary)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The apprentice rate applies to apprentices under 19, and to
          those aged 19 or over in the first year of an apprenticeship;
          after that the age-band rate applies. Part-time salaries run
          on the same hourly maths — the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          works out the part-time annual, monthly and weekly pay from
          the full-time figure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rules used by this converter
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
              <tr>
                <td className="px-4 py-2">Annual salary from an hourly rate</td>
                <td className="px-4 py-2">
                  Hourly rate × hours per week × 52 weeks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Hourly rate from a salary</td>
                <td className="px-4 py-2">
                  Annual salary ÷ 52 weeks ÷ contracted hours per week
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Monthly pay</td>
                <td className="px-4 py-2">Annual salary ÷ 12</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Tax</td>
                <td className="px-4 py-2">
                  Every figure is gross — before Income Tax and
                  National Insurance. For the after-tax figure, use the
                  take-home pay calculator
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Minimum wage rates used (April 2026)
                </td>
                <td className="px-4 py-2">
                  21 and over £12.71 · 18 to 20 £10.85 · under 18 £8.00
                  · apprentice £8.00
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Previous rates (April 2025)</td>
                <td className="px-4 py-2">
                  21 and over £12.21 · 18 to 20 £10.00 · under 18 £7.55
                  · apprentice £7.55
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The minimum wage rates follow GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/national-minimum-wage-rates"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            National Minimum Wage and National Living Wage rates
          </a>
          . The conversion itself is plain arithmetic — the one
          judgement in it is the 52-week year, which this hub uses in
          every calculator so the tools agree with each other.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules and rates checked against GOV.UK on 11 November 2026.
          This converter covers gross pay only — what actually reaches
          your bank account depends on your tax code, pension and other
          deductions, which the{" "}
          <Link href="/payslip-generator" className={linkClass}>
            payslip generator
          </Link>{" "}
          shows line by line.
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
            href="/overtime-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Overtime Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The next step from the rate itself: overtime pay at flat
              rate, time and a quarter, time and a half or double time,
              from an hourly rate or a salary — with the minimum wage
              check on the average.
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
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What the converted salary actually pays after tax: Income
              Tax and National Insurance on any UK salary, with the
              monthly and weekly take-home figures.
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
              The part-time version of this conversion: the pro-rata
              annual, monthly and weekly salary from the full-time
              figure, by hours or days per week, with the FTE fraction
              and pro-rata holiday entitlement.
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
