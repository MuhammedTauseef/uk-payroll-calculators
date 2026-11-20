import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  BRACKET_RATES,
  BRACKET_TOPS,
  calculateUsPaycheck,
  OHIO_FLAT_BASE,
  OHIO_FLAT_RATE,
  OHIO_TAX_FREE_TOP,
  ohioPersonalExemption,
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

export const metadata: Metadata = pageMetadata(
  "/us/ohio-paycheck-calculator",
  "Ohio Paycheck Calculator — 2026 Net Pay With State, City & School Tax",
  "Free Ohio paycheck calculator for 2026: federal tax and FICA plus the Ohio HB 96 flat tax, your city income tax and school district tax, on any salary or hourly pay — worked examples at every pay frequency.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "OH",
  payType: "salary",
  annualSalary: 65000,
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
// The running example: $65,000 a year, single, paid every 2 weeks,
// no city or school-district tax.
const ex65 = calculateUsPaycheck(BASE_INPUT);
const ex65Columbus = calculateUsPaycheck({
  ...BASE_INPUT,
  cityRatePercent: 2.5,
});
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

function bracketRows(status: "single" | "mfj") {
  const tops = BRACKET_TOPS[status];
  return BRACKET_RATES.map((rate, i) => {
    const lower = i === 0 ? 0 : tops[i - 1];
    const label =
      i < tops.length
        ? `${fmt(lower)} to ${fmt(tops[i])}`
        : `Over ${fmt(lower)}`;
    return { label, rate: `${(rate * 100).toFixed(0)}%` };
  });
}

const CITY_RATES: { city: string; rate: string; note: string }[] = [
  { city: "Columbus", rate: "2.5%", note: "Collected by the city income tax division" },
  { city: "Cleveland", rate: "2.5%", note: "Collected through the CCA (Central Collection Agency)" },
  { city: "Cincinnati", rate: "2.1%", note: "The lowest rate of Ohio's six biggest cities" },
  { city: "Toledo", rate: "2.5%", note: "2.25% permanent plus a 0.25% temporary levy" },
  { city: "Akron", rate: "2.5%", note: "Collected through RITA in most suburbs too" },
  { city: "Dayton", rate: "2.5%", note: "Applies to wages earned in the city" },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $65,000 paycheck in Ohio?",
    answer: `On a $65,000 salary, single and paid every 2 weeks, with no city or school-district tax, the ${TAX_YEAR} deductions per paycheck are ${fmt(ex65.federalPerPeriod)} of federal income tax, ${fmt(ex65.socialSecurityPerPeriod)} of Social Security, ${fmt(ex65.medicarePerPeriod)} of Medicare and ${fmt(ex65.statePerPeriod)} of Ohio state tax out of each ${fmt(ex65.grossPerPeriod)} paycheck — net pay of ${fmt(ex65.netPerPeriod)} every 2 weeks, ${fmt(ex65.netAnnual)} a year. Add a city rate in the calculator and the same salary in Columbus at 2.5% nets ${fmt(ex65Columbus.netAnnual)} a year instead.`,
  },
  {
    question: "How does Ohio's flat income tax work in 2026?",
    answer: `House Bill 96 replaced Ohio's graduated brackets with a single flat rate for ${TAX_YEAR}. After your personal exemption, the first ${fmt(OHIO_TAX_FREE_TOP)} of Ohio taxable income is taxed at 0%. Above that, one rate — ${(OHIO_FLAT_RATE * 100).toFixed(2)}% — applies to everything, computed as ${fmt(OHIO_FLAT_BASE)} plus ${(OHIO_FLAT_RATE * 100).toFixed(2)}% of the amount over ${fmt(OHIO_TAX_FREE_TOP)}. There are no higher brackets to climb into: a $70,000 earner and a $700,000 earner pay the same rate on the slice above the threshold, though the $700,000 earner loses the personal exemption entirely.`,
  },
  {
    question: "What is the Ohio personal exemption, and how much is it?",
    answer: `Ohio gives each filer a personal exemption that comes off income before the flat tax is figured, and its size depends on your income: ${fmt(ohioPersonalExemption(40000))} if you earn $40,000 or less, ${fmt(ohioPersonalExemption(80000))} up to $80,000, ${fmt(ohioPersonalExemption(100000))} below $500,000, and nothing at $500,000 or more. On the $65,000 worked example the exemption is ${fmt(ohioPersonalExemption(65000))}, which is part of why the state tax comes to only about ${fmt(ex65.stateAnnual)} for the year. Spouses and dependents bring their own exemptions on a real Ohio return — this calculator models the filer's own exemption only.`,
  },
  {
    question: "Do I have to pay city income tax in Ohio?",
    answer:
      "Very likely, if you live or work in one of Ohio's roughly 600 taxing municipalities. City tax is charged on wages where you work, and most cities also tax residents on wages earned elsewhere with a partial credit for tax paid to the work city — the credit percentage varies, so commuters can owe a top-up to their home city. Columbus, Cleveland, Toledo, Akron and Dayton all charge 2.5%; Cincinnati charges 2.1%. Employers withhold the work-city tax; the residence-city balance, if any, is settled on a city return filed with RITA, the CCA or the city itself. Enter your work-city rate in the calculator to see the effect.",
  },
  {
    question: "What is the Ohio school district income tax?",
    answer:
      "On top of state and city tax, more than 200 Ohio school districts levy their own income tax on residents, at rates from 0.25% to 2%. It is based on where you live, not where you work, and it comes in two forms: a traditional base that taxes most Ohio taxable income, and an earned-income-only base that leaves out pensions, interest and similar income. Not every district has one — the Ohio Department of Taxation's online Finder tool (and the district code on your state return, form SD 100) tells you whether yours does and at what rate. Enter the rate in the calculator if it applies to you.",
  },
  {
    question: "I live in Ohio but work in another state. Which state taxes me?",
    answer:
      "For wages, probably only Ohio. Ohio has reciprocity agreements with Indiana, Kentucky, Michigan, Pennsylvania and West Virginia: residents of those states who work in Ohio owe no Ohio tax on their wages, and Ohio residents working there owe no tax to the work state either — you file a withholding exemption (form IT 4NR with an Ohio employer) and the tax is taken only by your home state. Reciprocity covers wages and salary only, not business or rental income, and it does not exist with other states — work in New York or Illinois and both states are in play, with a credit for the tax paid to the work state on your Ohio return.",
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
  name: "Ohio Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/ohio-paycheck-calculator`,
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

export default function OhioPaycheckCalculatorPage() {
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
          Ohio Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An Ohio paycheck carries four layers of tax: federal income
          tax, FICA, the Ohio flat tax — 0% on the first{" "}
          {fmt(OHIO_TAX_FREE_TOP)} of Ohio taxable income, then{" "}
          {(OHIO_FLAT_RATE * 100).toFixed(2)}% — and, for most workers,
          a city tax of around 2.5%. On a $65,000 salary, single, paid
          every 2 weeks with no city tax, net pay is{" "}
          {fmt(ex65.netPerPeriod)} a paycheck in {TAX_YEAR}. Enter your
          own pay and your city and school rates below.
        </p>
      </section>

      <UsPaycheckCalculator state="OH" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $65,000 in Ohio, line by line
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay (every 2 weeks)</td>
                <td className={tdClass}>{fmt(ex65.grossPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Federal income tax</td>
                <td className={tdClass}>−{fmt(ex65.federalPerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Social Security at 6.2%</td>
                <td className={tdClass}>
                  −{fmt(ex65.socialSecurityPerPeriod)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Medicare at 1.45%</td>
                <td className={tdClass}>−{fmt(ex65.medicarePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Ohio state income tax (flat tax)</td>
                <td className={tdClass}>−{fmt(ex65.statePerPeriod)}</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-50">
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>
                  {fmt(ex65.netPerPeriod)} every 2 weeks ·{" "}
                  {fmt(ex65.netAnnual)} a year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The Ohio line is smaller than most people expect, and the
          flat tax is why. Ohio taxable income here is the $65,000
          salary minus the {fmt(ohioPersonalExemption(65000))} personal
          exemption — {fmt(65000 - ohioPersonalExemption(65000))} — and
          the first {fmt(OHIO_TAX_FREE_TOP)} of that is taxed at 0%,
          so the state takes {fmt(ex65.stateAnnual)} for the whole
          year, about {fmt(ex65.statePerPeriod)} a paycheck. The
          federal tax of {fmt(ex65.federalAnnual)} is figured on the
          federal definition instead: salary minus the{" "}
          {fmt(STANDARD_DEDUCTIONS.single)} standard deduction, sliced
          through the 10% and 12% brackets. Two different tax bases,
          two different answers — the calculator keeps them separate,
          the way payroll does.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same $65,000 salary at every pay frequency
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay frequency</th>
                <th className={thClass}>Gross per period</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>Ohio tax</th>
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
          Every tax is figured on the year and divided, so the annual
          columns never move — only the size of each check does.
          Compare job offers on the per-year column, especially when
          one employer pays weekly and another monthly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home pay at common Ohio salaries
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>Ohio tax / year</th>
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
                    salary === 65000
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
          city or school-district tax, {TAX_YEAR} rates. Watch the
          Ohio column: it stays at $0 until the salary passes the
          exemption plus the {fmt(OHIO_TAX_FREE_TOP)} zero band, then
          grows at a flat {(OHIO_FLAT_RATE * 100).toFixed(2)} cents per
          extra dollar — there is no higher Ohio bracket waiting
          further up the table. Now compare the Texas column that is
          missing from our{" "}
          <Link href="/us/texas-paycheck-calculator" className={linkClass}>
            Texas paycheck calculator
          </Link>
          : same federal lines, no state line at all.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The Ohio flat tax: House Bill 96 explained
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Ohio taxed income through graduated brackets for decades —
          as recently as 2024 there were three rates above the zero
          band. House Bill 96, the state budget act signed in 2025,
          finished a series of cuts by collapsing the structure to a
          single flat rate for {TAX_YEAR}: under Ohio Revised Code
          section 5747.02, Ohio taxable income up to{" "}
          {fmt(OHIO_TAX_FREE_TOP)} is taxed at 0%, and everything above
          it at {(OHIO_FLAT_RATE * 100).toFixed(2)}% — applied in the
          Department of Taxation&apos;s computation as{" "}
          {fmt(OHIO_FLAT_BASE)} plus {(OHIO_FLAT_RATE * 100).toFixed(2)}%
          of the excess over {fmt(OHIO_TAX_FREE_TOP)}. A flat tax does
          not mean a flat bill: because the first{" "}
          {fmt(OHIO_TAX_FREE_TOP)} is free and the personal exemption
          comes off first, the effective Ohio rate on a $65,000 salary
          is about {((ex65.stateAnnual / 65000) * 100).toFixed(2)}% of gross
          pay, and it rises toward the headline rate only as income
          grows far past the threshold.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          The personal exemption tiers
        </h3>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Your Ohio income</th>
                <th className={thClass}>Personal exemption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>$40,000 or less</td>
                <td className={tdClass}>{fmt(ohioPersonalExemption(40000))}</td>
              </tr>
              <tr>
                <td className={tdClass}>$40,001 to $80,000</td>
                <td className={tdClass}>{fmt(ohioPersonalExemption(80000))}</td>
              </tr>
              <tr>
                <td className={tdClass}>$80,001 to $499,999</td>
                <td className={tdClass}>{fmt(ohioPersonalExemption(100000))}</td>
              </tr>
              <tr>
                <td className={tdClass}>$500,000 or more</td>
                <td className={tdClass}>{fmt(ohioPersonalExemption(500000))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The exemption is per person — a joint Ohio return claims one
          for each spouse, plus one for each dependent. This
          calculator applies the filer&apos;s own exemption, which is
          the conservative single-filer picture; a family&apos;s real
          Ohio tax will usually be a little lower than the figure
          shown here.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          City income tax: the layer most Ohioans actually feel
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          For most Ohio workers the city tax is bigger than the state
          tax. Roughly 600 Ohio municipalities tax wages, generally
          where the work is done, and most also tax their residents on
          out-of-city earnings with a credit — full or partial,
          depending on the city — for the tax paid to the work city.
          The big-city rates cluster at 2.5%:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>City</th>
                <th className={thClass}>Income tax rate</th>
                <th className={thClass}>Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {CITY_RATES.map((c) => (
                <tr key={c.city}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {c.city}
                  </td>
                  <td className={tdClass}>{c.rate}</td>
                  <td className={tdClass}>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Put a number on it: the $65,000 worked example, worked in
          Columbus at 2.5%, loses a further{" "}
          {fmt(ex65Columbus.cityAnnual)} a year to the city and nets{" "}
          {fmt(ex65Columbus.netAnnual)} instead of {fmt(ex65.netAnnual)}{" "}
          — the city takes more than the state&apos;s{" "}
          {fmt(ex65.stateAnnual)}. City tax in this calculator is
          figured on your Medicare wages (gross pay less a pre-tax
          health premium), which is how most Ohio cities define
          taxable wages; a 401(k) contribution does not reduce it.
          Collection runs through RITA (the Regional Income Tax
          Agency) for most suburbs, the CCA for Cleveland and its
          members, or the city tax office itself.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          And the school district tax on top
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          More than 200 Ohio school districts add their own income
          tax, charged on residents of the district wherever they
          work. Rates run from 0.25% to 2%. Traditional-base districts
          tax roughly the same income as the state; earned-income
          districts tax only wages and self-employment income, leaving
          pensions and investment income out. Whether your district
          has one is a lookup, not a guess: the Ohio Department of
          Taxation&apos;s Finder tool maps your address to the
          district and its rate, and the district code appears on your
          Ohio return (form SD 100). Enter the rate in the calculator
          above and it is applied to your Ohio taxable income, the
          same base the state uses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Working across the state line: reciprocity
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Ohio borders five states, and it has a reciprocity agreement
          with every one of them — Indiana, Kentucky, Michigan,
          Pennsylvania and West Virginia. Under reciprocity, wages are
          taxed only by the state you live in: a Kentucky resident
          working in Cincinnati owes no Ohio tax on those wages, and
          an Ohio resident working in Pittsburgh owes no Pennsylvania
          tax. To make the withholding match, the cross-border worker
          files an exemption certificate with the employer (form IT
          4NR for a non-resident working in Ohio) so the work state
          stops withholding, and the home state withholds instead.
          Reciprocity covers wages and salaries only — business
          income, rent and most other income still follow the source
          state&apos;s rules — and outside the five neighbours there
          is no agreement: work in a non-reciprocity state and you
          file in both, claiming a credit on your Ohio return for the
          tax paid to the other state.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Federal income tax brackets for {TAX_YEAR}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The federal layer is the same in Ohio as everywhere: the
          IRS brackets below, applied after the standard deduction —{" "}
          {fmt(STANDARD_DEDUCTIONS.single)} single,{" "}
          {fmt(STANDARD_DEDUCTIONS.mfj)} married filing jointly,{" "}
          {fmt(STANDARD_DEDUCTIONS.hoh)} head of household,{" "}
          {fmt(STANDARD_DEDUCTIONS.mfs)} married filing separately.
          Each rate applies only to the income inside its band.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Single filers
        </h3>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bracketRows("single").map((r) => (
                <tr key={r.label}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={tdClass}>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Married filing jointly
        </h3>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bracketRows("mfj").map((r) => (
                <tr key={r.label}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={tdClass}>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Methodology and sources
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculator annualizes: it works out each tax on a full
          year of pay and divides by your pay periods — the method the
          mainstream paycheck calculators use. Federal tax is figured
          on gross pay less pre-tax deductions and the {TAX_YEAR}{" "}
          standard deduction, through the {TAX_YEAR} brackets, less any
          W-4 Step 3 credits. FICA uses the Social Security
          Administration&apos;s {TAX_YEAR} wage base of{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)} and is figured on wages
          after a pre-tax health premium but before a 401(k). Ohio tax
          is figured on gross pay less pre-tax deductions and the
          personal exemption for your income band, under the HB 96
          flat tax; city tax is figured on the Medicare-wage base and
          school-district tax on the Ohio taxable income, at the rates
          you enter. An employer&apos;s per-period withholding under
          IRS Publication 15-T and Ohio&apos;s employer withholding
          tables can differ slightly from this annual estimate, and
          spouse and dependent exemptions on a real Ohio return will
          usually lower the state figure a little.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: IRS Revenue Procedure 2025-32 ({TAX_YEAR} brackets
          and standard deductions); IRS Publication 15-T ({TAX_YEAR});
          Social Security Administration, Contribution and Benefit
          Base ({TAX_YEAR}); Ohio Department of Taxation and Ohio
          Revised Code section 5747.02 (HB 96 flat tax, personal
          exemptions, school-district taxes and The Finder). Tax rules
          verified 19 November 2026. This calculator is an estimate,
          not tax advice — your employer&apos;s payroll and your own
          tax returns are the final word.
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
            href="/us/texas-paycheck-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Texas Paycheck Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The other US state on this hub — and the simplest
              paycheck in the country: federal tax and FICA only,
              with a state, city and school tax bill of exactly $0.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the Texas calculator →
            </span>
          </Link>
          <Link
            href="/au/tax-rate-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Australia Tax Rate Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The hub&apos;s Australia section: income tax and the
              Medicare levy on any income, marginal and effective
              rates side by side.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the Australia calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              £40k After Tax UK
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The UK side of this hub: take-home pay on a £40,000 UK
              salary after Income Tax and National Insurance, with a
              calculator that works for any salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the UK calculator →
            </span>
          </Link>
          <Link
            href="/hourly-rate-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Hourly Rate Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Turn a UK hourly rate into a salary — or a salary into
              the hourly rate it really works out at — before you run
              either through a paycheck calculator.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Comparing an offer across countries? This Ohio page uses
          the IRS and Ohio {TAX_YEAR} rules; the{" "}
          <Link href="/au/tax-rate-calculator" className={linkClass}>
            Australia page
          </Link>{" "}
          uses the ATO 2025–26 rules and the UK tools use the April
          2026 UK rules. The{" "}
          <Link href="/blog/take-home-pay" className={linkClass}>
            take-home pay guide
          </Link>{" "}
          explains the moving parts on each side.
        </p>
      </section>
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
