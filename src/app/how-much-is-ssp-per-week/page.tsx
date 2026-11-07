import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import {
  CalculatorCta,
  FaqSection,
  SiblingGuides,
  SspRatesTable,
  faqJsonLd,
  type GuideFaq,
} from "@/components/GuideSections";
import { SSP } from "@/lib/rates";

export const metadata = pageMetadata(
  "/how-much-is-ssp-per-week",
  "How Much is SSP Per Week?",
  "SSP per week worked out for different pay levels: a table of average weekly earnings and the weekly SSP each produces, plus part-week and part-time examples.",
);

const FAQS: GuideFaq[] = [
  {
    question: "Is SSP £123.25 a week for everyone?",
    answer:
      "No. £123.25 is the maximum weekly amount. You receive the lower of that flat rate or 80% of your average weekly earnings, so anyone earning less than about £154 a week receives the 80% figure instead — £80 a week on earnings of £100, for example.",
  },
  {
    question: "How much is SSP per week for a part-time worker?",
    answer:
      "It is worked out the same way: the lower of £123.25 or 80% of the part-time worker's own average weekly earnings. A part-timer earning £120 a week receives £96 a week, paid as a daily rate across their own qualifying days. There is no minimum-earnings test to pass first.",
  },
  {
    question: "What happens when the 28 weeks of SSP run out?",
    answer:
      "SSP stops at the end of the 28-week entitlement. Before it ends, the employer must give the employee form SSP1, which the employee uses to claim other support such as Universal Credit or Employment and Support Allowance (ESA) — ideally in good time, so there is no gap between SSP ending and a new claim starting.",
  },
  {
    question: "Is SSP paid every week?",
    answer:
      "SSP is paid through the normal payroll on your usual payday, so weekly-paid staff see it weekly and monthly-paid staff see it in their monthly pay. Either way, the underlying entitlement is built up at the weekly and daily rates described on this page.",
  },
  {
    question: "Can I get SSP from two jobs at the same time?",
    answer:
      "Yes, potentially. SSP is assessed separately for each employment, so an employee with two jobs can receive SSP from each employer they qualify with, based on the earnings and qualifying days of that job. Each employer's 28-week clock runs on its own.",
  },
];

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const EARNINGS_LEVELS = [80, 100, 120, 140, 160, 200, 300, 500];

export default function HowMuchIsSspPerWeekPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          How much is SSP per week?
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          SSP is {gbp.format(SSP.weeklyCap)} per week at most. The exact
          weekly amount is the lower of that flat rate or{" "}
          {SSP.aweFraction * 100}% of your average weekly earnings: someone
          earning {gbp.format(500)} a week gets {gbp.format(SSP.weeklyCap)},
          while someone earning {gbp.format(100)} a week gets{" "}
          {gbp.format(80)}. It runs from the first full day of sickness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much is SSP per week for a full-time worker?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Most full-time workers earn enough that {SSP.aweFraction * 100}%
          of their pay is more than the flat rate, so their SSP is simply{" "}
          {gbp.format(SSP.weeklyCap)} for each full week of sickness. The
          switch-over point is average earnings of{" "}
          {gbp.format(SSP.weeklyCap / SSP.aweFraction)} a week: at or above
          it, the flat rate applies; below it, the weekly amount drops below{" "}
          {gbp.format(SSP.weeklyCap)} and tracks earnings instead. That is
          why two colleagues off in the same week can receive different
          amounts — the calculation is personal to each employee&apos;s pay,
          as the{" "}
          <Link
            href="/ssp-rate"
            className="font-medium text-brand-800 dark:text-brand-300 underline"
          >
            SSP rate
          </Link>{" "}
          guide explains.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much is SSP per week at different pay levels?
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Average weekly earnings
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  {SSP.aweFraction * 100}% of earnings
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  SSP per week (the lower figure)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EARNINGS_LEVELS.map((awe) => {
                const eighty = awe * SSP.aweFraction;
                const weekly = Math.min(SSP.weeklyCap, eighty);
                return (
                  <tr key={awe}>
                    <td className="px-4 py-2">{gbp.format(awe)}</td>
                    <td className="px-4 py-2">{gbp.format(eighty)}</td>
                    <td className="px-4 py-2 font-medium">
                      {gbp.format(weekly)}
                      {weekly === SSP.weeklyCap ? " (flat rate cap)" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Read the table row by row: find the earnings closest to the
          employee&apos;s average weekly pay, and the right-hand column is
          the weekly SSP. From {gbp.format(160)} of earnings upwards, the
          flat rate has taken over and the weekly amount no longer rises —
          it stays at {gbp.format(SSP.weeklyCap)} however much the employee
          earns.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What if I am off for only part of a week?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Then the weekly amount is broken down into a daily rate and only
          the days of absence are paid. The daily rate is the weekly amount
          divided by your qualifying days — the days you normally work. A
          Monday-to-Friday worker on {gbp.format(500)} a week has a weekly
          SSP amount of {gbp.format(SSP.weeklyCap)} and a daily rate of{" "}
          {gbp.format(24.65)}, so two days off sick pays{" "}
          {gbp.format(49.3)}. Days you would not normally work are never
          paid: a weekend in the middle of a spell does not add anything for
          a Monday-to-Friday worker. Our guide to{" "}
          <Link
            href="/how-much-is-statutory-sick-pay"
            className="font-medium text-brand-800 dark:text-brand-300 underline"
          >
            how much SSP is
          </Link>{" "}
          covers the daily amounts for every working pattern.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: two weeks off sick
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An employee earns {gbp.format(250)} a week and is off sick for two
          full weeks. Step one: {SSP.aweFraction * 100}% of{" "}
          {gbp.format(250)} is {gbp.format(200)}, which is more than the
          flat rate, so the weekly amount is the lower figure —{" "}
          {gbp.format(SSP.weeklyCap)}. Step two: there is nothing to break
          down, because both weeks are complete. The total SSP is two times{" "}
          {gbp.format(SSP.weeklyCap)}, which is {gbp.format(246.5)}, paid
          through the normal payroll across the two pay periods the sickness
          falls in. The same employee off for a third week would receive
          another {gbp.format(SSP.weeklyCap)}, and so on up to the{" "}
          {SSP.maxWeeks}-week maximum.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is the weekly SSP amount the same every week?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Yes, for as long as the sickness lasts and the employee&apos;s
          earnings basis stays the same — the weekly amount is fixed at the
          start of the spell from average weekly earnings and does not drift
          week by week. What can change things is a new spell: if the
          employee returns and goes off again within eight weeks, the spells
          link and the {SSP.maxWeeks}-week limit is shared; after a longer
          gap, a fresh period begins with its own entitlement and the weekly
          amount is worked out again.
        </p>
      </section>

      <SspRatesTable />

      <CalculatorCta />

      <SiblingGuides currentHref="/how-much-is-ssp-per-week" />

      <FaqSection faqs={FAQS} />
    </div>
  );
}
