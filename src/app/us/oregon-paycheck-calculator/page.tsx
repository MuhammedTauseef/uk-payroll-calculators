import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  OR_BRACKET_RATES,
  OR_EXEMPTION_CREDIT,
  OR_PAID_LEAVE_RATE,
  OR_PAID_LEAVE_WAGE_CAP,
  OR_SCHEDULE_M_TOPS,
  OR_SCHEDULE_S_TOPS,
  OR_STANDARD_DEDUCTIONS,
  OR_SUBTRACTION_MAX,
  OR_TRANSIT_RATE,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
  TAX_YEAR,
  type UsPaycheckInput,
} from "@/lib/us-paycheck";

// Page-level groupings of the engine's Oregon constants.
const OR_BRACKETS = {
  S: [...OR_SCHEDULE_S_TOPS, Infinity].map((upTo, i) => ({
    upTo,
    rate: OR_BRACKET_RATES[i],
  })),
  M: [...OR_SCHEDULE_M_TOPS, Infinity].map((upTo, i) => ({
    upTo,
    rate: OR_BRACKET_RATES[i],
  })),
};
const OR_STANDARD_DEDUCTION_WITHHOLDING = OR_STANDARD_DEDUCTIONS;
const OR_SUBTRACTION_CAP = OR_SUBTRACTION_MAX;
const OR_PAID_LEAVE_EMPLOYEE = {
  rate: OR_PAID_LEAVE_RATE,
  wageBase: OR_PAID_LEAVE_WAGE_CAP,
  max: Math.round(OR_PAID_LEAVE_RATE * OR_PAID_LEAVE_WAGE_CAP * 100) / 100,
};
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";
import StatePaycheckCluster from "@/components/StatePaycheckCluster";
import RelatedGuides from "@/components/RelatedGuides";

export const metadata: Metadata = pageMetadata(
  "/us/oregon-paycheck-calculator",
  "Oregon Paycheck Calculator — 2026 Net Pay With the Federal Subtraction",
  "Free Oregon paycheck calculator for 2026: federal tax and FICA plus Oregon income tax with the federal tax subtraction rivals skip, the 0.1% statewide transit tax and 0.6% Paid Leave Oregon — line by line.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "OR",
  payType: "salary",
  annualSalary: 75000,
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
const ex75 = calculateUsPaycheck(BASE_INPUT);
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 110000,
  filingStatus: "mfj",
});
const ex160 = calculateUsPaycheck({ ...BASE_INPUT, annualSalary: 160000 });
// Hourly worked example: $30 an hour, 40 hours a week — the
// calculator's hourly mode annualizes it to $62,400 and runs the
// same Oregon maths, transit tax and Paid Leave included.
const exHourly = calculateUsPaycheck({
  ...BASE_INPUT,
  payType: "hourly",
  hourlyRate: 30,
  hoursPerWeek: 40,
  overtimeHoursPerWeek: 0,
});
const exHourlyExtras = exHourly.extraLines.reduce(
  (sum, l) => sum + l.annual,
  0,
);
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 90000, 100000, 125000, 160000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const transit = (r: typeof ex75) =>
  r.extraLines.find((l) => l.id === "or-transit")!;
const paidLeave = (r: typeof ex75) =>
  r.extraLines.find((l) => l.id === "or-paid-leave")!;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $75,000 paycheck in Oregon?",
    answer: `On a $75,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex75.grossPerPeriod)} paycheck loses ${fmt(ex75.federalPerPeriod)} of federal tax, ${fmt(ex75.socialSecurityPerPeriod)} of Social Security, ${fmt(ex75.medicarePerPeriod)} of Medicare, ${fmt(ex75.statePerPeriod)} of Oregon income tax, ${fmt(transit(ex75).perPeriod)} of statewide transit tax and ${fmt(paidLeave(ex75).perPeriod)} for Paid Leave Oregon — net pay of ${fmt(ex75.netPerPeriod)} every 2 weeks, ${fmt(ex75.netAnnual)} a year. Oregon's line is smaller than the 9.9% top rate suggests, because of the federal tax subtraction explained below.`,
  },
  {
    question: "What is Oregon's federal tax subtraction — and why do other calculators get it wrong?",
    answer: `Oregon lets you subtract the federal income tax you pay from your Oregon taxable income, up to ${fmt(OR_SUBTRACTION_CAP)} in ${TAX_YEAR}. The cap falls by $1,750 for every $5,000 of wages from $125,000 (single) and reaches zero at $145,000; joint filers get the same steps from $250,000 to $290,000. Calculators that skip it overstate Oregon tax by about $678 a year on a $75,000 salary. FICA never counts toward the subtraction — only federal income tax.`,
  },
  {
    question: "What are the Oregon income tax brackets for 2026?",
    answer: `Four brackets on Oregon taxable income: 4.75% to $4,550, 6.75% to $11,400, 8.75% to $125,000 and 9.9% above, for single filers; the thresholds double for joint filers and heads of household ($9,100 / $22,800 / $250,000). Oregon taxable income is what is left after the federal tax subtraction and Oregon's own standard deduction (${fmt(OR_STANDARD_DEDUCTION_WITHHOLDING.single)} single, ${fmt(OR_STANDARD_DEDUCTION_WITHHOLDING.mfj)} joint), and a ${fmt(OR_EXEMPTION_CREDIT)}-per-exemption credit then comes off the tax itself — both tables are printed in the brackets section below.`,
  },
  {
    question: "What is the 0.1% statewide transit tax on my pay stub?",
    answer: `A tax of one-tenth of 1% on every Oregon employee's wages (ORS 320.550), withheld by your employer since July 2018 to fund public transport statewide. It has no wage cap and applies even if you owe no Oregon income tax — ${fmt(transit(ex75).annual)} a year on a $75,000 salary. A 2025 law would have doubled it, but voters rejected the increase (Measure 120, May 2026), so it stays at ${(OR_TRANSIT_RATE * 100).toFixed(1)}%.`,
  },
  {
    question: "How much do I pay for Paid Leave Oregon?",
    answer: `Employees pay 60% of the 1% total contribution — ${(OR_PAID_LEAVE_EMPLOYEE.rate * 100).toFixed(1)}% of wages, up to ${fmt(OR_PAID_LEAVE_EMPLOYEE.wageBase)} of wages in ${TAX_YEAR} (a maximum of ${fmt(OR_PAID_LEAVE_EMPLOYEE.max)} a year). Employers with 25 or more staff pay the other 40%; smaller employers pay no employer share but still withhold yours. Some employers voluntarily cover the employee share, in which case the line disappears from your stub.`,
  },
  {
    question: "Is the TriMet tax taken out of my paycheck?",
    answer:
      "No. The TriMet payroll tax (0.8237% in 2026) and the Lane Transit District tax (0.80%) are imposed on your employer, on payroll for work inside those districts — they are never withheld from your wages. The only transit tax in your pay is the separate 0.1% statewide one. If a calculator deducts TriMet from your net pay, it is wrong.",
  },
  {
    question: "Why is my actual Oregon paycheck slightly different?",
    answer:
      "This calculator annualizes, like the mainstream paycheck calculators; your employer withholds period by period using the Department of Revenue's computer formula and your Form OR-W-4 allowances. A mid-year start, bonuses (Oregon allows a flat 8% on supplemental wages paid separately), Portland-area local taxes (Metro Supportive Housing Services and Multnomah County Preschool for All — high incomes only, not modelled here), the hourly Workers' Benefit Fund assessment, or an employer paying your Paid Leave share all move a real stub a little. Annual totals land close.",
  },
  {
    question: "How much is $30 an hour in Oregon after tax?",
    answer: `At $30 an hour for 40 hours a week, gross pay is ${fmt(exHourly.grossAnnual)} a year. Single and paid every 2 weeks in ${TAX_YEAR}, the deductions are ${fmt(exHourly.federalAnnual)} of federal tax, ${fmt(exHourly.socialSecurityAnnual + exHourly.medicareAnnual)} of Social Security and Medicare, ${fmt(exHourly.stateAnnual)} of Oregon income tax and ${fmt(exHourlyExtras)} of statewide transit tax and Paid Leave Oregon contributions — leaving ${fmt(exHourly.netPerPeriod)} a paycheck, ${fmt(exHourly.netAnnual)} a year. The calculator above has an hourly mode for exactly this: choose "An hourly rate", and it annualizes your rate and hours and runs the same calculation, overtime at 1.5 times the rate included. (The small per-hour Workers' Benefit Fund assessment is not in these lines.)`,
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
  name: "Oregon Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/oregon-paycheck-calculator`,
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

function bracketRows(schedule: "S" | "M") {
  const rows = OR_BRACKETS[schedule];
  return rows.map((b, i) => ({
    range:
      i === 0
        ? `Up to ${fmt(b.upTo)}`
        : b.upTo === Infinity
          ? `Over ${fmt(rows[i - 1].upTo)}`
          : `${fmt(rows[i - 1].upTo + 1)} to ${fmt(b.upTo)}`,
    rate: `${(b.rate * 100).toFixed(2)}%`,
  }));
}

export default function OregonPaycheckCalculatorPage() {
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
          Oregon Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An Oregon paycheck loses more lines than most states&apos;:
          federal tax, FICA, Oregon income tax, a 0.1% statewide
          transit tax and 0.6% for Paid Leave Oregon. On a $75,000
          salary, single and paid every two weeks, that leaves{" "}
          <strong>
            {fmt(ex75.netPerPeriod)} net per paycheck in {TAX_YEAR},{" "}
            {fmt(ex75.netAnnual)} a year
          </strong>
          . Enter your own pay below.
        </p>
      </section>

      <UsPaycheckCalculator state="OR" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $75,000 in Oregon, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex75.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex75.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex75.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex75.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Oregon income tax (after the federal tax subtraction)
                </td>
                <td className={tdClass}>−{fmt(ex75.statePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Statewide transit tax at {(OR_TRANSIT_RATE * 100).toFixed(1)}%
                </td>
                <td className={tdClass}>−{fmt(transit(ex75).perPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Paid Leave Oregon at{" "}
                  {(OR_PAID_LEAVE_EMPLOYEE.rate * 100).toFixed(1)}%
                </td>
                <td className={tdClass}>−{fmt(paidLeave(ex75).perPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex75.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex75.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The Oregon working behind that line: $75,000 of wages, less
          the {fmt(ex75.federalAnnual)} of federal tax subtracted
          (under the {fmt(OR_SUBTRACTION_CAP)} cap), less Oregon&apos;s{" "}
          {fmt(OR_STANDARD_DEDUCTION_WITHHOLDING.single)} standard
          deduction, gives $64,420 of Oregon taxable income; the
          brackets produce {fmt(ex75.stateAnnual + OR_EXEMPTION_CREDIT)}{" "}
          of tax, and the {fmt(OR_EXEMPTION_CREDIT)} exemption credit
          brings it to {fmt(ex75.stateAnnual)} — an effective Oregon
          rate of 6.74%, far below the 9.9% headline. Two more cases
          from the same calculator: a married couple on $110,000 pays{" "}
          {fmt(exMfj.stateAnnual)} of Oregon tax and keeps{" "}
          {fmt(exMfj.netAnnual)}; a single filer on $160,000 — past the
          point where the subtraction has stepped down to zero — pays{" "}
          {fmt(ex160.stateAnnual)} and keeps {fmt(ex160.netAnnual)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $75,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>Oregon tax</th>
                <th className={thClass}>Transit + Paid Leave</th>
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
                  <td className={tdClass}>
                    −
                    {fmt(
                      result.extraLines.reduce((s, l) => s + l.perPeriod, 0),
                    )}
                  </td>
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
          Take-home pay at common Oregon salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Oregon tax / year</th>
                <th className={thClass}>Transit + Paid Leave / year</th>
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
                    salary === 75000
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
                  <td className={tdClass}>
                    {fmt(result.extraLines.reduce((s, l) => s + l.annual, 0))}
                  </td>
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
          Single, paid every 2 weeks, no pre-tax deductions, {TAX_YEAR}{" "}
          rates, one Oregon exemption. The Oregon column is the one to
          watch: it rises gently while the federal subtraction is in
          play, then steepens between $125,000 and $160,000 as the
          subtraction steps down to zero.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paid by the hour? $30 an hour, worked through
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculator above is not salary-only: choose &quot;An
          hourly rate&quot;, enter the rate and your hours, and it
          annualizes the pay (rate × hours × 52 weeks) and runs the
          same Oregon calculation — brackets, federal-tax
          subtraction, transit tax and Paid Leave contribution
          included. At $30 an hour for 40 hours a week that is{" "}
          {fmt(exHourly.grossAnnual)} a year:
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
                <td className={tdClass}>Oregon income tax</td>
                <td className={tdClass}>−{fmt(exHourly.statePerPeriod)}</td>
              </tr>
              {exHourly.extraLines.map((line) => (
                <tr key={line.id}>
                  <td className={tdClass}>{line.label}</td>
                  <td className={tdClass}>−{fmt(line.perPeriod)}</td>
                </tr>
              ))}
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
          taxed as ordinary wages — Oregon applies the same
          brackets to every dollar, hourly or salaried.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Oregon&apos;s brackets — and why the 9.9% headline misleads
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Oregon&apos;s rates are statutory (ORS 316.037) with
          thresholds inflation-adjusted each year. But the tax is
          figured on a base already shrunk by the federal tax
          subtraction and Oregon&apos;s small standard deduction, and
          then reduced by a {fmt(OR_EXEMPTION_CREDIT)} credit per
          exemption — so effective Oregon rates land well below the
          marginal bracket: {fmt(ex75.stateAnnual)} on a $75,000 salary
          is 6.74%, even though the top slice of that salary sits in
          the 8.75% bracket.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={tableWrapClass}>
            <table className="w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className={thClass}>
                    Single / filing separately — on Oregon taxable income
                  </th>
                  <th className={thClass}>Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bracketRows("S").map((r) => (
                  <tr key={r.range}>
                    <td className={tdClass}>{r.range}</td>
                    <td className={tdClass}>{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={tableWrapClass}>
            <table className="w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className={thClass}>
                    Joint / head of household — on Oregon taxable income
                  </th>
                  <th className={thClass}>Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bracketRows("M").map((r) => (
                  <tr key={r.range}>
                    <td className={tdClass}>{r.range}</td>
                    <td className={tdClass}>{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          The federal tax subtraction, explained
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Oregon starts its tax calculation from federal AGI, and in
          exchange it lets you subtract the federal income tax you
          actually pay — after credits, never FICA — up to{" "}
          {fmt(OR_SUBTRACTION_CAP)}. The cap steps down by $1,750 for
          every $5,000 of wages above $125,000 for single filers
          (every $10,000 above $250,000 for joint filers), reaching
          zero at $145,000 ($290,000 joint). Most national calculators
          omit the subtraction entirely; on a $75,000 salary that
          single omission overstates the Oregon tax by about $678 a
          year. This calculator follows the Department of
          Revenue&apos;s withholding formula, so the subtraction here
          is keyed on wages, as it is on a real stub; on your Form
          OR-40 it is keyed on AGI instead, and the two coincide for a
          wage-only year.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Two small lines every Oregon stub carries — and one that
          isn&apos;t yours
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The statewide transit tax takes {(OR_TRANSIT_RATE * 100).toFixed(1)}%
          of every Oregon wage, uncapped, to fund public transport
          (ORS 320.550) — {fmt(transit(ex75).annual)} a year at
          $75,000. Paid Leave Oregon takes{" "}
          {(OR_PAID_LEAVE_EMPLOYEE.rate * 100).toFixed(1)}% of wages up
          to {fmt(OR_PAID_LEAVE_EMPLOYEE.wageBase)} — the
          employee&apos;s 60% share of the 1% contribution; employers
          with 25 or more staff pay the other 40%, smaller employers
          pay no employer share, and some employers cover the employee
          share too. The TriMet tax (0.8237%) and Lane Transit tax
          (0.80%), by contrast, are your employer&apos;s bill for
          in-district payroll — they are never withheld from your pay,
          and this calculator never deducts them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Oregon?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: a
          subtraction that changes with every employee&apos;s federal
          tax, a transit tax on every wage, and a paid-leave
          contribution to split correctly.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies the Department of Revenue formula on every run and
          files the federal and Oregon returns from the same figures.
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
          year of pay, then divides by your pay periods — the method
          the mainstream paycheck calculators use. Federal tax uses
          the {TAX_YEAR} IRS brackets and standard deduction. Oregon
          tax follows the Oregon Department of Revenue&apos;s computer
          formula (Publication 150-206-436, effective January 1,{" "}
          {TAX_YEAR}): annualized wages, less the federal income tax
          (capped at {fmt(OR_SUBTRACTION_CAP)} and phased out at
          higher wages), less Oregon&apos;s standard deduction,
          through Oregon&apos;s brackets, less a{" "}
          {fmt(OR_EXEMPTION_CREDIT)} credit per Oregon allowance. The
          statewide transit tax ({(OR_TRANSIT_RATE * 100).toFixed(1)}%,
          ORS 320.550) and the employee share of Paid Leave Oregon (
          {(OR_PAID_LEAVE_EMPLOYEE.rate * 100).toFixed(1)}% of wages up
          to {fmt(OR_PAID_LEAVE_EMPLOYEE.wageBase)}) are added as
          separate lines, as they appear on a real Oregon stub.
          Those Oregon figures come straight from the Department of
          Revenue&apos;s own published withholding tables — the
          same official source an Oregon employer&apos;s payroll
          is required to use — not from a generic national estimate
          of how Oregon tax might work.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: Oregon Department of Revenue, Withholding Tax
          Formulas, Publication 150-206-436 (Rev. 12-31-25) and
          Statewide Transit Tax guidance; Paid Leave Oregon (Oregon
          Employment Department), {TAX_YEAR} contribution rate; IRS
          Revenue Procedure 2025-32 ({TAX_YEAR} federal brackets and
          standard deductions); Social Security Administration,{" "}
          {TAX_YEAR} wage base ({fmt(SOCIAL_SECURITY_WAGE_BASE)}). Tax
          rules verified 22 November 2026. This calculator is an
          estimate, not tax advice — your employer&apos;s payroll and
          your Form OR-40 are the final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            A full year in one Oregon job, wages only; federal AGI
            equals wages (no other income), so the withholding and
            return mechanics coincide.
          </li>
          <li>
            Oregon allowances are 1 (single / head of household /
            filing separately) or 2 (married filing jointly) — self,
            plus a spouse. Dependents are claimed through the federal
            W-4 Step 3 field, not double-counted here.
          </li>
          <li>
            Oregon withholding uses the DOR withholding standard
            deduction ({fmt(OR_STANDARD_DEDUCTION_WITHHOLDING.single)}{" "}
            single and head of household;{" "}
            {fmt(OR_STANDARD_DEDUCTION_WITHHOLDING.mfj)} married). The
            return-level head-of-household standard deduction is
            $4,685 — the difference is a withholding-versus-return
            timing point, settled on Form OR-40.
          </li>
          <li>
            You pay the full {(OR_PAID_LEAVE_EMPLOYEE.rate * 100).toFixed(1)}%
            Paid Leave share (your employer has not volunteered to
            cover it); the Paid Leave and Social Security caps are
            tracked per employer.
          </li>
          <li>
            Not modelled: the Portland Metro Supportive Housing
            Services tax, Multnomah County Preschool for All, the
            hourly Workers&apos; Benefit Fund assessment, OregonSaves
            contributions, itemized deductions and the Oregon kicker.
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

      <StatePaycheckCluster state="OR" />
      <RelatedCalculators href="/us/oregon-paycheck-calculator" />
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
