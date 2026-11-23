import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  ARIZONA_STANDARD_DEDUCTIONS,
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
  "/us/arizona-paycheck-calculator",
  "Arizona Paycheck Calculator — 2026 Net Pay at the Flat 2.5% Tax",
  "Free Arizona paycheck calculator for 2026: federal income tax and FICA plus Arizona's flat 2.5% income tax, line by line — with the Form A-4 withholding election explained and worked examples at every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "AZ",
  payType: "salary",
  annualSalary: 75000,
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
// The running example: $75,000 a year, single, paid every 2 weeks.
const ex75 = calculateUsPaycheck(BASE_INPUT);
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 100000,
  filingStatus: "mfj",
  dependentsCreditAnnual: 4000,
});
const ex401k = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 60000,
  preTax401kPercent: 5,
});
// Hourly worked example: $28 an hour, 40 hours a week, no overtime —
// the calculator's hourly mode annualizes it to $58,240 and runs the
// same Arizona maths.
const exHourly = calculateUsPaycheck({
  ...BASE_INPUT,
  payType: "hourly",
  hourlyRate: 28,
  hoursPerWeek: 40,
  overtimeHoursPerWeek: 0,
});
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

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $75,000 paycheck in Arizona?",
    answer: `On a $75,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex75.grossPerPeriod)} paycheck loses ${fmt(ex75.federalPerPeriod)} of federal income tax, ${fmt(ex75.socialSecurityPerPeriod)} of Social Security, ${fmt(ex75.medicarePerPeriod)} of Medicare and ${fmt(ex75.statePerPeriod)} of Arizona income tax — net pay of ${fmt(ex75.netPerPeriod)} every 2 weeks, ${fmt(ex75.netAnnual)} a year. Arizona's share is the smallest line: ${fmt(ex75.stateAnnual)} a year, because the flat 2.5% rate applies only after the standard deduction. Your own figures depend on your pay, filing status and Form W-4 — run them through the calculator above.`,
  },
  {
    question: "What is Arizona's income tax rate in 2026?",
    answer: `A flat 2.5% of Arizona taxable income, for every filing status and every income level — there are no brackets. Arizona taxable income is your federal adjusted gross income, adjusted by Arizona's own additions and subtractions, minus the Arizona standard deduction. The 2.5% rate has applied since tax year 2023 under A.R.S. §43-1011, and the Arizona Department of Revenue confirms it for ${TAX_YEAR}: "for tax year 2023 and beyond, the tax rate for Arizona taxable income is 2.5%." Because the deduction comes off first, the effective Arizona rate on a $75,000 salary is 1.96% of gross pay, not 2.5%.`,
  },
  {
    question: "Why doesn't my Arizona pay stub match 2.5%?",
    answer:
      "Because Arizona withholding is not 2.5% of anything. On Form A-4 — the Arizona withholding form you file with your employer, within five days of starting — you elect a percentage of your gross taxable wages: 0.5%, 1.0%, 1.5%, 2.0%, 2.5%, 3.0% or 3.5%, plus any extra amount you ask for. If you never file an A-4, your employer must withhold 2.0%. Your actual tax is 2.5% of income after the standard deduction, so most full-year workers are slightly over-withheld at the 2.0% default and get the difference back on their Arizona return. This calculator shows the tax itself; your stub shows your election. You can change your percentage at any time by filing a new A-4.",
  },
  {
    question: "Does Arizona have local income taxes?",
    answer:
      "No. No Arizona city, county or school district levies an income tax — not Phoenix, Tucson, Mesa or Scottsdale. That is a deliberate bargain dating to 1972: Arizona's cities and towns receive a share of the state's income-tax collections (urban revenue sharing) and are prohibited from levying their own income taxes while that sharing continues. Your paycheck deductions in Arizona are the federal lines plus the one state line, which is why this page's calculator has no city or district fields.",
  },
  {
    question: "What are the Social Security and Medicare rates in 2026?",
    answer: `Social Security is 6.2% of wages up to the ${TAX_YEAR} wage base of ${fmt(SOCIAL_SECURITY_WAGE_BASE)}. Medicare is 1.45% of all wages with no cap, plus an extra 0.9% Additional Medicare Tax on wages over $200,000 for a single filer ($250,000 married filing jointly, $125,000 married filing separately). Your employer pays matching 6.2% and 1.45% shares that never come out of your pay. Arizona adds no employee payroll premium of its own — no state disability or paid-leave deduction — and Arizona unemployment insurance is paid by the employer, not taken from your check. A pre-tax health premium reduces the wages both FICA taxes are figured on; a 401(k) contribution does not.`,
  },
  {
    question: "How does a 401(k) change an Arizona paycheck?",
    answer: `A traditional 401(k) contribution reduces two tax bases and not the third. On a $60,000 salary, contributing 5% ($3,000) cuts federal income tax to ${fmt(ex401k.federalAnnual)} and Arizona tax to ${fmt(ex401k.stateAnnual)} — because both taxes start from wages after the contribution. Social Security and Medicare are still figured on the full $60,000, so FICA stays at ${fmt(ex401k.socialSecurityAnnual + ex401k.medicareAnnual)}. Take-home falls by less than the contribution: ${fmt(ex401k.netAnnual)} a year, because the tax saved cushions the $3,000 saved. A pre-tax health premium goes one better and reduces the FICA wages too.`,
  },
  {
    question: "Why is my actual Arizona paycheck slightly different from this estimate?",
    answer:
      "This calculator works on annual figures — it figures the tax on a full year of income and divides by your pay periods, the same annualized approach the big commercial paycheck calculators use. Your employer withholds differently: federal tax period by period under IRS Publication 15-T using your exact Form W-4, and Arizona tax at the percentage you elected on Form A-4, which is a percentage of gross wages, not of taxable income. A mid-year start, a bonus, uneven hourly pay, or an A-4 percentage above or below your effective rate all move the real stub. The annual liability is what your Arizona return settles; treat any single paycheck figure here as an estimate of it.",
  },
  {
    question: "How much is $28 an hour in Arizona after tax?",
    answer: `At $28 an hour for 40 hours a week, gross pay is ${fmt(exHourly.grossAnnual)} a year. Single and paid every 2 weeks in ${TAX_YEAR}, the tax is ${fmt(exHourly.federalAnnual)} federal, ${fmt(exHourly.socialSecurityAnnual + exHourly.medicareAnnual)} of Social Security and Medicare, and ${fmt(exHourly.stateAnnual)} of Arizona tax — leaving ${fmt(exHourly.netPerPeriod)} a paycheck, ${fmt(exHourly.netAnnual)} a year, an effective tax rate of ${exHourly.effectiveTaxRatePercent.toFixed(2)}%. To run your own rate, choose "An hourly rate" in the calculator above; overtime hours are figured at 1.5 times the rate and taxed exactly like regular hours.`,
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
  name: "Arizona Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/arizona-paycheck-calculator`,
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

export default function ArizonaPaycheckCalculatorPage() {
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
          Arizona Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Arizona taxes wages at a flat 2.5%, so a $75,000 salary,
          single and paid every two weeks, keeps{" "}
          <strong>
            {fmt(ex75.netPerPeriod)} a paycheck in {TAX_YEAR} —{" "}
            {fmt(ex75.netAnnual)} a year
          </strong>{" "}
          — after {fmt(ex75.federalAnnual)} federal income tax,{" "}
          {fmt(ex75.socialSecurityAnnual + ex75.medicareAnnual)} Social
          Security and Medicare, and {fmt(ex75.stateAnnual)} Arizona
          tax. No Arizona city adds a local income tax.
        </p>
      </section>

      <UsPaycheckCalculator state="AZ" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $75,000 in Arizona, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex75.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex75.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex75.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex75.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Arizona income tax at 2.5% (after the{" "}
                  {fmt(ARIZONA_STANDARD_DEDUCTIONS.single)} standard
                  deduction)
                </td>
                <td className={tdClass}>−{fmt(ex75.statePerPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex75.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex75.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two more cases, worked by the same calculator. A married
          couple filing jointly on $100,000 with $4,000 of W-4 Step 3
          credits pays {fmt(exMfj.federalAnnual)} of federal tax and{" "}
          {fmt(exMfj.stateAnnual)} of Arizona tax, and keeps{" "}
          {fmt(exMfj.netAnnual)} a year ({fmt(exMfj.netPerPeriod)} a
          paycheck). A single filer on $60,000 who puts 5% into a
          traditional 401(k) pays {fmt(ex401k.stateAnnual)} of Arizona
          tax — the contribution shrinks the Arizona base just as it
          shrinks the federal one — and keeps {fmt(ex401k.netAnnual)} a
          year. Whether you searched for an Arizona paycheck
          calculator or a paycheck calculator for Arizona, the working
          is the same.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $75,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>Arizona tax</th>
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
                  <td className={tdClass}>−{fmt(result.statePerPeriod)}</td>
                  <td className={tdClass}>{fmt(result.netPerPeriod)}</td>
                  <td className={tdClass}>{fmt(result.netAnnual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The annual tax is identical however often you are paid — only
          the slicing changes. Compare offers on the per-year column,
          not on the size of one check.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at common Arizona salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Arizona tax / year</th>
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
                    salary === 75000
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
                  <td className={tdClass}>{fmt(result.stateAnnual)}</td>
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
          rates. The Arizona column grows in a straight line — 2.5% of
          everything above the standard deduction — because the flat
          rate has no brackets to climb. Social Security stops at the{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base, which is why the
          $200,000 row&apos;s FICA grows by Medicare alone.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paid by the hour? $28 an hour, worked through
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Most Arizona paycheck searches start from an hourly rate,
          not a salary — so here is the same maths on hourly pay.
          The calculator above has an hourly mode: choose &quot;An
          hourly rate&quot;, enter the rate and your hours, and it
          annualizes the pay (rate × hours × 52 weeks) and runs the
          identical federal, FICA and Arizona calculation. At $28 an
          hour for 40 hours a week that is {fmt(exHourly.grossAnnual)}{" "}
          a year:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(exHourly.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(exHourly.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(exHourly.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(exHourly.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Arizona income tax at 2.5%</td>
                <td className={tdClass}>−{fmt(exHourly.statePerPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(exHourly.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(exHourly.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Overtime is handled the same way: add your overtime hours
          in the calculator and they are paid — and taxed — at 1.5
          times the rate, as ordinary wages. One Arizona wrinkle
          applies to hourly and salaried staff alike: your employer
          does not withhold the 2.5% figure itself, but the
          percentage you elected on Form A-4, so an hourly stub can
          sit a little above or below the per-check figures here
          while the annual liability stays the same.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Arizona got a flat 2.5% tax
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Until 2022 Arizona taxed income through graduated brackets
          topping out at 4.5%. Senate Bill 1828 (2021) collapsed that
          structure in stages: two reduced rates for 2022 (2.55% and
          2.98%), then a single flat rate once state revenue triggers
          were met. Opponents petitioned SB 1828 onto the ballot as
          Proposition 307, but in April 2022 the Arizona Supreme Court
          held the measure was not referable, so the law took effect
          without a public vote. The revenue triggers were then met
          ahead of schedule, and from tax year 2023 every Arizona
          filer has paid one rate — 2.5% of taxable income (A.R.S.
          §43-1011) — among the lowest flat rates of any state that
          taxes wages at all. The practical effect for a paycheck is
          predictability: a raise is taxed by Arizona at the same 2.5%
          as the first dollar above the standard deduction, and there
          is no state bracket to be pushed into.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Form A-4: you choose your own Arizona withholding
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Arizona is unusual: it has no withholding table for employees
          to be matched against. When you start a job you file Form
          A-4, <em>Employee&apos;s Arizona Withholding Election</em>,
          with your employer — within your first five days — and pick
          one percentage of your gross taxable wages to be withheld:
          0.5%, 1.0%, 1.5%, 2.0%, 2.5%, 3.0% or 3.5%. You may add an
          extra flat amount per paycheck, and you may elect zero only
          if you certify you expect no Arizona tax liability for the
          year (that election must be renewed annually). File nothing
          and the law sets you at 2.0%. The form stays with your
          employer; the Department of Revenue never sees it unless it
          asks. Choosing well means comparing the options with your
          expected liability — 2.5% of your income after the standard
          deduction, which is always less than 2.5% of your gross pay.
          Pick too low and you will owe on your Form 140; pick the
          2.0% default on a typical salary and you will usually be due
          a small refund. The calculator above shows the liability
          side of that comparison; your A-4 decides how much of it is
          collected as you go.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          No local taxes — and nothing else hiding in the stub
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An Arizona paycheck has exactly four tax lines: federal
          income tax, Social Security, Medicare and Arizona income
          tax. There is no city income tax in Phoenix or Tucson, no
          county or school-district layer of the kind{" "}
          <Link href="/us/ohio-paycheck-calculator" className={linkClass}>
            Ohio
          </Link>{" "}
          workers pay, no employee disability or paid-leave premium of
          the kind New Jersey workers pay, and no employee
          unemployment-insurance contribution — Arizona unemployment
          tax is the employer&apos;s cost. That simplicity is
          structural, not accidental: since voters approved the 1972
          revenue-sharing initiative (Proposition 200), Arizona&apos;s
          cities and towns have received a share of state income-tax
          collections and have been barred from levying income taxes
          of their own for as long as the sharing continues. If you
          move to Arizona from a city-tax state, the local lines on
          your old stub do not shrink — they disappear.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Arizona?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: the
          A-4 percentage each employee elected, applied to every run,
          with the federal deposit schedule on top.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies each worker&apos;s withholding election and files
          the federal and Arizona returns from the same figures, so
          payday and the quarterly filings stay in step.
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
          the standard deduction, through the {TAX_YEAR} federal
          brackets, less any W-4 Step 3 credits — then divides by your
          pay periods. Arizona tax is figured the way the Arizona
          return figures it: the starting point is federal adjusted
          gross income (A.R.S. §43-1001), from which the calculator
          subtracts the Arizona standard deduction under A.R.S.
          §43-1041 and applies the flat 2.5% rate in A.R.S. §43-1011 —
          the rate the Arizona Department of Revenue confirms applies
          “for tax year 2023 and beyond”. One figure deserves a plain
          note: the deduction amounts used here are the §43-1041
          statutory amounts as adjusted under the §43-1041(H)
          inflation rule, which adjusts them “in the same manner” as
          the federal standard deduction and so produces the federal{" "}
          {TAX_YEAR} amounts — {fmt(ARIZONA_STANDARD_DEDUCTIONS.single)}{" "}
          single, {fmt(ARIZONA_STANDARD_DEDUCTIONS.mfj)} joint,{" "}
          {fmt(ARIZONA_STANDARD_DEDUCTIONS.hoh)} head of household,{" "}
          {fmt(ARIZONA_STANDARD_DEDUCTIONS.mfs)} married filing
          separately. The result is an estimate of the year&apos;s tax
          liability, not of Arizona withholding: your employer
          withholds the percentage you elected on Form A-4, so a
          single stub will differ from the per-period figures here
          even when the annual liability is exact. FICA follows the
          Social Security Administration&apos;s {TAX_YEAR} wage base
          of {fmt(SOCIAL_SECURITY_WAGE_BASE)}.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions: {fmt(STANDARD_DEDUCTIONS.single)}{" "}
          single, {fmt(STANDARD_DEDUCTIONS.mfj)} joint); IRS
          Publication 15-T ({TAX_YEAR}); Social Security
          Administration, Contribution and Benefit Base ({TAX_YEAR});
          Arizona Department of Revenue — Withholding Tax (the 2.5%
          rate and the Form A-4 percentages) and Individual Income Tax
          Highlights; Arizona Revised Statutes §§43-1001, 43-1011,
          43-1041. Tax rules verified 22 November 2026. This
          calculator is an estimate, not tax advice — your
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
            A full year in one Arizona job, on a standard Form W-4,
            with wages as the only income. Arizona additions and
            subtractions that do not arise on ordinary wages (for
            example, the subtraction for federally taxed Social
            Security benefits) are not modelled.
          </li>
          <li>
            The Arizona standard deduction is taken for every filer;
            itemized deductions, the charitable-contribution increase
            to the standard deduction, and Arizona tax credits
            (including the dependent credit) are not modelled. Federal
            W-4 Step 3 credits are modelled and reduce federal tax
            only.
          </li>
          <li>
            A traditional 401(k) reduces federal and Arizona
            income-tax wages but not Social Security / Medicare wages;
            a pre-tax health premium (and an HSA contribution through
            the cafeteria plan) reduces all three.
          </li>
          <li>
            Figures show Arizona income-tax liability spread evenly
            across pay periods, not A-4 withholding. Bonuses are
            taxed as ordinary wages at the flat 2.5% in this model.
          </li>
          <li>
            Mid-year starts, multiple jobs (W-4 Step 2), garnishments
            and deductions you do not enter will move a real stub away
            from the estimate.
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

      <StatePaycheckCluster state="AZ" />
      <RelatedCalculators href="/us/arizona-paycheck-calculator" />
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
