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
  "/how-much-is-statutory-sick-pay",
  "How Much is Statutory Sick Pay?",
  "How much SSP you get, worked out: up to £123.25 a week, or 80% of your average weekly earnings if that is lower. Weekly and daily amounts with worked examples.",
);

const FAQS: GuideFaq[] = [
  {
    question: "How much SSP do I get for one day off sick?",
    answer:
      "One day's SSP is the daily rate: your weekly SSP amount divided by the number of qualifying days in your working week. A Monday-to-Friday worker on the full flat rate gets £123.25 ÷ 5 = £24.65 for one day. Part-time workers divide by their own qualifying days, so their daily rate is higher but paid on fewer days.",
  },
  {
    question: "How much is SSP after tax?",
    answer:
      "The £123.25 weekly figure is before tax. SSP is paid through payroll and taxed like ordinary wages, along with National Insurance, so the amount that lands in your bank account depends on your tax code and your total pay in that period — many people on SSP alone fall below the tax thresholds and have nothing deducted.",
  },
  {
    question: "Is SSP paid every week?",
    answer:
      "SSP is paid through the normal payroll, on your usual payday — weekly-paid staff receive it weekly, monthly-paid staff receive it in their monthly pay. The amount in each payment covers the qualifying days of sickness that fall in that pay period.",
  },
  {
    question: "How much SSP does a weekend worker get?",
    answer:
      "The same weekly amount as anyone else on the same earnings — the weekly figure does not depend on which days you work. What changes is the daily rate: a Saturday-and-Sunday worker has two qualifying days, so the weekly amount is divided by two and paid for each weekend day of sickness.",
  },
  {
    question: "Can my employer pay more than SSP?",
    answer:
      "Yes. Many employers run a company sick pay scheme that tops SSP up — sometimes to full pay for a period. That is a contractual extra on top of the statutory minimum; the employer can always be more generous than SSP, but never less.",
  },
];

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function HowMuchIsStatutorySickPayPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How much is Statutory Sick Pay?
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Statutory Sick Pay is worth up to {gbp.format(SSP.weeklyCap)} a
          week — but exactly how much you get depends on your pay. You
          receive the lower of {gbp.format(SSP.weeklyCap)} a week or{" "}
          {SSP.aweFraction * 100}% of your average weekly earnings, paid for
          each qualifying day you are off sick, starting from the very first
          full day of sickness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How much is SSP per week?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          There are two possible weekly amounts, and you always get the
          lower one. Earn {gbp.format(500)} a week and {SSP.aweFraction * 100}
          % of your earnings is {gbp.format(400)} — well above the flat
          rate, so your SSP is {gbp.format(SSP.weeklyCap)} a week. Earn{" "}
          {gbp.format(100)} a week and {SSP.aweFraction * 100}% of your
          earnings is {gbp.format(80)} — below the flat rate, so your SSP is{" "}
          {gbp.format(80)} a week. In short: higher earners are capped at
          the flat rate; lower earners receive four-fifths of their normal
          weekly pay. The{" "}
          <Link href="/ssp-rate" className="font-medium text-brand-800 underline">
            SSP rate
          </Link>{" "}
          guide explains where the switch-over happens.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How much is SSP per day?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          SSP is worked out as a weekly amount but paid by the day. The
          daily rate is the weekly amount divided by your qualifying days —
          the days of the week you normally work. At the full flat rate, the
          daily amounts look like this:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 font-semibold text-slate-700">
                  Qualifying days per week
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700">
                  Daily SSP at the flat rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <tr key={d}>
                  <td className="px-4 py-2">
                    {d} day{d > 1 ? "s" : ""} a week
                  </td>
                  <td className="px-4 py-2">{gbp.format(SSP.weeklyCap / d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          If your weekly amount is the {SSP.aweFraction * 100}%-of-earnings
          figure rather than the flat rate, divide that amount by your
          qualifying days instead — the method is identical.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How much will I get for a week off sick?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          For a full Monday-to-Friday week off, a higher earner on{" "}
          {gbp.format(600)} a week receives {gbp.format(123.25)}:{" "}
          {SSP.aweFraction * 100}% of {gbp.format(600)} is{" "}
          {gbp.format(480)}, so the lower figure is the flat rate, and five
          days at the daily rate of {gbp.format(24.65)} comes back to{" "}
          {gbp.format(123.25)}. A lower earner on {gbp.format(120)} a week
          working four qualifying days receives less:{" "}
          {SSP.aweFraction * 100}% of {gbp.format(120)} is{" "}
          {gbp.format(96)} a week, a daily rate of {gbp.format(24)}, so
          three days off in that week pays {gbp.format(72)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How much is SSP if I work part-time?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Part-time staff are treated by the same rules. Your weekly amount
          is still the lower of {gbp.format(SSP.weeklyCap)} or{" "}
          {SSP.aweFraction * 100}% of your own average weekly earnings, and
          your daily rate is that amount divided by your own qualifying
          days. Someone earning {gbp.format(150)} a week over three
          qualifying days gets a weekly amount of {gbp.format(120)} (
          {SSP.aweFraction * 100}% of {gbp.format(150)}) and a daily rate of{" "}
          {gbp.format(40)} — paid only for the days they would normally have
          worked. There is no minimum-earnings hurdle to clear first: the
          lower earnings limit no longer applies. See{" "}
          <Link
            href="/how-much-is-ssp-per-week"
            className="font-medium text-brand-800 underline"
          >
            how much SSP is per week
          </Link>{" "}
          for a full table of earnings and weekly amounts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How long is SSP paid at this rate?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The weekly amount stays the same throughout a sickness spell, and
          SSP can be paid for up to {SSP.maxWeeks} weeks in one period.
          Spells separated by eight weeks or less are linked and share the
          same {SSP.maxWeeks}-week limit. After the entitlement is used up,
          SSP stops — at that point the employer should provide form SSP1 so
          the employee can claim other support.
        </p>
      </section>

      <SspRatesTable />

      <CalculatorCta />

      <SiblingGuides currentHref="/how-much-is-statutory-sick-pay" />

      <FaqSection faqs={FAQS} />
    </div>
  );
}
