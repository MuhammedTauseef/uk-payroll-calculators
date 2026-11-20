import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PayRiseCalculator from "@/components/PayRiseCalculator";
import { calculatePayRise } from "@/lib/pay-rise";
import { PAYE_RATES_LABEL } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = pageMetadata(
  "/pay-rise-calculator",
  "Pay Rise Calculator — Your Rise After Tax & NI",
  "Work out a pay rise by percentage, amount or target salary — and see what you keep after Income Tax, National Insurance, pension and student loan.",
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

// Worked examples, computed by the same code the calculator runs, so
// the printed figures can never drift from the tool. Benchmarks for
// all four are hand-computed in the research notes
// (research-2tools-2026-11-20) and asserted in verify-pay-rise.
const exPercent = calculatePayRise({
  currentSalary: 40000,
  mode: "percent",
  risePercent: 5,
  riseAmount: 0,
  targetSalary: 0,
  hoursPerWeek: 37.5,
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
});
const exTrap = calculatePayRise({
  currentSalary: 98000,
  mode: "target",
  risePercent: 0,
  riseAmount: 0,
  targetSalary: 105000,
  hoursPerWeek: 37.5,
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
});
const exBand = calculatePayRise({
  currentSalary: 48000,
  mode: "percent",
  risePercent: 10,
  riseAmount: 0,
  targetSalary: 0,
  hoursPerWeek: 37.5,
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
});
const exPensionLoan = calculatePayRise({
  currentSalary: 50000,
  mode: "percent",
  risePercent: 4,
  riseAmount: 0,
  targetSalary: 0,
  hoursPerWeek: 37.5,
  pensionPercent: 5,
  studentLoanPlan: "plan2",
  postgraduateLoanToo: false,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I work out my pay rise as a percentage?",
    answer:
      "Divide the rise by your current salary and multiply by 100. A £2,000 rise on a £40,000 salary is 2,000 ÷ 40,000 × 100 = 5%. To run it the other way — from a percentage to a salary — multiply your salary by 1 plus the percentage as a decimal: £40,000 × 1.05 = £42,000. The calculator above does both, and shows the monthly, weekly and hourly equivalents.",
  },
  {
    question: "How much of my pay rise do I actually keep?",
    answer:
      "It depends which tax band the rise lands in. Within the basic-rate band you keep 72p of each extra £1 (20% Income Tax and 8% National Insurance come off). In the higher-rate band you keep 58p (40% tax, 2% NI). Between £100,000 and £125,140 you keep just 38p, because the Personal Allowance taper adds an effective 20% on top of the 40% rate. A pension contribution and a student loan each take their percentage off the rise as well.",
  },
  {
    question: "Does a pay rise increase my student loan repayments?",
    answer:
      "Yes, if you earn above your plan's threshold. Repayments are 9% of everything above the threshold — £29,385 a year for Plan 2 in 2026/27 — so a rise that takes you further above it adds 9p of repayment for every extra £1. A Postgraduate Loan adds 6% above £21,000, and the two can run together. The rise does not change the balance you owe, only how fast you repay it.",
  },
  {
    question: "My pay rise takes me over £100,000. What happens?",
    answer:
      "You start losing your Personal Allowance: £1 of allowance for every £2 earned over £100,000, until it reaches zero at £125,140. Losing allowance means more of your pay is taxed at 40%, so a rise inside that window is effectively taxed at 60% plus 2% National Insurance — you keep about 38p in the pound. A pension contribution that brings your income back below £100,000 restores the allowance, which is why contributions are so powerful in this band.",
  },
  {
    question: "Is a pay rise taxed differently from a bonus?",
    answer:
      "Both are taxed as earnings through PAYE at the same Income Tax bands, so over a full year the tax on the same total pay is broadly the same. The difference is National Insurance: it is worked out pay period by pay period rather than cumulatively, so a one-off bonus month can carry more NI than the same money spread across the year as a rise. A permanent rise also lifts future percentage rises, overtime rates and pension contributions in a way a bonus does not.",
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
  name: "Pay Rise Calculator",
  url: `${AppConfig.siteUrl}/pay-rise-calculator`,
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

export default function PayRiseCalculatorPage() {
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
          Pay Rise Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          A pay rise is worth what survives tax. Enter it as a
          percentage, a flat amount or the salary you are aiming for,
          and this calculator runs both salaries through the full
          2026/27 UK tax calculation — Income Tax, National Insurance,
          pension and student loan — so you see the extra take-home
          pay, not just the headline rise.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of
          UK pay, tax and leave calculators published by Muhammad
          Tauseef. Most pay rise calculators stop at the gross figure;
          this one starts where the money lands. If you only need the
          tax on a salary as it stands, the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          does that on its own — this page is about the change: what
          the rise adds before tax, and what it adds after.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified
          20 November 2026 against GOV.UK.
        </p>
      </section>

      <PayRiseCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>How this pay rise calculator works</h2>
        <p className={bodyClass}>
          There are three ways a rise is usually offered, and the
          calculator accepts all three. A percentage rise multiplies
          your salary: £40,000 with a 5% rise becomes £40,000 × 1.05 ={" "}
          {gbp.format(exPercent.newGrossAnnual)}. A flat amount simply
          adds on — £2,000 on £40,000 reaches the same place, and the
          calculator shows it as the percentage it equals, because the
          two offers are only comparable in the same units. A target
          salary works backwards: tell it the £52,000 you are
          negotiating towards and it shows the rise that represents
          from where you stand, which is the number you need when an
          offer is framed as a destination rather than an increase.
        </p>
        <p className={bodyClass}>
          Whichever way you enter it, both salaries then go through
          exactly the same calculation the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          uses: Income Tax on the 2026/27 bands with the standard
          1257L tax code, employee National Insurance at 8% between
          £12,570 and £50,270 and 2% above, your pension contribution
          on a net-pay basis, and student loan repayments on the
          2026/27 plan thresholds. The figures are for England, Wales
          and Northern Ireland — Scotland sets its own income tax
          bands. Because the same verified code produces both sides,
          the difference between them is purely the rise: no rounding
          method changes halfway through the comparison.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Why your pay rise is worth less than the headline
        </h2>
        <p className={bodyClass}>
          A pay rise is taxed at your top — marginal — rate, not your
          average rate. Your existing salary already uses your
          Personal Allowance and your basic-rate band, so every pound
          of the rise is taxed in the highest band it reaches. That is
          why a 5% rise never means 5% more in your bank account. On{" "}
          {gbp.format(exPercent.currentGrossAnnual)}, a{" "}
          {gbp.format(exPercent.grossRiseAnnual)} rise (5%) adds{" "}
          {gbp.format(exPercent.extraIncomeTax)} of Income Tax and{" "}
          {gbp.format(exPercent.extraNationalInsurance)} of National
          Insurance, leaving {gbp.format(exPercent.netRiseAnnual)} a
          year — {gbp.format(exPercent.netRiseMonthly)} a month, or{" "}
          {exPercent.keepPercent}% of the rise kept. The rise is real;
          it is just smaller than the letter announcing it suggests,
          and knowing the true figure before you agree budgets,
          mortgage applications or a job move is the whole point of
          checking.
        </p>
        <p className={bodyClass}>
          The slice the rise loses depends on where it lands. A rise
          wholly inside the basic-rate band loses 28p in the pound —
          20% tax and 8% National Insurance — so you keep 72p. Once
          your pay passes £50,270, the slice above that line loses
          42p (40% tax, but NI drops to 2%), keeping 58p. A rise can
          straddle the line: on {gbp.format(exBand.currentGrossAnnual)}
          , a 10% rise to {gbp.format(exBand.newGrossAnnual)} keeps{" "}
          {exBand.keepPercent}% overall, because the first part is
          taxed at 28% and the rest at 42%. And between £100,000 and
          £125,140 the Personal Allowance taper makes the effective
          rate 62%, keeping just 38p — the next section shows that
          trap with real numbers. Pension contributions and student
          loan repayments then take their own percentages off the
          same rise, which the sections after that work through.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>The £100,000 pay rise trap</h2>
        <p className={bodyClass}>
          Between £100,000 and £125,140, your Personal Allowance —
          the £12,570 of pay taxed at 0% — is withdrawn at £1 for
          every £2 you earn over £100,000. A rise in this window is
          therefore taxed twice over: 40% on the rise itself, plus
          40% on the allowance you lose, an effective 60% Income Tax
          rate, with 2% National Insurance on top. Run the numbers on
          a rise from {gbp.format(exTrap.currentGrossAnnual)} to{" "}
          {gbp.format(exTrap.newGrossAnnual)}: the allowance falls
          from {gbp.format(exTrap.personalAllowanceBefore)} to{" "}
          {gbp.format(exTrap.personalAllowanceAfter)}, the extra tax
          bill is {gbp.format(exTrap.extraIncomeTax)} on a{" "}
          {gbp.format(exTrap.grossRiseAnnual)} rise, and the
          take-home gain is just {gbp.format(exTrap.netRiseAnnual)} a
          year — {exTrap.keepPercent}% kept. No other band in the UK
          system takes a bigger share of a rise.
        </p>
        <p className={bodyClass}>
          There is a legitimate way out, and it is worth knowing
          before you negotiate. A pension contribution reduces the
          income the taper is measured on: contributing enough to
          bring your income back to £100,000 restores the full
          Personal Allowance, so the contribution effectively earns
          tax relief at 60% in this window. The{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows the same effect from the other direction — what
          giving up salary for pension contributions does to your
          take-home pay. If a rise is about to carry you just over
          £100,000, the choice is rarely between the rise and nothing:
          it is between the rise taken as pay, taxed at 62%, and part
          of it taken as pension, where the full amount works for
          you. Employers who understand this will often agree to the
          pension route, because it can cost them less in employer
          National Insurance too.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Pension contributions: the quiet slice of every rise
        </h2>
        <p className={bodyClass}>
          If you pay a percentage of your salary into a workplace
          pension, a pay rise automatically increases the cash amount
          — 5% of a bigger salary is a bigger contribution. Under a
          net-pay arrangement, the usual workplace scheme, the
          contribution comes off before Income Tax, so it saves tax
          at your marginal rate, but National Insurance is still
          charged on the full gross. Take a{" "}
          {gbp.format(exPensionLoan.currentGrossAnnual)} salary with
          a 4% rise and a 5% pension contribution: the rise is{" "}
          {gbp.format(exPensionLoan.grossRiseAnnual)} gross, of which{" "}
          {gbp.format(exPensionLoan.extraPension)} is extra pension,{" "}
          {gbp.format(exPensionLoan.extraIncomeTax)} extra tax and{" "}
          {gbp.format(exPensionLoan.extraNationalInsurance)} extra
          National Insurance — before the student loan in the next
          section takes its share too. The pension slice is not lost
          money, of course: it is invested in your pot with tax
          relief added. But it does mean the rise that reaches your
          bank account is smaller again, and anyone comparing a new
          offer against their current pay should compare the pension
          percentages as carefully as the salaries — a job paying 3%
          more with a 3% pension match can be worth less than the
          job you have at 5%.
        </p>
        <p className={bodyClass}>
          Salary sacrifice is the alternative arrangement: you give
          up salary formally, and your employer pays that amount into
          your pension instead. Because the sacrificed salary never
          becomes pay, it saves National Insurance as well as tax —
          for both you and your employer. Not every rise conversation
          can be restructured this way, but a rise is the natural
          moment to ask, because the paperwork is being reopened
          anyway. The calculator above models the net-pay
          arrangement; if your scheme is salary sacrifice, run your
          figures through the salary sacrifice calculator linked
          above for the precise comparison.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Student loan repayments take 9% more of the rise
        </h2>
        <p className={bodyClass}>
          Student loan repayments through PAYE are a percentage of
          what you earn above your plan&apos;s threshold, so a pay
          rise increases them automatically. In 2026/27 the
          thresholds are £26,900 for Plan 1, £29,385 for Plan 2,
          £33,795 for Plan 4 and £25,000 for Plan 5, each at 9%, and
          £21,000 at 6% for a Postgraduate Loan — which can run
          alongside an undergraduate plan, taking 15% of a rise in
          total. In the worked example above, the Plan 2 borrower&apos;s
          rise of {gbp.format(exPensionLoan.grossRiseAnnual)} carries{" "}
          {gbp.format(exPensionLoan.extraStudentLoan)} a year of
          extra repayments, and the total kept falls to{" "}
          {exPensionLoan.keepPercent}%. The{" "}
          <Link
            href="/student-loan-repayment-calculator"
            className={linkClass}
          >
            student loan repayment calculator
          </Link>{" "}
          shows the repayment on any salary and plan by itself,
          including how the monthly deduction is worked out. One
          consolation: the extra repayments do reduce your balance
          faster, and the loan is still written off at the end of its
          term if it is not repaid — a rise never makes the debt
          bigger, only the speed of repayment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Comparing a rise with a new job or a promotion
        </h2>
        <p className={bodyClass}>
          The same maths decides job moves. A new offer is a target
          salary: enter it in the calculator and compare the net
          difference, not the gross gap, because a move that crosses
          a tax band keeps less of its headline than it appears to.
          Check the whole package while you are at it — the pension
          percentage, any bonus (taxed as earnings, but with National
          Insurance worked out per pay period rather than across the
          year), and paid overtime, which the{" "}
          <Link href="/overtime-calculator" className={linkClass}>
            overtime calculator
          </Link>{" "}
          prices at your new rate. If the new role is part-time or
          the hours differ, the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          converts both offers to the same basis, and the{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          does the same for hourly-paid work — comparing £21 an hour
          against a £40,000 salary is a conversion first and a
          decision second. A promotion inside your own band structure
          works the same way: the step increase is a rise like any
          other, taxed at your marginal rate from the month it takes
          effect.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          For employers: putting a pay rise through payroll
        </h2>
        <p className={bodyClass}>
          A rise is simple to promise and easy to get wrong in the
          detail. The new salary has to be in the payroll before the
          pay date it takes effect from; percentage pension
          contributions recalculate themselves, but a fixed-amount
          contribution does not change unless someone changes it;
          and a rise that carries an employee over a student loan
          threshold or into a new tax band will change their net pay
          by less than they expect — telling them the net figure up
          front, using the same calculation as this page, prevents
          the payslip surprise. The full cost to the business is
          more than the rise itself: employer National Insurance and
          pension contributions scale with the new salary, which the{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>{" "}
          sets out line by line.
        </p>
        <p className={bodyClass}>
          How the rise is run depends on the size of the team. Small
          London firms that have outgrown doing payroll by hand often
          hand the whole run to a bureau — our guide to{" "}
          <Link href="/blog/payroll-services-london" className={linkClass}>
            payroll services in London
          </Link>{" "}
          explains what that costs and what to check. Companies
          hiring across borders face the rise question in several
          countries at once, which is where an{" "}
          <Link href="/blog/employer-of-record-uk" className={linkClass}>
            employer of record
          </Link>{" "}
          earns its fee, and growing teams usually end up tracking
          rises, reviews and effective dates in one of the{" "}
          <Link href="/blog/best-hr-systems-uk" className={linkClass}>
            best HR systems for UK employers
          </Link>{" "}
          rather than in a spreadsheet. Whatever runs the payroll,
          the rise itself has to be entered once, correctly, with its
          start date.
        </p>
        <p className={bodyClass}>
          For keeping the run itself accurate — the new salary, its
          tax code and the pension percentage applied from the right
          date — payroll software such as{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          works out the tax, National Insurance, pension and student
          loan deductions on the new salary each period, so a rise
          entered once flows into every payslip that follows.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay, and
          providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What each £1 of a pay rise keeps, by band</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Where the rise lands
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Income Tax
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  National Insurance
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  You keep
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Up to £50,270 (basic rate)</td>
                <td className="px-4 py-2">20%</td>
                <td className="px-4 py-2">8%</td>
                <td className="px-4 py-2">72p in the £</td>
              </tr>
              <tr>
                <td className="px-4 py-2">£50,270 to £100,000 (higher rate)</td>
                <td className="px-4 py-2">40%</td>
                <td className="px-4 py-2">2%</td>
                <td className="px-4 py-2">58p in the £</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  £100,000 to £125,140 (allowance taper)
                </td>
                <td className="px-4 py-2">60% effective</td>
                <td className="px-4 py-2">2%</td>
                <td className="px-4 py-2">38p in the £</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Over £125,140 (additional rate)</td>
                <td className="px-4 py-2">45%</td>
                <td className="px-4 py-2">2%</td>
                <td className="px-4 py-2">53p in the £</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Before pension contributions and student loan repayments,
          which take their own percentages off the rise. Rates:{" "}
          {PAYE_RATES_LABEL}. Rules verified 20 November 2026.
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

      <section className="space-y-4 print:hidden">
        <h2 className={h2Class}>Related calculators</h2>
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
              Insurance — the standing figure this page compares your
              rise against.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/payslip-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What your payslip will actually say on the new salary —
              tax code, pension and student loan, month by month.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/salary-sacrifice-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Salary Sacrifice Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Trading salary for pension contributions — the route
              that can rescue a rise caught by the £100,000 taper.
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
              Part-time pay from any full-time salary — put a new
              offer and your current role on the same basis before
              you compare them.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-slate-300 group-hover:text-brand-800 dark:hover:text-brand-300">
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
