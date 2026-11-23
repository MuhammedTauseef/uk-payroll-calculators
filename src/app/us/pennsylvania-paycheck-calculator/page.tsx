import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import UsPaycheckCalculator from "@/components/UsPaycheckCalculator";
import {
  calculateUsPaycheck,
  PA_UC_RATE,
  PHILLY_RESIDENT_RATE,
  PHILLY_NONRESIDENT_RATE,
  PA_TAX_RATE,
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
  "/us/pennsylvania-paycheck-calculator",
  "Pennsylvania Paycheck Calculator — 2026 Net Pay With Local EIT",
  "Free PA paycheck calculator for 2026: federal tax and FICA plus Pennsylvania's 3.07% state tax, your local earned income tax, the Philadelphia wage tax and the 0.07% employee UC — every line, including the 401(k) rule rivals get wrong.",
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fmt(n: number): string {
  return usd.format(n);
}

const BASE_INPUT: UsPaycheckInput = {
  state: "PA",
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
  paEitRatePercent: 1,
};

// Worked-example figures — computed by the same calculator function
// the tool above runs, so the page can never disagree with itself.
const ex75 = calculateUsPaycheck(BASE_INPUT);
const ex75NoLocal = calculateUsPaycheck({ ...BASE_INPUT, paEitRatePercent: 0 });
const exPhilly = calculateUsPaycheck({ ...BASE_INPUT, paPhilly: "resident" });
const exMfj = calculateUsPaycheck({
  ...BASE_INPUT,
  annualSalary: 100000,
  filingStatus: "mfj",
  preTax401kPercent: 5,
});
const frequencyRows = PAY_FREQUENCIES.map((f) => ({
  frequency: f,
  result: calculateUsPaycheck({ ...BASE_INPUT, frequency: f.id }),
}));
const salaryRows = [40000, 50000, 60000, 75000, 90000, 100000, 125000, 150000, 200000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s }),
  }),
);
const phillyRows = [40000, 50000, 60000, 75000, 90000, 100000, 125000, 150000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s, paPhilly: "resident" }),
  }),
);
// The commuter side of the same table: living outside Philadelphia
// and working in it, at the non-resident wage-tax rate.
const exPhillyNonres = calculateUsPaycheck({
  ...BASE_INPUT,
  paPhilly: "nonresident",
});
const phillyNonresRows = [40000, 50000, 60000, 75000, 90000, 100000, 125000, 150000].map(
  (s) => ({
    salary: s,
    result: calculateUsPaycheck({ ...BASE_INPUT, annualSalary: s, paPhilly: "nonresident" }),
  }),
);
// Hourly worked example: $27 an hour, 40 hours a week, with the
// default 1% local EIT — the calculator's hourly mode annualizes
// it to $56,160 and runs the same Pennsylvania maths.
const exHourly = calculateUsPaycheck({
  ...BASE_INPUT,
  payType: "hourly",
  hourlyRate: 27,
  hoursPerWeek: 40,
  overtimeHoursPerWeek: 0,
});
const exHourlyLocal = exHourly.extraLines.find((l) => l.id === "pa-local")!;
const exHourlyUc = exHourly.extraLines.find((l) => l.id === "pa-uc")!;

const ex75Local = ex75.extraLines.find((l) => l.id === "pa-local")!;
const ex75Uc = ex75.extraLines.find((l) => l.id === "pa-uc")!;
const exPhillyLocal = exPhilly.extraLines.find((l) => l.id === "pa-local")!;
const exPhillyNonresLocal = exPhillyNonres.extraLines.find(
  (l) => l.id === "pa-local",
)!;
const exMfjLocal = exMfj.extraLines.find((l) => l.id === "pa-local")!;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax comes out of a $75,000 paycheck in Pennsylvania?",
    answer: `On a $75,000 salary, single, with a 1% local earned income tax and paid every 2 weeks in ${TAX_YEAR}: ${fmt(ex75.federalAnnual)} federal, ${fmt(ex75.socialSecurityAnnual)} Social Security, ${fmt(ex75.medicareAnnual)} Medicare, ${fmt(ex75.stateAnnual)} Pennsylvania, ${fmt(ex75Local.annual)} local EIT and ${fmt(ex75Uc.annual)} employee UC — net pay of ${fmt(ex75.netAnnual)} a year, ${fmt(ex75.netPerPeriod)} every 2 weeks. In Philadelphia, the same salary nets ${fmt(exPhilly.netAnnual)} — the wage tax costs ${fmt(exPhillyLocal.annual - ex75Local.annual)} a year more than a 1% EIT.`,
  },
  {
    question: "Why does Pennsylvania tax my 401(k) contributions?",
    answer:
      "Pennsylvania never adopted the federal deferral: the Department of Revenue's PIT Guide lists employee contributions to a retirement or deferred-compensation plan as always taxable PA compensation, so your W-2 Box 16 is bigger than Box 1. You pay 3.07% (plus local EIT) on the way in — $153.50 a year of extra PA tax on a 5% deferral from $100,000 — and in exchange, qualifying retirement distributions after retirement age are PA-exempt. It is the mirror image of the federal system. A §125 health premium, by contrast, does reduce the PA base.",
  },
  {
    question: "What is the local Earned Income Tax, and why does my residence's PSD code matter?",
    answer:
      "Your municipality and school district levy a combined earned income tax (usually 1% in total) under Act 511, and Act 32 collects it by PSD code — the six-digit code for your home municipality and school district that you put on your Residency Certification Form. Your employer withholds the higher of your home rate or your workplace's non-resident rate. Find your code in the DCED Municipal Statistics address search, and enter your combined rate in the calculator above.",
  },
  {
    question: "What is the Philadelphia wage tax?",
    answer: `A city tax of ${(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% for residents (on all pay, wherever earned) and ${(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}% for non-residents working in the city, effective July 1, 2026 (3.74% and 3.43% before). It replaces the local EIT entirely, it is charged on gross pay with no 401(k) or cafeteria-plan exclusion, and Philadelphia charges no Local Services Tax on top. On a $75,000 salary it comes to ${fmt(exPhillyLocal.annual)} a year.`,
  },
  {
    question: "What is the 0.07% “PA SUI” line on my pay stub?",
    answer:
      "Pennsylvania is one of only three states where employees fund unemployment compensation too: 0.07% of all gross wages, with no cap — $52.50 a year on a $75,000 salary. Your employer pays a separate, larger UC contribution on your first $10,000 of wages; the 0.07% is your share, not the whole cost.",
  },
  {
    question: "What is the $52 Local Services Tax?",
    answer:
      "Many Pennsylvania municipalities charge a flat Local Services Tax of up to $52 a year for working there — about $2 per biweekly check — withheld by your employer. You are exempt in a municipality where you earn under $12,000 a year. This calculator leaves it out (it is at most $52 a year, and Philadelphia does not charge it), but your stub may show it.",
  },
  {
    question: "Does Pennsylvania have a standard deduction or a state W-4?",
    answer:
      "Neither. Pennsylvania withholds a flat 3.07% of compensation from the first dollar regardless of filing status or family size — the only common pay items that reduce the PA base are §125 health premiums and HSA contributions made through the cafeteria plan. Your filing status changes only your federal line, which is why a married couple and a single filer on the same Pennsylvania salary pay identical PA tax.",
  },
  {
    question: "How much is $27 an hour in Pennsylvania after tax?",
    answer: `At $27 an hour for 40 hours a week, gross pay is ${fmt(exHourly.grossAnnual)} a year. Single, paid every 2 weeks, with a 1% local earned income tax, in ${TAX_YEAR}: ${fmt(exHourly.federalAnnual)} of federal tax, ${fmt(exHourly.socialSecurityAnnual + exHourly.medicareAnnual)} of Social Security and Medicare, ${fmt(exHourly.stateAnnual)} of Pennsylvania tax at the flat 3.07%, ${fmt(exHourlyLocal.annual)} of local EIT and ${fmt(exHourlyUc.annual)} of employee unemployment contribution — leaving ${fmt(exHourly.netPerPeriod)} a paycheck, ${fmt(exHourly.netAnnual)} a year. The calculator above runs hourly pay directly: choose "An hourly rate" and it annualizes your rate and hours, overtime at 1.5 times the rate included. In Philadelphia, pick the resident or non-resident preset instead of the EIT — the wage tax replaces it.`,
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
  name: "Pennsylvania Paycheck Calculator",
  url: `${AppConfig.siteUrl}/us/pennsylvania-paycheck-calculator`,
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

export default function PennsylvaniaPaycheckCalculatorPage() {
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
          Pennsylvania Paycheck Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A Pennsylvania paycheck is taxed four ways most states never
          combine: federal tax and FICA, a flat 3.07% state tax with no
          standard deduction, a local earned income tax — 1% in most
          municipalities — and a 0.07% employee unemployment
          contribution. On $75,000, single, with a 1% local tax,
          take-home pay is{" "}
          <strong>{fmt(ex75.netAnnual)} a year</strong>.
        </p>
      </section>

      <UsPaycheckCalculator state="PA" />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: $75,000 in Pennsylvania, line by line
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
                <td className={tdClass}>Pennsylvania tax at 3.07%</td>
                <td className={tdClass}>−{fmt(ex75.statePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Local earned income tax at 1%</td>
                <td className={tdClass}>−{fmt(ex75Local.perPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  PA employee unemployment contribution at 0.07%
                </td>
                <td className={tdClass}>−{fmt(ex75Uc.perPeriod)}</td>
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
          Seven lines, and the local one is the one most calculators
          skip: dropping the 1% EIT alone would overstate this
          paycheck by {fmt(ex75Local.annual)} a year (net{" "}
          {fmt(ex75NoLocal.netAnnual)} instead of {fmt(ex75.netAnnual)}
          ). Two more cases from the same calculator: the same $75,000
          under the Philadelphia resident wage tax of{" "}
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% on gross pay
          nets {fmt(exPhilly.netAnnual)} —{" "}
          {fmt(ex75.netAnnual - exPhilly.netAnnual)} a year less than
          the 1% EIT version. And a married couple on $100,000
          deferring 5% into a 401(k) still pays PA tax of{" "}
          {fmt(exMfj.stateAnnual)} — on the full $100,000, because
          Pennsylvania taxes the deferral — plus{" "}
          {fmt(exMfjLocal.annual)} of EIT, keeping{" "}
          {fmt(exMfj.netAnnual)}.
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
                <th className={thClass}>PA tax</th>
                <th className={thClass}>Local EIT 1%</th>
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
                      result.extraLines.find((l) => l.id === "pa-local")
                        ?.perPeriod ?? 0,
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
          Take-home pay at common Pennsylvania salaries (1% local EIT)
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Federal tax / year</th>
                <th className={thClass}>FICA / year</th>
                <th className={thClass}>PA tax / year</th>
                <th className={thClass}>Local EIT / year</th>
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
                    {fmt(
                      result.extraLines.find((l) => l.id === "pa-local")
                        ?.annual ?? 0,
                    )}
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
          Single, paid every 2 weeks, 1% local EIT and the 0.07%
          employee UC included in every row, {TAX_YEAR} rates.
          Pennsylvania&apos;s combined take is almost perfectly flat:
          state, local and UC together run at a constant{" "}
          {(PA_TAX_RATE * 100 + 1 + PA_UC_RATE * 100).toFixed(2)}%
          of salary at every level, because none of the three has a
          deduction or a bracket.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paid by the hour? $27 an hour, worked through
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculator above takes hourly pay directly: choose
          &quot;An hourly rate&quot;, enter the rate and your hours,
          and it annualizes the pay (rate × hours × 52 weeks) and
          runs the same Pennsylvania calculation — flat 3.07% state
          tax, your local EIT and the 0.07% unemployment
          contribution. At $27 an hour for 40 hours a week, with a
          1% local EIT, that is {fmt(exHourly.grossAnnual)} a year:
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
                <td className={tdClass}>Pennsylvania tax at 3.07%</td>
                <td className={tdClass}>−{fmt(exHourly.statePerPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Local EIT at 1%</td>
                <td className={tdClass}>−{fmt(exHourlyLocal.perPeriod)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Unemployment contribution at 0.07%
                </td>
                <td className={tdClass}>−{fmt(exHourlyUc.perPeriod)}</td>
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
          taxed like any other Pennsylvania wages — the flat rates
          do not change with the kind of pay, only the 401(k) rule
          does: a deferral never shrinks the Pennsylvania lines,
          hourly or salaried.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The same salaries in Philadelphia (resident wage tax)
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>PA tax / year</th>
                <th className={thClass}>Philadelphia wage tax / year</th>
                <th className={thClass}>Net / paycheck</th>
                <th className={thClass}>Net / year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {phillyRows.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 75000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>{fmt(salary)}</td>
                  <td className={tdClass}>{fmt(result.stateAnnual)}</td>
                  <td className={tdClass}>
                    {fmt(
                      result.extraLines.find((l) => l.id === "pa-local")
                        ?.annual ?? 0,
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
          Philadelphia residents pay the wage tax at{" "}
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% on gross pay
          instead of an EIT — at $75,000 that is{" "}
          {fmt(exPhillyLocal.annual)} a year,{" "}
          {fmt(exPhillyLocal.annual - ex75Local.annual)} more than a 1%
          EIT costs. Non-residents who work in the city pay{" "}
          {(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}% — choose
          that preset in the calculator.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Living outside the city: the non-resident rate, in figures
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Commuters are not a footnote in Philadelphia — the wage
          tax reaches everyone who works there. A non-resident pays{" "}
          {(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}% (the rate in
          force from July 1, 2026, per the City of Philadelphia
          Department of Revenue) on pay for work done in the city,
          instead of the resident{" "}
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}%: at $75,000 that
          is {fmt(exPhillyNonresLocal.annual)} a year against the
          resident&apos;s {fmt(exPhillyLocal.annual)} — a saving of{" "}
          {fmt(exPhillyLocal.annual - exPhillyNonresLocal.annual)},
          and the reason the calculator keeps the two presets
          separate. The same salaries, commuted in:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>PA tax / year</th>
                <th className={thClass}>Philadelphia wage tax (non-resident) / year</th>
                <th className={thClass}>Net / paycheck</th>
                <th className={thClass}>Net / year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {phillyNonresRows.map(({ salary, result }) => (
                <tr
                  key={salary}
                  className={
                    salary === 75000
                      ? "bg-brand-50 dark:bg-brand-900/30 font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>{fmt(salary)}</td>
                  <td className={tdClass}>{fmt(result.stateAnnual)}</td>
                  <td className={tdClass}>
                    {fmt(
                      result.extraLines.find((l) => l.id === "pa-local")
                        ?.annual ?? 0,
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
          Two boundaries matter. Residents owe the resident rate on
          all of their pay, wherever the work happens; non-residents
          owe the non-resident rate only on pay for work performed
          in Philadelphia — days worked from home or elsewhere
          outside the city are not Philadelphia wages, and
          non-residents can claim a refund of tax withheld on them
          through the Philadelphia Tax Center. And unlike the Act 32
          EIT everywhere else in Pennsylvania, the Philadelphia tax
          is charged on full gross pay: a 401(k) deferral does not
          shrink it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Four taxes, four different wage bases
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Pennsylvania is the state where “pre-tax” stops meaning one
          thing. Whether a deduction shrinks your tax depends on which
          tax you mean:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pay item</th>
                <th className={thClass}>Federal tax</th>
                <th className={thClass}>FICA</th>
                <th className={thClass}>PA tax + EIT</th>
                <th className={thClass}>Philadelphia + UC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>401(k) / 403(b) / 457 deferral</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>No</td>
                <td className={tdClass}>No — always taxable</td>
                <td className={tdClass}>No</td>
              </tr>
              <tr>
                <td className={tdClass}>§125 health premium</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Philadelphia: no · UC: subtracts</td>
              </tr>
              <tr>
                <td className={tdClass}>HSA through the §125 plan</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Subtracts</td>
                <td className={tdClass}>Philadelphia: no · UC: subtracts</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Local tax is the real Pennsylvania tax
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The state rate has been 3.07% since 2004 (72 P.S. §7302), but
          where you live decides the rest. Under Act 32 your
          municipality and school district levy a combined EIT —
          1% in most places, more in home-rule towns (Pittsburgh&apos;s
          combined rate is 3%) — collected by your PSD code, and your
          employer withholds the higher of your home rate or your
          workplace&apos;s non-resident rate. Add the flat Local
          Services Tax of up to $52 a year for working in a
          municipality (exempt under $12,000 of earnings there), and
          Philadelphia as a separate world entirely: a Sterling Act
          wage tax on gross pay, stepped down most years, at{" "}
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% resident /{" "}
          {(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}% non-resident
          from July 1, 2026. Look up your own PSD code and rate in the{" "}
          <a
            href="https://dced.pa.gov/local-government/municipal-statistics/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            DCED Municipal Statistics search
          </a>
          .
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Why your W-2 Box 16 is bigger than Box 1
        </h3>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Because Pennsylvania taxes the 401(k) deferral going in, the
          state wages in Box 16 exceed the federal wages in Box 1 by
          exactly your deferral — and the deal completes at the other
          end, when qualifying retirement distributions are PA-exempt.
          One border note: Pennsylvania has reciprocal agreements with
          New Jersey, Ohio, Indiana, Maryland, Virginia and West
          Virginia — commuters from those states can exempt themselves
          from PA withholding with Form REV-419 and pay their home
          state instead. This calculator models a Pennsylvania
          resident working in Pennsylvania.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Paying a team in Pennsylvania?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Running the payroll is the other side of this page: four
          different wage bases, a PSD code per employee, and a city tax
          with its own gross base.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          applies the 3.07%, each employee&apos;s local rate and the
          Philadelphia wage tax on every run and files the federal and
          Pennsylvania returns from the same figures.
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
          year of pay and divides by your pay periods. Pennsylvania
          state tax is 3.07% of PA-taxable compensation with no
          standard deduction or exemption; employee 401(k), 403(b)
          and 457 deferrals do not reduce that base, while premiums
          for health coverage paid through a federally qualified §125
          cafeteria plan — and HSA contributions made through that
          plan, per PA DOR letter ruling PIT-06-005 — do. The local
          earned income tax you enter is applied to that same PA
          base; the Philadelphia presets (
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% resident /{" "}
          {(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}%
          non-resident, from July 1, 2026) are applied to gross pay,
          as the city requires. The employee unemployment contribution
          is 0.07% of gross wages with no cap. Federal tax uses the{" "}
          {TAX_YEAR} IRS brackets and standard deductions on wages
          after all pre-tax deductions; FICA uses the {TAX_YEAR}{" "}
          Social Security wage base of {fmt(SOCIAL_SECURITY_WAGE_BASE)}.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: PA Department of Revenue — Tax Rates and Employer
          Withholding (3.07%, 72 P.S. §7302); PA Personal Income Tax
          Guide (401(k) always taxable; §125 exclusion, 72 P.S.
          §7301(d)(vi)); letter ruling PIT-06-005; PA Department of
          Labor &amp; Industry (employee UC 0.07% of gross wages); PA
          DCED CLGS-32-1 and Local Withholding Tax FAQs (EIT bases and
          the higher-of rule); City of Philadelphia Department of
          Revenue (wage tax{" "}
          {(PHILLY_RESIDENT_RATE * 100).toFixed(3)}% /{" "}
          {(PHILLY_NONRESIDENT_RATE * 100).toFixed(3)}% from July
          1, 2026); IRS Revenue Procedure 2025-32; Social Security
          Administration ({TAX_YEAR} wage base{" "}
          {fmt(SOCIAL_SECURITY_WAGE_BASE)}). Tax rules verified 22
          November 2026. This calculator is an estimate, not tax
          advice — your employer&apos;s payroll and your PA-40 are
          the final word.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Assumptions and limits
        </h2>
        <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            A full year in one Pennsylvania job, as a Pennsylvania
            resident working in Pennsylvania. Reciprocal-state
            commuters (NJ/OH/IN/MD/VA/WV, Form REV-419) are not
            modelled.
          </li>
          <li>
            The local rate is the single combined municipal +
            school-district rate you enter, or a Philadelphia preset;
            making the Act 32 higher-of comparison between home and
            workplace rates is yours and your employer&apos;s to make
            — the DCED lookup is linked above.
          </li>
          <li>
            The Local Services Tax (up to $52 a year) is excluded, as
            stated; your stub may show it.
          </li>
          <li>
            The Philadelphia presets use the rates in force from July
            1, 2026; pay earned in January–June 2026 was withheld at
            3.74% / 3.43%.
          </li>
          <li>
            PA Tax Forgiveness (Schedule SP), Schedule UE unreimbursed
            employee expenses, and Schedule O deductions other than a
            payroll HSA are return-level items, not withholding — not
            modelled.
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

      <StatePaycheckCluster state="PA" />
      <RelatedCalculators href="/us/pennsylvania-paycheck-calculator" />
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
