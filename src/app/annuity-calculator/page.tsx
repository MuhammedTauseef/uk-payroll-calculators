import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import AnnuityCalculator from "@/components/AnnuityCalculator";
import {
  annuityRatePer100k,
  calculateAnnuity,
  ANNUITY_RATE_ANCHORS,
} from "@/lib/annuity";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/annuity-calculator",
  "Annuity Calculator UK — What a Pension Pot Buys You",
  "Free UK annuity calculator: estimate the guaranteed income a pension pot buys at 55 to 75 — single or joint life, level or rising payments, guarantee periods — with the full annuity rate table printed, not hidden.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Worked examples — computed by the same functions the calculator
// runs, so the page can never disagree with itself.
function potExample(pot: number) {
  return calculateAnnuity({
    pot,
    taxFreePercent: 25,
    age: 65,
    jointLife: false,
    escalation: "level",
    guaranteeYears: 0,
  });
}
const POT_ROWS = [50000, 100000, 150000, 200000, 300000].map((pot) => ({
  pot,
  result: potExample(pot),
}));

const exHeadline = calculateAnnuity({
  pot: 100000,
  taxFreePercent: 0,
  age: 65,
  jointLife: false,
  escalation: "level",
  guaranteeYears: 0,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does a £100,000 annuity pay?",
    answer:
      "On typical November 2026 market rates, about £7,300 a year for a healthy 65-year-old buying a single-life, level annuity with no guarantee — roughly £608 a month. If you take the usual 25% tax-free cash first, £75,000 is left to buy the annuity and the income is about £5,475 a year. Younger buyers get less per £100,000, older buyers more, and options like joint life or rising payments lower the starting income.",
  },
  {
    question: "Annuity or drawdown — which is better?",
    answer:
      "They do different jobs. An annuity swaps the pot for a guaranteed income for life: it can never run out and never falls with the stock market, but it usually dies with you (or your spouse, on a joint-life policy) and cannot be changed later. Drawdown keeps the money invested and flexible — you choose what to take and what is left can be passed on — but the income is not guaranteed and a bad run of returns can shrink it. Many people mix the two: an annuity for the essential bills, drawdown for the rest. This calculator only estimates the annuity side.",
  },
  {
    question: "Can I take 25% tax-free cash and buy an annuity with the rest?",
    answer:
      "Yes — that is the usual order, and it is how this calculator works. The tax-free cash (normally up to 25% of the pot) comes off first, and only the remainder buys the annuity. On a £100,000 pot that means £25,000 tax-free cash and an annuity bought with £75,000. Taking the cash reduces the income, so the choice is between a bigger lump sum now and a bigger guaranteed income for life.",
  },
  {
    question: "Do annuity rates go up with age?",
    answer:
      "Yes. The provider expects to pay an older buyer for fewer years, so the income per £100,000 rises with the age at purchase — on the rates used here, from about £5,900 a year at 55 to about £9,600 at 75, for the same single-life, level annuity. Waiting also means years with no annuity income, so a higher rate is not automatically a better deal; it depends how long the income is paid for.",
  },
  {
    question: "What is an enhanced annuity?",
    answer:
      "An annuity that pays more because the buyer's life expectancy is shorter — for example because of a medical condition, or because they smoke or have high blood pressure. Providers ask health and lifestyle questions when they quote, and an honest answer can raise the income substantially over the standard rate. The rates in this calculator assume good health, so treat the result as the standard-rate estimate and expect a personal quote to differ if your health is not good.",
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
  name: "Annuity Calculator UK",
  url: `${AppConfig.siteUrl}/annuity-calculator`,
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

export default function AnnuityCalculatorPage() {
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
          Annuity Calculator UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Estimate the guaranteed income a pension pot buys as an
          annuity: on typical November 2026 rates, a healthy
          65-year-old gets about {gbp.format(exHeadline.annualIncome)}{" "}
          a year per £100,000 — single or joint life, level or rising
          payments, with or without a guarantee period. The full rate
          table is printed below, so you can check every figure.
        </p>
      </section>

      <AnnuityCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Annuity rates: what £100,000 buys in November 2026
        </h2>
        <p className={bodyClass}>
          Most annuity calculators hide their rates. These are the
          rates this calculator uses — estimated yearly income per
          £100,000 of pot used to buy the annuity (after any tax-free
          cash), for a buyer in good health:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Age at purchase</th>
                <th className={thClass}>Single life, level</th>
                <th className={thClass}>Joint life (50%), level</th>
                <th className={thClass}>Single, rising 3% a year</th>
                <th className={thClass}>Single, rising with RPI</th>
                <th className={thClass}>Single, level, 10-year guarantee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ANNUITY_RATE_ANCHORS.map(({ age }) => (
                <tr key={age}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {age}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(
                      annuityRatePer100k({
                        age,
                        jointLife: false,
                        escalation: "level",
                        guaranteeYears: 0,
                      }),
                    )}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(
                      annuityRatePer100k({
                        age,
                        jointLife: true,
                        escalation: "level",
                        guaranteeYears: 0,
                      }),
                    )}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(
                      annuityRatePer100k({
                        age,
                        jointLife: false,
                        escalation: "fixed3",
                        guaranteeYears: 0,
                      }),
                    )}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(
                      annuityRatePer100k({
                        age,
                        jointLife: false,
                        escalation: "rpi",
                        guaranteeYears: 0,
                      }),
                    )}
                  </td>
                  <td className={tdClass}>
                    {gbp.format(
                      annuityRatePer100k({
                        age,
                        jointLife: false,
                        escalation: "level",
                        guaranteeYears: 10,
                      }),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          These are illustrative rates based on typical market levels
          in November 2026, not live quotes. Real quotes are priced
          for one person on one day: your health, postcode, the
          provider&apos;s own pricing and gilt yields on the day all
          move the figure, and an enhanced annuity for a buyer in poor
          health can pay considerably more than the standard rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much annuity does a pension pot buy?
        </h2>
        <p className={bodyClass}>
          The pot is not the annuity. The usual route takes the
          tax-free cash first — normally up to 25% — and buys the
          annuity with what is left. At 65, single life, level
          payments, no guarantee, the standard examples look like
          this:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Pension pot</th>
                <th className={thClass}>Tax-free cash (25%)</th>
                <th className={thClass}>Left to buy the annuity</th>
                <th className={thClass}>Income per year</th>
                <th className={thClass}>Income per month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {POT_ROWS.map(({ pot, result }) => (
                <tr key={pot}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {gbp.format(pot)}
                  </td>
                  <td className={tdClass}>{gbp.format(result.taxFreeCash)}</td>
                  <td className={tdClass}>
                    {gbp.format(result.annuitisedPot)}
                  </td>
                  <td className={tdClass}>{gbp.format(result.annualIncome)}</td>
                  <td className={tdClass}>
                    {gbp.format(result.monthlyIncome)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Annuity income is taxed as income, in the same way as a
          salary — the figures above are before tax. What lands in
          your account depends on your total income for the year,
          including the State Pension; the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows how a given gross income is taxed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Pension annuity comparison: how the options change your income
        </h2>
        <p className={bodyClass}>
          Every option is a trade between income now, income later
          and protection for someone else. On a £100,000 purchase at
          65, the choices move the starting income like this:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Choice</th>
                <th className={thClass}>Starting income per £100,000</th>
                <th className={thClass}>What you get for it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Single life, level
                </td>
                <td className={tdClass}>
                  {gbp.format(
                    annuityRatePer100k({
                      age: 65,
                      jointLife: false,
                      escalation: "level",
                      guaranteeYears: 0,
                    }),
                  )}
                </td>
                <td className={tdClass}>
                  The highest starting income — but payments stop at
                  your death and inflation erodes them every year.
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Joint life (50%)
                </td>
                <td className={tdClass}>
                  {gbp.format(
                    annuityRatePer100k({
                      age: 65,
                      jointLife: true,
                      escalation: "level",
                      guaranteeYears: 0,
                    }),
                  )}
                </td>
                <td className={tdClass}>
                  Half the income continues to a spouse or partner for
                  their lifetime after your death.
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Rising 3% a year
                </td>
                <td className={tdClass}>
                  {gbp.format(
                    annuityRatePer100k({
                      age: 65,
                      jointLife: false,
                      escalation: "fixed3",
                      guaranteeYears: 0,
                    }),
                  )}
                </td>
                <td className={tdClass}>
                  Payments grow every year; on these rates the yearly
                  amount passes the level annuity&apos;s at about age
                  76, and the total received catches up in your late
                  eighties — if you live that long.
                </td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  10-year guarantee
                </td>
                <td className={tdClass}>
                  {gbp.format(
                    annuityRatePer100k({
                      age: 65,
                      jointLife: false,
                      escalation: "level",
                      guaranteeYears: 10,
                    }),
                  )}
                </td>
                <td className={tdClass}>
                  If you die within ten years, payments continue to
                  your estate for the rest of the period — costs
                  surprisingly little income.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          You can also shop around: you do not have to buy the
          annuity from the pension provider that held the pot, and
          the difference between the best and worst quote for the
          same options is regularly several hundred pounds a year.
          Pension Wise, the government-backed service run by
          MoneyHelper, gives free guidance appointments from age 50.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Annuity vs drawdown
        </h2>
        <p className={bodyClass}>
          The alternative to an annuity is flexi-access drawdown:
          the pot stays invested and you take income from it as you
          choose. Drawdown offers flexibility, growth potential and
          money left over for your family if you die early — but the
          income can fall, the pot can run out, and you carry the
          investment risk yourself. An annuity hands all of that to
          the insurer: the income is guaranteed for life, however
          long you live and whatever markets do, but the decision is
          effectively permanent and the pot is gone.
        </p>
        <p className={bodyClass}>
          Neither is compulsory, and they combine: a common pattern
          is to annuitise enough to cover essential spending
          alongside the State Pension, and leave the rest in
          drawdown. What matters is comparing real quotes for the
          annuity side — start with the estimate above, then take it
          to the open market. GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/plan-retirement-income"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            plan your retirement income
          </a>{" "}
          guidance walks through the options in order.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates are illustrative estimates based on typical market
          levels, checked November 2026. This page is an estimating
          tool, not financial advice; an annuity purchase is usually
          irreversible, so take regulated advice or a free Pension
          Wise appointment before you buy.
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
              Annuity income is taxed like a salary — see what any
              gross income leaves after Income Tax and National
              Insurance.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/employer-cost-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer Cost Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Still building a pot? See what an employer adds on top
              of a salary, including workplace pension contributions.
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
              Pro Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Phasing into retirement part-time? Work out the
              part-time salary from the full-time figure first.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/payslip-generator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Generator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Build a full UK payslip — gross pay, Income Tax,
              National Insurance and net pay — ready to print or save
              as a PDF.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the generator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
