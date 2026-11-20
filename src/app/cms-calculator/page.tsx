import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CmsCalculator from "@/components/CmsCalculator";
import {
  calculateCms,
  CMS_BASIC_RATES,
  CMS_DEFAULT_RATES,
  CMS_LAST_VERIFIED,
  CMS_LEGISLATION_URL,
  CMS_OTHER_CHILDREN_REDUCTION,
  CMS_REDUCED_T,
  CMS_REGULATIONS_URL,
  CMS_SHARED_CARE_BANDS,
  CMS_SOURCE_URL,
} from "@/lib/cms";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = pageMetadata(
  "/cms-calculator",
  "CMS Calculator — Child Maintenance Service Payments",
  "CMS calculator: estimate child maintenance from gross income using the official Child Maintenance Service rates, including shared care and other children.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const exampleTwoChildren = calculateCms({
  grossWeeklyIncome: 1000,
  qualifyingChildren: 2,
  otherChildren: 0,
  receivesBenefits: false,
  sharedCareNights: 0,
  collectAndPay: false,
});

const exampleSharedCare = calculateCms({
  grossWeeklyIncome: 500,
  qualifyingChildren: 1,
  otherChildren: 0,
  receivesBenefits: false,
  sharedCareNights: 80,
  collectAndPay: false,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much child maintenance should I pay?",
    answer:
      "It depends on the paying parent's gross weekly income, how many children the maintenance is for, any other children living with the paying parent, and how many nights a year the children stay overnight with them. On £500 a week gross with one child and no shared care, the basic rate gives £60 a week. The Child Maintenance Service works out the actual figure from the paying parent's HMRC income record — this calculator follows the same rules to give you the likely amount.",
  },
  {
    question: "What income does the CMS use to work out child maintenance?",
    answer:
      "The paying parent's gross yearly income, taken from HMRC — before tax and National Insurance, but after pension contributions are taken into account where they apply. The CMS converts it into a weekly figure and applies the rates to that. Gross weekly income above £3,000 is ignored by the formula; for income above that level the receiving parent can apply to the court for extra child maintenance on top.",
  },
  {
    question: "Does shared care reduce child maintenance?",
    answer:
      "Yes, on the reduced and basic rates. Overnight stays with the paying parent of 52 to 103 nights a year reduce the amount by about 14.29% (one seventh), 104 to 155 nights by 28.57%, 156 to 174 nights by 42.86%, and 175 or more nights by half, with a further £7 a week off per child. Shared care cannot take the amount below £7 a week. Stays below 52 nights a year do not change the amount.",
  },
  {
    question: "What are the Collect & Pay fees?",
    answer:
      "If the Child Maintenance Service collects the money itself (Collect & Pay), the paying parent pays an extra 20% on top of the maintenance and the receiving parent has 4% deducted from what they receive. Direct Pay — where the CMS works out the amount and the parents pay each other directly — has no collection fees, which is why the same weekly figure can cost one parent more and pay the other less under Collect & Pay.",
  },
  {
    question: "What happens if the paying parent has other children?",
    answer:
      "Children who live with the paying parent (their own children in that household) reduce the income the calculation uses before the percentages are applied: gross weekly income is treated as reduced by 11% for one other child, 14% for two and 16% for three or more. The reduction applies to the basic rate; the reduced rate has its own table of percentages that already takes other children into account.",
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
  name: "CMS Calculator",
  url: `${AppConfig.siteUrl}/cms-calculator`,
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

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

export default function CmsCalculatorPage() {
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
          CMS Calculator (Child Maintenance Service)
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          This CMS calculator estimates weekly child maintenance under
          the Child Maintenance Service rules. Enter the paying
          parent&apos;s gross income, the number of children, any other
          children in their household and shared-care nights, and it
          applies the official rates — nil, flat, reduced or basic — to
          give a weekly, monthly and yearly figure.
        </p>
      </section>

      <CmsCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Self-employed? Your books are the starting figure
        </h2>
        <p className={bodyClass}>
          The CMS works from the paying parent&apos;s HMRC income
          record — for a self-employed parent, that is the income on
          their tax return, which is only as accurate as the books
          behind it. Income that is never invoiced or recorded does
          not just understate the tax bill; it understates the child
          maintenance calculation built on it, and the receiving
          parent can ask the CMS to look at income and assets the
          return does not show. Keeping complete books as you go —{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          records every invoice and expense through the year — means
          the figure the CMS starts from is the real one.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does the Child Maintenance Service work out child
          maintenance?
        </h2>
        <p className={bodyClass}>
          The Child Maintenance Service (CMS) follows a set sequence.
          First it finds the paying parent&apos;s yearly gross income
          from HMRC and converts it into a weekly figure. It then
          checks things that can change that figure — pension payments,
          and other children the paying parent supports. One of the five
          rates is applied based on the gross weekly income. The number
          of children the maintenance covers, and any children living
          with the paying parent, are taken into account, and finally
          shared care — the nights the children stay overnight with the
          paying parent — can reduce the weekly amount. The result is
          the weekly child maintenance figure, reviewed every year.
        </p>
        <p className={bodyClass}>
          Either parent can also ask for a variation — for extra income,
          assets or certain expenses to be taken into account — but the
          standard calculation above is what most cases start from, and
          it is the calculation this tool follows. If you want the
          paying parent&apos;s gross weekly figure from a yearly salary
          before you start, the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows gross and net side by side for any UK salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the five CMS rates?
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Gross weekly income</th>
                <th className={thClass}>Rate</th>
                <th className={thClass}>Weekly amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Unknown or not provided</td>
                <td className={tdClass}>Default</td>
                <td className={tdClass}>
                  £{CMS_DEFAULT_RATES[0]} for 1 child, £
                  {CMS_DEFAULT_RATES[1]} for 2 children, £
                  {CMS_DEFAULT_RATES[2]} for 3 or more children
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Below £7</td>
                <td className={tdClass}>Nil</td>
                <td className={tdClass}>£0</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  £7 to £100, or the paying parent receives benefits
                </td>
                <td className={tdClass}>Flat</td>
                <td className={tdClass}>£7</td>
              </tr>
              <tr>
                <td className={tdClass}>£100.01 to £199.99</td>
                <td className={tdClass}>Reduced</td>
                <td className={tdClass}>Worked out by a formula (below)</td>
              </tr>
              <tr>
                <td className={tdClass}>£200 to £3,000</td>
                <td className={tdClass}>Basic</td>
                <td className={tdClass}>Worked out by a formula (below)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The basic rate is a percentage of gross weekly income. The
          first £800 is charged at the higher percentage; anything above
          £800 is charged at a lower one:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Children the maintenance is for</th>
                <th className={thClass}>On the first £800 a week</th>
                <th className={thClass}>On income above £800 a week</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {["1 child", "2 children", "3 or more children"].map(
                (label, i) => (
                  <tr key={label}>
                    <td
                      className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                    >
                      {label}
                    </td>
                    <td className={tdClass}>{CMS_BASIC_RATES.first800[i]}%</td>
                    <td className={tdClass}>{CMS_BASIC_RATES.above800[i]}%</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Gross weekly income above £3,000 is ignored by the formula.
          Where the paying parent&apos;s income is above that level, the
          receiving parent can apply to the court for extra child
          maintenance on top of the CMS amount.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: GOV.UK,{" "}
          <a
            href={CMS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          >
            How the Child Maintenance Service works out child maintenance
          </a>
          , and the Child Support Act 1991, Schedule 1 on{" "}
          <a
            href={CMS_LEGISLATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          >
            legislation.gov.uk
          </a>
          . Last verified: {CMS_LAST_VERIFIED}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do other children change the calculation?
        </h2>
        <p className={bodyClass}>
          If the paying parent has other children living with them, the
          CMS reduces the gross weekly income used in the basic-rate
          calculation before the percentages are applied: by{" "}
          {CMS_OTHER_CHILDREN_REDUCTION[1]}% for one other child,{" "}
          {CMS_OTHER_CHILDREN_REDUCTION[2]}% for two and{" "}
          {CMS_OTHER_CHILDREN_REDUCTION[3]}% for three or more. The same
          idea is built into the reduced rate differently — there, the
          percentage charged on income between £100 and £200 comes from
          a table that already takes other children into account:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Children the maintenance is for</th>
                <th className={thClass}>No other children</th>
                <th className={thClass}>1 other child</th>
                <th className={thClass}>2 other children</th>
                <th className={thClass}>3+ other children</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {["1 child", "2 children", "3 or more children"].map(
                (label, i) => (
                  <tr key={label}>
                    <td
                      className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                    >
                      {label}
                    </td>
                    {CMS_REDUCED_T[i].map((t) => (
                      <td key={t} className={tdClass}>
                        {t.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The reduced rate is £7 plus that percentage of the income
          between £100 and £200 — so at £150 a week with one child and
          no other children, the amount is £7 plus 17% of £50, which is
          £15.50 a week before any shared-care reduction.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reduced-rate percentages: the Child Support Maintenance
          Calculation Regulations 2012, regulation 43, on{" "}
          <a
            href={CMS_REGULATIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          >
            legislation.gov.uk
          </a>
          . Last verified: {CMS_LAST_VERIFIED}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does shared care reduce child maintenance?
        </h2>
        <p className={bodyClass}>
          Shared care means the children stay overnight with the paying
          parent. On the reduced and basic rates, the CMS reduces the
          weekly amount according to the number of agreed overnight
          stays in a year:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Overnight stays each year</th>
                <th className={thClass}>Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {CMS_SHARED_CARE_BANDS.map((band) => (
                <tr key={band.min}>
                  <td className={tdClass}>
                    {band.max === Infinity
                      ? `${band.min} nights or more`
                      : `${band.min} to ${band.max} nights`}
                  </td>
                  <td className={tdClass}>
                    {band.percent}%{band.min === 175 ? ", plus a further £7 a week off for each child" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          A worked example: on £500 a week gross with one child, the
          basic rate is £60 a week. With 80 shared-care nights a year —
          inside the 52 to 103 band — the amount comes down by one
          seventh to {gbp.format(exampleSharedCare.weekly)} a week.
          Shared care cannot take the amount below £7 a week, and below
          52 nights a year it makes no difference. On the flat rate,
          overnight stays only matter where the paying parent receives
          benefits: at 52 or more nights, nothing is payable for a child
          who stays overnight.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does a worked example look like?
        </h2>
        <p className={bodyClass}>
          Take a paying parent earning {gbp.format(1000)} a week gross
          (£52,000 a year) with two children, no other children in their
          household and no shared care. The income is in the basic-rate
          band, and two children are charged at{" "}
          {CMS_BASIC_RATES.first800[1]}% on the first £800 and{" "}
          {CMS_BASIC_RATES.above800[1]}% above it:{" "}
          {gbp.format((800 * CMS_BASIC_RATES.first800[1]) / 100)} plus{" "}
          {gbp.format((200 * CMS_BASIC_RATES.above800[1]) / 100)} gives{" "}
          {gbp.format(exampleTwoChildren.weekly)} a week, which is{" "}
          {gbp.format(exampleTwoChildren.monthly)} a month. The same
          method with one child on £500 a week gives £60 a week — 12% of
          £500 — and on £1,000 a week with one child it gives £114 a
          week: £96 on the first £800, plus £18 on the remaining £200.
          Try your own figures in the calculator above.
        </p>
        <p className={bodyClass}>
          How the money is paid matters too. Under Direct Pay the CMS
          works out the amount and the parents pay each other, with no
          fees. Under Collect &amp; Pay the CMS collects the money: the
          paying parent pays 20% on top of the maintenance and the
          receiving parent has 4% deducted, so on a £60 weekly figure
          the paying parent would pay £72.00 and the receiving parent
          would receive £57.60. Family arrangements outside the CMS have
          no set formula at all — this calculator only follows the CMS
          rules.
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
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What any UK salary leaves after Income Tax and National
              Insurance — and the gross weekly figure the CMS starts
              from.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/paternity-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Paternity Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory paternity pay and leave, week by week, from your
              salary and start date.
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
              Pro-Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Part-time pay from any full-time salary, by hours or days —
              useful when work patterns change after a separation.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/annual-leave-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Annual Leave Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Holiday entitlement for any work pattern, including
              part-year and irregular hours.
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
