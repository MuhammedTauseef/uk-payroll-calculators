import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import EmployerCostCalculator from "@/components/EmployerCostCalculator";
import { calculateEmployerCost } from "@/lib/employerCost";
import {
  EMPLOYER_NI,
  EMPLOYER_NI_RATES_LABEL,
  EMPLOYER_NI_RATES_VERIFIED,
  EMPLOYMENT_ALLOWANCE,
  PENSION,
  PENSION_RATES_LABEL,
} from "@/lib/rates";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";

export const metadata: Metadata = pageMetadata(
  "/employer-cost-calculator",
  "Employer Cost Calculator UK",
  "Free UK employer cost calculator: what a salary really costs — gross pay plus employer National Insurance, workplace pension and other employer costs.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function fmt(n: number): string {
  return gbp.format(n);
}

// Worked-example figures — computed by the same calculator function
// the tool above runs, so the page can never disagree with itself.
// The running example: a £30,000 salary with the 3% auto-enrolment
// minimum pension and no other costs.
const ex30 = calculateEmployerCost({
  annualGrossSalary: 30000,
  employerPensionPercent: 3,
  otherEmployerCostsAnnual: 0,
});
const comparison = [25000, 30000, 40000, 50000, 60000].map((s) => ({
  salary: s,
  result: calculateEmployerCost({
    annualGrossSalary: s,
    employerPensionPercent: 3,
    otherEmployerCostsAnnual: 0,
  }),
}));
// Second worked example, end to end for one named hire: a £20,000
// administrator, employer pension at 5% of qualifying earnings, and
// £1,200 a year of other costs (laptop, insurance and software).
// Figures come from the same calculateEmployerCost() the tool runs.
const exHire = calculateEmployerCost({
  annualGrossSalary: 20000,
  employerPensionPercent: 5,
  otherEmployerCostsAnnual: 1200,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does a £30,000 salary really cost an employer?",
    answer: `A ${fmt(30000)} salary costs ${fmt(ex30.totalCostPerYear)} a year (${fmt(ex30.totalCostPerMonth)} a month) before any other costs: the ${fmt(30000)} of gross pay, plus ${fmt(ex30.employerNiPerYear)} of employer National Insurance (15% of the ${fmt(ex30.earningsAboveThreshold)} above the ${fmt(ex30.thresholdApplied)} Secondary Threshold), plus ${fmt(ex30.employerPensionPerYear)} of workplace pension at the 3% auto-enrolment minimum on qualifying earnings of ${fmt(ex30.qualifyingEarnings)}. That is ${fmt(ex30.onCostsPerYear)} — ${ex30.costUpliftPercent.toFixed(2)}% — on top of the headline salary.`,
  },
  {
    question: "What counts towards the total cost of employing someone?",
    answer:
      "Three charges land on every hire: the gross salary itself, employer Class 1 National Insurance on top of it, and the employer's workplace pension contributions under auto-enrolment. Beyond those, employers add their own costs — benefits, insurance, equipment, software, training — which is why this calculator has an other-costs field: enter them exactly as they are and they are added to the total. The employee's own Income Tax and National Insurance never count: those come out of the employee's pay, not the employer's pocket.",
  },
  {
    question: "How is employer National Insurance worked out?",
    answer: `Employer (secondary) Class 1 National Insurance is charged at ${EMPLOYER_NI.rate * 100}% on the part of an employee's pay above the Secondary Threshold of ${fmt(EMPLOYER_NI.secondaryThresholdAnnual)} a year — the first ${fmt(EMPLOYER_NI.secondaryThresholdAnnual)} attracts no employer NICs at all. On a ${fmt(30000)} salary that is (${fmt(30000)} − ${fmt(EMPLOYER_NI.secondaryThresholdAnnual)}) × ${EMPLOYER_NI.rate * 100}% = ${fmt(3750)} a year. Employees under 21 and apprentices under 25 attract a 0% rate up to ${fmt(EMPLOYER_NI.youngWorkerUpperThresholdAnnual)} a year — the employer NI calculator on this site works those categories out in full.`,
  },
  {
    question: "How much does an employer have to pay into a workplace pension?",
    answer: `Under auto-enrolment the employer must pay at least ${PENSION.employerMinimumRate * 100}% of the employee's qualifying earnings — the slice of pay between ${fmt(PENSION.qualifyingEarningsLowerAnnual)} and ${fmt(PENSION.qualifyingEarningsUpperAnnual)} a year. On a ${fmt(30000)} salary the qualifying slice is ${fmt(ex30.qualifyingEarnings)}, so the minimum employer contribution is ${fmt(ex30.employerPensionPerYear)} a year. Many employers pay more than the minimum, which is why the percentage in this calculator is yours to change.`,
  },
  {
    question: "Can I use these figures in a spreadsheet?",
    answer:
      "Yes. The calculator shows every cost as its own line — gross salary, employer National Insurance, employer pension and any other costs you add, each per year and per month — so you can copy the lines into a spreadsheet and build your own hiring model around them: change the salary or pension percentage in your sheet and the structure still holds. There is no file to download; the breakdown on screen is the figures, ready to lift across.",
  },
  {
    question:
      "Does this calculator include the Employment Allowance or the Apprenticeship Levy?",
    answer: `Neither, deliberately. The Employment Allowance takes up to ${fmt(EMPLOYMENT_ALLOWANCE.annualAmount)} a year off an eligible employer's total National Insurance bill, so it belongs to the whole payroll rather than to one employee — the employer NI calculator here shows its effect on a single salary. The Apprenticeship Levy is charged only to employers whose annual pay bill exceeds £3 million, so it never applies to the typical employer using this calculator and is left out rather than estimated.`,
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
  name: "Employer Cost Calculator",
  url: `${AppConfig.siteUrl}/employer-cost-calculator`,
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

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

const RATES_TABLE: { item: string; amount: string }[] = [
  {
    item: "Employer Class 1 rate (main rate)",
    amount: `${EMPLOYER_NI.rate * 100}% of earnings above the threshold`,
  },
  {
    item: "Secondary Threshold",
    amount: `${fmt(EMPLOYER_NI.secondaryThresholdAnnual)} per year (about £417 per month)`,
  },
  {
    item: "Auto-enrolment qualifying-earnings band",
    amount: `${fmt(PENSION.qualifyingEarningsLowerAnnual)} to ${fmt(PENSION.qualifyingEarningsUpperAnnual)} per year`,
  },
  {
    item: "Employer pension minimum",
    amount: `${PENSION.employerMinimumRate * 100}% of qualifying earnings`,
  },
  {
    item: "Employment Allowance (whole-payroll, not per employee)",
    amount: `${fmt(EMPLOYMENT_ALLOWANCE.annualAmount)} per year off the employer NIC bill`,
  },
];

export default function EmployerCostCalculatorPage() {
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
          Employer Cost Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this employer cost calculator to work out what an
          employee&apos;s salary really costs your business. Enter the
          annual salary, and the calculator adds employer National
          Insurance and workplace pension on top: a {fmt(30000)} salary
          costs {fmt(ex30.totalCostPerYear)} a year. Add any other
          employer costs for the full picture.
        </p>
      </section>

      <EmployerCostCalculator />

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Paying staff every month?{" "}
        <a
          href="https://go.zoho.com/tjEU"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          Zoho Payroll
        </a>{" "}
        runs the calculation, payslips and filings in one place.
      </p>

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Once you know the true cost of a role, compare the{" "}
        <Link
          href="/blog/best-hr-systems-uk"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          best HR systems for UK employers
        </Link>{" "}
        for the employee records behind the numbers. If you are building
        a hiring plan, the{" "}
        <Link
          href="/blog/best-workforce-planning-software"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          best workforce planning software
        </Link>{" "}
        guide shows how to price the team before you recruit.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The true cost of an employee
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The true cost of an employee is never the salary in the job
          advert. Before the employee does a day&apos;s work, the
          business also owes employer National Insurance on the pay
          above the Secondary Threshold and workplace pension
          contributions under auto-enrolment — and usually equipment,
          insurance, software and training on top of that. On this
          page&apos;s running example, a {fmt(30000)} salary carries{" "}
          {fmt(ex30.onCostsPerYear)} of on-costs, so the true cost is{" "}
          {fmt(ex30.totalCostPerYear)} a year —{" "}
          {ex30.costUpliftPercent.toFixed(2)}% more than the headline
          salary. Budget, price and hire against the true cost, not
          the salary, or every hire quietly costs more than the plan
          allowed for.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What a {fmt(30000)} salary really costs, line by line
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Gross salary</td>
                <td className="px-4 py-2">{fmt(ex30.annualGrossSalary)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employer National Insurance ({EMPLOYER_NI.rate * 100}%
                  of the {fmt(ex30.earningsAboveThreshold)} above the{" "}
                  {fmt(ex30.thresholdApplied)} Secondary Threshold)
                </td>
                <td className="px-4 py-2">
                  +{fmt(ex30.employerNiPerYear)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employer pension (3% of qualifying earnings of{" "}
                  {fmt(ex30.qualifyingEarnings)})
                </td>
                <td className="px-4 py-2">
                  +{fmt(ex30.employerPensionPerYear)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Other employer costs</td>
                <td className="px-4 py-2">{fmt(0)} in this example</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className="px-4 py-2">Total cost of employing</td>
                <td className="px-4 py-2">
                  {fmt(ex30.totalCostPerYear)} a year ·{" "}
                  {fmt(ex30.totalCostPerMonth)} a month
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The headline salary is only the starting point: the charges on
          top add {fmt(ex30.onCostsPerYear)} a year, which is{" "}
          {ex30.costUpliftPercent.toFixed(2)}% more than the salary
          itself — a total of {fmt(ex30.totalCostPerYear)} for every{" "}
          {fmt(30000)} of pay, or about {fmt(ex30.totalCostPerYear / 300)}{" "}
          of cost for every {fmt(100)} of salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Total employer cost at other salaries
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Employer NI / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Employer pension / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Total cost / year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Cost on top
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparison.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 30000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className="px-4 py-2">{fmt(salary)}</td>
                  <td className="px-4 py-2">
                    {fmt(result.employerNiPerYear)}
                  </td>
                  <td className="px-4 py-2">
                    {fmt(result.employerPensionPerYear)}
                  </td>
                  <td className="px-4 py-2">
                    {fmt(result.totalCostPerYear)}
                  </td>
                  <td className="px-4 py-2">
                    {result.costUpliftPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Standard employee, pension at the 3% auto-enrolment minimum,
          no other costs, 2026/27 rates. The percentage on top rises
          with the salary because the {fmt(EMPLOYER_NI.secondaryThresholdAnnual)}{" "}
          threshold shelters a smaller share of a bigger salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: one hire, end to end
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Say you hire an administrator on {fmt(20000)} a year, pay 5%
          of qualifying earnings into their pension — above the
          auto-enrolment minimum — and spend {fmt(1200)} a year on their
          laptop, insurance and software. The true cost builds up in four
          steps. Step 1, employer National Insurance: ({fmt(20000)} −{" "}
          {fmt(exHire.thresholdApplied)}) × {EMPLOYER_NI.rate * 100}% ={" "}
          {fmt(exHire.employerNiPerYear)}. Step 2, pension: qualifying
          earnings are {fmt(exHire.qualifyingEarnings)}, and 5% of that
          is {fmt(exHire.employerPensionPerYear)}. Step 3, the other
          costs: {fmt(exHire.otherCostsPerYear)} as entered. Step 4, the
          total: {fmt(20000)} + {fmt(exHire.employerNiPerYear)} +{" "}
          {fmt(exHire.employerPensionPerYear)} +{" "}
          {fmt(exHire.otherCostsPerYear)} ={" "}
          {fmt(exHire.totalCostPerYear)} a year —{" "}
          {fmt(exHire.totalCostPerMonth)} a month, or{" "}
          {exHire.costUpliftPercent.toFixed(2)}% on top of the salary
          the job was advertised at.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How the total cost of employing is worked out
        </h2>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          1. Employer National Insurance — 15% above £5,000
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Employer (secondary) Class 1 National Insurance is charged at{" "}
          {EMPLOYER_NI.rate * 100}% on the part of an employee&apos;s pay
          above the Secondary Threshold of{" "}
          {fmt(EMPLOYER_NI.secondaryThresholdAnnual)} a year — the first{" "}
          {fmt(EMPLOYER_NI.secondaryThresholdAnnual)} of earnings attracts
          no employer NICs at all. The charge is the employer&apos;s cost,
          on top of the salary; it is never deducted from the
          employee&apos;s pay. Use the{" "}
          <Link
            href="/employer-national-insurance-calculator"
            className={linkClass}
          >
            employer National Insurance calculator
          </Link>{" "}
          for the under-21 and apprentice categories and the Employment
          Allowance.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          2. Workplace pension — a percentage of a band, not the whole
          salary
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Under auto-enrolment, pension percentages apply to qualifying
          earnings only: the slice of the salary between{" "}
          {fmt(PENSION.qualifyingEarningsLowerAnnual)} and{" "}
          {fmt(PENSION.qualifyingEarningsUpperAnnual)} a year. The
          employer minimum is {PENSION.employerMinimumRate * 100}% of
          that slice, so on a {fmt(30000)} salary the minimum is{" "}
          {PENSION.employerMinimumRate * 100}% of{" "}
          {fmt(ex30.qualifyingEarnings)} ={" "}
          {fmt(ex30.employerPensionPerYear)} — not 3% of the full{" "}
          {fmt(30000)}. Employers matching employee contributions or
          paying a flat percentage of full salary pay more; set your own
          percentage in the calculator.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          3. What else adds to the true cost
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two payroll items sit outside this calculator, for opposite
          reasons. The Employment Allowance can take up to{" "}
          {fmt(EMPLOYMENT_ALLOWANCE.annualAmount)} a year off an eligible
          employer&apos;s total NIC bill, but it applies to the whole
          payroll, not to one employee, so it is not deducted here. The
          Apprenticeship Levy goes the other way — it adds cost, but
          only for employers whose annual pay bill exceeds £3 million,
          so almost no small employer pays it. Everything else — benefits
          in kind, employer insurance, equipment, software, training —
          varies by employer, which is what the other-costs field is for:
          add your own figure and it joins the total exactly as entered.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rates used by this calculator (2026/27)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate or threshold
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Amount (2026/27)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RATES_TABLE.map((row) => (
                <tr key={row.item}>
                  <td className="px-4 py-2">{row.item}</td>
                  <td className="px-4 py-2">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {EMPLOYER_NI_RATES_LABEL}; pension band:{" "}
          {PENSION_RATES_LABEL}. Figures verified:{" "}
          {EMPLOYER_NI_RATES_VERIFIED}. Always check GOV.UK before
          running payroll, because a Budget can change the figures from
          the next April.
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

      <RelatedCalculators href="/employer-cost-calculator" />
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
