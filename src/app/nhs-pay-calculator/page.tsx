import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import NhsPayCalculator from "@/components/NhsPayCalculator";
import {
  AFC_BANDS,
  AFC_LAST_VERIFIED,
  AFC_PAY_LABEL,
  AFC_SOURCE_URL,
  calculateNhsPay,
  NHS_PENSION_TIERS,
} from "@/lib/nhs-pay";
import { PAYE_RATES_LABEL } from "@/lib/rates";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/nhs-pay-calculator",
  "NHS Pay Calculator — Agenda for Change Bands & Take-Home Pay",
  "NHS pay calculator on the 2025/26 Agenda for Change scales (England): pick your band and pay step for annual, monthly, weekly and hourly pay, plus an estimated take-home after NHS pension, tax and NI.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const example = calculateNhsPay({
  bandIndex: 3, // Band 5
  stepIndex: 0, // Entry
  hoursPerWeek: 37.5,
  pensionRatePercent: 8.3,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is the NHS Band 5 salary in 2025/26?",
    answer:
      "Band 5 in England pays £31,049 a year at the entry step, £33,487 at the intermediate step and £37,796 at the top of the band, for a full-time 37.5-hour week. Band 5 is the starting band for newly qualified nurses, midwives, paramedics and allied health professionals.",
  },
  {
    question: "How much does a Band 5 nurse take home?",
    answer: `On the entry step of Band 5 (£31,049 a year, full time), this calculator estimates take-home pay of about ${gbp.format(example.netMonthly)} a month after the 8.3% NHS pension contribution, Income Tax and National Insurance. Your own figure depends on your tax code, pension tier and any extra payments such as unsocial-hours enhancements.`,
  },
  {
    question: "How do NHS pay steps work?",
    answer:
      "Each Agenda for Change band has step points. Bands 3 and 4 have two steps (entry and top); Bands 5 to 9 have three (entry, intermediate and top); Band 2 is a single rate. You move up a step after the set number of years in the band — two years to the intermediate step and two or three more to the top — subject to the pay progression rules in the NHS terms and conditions.",
  },
  {
    question: "How much pension do NHS staff pay?",
    answer:
      "Your NHS pension contribution is a flat percentage of all your pensionable pay, set by how much you earn: 5.2% up to £13,259, 6.5% to £27,797, 8.3% to £33,868, 9.8% to £50,845, 10.7% to £65,190 and 12.5% above that (2025/26 tiers). Most Band 5 staff pay 8.3% or 9.8%. Your employer pays a further 23.7% on top.",
  },
  {
    question: "Does this calculator include London weighting?",
    answer:
      "No. The figures use the basic England Agenda for Change rates. Staff working in and around London also receive the High Cost Area Supplement (HCAS) on top of basic pay, and unsocial hours, overtime and on-call payments are extra — so a London payslip will be higher than the estimate here.",
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
  name: "NHS Pay Calculator",
  url: `${AppConfig.siteUrl}/nhs-pay-calculator`,
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

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

export default function NhsPayCalculatorPage() {
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
          NHS Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This NHS pay calculator uses the official 2025/26 Agenda for
          Change pay scales for England. Pick your band and pay step to
          see your annual, monthly, weekly and hourly pay — and an
          estimated take-home after your NHS pension contribution, Income
          Tax and National Insurance.
        </p>
      </section>

      <NhsPayCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does NHS pay work?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Almost all NHS staff are paid under Agenda for Change (AfC),
          which puts every job into one of nine pay bands. Band 2 covers
          support roles such as healthcare assistants and porters; Band 5
          is where newly qualified nurses, midwives, paramedics and
          allied health professionals start; Band 9 covers directors and
          chief officers. Doctors, dentists and very senior managers are
          on separate arrangements.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Within each band you progress up step points as your experience
          grows. Bands 3 and 4 have an entry and a top step; Bands 5 to 9
          add an intermediate step in between; Band 2 is a single flat
          rate. The full-time rates below are for a 37.5-hour week — if
          you work fewer hours, your pay is pro-rata: the annual salary
          shrinks in proportion to your hours, but the hourly rate stays
          the same.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Agenda for Change pay scales 2025/26 (England)
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band</th>
                <th className={thClass}>Step</th>
                <th className={thClass}>Annual</th>
                <th className={thClass}>Hourly</th>
                <th className={thClass}>Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {AFC_BANDS.map((band) =>
                band.steps.map((step) => (
                  <tr key={`${band.band}-${step.label}`}>
                    <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                      {step.label === "Entry" || band.steps.length === 1
                        ? band.band
                        : ""}
                    </td>
                    <td className={tdClass}>
                      {step.label} ({step.yearsLabel})
                    </td>
                    <td className={tdClass}>{gbp.format(step.annual)}</td>
                    <td className={tdClass}>{gbp.format(step.hourly)}</td>
                    <td className={tdClass}>
                      {gbp.format(step.annual / 12)}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Source: {AFC_PAY_LABEL} —{" "}
          <a
            href={AFC_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          >
            nhsemployers.org
          </a>
          . Last verified: {AFC_LAST_VERIFIED}. England basic rates only:
          the London High Cost Area Supplement is not included, and
          Scotland, Wales and Northern Ireland set their own scales.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          NHS pension contributions 2025/26
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Your pension contribution is not a fixed amount: it is a flat
          percentage of all your pensionable pay, and the percentage
          depends on how much you earn. The calculator sets the rate from
          this table automatically — you can change it if yours differs.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Actual annual pensionable pay</th>
                <th className={thClass}>You pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NHS_PENSION_TIERS.map((tier) => (
                <tr key={tier.min}>
                  <td className={tdClass}>
                    {tier.min === 0
                      ? `Up to ${gbp.format(tier.max)}`
                      : tier.max === Infinity
                        ? `${gbp.format(tier.min)} and above`
                        : `${gbp.format(tier.min)} – ${gbp.format(tier.max)}`}
                  </td>
                  <td className={tdClass}>{tier.ratePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Member contribution tiers: NHS Pension Scheme (England and
          Wales), 2025/26 — NHSBSA. Your employer pays a further 23.7% of
          pensionable pay into the scheme.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How the take-home estimate works
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The NHS Pension Scheme is a net pay arrangement, so your pension
          contribution comes off your pay before Income Tax is worked
          out — but National Insurance is still charged on your full
          gross pay. The estimate uses the {PAYE_RATES_LABEL.toLowerCase()}{" "}
          with the standard personal allowance and tax code, and no
          student loan. For a salary outside the NHS, the{" "}
          <Link
            href="/40k-after-tax-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            take-home pay calculator
          </Link>{" "}
          shows the same working for any UK salary.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Worked example: a full-time Band 5 nurse on the entry step
          earns {gbp.format(example.grossAnnual)} a year (
          {gbp.format(example.grossMonthly)} a month). After{" "}
          {gbp.format(example.pensionAnnual)} of pension contributions,{" "}
          {gbp.format(example.incomeTax)} of Income Tax and{" "}
          {gbp.format(example.employeeNationalInsurance)} of National
          Insurance, the estimated take-home is{" "}
          {gbp.format(example.netMonthly)} a month. Try your own band
          and hours in the calculator above.
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
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What any UK salary leaves after Income Tax and National
              Insurance — the same tax working used in the estimate above.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/nhs-maternity-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              NHS Maternity Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Maternity pay under Agenda for Change: full pay, half pay
              plus SMP, then SMP, stage by stage from your salary.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/pro-rata-salary-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Pro-Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Part-time pay from any full-time salary, by hours or days —
              the same pro-rata maths the NHS calculator uses.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
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
              Convert between an annual salary and an hourly rate for any
              hours pattern, in either direction.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
