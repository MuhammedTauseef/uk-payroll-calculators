import Link from "next/link";
import { RATES_LAST_VERIFIED, RATES_RULES_LABEL, SSP } from "@/lib/rates";

/**
 * Shared building blocks for the SSP guide pages.
 *
 * The guides use exactly the same sections, card styles and rates dating
 * as the SSP calculator page (answer-first answers, a rates table with
 * the "last verified" line, FAQ cards with FAQPage JSON-LD) — they are
 * defined once here so all five guides stay identical in shape, and the
 * figures always come from src/lib/rates.ts, the single source of truth.
 */

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export interface GuideFaq {
  question: string;
  answer: string;
}

/** The five SSP guides — used for sibling links and the home page cards. */
export const SSP_GUIDES = [
  {
    href: "/what-is-statutory-sick-pay",
    title: "What is Statutory Sick Pay?",
    description:
      "What SSP is, who pays it, who qualifies and how long it lasts — the plain-English starting point for UK sick pay.",
  },
  {
    href: "/how-much-is-statutory-sick-pay",
    title: "How much is Statutory Sick Pay?",
    description:
      "The weekly and daily amounts worked out: the £123.25 cap, the 80%-of-earnings rule, and what different workers actually receive.",
  },
  {
    href: "/ssp-rate",
    title: "SSP Rate",
    description:
      "The current SSP rate, why your pay might be less than the headline figure, and when the rate changes.",
  },
  {
    href: "/how-much-is-ssp-per-week",
    title: "How much is SSP per week?",
    description:
      "Weekly SSP at different pay levels — a table of earnings and the weekly amount each one produces, for full-time and part-time workers.",
  },
  {
    href: "/how-is-ssp-calculated",
    title: "How is SSP calculated?",
    description:
      "The three-step calculation — weekly amount, daily rate, days payable — walked through step by step with worked examples.",
  },
] as const;

/** FAQPage JSON-LD for a guide's FAQ list (same shape as the SSP page). */
export function faqJsonLd(faqs: GuideFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** The FAQ card section, identical in style to the SSP calculator page. */
export function FaqSection({ faqs }: { faqs: GuideFaq[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div
            key={f.question}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {f.question}
            </h3>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700">
              {f.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The SSP rates table with the site's standard "last verified" dating. */
export function SspRatesTable() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">
        SSP rates at a glance
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2 font-semibold text-slate-700">Rule</th>
              <th className="px-4 py-2 font-semibold text-slate-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-2">SSP flat weekly rate (the maximum)</td>
              <td className="px-4 py-2">{gbp.format(SSP.weeklyCap)} per week</td>
            </tr>
            <tr>
              <td className="px-4 py-2">SSP alternative weekly amount</td>
              <td className="px-4 py-2">
                {SSP.aweFraction * 100}% of average weekly earnings — you get
                whichever of the two is lower
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Paid from</td>
              <td className="px-4 py-2">
                The first full day of sickness — no waiting days
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Lower earnings limit</td>
              <td className="px-4 py-2">
                None — there is no minimum earnings threshold
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Maximum entitlement</td>
              <td className="px-4 py-2">
                {SSP.maxWeeks} weeks in one (linked) period of sickness
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">
        Rates: {RATES_RULES_LABEL}. Last verified: {RATES_LAST_VERIFIED}.
      </p>
    </section>
  );
}

/** Call-to-action card sending guide readers to the SSP calculator. */
export function CalculatorCta() {
  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
      <h2 className="text-xl font-semibold text-brand-900">
        Work out your own SSP
      </h2>
      <p className="mt-1 max-w-2xl text-base leading-relaxed text-brand-900/80">
        Enter the employee&apos;s average weekly earnings and the days they
        normally work, and the free SSP calculator shows the weekly rate,
        the daily rate and the total payable — with the working shown.
      </p>
      <Link
        href="/ssp-calculator"
        className="mt-4 inline-block rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
      >
        Open the SSP calculator →
      </Link>
    </section>
  );
}

/** Links to the other SSP guides (every guide links its siblings). */
export function SiblingGuides({ currentHref }: { currentHref: string }) {
  const others = SSP_GUIDES.filter((g) => g.href !== currentHref);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">More SSP guides</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {g.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {g.description}
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Read the guide →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
