import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
  STANDARD_DEDUCTIONS,
  TAX_YEAR,
  type UsPaycheckInput,
} from "@/lib/us-paycheck";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";
import StatePaycheckCluster from "@/components/StatePaycheckCluster";
import RelatedGuides from "@/components/RelatedGuides";

export const metadata: Metadata = pageMetadata(
  "/us/florida-paycheck-calculator",
  "Florida Paycheck Calculator — 2026 Net Pay, No State Income Tax",
  "Free Florida paycheck calculator for 2026: federal income tax and FICA on any salary or hourly pay, with a Florida state income tax line of exactly $0 — worked examples, the tipped-wage rules and every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "FL",
  payType: "salary",
  annualSalary: 80000,
  hourlyRate: 0,
  hoursPerWeek: 0,
  overtimeHoursPerWeek: 0,
  frequency: "biweekly",
  filingStatus: "single",
  dependentsCreditAnnual: 0,
  preTax401kPercent: 0,
  healthPremiumPerPeriod: 0,
  extraWithholdingPerPeriod: 0,
  postTaxDeductionsPerPeriod: 0,
  cityRatePercent: 0,
  schoolRatePercent: 0,
};

// Worked-example figures — computed by the same calculator function
// the tool above runs, so the page can never disagree with itself.
// The running example: $80,000 a year, single, paid every 2 weeks.
const ex80 = calculateUsPaycheck(BASE_INPUT);
// 401(k) worked example: the same $80,000 salary deferring 6% of
// pay — the deferral leaves the income-tax lines alone and cuts
// the federal tax, but Social Security and Medicare are still
// charged on the full salary.
const ex401k = calculateUsPaycheck({
  ...BASE_INPUT,
  preTax401kPercent: 6,
});
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 120000,
  filingStatus: "mfj",
  dependentsCreditAnnual: 4000,
});
const exHealth = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 52000,
  healthPremiumPerPeriod: 150,
});
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 80000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of an $80,000 paycheck in Florida?",
    answer: `On an $80,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex80.grossPerPeriod)} paycheck loses ${fmt(ex80.federalPerPeriod)} of federal income tax, ${fmt(ex80.socialSecurityPerPeriod)} of Social Security and ${fmt(ex80.medicarePerPeriod)} of Medicare — and $0.00 of Florida tax. Net pay is ${fmt(ex80.netPerPeriod)} per paycheck, ${fmt(ex80.netAnnual)} a year. Your own figure moves with your filing status, W-4 and pre-tax deductions; run your numbers in the calculator above.`,
  },
  {
    question: "Does Florida have a state income tax?",
    answer:
      "No. Florida has never levied a personal income tax. Voters wrote a prohibition into the state constitution in 1924, and today's Article VII, Section 5(a) keeps the effective ceiling at zero: it caps any tax on a natural person's income at the amount creditable against a similar federal tax — a credit that does not exist, so the cap is zero in practice. The Florida Department of Revenue states it plainly in its guide for new residents (GT-800025): “Florida does not impose personal income tax, inheritance tax, gift taxes, or tax on intangible personal property.” There is no Florida withholding on your pay stub and no Florida individual tax return to file on wages. Florida does tax corporations (5.5%) — that is a business tax, never withheld from an employee's pay.",
  },
  {
    question: "Are there any local income taxes in Florida — Miami, Orlando, Tampa?",
    answer:
      "No. No Florida city, county or school district levies an income tax, so there are no local lines on a Florida pay stub and no local fields in the calculator above. Local government in Florida is funded mainly through property taxes and the county discretionary sales surtax, not through your paycheck.",
  },
  {
    question: "Why is take-home pay higher in Florida than in Georgia or New York on the same salary?",
    answer:
      "Because the state line is $0. The federal maths is identical in every state — same brackets, same standard deduction, same FICA — so the entire difference is the state (and, in New York's case, city) income tax that a Florida paycheck never loses. On a $100,000 salary that missing layer is worth several thousand dollars a year compared with a taxed state. Two cautions keep the comparison honest: the other state's exact saving depends on its brackets and your filing status, and Florida recovers revenue elsewhere — through its 6% sales tax plus county surtax and through property taxes — so compare total cost of living, not just the pay stub.",
  },
  {
    question: "I am moving to Florida for work. When does the state tax stop?",
    answer:
      "Florida tax never starts — there is nothing to stop on the Florida side, and no Florida return to file. What changes is your old state: most taxed states tax you while you are resident there and on income sourced there, so a mid-year move usually means a part-year return in the old state for the part of the year you lived or worked there, and federal-only withholding once your job and residence are genuinely in Florida. Tell your employer promptly so withholding follows your new work state, keep evidence of the move date, and expect the first Florida stubs to show federal tax, Social Security and Medicare only.",
  },
  {
    question: "How are tips and service charges taxed on a Florida paycheck?",
    answer:
      "Tips you receive are wages for federal purposes: your employer withholds federal income tax and FICA on reported tips exactly as on hourly pay, and Florida adds nothing. A mandatory service charge is not a tip — it is regular wages paid by the employer, withheld on the same way. The Florida floor underneath is the state minimum wage: $14.00 an hour through September 29, 2026, then $15.00 from September 30, 2026. Employers may take a tip credit of $3.02 an hour, paying a direct cash wage of $10.98 (then $11.98), only if tips bring you up to the full minimum — if they do not, the employer must make up the difference. Seasonal and tourism work follows the same rules; what varies is hours, not the tax lines.",
  },
  {
    question: "What are the Social Security and Medicare rates in Florida in 2026?",
    answer: `The federal rates, identical nationwide: Social Security 6.2% of wages up to the ${fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base, Medicare 1.45% of all wages, plus 0.9% Additional Medicare Tax on wages over $200,000 single / $250,000 married filing jointly / $125,000 married filing separately. Your employer matches 6.2% and 1.45% on top — that never comes out of your pay. Florida's one payroll tax, the reemployment tax, is also employer-only (new employers pay 2.7% on the first $7,000 of wages); by law it cannot be deducted from your wages, so an employee's FICA lines are the last tax lines on the stub.`,
  },
  {
    question: "How does a 401(k) change a Florida paycheck?",
    answer: `A traditional 401(k) deferral comes out before federal income tax but not before Social Security and Medicare — and with no Florida tax, those are the only lines it can touch. On this page's $80,000 salary, single and paid every 2 weeks, deferring 6% (${fmt(ex401k.preTax401kAnnual)} a year) cuts the federal tax from ${fmt(ex80.federalAnnual)} to ${fmt(ex401k.federalAnnual)} — a saving of ${fmt(ex80.federalAnnual - ex401k.federalAnnual)} — while Social Security and Medicare stay at ${fmt(ex401k.socialSecurityAnnual + ex401k.medicareAnnual)}, charged on the full salary. Take-home falls by ${fmt(ex80.netAnnual - ex401k.netAnnual)}: the deferral itself, minus the tax it saved. A Roth 401(k) deferral works the other way — taxed now, so nothing is saved on this year's checks. Set the 401(k) percentage in the calculator above to run your own rate.`,
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
  name: "Florida Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/florida-paycheck-calculator`,
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
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

export default function FloridaPaycheckCalculatorPage() {
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
          Florida Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Florida has <strong>no state income tax</strong>, so a Florida
          paycheck loses only federal income tax and FICA. On an $80,000
          salary, single and paid every two weeks in {TAX_YEAR}, federal
          tax is {fmt(ex80.federalAnnual)}, Social Security{" "}
          {fmt(ex80.socialSecurityAnnual)} and Medicare{" "}
          {fmt(ex80.medicareAnnual)} — net pay {fmt(ex80.netPerPeriod)}{" "}
          per paycheck, {fmt(ex80.netAnnual)} a year.
        </p>
      </section>

      <UsPaycheckCalculator state="FL" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $80,000 in Florida, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex80.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex80.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex80.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex80.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Florida state income tax</td>
                <td className={tdClass}>{fmt(0)} — Florida has none</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex80.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex80.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The year&apos;s taxable income is the $80,000 salary minus
          the {fmt(STANDARD_DEDUCTIONS.single)} standard deduction —
          $63,900 — sliced at 10%, 12% and 22%: {fmt(ex80.federalAnnual)}{" "}
          of federal tax for the year, an effective rate of{" "}
          {ex80.effectiveTaxRatePercent.toFixed(2)}% across all three
          taxes. Two more cases from the same calculator: a married
          couple filing jointly on $120,000 with $4,000 of W-4 Step 3
          credits keeps {fmt(exMfj.netAnnual)} a year; and a single
          filer on $52,000 paying $150 a paycheck in pre-tax health
          premiums keeps {fmt(exHealth.netAnnual)} — the premium cuts
          the federal tax and the FICA as well as the pay. Whether you
          searched for a Florida paycheck calculator or a paycheck
          calculator for Florida, the working is the same — and the
          state line is always zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Adding a 401(k): what actually changes on the check
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The most common Florida paycheck question after the tax
          itself is what a retirement deferral does to take-home
          pay. A traditional 401(k) contribution is taken out
          before federal income tax is figured, but Social Security
          and Medicare are still charged on the full salary — and
          since Florida has no income tax of its own, the federal
          line is the only tax line that moves. The same $80,000
          salary, deferring 6%:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Line</th>
                <th className={thClass}>No 401(k)</th>
                <th className={thClass}>Deferring 6%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>401(k) deferral</td>
                <td className={tdClass}>$0</td>
                <td className={tdClass}>{fmt(ex401k.preTax401kAnnual)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>{fmt(ex80.federalAnnual)}</td>
                <td className={tdClass}>{fmt(ex401k.federalAnnual)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security and Medicare</td>
                <td className={tdClass}>
                  {fmt(ex80.socialSecurityAnnual + ex80.medicareAnnual)}
                </td>
                <td className={tdClass}>
                  {fmt(
                    ex401k.socialSecurityAnnual + ex401k.medicareAnnual,
                  )}{" "}
                  — unchanged
                </td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Take-home per year</td>
                <td className={tdClass}>{fmt(ex80.netAnnual)}</td>
                <td className={tdClass}>{fmt(ex401k.netAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The deferral is {fmt(ex401k.preTax401kAnnual)} but
          take-home only falls by{" "}
          {fmt(ex80.netAnnual - ex401k.netAnnual)} — the difference
          is the {fmt(ex80.federalAnnual - ex401k.federalAnnual)} of
          federal tax the deferral removed. In a state with an
          income tax there would usually be a second saving on the
          state line; in Florida there is no state line to save on,
          which is the whole Florida story in one table.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $80,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>Net per period</th>
                <th className={thClass}>Net per year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {frequencyRows.map(({ frequency, result }) => (
                <tr
                  key={frequency.id}
                  className={
                    frequency.id === "biweekly"
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>
                    {frequency.label} ({frequency.periodsPerYear}× a year)
                  </td>
                  <td className={tdClass}>{fmt(result.grossPerPeriod)}</td>
                  <td className={tdClass}>−{fmt(result.federalPerPeriod)}</td>
                  <td className={tdClass}>
                    −
                    {fmt(
                      result.socialSecurityPerPeriod +
                        result.medicarePerPeriod,
                    )}
                  </td>
                  <td className={tdClass}>{fmt(result.netPerPeriod)}</td>
                  <td className={tdClass}>{fmt(result.netAnnual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The annual tax is identical however often you are paid — only
          the slicing changes. If two offers quote different
          frequencies, compare the per-year column, not the size of one
          check.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at common Florida salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Florida tax / year</th>
                <th className={thClass}>Net / paycheck</th>
                <th className={thClass}>Net / year</th>
                <th className={thClass}>Effective rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {salaryRows.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 80000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>{fmt(salary)}</td>
                  <td className={tdClass}>{fmt(result.federalAnnual)}</td>
                  <td className={tdClass}>
                    {fmt(
                      result.socialSecurityAnnual + result.medicareAnnual,
                    )}
                  </td>
                  <td className={tdClass}>{fmt(0)}</td>
                  <td className={tdClass}>{fmt(result.netPerPeriod)}</td>
                  <td className={tdClass}>{fmt(result.netAnnual)}</td>
                  <td className={tdClass}>
                    {result.effectiveTaxRatePercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Single, paid every 2 weeks, no pre-tax deductions, {TAX_YEAR}{" "}
          rates. The missing column is the point: in a state with a 5%
          income tax, every row would lose roughly another
          $2,000–$9,000 to the state. Social Security stops at the{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base — in the $200,000
          row the FICA column grows by Medicare alone.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A ban older than the paycheck: why Florida has no income tax
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Florida has never taxed personal income, and in 1924 voters
          made sure it could not start quietly: an amendment to the
          state constitution (then Article IX, Section 11) provided
          that no tax on inheritances or on the income of residents or
          citizens shall be levied by the state. The provision survives
          today as Article VII, Section 5(a), which caps any tax on a
          natural person&apos;s income at the amount creditable against
          a similar federal tax — a credit that does not exist, so the
          cap is zero in practice. Changing it would take another
          constitutional amendment approved by voters. The same
          settlement shed Florida&apos;s other personal levy much
          later: the annual intangible personal property tax on stocks,
          bonds and mutual funds was repealed effective January 1, 2007
          (Florida DOR TIP 07C02-01). For an employee the result is
          total: no state withholding, no state form at hiring, no
          state return in April — the mirror image of our{" "}
          <Link href="/us/texas-paycheck-calculator" className={linkClass}>
            Texas paycheck calculator
          </Link>
          , the other big no-tax state in this set.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          The trade-off: tourism, sales tax and the property bill
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Florida pays its bills from spending and property, not wages
          — and visitors pay a large share. The state sales tax is 6%,
          and most counties add a discretionary surtax, so the rate at
          the register depends on the county; transient rentals and
          tourism purchases feed the same system, which is how a state
          of residents with no income tax funds itself from an economy
          millions of visitors pass through. For residents the bigger
          offset is the property tax: homes are assessed annually by
          the county property appraiser and taxed locally.
          Owner-occupiers get real protection — a homestead exemption
          of up to $50,000 off assessed value, and the Save Our Homes
          cap limiting assessment rises to 3% or inflation, whichever
          is lower — but insurance and non-homestead property costs
          sit outside those protections. The honest summary: the
          paycheck advantage is immediate and certain; the offsetting
          costs depend on whether you rent or own, and where.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Seasonal, tourism and tipped work
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A larger share of Florida jobs rises and falls with the
          season — hospitality, attractions, restaurants, retail — so
          the common Florida pay question is less “what is my salary?”
          than “what does a variable week annualize to?” The
          calculator handles it the way payroll does: hourly rate ×
          hours (overtime at 1.5×), annualized, with the same three
          federal lines and a $0 state line however the hours move.
          Two Florida specifics matter. First, the wage floor moves
          mid-year in {TAX_YEAR}: $14.00 an hour until September 29,
          then $15.00 from September 30 — a raise many hourly workers
          will see without changing jobs. Second, tipped work: the
          $3.02 tip credit lets employers pay $10.98 cash (then
          $11.98) only while tips carry the worker to the full
          minimum; reported tips are taxed as wages for federal income
          tax and FICA; and a mandatory service charge is wages, not a
          tip. None of it creates a Florida tax line — but all of it
          changes the gross the federal lines are figured on.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Florida?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          With no state withholding to run, Florida payroll is the
          federal calendar plus the employer-side reemployment tax
          reports.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          works out the federal withholding on every run and files the
          returns from the same figures, so payday and the quarterly
          filings stay in step.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay, and
          providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Methodology and sources
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculator annualizes: it works out the tax on a full
          year of pay — gross income, less pre-tax deductions, less
          the {TAX_YEAR} standard deduction ({fmt(STANDARD_DEDUCTIONS.single)}{" "}
          single, {fmt(STANDARD_DEDUCTIONS.mfj)} married filing
          jointly, {fmt(STANDARD_DEDUCTIONS.hoh)} head of household,{" "}
          {fmt(STANDARD_DEDUCTIONS.mfs)} married filing separately),
          through the {TAX_YEAR} federal brackets, less any W-4 Step 3
          credits and Step 4 adjustments — then divides by your pay
          periods. That is the method the mainstream paycheck
          calculators use, and for a full year in one job it lands on
          the same annual figures as the IRS Publication 15-T
          percentage method your employer applies period by period;
          individual stubs can differ slightly. FICA follows the
          Social Security Administration&apos;s {TAX_YEAR} wage base
          of {fmt(SOCIAL_SECURITY_WAGE_BASE)}. The Florida line is $0
          because Florida levies no personal income tax (Florida
          Department of Revenue, GT-800025) and no Florida locality
          levies one either.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR});
          Social Security Administration, Contribution and Benefit
          Base ({TAX_YEAR}); Florida Department of Revenue GT-800025
          (no personal income tax), the Reemployment Tax rate page and
          RT-800058 (employer-only, never deducted from wages), and
          TIP 07C02-01 (intangible tax repeal); Florida Constitution,
          Article VII, Section 5(a). Tax rules verified 22 November
          2026. This calculator is an estimate, not tax advice — your
          employer&apos;s payroll and your own tax return are the
          final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            One job, held all year, paid at a steady rate, on a{" "}
            {TAX_YEAR} Form W-4 with the Step 2 multiple-jobs box
            unchecked unless your entries say otherwise.
          </li>
          <li>
            The standard deduction only — no itemizing, and no credits
            beyond any W-4 Step 3 amount you enter.
          </li>
          <li>
            Pre-tax treatment follows payroll: a 401(k) reduces the
            federal income-tax wages only; §125 health premiums and
            HSA contributions through the plan reduce the federal and
            FICA wages.
          </li>
          <li>
            Bonuses and irregular overtime are withheld by employers
            under supplemental and per-period rules and can make a
            single stub differ; the annual totals still reconcile at
            filing.
          </li>
          <li>
            No garnishments, union dues or other deductions beyond the
            ones you enter.
          </li>
        </ul>
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

      <StatePaycheckCluster state="FL" />
      <RelatedCalculators href="/us/florida-paycheck-calculator" />
      <RelatedGuides
        guides={[
          {
            href: "/blog/take-home-pay",
            title: "Take-Home Pay, Explained",
            description:
              "Our in-depth guide to how take-home pay is figured — what comes off before an employee is paid, and how to check a payslip line by line.",
          },
        ]}
      />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
