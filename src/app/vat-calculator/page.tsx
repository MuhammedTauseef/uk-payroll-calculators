import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import VatCalculator from "@/components/VatCalculator";
import { calculateVat } from "@/lib/vat";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/vat-calculator",
  "VAT Calculator UK — Add or Remove VAT at 20%, 5% or 0%",
  "Free UK VAT calculator: add VAT to a net price or strip it out of a gross price at the 20% standard rate, 5% reduced rate or 0%, with the UK VAT rates, manual formulas and worked examples explained.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const addExample = calculateVat({ amount: 100, ratePercent: 20, mode: "add" });
const removeExample = calculateVat({
  amount: 240,
  ratePercent: 20,
  mode: "remove",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I add 20% VAT to a price?",
    answer:
      "Multiply the net price by 1.2. The answer is the gross price including VAT, and the difference between the two is the VAT itself. For example, £100 × 1.2 = £120, so the VAT on £100 at 20% is £20.",
  },
  {
    question: "How do I remove VAT from a price?",
    answer:
      "Divide the gross price by 1.2 to get back to the net price at the 20% rate. For example, £240 ÷ 1.2 = £200 net, which means £40 of the £240 is VAT. At the 5% reduced rate, divide by 1.05 instead.",
  },
  {
    question: "What is the VAT fraction at 20%?",
    answer:
      "At the 20% standard rate, the VAT inside a VAT-inclusive price is 1/6 of the total. So on a £120 receipt, the VAT is £120 ÷ 6 = £20. At the 5% reduced rate the fraction is 1/21 of the gross price.",
  },
  {
    question: "What are the UK VAT rates?",
    answer:
      "There are three rates: 20% standard, which covers most goods and services; 5% reduced, for things such as domestic energy and energy-saving materials; and 0% zero-rated, for most food, children's clothes, books and newspapers, and passenger transport. Some supplies, such as insurance and health services, are exempt — that is not the same as 0%, because exempt businesses cannot reclaim VAT on their costs.",
  },
  {
    question: "When does a business have to register for VAT?",
    answer:
      "You must register when your VAT-taxable turnover passes £90,000 in any rolling 12-month period, or you expect it to pass £90,000 in the next 30 days alone. You can also register voluntarily below the threshold, which lets you reclaim VAT on your costs.",
  },
  {
    question: "Is a calculator enough to do my VAT return?",
    answer:
      "A calculator gives you the VAT on a single price. A VAT return needs every sale and purchase recorded through the quarter, and under Making Tax Digital for VAT those records must be kept digitally and the return filed through compatible software — HMRC no longer accepts returns typed into its old online form.",
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
  name: "VAT Calculator UK",
  url: `${AppConfig.siteUrl}/vat-calculator`,
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

export default function VatCalculatorPage() {
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
          VAT Calculator UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Add VAT to a net price or take it back out of a gross price at
          the UK rates: 20% standard, 5% reduced or 0%, or any custom
          rate. Below the calculator you will find what each rate covers,
          the formulas for working VAT out by hand, and what to do once
          the numbers feed into a VAT return.
        </p>
      </section>

      <VatCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          UK VAT rates: what falls in each one
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Rate</th>
                <th className={thClass}>Charged on</th>
                <th className={thClass}>Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Standard — 20%
                </td>
                <td className={tdClass}>Most goods and services</td>
                <td className={tdClass}>
                  Adult clothing, electronics, furniture, restaurant meals
                  eaten in, professional and trade services
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Reduced — 5%
                </td>
                <td className={tdClass}>
                  A short list of essentials and energy measures
                </td>
                <td className={tdClass}>
                  Home energy (gas and electricity), energy-saving
                  materials and installations, children&apos;s car seats,
                  some health and welfare products
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Zero — 0%
                </td>
                <td className={tdClass}>
                  Necessities the law keeps tax-free
                </td>
                <td className={tdClass}>
                  Most food, children&apos;s clothes, books and newspapers,
                  passenger transport, prescriptions dispensed by a chemist
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Exempt
                </td>
                <td className={tdClass}>
                  No VAT charged — and none reclaimable on related costs
                </td>
                <td className={tdClass}>
                  Insurance, most finance, health services by registered
                  professionals, education, postage stamps
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Zero-rated and exempt are easy to confuse, but they are very
          different for a business. A zero-rated sale is still a taxable
          sale at 0%, so the business can reclaim VAT on its costs. An
          exempt sale is outside the VAT system: no VAT is charged, and
          VAT on costs that relate to it generally cannot be reclaimed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to calculate VAT manually
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>To add VAT</strong>, multiply the net amount by 1 plus
          the rate as a decimal: at 20%, net × 1.2. A net price of{" "}
          {gbp.format(addExample.net)} becomes {gbp.format(addExample.gross)},
          of which {gbp.format(addExample.vat)} is VAT. At the 5% reduced
          rate, multiply by 1.05 instead.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>To remove VAT</strong> from a price that already
          includes it, divide by the same factor: at 20%, gross ÷ 1.2. A
          receipt for {gbp.format(removeExample.gross)} contains{" "}
          {gbp.format(removeExample.vat)} of VAT and a net price of{" "}
          {gbp.format(removeExample.net)}. The shortcut is the VAT
          fraction: at 20% the VAT inside a gross price is exactly 1/6 of
          it, and at 5% it is 1/21.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If you are working out what you owe HMRC for a period, the same
          maths runs over your totals: VAT charged on sales (output tax)
          minus VAT you paid on business purchases (input tax) is the
          amount on the return.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          After the calculation: VAT records and returns
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A single calculation is only the start. If your taxable
          turnover passes £90,000 in any rolling 12 months you must
          register for VAT, charge it on your sales, keep VAT records and
          file returns — usually every quarter. Under Making Tax Digital
          for VAT, those records have to be kept digitally and the return
          sent through compatible accounting software; HMRC no longer
          accepts returns typed into its old online form. Good software
          keeps the VAT on every invoice as you go, so the quarterly
          return is a check rather than a reconstruction.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          For keeping those digital records and filing the return
          itself,{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            Zoho Books
          </a>{" "}
          records the VAT on every invoice as you raise it and files
          MTD VAT returns from the same figures, so the quarterly
          return is ready when the deadline comes.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay, and
          providers cannot pay to be ranked or included.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Selling your time rather than goods? The payroll side of a
          growing business has its own maths — the{" "}
          <Link
            href="/employer-cost-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            employer cost calculator
          </Link>{" "}
          shows what a salary really costs on top of the headline pay.
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

      <section className="space-y-3">
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          This calculator is a guide to the arithmetic, not tax advice.
          VAT treatment depends on exactly what is being supplied — if a
          sale could fall between rates, check the GOV.UK VAT guidance or
          ask an accountant before you invoice.
        </p>
      </section>

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/employer-cost-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer Cost Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What a salary really costs your business once employer NI
              and pension are added — the other big number next to VAT.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/employer-national-insurance-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer National Insurance Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Employer Class 1 NICs on a salary at 2026/27 rates, with
              the Employment Allowance.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/ir35-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              IR35 Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Inside or outside IR35: compare a contractor day rate as
              employment against a limited company.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Drawing a salary from your company? See what it leaves
              after Income Tax and National Insurance.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
