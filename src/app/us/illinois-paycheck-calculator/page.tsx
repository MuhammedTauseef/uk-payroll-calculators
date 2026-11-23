import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  ILLINOIS_EXEMPTION_AMOUNT,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
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
  "/us/illinois-paycheck-calculator",
  "Illinois Paycheck Calculator — 2026 Net Pay at the Flat 4.95% Tax",
  "Free Illinois paycheck calculator for 2026: federal tax and FICA plus Illinois's flat 4.95% income tax after the $2,925 personal exemption, line by line — no Chicago city tax, and worked examples at every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "IL",
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
// Bonus worked example: the same $80,000 salary with a $5,000
// bonus on top — the difference is what the bonus costs.
const exBonus = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 85000,
});
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 110000,
  filingStatus: "mfj",
  dependentsCreditAnnual: 4000,
});
const ex401k = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 65000,
  preTax401kPercent: 5,
});
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 80000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of an $80,000 paycheck in Illinois?",
    answer: `On an $80,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex80.grossPerPeriod)} paycheck loses ${fmt(ex80.federalPerPeriod)} of federal income tax, ${fmt(ex80.socialSecurityPerPeriod)} of Social Security, ${fmt(ex80.medicarePerPeriod)} of Medicare and ${fmt(ex80.statePerPeriod)} of Illinois tax — net pay of ${fmt(ex80.netPerPeriod)} every 2 weeks, ${fmt(ex80.netAnnual)} a year. Your own figures move with your W-4, IL-W-4 exemptions and pre-tax deductions — run them through the calculator above.`,
  },
  {
    question: "What is the Illinois income tax rate in 2026?",
    answer:
      "A flat 4.95% of net income for every filer at every income level (35 ILCS 5/201). There are no Illinois brackets and no variation by filing status — filing status changes only your exemption count and your federal tax. The rate has been 4.95% since July 1, 2017.",
  },
  {
    question: "Does Illinois have a standard deduction?",
    answer: `No. Illinois starts from your federal adjusted gross income and subtracts only the personal exemption — ${fmt(ILLINOIS_EXEMPTION_AMOUNT)} per person in ${TAX_YEAR} (you, a spouse who does not claim their own, and each dependent), plus $1,000 each for age 65+ or blindness. The exemption disappears entirely once federal AGI passes $250,000 ($500,000 married filing jointly) — it is a cliff, not a phase-out. Your federal standard deduction does not reduce your Illinois tax.`,
  },
  {
    question: "Does Chicago have a city income tax?",
    answer:
      "No — and neither does Cook County or any other Illinois city, county or school district. A Chicago paycheck is withheld exactly like a paycheck anywhere else in Illinois: federal tax, FICA and the 4.95% state tax, nothing local. Chicago's taxes arrive through its combined sales tax (among the highest in the US) and Cook County property taxes, not through your pay stub.",
  },
  {
    question: "Does a 401(k) reduce Illinois tax?",
    answer: `Yes. Illinois starts from federal AGI, and a traditional 401(k) contribution never enters AGI — so it cuts your Illinois tax at 4.95% as well as your federal tax. On a $65,000 salary, contributing 5% brings the Illinois bill down to ${fmt(ex401k.stateAnnual)}. It does not cut Social Security or Medicare. A Roth 401(k) cuts neither income tax now. A pre-tax health premium cuts all three: federal, Illinois and FICA.`,
  },
  {
    question: "What are the Social Security and Medicare rates in 2026?",
    answer: `Social Security is 6.2% of wages up to the ${fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base; Medicare is 1.45% on all wages, plus 0.9% Additional Medicare Tax over $200,000 single / $250,000 married filing jointly / $125,000 married filing separately. Illinois adds no employee payroll tax of its own — no disability or paid-leave premium — and unemployment insurance is paid by employers.`,
  },
  {
    question: "Why is my actual Illinois paycheck slightly different from this estimate?",
    answer:
      "This calculator annualizes — it figures the tax on a full year of income and divides by your pay periods, the method the mainstream paycheck calculators use. Your employer withholds per period under IRS Publication 15-T and IDOR's IL-700-T tables and formula, using your actual W-4 and IL-W-4. A Step 2 multiple-jobs box, a mid-year start, bonuses withheld at the flat 22% supplemental rate, or uneven hours move a single stub a little. The annual totals land close.",
  },
  {
    question: "How is a bonus taxed in Illinois?",
    answer: `A bonus is supplemental wages — taxed as ordinary pay at every level, and Illinois charges its flat 4.95% on it just as on salary; Chicago and Cook County add no city income tax on top. Over the year, a $5,000 bonus on this page's $80,000 salary costs ${fmt(exBonus.federalAnnual - ex80.federalAnnual)} of extra federal tax, ${fmt(exBonus.stateAnnual - ex80.stateAnnual)} of Illinois tax and ${fmt(exBonus.socialSecurityAnnual + exBonus.medicareAnnual - ex80.socialSecurityAnnual - ex80.medicareAnnual)} of Social Security and Medicare — ${fmt(exBonus.netAnnual - ex80.netAnnual)} of the $5,000 is kept. On the check itself, a bonus paid separately is usually withheld at the IRS flat 22% supplemental rate for federal tax; that is a withholding rate, not the tax rate, and your return settles the difference. To model a bonus here, add it to the salary for the year.`,
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
  name: "Illinois Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/illinois-paycheck-calculator`,
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

export default function IllinoisPaycheckCalculatorPage() {
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
          Illinois Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Illinois taxes wages at a flat 4.95% after a{" "}
          {fmt(ILLINOIS_EXEMPTION_AMOUNT)} personal exemption, with no
          city income tax anywhere in the state. On an $80,000 salary,
          single and paid every two weeks, federal tax and FICA leave{" "}
          <strong>
            {fmt(ex80.netPerPeriod)} net per paycheck in {TAX_YEAR} —{" "}
            {fmt(ex80.netAnnual)} a year
          </strong>
          . Enter your own pay below.
        </p>
      </section>

      <UsPaycheckCalculator state="IL" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $80,000 in Illinois, line by line
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
                <td className={tdClass}>
                  Illinois income tax at 4.95% (after the{" "}
                  {fmt(ILLINOIS_EXEMPTION_AMOUNT)} exemption)
                </td>
                <td className={tdClass}>−{fmt(ex80.statePerPeriod)}</td>
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
          The Illinois working is the part most calculators get wrong
          or skip: Illinois ignores the federal standard deduction
          entirely. Its base is the full $80,000 of federal AGI, less
          only the {fmt(ILLINOIS_EXEMPTION_AMOUNT)} exemption — $77,075
          × 4.95% = {fmt(ex80.stateAnnual)} a year — while the federal
          tax is figured on $63,900 after the federal deduction. Two
          more cases: a married couple filing jointly on $110,000 with
          $4,000 of W-4 Step 3 credits pays {fmt(exMfj.stateAnnual)} of
          Illinois tax (two exemptions) and keeps {fmt(exMfj.netAnnual)}{" "}
          a year; a single filer on $65,000 with a 5% 401(k) pays{" "}
          {fmt(ex401k.stateAnnual)} of Illinois tax, because the
          contribution never enters the AGI Illinois starts from.
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
                <th className={thClass}>Illinois tax</th>
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
          Take-home pay at common Illinois salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Illinois tax / year</th>
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
          Single, paid every 2 weeks, one exemption, no pre-tax
          deductions, {TAX_YEAR} rates. The Illinois column runs just
          under 4.95% of salary in every row — the exemption shaves a
          little off the flat rate — and it never jumps, because there
          are no brackets. Whether you searched for an Illinois
          paycheck calculator or a paycheck calculator for Illinois,
          the working is the same.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Bonuses in Illinois: same flat tax, different withholding
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A bonus is supplemental wages: taxed exactly like salary
          at every level. Illinois charges its flat 4.95% on a
          bonus just as on regular pay — there is no separate
          Illinois bonus rate, and no city income tax in Chicago or
          anywhere else in the state on top. Over the year, a
          $5,000 bonus on this page&apos;s $80,000 salary costs{" "}
          {fmt(exBonus.federalAnnual - ex80.federalAnnual)} of extra
          federal tax, {fmt(exBonus.stateAnnual - ex80.stateAnnual)}{" "}
          of Illinois tax and{" "}
          {fmt(
            exBonus.socialSecurityAnnual +
              exBonus.medicareAnnual -
              ex80.socialSecurityAnnual -
              ex80.medicareAnnual,
          )}{" "}
          of Social Security and Medicare —{" "}
          {fmt(exBonus.netAnnual - ex80.netAnnual)} of the $5,000 is
          kept. To model a bonus in the calculator, add it to the
          salary for the year, as this example does.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          What makes a bonus check <em>look</em> over-taxed is
          withholding: paid separately from regular wages, a bonus
          is usually withheld at the IRS flat supplemental rate of
          22% for federal tax, whatever your bracket. That rate is
          a deposit, not the tax — the annual return settles the
          difference, and a bonus taxed at a lower real bracket
          comes partly back as a refund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Illinois taxes a paycheck
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Illinois introduced its income tax in 1969, and the 1970
          Illinois Constitution (Article IX, §3(a)) requires any
          income tax to be “at a non-graduated rate” — one flat rate
          for everyone. The rate itself is ordinary statute (35 ILCS
          5/201): 4.95% since July 1, 2017. In November 2020 voters
          rejected a constitutional amendment that would have allowed
          graduated rates (a graduated schedule rising to 7.99% had
          already been passed, contingent on the amendment), so the
          flat 4.95% remains. The practical result: your filing status
          never changes your Illinois rate — only your exemption count
          changes your Illinois bill.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          The exemption — Illinois&apos;s answer to a standard
          deduction
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Illinois gives no standard deduction. Instead, every person
          on the return shelters {fmt(ILLINOIS_EXEMPTION_AMOUNT)} of
          income in {TAX_YEAR} (the statutory base amount, indexed for
          inflation under 35 ILCS 5/204 — it was $2,850 in 2025). Each
          exemption is worth $144.79 a year at 4.95%. That is why the
          effective Illinois rate on an $80,000 salary is 4.77%, not
          4.95% — and why it creeps toward 4.95% as pay rises, then
          jumps at the $250,000 / $500,000 AGI cliff where the
          exemption vanishes entirely. Set the exemptions field in the
          calculator to the Line 1 count on your IL-W-4: yourself, a
          spouse who does not claim their own, and each dependent.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          No Chicago income tax — the trade-off is property and sales
          tax
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Unlike New York City, Philadelphia or{" "}
          <Link href="/us/ohio-paycheck-calculator" className={linkClass}>
            Ohio&apos;s cities
          </Link>
          , no Illinois locality taxes wages. The bill arrives
          elsewhere: Illinois&apos;s state sales tax is 6.25% before
          county, city and transit additions push combined rates far
          higher (Chicago&apos;s combined rate is among the highest of
          any large US city), and Illinois property taxes are
          consistently ranked at or near the highest in the nation.
          Renters feel less of the second leg; homeowners feel all of
          it. The paycheck advantage over city-tax states is real — the
          offset is in the house and at the register, not the pay
          stub. One more Illinois quirk worth knowing: the state
          subtracts qualified retirement income — pensions, 401(k) and
          IRA distributions and Social Security benefits — from base
          income, so retirees pay no Illinois tax on it. Wages, which
          this calculator covers, are taxed in full.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Illinois?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: IL-700-T
          withholding on every run, figured from each worker&apos;s
          IL-W-4 exemptions.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies the flat 4.95% and each employee&apos;s exemptions on
          every run and files the federal and Illinois returns from
          the same figures.
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
          year of pay, then divides by your pay periods. Federal tax:
          gross less pre-tax deductions, less the {TAX_YEAR} standard
          deduction, through the {TAX_YEAR} brackets, less W-4 Step 3
          credits. FICA: 6.2% Social Security to the{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base and 1.45% Medicare
          (plus 0.9% over the filing-status threshold) on wages less
          pre-tax health and HSA premiums only. Illinois tax: the
          Illinois base — your federal AGI for wage income, i.e. gross
          less pre-tax 401(k), health and HSA amounts, with no standard
          deduction — less your personal exemptions (
          {fmt(ILLINOIS_EXEMPTION_AMOUNT)} each, removed entirely if
          federal AGI exceeds $250,000, or $500,000 if married filing
          jointly), at the flat 4.95% rate, per 35 ILCS 5/201, 5/203
          and 5/204 and IDOR Booklet IL-700-T ({TAX_YEAR}). For a full
          year in one job the annual totals match the per-period
          withholding methods closely; individual stubs can differ
          slightly.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR});
          Social Security Administration, Contribution and Benefit
          Base ({TAX_YEAR}: {fmt(SOCIAL_SECURITY_WAGE_BASE)}); Illinois
          Department of Revenue, Booklet IL-700-T (R-12/25) and
          personal-exemption guidance ({TAX_YEAR}:{" "}
          {fmt(ILLINOIS_EXEMPTION_AMOUNT)}); Illinois General Assembly,
          35 ILCS 5/201, 5/203, 5/204. Tax rules verified 22 November
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
            One job, held all year, as an Illinois resident working in
            Illinois; wages only — no retirement distributions (which
            Illinois does not tax, but which are outside this
            calculator), no Schedule M modifications, and no Illinois
            credits (property-tax, education, EITC).
          </li>
          <li>
            Illinois exemptions default to 1 (single / head of
            household / married filing separately) or 2 (married filing
            jointly); add 1 per dependent in the exemptions field,
            matching your IL-W-4 Line 1. The $1,000 age-65+ and
            blindness allowances (IL-W-4 Line 2, worth $49.50 a year
            each) are not modelled.
          </li>
          <li>
            The $250,000 / $500,000 exemption cliff is tested against
            the modelled federal AGI (gross less pre-tax deductions).
          </li>
          <li>
            W-4 Step 3 credits reduce federal tax only; they do not
            change the Illinois exemption count.
          </li>
          <li>
            Bonuses are treated as regular pay in the annualized
            model, not at the 22% federal supplemental withholding
            rate your employer may apply to a single stub.
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

      <StatePaycheckCluster state="IL" />
      <RelatedCalculators href="/us/illinois-paycheck-calculator" />
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
