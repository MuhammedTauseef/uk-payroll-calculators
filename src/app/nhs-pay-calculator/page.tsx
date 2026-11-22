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
  nhsPensionRateFor,
} from "@/lib/nhs-pay";
import { PAYE_RATES_LABEL } from "@/lib/rates";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

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

// Band 5 section data (added 20 November 2026): every figure is
// computed by the same calculateNhsPay the calculator runs, at the
// pension tier the calculator itself applies to that step — nothing
// is typed in by hand. Band 5 is index 3 of AFC_BANDS.
const band5 = AFC_BANDS[3];
const band5Rows = band5.steps.map((step, i) => ({
  step,
  pensionRate: nhsPensionRateFor(step.annual),
  result: calculateNhsPay({
    bandIndex: 3,
    stepIndex: i,
    hoursPerWeek: 37.5,
    pensionRatePercent: nhsPensionRateFor(step.annual),
  }),
}));
const band4Top = AFC_BANDS[2].steps[AFC_BANDS[2].steps.length - 1];
const band6Entry = AFC_BANDS[4].steps[0];

const BAND5_FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Band 5 pay in London, with HCAS?",
    answer: `The High Cost Area Supplement is paid on top of basic pay: 20% in Inner London, 15% in Outer London and 5% in the Fringe, each subject to minimum and maximum amounts. At 20%, the Band 5 entry step of ${gbp.format(band5.steps[0].annual)} gains ${gbp.format(band5.steps[0].annual * 0.2)} of HCAS, taking it to ${gbp.format(band5.steps[0].annual * 1.2)}; at the top step the supplement is ${gbp.format(band5.steps[2].annual * 0.2)}. HCAS is pensionable and taxed like the rest of your pay. This calculator uses basic rates only, so add your zone's supplement on top of its figures.`,
  },
  {
    question: "How long does it take to reach the top of Band 5?",
    answer: `You reach the intermediate step (${gbp.format(band5.steps[1].annual)}) after 2 years in the band and the top step (${gbp.format(band5.steps[2].annual)}) after 4 or more years, subject to the pay progression rules. Entry to top is worth ${gbp.format(band5.steps[2].annual - band5.steps[0].annual)} a year more in gross pay, and about ${gbp.format(band5Rows[2].result.netMonthly - band5Rows[0].result.netMonthly)} a month more in estimated take-home pay at full time.`,
  },
  {
    question: "What is the take-home pay at the top of Band 5?",
    answer: `On the top step (${gbp.format(band5.steps[2].annual)} a year, full time), this calculator estimates take-home pay of ${gbp.format(band5Rows[2].result.netMonthly)} a month after the 9.8% NHS pension contribution (${gbp.format(band5Rows[2].result.pensionAnnual)} a year), Income Tax of ${gbp.format(band5Rows[2].result.incomeTax)} and National Insurance of ${gbp.format(band5Rows[2].result.employeeNationalInsurance)}. Unsocial-hours enhancements, overtime and HCAS would all come on top.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...FAQS, ...BAND5_FAQS].map((f) => ({
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
          the same. Leave follows its own service-based scale: our{" "}
          <Link
            href="/nhs-annual-leave-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            NHS annual leave calculator
          </Link>{" "}
          turns your length of NHS service and contracted hours into
          your Agenda for Change leave entitlement in days and hours.
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

      <section id="band-5" className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Band 5 pay in detail: steps, take-home and London
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Band 5 is the band most new NHS clinicians join — it is the
          starting band for newly qualified nurses, midwives,
          paramedics and allied health professionals — so it earns a
          closer look than the full table above gives it. These are
          the three Band 5 steps at full time (37.5 hours a week),
          with the estimated take-home pay the calculator above
          produces for each one, at the NHS pension tier that applies
          to that step.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band 5 step</th>
                <th className={thClass}>Annual</th>
                <th className={thClass}>Hourly</th>
                <th className={thClass}>Pension</th>
                <th className={thClass}>Est. take-home / month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {band5Rows.map(({ step, pensionRate, result }) => (
                <tr key={step.label}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {step.label} ({step.yearsLabel})
                  </td>
                  <td className={tdClass}>{gbp.format(step.annual)}</td>
                  <td className={tdClass}>{gbp.format(step.hourly)}</td>
                  <td className={tdClass}>{pensionRate}%</td>
                  <td className={tdClass}>
                    {gbp.format(result.netMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Read the steps as a career in miniature. A newly qualified
          nurse starts on {gbp.format(band5Rows[0].result.netMonthly)}{" "}
          a month take-home; two years in, the intermediate step lifts
          that to {gbp.format(band5Rows[1].result.netMonthly)}; and at
          the top of the band it is{" "}
          {gbp.format(band5Rows[2].result.netMonthly)} — the move from
          entry to top is worth{" "}
          {gbp.format(band5.steps[2].annual - band5.steps[0].annual)}{" "}
          a year in gross pay. The steps either side of Band 5 are
          closer than most people expect: the top of Band 4 (
          {gbp.format(band4Top.annual)}) sits just{" "}
          {gbp.format(band5.steps[0].annual - band4Top.annual)} below
          the Band 5 entry step, and the top of Band 5 sits{" "}
          {gbp.format(band6Entry.annual - band5.steps[2].annual)}{" "}
          below the first step of Band 6 (
          {gbp.format(band6Entry.annual)}) — which is why promotion
          from the top of Band 5 can feel smaller than the change in
          responsibility, while qualifying into Band 5 from Band 4
          feels bigger than the salary gap alone.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          London changes the picture. Band 5 staff working in and
          around the capital also receive the High Cost Area
          Supplement on top of the basic rates in the table: 20% of
          basic pay in Inner London, 15% in Outer London and 5% in
          the Fringe, each subject to minimum and maximum amounts.
          At the full 20%, the entry step gains{" "}
          {gbp.format(band5.steps[0].annual * 0.2)} — taking{" "}
          {gbp.format(band5.steps[0].annual)} to{" "}
          {gbp.format(band5.steps[0].annual * 1.2)} before tax — and
          the top step gains {gbp.format(band5.steps[2].annual * 0.2)}
          . HCAS is pensionable pay and is taxed like the rest of
          your salary; the calculator on this page uses basic England
          rates only, so treat its London answers as the floor, not
          the figure. Band 5 staff planning leave around a family can
          price it with the{" "}
          <Link
            href="/nhs-maternity-pay-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            NHS maternity pay calculator
          </Link>
          , and time off sick is covered by the{" "}
          <Link
            href="/ssp-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            SSP calculator
          </Link>{" "}
          and our guide to{" "}
          <Link
            href="/how-much-is-statutory-sick-pay"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            how much statutory sick pay is
          </Link>
          . For the band-by-band story behind these figures, the{" "}
          <Link
            href="/blog/nhs-pay-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            NHS pay calculator guide
          </Link>{" "}
          works through every band from 2 to 9.
        </p>
        <div className="space-y-4">
          {BAND5_FAQS.map((f) => (
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

      <RelatedCalculators href="/nhs-pay-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
