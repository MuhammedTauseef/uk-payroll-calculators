import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  NC_CHILD_DEDUCTION_BANDS,
  NC_STANDARD_DEDUCTIONS,
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
  "/us/north-carolina-paycheck-calculator",
  "North Carolina Paycheck Calculator — 2026 Net Pay at 3.99%",
  "Free NC paycheck calculator for 2026: federal tax and FICA plus North Carolina's flat 3.99% tax after the NC standard deduction and the child deduction no rival models — worked examples at every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "NC",
  payType: "salary",
  annualSalary: 70000,
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
// The running example: $70,000 a year, single, paid every 2 weeks.
const ex70 = calculateUsPaycheck(BASE_INPUT);
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 95000,
  filingStatus: "mfj",
  dependentsCreditAnnual: 4000,
});
const exHealth = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 55000,
  healthPremiumPerPeriod: 100,
});
const exKids = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 60000,
  filingStatus: "mfj",
  ncChildCount: 2,
});
// Hourly worked example: $25 an hour, 40 hours a week — the
// calculator's hourly mode annualizes it to $52,000 and runs the
// same North Carolina maths.
const exHourly = calculateUsPaycheck({
  ...BASE_INPUT,
  payType: "hourly",
  hourlyRate: 25,
  hoursPerWeek: 40,
  overtimeHoursPerWeek: 0,
});
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 70000, 75000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $70,000 paycheck in North Carolina?",
    answer: `On a $70,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex70.grossPerPeriod)} paycheck loses ${fmt(ex70.federalPerPeriod)} of federal income tax, ${fmt(ex70.socialSecurityPerPeriod)} of Social Security, ${fmt(ex70.medicarePerPeriod)} of Medicare and ${fmt(ex70.statePerPeriod)} of North Carolina tax — net pay of ${fmt(ex70.netPerPeriod)} every 2 weeks, ${fmt(ex70.netAnnual)} a year. Your own figures move with your filing status, W-4 and any qualifying children — run them through the calculator above.`,
  },
  {
    question: "What is North Carolina's income tax rate in 2026?",
    answer:
      "A flat 3.99% of North Carolina taxable income for every filer (N.C.G.S. §105-153.7), down from 4.25% in 2025 and 4.50% in 2024 — the latest in a run of scheduled cuts that began in 2022. Some calculators still run the old 4.25% rate as the 2026 figure; that overstates the state line by $14.56 a year on every $10,000 of NC taxable income.",
  },
  {
    question: "What is the North Carolina standard deduction for 2026?",
    answer: `North Carolina has its own standard deduction, separate from the federal one: ${fmt(NC_STANDARD_DEDUCTIONS.single)} for single and married-filing-separately filers, ${fmt(NC_STANDARD_DEDUCTIONS.mfj)} married filing jointly, and ${fmt(NC_STANDARD_DEDUCTIONS.hoh)} for head of household (N.C.G.S. §105-153.5(a)). The amounts have been unchanged since 2022, carry no age or blindness add-on, and there is no North Carolina personal exemption on top.`,
  },
  {
    question: "Why is the North Carolina line on my real paycheck higher than this calculator shows?",
    answer:
      "Because employers withhold under NCDOR's NC-30 tables at 4.09% — the 3.99% rate plus a 0.10-point buffer — using a $12,750 withholding deduction for married as well as single filers, less $2,500 per NC-4 allowance. The excess comes back, or is settled, on your Form D-400. This calculator estimates the tax you actually owe for the year at the statutory 3.99%, which is why its state line sits a little below the one on a real stub.",
  },
  {
    question: "Does North Carolina give anything for children?",
    answer:
      "Yes — a deduction, not a credit: $500 to $3,000 per child who qualifies for the federal child tax credit, depending on your income and filing status (N.C.G.S. §105-153.5(a1)); the full band table is in the child-deduction section below. At 3.99% the maximum is worth $119.70 a year per child. It is entirely separate from your federal W-4 Step 3 credit, which is why the calculator asks for a child count of its own — no national calculator we checked models it at all.",
  },
  {
    question: "Are there local income taxes in North Carolina?",
    answer:
      "No — no city, county or school-district income tax anywhere in the state, so there is no Charlotte or Raleigh earnings tax, and no employee unemployment, disability or paid-leave deductions either (unemployment insurance is employer-paid). Federal tax, FICA and the flat state tax are the whole tax story on a North Carolina stub. The trade-off arrives elsewhere: a 4.75% state sales tax plus county add-ons, for combined rates of roughly 6.75%–8.25% at the register.",
  },
  {
    question: "Why is my actual North Carolina paycheck still slightly different?",
    answer:
      "This calculator annualizes — tax on a full year of wages, divided by pay periods. Your employer withholds period by period under the NC-30 tables and IRS Publication 15-T, using your NC-4 allowances and your exact Form W-4. A Step 2 multiple-jobs box, a mid-year start, and bonuses withheld at the flat supplemental rates (22% federal, 4.09% NC) all move a single stub. The annual totals land close.",
  },
  {
    question: "How much is $25 an hour in North Carolina after tax?",
    answer: `At $25 an hour for 40 hours a week, gross pay is ${fmt(exHourly.grossAnnual)} a year. Single and paid every 2 weeks in ${TAX_YEAR}, the tax is ${fmt(exHourly.federalAnnual)} federal, ${fmt(exHourly.socialSecurityAnnual + exHourly.medicareAnnual)} of Social Security and Medicare, and ${fmt(exHourly.stateAnnual)} of North Carolina tax at the flat 3.99% — leaving ${fmt(exHourly.netPerPeriod)} a paycheck, ${fmt(exHourly.netAnnual)} a year. Most searches for this calculator are hourly ones, so the calculator above has an hourly mode: choose "An hourly rate", and it annualizes your rate and hours and runs the same calculation, with overtime figured at 1.5 times the rate.`,
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
  name: "North Carolina Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/north-carolina-paycheck-calculator`,
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

function childBandRows(status: "mfj" | "hoh" | "single") {
  const bands = NC_CHILD_DEDUCTION_BANDS[status];
  return bands.map(([ceiling, amount], i) => {
    const lower = i === 0 ? 0 : bands[i - 1][0];
    return {
      label:
        i === 0
          ? `Up to ${fmt(ceiling)}`
          : `${fmt(lower + 1)} to ${fmt(ceiling)}`,
      amount: fmt(amount),
    };
  });
}

export default function NorthCarolinaPaycheckCalculatorPage() {
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
          North Carolina Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          North Carolina taxes wages at a flat <strong>3.99%</strong>{" "}
          for {TAX_YEAR}, after its own standard deduction —{" "}
          {fmt(NC_STANDARD_DEDUCTIONS.single)} for a single filer,
          separate from the federal one. On a $70,000 salary, single
          and paid every two weeks, North Carolina tax is{" "}
          {fmt(ex70.stateAnnual)} a year, leaving{" "}
          <strong>
            {fmt(ex70.netPerPeriod)} net per paycheck,{" "}
            {fmt(ex70.netAnnual)} a year
          </strong>{" "}
          after federal tax and FICA too.
        </p>
      </section>

      <UsPaycheckCalculator state="NC" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $70,000 in North Carolina, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex70.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex70.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex70.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex70.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  North Carolina tax at 3.99% (after the{" "}
                  {fmt(NC_STANDARD_DEDUCTIONS.single)} NC standard
                  deduction)
                </td>
                <td className={tdClass}>−{fmt(ex70.statePerPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex70.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex70.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          North Carolina taxable income here is $57,250 — the $70,000
          salary less the state&apos;s own{" "}
          {fmt(NC_STANDARD_DEDUCTIONS.single)} deduction, not the
          federal {fmt(16100)} — and 3.99% of it is{" "}
          {fmt(ex70.stateAnnual)}. Two more cases from the same
          calculator: a married couple filing jointly on $95,000 with
          $4,000 of W-4 Step 3 credits pays {fmt(exMfj.stateAnnual)} of
          NC tax and keeps {fmt(exMfj.netAnnual)} a year; and a couple
          on $60,000 with two qualifying children deducts a further
          $5,000 under the child deduction, pays just{" "}
          {fmt(exKids.stateAnnual)} of NC tax and keeps{" "}
          {fmt(exKids.netAnnual)}. A single filer on $55,000 paying
          $100 a paycheck in health premiums keeps{" "}
          {fmt(exHealth.netAnnual)} — the premium shrinks the federal,
          FICA and NC bases at once.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $70,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>NC tax</th>
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
          Take-home pay at common North Carolina salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>NC tax / year</th>
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
                    salary === 70000
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
          Single, paid every 2 weeks, no pre-tax deductions and no
          qualifying children, {TAX_YEAR} rates. Whether you searched
          for an NC paycheck calculator or a North Carolina paycheck
          calculator, the working is the same — and every row would
          lose a little more under last year&apos;s 4.25% rate, which
          is the figure some rival pages still show for {TAX_YEAR}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paid by the hour? $25 an hour, worked through
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Four of the eight searches Google suggests for this
          calculator are hourly ones — and the calculator above
          answers them directly. Choose &quot;An hourly rate&quot;,
          enter the rate and your hours, and it annualizes the pay
          (rate × hours × 52 weeks) and runs the same federal, FICA
          and North Carolina calculation. At $25 an hour for 40
          hours a week that is {fmt(exHourly.grossAnnual)} a year:
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
                <td className={tdClass}>North Carolina tax at 3.99%</td>
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
          Overtime hours are figured at 1.5 times the rate and
          taxed as ordinary wages — North Carolina has no separate
          overtime or hourly rate of tax, just the one flat 3.99%
          on whatever you earn above the standard deduction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A flat rate that keeps falling
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          North Carolina replaced its graduated brackets with a flat
          tax in 2014 and has cut the rate in steps ever since: 4.99%
          in 2022, 4.75% in 2023, 4.50% in 2024, 4.25% in 2025 and now{" "}
          <strong>3.99% for {TAX_YEAR}</strong> (N.C.G.S. §105-153.7,
          under Session Laws 2021-180 and 2023-134). On $50,000 of NC
          taxable income the {TAX_YEAR} rate costs $1,995 — $500 a year
          less than the same income cost in 2022. After {TAX_YEAR},
          the statute allows further cuts only if General Fund revenue
          beats set triggers (the first would take the rate down
          another half point, with a floor of 2.49%) — so a lower rate
          in 2027 is possible, not promised, and this page will be
          updated when the Department of Revenue publishes it.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          North Carolina&apos;s own standard deduction — and the child
          deduction
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          North Carolina does not use the federal standard deduction:
          its statutory amounts are {fmt(NC_STANDARD_DEDUCTIONS.single)}{" "}
          single and married filing separately,{" "}
          {fmt(NC_STANDARD_DEDUCTIONS.mfj)} married filing jointly,{" "}
          {fmt(NC_STANDARD_DEDUCTIONS.hoh)} head of household
          (N.C.G.S. §105-153.5(a)), unchanged since 2022, with no age
          or blindness add-on and no personal exemption. On top,
          parents get the child deduction (N.C.G.S. §105-153.5(a1)):
          $500–$3,000 per child who qualifies for the federal child
          tax credit, banded by income — worth up to $119.70 a year
          per child at 3.99%, and $0 once income passes $70,000
          (single), $105,000 (head of household) or $140,000 (joint).
          North Carolina tax starts from federal AGI, so a 401(k) and
          pre-tax health premiums shrink the NC base too.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>
                  Federal AGI — married filing jointly
                </th>
                <th className={thClass}>Head of household</th>
                <th className={thClass}>Single / filing separately</th>
                <th className={thClass}>Deduction per child</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {childBandRows("mfj").map((row, i) => (
                <tr key={row.label}>
                  <td className={tdClass}>{row.label}</td>
                  <td className={tdClass}>
                    {childBandRows("hoh")[i].label}
                  </td>
                  <td className={tdClass}>
                    {childBandRows("single")[i].label}
                  </td>
                  <td className={tdClass}>{row.amount}</td>
                </tr>
              ))}
              <tr>
                <td className={tdClass}>Over $140,000</td>
                <td className={tdClass}>Over $105,000</td>
                <td className={tdClass}>Over $70,000</td>
                <td className={tdClass}>$0</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          No local tax, and nothing else at state level
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          No North Carolina city, county or school district taxes
          wages — there is no Charlotte or Raleigh earnings tax — and
          nothing else comes out at state level: unemployment
          insurance is paid by employers only, and North Carolina has
          no disability or paid-leave premium. A North Carolina pay
          stub has exactly three tax lines: federal, FICA, and the
          flat state line. (The trade-off, for honesty: the state
          funds itself partly through a 4.75% state sales tax plus
          county add-ons.)
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in North Carolina?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: NC-30
          withholding at 4.09% on every run, reconciled against the
          3.99% your workers actually owe.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies the withholding tables on every run and files the
          federal and North Carolina returns from the same figures.
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
          The calculator annualizes: tax on a full year of wages
          (gross, less pre-tax deductions, less the standard
          deduction, through the {TAX_YEAR} federal brackets, less W-4
          Step 3 credits), divided by pay periods. North Carolina tax
          is 3.99% of federal AGI less the NC standard deduction and
          the NC child deduction — the liability your Form D-400
          settles. Employers withhold under the NC-30 tables at
          4.09% instead, so a real stub&apos;s state line runs about
          $5–9 a paycheck higher than the liability shown here; the
          difference comes back at filing.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR});
          Social Security Administration, Contribution and Benefit
          Base ({TAX_YEAR}: {fmt(SOCIAL_SECURITY_WAGE_BASE)}); NC
          Department of Revenue, Tax Rate Schedules; N.C.G.S.
          §105-153.7 (the 3.99% rate); N.C.G.S. §105-153.5(a) and
          (a1) (the standard and child deductions); NCDOR NC-30 (
          {TAX_YEAR}) for the withholding comparison. Tax rules
          verified 22 November 2026. This calculator is an estimate,
          not tax advice — your employer&apos;s payroll and your own
          tax return are the final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            A full year in one North Carolina job, wages only, taking
            the NC standard deduction rather than NC itemized
            deductions.
          </li>
          <li>
            No North Carolina modifications are modelled (Social
            Security benefits, Bailey-settlement and military
            retirement exclusions, and depreciation add-backs are all
            outside a wage-only estimate).
          </li>
          <li>
            The child deduction is keyed on federal AGI after pre-tax
            deductions, and only for the child count you enter; it is
            never inferred from your W-4 Step 3 credit.
          </li>
          <li>
            No credits are modelled other than the federal W-4 Step 3
            amount you enter.
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

      <StatePaycheckCluster state="NC" />
      <RelatedCalculators href="/us/north-carolina-paycheck-calculator" />
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
