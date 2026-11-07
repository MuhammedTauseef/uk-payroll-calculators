import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorCta,
  FaqSection,
  SiblingGuides,
  SspRatesTable,
  faqJsonLd,
  type GuideFaq,
} from "@/components/GuideSections";
import { RATES_LAST_VERIFIED, RATES_RULES_LABEL, SSP } from "@/lib/rates";

export const metadata: Metadata = {
  title: "SSP Rate — Current Statutory Sick Pay Rate",
  description:
    "The current SSP rate is £123.25 a week — a maximum, not a guarantee. Why your SSP might be less, the daily rates, and when the rate changes.",
};

const FAQS: GuideFaq[] = [
  {
    question: "What is the SSP rate per week?",
    answer:
      "The headline SSP rate is £123.25 a week, but that is the maximum. The amount actually paid is the lower of £123.25 or 80% of the employee's average weekly earnings — so anyone whose 80% figure comes out lower receives that instead.",
  },
  {
    question: "What is the SSP rate per day?",
    answer:
      "There is no single daily rate: it depends on the employee's working pattern. Divide the weekly SSP amount by the number of qualifying days in the week — a Monday-to-Friday worker at the full rate gets £24.65 a day, while a three-day-a-week worker at the full rate gets £41.08 a day, paid on fewer days.",
  },
  {
    question: "Is the SSP rate before or after tax?",
    answer:
      "Before tax. SSP is paid through the payroll like ordinary wages, and income tax and National Insurance are deducted in the usual way. The £123.25 figure is the gross weekly amount.",
  },
  {
    question: "Does the SSP rate depend on how many hours I work?",
    answer:
      "Not directly. The rate itself is fixed, but two things that flow from your job decide what you receive: your average weekly earnings (which set the 80% figure) and your qualifying days (which set the daily rate). Part-time workers use exactly the same rate — it is their earnings and days that differ.",
  },
  {
    question: "Where can I check the current SSP rate?",
    answer:
      "The official rate is published on GOV.UK, and statutory rates are normally reviewed each April. This page shows the rate from the April 2026 rules with the date it was last verified, so you can see how current the figure is before relying on it.",
  },
];

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function SspRatePage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          SSP Rate
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The SSP rate is {gbp.format(SSP.weeklyCap)} a week — but that
          figure is a maximum, not a guarantee. Under the April 2026 rules,
          the amount actually paid is the lower of{" "}
          {gbp.format(SSP.weeklyCap)} or {SSP.aweFraction * 100}% of the
          employee&apos;s average weekly earnings, so anyone earning under
          about {gbp.format(154)} a week receives less than the headline
          rate.
        </p>
        <p className="text-sm text-slate-500">
          Rates: {RATES_RULES_LABEL}. Last verified: {RATES_LAST_VERIFIED}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          What is the SSP rate?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          There are effectively two rates, and the employee always gets the
          lower of them. The first is the flat statutory rate:{" "}
          {gbp.format(SSP.weeklyCap)} a week. The second is personal to the
          employee: {SSP.aweFraction * 100}% of their average weekly
          earnings. The two meet at average earnings of{" "}
          {gbp.format(SSP.weeklyCap / SSP.aweFraction)} a week — earn more
          than that and {SSP.aweFraction * 100}% of your pay exceeds the
          flat rate, so you are capped at {gbp.format(SSP.weeklyCap)}; earn
          less and the percentage figure is the lower one, so that is what
          you receive.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Whichever figure applies, it is a weekly amount. It is then shared
          across the employee&apos;s qualifying days to produce the daily
          rate that payroll actually pays for each day of sickness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Why might my SSP be less than £123.25 a week?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The most common reason is the {SSP.aweFraction * 100}% rule. An
          employee earning {gbp.format(100)} a week receives{" "}
          {gbp.format(80)}; one earning {gbp.format(140)} receives{" "}
          {gbp.format(112)}. Nothing has gone wrong — the rules are designed
          so that lower-paid staff receive four-fifths of their normal pay
          rather than the flat rate. The other reason an individual payment
          can look smaller is that SSP is only paid for qualifying days: a
          part-week of sickness pays the daily rate multiplied by the days
          absent, not a full week. Our guide to{" "}
          <Link
            href="/how-much-is-ssp-per-week"
            className="font-medium text-brand-800 underline"
          >
            SSP per week
          </Link>{" "}
          shows the weekly amount at a range of pay levels.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          What is the daily SSP rate?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Divide the weekly amount by the qualifying days in the
          employee&apos;s normal week. At the full flat rate, a
          Monday-to-Friday worker receives {gbp.format(24.65)} a day (
          {gbp.format(SSP.weeklyCap)} ÷ 5), while a three-day-a-week worker
          receives {gbp.format(41.08)} a day ({gbp.format(SSP.weeklyCap)} ÷
          3) — a higher daily rate, but paid on fewer days, so a full week
          of sickness still comes to the same {gbp.format(SSP.weeklyCap)}.
          If the {SSP.aweFraction * 100}%-of-earnings figure is the weekly
          amount, divide that figure by the qualifying days instead. The{" "}
          <Link
            href="/how-is-ssp-calculated"
            className="font-medium text-brand-800 underline"
          >
            step-by-step calculation guide
          </Link>{" "}
          shows the full method.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Has the SSP rate changed under the April 2026 rules?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The headline figure is only half of the April 2026 story — the
          structure around the rate changed as well. SSP is now paid from
          the first full day of sickness, with no unpaid waiting days at the
          start of a spell. The lower earnings limit has been removed, so
          there is no minimum weekly wage an employee must reach before the
          rate applies to them. And the {SSP.aweFraction * 100}%
          -of-earnings alternative means the rate now flexes with pay
          instead of being one flat amount for everyone. The maximum
          entitlement remains {SSP.maxWeeks} weeks per period of sickness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          When does the SSP rate change?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Statutory payment rates are normally reviewed once a year, with
          any new figures taking effect each April. Between reviews the rate
          stays fixed, so the figure on this page holds until the next
          uprating. Because a wrong rate quietly corrupts every calculation
          built on it, this site dates its figures openly: the rates here
          follow the {RATES_RULES_LABEL.toLowerCase()} and were last
          verified on {RATES_LAST_VERIFIED}. If you are running payroll
          close to an April changeover, confirm the rate on GOV.UK before
          the first payment of the new tax year.
        </p>
      </section>

      <SspRatesTable />

      <CalculatorCta />

      <SiblingGuides currentHref="/ssp-rate" />

      <FaqSection faqs={FAQS} />
    </div>
  );
}
