import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  NJ_EXEMPTION_JOINT,
  NJ_EXEMPTION_SINGLE,
  NJ_FILING_THRESHOLDS,
  NJ_FLI_RATE,
  NJ_FLI_WAGE_BASE,
  NJ_TABLE_A_RATES,
  NJ_TABLE_A_TOPS,
  NJ_TABLE_B_RATES,
  NJ_TABLE_B_TOPS,
  NJ_TDI_RATE,
  NJ_TDI_WAGE_BASE,
  NJ_UI_RATE,
  NJ_UI_WAGE_BASE,
  PAY_FREQUENCIES,
  SOCIAL_SECURITY_WAGE_BASE,
  TAX_YEAR,
  type UsPaycheckInput,
} from "@/lib/us-paycheck";

// Page-level groupings of the engine's NJ constants.
const NJ_EXEMPTION = { single: NJ_EXEMPTION_SINGLE, mfj: NJ_EXEMPTION_JOINT };
const NJ_UI_WF = {
  rate: NJ_UI_RATE,
  wageBase: NJ_UI_WAGE_BASE,
  max: Math.round(NJ_UI_RATE * NJ_UI_WAGE_BASE * 100) / 100,
};
const NJ_TDI = {
  rate: NJ_TDI_RATE,
  wageBase: NJ_TDI_WAGE_BASE,
  max: Math.round(NJ_TDI_RATE * NJ_TDI_WAGE_BASE * 100) / 100,
};
const NJ_FLI = {
  rate: NJ_FLI_RATE,
  wageBase: NJ_FLI_WAGE_BASE,
  max: Math.round(NJ_FLI_RATE * NJ_FLI_WAGE_BASE * 100) / 100,
};
const NJ_TAX_TABLES = {
  A: [...NJ_TABLE_A_TOPS, Infinity].map((upTo, i) => ({
    upTo,
    rate: NJ_TABLE_A_RATES[i],
  })),
  B: [...NJ_TABLE_B_TOPS, Infinity].map((upTo, i) => ({
    upTo,
    rate: NJ_TABLE_B_RATES[i],
  })),
};
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";
import StatePaycheckCluster from "@/components/StatePaycheckCluster";
import RelatedGuides from "@/components/RelatedGuides";

export const metadata: Metadata = pageMetadata(
  "/us/new-jersey-paycheck-calculator",
  "New Jersey Paycheck Calculator — 2026 Net Pay With UI, TDI & FLI",
  "Free NJ paycheck calculator for 2026: federal tax and FICA plus New Jersey's graduated income tax and the three worker contributions — UI, TDI and FLI — at the official 2026 rates and caps, line by line.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "NJ",
  payType: "salary",
  annualSalary: 85000,
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
const ex85 = calculateUsPaycheck(BASE_INPUT);
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 130000,
  filingStatus: "mfj",
});
const ex200 = calculateUsPaycheck({ ...BASE_INPUT, annualSalary: 200000 });
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 85000, 100000, 130000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);

const ui = (r: typeof ex85) => r.extraLines.find((l) => l.id === "nj-ui")!;
const tdi = (r: typeof ex85) => r.extraLines.find((l) => l.id === "nj-tdi")!;
const fli = (r: typeof ex85) => r.extraLines.find((l) => l.id === "nj-fli")!;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of an $85,000 paycheck in New Jersey?",
    answer: `On an $85,000 salary, single and paid every 2 weeks in ${TAX_YEAR}, each ${fmt(ex85.grossPerPeriod)} paycheck loses ${fmt(ex85.federalPerPeriod)} of federal tax, ${fmt(ex85.socialSecurityPerPeriod)} of Social Security, ${fmt(ex85.medicarePerPeriod)} of Medicare, ${fmt(ex85.statePerPeriod)} of New Jersey tax, ${fmt(ui(ex85).perPeriod)} of UI/WF, ${fmt(tdi(ex85).perPeriod)} of TDI and ${fmt(fli(ex85).perPeriod)} of FLI — net pay of ${fmt(ex85.netPerPeriod)} every 2 weeks, ${fmt(ex85.netAnnual)} a year. Eight lines in total; run your own figures through the calculator above.`,
  },
  {
    question: "What are the New Jersey income tax brackets for 2026?",
    answer:
      "Seven brackets for single and married-filing-separately filers (Table A), eight for joint and head-of-household filers (Table B), running from 1.4% to 10.75% — and the 10.75% rate only bites on New Jersey taxable income over $1,000,000. The tables are statutory and have not been indexed or changed since 2020; both are printed in full in the brackets section below. There is no standard deduction — a $1,000 personal exemption ($2,000 joint) comes off instead.",
  },
  {
    question: "What are UI, TDI and FLI on my New Jersey pay stub?",
    answer: `Three state-plan contributions most states never charge workers. UI/WF (unemployment and workforce) is ${(NJ_UI_WF.rate * 100).toFixed(3)}% of the first ${fmt(NJ_UI_WF.wageBase)} of wages — ${fmt(ui(ex85).annual)} on an $85,000 salary, and the line stops once your wages pass the cap. TDI (temporary disability) is ${(NJ_TDI.rate * 100).toFixed(2)}% and FLI (family leave insurance) is ${(NJ_FLI.rate * 100).toFixed(2)}%, both on the first ${fmt(NJ_TDI.wageBase)} of wages. FLI is paid entirely by workers; TDI is shared with your employer.`,
  },
  {
    question: "Does New Jersey tax my 401(k) and health premiums?",
    answer:
      "The 401(k), no — New Jersey excludes employee 401(k) contributions from wages, exactly like the federal system, so a deferral cuts your NJ tax as well as your federal tax. Health premiums paid by salary reduction, yes — New Jersey does not follow the federal §125 exclusion, so premiums, FSAs and HSA contributions all stay in your NJ wages, and 403(b)/457 contributions are taxed too. That is why your W-2 Box 16 (NJ wages) is usually higher than Box 1.",
  },
  {
    question: "Is there a New Jersey standard deduction?",
    answer: `No. New Jersey gives a personal exemption instead — ${fmt(NJ_EXEMPTION.single)} per filer, ${fmt(NJ_EXEMPTION.mfj)} on a joint return (N.J.S.A. 54A:3-1) — plus $1,500 per dependent on the return. This calculator claims the personal exemptions only; if you have dependents, your actual NJ tax will be a little lower than shown. And if your gross income is ${fmt(NJ_FILING_THRESHOLDS.single)} or less (${fmt(NJ_FILING_THRESHOLDS.mfj)} joint or head of household), no NJ tax is due at all.`,
  },
  {
    question: "Does New Jersey have local income taxes?",
    answer:
      "No employee local income tax anywhere in New Jersey. Newark and Jersey City do levy 1% payroll taxes, but they fall on employers and by law cannot be deducted from your pay — you will never see them on a stub. Your local bill arrives through property tax instead, which is where New Jersey ranks among the highest in the nation.",
  },
  {
    question: "Why is my actual New Jersey paycheck slightly different?",
    answer:
      "This calculator annualizes — it spreads each tax over a full year. Your employer withholds period by period using the NJ-WT percentage method (Rates A–E) and your NJ-W4 allowances, and the contribution caps bite mid-year on a real stub: the UI/WF line stops once you pass $44,800 of wages, and TDI/FLI stop at $171,100, whereas the estimate spreads the same capped annual total evenly. Private TDI/FLI plans, a governmental employer's lower UI rate, and mid-year starts move a stub a little more. Annual totals land close.",
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
  name: "New Jersey Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/new-jersey-paycheck-calculator`,
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

function bracketRows(tableKey: "A" | "B") {
  const rows = NJ_TAX_TABLES[tableKey];
  return rows.map((b, i) => ({
    range:
      i === 0
        ? `Up to ${fmt(b.upTo)}`
        : b.upTo === Infinity
          ? `Over ${fmt(rows[i - 1].upTo)}`
          : `${fmt(rows[i - 1].upTo + 1)} to ${fmt(b.upTo)}`,
    rate: `${(b.rate * 100).toFixed(b.rate * 100 >= 10 ? 2 : b.rate * 100 % 1 === 0 ? 0 : 3)}%`,
  }));
}

export default function NewJerseyPaycheckCalculatorPage() {
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
          New Jersey Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A New Jersey paycheck loses more lines than almost any other
          state&apos;s: federal tax, FICA, graduated New Jersey income
          tax, and three state-plan contributions most states
          don&apos;t charge workers. On an $85,000 salary, single and
          paid every 2 weeks, take-home pay is{" "}
          <strong>
            {fmt(ex85.netPerPeriod)} a paycheck in {TAX_YEAR} —{" "}
            {fmt(ex85.netAnnual)} a year
          </strong>
          . Enter your own pay below.
        </p>
      </section>

      <UsPaycheckCalculator state="NJ" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $85,000 in New Jersey, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex85.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex85.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex85.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex85.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  New Jersey income tax (graduated, after the $1,000
                  exemption)
                </td>
                <td className={tdClass}>−{fmt(ex85.statePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Unemployment + workforce (UI/WF) at{" "}
                  {(NJ_UI_WF.rate * 100).toFixed(3)}%
                </td>
                <td className={tdClass}>−{fmt(ui(ex85).perPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Temporary disability (TDI) at{" "}
                  {(NJ_TDI.rate * 100).toFixed(2)}%
                </td>
                <td className={tdClass}>−{fmt(tdi(ex85).perPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Family leave insurance (FLI) at{" "}
                  {(NJ_FLI.rate * 100).toFixed(2)}%
                </td>
                <td className={tdClass}>−{fmt(fli(ex85).perPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex85.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex85.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The three contribution lines are the ones rival calculators
          most often miss or price at last year&apos;s rates: together
          they take {fmt(ui(ex85).annual + tdi(ex85).annual + fli(ex85).annual)}{" "}
          a year out of this paycheck. Two more cases from the same
          calculator: a married couple filing jointly on $130,000 pays{" "}
          {fmt(exMfj.stateAnnual)} of NJ tax on the wider Table B
          brackets and keeps {fmt(exMfj.netAnnual)}; a single filer on
          $200,000 pays {fmt(ex200.stateAnnual)} of NJ tax and keeps{" "}
          {fmt(ex200.netAnnual)} — with TDI and FLI already capped at{" "}
          {fmt(tdi(ex200).annual)} and {fmt(fli(ex200).annual)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $85,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>NJ tax</th>
                <th className={thClass}>UI + TDI + FLI</th>
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
          the slicing changes. On a real stub the contribution lines
          stop mid-year once you pass each cap; the annual totals are
          the same either way.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at common New Jersey salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>NJ tax / year</th>
                <th className={thClass}>UI + TDI + FLI / year</th>
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
                    salary === 85000
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
          rates. Watch the contribution column flatten at the top of
          the table: UI/WF caps out at {fmt(NJ_UI_WF.max)} for everyone
          earning {fmt(NJ_UI_WF.wageBase)} or more, and TDI and FLI cap
          at {fmt(NJ_TDI.max)} and {fmt(NJ_FLI.max)} once wages pass{" "}
          {fmt(NJ_TDI.wageBase)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          New Jersey&apos;s graduated income tax
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          New Jersey is one of the few states in this series with real
          brackets (N.J.S.A. 54A:2-1). Single and
          married-filing-separately filers use Table A; joint filers
          and heads of household use the wider Table B. There is no
          standard deduction — a {fmt(NJ_EXEMPTION.single)} personal
          exemption ({fmt(NJ_EXEMPTION.mfj)} joint) comes off instead,
          plus $1,500 per dependent on the return — and no tax at all
          is due if gross income is {fmt(NJ_FILING_THRESHOLDS.single)}{" "}
          or less ({fmt(NJ_FILING_THRESHOLDS.mfj)} joint or head of
          household). The schedules are statutory and have not changed
          since 2020.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={tableWrapClass}>
            <table className="w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className={thClass}>
                    Table A — single / filing separately
                  </th>
                  <th className={thClass}>Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bracketRows("A").map((r) => (
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
                    Table B — joint / head of household
                  </th>
                  <th className={thClass}>Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bracketRows("B").map((r) => (
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
          The three contributions only New Jersey (almost) charges
          workers
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Beyond the income tax, New Jersey charges workers for three
          state plans ({TAX_YEAR} state-plan rates, NJ Department of
          Labor): unemployment and workforce development at{" "}
          {(NJ_UI_WF.rate * 100).toFixed(3)}% on the first{" "}
          {fmt(NJ_UI_WF.wageBase)} of wages (maximum {fmt(NJ_UI_WF.max)}
          — which is why that line stops part-way through the year);
          temporary disability insurance at{" "}
          {(NJ_TDI.rate * 100).toFixed(2)}% on the first{" "}
          {fmt(NJ_TDI.wageBase)} (maximum {fmt(NJ_TDI.max)}), shared
          with your employer; and family leave insurance at{" "}
          {(NJ_FLI.rate * 100).toFixed(2)}% on the same base (maximum{" "}
          {fmt(NJ_FLI.max)}), paid entirely by workers. Your employer
          pays its own, separate unemployment contribution — and if
          you hold two New Jersey jobs, contributions taken over the
          caps in total are creditable on your NJ-1040.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Why your New Jersey wages are higher than your federal wages
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          New Jersey follows the federal system on exactly one
          pre-tax item: the 401(k), which is excluded from NJ wages
          just as it is from federal wages. Everything else runs the
          other way — health premiums paid by salary reduction, FSA
          and HSA contributions, and 403(b)/457 deferrals are all
          taxed by New Jersey even though the IRS excludes them, so
          your W-2 Box 16 (state wages) normally exceeds Box 1. And
          there is no local income tax to worry about: the Newark and
          Jersey City payroll taxes are employer-paid by law and can
          never be withheld from your pay.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in New Jersey?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: two
          bracket tables, three worker contributions with three
          different caps, and NJ wages that differ from federal wages
          on almost every stub.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies the right table and each cap on every run and files
          the federal and New Jersey returns from the same figures.
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
          The calculator annualizes: it works out each tax on a full
          year of pay and divides by your pay periods. New Jersey
          income tax is figured from the NJ-1040 rate schedules on NJ
          wages — gross pay less 401(k) contributions only — less the{" "}
          {fmt(NJ_EXEMPTION.single)} / {fmt(NJ_EXEMPTION.mfj)} personal
          exemptions; §125 health premiums and HSA contributions stay
          in NJ wages, as New Jersey law requires. The three worker
          contributions use the NJ Department of Labor&apos;s{" "}
          {TAX_YEAR} state-plan rates on gross pay, with the
          private-sector UI/WF rate. Federal tax follows Revenue
          Procedure 2025-32 and Publication 15-T; FICA uses the{" "}
          {TAX_YEAR} Social Security wage base of{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: NJ Division of Taxation — Tax Rate Schedules (2020
          and after) and the 2026 NJ-1040-ES instructions; Exemptions
          guidance and N.J.S.A. 54A:3-1; Technical Bulletin TB-39(R)
          (cafeteria plans); “NJ Income Tax — Wages”. NJ Department of
          Labor, Division of Employer Accounts — {TAX_YEAR} worker
          contribution rates and the 29 December 2025 benefit-rates
          release. IRS Revenue Procedure 2025-32; Social Security
          Administration ({TAX_YEAR} wage base{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}). Tax rules verified 22
          November 2026. This calculator is an estimate, not tax
          advice — your employer&apos;s payroll and your NJ-1040 are
          the final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            A full year in one New Jersey job, wages only, as a New
            Jersey resident; commuters taxed by another state are
            outside this estimate.
          </li>
          <li>
            Only the personal exemptions are claimed. The $1,500
            per-dependent exemption, the $1,000 age-65+/blindness and
            veteran exemptions, and NJ credits (property-tax,
            child-care, EITC) are not modelled — your actual NJ tax
            may be lower.
          </li>
          <li>
            Contributions use the state-plan rates and the
            private-sector UI/WF worker rate of{" "}
            {(NJ_UI_WF.rate * 100).toFixed(3)}%. An approved private
            TDI/FLI plan, or a governmental employer (UI/WF 0.125%),
            changes those lines.
          </li>
          <li>
            The estimate spreads each capped contribution evenly over
            the year; on a real stub each line stops once its wage
            base is passed.
          </li>
          <li>
            403(b) and 457(b) contributions are not offered as inputs
            because New Jersey taxes them; enter them as post-tax
            deductions if you want them shown in net pay.
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

      <StatePaycheckCluster state="NJ" />
      <RelatedCalculators href="/us/new-jersey-paycheck-calculator" />
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
