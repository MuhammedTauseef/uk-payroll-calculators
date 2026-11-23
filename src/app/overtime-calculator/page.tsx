import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import OvertimeCalculator from "@/components/OvertimeCalculator";
import { calculateOvertime, NMW_BANDS } from "@/lib/overtime";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/overtime-calculator",
  "Overtime Calculator — Overtime Pay",
  "Free overtime calculator: pay at flat rate, time and a quarter, time and a half or double time, from an hourly rate or a salary — plus a minimum wage check.",
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

// Worked example figures — computed by the same calculator functions
// the tool above runs, so the page can never disagree with itself.
// The running example: £12.71 an hour (the April 2026 National
// Living Wage), 40 normal hours and 10 overtime hours in the week.
const BASE_INPUT = {
  basis: "hourly",
  hourlyRate: 12.71,
  annualSalary: 0,
  contractedHoursPerWeek: 0,
  normalHours: 40,
  overtimeHours: 10,
  ageBand: "over21",
} as const;

const exMain = calculateOvertime({ ...BASE_INPUT, multiplier: 1.5 });
const exFlat = calculateOvertime({ ...BASE_INPUT, multiplier: 1 });
const exQuarter = calculateOvertime({ ...BASE_INPUT, multiplier: 1.25 });
const exDouble = calculateOvertime({ ...BASE_INPUT, multiplier: 2 });

const MULTIPLIER_ROWS = [
  { label: "Flat rate (1×)", result: exFlat, note: "No premium — the same rate as normal hours" },
  { label: "Time and a quarter (1.25×)", result: exQuarter, note: "" },
  { label: "Time and a half (1.5×)", result: exMain, note: "The most common contract rate" },
  { label: "Double time (2×)", result: exDouble, note: "" },
];

// The minimum wage trap: a £26,000 salary over 37.5 contracted
// hours, with 5 hours of unpaid overtime in the week.
const exUnpaid = calculateOvertime({
  basis: "salary",
  hourlyRate: 0,
  annualSalary: 26000,
  contractedHoursPerWeek: 37.5,
  normalHours: 37.5,
  overtimeHours: 5,
  multiplier: 0,
  ageBand: "over21",
});

// A salary turned into an hourly rate: £30,000 over 37.5 hours,
// with 5 overtime hours at time and a half in the week.
const exSalary = calculateOvertime({
  basis: "salary",
  hourlyRate: 0,
  annualSalary: 30000,
  contractedHoursPerWeek: 37.5,
  normalHours: 37.5,
  overtimeHours: 5,
  multiplier: 1.5,
  ageBand: "over21",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is overtime pay calculated?",
    answer: `Overtime hours × your hourly rate × the overtime rate in your contract. At £12.71 an hour with 10 overtime hours at time and a half, that is 10 × £12.71 × 1.5 = ${fmtMoney(exMain.overtimePay)} of overtime pay, on top of ${fmtMoney(exMain.normalPay)} for 40 normal hours — ${fmtMoney(exMain.totalPay)} for the week. There is no set formula in law: the multiplier comes from the contract, and flat rate or unpaid overtime are both lawful as long as the minimum wage floor below is met.`,
  },
  {
    question: "Do employers have to pay extra for overtime?",
    answer:
      "No. GOV.UK states it plainly: employers do not have to pay workers for overtime at all. Any overtime rate — time and a half, double time, flat rate, or time off in lieu instead of pay — comes from your employment contract, not from the law. The one legal floor is the National Minimum Wage: your average pay for the total hours you work must not fall below it.",
  },
  {
    question: "What do time and a half and double time mean?",
    answer: `Time and a half means each overtime hour is paid at 1.5 × your hourly rate — ${fmtRate(exMain.overtimeHourlyRate)} an hour on a £12.71 rate. Double time is 2 × the rate, ${fmtRate(exDouble.overtimeHourlyRate)} an hour on the same base. Time and a quarter is 1.25 ×. These are common contract rates, not legal entitlements: your contract says which, if any, applies, and many contracts pay overtime at the flat hourly rate.`,
  },
  {
    question: "Can overtime take my average pay below the minimum wage?",
    answer: `Yes — and that is when it becomes unlawful. The test is your total pay divided by your total hours, normal and overtime together, across the pay reference period. A £26,000 salary over 37.5 contracted hours is ${fmtMoney(exUnpaid.normalPay)} a week; add 5 unpaid overtime hours and the average falls to ${fmtRate(exUnpaid.effectiveHourlyRate ?? 0)} an hour — below the £12.71 National Living Wage for workers aged 21 and over. If your average is under the floor for your age band, raise it with your employer first; Acas and HMRC can both take it further.`,
  },
  {
    question: "How do I work out my hourly rate from my salary?",
    answer: `Divide the salary by 52 weeks, then by your contracted hours per week. A £30,000 salary on a 37.5-hour week is £30,000 ÷ 52 ÷ 37.5 = ${fmtRate(exSalary.hourlyRate)} an hour. Overtime and the minimum wage check both run on that derived rate — on it, 5 overtime hours at time and a half in a week pay ${fmtMoney(exSalary.overtimePay)}.`,
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
  name: "Overtime Calculator",
  url: `${AppConfig.siteUrl}/overtime-calculator`,
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

export default function OvertimeCalculatorPage() {
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
          Overtime Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Work out overtime pay from your hourly rate or salary:
          normal pay, overtime pay at the rate in your contract —
          flat, time and a quarter, time and a half or double time —
          the total for the period, and a minimum wage check on the
          average. Free, with nothing to sign up for.
        </p>
      </section>

      <OvertimeCalculator />

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        If overtime is a regular pattern rather than the odd busy week,
        plan the hours before they reach payroll. Our guide to the{" "}
        <Link
          href="/blog/best-workforce-planning-software"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          best workforce planning software
        </Link>{" "}
        explains how to forecast demand, spot cover gaps and price every
        hour.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this overtime calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This calculator is part of UK Payroll Calculators, a free hub
          of UK payroll calculators built on the April 2026 rules — no
          sign-up, no accounts, and every figure worked out in your
          browser. Enter an hourly rate, or a salary and the contracted
          hours it covers, then the normal hours and overtime hours in
          one pay period and the overtime rate from your contract. The
          calculator shows the normal pay, the overtime pay and the
          total — and then averages the total over all the hours
          worked and checks it against the National Minimum Wage for
          your age band, which is the one legal floor overtime has.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is overtime pay calculated?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Overtime pay is the overtime hours × your hourly rate × the
          contract&apos;s overtime multiplier. On £12.71 an hour, a
          week of 40 normal hours and 10 overtime hours at time and a
          half works out as: normal pay 40 × £12.71 ={" "}
          {fmtMoney(exMain.normalPay)}; overtime pay 10 × £12.71 × 1.5
          = {fmtMoney(exMain.overtimePay)}; total{" "}
          {fmtMoney(exMain.totalPay)} for the week — an average of{" "}
          {fmtRate(exMain.effectiveHourlyRate ?? 0)} an hour over the
          50 hours. The multiplier is the only thing that changes
          between contracts:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Overtime rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Overtime pay (10 hours)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Total for the week
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MULTIPLIER_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {row.label}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.overtimePay)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.totalPay)}</td>
                  <td className="px-4 py-2">{row.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every row is the same week — £12.71 an hour, 40 normal hours,
          10 overtime hours. Only the contract rate changes, which is
          why two people on the same hourly rate can take home very
          different overtime pay.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Do employers have to pay extra for overtime?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          No — there is no statutory right to an overtime premium in
          UK law. GOV.UK&apos;s overtime guidance says employers do
          not have to pay workers for overtime at all. Whether overtime
          is paid, and at what rate, is set by the employment contract:
          some contracts promise time and a half or double time, many
          pay the flat hourly rate, and some offer time off in lieu
          (TOIL) instead of pay. Part-time workers are normally paid
          at their hourly rate for extra hours, with a premium only
          where full-time staff would get one. The contract — and any
          staff handbook it points to — is the document that decides.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Overtime rules in 2026: what actually changed
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On overtime itself, nothing: 2026 brought no new statutory
          overtime premium, and there is still no legal rate for
          overtime in the UK — no law says time and a half, and none
          is planned in the current GOV.UK guidance. What did change
          on 1 April 2026 is the floor underneath it. The National
          Living Wage for workers aged 21 and over rose to £12.71 an
          hour (18 to 20: £10.85; under 18 and apprentices: £8.00),
          and that is the rate your total pay, averaged over your
          total hours, must not fall below — so unpaid or flat-rate
          overtime that was lawful in March can breach the floor in
          April on the same salary, which is why the worked example
          on this page now runs on the £12.71 rate. April 2026 also
          reformed Statutory Sick Pay (payable from the first day of
          sickness, with the lower earnings limit removed), but that
          affects absence, not overtime: your overtime rate in 2026
          is still whatever your contract says it is.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Can overtime pull your average pay below the minimum wage?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Yes, and that is the one hard legal line. Your average pay
          for the total hours you work — normal and overtime together —
          must not fall below the National Minimum Wage for your age
          band across the pay reference period. Paid overtime at a
          premium cannot do it, but flat-rate or unpaid overtime on a
          salary close to the floor can. Take a £26,000 salary over
          37.5 contracted hours: the weekly pay is{" "}
          {fmtMoney(exUnpaid.normalPay)}, an hourly rate of{" "}
          {fmtRate(exUnpaid.hourlyRate)}. Add 5 unpaid overtime hours
          and the same {fmtMoney(exUnpaid.totalPay)} is spread over
          42.5 hours — {fmtRate(exUnpaid.effectiveHourlyRate ?? 0)} an
          hour, below the £12.71 floor for workers aged 21 and over by{" "}
          {fmtMoney(exUnpaid.nmwShortfallPerHour ?? 0)} an hour. The
          current rates, from April 2026:
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NMW_BANDS.map((band) => (
                <tr key={band.id}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {band.label}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(band.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The apprentice rate applies to apprentices under 19, and to
          those aged 19 or over in the first year of an apprenticeship;
          after that the age-band rate applies. If your own average
          works out below the floor, the usual first step is raising
          it with the employer; Acas gives free advice, and HMRC
          enforces the minimum wage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you work out an hourly rate from a salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Divide the annual salary by 52 weeks, then by the contracted
          hours in a week. A £30,000 salary on a 37.5-hour contract is
          £30,000 ÷ 52 ÷ 37.5 = {fmtRate(exSalary.hourlyRate)} an
          hour. Everything else then runs exactly as it does for an
          hourly-paid worker: in a week with 5 overtime hours at time
          and a half, the overtime pays {fmtMoney(exSalary.overtimePay)}{" "}
          on top of the normal weekly {fmtMoney(exSalary.normalPay)}.
          The same derived rate is the one the minimum wage check uses
          — which is why contracted hours matter: the more hours the
          salary is spread over, the lower the rate. The pay split of
          a part-time salary is a related calculation — our{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          works out the part-time salary, monthly pay and FTE fraction
          from the full-time figure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is overtime calculated on basic pay or gross pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On the basic hourly rate, in almost every contract — and
          the difference is worth money. The multiplier applies to
          the rate the contract names, which is normally your basic
          rate of pay: it does not automatically include shift
          allowances, unsocial-hours enhancements, bonuses or
          commission, and it is not 1.5 × your average gross hourly
          earnings unless the contract says so. For hourly-paid
          staff the basic rate is simply the hourly rate. For
          salaried staff there is no separate basic rate on the
          payslip, so the overtime rate is derived from the salary
          itself — annual salary ÷ 52 ÷ contracted hours, as this
          calculator does — and then multiplied. Two checks settle
          most disputes: does your contract define the overtime rate
          as a multiple of basic pay, of the hourly rate, or as a
          flat amount per hour (some contracts pay a set £ figure
          rather than a multiple at all)? And are enhancements you
          already receive for those hours — a night premium, say —
          paid instead of the overtime multiplier, or on top of it?
          Both answers are in the contract wording, not in the law,
          and a payslip that quietly uses a lower base than the
          contract names is wrong however neatly it is calculated.
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
              <tr>
                <td className="px-4 py-2">Overtime premium</td>
                <td className="px-4 py-2">
                  No statutory right — the rate comes from the
                  employment contract, and overtime can lawfully be
                  flat-rate or unpaid
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Overtime pay</td>
                <td className="px-4 py-2">
                  Overtime hours × hourly rate × the contract multiplier
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Hourly rate from a salary</td>
                <td className="px-4 py-2">
                  Annual salary ÷ 52 weeks ÷ contracted hours per week
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Minimum wage floor</td>
                <td className="px-4 py-2">
                  Total pay ÷ total hours (normal + overtime) must be
                  at or above the National Minimum Wage for the age
                  band, across the pay reference period
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
          The rules follow the National Minimum Wage Act 1998 in the
          form GOV.UK states them in{" "}
          <a
            href="https://www.gov.uk/overtime-your-rights"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Overtime: your rights
          </a>{" "}
          and{" "}
          <a
            href="https://www.gov.uk/national-minimum-wage-rates"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            National Minimum Wage and National Living Wage rates
          </a>
          .
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules and rates checked against GOV.UK on 9 November 2026.
          This calculator covers pay before tax — Income Tax and
          National Insurance come off the total in payroll, and your
          contract may set overtime terms better than the legal floor.
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

      <RelatedCalculators href="/overtime-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
