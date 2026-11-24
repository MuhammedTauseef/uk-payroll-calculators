import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SalaryComparisonCalculator from "@/components/SalaryComparisonCalculator";
import {
  calculateSalaryComparison,
  type SalaryComparisonResult,
} from "@/lib/salary-comparison";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/salary-comparison-calculator",
  "Salary Comparison Calculator UK — Compare Two Salaries After Tax, 2026/27",
  "Free salary comparison calculator for 2026/27: compare two salaries after tax side by side — take-home a year, a month and an hour, how much of the rise you keep, the marginal rate, total reward with employer pension, and the £100k 60% tax trap named.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// The worked examples further down the page — every one computed
// by the same engine the calculator above runs, so the page can
// never disagree with itself.
const EX_MAIN = calculateSalaryComparison({
  a: { salary: 40000 },
  b: { salary: 60000 },
});
const EX_RISE = calculateSalaryComparison({
  a: { salary: 45000 },
  b: { salary: 55000 },
});
const EX_TAPER = calculateSalaryComparison({
  a: { salary: 100000 },
  b: { salary: 125000 },
});
const EX_REWARD = calculateSalaryComparison({
  a: { salary: 55000, employeePensionPercent: 5, employerPensionPercent: 3 },
  b: { salary: 52000, employeePensionPercent: 5, employerPensionPercent: 12 },
});
const EX_LOAN = calculateSalaryComparison({
  a: { salary: 40000 },
  b: { salary: 60000 },
  undergraduatePlan: "plan2",
});
const EX_PART = calculateSalaryComparison({
  a: { salary: 30000, hoursPerWeek: 37.5 },
  b: { salary: 24000, hoursPerWeek: 30 },
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I compare two salaries after tax?",
    answer:
      "Run both salaries through the same Income Tax bands, National Insurance and — if you have one — student loan, then compare the take-home figures, not the gross ones. The two salaries share nothing: each gets its own Personal Allowance (£12,570 in 2026/27) and its own run through the bands, because you would hold one job or the other, not both. (Two jobs held at once are taxed differently — the incomes are added together — and our second job tax calculator covers that.) Then compare like with like: take-home a year, a month and, if the hours differ, an hour.",
  },
  {
    question: "Can I use this to compare two job offers?",
    answer:
      "Yes — that is what it is built for. Put the current job in as Salary A and the offer as Salary B, and add what makes offers differ beyond the headline salary: the bonus, your pension percentage under each scheme, and the employer's pension percentage. Two offers with the same salary can be thousands apart once the employer pension is counted: a £52,000 offer with a 12% employer pension is worth £58,240 in total reward, against £56,650 for a £55,000 offer with a 3% employer pension — the lower salary is the better offer. Hours matter too: set each offer's hours a week and compare the take-home per hour.",
  },
  {
    question: "Why is the take-home difference smaller than the gross difference?",
    answer:
      "Because a rise is taxed at your marginal rate — the rate on the next pound — not at your average rate. Moving from £40,000 to £60,000, the first part of the rise is taxed at 20% plus 8% National Insurance, but everything past £50,270 is taxed at 40% plus 2% NI. So of the £20,000 gross rise, £13,037.80 reaches your bank: you keep 65.19% of it. The wider the rise and the higher it reaches, the smaller the share — a rise from £100,000 to £125,000 keeps only 38% of itself, because it runs through the Personal Allowance taper as well.",
  },
  {
    question: "Does this include student loans or pensions?",
    answer:
      "Both, if you enter them. Pick your student loan plan and the repayment is charged on each salary over the plan threshold (Plan 2: 9% of income over £29,385 in 2026/27) — with a Plan 2 loan, the £40,000-to-£60,000 rise keeps 56.19% instead of 65.19%, because the loan takes 9% of most of the rise. Your pension percentage comes off each salary before tax, National Insurance and student loan (the salary-sacrifice / net-pay basis), and the employer's pension percentage is added into the total reward figure so offers with different schemes compare fairly.",
  },
  {
    question: "What is the 60% tax trap between £100,000 and £125,140?",
    answer:
      "Between £100,000 and £125,140 your Personal Allowance is withdrawn at £1 for every £2 of income over £100,000. Each extra £100 of pay in that zone is taxed at 40% — and the £50 of allowance it drags away is taxed too, another £20 — so £60 of every £100 goes in Income Tax before National Insurance takes its 2%: a 62% marginal rate, or 71% with a 9% student loan. It is why a rise from £100,000 to £125,000 — £25,000 of gross — adds only £9,500 of take-home. Pension contributions that bring your pay back under £100,000 restore the allowance, which is often worth more than the rise itself.",
  },
  {
    question: "Is a higher salary always worth it after tax?",
    answer:
      "In cash terms, yes — there is no point in the UK tax system where earning more leaves you with less take-home; every extra pound keeps something, even if it is only 29p inside the taper zone with a student loan. Whether it is worth it is a wider question: the higher-paying offer may carry a weaker pension (which can wipe out the cash gain — see the total reward figures above), longer hours (compare the take-home per hour, not the salary), or a bonus that is not guaranteed. Compare the take-home, the total reward and the hourly figure together, and the answer is usually clear.",
  },
  {
    question: "Does this calculator use Scottish tax rates?",
    answer:
      "No. The Income Tax figures use the England, Wales and Northern Ireland bands for 2026/27. Scotland sets its own Income Tax rates and thresholds — it has more bands, and a higher top rate — so a Scottish taxpayer's take-home on the same two salaries will differ. National Insurance, though, is charged at the same rates and thresholds across the whole UK, so the NI figures hold exactly.",
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
  name: "Salary Comparison Calculator UK",
  url: `${AppConfig.siteUrl}/salary-comparison-calculator`,
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

function ComparisonTable({
  title,
  result,
  labelA = "Salary A",
  labelB = "Salary B",
}: {
  title: string;
  result: SalaryComparisonResult;
  labelA?: string;
  labelB?: string;
}) {
  const { a, b } = result;
  const showPension = a.employeePension > 0 || b.employeePension > 0;
  const showLoan = a.studentLoan > 0 || b.studentLoan > 0;
  const showReward = a.employerPension > 0 || b.employerPension > 0;
  const rows: { label: string; va: string; vb: string; strong?: boolean }[] = [
    {
      label: "Gross pay",
      va: fmtMoney(a.grossPay),
      vb: fmtMoney(b.grossPay),
    },
    ...(showPension
      ? [
          {
            label: "Your pension",
            va: `−${fmtMoney(a.employeePension)}`,
            vb: `−${fmtMoney(b.employeePension)}`,
          },
        ]
      : []),
    {
      label: "Income Tax",
      va: `−${fmtMoney(a.incomeTax)}`,
      vb: `−${fmtMoney(b.incomeTax)}`,
    },
    {
      label: "National Insurance",
      va: `−${fmtMoney(a.nationalInsurance)}`,
      vb: `−${fmtMoney(b.nationalInsurance)}`,
    },
    ...(showLoan
      ? [
          {
            label: "Student loan",
            va: `−${fmtMoney(a.studentLoan)}`,
            vb: `−${fmtMoney(b.studentLoan)}`,
          },
        ]
      : []),
    {
      label: "Take-home a year",
      va: fmtMoney(a.takeHomeAnnual),
      vb: fmtMoney(b.takeHomeAnnual),
      strong: true,
    },
    {
      label: "Take-home a month",
      va: fmtMoney(a.takeHomeMonthly),
      vb: fmtMoney(b.takeHomeMonthly),
    },
    {
      label: "Take-home an hour",
      va: fmtMoney(a.takeHomeHourly),
      vb: fmtMoney(b.takeHomeHourly),
    },
    ...(showReward
      ? [
          {
            label: "Employer pension (on top)",
            va: fmtMoney(a.employerPension),
            vb: fmtMoney(b.employerPension),
          },
          {
            label: "Total reward",
            va: fmtMoney(a.totalReward),
            vb: fmtMoney(b.totalReward),
            strong: true,
          },
        ]
      : []),
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm table-stack">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className={thClass}></th>
              <th className={thClass}>{labelA}</th>
              <th className={thClass}>{labelB}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.label}
                </td>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.va}
                </td>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.vb}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SalaryComparisonCalculatorPage() {
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

      <section className="space-y-3 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Salary Comparison Calculator UK
        </h1>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          {/* Answer-first summary (40–60 words). */}
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Comparing two salaries after tax means running both
            through the same Income Tax bands, National Insurance and
            student loan, then comparing the take-home — not the
            gross. A rise from {fmtMoney(EX_MAIN.a.grossPay)} to{" "}
            {fmtMoney(EX_MAIN.b.grossPay)} sounds like{" "}
            {fmtMoney(EX_MAIN.grossDifference)}; after tax it is
            worth {fmtMoney(EX_MAIN.takeHomeDifferenceAnnual)} a
            year. You keep {EX_MAIN.keepPercentOfDifference}% of it.
          </p>
        </div>
      </section>

      <SalaryComparisonCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this salary comparison calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators (payrollcalc.co.uk) is a free hub of
          UK pay and tax calculators, built on the rules published by
          GOV.UK and HMRC — no sign-up, no accounts, and every figure
          worked out in your browser. Put one salary in as A and the
          other as B: a job offer against your current job, a
          promotion against staying put, a part-time offer against a
          full-time one. Add the bonus, the pension percentages and
          the hours where they differ — the comparison is only honest
          when the whole package goes in. If the two figures are two
          jobs you would hold at the same time rather than choose
          between, they are taxed on the combined income instead, and
          the{" "}
          <Link href="/second-job-tax-calculator" className={linkClass}>
            second job tax calculator
          </Link>{" "}
          is the tool for that. If the comparison is a rise in the
          job you already have, the{" "}
          <Link href="/pay-rise-calculator" className={linkClass}>
            pay rise calculator
          </Link>{" "}
          walks through it year by year.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you compare two salaries after tax?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Each salary is taxed standing alone — its own Personal
          Allowance, its own run through the bands — because you
          would hold one job or the other. Two facts worth quoting
          exactly, both from GOV.UK: the Personal Allowance is
          £12,570 for 2026/27, and employee National Insurance is 8%
          between £12,570 and £50,270 and 2% above that. So the
          £60,000 salary pays {fmtMoney(EX_MAIN.b.incomeTax)} of
          Income Tax and {fmtMoney(EX_MAIN.b.nationalInsurance)} of
          NI, and the honest comparison is not £40,000 against
          £60,000 — it is {fmtMoney(EX_MAIN.a.takeHomeAnnual)} of
          take-home against {fmtMoney(EX_MAIN.b.takeHomeAnnual)}.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band (2026/27)</th>
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Personal Allowance</td>
                <td className={tdClass}>
                  The first £12,570 (tapering away over £100,000)
                </td>
                <td className={tdClass}>0%</td>
              </tr>
              <tr>
                <td className={tdClass}>Basic rate</td>
                <td className={tdClass}>
                  £0 to £37,700 — income up to £50,270 with a full
                  allowance
                </td>
                <td className={tdClass}>20%</td>
              </tr>
              <tr>
                <td className={tdClass}>Higher rate</td>
                <td className={tdClass}>£37,701 to £125,140</td>
                <td className={tdClass}>40%</td>
              </tr>
              <tr>
                <td className={tdClass}>Additional rate</td>
                <td className={tdClass}>Over £125,140</td>
                <td className={tdClass}>45%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ComparisonTable
          title="Worked example — £40,000 against £60,000"
          result={EX_MAIN}
          labelA="£40,000"
          labelB="£60,000"
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The difference that reaches the bank is{" "}
          {fmtMoney(EX_MAIN.takeHomeDifferenceAnnual)} a year —{" "}
          {fmtMoney(EX_MAIN.takeHomeDifferenceMonthly)} a month. If
          you are working the other way, from a monthly take-home
          you need to a salary that produces it, the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            reverse salary calculator
          </Link>{" "}
          starts from the target figure.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Why is the take-home difference smaller than the gross
          difference?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Because a rise is taxed at the marginal rate — the rate on
          the next pound you earn — not at the average rate across
          your whole salary. At £60,000 the next £100 loses{" "}
          {fmtMoney(EX_MAIN.b.marginalRatePercent)} to tax and NI:
          the 40% band has started, even though the average
          deduction across the salary is only{" "}
          {EX_MAIN.b.effectiveDeductionPercent}%. The effect grows
          as a rise crosses the £50,270 line. Moving from £45,000 to
          £55,000, the take-home rises by{" "}
          {fmtMoney(EX_RISE.takeHomeDifferenceAnnual)} of the
          £10,000 — {EX_RISE.keepPercentOfDifference}% kept — because
          £4,730 of the rise is taxed at 40% while the same pounds,
          in the old salary, were never taxed at all. The{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows the same story one pay packet at a time.
        </p>
        <ComparisonTable
          title="Worked example — £45,000 against £55,000 (crossing the 40% line)"
          result={EX_RISE}
          labelA="£45,000"
          labelB="£55,000"
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Compare two job offers: total reward, not just salary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A salary is only part of an offer. The employer&apos;s
          pension contribution is real pay — it just lands in a
          pension pot instead of a bank account — and schemes vary
          far more than salaries do: the legal minimum total
          contribution is 8% of qualifying earnings, but plenty of
          employers pay 10% or more on their own. Put both
          percentages in and this calculator sets the total reward —
          gross pay plus employer pension — next to the take-home.
          The example below is the case that catches people out:
          Salary B pays {fmtMoney(Math.abs(EX_REWARD.takeHomeDifferenceAnnual))}{" "}
          a year LESS in take-home than Salary A, yet it is worth{" "}
          {fmtMoney(EX_REWARD.totalRewardDifference)} a year MORE in
          total reward, because its employer puts 12% into the
          pension against A&apos;s 3%. Which one wins depends on
          whether you need the cash now or the pension later — but
          you cannot make that call from the two salaries alone.
          Pension percentages on both sides can be changed with the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>
          , which works through what giving up salary for pension
          does to the tax bill itself.
        </p>
        <ComparisonTable
          title="Worked example — £55,000 with a 3% employer pension against £52,000 with 12%"
          result={EX_REWARD}
          labelA="£55,000 · employer 3%"
          labelB="£52,000 · employer 12%"
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The 60% tax trap: £100,000 to £125,140
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One zone of the comparison deserves its own warning,
          because neither salary in it looks as bad as it is. Past
          £100,000, GOV.UK withdraws the Personal Allowance by £1
          for every £2 of income — so between £100,000 and £125,140
          each extra £100 of pay is taxed at 40% and drags £50 of
          allowance into tax behind it: an effective 60% Income Tax
          rate, 62% with National Insurance, 71% with a 9% student
          loan. A rise from £100,000 to £125,000 adds £25,000 of
          gross and only {fmtMoney(EX_TAPER.takeHomeDifferenceAnnual)}{" "}
          of take-home — {EX_TAPER.keepPercentOfDifference}% of the
          rise kept. Salary B in the example is left with a Personal
          Allowance of {fmtMoney(EX_TAPER.b.personalAllowance)}. The
          escape hatch is a pension contribution big enough to bring
          pay back under £100,000, which restores the whole
          allowance; the{" "}
          <Link
            href="/adjusted-net-income-calculator"
            className={linkClass}
          >
            adjusted net income calculator
          </Link>{" "}
          works out the exact contribution that does it.
        </p>
        <ComparisonTable
          title="Worked example — £100,000 against £125,000 (inside the taper)"
          result={EX_TAPER}
          labelA="£100,000"
          labelB="£125,000"
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Part-time and pro-rata offers: compare the hour, not the
          headline
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A £24,000 salary looks like a pay cut next to £30,000 —
          until the hours go in. At 30 hours a week against 37.5,
          the two offers below pay the same gross rate per hour,{" "}
          {fmtMoney(EX_PART.a.grossHourly)} — and the part-time
          offer actually keeps MORE of each hour:{" "}
          {fmtMoney(EX_PART.b.takeHomeHourly)} of take-home an hour
          against {fmtMoney(EX_PART.a.takeHomeHourly)}, because the
          same Personal Allowance and the same tax-free slice are
          spread over fewer pounds. Set each offer&apos;s hours in
          the calculator and judge it on the hourly take-home and
          the weekly figure, not the annual headline.
        </p>
        <ComparisonTable
          title="Worked example — £30,000 full-time (37.5 hours) against £24,000 at 30 hours"
          result={EX_PART}
          labelA="£30,000 · 37.5h"
          labelB="£24,000 · 30h"
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Student loans in a salary comparison
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A student loan quietly takes another slice of any rise:
          repayments are a percentage of income over the plan
          threshold — for Plan 2, 9% of everything over £29,385
          (GOV.UK, 2026/27) — so most of a mid-career rise is over
          the threshold and repays at the full 9%. The £40,000 to
          £60,000 comparison with a Plan 2 loan keeps{" "}
          {EX_LOAN.keepPercentOfDifference}% of the rise instead of{" "}
          {EX_MAIN.keepPercentOfDifference}% without one, and the
          marginal rate at £60,000 climbs to{" "}
          {EX_LOAN.b.marginalRatePercent}% — 40% tax, 2% NI and 9%
          loan on every extra £100. The{" "}
          <Link
            href="/student-loan-repayment-calculator"
            className={linkClass}
          >
            student loan repayment calculator
          </Link>{" "}
          works through each plan&apos;s threshold, balance and
          payoff date on a single income.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scotland: this page uses the England, Wales and Northern
          Ireland Income Tax bands. Scotland sets its own Income Tax
          rates and thresholds, so a Scottish taxpayer&apos;s
          take-home on the same two salaries differs — but National
          Insurance is UK-wide, charged at the same thresholds, so
          the NI figures hold exactly.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 23
          November 2026 — the Income Tax bands, the Personal
          Allowance (£12,570) and its £1-for-£2 withdrawal over
          £100,000 from HMRC&apos;s rates and allowances, the Class
          1 Primary Threshold (£12,570) and Upper Earnings Limit
          (£50,270) and the 8% and 2% employee rates from
          &ldquo;Rates and thresholds for employers 2026 to
          2027&rdquo;, and the Plan 2 student loan threshold
          (£29,385) and 9% rate from GOV.UK&apos;s student loan
          repayment guidance. Pension percentages use the
          salary-sacrifice / net-pay basis (your contributions taken
          off pay before tax, NI and student loan); a
          relief-at-source pension gives a slightly different NI
          figure, and bonuses are taxed in full and are not
          pensionable here. This page is a working tool and a guide,
          not tax or financial advice.
        </p>
      </section>

      <section className="space-y-4 print:hidden">
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

      <RelatedCalculators href="/salary-comparison-calculator" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
