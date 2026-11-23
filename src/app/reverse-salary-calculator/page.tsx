import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import ReverseSalaryCalculator from "@/components/ReverseSalaryCalculator";
import { calculateRequiredSalary } from "@/lib/reverse-salary";
import { calculateTakeHome } from "@/lib/takehome";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/reverse-salary-calculator",
  "Required Salary Calculator — Reverse Salary Calculator UK, 2026/27",
  "Free required salary calculator for 2026/27: enter the take-home pay you need — or build it from your rent, bills and savings goal — and see the gross salary required, with the full Income Tax, National Insurance, pension and student loan breakdown at that salary.",
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

const PLAIN = {
  taxCode: "1257L",
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
} as const;

// The worked examples and the target table further down the page —
// every figure computed by the same solver the calculator above
// runs, so the page can never disagree with itself.
const EXAMPLE_1 = calculateRequiredSalary({
  ...PLAIN,
  targetNetAnnual: 2500 * 12,
});
const EXAMPLE_2 = calculateRequiredSalary({
  ...PLAIN,
  targetNetAnnual: 3000 * 12,
  studentLoanPlan: "plan2",
});
const EXAMPLE_3 = calculateRequiredSalary({
  ...PLAIN,
  targetNetAnnual: 2000 * 12,
  pensionPercent: 5,
});
const PLAIN_2000 = calculateRequiredSalary({
  ...PLAIN,
  targetNetAnnual: 2000 * 12,
});
// Monthly-target quick table (£2,000 / £2,800 / £3,000 / £4,000 a
// month) shown just above the real-numbers examples — same PLAIN
// assumptions and the same solver as everything else on this page.
const QUICK_TABLE = [2000, 2800, 3000, 4000].map((monthly) => ({
  monthly,
  result: calculateRequiredSalary({
    ...PLAIN,
    targetNetAnnual: monthly * 12,
  }),
}));

const TARGET_TABLE = [1800, 2200, 2600, 3000, 3500].map((monthly) => ({
  monthly,
  result: calculateRequiredSalary({
    ...PLAIN,
    targetNetAnnual: monthly * 12,
  }),
}));

// GEO context figures, computed on the shipped forward engine from
// the sourced inputs quoted in the text: the ONS median full-time
// salary, and a full-time year at the National Living Wage.
const MEDIAN_SALARY = 39039;
const MEDIAN_NET = calculateTakeHome({ annualSalary: MEDIAN_SALARY });
const NLW_HOURLY = 12.71;
const NLW_GROSS = NLW_HOURLY * 37.5 * 52;
const NLW_NET = calculateTakeHome({ annualSalary: NLW_GROSS });

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is a required salary calculator?",
    answer:
      "A required salary calculator works backwards: you name the take-home pay you need, and it finds the gross salary that produces it after Income Tax, National Insurance, pension contributions and student loan repayments. It is the same tool as a reverse salary calculator or a net-to-gross calculator — three names for one calculation. Use it before a job offer, a pay review or a move, when the figure you actually budget with is the one that lands in your account.",
  },
  {
    question: "What salary do I need to take home £2,500 a month?",
    answer: `A gross salary of ${fmtMoney(EXAMPLE_1.requiredGrossAnnual)} a year, on 2026/27 rates with the standard 1257L tax code and no pension contribution or student loan. At that salary the deductions are ${fmtMoney(EXAMPLE_1.breakdown.incomeTaxAnnual)} of Income Tax and ${fmtMoney(EXAMPLE_1.breakdown.employeeNiAnnual)} of National Insurance, leaving exactly £30,000 a year — £2,500 a month. Add a pension or a student loan above and the salary needed rises, because both come out of the same gross pay.`,
  },
  {
    question: "How is the required salary worked out?",
    answer:
      "By search, not by formula. Tax is charged in bands, the Personal Allowance tapers away between £100,000 and £125,140, and National Insurance changes rate at £50,270 — so no single percentage runs backwards. The calculator tries a gross salary, runs the full 2026/27 PAYE calculation on it, compares the take-home with your target, and narrows the range until it finds the smallest gross whose take-home reaches the target, to the penny. Every figure it reports is the output of a real calculation at a real salary.",
  },
  {
    question: "Does a pension change the salary I need?",
    answer: `Yes — the contribution comes out of your gross pay before the take-home is measured, so the gross has to cover it. To take home £2,000 a month with a 5% pension contribution (net-pay arrangement) you need ${fmtMoney(EXAMPLE_3.requiredGrossAnnual)}, against ${fmtMoney(PLAIN_2000.requiredGrossAnnual)} with no contribution. The pension is not lost money — it is in your pension pot, and under a net-pay arrangement it also reduces the tax you pay — but the salary has to be higher for the same money in your account.`,
  },
  {
    question: "Does a student loan change the salary I need?",
    answer: `Yes. Repayments take 9% of everything over your plan's threshold (6% for the Postgraduate Loan), and that slice has to be funded by gross pay too. To take home £3,000 a month with a Plan 2 loan you need ${fmtMoney(EXAMPLE_2.requiredGrossAnnual)} — ${fmtMoney(EXAMPLE_2.requiredGrossAnnual - TARGET_TABLE[3].result.requiredGrossAnnual)} more than the ${fmtMoney(TARGET_TABLE[3].result.requiredGrossAnnual)} needed with no loan. The thresholds for 2026/27 run from £25,000 (Plan 5) to £33,795 (Plan 4).`,
  },
  {
    question: "What take-home pay does a typical UK salary produce?",
    answer: `The median gross pay for full-time employees was £39,039 a year in April 2025 (ONS, Annual Survey of Hours and Earnings 2025). Run through the 2026/27 bands with no pension or student loan, that salary leaves ${fmtMoney(MEDIAN_NET.netAnnual)} a year — ${fmtMoney(MEDIAN_NET.netMonthly)} a month. So a take-home target around £2,600 a month is roughly the middle of full-time work; a target of £3,500 a month needs ${fmtMoney(TARGET_TABLE[4].result.requiredGrossAnnual)} gross, well above the median.`,
  },
  {
    question: "Does this calculator use Scottish tax rates?",
    answer:
      "No — it uses the England, Wales and Northern Ireland Income Tax bands for 2026/27. Scotland sets its own rates and thresholds, with more bands, so a Scottish taxpayer needs a somewhat different gross salary for the same take-home. National Insurance and the student loan thresholds are the same across the UK, so those parts of the breakdown hold in Scotland too — but treat the headline salary as a guide only if you pay Scottish Income Tax.",
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
  name: "Required Salary Calculator",
  url: `${AppConfig.siteUrl}/reverse-salary-calculator`,
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

function ExampleTable({
  title,
  result,
  targetLabel,
}: {
  title: string;
  result: ReturnType<typeof calculateRequiredSalary>;
  targetLabel: string;
}) {
  const b = result.breakdown;
  const rows: { label: string; value: string; strong?: boolean }[] = [
    {
      label: "Required gross salary",
      value: fmtMoney(result.requiredGrossAnnual),
      strong: true,
    },
    ...(b.pensionAnnual > 0
      ? [{ label: "Pension contribution", value: `− ${fmtMoney(b.pensionAnnual)}` }]
      : []),
    { label: "Income Tax", value: `− ${fmtMoney(b.incomeTaxAnnual)}` },
    {
      label: "National Insurance",
      value: `− ${fmtMoney(b.employeeNiAnnual)}`,
    },
    ...(b.studentLoanAnnual > 0
      ? [
          {
            label: "Student loan repayment",
            value: `− ${fmtMoney(b.studentLoanAnnual)}`,
          },
        ]
      : []),
    {
      label: `Take-home pay (${targetLabel})`,
      value: `${fmtMoney(b.netAnnual)} a year · ${fmtMoney(b.netMonthly)} a month`,
      strong: true,
    },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm table-stack">
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
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReverseSalaryCalculatorPage() {
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
          Required Salary Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Enter the take-home pay you need and this reverse salary
          calculator works backwards through the 2026/27 tax bands to
          the gross salary that produces it — £2,500 a month take-home
          needs a {fmtMoney(EXAMPLE_1.requiredGrossAnnual)} salary.
          Add a pension or student loan, or build the target from
          your monthly costs in the Lifestyle Builder.
        </p>
      </section>

      <ReverseSalaryCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this required salary calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is a free hub of payroll calculators
          and business tools — no sign-up, no accounts, and every
          figure worked out in your browser. This one runs the hub's
          take-home maths in reverse. Either type the take-home pay
          you need, per month or per year, or switch to the Lifestyle
          Builder and add up what a month actually costs you; then
          add your pension percentage and student loan plan if you
          have them, and your tax code if it is not the standard
          1257L. The answer is the smallest gross salary whose
          take-home reaches your target, with the full breakdown at
          that salary underneath — the proof, not just the headline.
          If you already know the salary and want the same breakdown
          forwards, the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows what a payslip will say, month by month.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What salary do I need for my take-home target?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On 2026/27 rates, with the standard tax code and no pension
          or student loan, the table below is the solver's own answer
          for five common targets. The pattern to notice: the gross
          climbs faster than the target. Inside the basic-rate band
          every extra £1 of take-home needs about £1.39 of gross,
          because 28p is lost to tax and National Insurance on the
          way; once the salary passes £50,270 the same £1 needs about
          £1.72, and between £100,000 and £125,140 — where the
          Personal Allowance is withdrawn — about £2.63.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Take-home a month</th>
                <th className={thClass}>Take-home a year</th>
                <th className={thClass}>Gross salary needed</th>
                <th className={thClass}>Income Tax</th>
                <th className={thClass}>National Insurance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TARGET_TABLE.map(({ monthly, result }) => (
                <tr key={monthly}>
                  <td className={tdClass}>{fmtMoney(monthly)}</td>
                  <td className={tdClass}>{fmtMoney(monthly * 12)}</td>
                  <td className={`${tdClass} font-semibold text-slate-900 dark:text-slate-50`}>
                    {fmtMoney(result.requiredGrossAnnual)}
                  </td>
                  <td className={tdClass}>
                    {fmtMoney(result.breakdown.incomeTaxAnnual)}
                  </td>
                  <td className={tdClass}>
                    {fmtMoney(result.breakdown.employeeNiAnnual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          England, Wales and Northern Ireland rates, tax code 1257L,
          no pension contribution and no student loan. Add either in
          the calculator above and the gross salary needed rises —
          both are paid out of the same gross pay before it reaches
          you.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does a reverse salary calculation work?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          It cannot be a single sum, because the answer decides its
          own tax rates. Working forwards is arithmetic: salary in,
          bands applied, take-home out. Working backwards, you do
          not know which bands the salary falls into until you know
          the salary — and the Personal Allowance taper, the
          National Insurance rate change at £50,270 and the student
          loan thresholds all kink the line. So the calculator
          searches: it runs the full 2026/27 PAYE calculation on a
          candidate salary, compares the take-home with your target,
          and halves the gap, over and over, until the two match to
          the penny. The salary it reports is the smallest one whose
          take-home is at least your target — never a penny short.
          You can check any answer forwards in the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>
          : type the required salary in and the same take-home comes
          back out.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the Lifestyle Builder?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The second way into the calculator: instead of naming a
          take-home figure, you build one. Rent or mortgage, council
          tax, bills and utilities, food, transport, subscriptions,
          a savings goal and everything else — each cost a month,
          added up into the take-home pay your life actually needs.
          The solver then finds the gross salary behind it. Building
          the target this way catches the two mistakes a single
          guessed figure usually makes: forgetting a real cost
          (the car, the council tax), and forgetting to pay
          yourself — the savings line is part of the target, not
          whatever happens to be left. It is the honest way to
          answer the question behind most visits to this page:
          not "what does £40,000 leave me?" but "what do I need to
          earn to live the life I have costed?" If part of that
          life is paid for by a second income, the{" "}
          <Link href="/side-hustle-tax-calculator-uk" className={linkClass}>
            side hustle tax calculator
          </Link>{" "}
          works out what the extra work leaves after its own tax.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Quick table: the salary behind four monthly targets
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The four take-home targets readers ask for most, answered
          directly. Assumptions, stated plainly: 2026/27 England,
          Wales and Northern Ireland rates, the standard 1257L tax
          code, <strong>no pension contribution and no student
          loan</strong> — the solver&apos;s plain defaults. Add a
          pension or a loan in the calculator above and the gross
          needed for the same target rises.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Take-home you want, a month</th>
                <th className={thClass}>Gross salary needed, a year</th>
                <th className={thClass}>Gross salary needed, a month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {QUICK_TABLE.map(({ monthly, result }) => (
                <tr key={monthly}>
                  <td className={tdClass}>{fmtMoney(monthly)}</td>
                  <td className={`${tdClass} font-semibold text-slate-900 dark:text-slate-50`}>
                    {fmtMoney(result.requiredGrossAnnual)}
                  </td>
                  <td className={tdClass}>
                    {fmtMoney(result.requiredGrossMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does the required salary look like on real numbers?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three examples, worked by the same solver as the
          calculator above. The first is the plain case — a target,
          a tax code, nothing else. The second adds the deduction
          most graduates forget they are still paying. The third
          shows what a pension does to the salary a budget needs:
          the take-home target is the lowest of the three, yet the
          salary is higher than the first example's target would
          suggest, because 5% of it is spoken for before it reaches
          the account.
        </p>
        <ExampleTable
          title="Example 1 — £2,500 a month take-home, no pension, no student loan"
          result={EXAMPLE_1}
          targetLabel="the £2,500 a month target"
        />
        <ExampleTable
          title="Example 2 — £3,000 a month take-home, with a Plan 2 student loan"
          result={EXAMPLE_2}
          targetLabel="the £3,000 a month target"
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The Plan 2 repayment at that salary is{" "}
          {fmtMoney(EXAMPLE_2.breakdown.studentLoanAnnual)} a year —
          9% of everything over the £29,385 threshold — and every
          pound of it has to be earned before it can be repaid,
          which is why the required salary sits{" "}
          {fmtMoney(EXAMPLE_2.requiredGrossAnnual - TARGET_TABLE[3].result.requiredGrossAnnual)}{" "}
          above the no-loan figure for the same target. The{" "}
          <Link
            href="/student-loan-repayment-calculator"
            className={linkClass}
          >
            student loan repayment calculator
          </Link>{" "}
          shows the same repayments from the salary side, plan by
          plan.
        </p>
        <ExampleTable
          title="Example 3 — £2,000 a month take-home, with a 5% pension contribution"
          result={EXAMPLE_3}
          targetLabel="the £2,000 a month target"
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Without the pension, £2,000 a month needs{" "}
          {fmtMoney(PLAIN_2000.requiredGrossAnnual)}. The extra{" "}
          {fmtMoney(EXAMPLE_3.requiredGrossAnnual - PLAIN_2000.requiredGrossAnnual)}{" "}
          of salary funds the{" "}
          {fmtMoney(EXAMPLE_3.breakdown.pensionAnnual)} that goes
          into the pot — and because the contribution is taken under
          a net-pay arrangement, it also cuts the tax bill, which is
          why the extra salary is less than the contribution grossed
          up at the full marginal rate. Sacrificing salary instead
          saves National Insurance as well: the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows that side of the trade.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does the required salary compare with typical UK pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two official reference points put a target in context.
          Median gross annual pay for full-time employees was{" "}
          {fmtMoney(MEDIAN_SALARY)} in April 2025, according to the{" "}
          <a
            href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/2025"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Office for National Statistics (ASHE 2025)
          </a>
          ; on 2026/27 rates that salary leaves{" "}
          {fmtMoney(MEDIAN_NET.netAnnual)} a year —{" "}
          {fmtMoney(MEDIAN_NET.netMonthly)} a month — before any
          pension or student loan. At the other end, the National
          Living Wage for workers aged 21 and over is £12.71 an hour
          from 1 April 2026 (
          <a
            href="https://www.gov.uk/government/news/national-living-wage-increases-to-1271-per-hour"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GOV.UK
          </a>
          ), which works out at about {fmtMoney(NLW_GROSS)} a year
          for a 37.5-hour week, leaving about{" "}
          {fmtMoney(NLW_NET.netMonthly)} a month after tax and
          National Insurance. A take-home target much above that
          needs more than a full-time minimum-wage salary — which
          is exactly the gap a pay rise has to close, and the{" "}
          <Link href="/pay-rise-calculator" className={linkClass}>
            pay rise calculator
          </Link>{" "}
          shows what a given rise is worth after tax. Part-time
          targets work the same way in reverse: the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          and the{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          translate the required salary into the hours and rates
          that produce it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Methodology and sources
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The solver inverts this hub's own payslip engine — the
          same calculation the payslip calculator runs forwards —
          by binary search to the penny, so a figure from this page
          and a figure from that one can never disagree. Income Tax
          and National Insurance use the 2026/27 bands and
          thresholds in the hub's rates file, verified against
          GOV.UK on 7 November 2026: Personal Allowance £12,570
          (tapering by £1 for every £2 of income over £100,000),
          20% on the first £37,700 of taxable income, 40% up to
          £125,140 and 45% above; employee National Insurance at 8%
          between £12,570 and £50,270 and 2% above. Student loan
          repayments use GOV.UK's 2026/27 monthly thresholds and
          rates, checked 17 November 2026 (Plan 1 £26,900 a year,
          Plan 2 £29,385, Plan 4 £33,795, Plan 5 £25,000, all at 9%;
          Postgraduate Loan £21,000 at 6%). The pay comparisons are
          the ONS Annual Survey of Hours and Earnings 2025 (median
          full-time pay, April 2025, published 23 October 2025) and
          the National Living Wage rate published by GOV.UK for
          1 April 2026.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits of this calculator
        </h2>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>England, Wales and Northern Ireland only.</strong>{" "}
            Scottish Income Tax has its own bands and rates and is
            not modelled; a Scottish taxpayer's required salary
            differs. National Insurance and student loan thresholds
            are UK-wide.
          </li>
          <li>
            <strong>One job, salary only, a full steady year.</strong>{" "}
            Annual figures are the monthly model twelve times over.
            Bonuses, benefits in kind, other income and mid-year
            starts all move a real payslip; real PAYE is also
            cumulative, so a single month can differ.
          </li>
          <li>
            <strong>Pension means a net-pay arrangement.</strong>{" "}
            The contribution is a percentage of gross, taken before
            tax but not before National Insurance — the model the
            payslip calculator uses. Salary sacrifice and
            relief-at-source pensions change the answer.
          </li>
          <li>
            <strong>Tax codes are applied as PAYE applies them.</strong>{" "}
            The standard 1257L carries the £100,000 taper inside
            this calculation; any other code is taken at face value,
            because HMRC builds its own adjustments into the code it
            issues.
          </li>
          <li>
            <strong>The target is take-home after the deductions you
            switch on.</strong> Anything you do not enter — a second
            student loan plan combination beyond the ones offered,
            childcare vouchers, a company car — is not in the
            figure.
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked on 22 November 2026
          against GOV.UK (Income Tax and National Insurance rates
          and thresholds for 2026/27; student loan repayment
          thresholds; the National Living Wage from 1 April 2026)
          and the ONS Annual Survey of Hours and Earnings 2025.
          This page is a working tool and a guide, not tax or
          financial advice.
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

      <RelatedCalculators href="/reverse-salary-calculator" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
