import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
  STANDARD_DEDUCTIONS,
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
  "/us/colorado-paycheck-calculator",
  "Colorado Paycheck Calculator — 2026 Net Pay, 4.4% Tax + FAMLI",
  "Free Colorado paycheck calculator for 2026: federal tax and FICA, Colorado's flat 4.4% income tax and the 0.44% FAMLI premium, line by line — plus Denver's occupational privilege tax and worked examples.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "CO",
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
// The running example: $75,000 a year, single, paid every 2 weeks.
const ex75 = calculateUsPaycheck(BASE_INPUT);
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 100000,
  filingStatus: "mfj",
  dependentsCreditAnnual: 4000,
});
const exDenver = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 60000,
  worksInDenver: true,
});
const famliOf = (r: ReturnType<typeof calculateUsPaycheck>) =>
  r.extraLines.find((l) => l.id === "famli")?.annual ?? 0;
const famliPerPeriodOf = (r: ReturnType<typeof calculateUsPaycheck>) =>
  r.extraLines.find((l) => l.id === "famli")?.perPeriod ?? 0;
const optOf = (r: ReturnType<typeof calculateUsPaycheck>) =>
  r.extraLines.find((l) => l.id === "denver-opt")?.annual ?? 0;
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $75,000 paycheck in Colorado?",
    answer: `On a $75,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex75.grossPerPeriod)} paycheck loses ${fmt(ex75.federalPerPeriod)} of federal income tax, ${fmt(ex75.socialSecurityPerPeriod)} of Social Security, ${fmt(ex75.medicarePerPeriod)} of Medicare, ${fmt(ex75.statePerPeriod)} of Colorado income tax and ${fmt(famliPerPeriodOf(ex75))} of FAMLI premium — net pay of ${fmt(ex75.netPerPeriod)} every 2 weeks, ${fmt(ex75.netAnnual)} a year. Colorado's two lines are the state tax (${fmt(ex75.stateAnnual)} a year) and the FAMLI premium (${fmt(famliOf(ex75))} a year). Your own figures depend on your pay, filing status and Form W-4 — run them through the calculator above.`,
  },
  {
    question: "What is Colorado's income tax rate in 2026?",
    answer:
      "A flat 4.40% of federal taxable income — your federal wages after pre-tax deductions and the federal standard deduction — for every filing status and income level (Colorado Department of Revenue, forms DR 0104 and DR 1098). Colorado has no state standard deduction of its own and no brackets: the federal taxable income is the base. One wrinkle: in a year when state revenue exceeds the TABOR (Referendum C) cap, the rate is temporarily reduced — it was 4.25% for 2024. For 2026 the State Controller certified that fiscal 2025–26 revenue came in below the cap, so no reduction applies and the full 4.40% is in force.",
  },
  {
    question: "What is the FAMLI deduction on my Colorado paycheck?",
    answer: `FAMLI is Colorado's paid family and medical leave insurance. The ${TAX_YEAR} premium is 0.88% of wages up to the Social Security wage base of ${fmt(SOCIAL_SECURITY_WAGE_BASE)}, split evenly: a 0.44% employee share and a 0.44% employer share. Employers with 10 or more employees owe their half; smaller employers owe no employer share; and any employer may choose to pay the employee's share too. On a $75,000 salary the employee share is ${fmt(famliOf(ex75))} a year. The calculator models the standard case — you pay your 0.44% — and shows it as its own line, because several national calculators quietly leave it out and overstate Colorado take-home pay.`,
  },
  {
    question: "What is Denver's occupational privilege tax?",
    answer:
      "A flat local head tax on people who work in Denver: $5.75 a month from the employee (and $4.00 a month from the employer, which does not come out of your pay), owed for any month you earn at least $500 working in Denver — $69 a year at most. It is not a percentage, so it never grows with your salary. A few other metro cities charge their own smaller occupational privilege taxes, and Aurora repealed its tax from 1 January 2025. Tick the Denver box in the calculator if you work in Denver; everywhere else in Colorado there is no local income tax at all.",
  },
  {
    question: "Why does my Colorado pay stub show a different state figure?",
    answer: `Because employers withhold Colorado tax under the Department of Revenue's DR 1098 worksheet, which works from a state allowance amount rather than from your federal taxable income, and the two methods land a little apart during the year. On a $60,000 salary, DR 1098 withholding comes to roughly $2,398 a year against an annual tax liability of ${fmt(calculateUsPaycheck({ ...BASE_INPUT, annualSalary: 60000 }).stateAnnual)} on the same pay — the difference is settled when you file your DR 0104 return. This calculator shows the annual liability spread evenly over your paychecks, which is the figure your return is settled on.`,
  },
  {
    question: "How does a 401(k) change a Colorado paycheck?",
    answer:
      "Twice over. A traditional 401(k) contribution reduces federal taxable income — and because Colorado taxes federal taxable income, the same contribution reduces the Colorado tax too, at the flat 4.40%. It does not reduce Social Security or Medicare wages, and it does not reduce the wages the FAMLI premium is figured on by as much: FAMLI follows the FICA-style wage base here, so the premium is largely unmoved. A pre-tax health premium (or an HSA contribution through the cafeteria plan) reduces all of the income-tax and FICA bases.",
  },
  {
    question: "Why is my actual Colorado paycheck slightly different from this estimate?",
    answer:
      "This calculator works on annual figures — it figures the tax on a full year of income and divides by your pay periods, the same annualized approach the big commercial paycheck calculators use. Your employer withholds period by period: federal tax under IRS Publication 15-T using your exact Form W-4, and Colorado tax under the DR 1098 worksheet. A Step 2 box checked for multiple jobs, Step 4 adjustments, a mid-year start, or bonuses withheld at the flat 22% federal supplemental rate all move the real stub a little. The annual totals land close; treat any single paycheck as an estimate.",
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
  name: "Colorado Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/colorado-paycheck-calculator`,
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

export default function ColoradoPaycheckCalculatorPage() {
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
          Colorado Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Colorado taxes pay at a flat 4.4% of federal taxable income,
          and adds a 0.44% FAMLI premium most calculators skip. On a
          $75,000 salary, single and paid every two weeks, that leaves{" "}
          <strong>
            {fmt(ex75.netPerPeriod)} net per paycheck in {TAX_YEAR} —{" "}
            {fmt(ex75.netAnnual)} a year
          </strong>{" "}
          — after {fmt(ex75.federalAnnual)} federal tax,{" "}
          {fmt(ex75.socialSecurityAnnual + ex75.medicareAnnual)} FICA,{" "}
          {fmt(ex75.stateAnnual)} Colorado tax and {fmt(famliOf(ex75))}{" "}
          FAMLI.
        </p>
      </section>

      <UsPaycheckCalculator state="CO" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $75,000 in Colorado, line by line
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
                  Colorado income tax at 4.4% of federal taxable income
                </td>
                <td className={tdClass}>−{fmt(ex75.statePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>FAMLI premium at 0.44%</td>
                <td className={tdClass}>
                  −{fmt(famliPerPeriodOf(ex75))}
                </td>
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
          The Colorado figure is the one worth understanding: the
          state taxes the same $58,900 of federal taxable income the
          federal calculation arrives at (the $75,000 salary less the{" "}
          {fmt(STANDARD_DEDUCTIONS.single)} standard deduction), at a
          flat 4.4% — {fmt(ex75.stateAnnual)} a year. Two more cases
          from the same calculator: a married couple filing jointly on
          $100,000 with $4,000 of W-4 Step 3 credits pays{" "}
          {fmt(exMfj.stateAnnual)} of Colorado tax and keeps{" "}
          {fmt(exMfj.netAnnual)} a year; and a single filer on $60,000
          who works in Denver pays {fmt(optOf(exDenver))} a year of
          occupational privilege tax on top of {fmt(exDenver.stateAnnual)}{" "}
          of state tax and {fmt(famliOf(exDenver))} of FAMLI, keeping{" "}
          {fmt(exDenver.netAnnual)}.
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
                <th className={thClass}>Colorado tax</th>
                <th className={thClass}>FAMLI</th>
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
                    −{fmt(famliPerPeriodOf(result))}
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
          Take-home pay at common Colorado salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Colorado tax / year</th>
                <th className={thClass}>FAMLI / year</th>
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
                  <td className={tdClass}>{fmt(famliOf(result))}</td>
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
          rates, no Denver OPT. The FAMLI column stops growing at the{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} wage base — the premium is
          capped there, like Social Security — while the Colorado tax
          column keeps climbing in a straight 4.4% line, because a flat
          tax on federal taxable income has no brackets to climb.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Colorado taxes a paycheck
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Colorado is the simplest state model in this set: one flat
          rate, 4.40%, applied to federal taxable income. There is no
          Colorado standard deduction and no Colorado bracket table —
          the federal calculation does that work, and the state takes
          its percentage of the result (Colorado Department of
          Revenue, forms DR 0104 and DR 1098). The one moving part is
          TABOR: the state constitution&apos;s Taxpayer&apos;s Bill of
          Rights caps revenue growth, and in a surplus year the income
          tax rate is temporarily cut instead — it was 4.25% for 2024.
          For {TAX_YEAR} the State Controller certified on 8 September
          2026 that fiscal 2025–26 revenue came in $175.9M below the
          Referendum C cap, so no cut applies and 4.40% stands.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          FAMLI: the premium line most calculators miss
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Since 2023 Colorado employers and employees have funded the
          state&apos;s paid family and medical leave programme,
          FAMLI, through a premium on wages — 0.88% in {TAX_YEAR} on
          wages up to {fmt(SOCIAL_SECURITY_WAGE_BASE)}, split evenly
          between employer and employee. Your 0.44% share is a real
          paycheck deduction, separate from income tax, and it buys
          the entitlement: up to 12 weeks of paid leave for a new
          child, a serious health condition or a family member&apos;s
          care. Employers with 10 or more employees must pay their
          half; smaller employers may opt out of the employer share;
          and an employer may pay your share for you — if yours does,
          set the figure aside, because the calculator models the
          standard split.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Denver&apos;s occupational privilege tax — and the end of
          Aurora&apos;s
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Colorado has no city income taxes, but a handful of metro
          cities levy an occupational privilege tax — a flat monthly
          head tax on working in the city. Denver&apos;s is the one
          that matters: $5.75 a month from the employee for any month
          with at least $500 of Denver earnings, plus $4.00 a month
          from the employer that never touches your pay (City and
          County of Denver, Tax Guide Topic 61). Aurora voters
          repealed their city&apos;s tax, which ended on 1 January
          2025 — one reason older calculators that still list Aurora
          are out of date. Outside these flat charges, your Colorado
          stub carries the federal lines, the state line and FAMLI,
          and nothing else.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Colorado?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: DR 1098
          withholding on every run, the FAMLI premium split reported
          quarterly, and Denver&apos;s OPT for Denver-based staff.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          works out the federal and Colorado withholding on every run
          and files the returns from the same figures, so payday and
          the quarterly filings stay in step.
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
          year of pay — gross income, less pre-tax deductions, less
          the {TAX_YEAR} standard deduction, through the {TAX_YEAR}{" "}
          federal brackets, less any W-4 Step 3 credits — then divides
          by your pay periods. Colorado tax is 4.40% of that same
          federal taxable income, the DR 0104 base. Employers withhold
          under the DR 1098 worksheet instead, which uses a state
          allowance rather than federal taxable income, so a real stub
          can sit a little above or below the liability shown here;
          the DR 0104 return settles the difference. FAMLI is the
          0.44% employee share on wages up to{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}; the Denver OPT is modelled
          as $5.75 × 12 when average monthly Denver earnings reach
          $500.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR});
          Social Security Administration, Contribution and Benefit
          Base ({TAX_YEAR}); Colorado Department of Revenue, forms
          DR 1098 and DR 0104 (the 4.40% rate); Colorado State
          Controller certification, 8 September 2026 (no TABOR rate
          reduction for {TAX_YEAR}); Colorado FAMLI Division (the
          0.88% premium and the even split); City and County of
          Denver, Tax Guide Topic 61 (the $5.75 employee OPT). Tax
          rules verified 22 November 2026. This calculator is an
          estimate, not tax advice — your employer&apos;s payroll and
          your own tax return are the final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            A full year in one Colorado job, on a standard Form W-4,
            with wages as the only income. Colorado additions and
            subtractions that do not arise on ordinary wages are not
            modelled.
          </li>
          <li>
            FAMLI is modelled at the employee paying the full 0.44%
            employee share. If your employer pays some or all of that
            share for you, your premium line is smaller and your net
            pay higher.
          </li>
          <li>
            The Denver OPT is modelled as a flat $69 a year when your
            average month clears the $500 Denver-earnings threshold;
            a part-year in Denver pro-rates in real payroll.
          </li>
          <li>
            A traditional 401(k) reduces the federal and Colorado
            income-tax wages but not the FICA wages; a pre-tax health
            premium (and an HSA contribution through the cafeteria
            plan) reduces the FICA wages as well.
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

      <StatePaycheckCluster state="CO" />
      <RelatedCalculators href="/us/colorado-paycheck-calculator" />
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
