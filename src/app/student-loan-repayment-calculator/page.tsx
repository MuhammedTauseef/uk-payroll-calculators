import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import StudentLoanCalculator from "@/components/StudentLoanCalculator";
import {
  calculateStudentLoan,
  STUDENT_LOAN_PLANS,
  studentLoanPlan,
} from "@/lib/student-loan";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = pageMetadata(
  "/student-loan-repayment-calculator",
  "Student Loan Repayment Calculator — What You Repay on Your Salary",
  "Free student loan repayment calculator: what you repay each month and year on Plans 1, 2, 4 and 5 and the Postgraduate Loan, at the 2026/27 GOV.UK thresholds — 9% over the threshold, 6% for postgraduate loans.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Worked example — computed by the same function the calculator
// runs, so the page can never disagree with itself.
const exHeadline = calculateStudentLoan({
  annualIncome: 35000,
  undergraduatePlan: "plan2",
  hasPostgraduateLoan: false,
});
const PLAN_ROWS = STUDENT_LOAN_PLANS.map((plan) => ({
  plan,
  result: calculateStudentLoan({
    annualIncome: 40000,
    undergraduatePlan: plan.id === "postgraduate" ? null : plan.id,
    hasPostgraduateLoan: plan.id === "postgraduate",
  }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much student loan do I repay a month?",
    answer:
      "9% of your income over your plan's threshold (6% for a Postgraduate Loan). On Plan 2 in 2026/27 the threshold is £29,385 a year, so on a £35,000 salary you repay 9% of £5,615 — £505.35 a year, about £42.11 a month. Payroll works it out per pay period against the monthly threshold (£2,448 for Plan 2), so a month with a bonus takes a little more.",
  },
  {
    question: "Does the amount I owe change my repayments?",
    answer:
      "No. The repayment is a percentage of income over the threshold — it is the same whether you borrowed £20,000 or £60,000. The balance only decides whether the loan is cleared before it is written off. That is why two graduates on the same salary and plan have identical deductions but very different statements.",
  },
  {
    question: "What are the student loan thresholds for 2026/27?",
    answer:
      "Plan 1: £26,900 a year. Plan 2: £29,385. Plan 4: £33,795. Plan 5: £25,000. Postgraduate Loan: £21,000. Plans 1, 2, 4 and 5 repay at 9% of income over the threshold; the Postgraduate Loan repays at 6%. Thresholds usually change each April — these are the GOV.UK figures for 2026/27, checked 17 November 2026.",
  },
  {
    question: "What happens if I have two student loans?",
    answer:
      "Two undergraduate plans are repaid as one: 9% of income over the LOWEST of the two thresholds. An undergraduate plan plus a Postgraduate Loan is different — both run at once, so you pay 9% over the undergraduate threshold AND 6% over £21,000. On £30,000 with Plan 2 and a Postgraduate Loan that is £55.35 + £540 = £595.35 a year.",
  },
  {
    question: "When is a student loan written off?",
    answer:
      "It depends on the plan. Plan 2 and Postgraduate Loans are written off 30 years after the April you were first due to repay; Plan 5 after 40 years. Plan 1 and Plan 4 depend on when and where you studied. Whatever is left at that point is cancelled — which is why repaying early only ever pays off for high earners likely to clear the balance in full.",
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
  name: "Student Loan Repayment Calculator",
  url: `${AppConfig.siteUrl}/student-loan-repayment-calculator`,
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

export default function StudentLoanRepaymentCalculatorPage() {
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
          Student Loan Repayment Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          You repay 9% of what you earn over your plan&apos;s
          threshold — 6% for a Postgraduate Loan — and nothing at all
          below it. On Plan 2 and a £35,000 salary that is{" "}
          {gbp.format(exHeadline.totalAnnual)} a year,{" "}
          {gbp.format(exHeadline.totalMonthly)} a month, at the
          2026/27 thresholds.
        </p>
      </section>

      <StudentLoanCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How student loan repayments are worked out
        </h2>
        <p className={bodyClass}>
          The calculation has three steps, and the size of your loan
          is not one of them. Take your income, subtract your
          plan&apos;s threshold, and apply the plan&apos;s percentage
          to what is left:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Plan</th>
                <th className={thClass}>Threshold 2026/27</th>
                <th className={thClass}>Rate over it</th>
                <th className={thClass}>Repaid on £40,000 a year</th>
                <th className={thClass}>Per month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PLAN_ROWS.map(({ plan, result }) => (
                <tr key={plan.id}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {plan.label}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(plan.annualThreshold)}
                  </td>
                  <td className={tdClass}>{plan.rate * 100}%</td>
                  <td className={tdClass}>
                    {gbp.format(result.totalAnnual)}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(result.totalMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Two details catch people out. First, payroll applies the
          MONTHLY threshold (£2,448 for Plan 2) to each month&apos;s
          pay separately, so overtime or a bonus in one month triggers
          a repayment even if the year&apos;s income ends up under the
          annual threshold — the overpayment can be reclaimed from the
          Student Loans Company at the year end. Second, repayments
          from two jobs are worked out job by job, never on combined
          income, so two part-time salaries under the threshold repay
          nothing between them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Student loan and the rest of your payslip
        </h2>
        <p className={bodyClass}>
          The repayment sits alongside Income Tax and National
          Insurance, and the three stack. A Plan 2 graduate on £35,000
          is in the band where each extra £1 of pay loses 20p of tax,
          8p of National Insurance and 9p of student loan — an
          effective 37p in the pound before any pension contribution.
          That stacking is why the loan matters most exactly where pay
          rises start: crossing the {gbp.format(studentLoanPlan("plan2").annualThreshold)}{" "}
          threshold does not create a cliff (only income ABOVE it is
          charged), but every rise after it is worth 9% less. To see
          the repayment in its place on the payslip itself, use the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>
          ; for the full take-home picture without the loan lines, the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows the tax and NI on their own.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Thresholds and rates from GOV.UK, “Repaying your student
          loan — How much you repay”, checked 17 November 2026.
          Repayments through PAYE are calculated by your employer per
          pay period; the Student Loans Company, not HMRC, holds the
          balance and the interest that applies to it.
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
            href="/payslip-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The whole monthly payslip — gross pay, tax, National
              Insurance, pension and the student loan line together.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What a salary leaves after Income Tax and National
              Insurance — per year, per month, per week and per day.
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
              Sacrificing salary into a pension lowers the income your
              repayments are charged on as well as your tax — see what
              it saves on both.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
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
              Build a printable payslip from one period&apos;s pay,
              with the deductions set out line by line.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the generator →
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
