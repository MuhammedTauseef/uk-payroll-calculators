import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import AnnuityCalculator from "@/components/AnnuityCalculator";
import {
  annuityRatePer100k,
  calculateAnnuity,
  ANNUITY_RATE_ANCHORS,
  LUMP_SUM_ALLOWANCE,
} from "@/lib/annuity";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/annuity-calculator",
  "Annuity Calculator UK — How Much Does £100,000 Pay?",
  "UK annuity calculator with the full rate table printed: what a pension pot pays a year at 55–75, single or joint life, level or rising, after tax-free cash.",
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
const exAfterCash = potExample(100000);

// Level vs 3%-escalating crossover at 65, worked from the same rates
// the calculator uses: the year the rising payment first passes the
// level payment, and the year the total received catches up.
const rateLevel65 = annuityRatePer100k({
  age: 65,
  jointLife: false,
  escalation: "level",
  guaranteeYears: 0,
});
const rateEsc65 = annuityRatePer100k({
  age: 65,
  jointLife: false,
  escalation: "fixed3",
  guaranteeYears: 0,
});
function escalationCrossover() {
  let cumLevel = 0;
  let cumEsc = 0;
  let paymentYear = 0;
  let totalYear = 0;
  for (let n = 1; n <= 40; n++) {
    const payment = rateEsc65 * Math.pow(1.03, n - 1);
    cumLevel += rateLevel65;
    cumEsc += payment;
    if (!paymentYear && payment >= rateLevel65) paymentYear = n;
    if (!totalYear && cumEsc >= cumLevel) totalYear = n;
  }
  return { paymentYear, totalYear };
}
const crossover = escalationCrossover();
// What a level £8,100 a year is worth in today's money after 20
// years of 3% inflation.
const eroded20 = Math.round(rateLevel65 / Math.pow(1.03, 20));

// Tax illustration (2026/27, England/Wales/NI rates): the headline
// annuity on top of the full new State Pension (£12,547.60 a year).
const STATE_PENSION_ANNUAL = 12547.6;
const PERSONAL_ALLOWANCE = 12570;
const taxOnHeadlinePlusState = Math.round(
  Math.max(0, exHeadline.annualIncome + STATE_PENSION_ANNUAL - PERSONAL_ALLOWANCE) *
    0.2,
);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does a £100,000 annuity pay?",
    answer:
      "On typical November 2026 market rates, about £8,100 a year for a healthy 65-year-old buying a single-life, level annuity with no guarantee period — £675 a month. The best quote in the Which? best-buy table (MoneyHelper figures, 16 November 2026) was £8,151 and the best open-market rate published by Retirement Line on 12 November 2026 was £8,520, so a personal quote can be higher — or lower, if you take your own provider's first offer. Take the usual 25% tax-free cash first and £75,000 is left, buying about £6,075 a year.",
  },
  {
    question: "Can I take 25% tax-free cash and buy an annuity with the rest?",
    answer:
      "Yes — that is the usual order, and it is how this calculator works. The tax-free cash (normally up to 25% of the pot, and capped across all your pensions by the £268,275 Lump Sum Allowance) comes off first, and only the remainder buys the annuity. On a £100,000 pot that means £25,000 of tax-free cash and an annuity bought with £75,000, paying about £6,075 a year at 65 on the rates used here. Taking the cash always reduces the income, so the real choice is a bigger lump sum now against a bigger guaranteed income for life.",
  },
  {
    question: "Annuity or drawdown — which is better?",
    answer:
      "They do different jobs. An annuity swaps the pot for a guaranteed income for life: it can never run out and never falls with the stock market, but it usually dies with you (or your spouse, on a joint-life policy) and cannot be changed later. Drawdown keeps the money invested and flexible — you choose what to take and what is left can be passed on — but the income is not guaranteed and a bad run of returns can shrink the pot. Many people mix the two: an annuity for the essential bills, drawdown for the rest. This calculator estimates the annuity side; the drawdown calculator on this site models the other side.",
  },
  {
    question: "Do annuity rates go up with age?",
    answer:
      "Yes. The provider expects to pay an older buyer for fewer years, so the income per £100,000 rises with the age at purchase — on the rates used here, from about £7,150 a year at 55 to about £10,600 at 75, for the same single-life, level annuity. Waiting is not automatically a better deal, though: a higher rate at 70 has to make up for the five years of income you did not receive between 65 and 70, and rates themselves move with gilt yields in the meantime.",
  },
  {
    question: "What is an enhanced annuity?",
    answer:
      "An annuity that pays more because the buyer's life expectancy is shorter — for example because of a medical condition, or because they smoke or have high blood pressure. Providers ask health and lifestyle questions when they quote, and an honest, complete answer can raise the income substantially above the standard rate; published smoker tables pay up to roughly a quarter more at older ages. The rates in this calculator assume good health, so treat the result as the standard-rate estimate. Also check your pension paperwork for a guaranteed annuity rate (GAR) before you move any pot: some older pensions promise a rate well above today's market, and it is usually lost if you transfer away.",
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
          On typical November 2026 rates, a healthy 65-year-old buying
          a single-life, level annuity gets about{" "}
          {gbp.format(exHeadline.annualIncome)} a year for every
          £100,000 of pension pot — guaranteed for life. Joint life,
          rising payments and guarantee periods all lower the starting
          income; the full rate table is printed below so you can
          check every figure.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of
          UK pay, tax and pension calculators published by Muhammad
          Tauseef. Every calculator on the site prints the rates and
          sources behind its figures instead of hiding them, and this
          page is written and checked by the team that maintains the
          site&apos;s pension tools.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Annuity rates
          verified 19 November 2026 against the published tables named
          in the methodology section below.
        </p>
      </section>

      <AnnuityCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does a £100,000 annuity pay in November 2026?
        </h2>
        <p className={bodyClass}>
          Most annuity calculators hide their rates behind a quote
          form. These are the rates this calculator uses — estimated
          yearly income per £100,000 used to buy the annuity (after
          any tax-free cash), for a buyer in good health:
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
          The table is anchored on typical market levels, not the
          single best quote available. In the Which? best-buy table
          published in November 2026 (figures from the MoneyHelper
          annuity calculator, correct at 16 November 2026), the same
          £100,000 at 65 was quoted between £6,703 and £8,151 a year
          depending on the provider — a spread of more than £1,400 a
          year, every year, for life, on identical options. Retirement
          Line&apos;s best standard rate on 12 November 2026 was
          higher again, at £8,520. That spread is the single most
          important fact on this page: the provider you choose changes
          the answer more than any option you can tick. Our{" "}
          <Link href="/blog/pension-annuity-comparison-uk" className={linkClass}>
            pension annuity comparison
          </Link>{" "}
          walks through the providers and option combinations in
          full.
        </p>
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
          tax-free cash first — normally up to 25% of the pot, with
          the total tax-free cash across all your pensions capped by
          the {gbp.format(LUMP_SUM_ALLOWANCE)} Lump Sum Allowance —
          and buys the annuity with what is left. At 65, single life,
          level payments, no guarantee, the standard examples look
          like this:
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
          Nothing forces you to annuitise the whole pot, or to buy at
          all. Money you do not annuitise can stay invested in
          drawdown, stay untouched inside the pension, or be taken as
          taxable lump sums — each with different tax results. The{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          shows how long the same pot lasts if you keep it invested
          instead, which is the comparison most buyers actually need
          before they commit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Which annuity options change your income — and by how much?
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
                  amount passes the level annuity&apos;s at about age{" "}
                  {65 + crossover.paymentYear - 1}, and the total
                  received catches up at about age{" "}
                  {65 + crossover.totalYear - 1} — if you live that
                  long.
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
                  your estate for the rest of the period — protection
                  that costs less income than most buyers expect.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Two further options appear on real quote forms but are not
          modelled here, and the page is clearer for saying so. Value
          protection returns some or all of the unused purchase price
          to your estate if you die before a set age, in exchange for
          a lower income. A fixed-term annuity pays for a chosen
          number of years and then hands back a maturity amount,
          rather than guaranteeing income for life. Both are
          legitimate choices; both need a personal quote rather than
          an estimate, because their pricing turns on the exact term
          and your circumstances.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Annuity or drawdown: which one fits your retirement?
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
          drawdown. Annuity rates also improve with age, so some
          buyers draw down through their sixties and buy later, when
          each £100,000 buys more — accepting the risk that rates
          could fall in the meantime. Model both sides before you
          decide: the{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          runs the same pot year by year with tax and the State
          Pension included, and the{" "}
          <Link href="/blog/pension-annuity-comparison-uk" className={linkClass}>
            pension annuity comparison
          </Link>{" "}
          sets the annuity options side by side. GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/plan-retirement-income"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            plan your retirement income
          </a>{" "}
          guidance walks through the options in order, and Pension
          Wise — the government-backed service run by MoneyHelper —
          offers free guidance appointments from age 50.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is annuity income taxed?
        </h2>
        <p className={bodyClass}>
          Annuity income is taxed as income, in the same way as a
          salary — every figure on this page is before tax. What
          lands in your account depends on your total income for the
          year, including the State Pension. Two worked examples on
          2026/27 rates (England, Wales and Northern Ireland;
          Scottish rates differ) show how it plays out for the
          headline £100,000 purchase at 65. With no other income,
          {gbp.format(exHeadline.annualIncome)} of annuity income
          sits inside the {gbp.format(PERSONAL_ALLOWANCE)} personal
          allowance, so no tax is due at all. Add the full new State
          Pension of {gbp.format(STATE_PENSION_ANNUAL)} a year and
          the total is{" "}
          {gbp.format(exHeadline.annualIncome + STATE_PENSION_ANNUAL)},
          of which {gbp.format(taxOnHeadlinePlusState)} goes in tax
          — leaving the annuity worth about{" "}
          {gbp.format(exHeadline.annualIncome - taxOnHeadlinePlusState)}{" "}
          a year after tax. Larger annuities, or other income on top,
          push into the 40% band sooner than many buyers expect. The{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows exactly how any gross income is taxed, band by band.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What mistakes do annuity buyers make?
        </h2>
        <p className={bodyClass}>
          <strong>Accepting their own provider&apos;s first quote.</strong>{" "}
          You do not have to buy from the provider that held the pot,
          and the November 2026 Which? table shows why it matters:
          identical £100,000 purchases at 65 were quoted from £6,703
          to £8,151 a year. Exercising the open market option is the
          closest thing to free money in retirement planning.
        </p>
        <p className={bodyClass}>
          <strong>Hiding their health.</strong> Quote forms ask about
          medical conditions, medication, smoking and weight because
          the answers raise the price the provider pays you, not
          lower it. Enhanced annuities exist precisely because a
          shorter life expectancy means fewer payments; published
          smoker tables pay up to about a quarter more than standard
          rates at older ages. Skipping the health questions leaves
          that money unclaimed.
        </p>
        <p className={bodyClass}>
          <strong>Transferring away a guaranteed annuity rate.</strong>{" "}
          Some pensions built up in the 1980s and 1990s carry a
          guaranteed annuity rate (GAR) that can be far above
          anything the open market offers today. It normally applies
          only if you buy the annuity from that provider, on that
          scheme&apos;s terms — and it is usually lost for good if
          you transfer the pot elsewhere first. Check the paperwork
          before anything moves.
        </p>
        <p className={bodyClass}>
          <strong>Ignoring inflation on a level annuity.</strong> A
          level {gbp.format(rateLevel65)} a year sounds solid at 65.
          At 3% inflation it buys what {gbp.format(eroded20)} buys
          today by age 85 — roughly half the spending power. That is
          the honest price of the highest starting income, and it is
          why the escalating options in the table above exist.
        </p>
        <p className={bodyClass}>
          <strong>Buying single life by default.</strong> If a
          partner depends on the income, a single-life annuity leaves
          them with nothing from the pot at the first death. Joint
          life costs about 7% of the starting income on these rates —
          usually cheap insurance against a much larger loss. And if
          you are still working, remember that pension contributions
          through{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice
          </Link>{" "}
          can still be growing the pot this annuity will one day be
          bought from.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does this calculator work — and what can it not do?
        </h2>
        <p className={bodyClass}>
          The method is deliberately simple, and every part of it is
          printed on this page. A base rate — the single-life, level,
          no-guarantee income per £100,000 — is set at five anchor
          ages (55, 60, 65, 70 and 75) from the published November
          2026 tables named below, and ages in between are
          interpolated in a straight line. Your options then adjust
          the base rate by fixed factors drawn from the same tables:
          joint life ×0.93, payments rising 3% a year ×0.74, payments
          rising with RPI ×0.68, a 5-year guarantee ×0.99 and a
          10-year guarantee ×0.95. Tax-free cash comes off the pot
          first, and the remaining pot is multiplied by the adjusted
          rate. The estimate for the standard case — £100,000 at 65 —
          was tested against the market before publication: the
          calculator gives {gbp.format(exHeadline.annualIncome)},
          against £8,151 in the Which? best-buy table and £8,520 for
          Retirement Line&apos;s best rate, a difference of under 5%
          in both cases.
        </p>
        <p className={bodyClass}>
          Sources: Which? best-buy annuity tables, November 2026
          (figures from the MoneyHelper annuity calculator, correct
          at 16 November 2026) · Retirement Line best standard annuity
          rates, 12 November 2026 · Money to the Masses best-buy
          check, 5 November 2026 · Sharing Pensions standard and
          smoker annuity rate tables, updated 14 November 2026 ·
          MoneyHelper and GOV.UK for the 25% tax-free cash rules and
          the {gbp.format(LUMP_SUM_ALLOWANCE)} Lump Sum Allowance ·
          2026/27 Income Tax bands and the State Pension rate for
          the tax examples. Annuity rates track gilt yields — the
          15-year gilt yield stood at about 5.6% in late October
          2026, which is why rates are near their best levels in over
          a decade — and this table is re-checked against the
          published tables and re-anchored when it drifts.
        </p>
        <p className={bodyClass}>
          The limitations, plainly: this is an estimating tool, not a
          quote and not financial advice. It assumes good health, so
          it cannot price an enhanced annuity; it does not model
          value protection, fixed-term annuities or a guaranteed
          annuity rate in an existing pension; it uses typical market
          rates rather than any one provider&apos;s live pricing, and
          providers also differ in detail — payment timing, for
          example — that moves a real quote by a few percent either
          way. An annuity purchase is usually irreversible, so take
          real quotes on the open market, and regulated advice or a
          free Pension Wise appointment, before you buy. MoneyHelper&apos;s{" "}
          <a
            href="https://www.moneyhelper.org.uk/en/pensions-and-retirement/taking-your-pension/guaranteed-retirement-income-annuities-explained"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            guide to guaranteed retirement income
          </a>{" "}
          is the official starting point.
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

      <RelatedCalculators href="/annuity-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
