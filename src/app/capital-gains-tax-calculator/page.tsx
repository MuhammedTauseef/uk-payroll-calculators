import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CapitalGainsCalculator from "@/components/CapitalGainsCalculator";
import { calculateCapitalGains } from "@/lib/capital-gains";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/capital-gains-tax-calculator",
  "Capital Gains Tax Calculator — 18% and 24% Rates for 2026/27",
  "Free Capital Gains Tax calculator: the tax on a gain at the 2026/27 rates — £3,000 annual exempt amount, 18% inside the basic-rate band and 24% above it — using GOV.UK's own method and worked examples.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Worked examples — GOV.UK's own for 2026/27, computed by the same
// function the calculator runs, so the page can never disagree with
// itself (or with GOV.UK: £1,728 and £10,842 respectively).
const exOne = calculateCapitalGains({ otherIncome: 32570, totalGains: 12600 });
const exTwo = calculateCapitalGains({ otherIncome: 32570, totalGains: 52600 });

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Capital Gains Tax in 2026/27?",
    answer:
      "18% on gains that fall inside the basic-rate Income Tax band, and 24% on gains above it — the same pair of rates for residential property and for other assets since 30 October 2024. The first £3,000 of gains in the year is tax-free (the annual exempt amount). GOV.UK's own example: taxable income of £20,000 and a £12,600 gain gives £1,728 of tax.",
  },
  {
    question: "How is Capital Gains Tax calculated?",
    answer:
      "In GOV.UK's order: work out your taxable income (income minus Personal Allowance), take your total gains, deduct the £3,000 annual exempt amount, then stack the remaining gain on top of your taxable income. Whatever fits in the unused part of the £37,700 basic-rate band is taxed at 18%; the rest at 24%. Your other income therefore decides your CGT rate as much as the gain does.",
  },
  {
    question: "What is the Capital Gains Tax allowance for 2026/27?",
    answer:
      "£3,000 — the annual exempt amount. Gains up to that total in a tax year are tax-free. It is per person, not per asset, and it cannot be carried forward: an unused allowance in one year is lost. A spouse or civil partner has their own £3,000, and assets can be transferred between spouses without a gain arising, which is why couples often split a sale.",
  },
  {
    question: "Do I pay Capital Gains Tax when I sell my home?",
    answer:
      "Usually not. Private Residence Relief covers your only or main home for the period you lived in it (plus the final 9 months of ownership), so most home sales are exempt. CGT can apply to a second home, a buy-to-let, or a period when the property was let out or left empty — and residential property gains must be reported and paid within 60 days of completion.",
  },
  {
    question: "When do I report and pay Capital Gains Tax?",
    answer:
      "For residential property, within 60 days of the completion date, using HMRC's Capital Gains Tax on UK property service. For other gains, through Self Assessment by 31 January after the tax year — though you can report in real time through the Capital Gains Tax service instead. Interest and penalties run from the deadline, not from the tax return.",
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
  name: "Capital Gains Tax Calculator",
  url: `${AppConfig.siteUrl}/capital-gains-tax-calculator`,
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

export default function CapitalGainsTaxCalculatorPage() {
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
          Capital Gains Tax Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Capital Gains Tax for 2026/27 is 18% on the part of a gain
          inside your basic-rate band and 24% above it, after a
          £3,000 tax-free allowance. On GOV.UK&apos;s own example —
          £20,000 of taxable income and a £12,600 gain — the bill is{" "}
          {gbp.format(exOne.taxDue)}.
        </p>
      </section>

      <CapitalGainsCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Capital Gains Tax is worked out
        </h2>
        <p className={bodyClass}>
          GOV.UK&apos;s method stacks the gain on top of your income,
          which is why the same gain is taxed differently in different
          years. The two published worked examples for 2026/27, both
          with taxable income of £20,000 (an income of £32,570 with the
          full Personal Allowance):
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Step</th>
                <th className={thClass}>Gain of £12,600</th>
                <th className={thClass}>Gain of £52,600</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>After the £3,000 allowance</td>
                <td className={tdClass}>{gbp.format(exOne.taxableGain)}</td>
                <td className={tdClass}>{gbp.format(exTwo.taxableGain)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Taxed at 18% (band left: £17,700)</td>
                <td className={tdClass}>
                  {gbp.format(exOne.gainAtLowerRate)}
                </td>
                <td className={tdClass}>
                  {gbp.format(exTwo.gainAtLowerRate)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Taxed at 24%</td>
                <td className={tdClass}>
                  {gbp.format(exOne.gainAtHigherRate)}
                </td>
                <td className={tdClass}>
                  {gbp.format(exTwo.gainAtHigherRate)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Capital Gains Tax</td>
                <td className={tdClass}>{gbp.format(exOne.taxDue)}</td>
                <td className={tdClass}>{gbp.format(exTwo.taxDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Three levers move the bill, and all three are timing. The
          allowance renews every 6 April, so a sale split across two
          tax years can use two allowances. Your income in the year of
          the sale sets how much gain sits at 18% — a gain realised in
          a low-income year (between jobs, or after retiring) is taxed
          more lightly than the same gain in a peak-earnings year. And
          losses on other assets sold in the same year offset gains
          before the allowance is applied, provided they are reported
          to HMRC.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What this calculator does not cover
        </h2>
        <p className={bodyClass}>
          Business Asset Disposal Relief charges qualifying business
          gains at 18% flat for disposals from 6 April 2026 (within a
          £1 million lifetime limit) — if you are selling a business,
          that relief, not the band calculation, decides your rate.
          Losses brought forward from earlier years, gains split with
          a spouse, and trust gains (24% flat) are also outside the
          standard calculation. Directors weighing a sale against
          salary and dividends will find the income side on the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          and the employer cost side on the{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>
          .
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates, the £3,000 annual exempt amount and the worked
          examples are from GOV.UK, “Capital Gains Tax — rates and
          allowances”, checked 17 November 2026. This calculator is an
          estimate on the standard rates; a sale with reliefs or
          losses needs the full Self Assessment computation.
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

      <RelatedCalculators href="/capital-gains-tax-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
