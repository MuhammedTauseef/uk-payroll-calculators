import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import ProRataHolidayCalculator from "@/components/ProRataHolidayCalculator";
import { calculateProRataHoliday } from "@/lib/prorata-holiday";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = pageMetadata(
  "/pro-rata-holiday-calculator",
  "Pro Rata Holiday Calculator — Part-Time Entitlement in Days and Hours",
  "Free pro-rata holiday calculator: holiday entitlement for part-time staff and mid-year starters or leavers, pro-rated from the full-time entitlement with the statutory 5.6-week floor checked — in days and hours.",
);

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Worked examples — computed by the same function the calculator
// runs, so the page can never disagree with itself.
function fullYear(employeeDaysPerWeek: number, ftEntitlement = 28) {
  return calculateProRataHoliday({
    fullTimeEntitlementDays: ftEntitlement,
    fullTimeDaysPerWeek: 5,
    employeeDaysPerWeek,
    hoursPerDay: 7.5,
    period: "full",
    leaveYearStart: "2026-01-01",
    startOrLeavingDate: "2026-01-01",
  });
}
const PATTERN_ROWS = [2, 3, 4].map((days) => ({
  days,
  result: fullYear(days),
}));

const exFloor = fullYear(4, 25);
const exStarter = calculateProRataHoliday({
  fullTimeEntitlementDays: 28,
  fullTimeDaysPerWeek: 5,
  employeeDaysPerWeek: 5,
  hoursPerDay: 7.5,
  period: "starter",
  leaveYearStart: "2026-01-01",
  startOrLeavingDate: "2026-07-01",
});
const exLeaver = calculateProRataHoliday({
  fullTimeEntitlementDays: 28,
  fullTimeDaysPerWeek: 5,
  employeeDaysPerWeek: 5,
  hoursPerDay: 7.5,
  period: "leaver",
  leaveYearStart: "2026-01-01",
  startOrLeavingDate: "2026-03-15",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I calculate pro-rata holiday days?",
    answer:
      "Divide the days the employee works by the full-time days, and multiply the full-time entitlement by that fraction. Three days a week against a five-day full-time pattern and a 28-day entitlement: 28 × 3 ÷ 5 = 16.8 days. Then check the statutory floor — 5.6 weeks of the employee's own pattern, here 5.6 × 3 = 16.8 days — and give whichever is higher. This calculator does both steps.",
  },
  {
    question: "How do I calculate my holiday pay?",
    answer:
      "Holiday pay is a week's pay for each week of leave. For someone on fixed hours and pay, that is their normal weekly pay. If their pay or hours vary, holiday pay is based on their average pay over the previous 52 paid weeks (the holiday pay reference period), counting back past any weeks they were not paid. A day of leave is worth a day at that average rate — which is why expressing the entitlement in hours, as this calculator does, makes part-time holiday pay easier to check.",
  },
  {
    question: "Are bank holidays included in pro-rata entitlement?",
    answer:
      "They can be. The law does not give bank holidays on top of the 5.6 weeks, so if the full-time entitlement you start from includes bank holidays (28 days usually does), the pro-rata figure includes them too, and bank holidays that fall on the employee's working days come out of their total. If the contract gives bank holidays on top of the full-time figure, add them before you pro-rate — or check the contract, because the two treatments give different answers.",
  },
  {
    question: "What if my hours change every week?",
    answer:
      "Then a days-per-week pro-rata does not fit, and a different rule applies: for leave years beginning on or after 1 April 2024, irregular-hours and part-year workers accrue leave at 12.07% of the hours actually worked in each pay period. Our annual leave calculator has an irregular-hours mode that works that accrual out, including the rounding to the nearest hour.",
  },
  {
    question: "Is pro-rata holiday rounded up or down?",
    answer:
      "Entitlement can be rounded up, but not down — an employer cannot round 16.8 days down to 16. Most employers either leave the fraction (16.8 days, or 126 hours at 7.5 hours a day) or round up to the nearest half day. For mid-year starters and leavers, this calculator follows GOV.UK's treatment and rounds the part-year figure up to the nearest half day.",
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
  name: "Pro Rata Holiday Calculator",
  url: `${AppConfig.siteUrl}/pro-rata-holiday-calculator`,
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

export default function ProRataHolidayCalculatorPage() {
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
          Pro Rata Holiday Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Work out holiday entitlement for a part-time pattern, or
          for someone who starts or leaves part-way through the leave
          year: the full-time entitlement scaled by the days worked,
          checked against the statutory 5.6-week floor, and given in
          days and hours. Three days a week on a 28-day entitlement
          is 16.8 days — 126 hours at 7.5 hours a day.
        </p>
      </section>

      <ProRataHolidayCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to calculate pro-rata holiday days
        </h2>
        <p className={bodyClass}>
          The method has two steps, and the second is the one most
          quick calculations skip. First, pro-rate the contract:
          entitlement × (days worked ÷ full-time days). Second,
          check the floor: the law guarantees every worker 5.6 weeks
          of their own working pattern, so work out 5.6 × days
          worked as well. The entitlement is whichever of the two is
          higher. On the standard figures the two agree:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Days worked per week</th>
                <th className={thClass}>Pro-rata of 28 days</th>
                <th className={thClass}>Statutory floor (5.6 × days)</th>
                <th className={thClass}>In hours (7.5-hour day)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PATTERN_ROWS.map(({ days, result }) => (
                <tr key={days}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {days} days a week
                  </td>
                  <td className={tdClass}>{result.contractualDays} days</td>
                  <td className={tdClass}>{result.statutoryFloorDays} days</td>
                  <td className={tdClass}>{result.entitlementHours} hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Expressing the answer in hours is more than a nicety: a
          part-time worker whose days vary in length, or whose leave
          is booked in half days, is far easier to track in hours,
          and holiday pay for a day off is simply the hours in that
          day at their usual rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The 5.6-week floor: when the law gives more than the contract
        </h2>
        <p className={bodyClass}>
          The floor only bites when the full-time entitlement itself
          is below the statutory minimum — but that happens more
          often than employers expect, for example where a contract
          was written as &ldquo;20 days plus bank holidays&rdquo; and
          the bank holidays do not all fall in the year. Take a
          full-time entitlement of 25 days and a four-day week: the
          contract maths gives 25 × 4 ÷ 5 = {exFloor.contractualDays}{" "}
          days, but the floor is 5.6 × 4 = {exFloor.statutoryFloorDays}{" "}
          days — and {exFloor.statutoryFloorDays} is the lawful
          entitlement. This calculator applies the floor
          automatically and tells you when it has done so. The floor
          is capped at 28 days, however many days a week are worked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Starters and leavers: the part-year calculation
        </h2>
        <p className={bodyClass}>
          Someone who is only employed for part of the leave year
          gets that part of the entitlement, worked out in twelfths
          — one twelfth for each month of the leave year they are in
          the job, with the month they start or leave in counting as
          a whole month. Start a full-time job on 1 July in a
          January-to-December leave year and the entitlement is 28 ×{" "}
          {exStarter.twelfths}/12 = {exStarter.entitlementDays} days.
          Leave in mid-March and the leave accrued by then is 28 ×{" "}
          {exLeaver.twelfths}/12 = {exLeaver.entitlementDays} days —
          the figure a leaver&apos;s final pay is checked against,
          because leave accrued but not taken must be paid for, and
          leave taken beyond the accrual can be recovered if the
          contract allows. Part-year figures are rounded up to the
          nearest half day.
        </p>
        <p className={bodyClass}>
          If you only need the statutory entitlement for a regular
          pattern — without a contract figure to pro-rate — the{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          starts from the 5.6 weeks themselves and also handles
          irregular hours. The two tools are deliberately separate:
          this one pro-rates an employer&apos;s own entitlement for
          part-time staff and part-year joiners or leavers; that one
          works out the statutory entitlement from scratch.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Checking holiday for a whole team (the HR holiday calculator
          job)
        </h2>
        <p className={bodyClass}>
          Employers usually meet this calculation at scale: every
          part-time contract, every mid-year starter, every leaver,
          each with its own pattern and its own floor check. The
          mistakes that recur are consistent — pro-rating the
          contract but never checking the 5.6-week floor, counting
          bank holidays twice (once inside the 28 and once on top),
          and forgetting that leave keeps accruing during sick leave
          and family leave. Run each pattern through the calculator
          above when the contract is set up, not at the end of the
          leave year, and keep the result with the contract: it is
          the audit trail if the figure is ever challenged.
        </p>
        <p className={bodyClass}>
          The pay side has to be recorded somewhere as well. Holiday
          pay is a payroll cost like any other, and keeping the
          wages, holiday pay and employer costs in the same set of
          books as the rest of the business finances is what{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          is for — every pay run recorded as it happens, so the
          year-end figures are a report, not a reconstruction.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Irregular hours, part-year work and rolled-up holiday pay
        </h2>
        <p className={bodyClass}>
          This calculator is for regular patterns. Where hours change
          every pay period — casual, zero-hours, agency and some
          term-time work — entitlement cannot be pro-rated from a
          fixed pattern. For leave years beginning on or after 1
          April 2024 those workers accrue leave at 12.07% of the
          hours worked in each pay period, and their employer may
          instead pay that 12.07% on top of wages as rolled-up
          holiday pay, if the contract allows it. The{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          covers that accrual method; the{" "}
          <Link href="/term-time-pay-calculator" className={linkClass}>
            term-time pay calculator
          </Link>{" "}
          covers the pay construction for staff who only work school
          terms.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules follow the Working Time Regulations 1998 and
          GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/holiday-entitlement-rights"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
            target="_blank"
            rel="noreferrer"
          >
            holiday entitlement guidance
          </a>
          , checked 16 November 2026. This calculator works out the
          statutory and contractual arithmetic; a contract that gives
          more than the law is applied as written.
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
            href="/annual-leave-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Annual Leave Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The statutory entitlement from scratch: 5.6 weeks for
              any regular pattern, plus the 12.07% accrual for
              irregular-hours and part-year workers.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/holiday-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Holiday Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What the entitlement is worth in pounds: a week&apos;s
              pay for each week of leave, the 12.07% accrual priced,
              rolled-up pay, and the amount owed when a job ends.
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
              The pay that goes with the pattern: part-time salary
              from the full-time figure, by hours or days, with the
              FTE fraction.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/term-time-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Term-Time Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Pay for staff who work school terms only, built from
              the working weeks plus the holiday those weeks attract.
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
              The other statutory absence: Statutory Sick Pay under
              the April 2026 rules. Leave keeps accruing while
              someone is off sick.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
