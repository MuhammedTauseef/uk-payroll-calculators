import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import HourlyRateConverter from "@/components/HourlyRateConverter";
import { convertHourlyRate } from "@/lib/hourly";
import { calculateTakeHome } from "@/lib/takehome";
import { NMW_BANDS } from "@/lib/overtime";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

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

// Common salaries turned into hourly rates on a 37.5-hour week by
// the converter's own maths, with the monthly take-home from the
// site's PAYE engine (2026/27, standard tax code, no pension or
// student loan) — the quick table in "Common salaries as hourly
// rates" below.
const SALARY_ROWS = [20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000].map(
  (salary) => {
    const conv = convertHourlyRate({
      direction: "salaryToHourly",
      hourlyRate: 0,
      annualSalary: salary,
      hoursPerWeek: 37.5,
      ageBand: "over21",
    });
    const net = calculateTakeHome({ annualSalary: salary });
    return { salary, hourly: conv.hourlyRate, netMonthly: net.netMonthly };
  },
);

// £14 an hour, the rate readers most often ask about after tax:
// gross figures from the converter, take-home from the PAYE engine.
const ex14 = convertHourlyRate({
  direction: "hourlyToSalary",
  hourlyRate: 14,
  annualSalary: 0,
  hoursPerWeek: 37.5,
  ageBand: "over21",
});
const ex14Net = calculateTakeHome({ annualSalary: ex14.annualSalary });

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
  {
    question: "How do I convert a salary to an hourly rate in Excel?",
    answer: `Put the salary in one cell and the weekly hours in another and divide by 52, then by the hours: with the salary in A2 and hours in B2, the formula is =A2/52/B2. For £30,000 over 37.5 hours that gives ${fmtRate(exSalary.hourlyRate)} an hour. The other way round — hourly rate in A2, hours in B2 — the annual salary is =A2*B2*52, and the monthly salary is that divided by 12. There is no honest single-cell formula for the after-tax figure, because tax bands and the personal allowance taper do not reduce to one line; use the take-home table on this page or the take-home pay calculator for that.`,
  },
  {
    question: "What is £14 an hour a month, after tax?",
    answer: `At 37.5 hours a week, £14 an hour is ${fmtMoney(ex14.annualSalary)} a year, or ${fmtMoney(ex14.monthlyPay)} a month before tax. After Income Tax and National Insurance on the 2026/27 rules (standard tax code, no pension or student loan), the take-home pay is about ${fmtMoney(ex14Net.netMonthly)} a month. Your own figure moves with your tax code, pension contributions and hours — the converter above plus the take-home pay calculator give the exact version for your inputs.`,
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
          Common salaries as hourly rates — with take-home pay
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The same conversion run the other way for the salaries
          readers ask about most, all on a 37.5-hour week — plus the
          monthly figure that actually lands in the bank. The
          take-home column uses the 2026/27 Income Tax and National
          Insurance rules with a standard tax code and no pension or
          student loan, worked out by the same engine as the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>
          .
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Annual salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Hourly rate (37.5-hour week)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Gross per month
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home per month
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SALARY_ROWS.map((row) => (
                <tr key={row.salary}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {fmtMoney(row.salary)}
                  </td>
                  <td className="px-4 py-2">{fmtRate(row.hourly)} an hour</td>
                  <td className="px-4 py-2">{fmtMoney(row.salary / 12)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.netMonthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two things to read off the table. First, the hourly rate
          moves fast with the salary: £5,000 a year is about £2.56 an
          hour on this week length, which is why a modest pay rise can
          matter more than it sounds. Second, the gap between the gross
          and take-home columns widens as pay rises — at £60,000 the
          tax and National Insurance take a noticeably bigger share
          than at £25,000.
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
          The Excel formulas for hourly rate and salary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          In a spreadsheet the conversions are one line each. With an
          annual salary in cell A2 and the contracted hours per week in
          B2, the hourly rate is <code>=A2/52/B2</code> — for a £30,000
          salary over 37.5 hours, {fmtRate(exSalary.hourlyRate)} an
          hour. With an hourly rate in A2 instead, the annual salary is{" "}
          <code>=A2*B2*52</code> and the monthly salary is{" "}
          <code>=A2*B2*52/12</code>. Keep the hours in their own cell
          rather than typing 37.5 into the formula: the hours are the
          assumption most likely to change, and a formula that hides
          them is how a 40-hour contract ends up priced on a 37.5-hour
          week. One limit to know: there is no honest one-cell Excel
          formula for the after-tax figure, because Income Tax bands,
          the £100,000 personal allowance taper and National Insurance
          thresholds do not compress into a single line — that is the
          job the table above and the take-home pay calculator do.
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

      <RelatedCalculators href="/hourly-rate-converter" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
