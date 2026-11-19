import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  BRACKET_RATES,
  BRACKET_TOPS,
  calculateUsPaycheck,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
  STANDARD_DEDUCTIONS,
  TAX_YEAR,
  type UsPaycheckInput,
} from "@/lib/us-paycheck";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/us/texas-paycheck-calculator",
  "Texas Paycheck Calculator — 2026 Net Pay, No State Income Tax",
  "Free Texas paycheck calculator for 2026: federal income tax and FICA (Social Security and Medicare) on any salary or hourly pay, with a Texas state income tax line of exactly $0 — worked examples at every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "TX",
  payType: "salary",
  annualSalary: 100000,
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
// The running example: $100,000 a year, single, paid every 2 weeks.
const ex100 = calculateUsPaycheck(BASE_INPUT);
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

function bracketRows(status: "single" | "mfj") {
  const tops = BRACKET_TOPS[status];
  return BRACKET_RATES.map((rate, i) => {
    const lower = i === 0 ? 0 : tops[i - 1];
    const label =
      i < tops.length
        ? `${fmt(lower)} to ${fmt(tops[i])}`
        : `Over ${fmt(lower)}`;
    return { label, rate: `${(rate * 100).toFixed(0)}%` };
  });
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $100,000 paycheck in Texas?",
    answer: `On a $100,000 salary, single and paid every 2 weeks, the ${TAX_YEAR} deductions per paycheck are ${fmt(ex100.federalPerPeriod)} of federal income tax, ${fmt(ex100.socialSecurityPerPeriod)} of Social Security and ${fmt(ex100.medicarePerPeriod)} of Medicare out of each ${fmt(ex100.grossPerPeriod)} paycheck — net pay of ${fmt(ex100.netPerPeriod)} every 2 weeks, ${fmt(ex100.netAnnual)} a year. The Texas state line is $0.00. Your own figures depend on your pay, filing status and Form W-4 — run them through the calculator above.`,
  },
  {
    question: "Does Texas have a state income tax?",
    answer:
      "No. Texas levies no state income tax on wages, so nothing is withheld from a Texas paycheck for the state and there is no state tax return to file on your pay. The only taxes taken out are federal: federal income tax, plus Social Security and Medicare (FICA). A 2019 constitutional amendment (Proposition 4) goes further and prohibits Texas from ever introducing a personal income tax without repealing that ban — the no-income-tax rule is written into the Texas Constitution, not just the tax code.",
  },
  {
    question: "Are there any local income taxes in Texas?",
    answer:
      "No. Unlike states such as Ohio, where cities and school districts levy their own income taxes on top of the state tax, no Texas city, county or school district charges an income tax. Your paycheck deductions in Texas are the federal lines and nothing else — which is why the calculator above has no city or district fields on this page.",
  },
  {
    question: "What are the Social Security and Medicare rates in 2026?",
    answer: `For ${TAX_YEAR}, Social Security tax is 6.2% of wages up to the wage base of ${fmt(SOCIAL_SECURITY_WAGE_BASE)} — earnings above that are not charged Social Security tax. Medicare tax is 1.45% of all wages with no cap, and an extra 0.9% Additional Medicare Tax applies on wages over $200,000 for a single filer ($250,000 married filing jointly, $125,000 married filing separately). Your employer pays matching 6.2% and 1.45% shares on top, but those never come out of your pay. A pre-tax health premium reduces the wages both taxes are figured on; a 401(k) contribution does not.`,
  },
  {
    question: "Why is my actual Texas paycheck slightly different from this estimate?",
    answer:
      "This calculator works on annual figures — it figures the tax on a full year of income and divides by your pay periods, the same annualized approach the big commercial paycheck calculators use. Your employer instead withholds period by period under the IRS Publication 15-T percentage method, using the exact Form W-4 you filed. A Step 2 box checked for multiple jobs, Step 4 adjustments, a mid-year start, bonuses withheld at the flat 22% supplemental rate, or uneven hourly pay all move the real stub a little. The annual totals land close; treat any single paycheck as an estimate.",
  },
  {
    question: "If Texas has no income tax, how does the state pay for things?",
    answer:
      "Mainly through consumption and property taxes instead. The state sales tax is 6.25%, and cities, counties and transit authorities can add up to 2% more, for a combined rate of up to 8.25% in much of the state. Property taxes are the other big leg: Texas has no state property tax, but local taxing units — counties, cities, school districts and special districts — set rates that produce some of the highest property tax bills in the country, commonly around 1.5% or more of a home's value each year. The paycheck is untouched; the trade-off arrives in the tax bill on the house and at the register.",
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
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

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
          out — the state line is $0 — so net pay is what is left after
          federal income tax and FICA. On a $100,000 salary, single and
          paid every 2 weeks, that is {fmt(ex100.netPerPeriod)} net per
          paycheck in {TAX_YEAR}, {fmt(ex100.netAnnual)} a year. Enter
          your own pay below; the calculator updates instantly.
        </p>
      </section>

      <UsPaycheckCalculator state="TX" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $100,000 in Texas, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex100.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex100.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex100.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex100.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Texas state income tax</td>
                <td className={tdClass}>{fmt(0)} — Texas has none</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex100.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex100.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The federal figure is the one worth understanding. The
          year&apos;s taxable income is the $100,000 salary minus the{" "}
          {fmt(STANDARD_DEDUCTIONS.single)} standard deduction for a
          single filer — $83,900 — and the {TAX_YEAR} brackets slice it
          at 10%, 12% and 22%: {fmt(ex100.federalAnnual)} of federal tax
          for the year, an effective rate of{" "}
          {ex100.effectiveTaxRatePercent.toFixed(2)}% across all three
          taxes even though the marginal federal bracket is{" "}
          {ex100.marginalFederalRatePercent.toFixed(0)}%. You keep{" "}
          {ex100.keepCentsPerDollar.toFixed(1)}¢ of every $1. Whether you
          searched for a Texas paycheck calculator or a paycheck
          calculator for Texas, the working is the same — and the state
          line is the easiest one on the page: always zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $100,000 salary at every pay frequency
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
          the slicing changes. Weekly pay spreads the same{" "}
          {fmt(ex100.federalAnnual)} of federal tax across 52 smaller
          checks; monthly pay concentrates it into 12 larger ones. If
          two offers quote different frequencies, compare the per-year
          column, not the size of one check.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at common Texas salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Texas tax / year</th>
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
                    salary === 100000
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
          rates. Two things stand out. First, the missing column: in a
          state with a 5% income tax, every row would lose roughly
          another $2,000–$9,000 to the state. Second, Social Security
          stops at the {fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base — in
          the $200,000 row the FICA column grows by Medicare alone,
          which is why the effective rate climbs more slowly at the
          top.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Why Texas has no state income tax
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Texas has never levied a broad personal income tax, and since
          November 2019 it effectively cannot start: voters approved
          Proposition 4, a constitutional amendment that prohibits the
          legislature from imposing an income tax on individuals. The
          Texas Comptroller of Public Accounts — the agency that
          administers the taxes Texas does levy — lists no individual
          income tax among them; the state&apos;s business franchise
          tax is charged to companies, not withheld from wages. For an
          employee the practical result is simple: no state withholding
          on the pay stub, no state return to file on salary or wages,
          and no state payment to budget for in April.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          What is still withheld from a Texas paycheck
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Everything federal. Federal income tax is withheld under the
          IRS rules using your Form W-4: your filing status, the Step 3
          credits for dependents, and any extra withholding you asked
          for in Step 4. Social Security takes 6.2% of wages up to{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} in {TAX_YEAR}, and Medicare
          takes 1.45% of every dollar, with a further 0.9% on
          high wages. Pre-tax deductions change the base, not the
          rates: a traditional 401(k) contribution reduces the wages
          federal income tax is figured on but not the FICA wages,
          while a pre-tax health insurance premium reduces both — the
          calculator above models each one the way payroll does.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          No local income taxes, either
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The zero is total. Some states stack city, county and
          school-district income taxes on top of the state tax — our{" "}
          <Link href="/us/ohio-paycheck-calculator" className={linkClass}>
            Ohio paycheck calculator
          </Link>{" "}
          has two extra fields for exactly that reason. Texas has none
          of it: no city of Houston, Dallas, Austin or San Antonio
          income tax, no county layer, nothing. If you move to Texas
          from a city-tax state, the local lines on your old pay stub
          simply disappear.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          The trade-off: sales and property taxes
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Texas funds itself differently, and an honest comparison has
          to say so. The state sales tax rate is 6.25%, and local
          jurisdictions can add up to 2 percentage points, so most
          Texans pay 8.25% on taxable purchases. Property taxes are
          set locally — by counties, cities, school districts and
          special districts — and produce some of the highest bills in
          the country relative to home value, which is why two
          households on the same salary can fare very differently
          depending on whether they rent or own. The paycheck
          advantage is real and immediate; the offsetting costs arrive
          through the house and the shopping basket, not the pay stub.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Federal income tax brackets for {TAX_YEAR}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          These are the IRS brackets the calculator applies, after the
          standard deduction — {fmt(STANDARD_DEDUCTIONS.single)} single,{" "}
          {fmt(STANDARD_DEDUCTIONS.mfj)} married filing jointly,{" "}
          {fmt(STANDARD_DEDUCTIONS.hoh)} head of household,{" "}
          {fmt(STANDARD_DEDUCTIONS.mfs)} married filing separately.
          Each rate applies only to the income inside its band.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Single filers
        </h3>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bracketRows("single").map((r) => (
                <tr key={r.label}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={tdClass}>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Married filing jointly
        </h3>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bracketRows("mfj").map((r) => (
                <tr key={r.label}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={tdClass}>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Methodology and sources
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculator annualizes: it works out the tax on a full
          year of pay — gross income, less pre-tax deductions, less
          the {TAX_YEAR} standard deduction, through the {TAX_YEAR}{" "}
          federal brackets, less any W-4 Step 3 credits — then divides
          by your pay periods. That is the method the mainstream
          paycheck calculators use, and for a full year in one job it
          lands on the same annual figures as the IRS Publication 15-T
          percentage method your employer applies period by period;
          individual stubs can differ slightly for the reasons covered
          in the questions below. FICA follows the Social Security
          Administration&apos;s {TAX_YEAR} wage base of{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR}),
          federal withholding methods; Social Security Administration,
          Contribution and Benefit Base ({TAX_YEAR}:{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}); Texas Comptroller of
          Public Accounts (no state personal income tax). Tax rules
          verified 19 November 2026. This calculator is an estimate,
          not tax advice — your employer&apos;s payroll and your own
          tax return are the final word.
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
            href="/us/ohio-paycheck-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Ohio Paycheck Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The other US state on this hub — the mirror image of
              Texas: the HB 96 flat state tax, plus the city and
              school-district income taxes Texas does not have.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the Ohio calculator →
            </span>
          </Link>
          <Link
            href="/au/tax-rate-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Australia Tax Rate Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The hub&apos;s Australia section: income tax and the
              Medicare levy on any income, marginal and effective
              rates side by side.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the Australia calculator →
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
            href="/overtime-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Overtime Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Work out overtime pay at the rate in a UK contract —
              flat, time and a half or double time — from an hourly
              rate or a salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Comparing an offer across countries? This Texas page uses
          the IRS {TAX_YEAR} rules; the{" "}
          <Link href="/au/tax-rate-calculator" className={linkClass}>
            Australia page
          </Link>{" "}
          uses the ATO 2025–26 rules and the UK tools use the April
          2026 UK rules. The{" "}
          <Link href="/blog/take-home-pay" className={linkClass}>
            take-home pay guide
          </Link>{" "}
          explains the moving parts on each side.
        </p>
      </section>
    </div>
  );
}
