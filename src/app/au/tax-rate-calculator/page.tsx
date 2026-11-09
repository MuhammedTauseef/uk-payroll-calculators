import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import AuTaxRateCalculator from "@/components/AuTaxRateCalculator";
import {
  calculateAuTax,
  MEDICARE_LEVY_RATE,
  NON_RESIDENT_BRACKETS,
  RESIDENT_BRACKETS,
  TAX_YEAR_LABEL,
} from "@/lib/au-tax";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/au/tax-rate-calculator",
  "Australia Tax Rate Calculator — 2025–26 Rates",
  "Free Australia tax rate calculator for 2025–26: income tax and the Medicare levy on any income, your marginal and effective tax rate — ATO resident and non-resident rates.",
);

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

function fmt(n: number): string {
  return aud.format(n);
}

// Worked-example figures — computed by the same calculator function
// the tool above runs, so the page can never disagree with itself.
// The running example: $90,000 a year, Australian resident,
// Medicare levy applies.
const ex90 = calculateAuTax({
  taxableIncome: 90000,
  residency: "resident",
  medicareLevyApplies: true,
});
const exNonRes100 = calculateAuTax({
  taxableIncome: 100000,
  residency: "nonResident",
  medicareLevyApplies: false,
});
const comparison = [50000, 90000, 150000].map((s) => ({
  income: s,
  result: calculateAuTax({
    taxableIncome: s,
    residency: "resident",
    medicareLevyApplies: true,
  }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the tax rate on $90,000 in Australia?",
    answer: `There is no single rate — Australian tax is sliced into brackets. On $90,000 as a resident in ${TAX_YEAR_LABEL} the income tax is ${fmt(ex90.incomeTax)} and the Medicare levy is ${fmt(ex90.medicareLevy)}, a total of ${fmt(ex90.totalTax)}, leaving ${fmt(ex90.netIncome)}. The marginal rate is ${ex90.marginalTaxRatePercent.toFixed(0)}% (the rate on the next dollar earned, ${ex90.marginalRatePercent.toFixed(0)}% including the levy), while the effective rate — the slice of the whole income paid in tax — is ${ex90.effectiveTaxRatePercent.toFixed(2)}%. Run your own income through the calculator above.`,
  },
  {
    question:
      "What is the difference between my marginal and effective tax rate?",
    answer: `Your marginal rate is the rate charged on your NEXT dollar of income — the top bracket you have reached. Your effective rate is your total tax divided by your whole income, and it is always lower, because the first dollars are taxed at lower rates or not at all. On $90,000 the marginal income-tax rate is ${ex90.marginalTaxRatePercent.toFixed(0)}% but the effective rate is ${ex90.effectiveTaxRatePercent.toFixed(2)}% including the Medicare levy (${((ex90.incomeTax / 90000) * 100).toFixed(2)}% for income tax alone). A pay rise is only ever taxed at the marginal rate on the extra amount — never at that rate on your whole salary.`,
  },
  {
    question: "What is the Medicare levy, and who pays it?",
    answer:
      "The Medicare levy is an extra 2% of your taxable income that helps fund Australia's public health system. Most Australian residents pay it on top of their income tax. Foreign residents are not required to pay it (ATO), and some residents in exemption categories pay none. There is also a levy reduction for low incomes that phases the levy in just above the low-income threshold — this calculator charges the full 2% whenever the levy applies and does not model that reduction, so on low incomes it can overstate the levy; the ATO applies the reduction in your tax return. The Medicare levy is separate from the Medicare levy surcharge, which can add 1%–1.5% for higher earners without private hospital cover and is not included here.",
  },
  {
    question: "How much tax do non-residents pay in Australia?",
    answer: `Non-residents (foreign residents for tax purposes) get no tax-free threshold: in ${TAX_YEAR_LABEL} they pay 30c on every dollar up to $135,000, then 37c and 45c at the higher brackets, and they do not pay the Medicare levy. On $100,000 of Australian income that is ${fmt(exNonRes100.incomeTax)} of tax, leaving ${fmt(exNonRes100.netIncome)} — an effective rate of ${exNonRes100.effectiveTaxRatePercent.toFixed(2)}%, far more than a resident pays on the same income. Working holiday makers are taxed under their own schedule, which is not covered here.`,
  },
  {
    question: "Do these figures include tax offsets, like LITO?",
    answer:
      "No. The figures are the ATO rate tables applied directly to the income you enter — the same starting point the ATO's own published rates give. Tax offsets reduce the final bill for many people: the low income tax offset (LITO) is worth up to $700 for residents and phases out completely by $66,667 of income. HELP/HECS repayments, the Medicare levy surcharge and other assessment items are also outside the tables. Treat the result as the tax on your income before those adjustments; your notice of assessment has the final figures.",
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
  name: "Australia Tax Rate Calculator",
  url: `${AppConfig.siteUrl}/au/tax-rate-calculator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

export default function AuTaxRateCalculatorPage() {
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
          Australia Tax Rate Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          In {TAX_YEAR_LABEL} an Australian resident on $90,000 pays{" "}
          {fmt(ex90.incomeTax)} of income tax plus {fmt(ex90.medicareLevy)}{" "}
          of Medicare levy — {fmt(ex90.totalTax)} in total, leaving{" "}
          {fmt(ex90.netIncome)}: an effective tax rate of{" "}
          {ex90.effectiveTaxRatePercent.toFixed(2)}% and a marginal rate
          of {ex90.marginalRatePercent.toFixed(0)}%. Enter your own
          income below; the rates update instantly.
        </p>
      </section>

      <AuTaxRateCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The $90,000 breakdown, line by line
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Taxable income</td>
                <td className="px-4 py-2">{fmt(ex90.taxableIncome)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Income tax (ATO {TAX_YEAR_LABEL} resident rates)
                </td>
                <td className="px-4 py-2">−{fmt(ex90.incomeTax)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Medicare levy at {(MEDICARE_LEVY_RATE * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2">−{fmt(ex90.medicareLevy)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className="px-4 py-2">Net (after-tax) income</td>
                <td className="px-4 py-2">{fmt(ex90.netIncome)} a year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Whether you searched for a tax rate calculator for Australia
          or an Australian tax calculator, the working is the same:
          only the slice of income inside each bracket is taxed at
          that bracket&apos;s rate — the first $18,200 is taxed at
          zero, the next slice at 16c in the dollar, and so on up.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Tax rates at other Australian incomes
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Taxable income
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Income tax
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Medicare levy
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Net income
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Effective rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparison.map(({ income, result }) => (
                <tr
                  key={income}
                  className={
                    income === 90000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className="px-4 py-2">{fmt(income)}</td>
                  <td className="px-4 py-2">{fmt(result.incomeTax)}</td>
                  <td className="px-4 py-2">{fmt(result.medicareLevy)}</td>
                  <td className="px-4 py-2">{fmt(result.netIncome)}</td>
                  <td className="px-4 py-2">
                    {result.effectiveTaxRatePercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Australian resident, Medicare levy applies, {TAX_YEAR_LABEL}{" "}
          rates, before tax offsets. Watch the effective rate climb
          far more slowly than the headline bracket rates — that gap
          is the bracket system doing its job.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Australian income tax is worked out
        </h2>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          1. Brackets and the tax-free threshold
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Residents pay no tax on the first $18,200 (the tax-free
          threshold), then 16c in the dollar up to $45,000, 30c to
          $135,000, 37c to $190,000 and 45c above that. Each rate
          applies only to the income inside its bracket — earning
          $135,001 does not put your whole salary into the 37c
          bracket, just that one extra dollar. Non-residents have no
          threshold and pay 30c from the first dollar.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          2. Marginal rate vs effective rate
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The marginal rate is what your next dollar is taxed at —
          the bracket you currently sit in, plus the 2% Medicare levy
          when it applies. The effective rate is your total tax
          divided by your total income: the average across every
          bracket you passed through. The effective rate is the one
          that describes your actual tax bill; the marginal rate is
          the one that prices a pay rise, a bonus or extra hours.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          3. The Medicare levy
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On top of income tax, most residents pay the Medicare levy
          at 2% of taxable income. Foreign residents are not required
          to pay it, and some residents are exempt. The ATO also
          reduces the levy for low incomes, phasing it in just above
          the low-income threshold — this calculator charges the full
          2% whenever the levy applies and does not model that
          reduction, so at low incomes it may show slightly more levy
          than an assessment would. Tax offsets such as the low
          income tax offset are likewise applied by the ATO in your
          return, not in the rate tables this calculator uses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Australia tax rates used by this calculator ({TAX_YEAR_LABEL})
        </h2>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Resident rates
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Taxable income
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Tax on this income
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RESIDENT_BRACKETS.map((b) => (
                <tr key={b.range}>
                  <td className="px-4 py-2">{b.range}</td>
                  <td className="px-4 py-2">{b.taxOnIncome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Non-resident (foreign resident) rates
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Taxable income
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Tax on this income
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NON_RESIDENT_BRACKETS.map((b) => (
                <tr key={b.range}>
                  <td className="px-4 py-2">{b.range}</td>
                  <td className="px-4 py-2">{b.taxOnIncome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: Australian Taxation Office, “Tax rates – Australian
          resident” and “Tax rates – foreign resident” (ato.gov.au),
          tables for the {TAX_YEAR_LABEL} income year. The ATO
          resident tables do not include the Medicare levy of 2%,
          which this calculator adds when it applies. The ATO has
          also published resident rates for 2026–27 (the second
          bracket falls to 15c in the dollar); this calculator uses
          the complete {TAX_YEAR_LABEL} tables for both residencies.
          Last verified: 9 November 2026. Figures are the rate tables
          applied before tax offsets — your actual assessment can
          differ.
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
            href="/us/texas-paycheck-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Texas Paycheck Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The hub&apos;s US section: net pay on a Texas salary
              under the IRS rules — federal withholding, Social
              Security and Medicare, and a state income tax line of
              exactly $0.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the US calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              £40k After Tax UK
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The UK side of this hub: take-home pay on a £40,000 UK
              salary after Income Tax and National Insurance, with a
              calculator that works for any salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the UK calculator →
            </span>
          </Link>
          <Link
            href="/payslip-generator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Generator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Turn UK pay figures into a payslip document — gross pay,
              Income Tax, National Insurance and net pay, ready to
              print or save as a PDF.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the generator →
            </span>
          </Link>
          <Link
            href="/blog/take-home-pay"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay, Explained
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Our in-depth guide to how take-home pay is figured — what
              comes off before you are paid, and how to check a payslip
              line by line.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Read the guide →
            </span>
          </Link>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Comparing an offer across countries? This Australia page
          uses the ATO {TAX_YEAR_LABEL} rules; the Texas page uses
          the IRS 2026 rules and the UK tools use the April 2026 UK
          rules. The{" "}
          <Link href="/blog/take-home-pay" className={linkClass}>
            take-home pay guide
          </Link>{" "}
          explains the moving parts on each side.
        </p>
      </section>
    </div>
  );
}
