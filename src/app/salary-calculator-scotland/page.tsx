import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import ScotlandSalaryCalculator from "@/components/ScotlandSalaryCalculator";
import { calculateScotlandTax } from "@/lib/scotland-tax";
import { SCOTTISH_TAX } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/salary-calculator-scotland",
  "Salary Calculator Scotland — Scottish Take-Home Pay 2026/27",
  "Work out take-home pay on Scotland's six Income Tax bands for 2026/27: starter 19%, basic 20%, intermediate 21%, higher 42%, advanced 45%, top 48% — with the band-by-band breakdown and the England comparison.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const h2Class = "text-xl font-semibold text-slate-900 dark:text-slate-50";

const plain = {
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
} as const;

// Worked examples — every figure below is this page's own engine
// run on the stated salary, not a copied table.
const ex35 = calculateScotlandTax({ annualSalary: 35000, ...plain });
const ex45 = calculateScotlandTax({ annualSalary: 45000, ...plain });
const ex50 = calculateScotlandTax({ annualSalary: 50000, ...plain });
const ex50Pension = calculateScotlandTax({
  annualSalary: 50000,
  pensionPercent: 5,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
});

const COMPARISON_SALARIES = [
  20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 75000, 100000,
  125000, 150000,
];
const comparison = COMPARISON_SALARIES.map((salary) => ({
  salary,
  result: calculateScotlandTax({ annualSalary: salary, ...plain }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What are the Scottish Income Tax rates for 2026/27?",
    answer:
      "Six rates on income above the £12,570 Personal Allowance: starter 19% on the first £3,967 of taxable income (gross £12,571–£16,537), basic 20% to £16,956 (gross £29,526), intermediate 21% to £31,092 (gross £43,662), higher 42% to £62,430 (gross £75,000), advanced 45% to £125,140 and top 48% above £125,140 of taxable income. The limits are the ones the Scottish Rate Resolution for 2026-27 sets; the January 2026 Scottish Budget raised the starter and basic limits and froze the rest.",
  },
  {
    question: "Do people in Scotland pay more tax than in England?",
    answer:
      "Only from a salary of £33,494 upwards. Below that, the 19% starter rate leaves a Scottish taxpayer up to £39.67 a year better off than the same salary in England, Wales or Northern Ireland. The gap then widens with salary: £396.05 a year more tax on £45,000, £1,496.05 more on £50,000 and £3,300.05 more on £100,000, on 2026/27 rates with no pension or student loan. National Insurance is identical everywhere, so the whole difference is Income Tax.",
  },
  {
    question: "Is National Insurance different in Scotland?",
    answer:
      "No. National Insurance is set for the whole UK: 8% of earnings between £12,570 and £50,270 a year and 2% above that, whichever part of the UK you live in. One consequence is easy to miss: Scotland's 42% higher rate starts at £43,663 but the NI rate only falls to 2% at £50,270, so earnings between those two figures carry a 50% combined marginal rate.",
  },
  {
    question: "Who counts as a Scottish taxpayer?",
    answer:
      "Someone whose main home is in Scotland. It is about where you live, not where your employer is or where the office sits: a person living in Edinburgh and working for a London firm pays Scottish rates, and a person living in Carlisle and working in Glasgow pays the rest-of-UK rates. HMRC marks a Scottish taxpayer with an S in front of the tax code — S1257L is the standard Scottish code for 2026/27.",
  },
  {
    question: "Which student loan plan do Scottish graduates repay?",
    answer:
      "Plan 4, if you were living in Scotland when you applied for student finance through SAAS. For 2026/27 its repayment threshold is £33,795 a year — the highest threshold of any undergraduate plan — and repayments are 9% of income above it. The calculator above includes Plan 4 and every other plan, plus the Postgraduate Loan on top.",
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
  name: "Salary Calculator Scotland",
  url: `${AppConfig.siteUrl}/salary-calculator-scotland`,
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

export default function ScotlandSalaryCalculatorPage() {
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
          Salary Calculator Scotland
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Scotland taxes pay at six rates instead of three: 19% from
          £12,571, then 20%, 21%, 42% from £43,663, 45% from £75,001
          and 48% above £125,140. On £35,000 a Scottish taxpayer takes
          home {gbp.format(ex35.netMonthly)} a month in 2026/27 —
          enter your salary for your own band-by-band figure.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this page uses
          the Scottish bands exactly as the Scottish Rate Resolution
          for 2026-27 sets them out.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Scottish rates
          verified 28 November 2026 against the Scottish Rate
          Resolution (motion S6M-20844) and gov.scot.
        </p>
      </section>

      <ScotlandSalaryCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          What are the Scottish Income Tax rates for 2026/27?
        </h2>
        <p className={bodyClass}>
          Scotland sets its own rates on earnings, pensions and rental
          income (savings interest and dividends stay on UK rates).
          The table is the one the Scottish Government publishes for
          someone on the standard £12,570 Personal Allowance:
        </p>
        <table className="w-full max-w-2xl text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Band</th>
              <th className="py-1 pr-2 font-medium">Gross income</th>
              <th className="py-1 font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Personal Allowance</td>
              <td className="py-1 pr-2">£0 to £12,570</td>
              <td className="py-1">0%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Starter rate</td>
              <td className="py-1 pr-2">£12,571 to £16,537</td>
              <td className="py-1">19%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Basic rate</td>
              <td className="py-1 pr-2">£16,538 to £29,526</td>
              <td className="py-1">20%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Intermediate rate</td>
              <td className="py-1 pr-2">£29,527 to £43,662</td>
              <td className="py-1">21%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Higher rate</td>
              <td className="py-1 pr-2">£43,663 to £75,000</td>
              <td className="py-1">42%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Advanced rate</td>
              <td className="py-1 pr-2">£75,001 to £125,140</td>
              <td className="py-1">45%</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-1 pr-2">Top rate</td>
              <td className="py-1 pr-2">Over £125,140</td>
              <td className="py-1">48%</td>
            </tr>
          </tbody>
        </table>
        <p className={bodyClass}>
          Legally the bands are limits on <em>taxable</em> income —
          income above the allowance: £3,967, £16,956, £31,092,
          £62,430 and £125,140. The two framings meet at the top
          because the Personal Allowance is fully withdrawn at
          £125,140 of income. For 2026/27 the Scottish Budget raised
          the starter and basic limits (the gross thresholds rose
          7.4%) and froze the higher, advanced and top thresholds.
          Only the slice of income inside a band is taxed at that
          band&apos;s rate — nobody pays 42% on their whole salary
          for crossing £43,663.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          How much tax do I pay on £35,000 in Scotland?
        </h2>
        <p className={bodyClass}>
          Worked by the calculator above, band by band. A £35,000
          salary has £22,430 of taxable income, and it stops part-way
          through the intermediate band:
        </p>
        <table className="w-full max-w-2xl text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Band</th>
              <th className="py-1 pr-2 font-medium">Income in band</th>
              <th className="py-1 pr-2 font-medium">Rate</th>
              <th className="py-1 font-medium">Tax</th>
            </tr>
          </thead>
          <tbody>
            {ex35.bands
              .filter((b) => b.incomeInBand > 0)
              .map((b) => (
                <tr
                  key={b.name}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="py-1 pr-2">{b.name} rate</td>
                  <td className="py-1 pr-2">{gbp.format(b.incomeInBand)}</td>
                  <td className="py-1 pr-2">{Math.round(b.rate * 100)}%</td>
                  <td className="py-1">{gbp.format(b.tax)}</td>
                </tr>
              ))}
            <tr className="border-t border-slate-200 dark:border-slate-800 font-semibold">
              <td className="py-1 pr-2">Total Income Tax</td>
              <td className="py-1 pr-2">{gbp.format(ex35.taxableIncome)}</td>
              <td className="py-1 pr-2"></td>
              <td className="py-1">{gbp.format(ex35.incomeTax)}</td>
            </tr>
          </tbody>
        </table>
        <p className={bodyClass}>
          Add National Insurance of{" "}
          {gbp.format(ex35.employeeNationalInsurance)} and take-home
          pay is {gbp.format(ex35.netAnnual)} a year —{" "}
          {gbp.format(ex35.netMonthly)} a month. The same salary in
          England, Wales or Northern Ireland pays{" "}
          {gbp.format(ex35.restOfUk.incomeTax)} of Income Tax and
          takes home {gbp.format(-ex35.differencePerYear)} a year
          more, because at this salary the 21% intermediate band has
          just started to outweigh the 19% starter band.
        </p>
        <p className={bodyClass}>
          Two more worked examples from the same engine: on £45,000
          the tax is {gbp.format(ex45.incomeTax)} (the first £1,338
          of higher-rate income costs 42%) and take-home pay is{" "}
          {gbp.format(ex45.netMonthly)} a month. On £50,000 with a 5%
          pension contribution, the contribution of{" "}
          {gbp.format(ex50Pension.pensionAnnual)} comes off before
          tax, the tax falls to {gbp.format(ex50Pension.incomeTax)}{" "}
          and take-home pay is {gbp.format(ex50Pension.netMonthly)} a
          month — against {gbp.format(ex50.netMonthly)} a month with
          no pension.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Do I pay more tax in Scotland than in England?
        </h2>
        <p className={bodyClass}>
          It depends on the salary, and the crossover is exact: up to
          £33,493 a Scottish taxpayer pays no more Income Tax than
          the same salary elsewhere in the UK, and at most £39.67 a
          year less. From £33,494 the Scottish bill is the higher
          one, and the gap grows quickly because the 42% higher rate
          starts at £43,663 instead of £50,270. The whole table is
          this page&apos;s engine run on both sets of bands, no
          pension or student loan:
        </p>
        <table className="w-full max-w-2xl text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Salary</th>
              <th className="py-1 pr-2 font-medium">Scotland take-home</th>
              <th className="py-1 pr-2 font-medium">Rest of UK take-home</th>
              <th className="py-1 font-medium">Difference a year</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map(({ salary, result }) => (
              <tr
                key={salary}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-2">{gbp.format(salary)}</td>
                <td className="py-1 pr-2">
                  {gbp.format(result.netAnnual)} ({gbp.format(result.netMonthly)}/mo)
                </td>
                <td className="py-1 pr-2">
                  {gbp.format(result.restOfUk.netAnnual)} (
                  {gbp.format(result.restOfUk.netMonthly)}/mo)
                </td>
                <td className="py-1">
                  {result.differencePerYear > 0
                    ? `+${gbp.format(result.differencePerYear)}`
                    : result.differencePerYear < 0
                      ? `−${gbp.format(-result.differencePerYear)}`
                      : "£0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={bodyClass}>
          If you are weighing a move across the border for work, the{" "}
          <Link href="/salary-comparison-calculator" className={linkClass}>
            salary comparison calculator
          </Link>{" "}
          puts two offers side by side, and the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            required salary calculator
          </Link>{" "}
          works backwards from the take-home pay you need — on
          rest-of-UK bands, so add the difference above if the new
          job comes with a move to Scotland.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Why is the marginal rate 50% between £43,663 and £50,270?
        </h2>
        <p className={bodyClass}>
          Because two systems that were never designed together
          overlap. Scotland&apos;s 42% higher rate starts at £43,663,
          but employee National Insurance — set UK-wide — stays at
          8% until £50,270. Earnings in between lose 42% + 8% = 50%
          of every extra pound. Above £50,270 the combined rate
          drops back to 44% (42% + 2%), which is why a pay rise that
          lands just past £50,270 can feel worth more than one that
          stops at £48,000.
        </p>
        <p className={bodyClass}>
          There is a second trap further up: between £100,000 and
          £125,140 the Personal Allowance is withdrawn at £1 for
          every £2 earned, which adds half the 45% advanced rate
          (22.5%) to the marginal rate — 45% + 22.5% + 2% NI =
          69.5%. The calculator shows your own marginal rate under
          the result, measured on your actual salary. A pension
          contribution is the usual way out of both traps: it cuts
          the income the bands and the taper are measured on. The{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows that side of the trade.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Who counts as a Scottish taxpayer?</h2>
        <p className={bodyClass}>
          Anyone whose main home is in Scotland — the test is where
          you live, not where you work or where your employer is
          based. Live in Edinburgh and work remotely for a London
          company and you pay Scottish rates; live in Carlisle and
          commute to Glasgow and you pay the rest-of-UK rates. HMRC
          puts an S at the front of a Scottish taxpayer&apos;s tax
          code (S1257L is the standard code for 2026/27), and
          employers deduct at Scottish rates automatically from that
          code. If you move mid-year, Scottish status generally
          applies for the whole tax year if Scotland is your main
          home for most of it — HMRC&apos;s guidance on Scottish
          taxpayer status covers the close cases.
        </p>
        <p className={bodyClass}>
          Scottish rates apply to employment income, pensions and
          rental income. Savings interest and dividends are taxed at
          the UK rates even for Scottish taxpayers, and National
          Insurance, student loan thresholds and the Personal
          Allowance itself are the same UK-wide figures used
          everywhere else on this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Methodology and sources</h2>
        <p className={bodyClass}>
          The bands are the Scottish Rate Resolution&apos;s own
          limits, held in this hub&apos;s rates file ({SCOTTISH_TAX.bands.length}{" "}
          bands: starter 19% to £3,967 of taxable income, basic 20%
          to £16,956, intermediate 21% to £31,092, higher 42% to
          £62,430, advanced 45% to £125,140, top 48% above), verified
          on 28 November 2026 against the Scottish Government&apos;s
          published rates and bands for 2026 to 2027 (gov.scot) and
          the Scottish Income Tax technical factsheet. The Budget
          that set them was delivered on 13 January 2026 and the
          Resolution (motion S6M-20844) was agreed on 19 February
          2026. National Insurance and the Personal Allowance use the
          same GOV.UK-verified 2026/27 figures as every other
          calculator here, and the student loan thresholds are
          GOV.UK&apos;s 2026/27 figures (Plan 4: £33,795 a year). The
          England comparison is this hub&apos;s own payslip engine
          run on the same inputs, so the two columns can never be
          built two different ways.
        </p>
        <p className={bodyClass}>
          Assumptions and limits: one job, a steady salary for a
          full year, the standard Personal Allowance with its
          £100,000 taper. A pension contribution is modelled as a
          net-pay arrangement — a percentage of gross taken before
          Income Tax but not before National Insurance; salary
          sacrifice and relief-at-source pensions give slightly
          different answers. Tax codes other than the standard
          allowance are not read here — the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          reads them, on rest-of-UK bands. Real PAYE is cumulative
          and works per pay period, so a single month&apos;s payslip
          can differ by a few pounds from a twelfth of the year
          shown here.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={h2Class}>Frequently asked questions</h2>
        {FAQS.map((f) => (
          <div key={f.question} className="space-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
              {f.question}
            </h3>
            <p className={bodyClass}>{f.answer}</p>
          </div>
        ))}
      </section>

      <RelatedCalculators href="/salary-calculator-scotland" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
