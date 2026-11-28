import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import MonthlySalaryCalculator from "@/components/MonthlySalaryCalculator";
import { calculateMonthlySalary } from "@/lib/monthly-salary";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/monthly-salary-calculator",
  "Monthly Salary Calculator UK — Take-Home Pay Per Month 2026/27",
  "Enter your pay the way you know it — per month, per year or per week — and see the monthly take-home pay for 2026/27 after Income Tax and National Insurance, with the full monthly breakdown.",
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

// Worked examples — every figure is this page's own engine run on
// the stated pay, not a copied table.
const ex3000 = calculateMonthlySalary({ amount: 3000, period: "monthly", ...plain });
const ex2500 = calculateMonthlySalary({ amount: 2500, period: "monthly", ...plain });
const ex4000 = calculateMonthlySalary({ amount: 4000, period: "monthly", ...plain });
const median = calculateMonthlySalary({ amount: 39039, period: "annual", ...plain });

const COMMON_MONTHLY = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000];
const commonRows = COMMON_MONTHLY.map((monthly) => ({
  monthly,
  result: calculateMonthlySalary({ amount: monthly, period: "monthly", ...plain }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I calculate my monthly salary?",
    answer:
      "Gross monthly pay is the annual salary divided by 12. Monthly take-home pay takes more work: the year's Income Tax and National Insurance are calculated on the annual salary first — Personal Allowance £12,570, then 20% tax on the next £37,700, 40% above it, and National Insurance at 8% between £12,570 and £50,270 and 2% above — and the year's net pay is then divided by 12. On £3,000 a month gross (£36,000 a year) that gives £2,453.30 a month take-home for 2026/27.",
  },
  {
    question: "How much tax do I pay on £3,000 a month?",
    answer:
      "£3,000 a month is a £36,000 salary. For 2026/27 the Income Tax is £4,686 a year (£390.50 a month) and National Insurance is £1,874.40 a year (£156.20 a month), leaving £2,453.30 a month, before any pension contribution or student loan. Every pound of the salary above £12,570 and below £50,270 loses 20% to tax and 8% to National Insurance, so the monthly figures move by 72p for every £1 of gross in that range.",
  },
  {
    question: "Is monthly take-home pay just the annual figure divided by 12?",
    answer:
      "For a steady salary, yes — that is how this calculator works, and over a full tax year it is how PAYE settles too. A single real payslip can still differ: PAYE is cumulative, so tax is worked out on your pay to date in the tax year, and a bonus month, a mid-year start or a tax code change makes individual months uneven before they even out. National Insurance is not cumulative — it is worked out fresh each pay period, which is why a bonus month can carry more NI than a twelfth of the year suggests.",
  },
  {
    question: "Why is my first payslip lower than the calculator says?",
    answer:
      "Usually one of three things: an emergency or non-cumulative tax code (BR, or a code ending in M1/W1/X) that taxes the month as if it stood alone; a pension contribution starting immediately while the calculator's default has none; or student loan deductions, which begin as soon as a month's pay passes the plan's monthly threshold. Check the tax code on the payslip first — the payslip calculator on this site reads tax codes and shows the same month the way payroll works it out.",
  },
  {
    question: "Does this calculator work for Scotland?",
    answer:
      "The bands here are the England, Wales and Northern Ireland ones. Scotland has six Income Tax bands of its own, so a Scottish salary takes home a different amount — up to £39.67 a year more below £33,493 of salary, and more tax above it (£1,496.05 a year more on £50,000). Use the salary calculator for Scotland on this site for the Scottish figure; National Insurance and the Personal Allowance are the same UK-wide figures in both.",
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
  name: "Monthly Salary Calculator UK",
  url: `${AppConfig.siteUrl}/monthly-salary-calculator`,
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

export default function MonthlySalaryCalculatorPage() {
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
          Monthly Salary Calculator UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Enter your pay the way you know it — a month, a year or a
          week — and this calculator works out the monthly take-home
          pay for 2026/27. £3,000 a month gross (£36,000 a year)
          leaves {gbp.format(ex3000.netMonthly)} a month after{" "}
          {gbp.format(ex3000.incomeTaxMonthly)} of Income Tax and{" "}
          {gbp.format(ex3000.employeeNiMonthly)} of National
          Insurance.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this one runs
          the same forward engine as the site&apos;s payslip
          calculator, so the monthly figure here and the payslip
          figure there can never disagree.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · 2026/27 rates
          verified against GOV.UK (hub rates file, 7 November 2026).
        </p>
      </section>

      <MonthlySalaryCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>How is monthly take-home pay calculated?</h2>
        <p className={bodyClass}>
          In three steps, and the order matters. First, the pay is
          annualised — a monthly figure times 12, a weekly figure
          times 52 — because Income Tax is an annual tax. Second, the
          year&apos;s deductions are worked out on the 2026/27 rules:
          the first £12,570 is the tax-free Personal Allowance (it
          tapers away between £100,000 and £125,140), Income Tax is
          20% on the next £37,700, 40% up to £125,140 and 45% above,
          and employee National Insurance is 8% of earnings between
          £12,570 and £50,270 and 2% above that. Third, the
          year&apos;s take-home pay is divided by 12. A pension
          contribution (modelled here as a net-pay arrangement, so
          it reduces the tax but not the NI) and any student loan
          repayment — worked out per month on the plan&apos;s
          threshold, as payroll does — come off on the way.
        </p>
        <p className={bodyClass}>
          Worked through on £3,000 a month: the salary is £36,000,
          taxable income is £36,000 − £12,570 = £23,430, the tax is
          20% of that — {gbp.format(ex3000.incomeTaxAnnual)} — and NI
          is 8% of the same £23,430 —{" "}
          {gbp.format(ex3000.employeeNiAnnual)}. What is left,{" "}
          {gbp.format(ex3000.netAnnual)} a year, is{" "}
          {gbp.format(ex3000.netMonthly)} a month. The{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows the same month as a payslip document, tax code and
          all.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Monthly take-home pay on common monthly salaries
        </h2>
        <p className={bodyClass}>
          Every row is the calculator above run on that gross
          monthly pay — 2026/27 rates, standard 1257L tax code, no
          pension and no student loan:
        </p>
        <table className="w-full max-w-2xl text-left text-sm table-stack">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">Gross a month</th>
              <th className="py-1 pr-2 font-medium">Gross a year</th>
              <th className="py-1 pr-2 font-medium">Tax a month</th>
              <th className="py-1 pr-2 font-medium">NI a month</th>
              <th className="py-1 font-medium">Take-home a month</th>
            </tr>
          </thead>
          <tbody>
            {commonRows.map(({ monthly, result }) => (
              <tr
                key={monthly}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-2">{gbp.format(monthly)}</td>
                <td className="py-1 pr-2">{gbp.format(result.grossAnnual)}</td>
                <td className="py-1 pr-2">{gbp.format(result.incomeTaxMonthly)}</td>
                <td className="py-1 pr-2">{gbp.format(result.employeeNiMonthly)}</td>
                <td className="py-1">{gbp.format(result.netMonthly)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={bodyClass}>
          Two reference points from the same engine: £2,500 a month
          gross leaves {gbp.format(ex2500.netMonthly)} a month, and
          £4,000 a month gross leaves {gbp.format(ex4000.netMonthly)}{" "}
          a month — notice the second £1,500 of gross adds less than
          the first, because everything above £50,270 a year
          (£4,189.17 a month) is taxed at 40%. And the middle of
          full-time work: median gross pay was £39,039 a year in
          April 2025 (ONS Annual Survey of Hours and Earnings), which
          on 2026/27 rates leaves {gbp.format(median.netMonthly)} a
          month before any pension or student loan. If you know the
          take-home you need and want the salary behind it instead,
          the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            required salary calculator
          </Link>{" "}
          runs this same engine backwards.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Why does my payslip differ from the calculator?
        </h2>
        <p className={bodyClass}>
          Three reasons account for almost every gap. First, PAYE is
          cumulative: payroll works out tax on your pay so far in
          the tax year, so a bonus month, a mid-year start or a
          backdated rise makes single months uneven even when the
          year comes out exactly as shown here. Second, National
          Insurance is <em>not</em> cumulative — it is calculated
          fresh on each pay period, so a month with overtime or a
          bonus carries NI on the whole month&apos;s pay at that
          month&apos;s thresholds. Third, the real payslip carries
          things a headline calculator can only add if you tell it:
          your actual tax code (the{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            tax code checker
          </Link>{" "}
          decodes it), your pension at its real percentage and
          method, and student loan deductions from the month your
          pay crosses the plan threshold.
        </p>
        <p className={bodyClass}>
          Paid weekly or four-weekly instead? A month is not four
          weeks: there are 52 weeks in a year, so a month averages
          4.33 weeks, and converting £2,500 a month to weekly pay by
          dividing by 4 overstates it by about 8%. The calculator
          converts weekly pay by the year (× 52 ÷ 12), which keeps
          the two consistent. The{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          does the same job from an hourly wage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Methodology and sources</h2>
        <p className={bodyClass}>
          This page runs the hub&apos;s forward payslip engine — the
          calculation the payslip calculator prints and the reverse
          salary calculator inverts — on the 2026/27 figures in the
          hub&apos;s rates file, verified against GOV.UK on
          7 November 2026: Personal Allowance £12,570 (tapering by
          £1 for every £2 of income over £100,000), Income Tax at
          20% on the first £37,700 of taxable income, 40% up to
          £125,140 and 45% above; employee National Insurance at 8%
          between £12,570 and £50,270 and 2% above. Student loan
          thresholds are GOV.UK&apos;s 2026/27 figures (Plan 1
          £26,900 a year, Plan 2 £29,385, Plan 4 £33,795, Plan 5
          £25,000, Postgraduate Loan £21,000). The median pay figure
          is the ONS Annual Survey of Hours and Earnings 2025
          (median full-time gross annual pay, April 2025).
        </p>
        <p className={bodyClass}>
          Assumptions and limits: England, Wales and Northern
          Ireland bands — Scotland has its own bands and its own
          calculator on this site. One job, a steady salary for a
          full year, the standard 1257L tax code. A pension
          contribution is a percentage of gross under a net-pay
          arrangement; salary sacrifice and relief-at-source
          pensions differ slightly. Bonuses, benefits in kind and
          second jobs are not in the headline figure — the{" "}
          <Link href="/bonus-tax-calculator" className={linkClass}>
            bonus tax calculator
          </Link>{" "}
          and the{" "}
          <Link href="/second-job-tax-calculator" className={linkClass}>
            second job tax calculator
          </Link>{" "}
          cover those.
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

      <RelatedCalculators href="/monthly-salary-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
