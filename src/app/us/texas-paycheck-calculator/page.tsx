import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TexasPaycheckCalculator from "@/components/TexasPaycheckCalculator";
import { calculateTexasPaycheck } from "@/lib/texas-paycheck";
import {
  ADDITIONAL_MEDICARE_THRESHOLD,
  SOCIAL_SECURITY_WAGE_BASE,
  TAX_YEAR,
  WORKSHEET_1A_AMOUNT,
} from "@/lib/texas-paycheck";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/us/texas-paycheck-calculator",
  "Texas Paycheck Calculator — 2026 Net Pay",
  "Free Texas paycheck calculator for 2026: federal withholding, Social Security and Medicare on any salary or hourly pay — with $0 Texas state income tax.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

// Worked-example figures — computed by the same calculator function
// the tool above runs, so the page can never disagree with itself.
// The running example: $60,000 a year, single, paid every 2 weeks.
const ex60 = calculateTexasPaycheck({
  payType: "salary",
  annualSalary: 60000,
  hourlyRate: 0,
  hoursPerWeek: 0,
  frequency: "biweekly",
  filingStatus: "single",
  dependentCreditsAnnual: 0,
  preTaxPerPeriod: 0,
});
const comparison = [40000, 60000, 80000, 100000].map((s) => ({
  salary: s,
  result: calculateTexasPaycheck({
    payType: "salary",
    annualSalary: s,
    hourlyRate: 0,
    hoursPerWeek: 0,
    frequency: "biweekly",
    filingStatus: "single",
    dependentCreditsAnnual: 0,
    preTaxPerPeriod: 0,
  }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a paycheck in Texas?",
    answer: `On a $60,000 salary, single and paid every 2 weeks, the ${TAX_YEAR} deductions are ${fmt(ex60.federalPerPeriod)} of federal income tax, ${fmt(ex60.socialSecurityPerPeriod)} of Social Security and ${fmt(ex60.medicarePerPeriod)} of Medicare out of each ${fmt(ex60.grossPerPeriod)} paycheck — ${fmt(ex60.totalDeductionsAnnual)} over the year, an effective tax rate of ${ex60.effectiveTaxRatePercent.toFixed(2)}%. The Texas state line is $0.00: there is no state income tax to withhold. Your own figures depend on your pay, filing status and Form W-4 — run them through the calculator above.`,
  },
  {
    question: "Does Texas have a state income tax?",
    answer:
      "No. Texas levies no state income tax on wages, so nothing is withheld from a Texas paycheck for the state and there is no state tax return to file on your pay. The only taxes taken out are federal: federal income tax withholding, plus Social Security and Medicare (FICA). That is the single biggest reason a Texas paycheck is larger than the same salary paid in a state with an income tax.",
  },
  {
    question: "How is federal withholding worked out on a Texas paycheck?",
    answer: `The same way as in every other state — Texas changes nothing about the federal calculation. Employers use the IRS percentage method in Publication 15-T: your pay for the period is annualised, the Form W-4 worksheet amount (${fmt(WORKSHEET_1A_AMOUNT.other)} for most filers, ${fmt(WORKSHEET_1A_AMOUNT.married)} if married filing jointly) is subtracted, the ${TAX_YEAR} rate tables for your filing status are applied, and any Step 3 credits on your W-4 come off the tax. This calculator follows that method exactly, assuming a current Form W-4 with the Step 2 box not checked.`,
  },
  {
    question: "What are the Social Security and Medicare rates in 2026?",
    answer: `For ${TAX_YEAR}, Social Security tax is 6.2% of wages up to the wage base of ${fmt(SOCIAL_SECURITY_WAGE_BASE)} — earnings above that are not charged Social Security tax. Medicare tax is 1.45% of all wages with no cap, and an extra 0.9% Additional Medicare Tax is withheld on wages over ${fmt(ADDITIONAL_MEDICARE_THRESHOLD)} in the year (employee only — there is no employer match on the extra 0.9%). Your employer pays matching 6.2% and 1.45% shares on top, but those never come out of your pay.`,
  },
  {
    question: "Why is take-home pay higher in Texas than in other states?",
    answer:
      "Because the state line is missing. Federal income tax and FICA are identical wherever you live, but a state income tax takes a second slice: at around 5%, a state tax would take roughly $3,000 a year off a $60,000 salary before that state's own allowances — in Texas that line is simply $0. The trade-off sits outside the paycheck: Texas funds itself through other taxes, notably higher property taxes and its 6.25% state sales tax, so compare the whole cost of living, not just the pay stub.",
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
  name: "Texas Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/texas-paycheck-calculator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

export default function TexasPaycheckCalculatorPage() {
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
          Texas Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A Texas paycheck has <strong>no state income tax</strong> taken
          out — the state line is $0 — so your net pay is what is left
          after federal income tax withholding and FICA. On a $60,000
          salary, single and paid every 2 weeks, that is{" "}
          {fmt(ex60.netPerPeriod)} net per paycheck in {TAX_YEAR}. Enter
          your own pay below and the breakdown updates instantly.
        </p>
      </section>

      <TexasPaycheckCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The $60,000 breakdown, line by line
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Gross pay (every 2 weeks)</td>
                <td className="px-4 py-2">{fmt(ex60.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Federal income tax withheld</td>
                <td className="px-4 py-2">−{fmt(ex60.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Social Security at 6.2%</td>
                <td className="px-4 py-2">
                  −{fmt(ex60.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Medicare at 1.45%</td>
                <td className="px-4 py-2">−{fmt(ex60.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Texas state income tax</td>
                <td className="px-4 py-2">{fmt(0)} — Texas has none</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className="px-4 py-2">Net pay</td>
                <td className="px-4 py-2">
                  {fmt(ex60.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex60.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Whether you searched for a Texas paycheck calculator or a
          paycheck calculator for Texas, the working is the same: the
          federal lines are figured exactly as the IRS prescribes, and
          the state line is the easiest one on the page — always zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at other Texas salaries
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Federal tax / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  FICA / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Net / paycheck
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Net / year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparison.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 60000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className="px-4 py-2">{fmt(salary)}</td>
                  <td className="px-4 py-2">{fmt(result.federalAnnual)}</td>
                  <td className="px-4 py-2">
                    {fmt(
                      result.socialSecurityAnnual + result.medicareAnnual,
                    )}
                  </td>
                  <td className="px-4 py-2">{fmt(result.netPerPeriod)}</td>
                  <td className="px-4 py-2">{fmt(result.netAnnual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Single, paid every 2 weeks, no pre-tax deductions, {TAX_YEAR}{" "}
          rates. Notice the state column that is not there: in a state
          with an income tax, every row would show a fourth deduction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How a Texas paycheck is worked out
        </h2>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          1. Federal income tax withholding
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Your employer follows the IRS percentage method (Publication
          15-T). Your taxable pay for the period is annualised, the
          Form W-4 worksheet amount — {fmt(WORKSHEET_1A_AMOUNT.married)}{" "}
          if married filing jointly, {fmt(WORKSHEET_1A_AMOUNT.other)}{" "}
          otherwise — is subtracted, and the {TAX_YEAR} rate table for
          your filing status gives the annual withholding. Credits from
          Step 3 of your W-4 (the dependent credits) come straight off
          that figure. Pre-tax deductions such as a traditional 401(k)
          reduce the pay this tax is figured on.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          2. Social Security and Medicare (FICA)
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          FICA is charged on gross pay, before the 401(k) adjustment:
          Social Security at 6.2% up to the {TAX_YEAR} wage base of{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}, and Medicare at 1.45% on
          every dollar, plus a further 0.9% on wages over{" "}
          {fmt(ADDITIONAL_MEDICARE_THRESHOLD)} in the year. Your
          employer matches the 6.2% and the 1.45% out of its own pocket
          — that share never touches your paycheck.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          3. Why Texas take-home pay runs higher
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Federal tax and FICA are the same in all 50 states. What Texas
          skips is the state layer entirely: no state withholding, no
          state return on wages. The saving is real — thousands of
          dollars a year at typical salaries against a mid-rate income
          tax state — but it is a paycheck comparison, not a total tax
          comparison: Texas raises more from property and sales taxes
          instead.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rates used by this calculator ({TAX_YEAR})
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  {TAX_YEAR} figure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Federal income tax</td>
                <td className="px-4 py-2">
                  IRS percentage method tables (Pub. 15-T), 10%–37% by
                  filing status
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Social Security</td>
                <td className="px-4 py-2">
                  6.2% on wages up to {fmt(SOCIAL_SECURITY_WAGE_BASE)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Medicare</td>
                <td className="px-4 py-2">
                  1.45% on all wages, plus 0.9% on wages over{" "}
                  {fmt(ADDITIONAL_MEDICARE_THRESHOLD)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Texas state income tax</td>
                <td className="px-4 py-2">{fmt(0)} — no state income tax</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Publication 15-T ({TAX_YEAR}) and Publication 15
          ({TAX_YEAR}); Social Security Administration wage base. Last
          verified: 9 November 2026. This calculator is an estimate
          based on a standard Form W-4 (Step 2 box not checked, no
          Step 4 adjustments) — your actual withholding can differ.
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
            href="/overtime-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Overtime Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Work out overtime pay at the rate in a UK contract — flat,
              time and a half or double time — from an hourly rate or a
              salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Comparing an offer across the Atlantic? The UK figures in
          these tools use the April 2026 UK rules; this Texas page uses
          the IRS {TAX_YEAR} rules. The{" "}
          <Link href="/blog/take-home-pay" className={linkClass}>
            take-home pay guide
          </Link>{" "}
          explains the moving parts on both sides.
        </p>
      </section>
    </div>
  );
}
