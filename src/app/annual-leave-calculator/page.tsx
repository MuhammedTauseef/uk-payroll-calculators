import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import { calculateAnnualLeave } from "@/lib/annualleave";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/annual-leave-calculator",
  "Annual Leave Calculator",
  "Free annual leave calculator: holiday entitlement for full-time, part-time and irregular-hours workers — 5.6 weeks a year and the 12.07% accrual method.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

// Worked example figures — computed by the same calculator functions
// the tool above runs, so the page can never disagree with itself.
const FULL_INPUT = {
  startedPartWay: false,
  leaveYearStart: "2026-01-01",
  employmentStart: "2026-01-01",
  daysAlreadyTaken: 0,
  hoursWorked: 0,
  hoursAlreadyTaken: 0,
} as const;

function regularExample(daysPerWeek: number) {
  return calculateAnnualLeave({
    ...FULL_INPUT,
    mode: "regular",
    daysPerWeek,
    hoursPerDay: 7.5,
  });
}

const exFiveDay = regularExample(5);
const exFourDay = regularExample(4);
const exThreeDay = regularExample(3);
const exTwoHalfDay = regularExample(2.5);
const exOneDay = regularExample(1);
const exSixDay = regularExample(6);

const exMidYearFullTime = calculateAnnualLeave({
  ...FULL_INPUT,
  mode: "regular",
  daysPerWeek: 5,
  hoursPerDay: 7.5,
  startedPartWay: true,
  employmentStart: "2026-07-01",
});
const exMidYearPartTime = calculateAnnualLeave({
  ...FULL_INPUT,
  mode: "regular",
  daysPerWeek: 3,
  hoursPerDay: 7.5,
  startedPartWay: true,
  employmentStart: "2026-10-01",
});

const exIrregular100 = calculateAnnualLeave({
  ...FULL_INPUT,
  mode: "irregular",
  daysPerWeek: 0,
  hoursPerDay: 0,
  hoursWorked: 100,
});
const exIrregular30 = calculateAnnualLeave({
  ...FULL_INPUT,
  mode: "irregular",
  daysPerWeek: 0,
  hoursPerDay: 0,
  hoursWorked: 30,
});

// Leaving-job example — twelfths accrual on the statutory
// figures, then the holiday pay on a clean salary: £31,200 is
// £600 a week, so a day of leave on a five-day week is £120.
const LEAVER_ACCRUED_DAYS = (28 * 6) / 12;
const LEAVER_TAKEN_DAYS = 5;
const LEAVER_OWED_DAYS = LEAVER_ACCRUED_DAYS - LEAVER_TAKEN_DAYS;
const LEAVER_DAY_RATE = 31200 / 52 / 5;
const LEAVER_PAYMENT = LEAVER_OWED_DAYS * LEAVER_DAY_RATE;

// Hours-to-days conversions people ask for by name — the answer
// is simply the hours divided by the length of the working day.
const HOURS_200_AT_75 = 200 / 7.5;
const HOURS_2025_AT_75 = 202.5 / 7.5;
const HOURS_200_AT_8 = 200 / 8;
const HOURS_2025_AT_8 = 202.5 / 8;

const PATTERN_ROWS = [
  { pattern: "5 days a week (full-time)", result: exFiveDay, note: "The standard full-time pattern" },
  { pattern: "4 days a week", result: exFourDay, note: "" },
  { pattern: "3 days a week", result: exThreeDay, note: "GOV.UK's own worked example" },
  { pattern: "2.5 days a week", result: exTwoHalfDay, note: "" },
  { pattern: "1 day a week", result: exOneDay, note: "" },
  { pattern: "6 days a week", result: exSixDay, note: "Capped at 28 days by law" },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many days' holiday are you entitled to in the UK?",
    answer:
      "28 days a year if you work five days a week. The law gives almost every worker 5.6 weeks of paid holiday, counted in their own working pattern, and caps the statutory total at 28 days however many days a week you work. Part-time workers get 5.6 × their days per week (16.8 days on three days a week), and an employer can count bank holidays inside the total rather than on top of it.",
  },
  {
    question: "How do I calculate holiday entitlement for a 3-day week?",
    answer:
      "Multiply the days worked by 5.6: 3 × 5.6 = 16.8 days a year — GOV.UK's own example. The same rule works for any pattern: 4 days a week gives 22.4 days and 2.5 days gives 14 days. To express it in hours, multiply the days by the length of a working day — 16.8 days at 7.5 hours a day is 126 hours of leave.",
  },
  {
    question: "Are bank holidays on top of the 28 days?",
    answer:
      "Not by law. Bank holidays do not have to be given as paid leave on top of the 5.6 weeks, and most employers count them inside the total — on a five-day week that usually means 20 days to choose yourself, plus the bank holidays that fall on your working days. Some employers do give bank holidays on top; your contract or staff handbook says which way yours does it.",
  },
  {
    question: "How does holiday build up if I work irregular hours?",
    answer:
      "At 12.07% of the hours you work in each pay period — the rule for irregular-hours and part-year workers whose leave year began on or after 1 April 2024. Work 100 hours and you accrue 12.07 hours of leave, booked as 12; work 30 hours and the 3.62 hours accrued is booked as 4, because accrued leave is rounded to the nearest whole hour, halves up. Accrued leave can normally be taken from the next pay period.",
  },
  {
    question: "What happens if I start a job part-way through the leave year?",
    answer:
      "You get the fraction of the year's leave that matches the fraction of the year you are employed for, worked out in twelfths — and the month you start in counts as a whole month. Start a five-day job on 1 July in a January-to-December leave year and you are employed for 6 of the 12 months, so your first-year entitlement is 28 × 6/12 = 14 days. The part-year figure is rounded up to the nearest half day, and leave still builds up while you are on sick leave or family leave.",
  },
  {
    question: "What happens to my holiday when I leave a job?",
    answer: `Leave is worked out to your last day, in twelfths. Holiday you have built up but not taken must be paid in your final pay — paying for statutory leave instead of taking it is only allowed when a job ends. Leave on 30 June in a January-to-December leave year on a five-day week and you have accrued 28 × 6/12 = ${LEAVER_ACCRUED_DAYS} days; if you had taken ${LEAVER_TAKEN_DAYS}, the remaining ${LEAVER_OWED_DAYS} days are paid. The mirror image also applies: if you have taken more than you had accrued, your employer can take the excess back out of your final pay — but only if your contract or a written agreement says they can.`,
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
  name: "Annual Leave Calculator",
  url: `${AppConfig.siteUrl}/annual-leave-calculator`,
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

export default function AnnualLeaveCalculatorPage() {
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
          Annual Leave Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Work out your UK annual leave entitlement in days and hours:
          5.6 weeks of paid holiday a year, counted in your own working
          pattern — 28 days on a five-day week, pro-rata part-time, less
          for a part-year start, and 12.07% accrual if your hours are
          irregular. Free, with nothing to sign up for.
        </p>
      </section>

      <AnnualLeaveCalculator />

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Managing holiday for a whole team?{" "}
        <a
          href="https://go.zoho.com/mxeG"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          Zoho People
        </a>{" "}
        tracks leave balances and approvals for you.
      </p>

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        If holiday sits alongside sickness and other time off, compare
        the{" "}
        <Link
          href="/blog/best-absence-management-software"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          best absence management software
        </Link>{" "}
        for UK teams — it covers leave balances, approvals and absence
        patterns in one place.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this annual leave calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This calculator is part of UK Payroll Calculators, a free hub
          of UK payroll calculators built on the April 2026 rules — no
          sign-up, no accounts, and every figure worked out in your
          browser. If you work the same days every week, use the
          regular-hours setting: enter your days per week, add the
          length of a working day if you want the answer in hours, and
          tell it if you started part-way through the leave year. If
          your hours change from week to week — casual, zero-hours,
          agency or term-time work — use the irregular-hours setting
          and enter the hours you have actually worked. Either way,
          take off the leave already taken and the calculator shows
          what is left.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much annual leave are you entitled to?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Almost every worker in the UK is legally entitled to 5.6
          weeks of paid holiday a year. On a five-day week that is 28
          days; on any other pattern it is 5.6 times the days you work
          each week — the same 5.6 weeks, counted in your own days. The
          statutory total is capped at 28 days, so working six days a
          week still gives 28 days, not 33.6.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Working pattern
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Entitlement (days)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  In hours (7.5-hour day)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PATTERN_ROWS.map((row) => (
                <tr key={row.pattern}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {row.pattern}
                  </td>
                  <td className="px-4 py-2">{row.result.entitlementDays}</td>
                  <td className="px-4 py-2">{row.result.entitlementHours}</td>
                  <td className="px-4 py-2">{row.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          These are statutory minimums. Many contracts give more — five
          weeks plus bank holidays on top is common — and the contract
          figure is the one that binds your employer. What the law
          guarantees is the floor in the table.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is annual leave calculated for part-time workers?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          By the same 5.6 weeks, expressed in smaller weeks. A worker
          on three days a week gets 5.6 × 3 ={" "}
          {exThreeDay.entitlementDays} days a year, because each of
          their weeks of leave is only three days long. Nothing else
          changes: the entitlement builds up from the first day of the
          job, keeps building during sick leave and family leave, and
          bank holidays that fall on a working day usually come out of
          the total. If your employer&apos;s own full-time entitlement
          is the figure you need to pro-rate — rather than the
          statutory minimum worked out here — the{" "}
          <Link href="/pro-rata-holiday-calculator" className={linkClass}>
            pro-rata holiday calculator
          </Link>{" "}
          starts from that contract figure, checks it against the
          5.6-week floor, and covers mid-year starters and leavers.
          The pay side of working part-time is a different
          calculation — our{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          works out the part-time salary, monthly pay and FTE fraction
          from the full-time figure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does leave build up for irregular-hours and part-year
          workers?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If the hours change every pay period — or the job runs for
          only part of the year, like term-time work — there is no
          fixed pattern to multiply by 5.6. For leave years beginning
          on or after 1 April 2024, leave instead builds up
          (&ldquo;accrues&rdquo;) at 12.07% of the hours actually
          worked in each pay period. The percentage is the same 5.6
          weeks restated: 5.6 weeks of leave against the 46.4 weeks a
          year that remain. Work 100 hours and you accrue{" "}
          {exIrregular100.accruedHoursExact} hours of leave, booked as{" "}
          {exIrregular100.accruedHoursBooked} hours. GOV.UK&apos;s own
          example makes the rounding plain: 30 hours worked accrues
          3.621 hours, booked as {exIrregular30.accruedHoursBooked}{" "}
          hours — accrued leave is rounded to the nearest whole hour,
          halves up. Employers of irregular-hours and part-year workers
          can instead pay the 12.07% on top of wages as
          &ldquo;rolled-up holiday pay&rdquo;, if the contract allows
          it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Turning hours of leave into days
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Entitlement quoted in hours — standard for part-time and
          shift work — converts to days by dividing by the length of
          your working day, and the day length is the whole answer.
          The two totals people ask about most: 200 hours is{" "}
          {HOURS_200_AT_75.toFixed(1)} days at 7.5 hours a day, or{" "}
          {HOURS_200_AT_8} days at 8 hours a day. And 202.5 hours —
          the figure on many NHS and public-sector contracts — is{" "}
          {HOURS_2025_AT_75} days at 7.5 hours a day, or{" "}
          {HOURS_2025_AT_8.toFixed(1)} days at 8 hours. If your days
          are not all the same length, there is no single honest
          conversion: keep the entitlement in hours, as the
          calculator above does, and deduct the hours of each day
          you take.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Do bank holidays count towards annual leave?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          They can — the law does not put bank holidays on top of the
          5.6 weeks. Bank or public holidays do not have to be given as
          paid leave at all, and an employer can count them inside your
          statutory entitlement. So if your workplace closes on bank
          holidays and they fall on your working days, those days come
          out of your 28 (or your pro-rata total) — which is why a
          five-day worker with bank holidays included usually has 20
          days a year to book freely. If your contract gives bank
          holidays on top, that is better than the legal minimum, and
          the contract wins.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What happens if you start a job part-way through the leave
          year?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          You get the part of the year&apos;s entitlement that matches
          the part of the year you are employed for, worked out in
          twelfths — one twelfth of the annual figure for each month of
          the leave year you are in the job, and the month you start in
          counts as a whole month even if you start part-way through
          it. Start a five-day job on 1 July in a leave year that runs
          from 1 January and you are employed for{" "}
          {exMidYearFullTime.twelfthsRemaining} of the 12 months, so
          the entitlement is 28 × {exMidYearFullTime.twelfthsRemaining}
          /12 = {exMidYearFullTime.entitlementDays} days. A three-day
          worker starting on 1 October in the same leave year gets
          16.8 × {exMidYearPartTime.twelfthsRemaining}/12, given as{" "}
          {exMidYearPartTime.entitlementDays} days — part-year figures
          are rounded up to the nearest half day. The mirror image
          applies when you leave: you are owed pay for leave accrued
          but not taken, and payment in lieu of statutory leave is
          allowed only at the end of a job.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What happens to your holiday when you leave a job?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Leaving works like starting, in mirror image: entitlement
          is worked out to your last day, in twelfths of the leave
          year. Whatever you have built up but not taken must be
          paid in your final pay — this payment in lieu is the one
          situation where statutory holiday can be paid for instead
          of taken. Work the standard example: a five-day worker in
          a January-to-December leave year who leaves on 30 June has
          been employed for 6 of the 12 months, so they have accrued
          28 × 6/12 = {LEAVER_ACCRUED_DAYS} days. If they had taken{" "}
          {LEAVER_TAKEN_DAYS} days, the remaining {LEAVER_OWED_DAYS}{" "}
          days are owed — on a £31,200 salary (£600 a week, £
          {LEAVER_DAY_RATE} a day on a five-day week) that is{" "}
          {LEAVER_OWED_DAYS} × £{LEAVER_DAY_RATE} = £
          {LEAVER_PAYMENT.toLocaleString("en-GB")} of holiday pay in
          the final payslip, taxed like normal pay.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two edges to know. First, the excess runs the other way
          too: if you have taken <em>more</em> leave than you had
          accrued by your last day, your employer can deduct the
          overpayment from your final pay — but only where your
          contract or a written agreement you signed allows it;
          without that agreement, they cannot simply help themselves.
          Second, leave keeps accruing during your notice period,
          and your employer can ask you to use remaining leave inside
          it — many people finish earlier that way. If your contract
          gives more than the statutory minimum, the same
          twelfths logic applies to the contract figure, which is
          the calculation the{" "}
          <Link href="/pro-rata-holiday-calculator" className={linkClass}>
            pro-rata holiday calculator
          </Link>{" "}
          runs for leavers directly; and how much notice there is to
          run it against is the{" "}
          <Link href="/notice-period-calculator" className={linkClass}>
            notice period calculator
          </Link>
          &apos;s job.
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
                <td className="px-4 py-2">Statutory entitlement</td>
                <td className="px-4 py-2">
                  5.6 weeks of paid holiday a year for almost all
                  workers
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Regular-hours entitlement</td>
                <td className="px-4 py-2">
                  5.6 × days worked per week, in days
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Statutory cap</td>
                <td className="px-4 py-2">
                  28 days a year, however many days a week are worked
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Bank holidays</td>
                <td className="px-4 py-2">
                  No legal right to them on top — an employer can count
                  them inside the 5.6 weeks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Irregular-hours / part-year accrual
                </td>
                <td className="px-4 py-2">
                  12.07% of hours worked in each pay period (leave years
                  beginning on or after 1 April 2024)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Accrued-leave rounding</td>
                <td className="px-4 py-2">
                  To the nearest whole hour, halves up — GOV.UK&apos;s
                  rule
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Part-year starters</td>
                <td className="px-4 py-2">
                  Full-year entitlement × twelfths of the leave year
                  employed for; the start month counts whole; the
                  part-year total is rounded up to the nearest half day
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The rules follow the Working Time Regulations 1998, as
          amended, in the form GOV.UK states them in{" "}
          <a
            href="https://www.gov.uk/holiday-entitlement-rights"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Holiday entitlement: entitlement
          </a>{" "}
          and{" "}
          <a
            href="https://www.gov.uk/calculate-your-holiday-entitlement"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Calculate holiday entitlement
          </a>
          .
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Leave rules checked against GOV.UK on 9 November 2026. This
          calculator covers the statutory minimum; your contract may
          give more, and Scotland, Wales and Northern Ireland set the
          same 5.6-week floor under the same Regulations.
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

      <RelatedCalculators href="/annual-leave-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
