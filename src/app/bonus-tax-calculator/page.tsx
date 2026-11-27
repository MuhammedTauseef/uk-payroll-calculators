import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import BonusTaxCalculator from "@/components/BonusTaxCalculator";
import { calculateBonus } from "@/lib/bonus";
import { EMPLOYEE_NI, INCOME_TAX, PAYE_RATES_VERIFIED } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/bonus-tax-calculator",
  "Bonus Tax Calculator — How Much Tax on a Bonus? (2026/27)",
  "There is no special bonus tax rate: a bonus is taxed where it lands on your salary. Work out the Income Tax, National Insurance and student loan on yours — including the 60% trap over £100,000.",
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

// £45,000 salary with a £5,000 bonus: the bonus sits wholly in
// the basic-rate band.
const exBasic = calculateBonus({
  annualSalary: 45000,
  bonus: 5000,
  studentLoanPlan: "none",
  sacrificePercent: 0,
});
// £110,000 salary with a £10,000 bonus: the bonus lands in the
// Personal Allowance taper and is taxed at an effective 60%.
const exTaper = calculateBonus({
  annualSalary: 110000,
  bonus: 10000,
  studentLoanPlan: "none",
  sacrificePercent: 0,
});
// The same £110,000 / £10,000 case with the whole bonus
// sacrificed into a pension: nothing is taxed at all.
const exSacrificed = calculateBonus({
  annualSalary: 110000,
  bonus: 10000,
  studentLoanPlan: "none",
  sacrificePercent: 100,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax will I pay on my bonus?",
    answer:
      "There is no separate bonus tax rate — a bonus is taxed exactly like salary, at whatever marginal rate applies where it lands on top of your pay. A basic-rate taxpayer keeps most of it: Income Tax at 20% plus National Insurance at 8% takes 28% of the bonus. A higher-rate taxpayer loses 40% tax plus 2% National Insurance. And between £100,000 and £125,140 the Personal Allowance taper pushes the effective tax rate on a bonus to 60%, plus 2% National Insurance — the heaviest slice of all.",
  },
  {
    question: "Why was so much tax taken from my bonus in the month I was paid it?",
    answer:
      "Because PAYE largely treats each pay period on its own. In the bonus month, payroll annualises that month's pay — a £3,750 salary plus a £5,000 bonus looks like a £105,000-a-year job — and taxes it accordingly, applying higher rates and even a reduced Personal Allowance to the calculation. The result is an over-deduction in the month itself. It is a timing effect, not the final answer: the true tax on the bonus is set by your income for the whole tax year.",
  },
  {
    question: "Will I get the extra tax on my bonus back?",
    answer:
      "The Income Tax, usually yes. On a cumulative tax code (the normal case, such as 1257L), PAYE recalculates your tax for the year to date every payday, so an over-deduction in the bonus month unwinds automatically through smaller deductions in later payslips of the same tax year. Anything still overpaid after 5 April comes back through a P800 calculation or your tax return. National Insurance is different: it is worked out per pay period and is not cumulative, so NI taken in the bonus month is not refunded later, even if the year's income ends up lower.",
  },
  {
    question: "Does a bonus affect my student loan repayments?",
    answer:
      "Yes. Bonuses are earnings for student loan purposes, so the plan rate — 9% for Plans 1, 2, 4 and 5, 6% for a Postgraduate Loan — is charged on the bonus as well, in the pay period it is paid, on everything above the plan's threshold for that period. For most graduates the salary has already used up the monthly threshold, so effectively the whole bonus is repayable at the plan rate. Unlike Income Tax, student loan deductions are calculated per pay period, so a spike in the bonus month is not averaged out later.",
  },
  {
    question: "Can I pay my bonus into my pension to save tax?",
    answer:
      "Yes — if your employer offers bonus sacrifice, some or all of the bonus can go straight into your pension before any deductions. The sacrificed part is not pay, so it escapes Income Tax, employee and employer National Insurance, and student loan repayments entirely; for someone in the £100,000–£125,140 taper it can also restore Personal Allowance, turning a 62%-deduction bonus into a fully kept pension contribution. The limits to watch are the pension annual allowance (£60,000 for most people) and the fact that the money is locked in the pension until you can access it.",
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
  name: "Bonus Tax Calculator",
  url: `${AppConfig.siteUrl}/bonus-tax-calculator`,
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

export default function BonusTaxCalculatorPage() {
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
          Bonus Tax Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          There is no special tax on bonuses: a bonus is ordinary
          earnings, taxed through PAYE at the rate that applies where
          it lands on top of your salary — 20% Income Tax plus 8%
          National Insurance for a basic-rate taxpayer, 40% plus 2%
          at higher rate, and an effective 60% tax in the
          £100,000–£125,140 Personal Allowance taper. Enter your
          salary and bonus to see exactly what you keep.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this page
          uses the 2026/27 Income Tax bands and Class 1 National
          Insurance thresholds exactly as GOV.UK publishes them.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · 2026/27 rates
          verified {PAYE_RATES_VERIFIED} against GOV.UK.
        </p>
      </section>

      <BonusTaxCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          Two bonuses, worked end to end
        </h2>
        <p className={bodyClass}>
          The same question — “how much tax on my bonus?” — has two
          very different answers depending on the salary underneath
          it, because the bonus is taxed as the top slice of income:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Case
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Income Tax
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  National Insurance
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Bonus kept
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  {gbp.format(45000)} salary + {gbp.format(5000)} bonus
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exBasic.incomeTaxOnBonus)} (20%)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exBasic.employeeNiOnBonus)} (8%)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exBasic.netBonus)} of {gbp.format(5000)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  {gbp.format(110000)} salary + {gbp.format(10000)}{" "}
                  bonus
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exTaper.incomeTaxOnBonus)} (60%)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exTaper.employeeNiOnBonus)} (2%)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exTaper.netBonus)} of {gbp.format(10000)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          In the first case the bonus never leaves the basic-rate
          band: the salary of {gbp.format(45000)} plus the bonus of{" "}
          {gbp.format(5000)} still totals {gbp.format(50000)}, below
          the {gbp.format(50270)} higher-rate threshold, so the
          bonus is taxed at a flat 20% and National Insurance at 8% —
          {gbp.format(exBasic.totalDeductions)} gone,{" "}
          {gbp.format(exBasic.netBonus)} kept. Nothing about the
          bonus is special; it is simply £5,000 more salary.
        </p>
        <p className={bodyClass}>
          In the second case the same-sized bonus lands in the
          Personal Allowance taper. Income of {gbp.format(110000)}{" "}
          already cuts the allowance to{" "}
          {gbp.format(exTaper.personalAllowanceBefore)}; the{" "}
          {gbp.format(10000)} bonus cuts it further, to{" "}
          {gbp.format(exTaper.personalAllowanceAfter)}. So the bonus
          is taxed at 40% — and the £5,000 of allowance it destroys
          exposes another £5,000 of income to 40% tax as well. The
          two effects together take{" "}
          {gbp.format(exTaper.incomeTaxOnBonus)} of tax from a{" "}
          {gbp.format(10000)} bonus: an effective rate of 60%, before
          the 2% National Insurance. This is the famous 60% tax trap,
          and bonuses are where most people meet it — our{" "}
          <Link
            href="/adjusted-net-income-calculator"
            className={linkClass}
          >
            adjusted net income calculator
          </Link>{" "}
          shows the full picture around £100,000.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Why did so much disappear in the bonus month?
        </h2>
        <p className={bodyClass}>
          If the payslip in the bonus month looks worse than the
          figures above, nothing has gone wrong — PAYE is doing what
          it is designed to do. Payroll works each period largely on
          its own, spreading your tax code&apos;s allowances across
          the year and annualising the pay in front of it. A month
          containing a large bonus is read, in effect, as if that
          were your new monthly pay: the calculation can apply the
          higher rate, the additional rate and even a tapered
          Personal Allowance to money that, across the full year,
          will only ever be basic-rate income. The over-deduction is
          real cash in the month, but it is not the final bill.
        </p>
        <p className={bodyClass}>
          The correction differs by deduction. Income Tax is
          cumulative: on a cumulative code, every payday recalculates
          the tax due on the year to date, so the bonus-month spike
          unwinds through lower deductions over the following months,
          and anything left over after 5 April is settled by a P800
          or a tax return. National Insurance is not cumulative — it
          is fixed by each pay period in isolation — so the NI taken
          in the bonus month stays taken. Student loan repayments
          follow the National Insurance pattern. When you judge a
          bonus, judge it on the annual figures this calculator
          shows, not on the single payslip.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Keeping more of a bonus</h2>
        <p className={bodyClass}>
          The one lever that changes the tax itself — rather than
          just its timing — is pension salary sacrifice. If the
          employer offers it, the bonus (or part of it) is given up
          before it becomes pay: no Income Tax, no National
          Insurance for either side, no student loan repayment. On
          the £110,000 example above, sacrificing the whole{" "}
          {gbp.format(10000)} bonus puts{" "}
          {gbp.format(exSacrificed.sacrificedAmount)} into the
          pension instead of {gbp.format(exTaper.netBonus)} into the
          bank — and because taxable income falls back to{" "}
          {gbp.format(110000)}, the Personal Allowance is restored to{" "}
          {gbp.format(exSacrificed.personalAllowanceBefore)}. Try it
          in the calculator above, and see our{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          for the year-round version. The constraints are the pension
          annual allowance (£60,000 for most people, less for very
          high earners) and the simple fact that pension money is
          locked away until age 55 (57 from April 2028) — sacrificing a bonus you
          need for a house deposit is a tax saving bought too dearly.
        </p>
        <p className={bodyClass}>
          Beyond sacrifice, the honest options are modest: check the
          tax code on the bonus payslip is yours and cumulative (a
          BR or Month 1 code will over-deduct and will not
          self-correct until it is fixed — our{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            tax code checker
          </Link>{" "}
          decodes it), and remember that a bonus is taxed when it is
          paid, so a payment date either side of 5 April puts it in
          different tax years — a conversation worth having with an
          employer only where the timing is genuinely flexible. For
          the full-year picture with the bonus included, our{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows the complete payslip.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          2026/27 rates used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Item
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  2026/27 figure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Personal Allowance</td>
                <td className="px-4 py-2">
                  {gbp.format(INCOME_TAX.personalAllowance)}, reduced
                  by £1 for every £2 of income over{" "}
                  {gbp.format(INCOME_TAX.allowanceTaperThreshold)} —
                  nil at {gbp.format(INCOME_TAX.additionalRateThreshold)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Basic rate</td>
                <td className="px-4 py-2">
                  {INCOME_TAX.basicRate * 100}% on the first{" "}
                  {gbp.format(INCOME_TAX.basicRateBand)} of taxable
                  income (income to {gbp.format(50270)} with a full
                  allowance)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Higher rate</td>
                <td className="px-4 py-2">
                  {INCOME_TAX.higherRate * 100}% above that, to{" "}
                  {gbp.format(INCOME_TAX.additionalRateThreshold)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Additional rate</td>
                <td className="px-4 py-2">
                  {INCOME_TAX.additionalRate * 100}% on income over{" "}
                  {gbp.format(INCOME_TAX.additionalRateThreshold)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employee National Insurance
                </td>
                <td className="px-4 py-2">
                  {EMPLOYEE_NI.mainRate * 100}% between{" "}
                  {gbp.format(EMPLOYEE_NI.primaryThresholdAnnual)} and{" "}
                  {gbp.format(EMPLOYEE_NI.upperEarningsLimitAnnual)},{" "}
                  {EMPLOYEE_NI.additionalRate * 100}% above — worked
                  out per pay period
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Student loan on a bonus</td>
                <td className="px-4 py-2">
                  9% (Plans 1, 2, 4 and 5) or 6% (Postgraduate Loan) of
                  the bonus above the plan&apos;s pay-period threshold
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: GOV.UK “Income Tax rates and Personal Allowances”
          and “Rates and thresholds for employers 2026 to 2027”.
          England, Wales and Northern Ireland bands — Scotland sets
          its own Income Tax rates. Rules verified{" "}
          {PAYE_RATES_VERIFIED}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={h2Class}>Frequently asked questions</h2>
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

      <RelatedCalculators href="/bonus-tax-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
