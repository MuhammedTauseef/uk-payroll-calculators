import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PensionDrawdownCalculator from "@/components/PensionDrawdownCalculator";
import {
  calculateDrawdown,
  sustainableWithdrawal,
  DRAWDOWN_CONSTANTS,
} from "@/lib/pension-drawdown";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/pension-drawdown-calculator",
  "Pension Drawdown Calculator UK — How Long Will Your Pot Last?",
  "Free UK pension drawdown calculator: see how long your pot lasts year by year with 2026/27 income tax, the 25% tax-free amount and Lump Sum Allowance, the State Pension alongside, the withdrawal that lasts to 95, and a 500-path market simulation.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const exampleInput = {
  currentAge: 60,
  pot: 400000,
  taxFreeCashNow: 100000,
  annualWithdrawal: 12000,
  indexWithdrawals: true,
  growthPercent: 5,
  inflationPercent: 2.5,
  statePensionAnnual: DRAWDOWN_CONSTANTS.fullNewStatePension,
  statePensionAge: 67,
  otherIncomeAnnual: 0,
  planToAge: 95,
};
const example = calculateDrawdown(exampleInput);
const exampleSustainable = sustainableWithdrawal(exampleInput);

// The £100,000 pot example below — the size readers ask about most.
// Same assumptions as the £400,000 example (60, 5% growth, 2.5%
// inflation, withdrawals rising with inflation, plan to 95), at the
// 4% rule's £4,000 starting withdrawal, at 5%, and with no State
// Pension, so the three can be compared line by line.
const pot100Base = {
  currentAge: 60,
  pot: 100000,
  taxFreeCashNow: 0,
  annualWithdrawal: 4000,
  indexWithdrawals: true,
  growthPercent: 5,
  inflationPercent: 2.5,
  statePensionAnnual: DRAWDOWN_CONSTANTS.fullNewStatePension,
  statePensionAge: 67,
  otherIncomeAnnual: 0,
  planToAge: 95,
};
const pot100at4 = calculateDrawdown(pot100Base);
const pot100at5 = calculateDrawdown({ ...pot100Base, annualWithdrawal: 5000 });
const pot100NoState = calculateDrawdown({ ...pot100Base, statePensionAnnual: 0 });
const pot100Sustainable = sustainableWithdrawal(pot100Base);

const POT100_ROWS = [
  {
    label: "£4,000 a year (the 4% rule), full State Pension from 67",
    result: pot100at4,
  },
  {
    label: "£5,000 a year (5%), full State Pension from 67",
    result: pot100at5,
  },
  {
    label: "£4,000 a year, no State Pension",
    result: pot100NoState,
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How long will a £400,000 pension pot last in drawdown?",
    answer:
      "It depends on the withdrawal, growth and when the State Pension starts. On this page's example — £100,000 taken as tax-free cash at 60, then £12,000 a year rising with inflation, 5% growth and the full State Pension from 67 — the pot is still going at 95. Push the withdrawal to £20,000 a year and the same pot runs out at 79. That gap is the whole drawdown problem in one comparison, which is why the calculator shows every year rather than a single number.",
  },
  {
    question: "How is pension drawdown taxed?",
    answer:
      "Withdrawals are taxed as income in the year you take them, on top of the State Pension and any other income. With UFPLS withdrawals, 25% of each payment is tax-free until your Lump Sum Allowance (£268,275) is used up, and the other 75% is taxed at your marginal rate — 20%, 40% or 45% in 2026/27. Taking a large withdrawal in one year can push you into a higher band, which is why spreading withdrawals across tax years usually costs less tax.",
  },
  {
    question: "What is the difference between UFPLS and flexi-access drawdown?",
    answer:
      "Under UFPLS, every withdrawal is a separate lump sum that is 25% tax-free and 75% taxed. Under flexi-access drawdown you normally take your 25% tax-free cash up front, move the rest into drawdown, and every later withdrawal is fully taxable. The end result is similar if you take the same total; the timing of the tax-free cash and the tax bills differs. This calculator models the UFPLS pattern, or a tax-free lump sum at the start if you choose it.",
  },
  {
    question: "How long will a £100,000 pension pot last?",
    answer: `It depends mainly on the withdrawal — and on the growth you assume. On this page's assumptions — start at 60, 5% growth, withdrawals rising with 2.5% inflation, the full State Pension from 67 — £4,000 a year ${pot100at4.lastsToPlanAge ? `lasts to 95 with ${gbp.format(pot100at4.potAtPlanAge)} still invested` : `runs out at ${pot100at4.depletionAge}`}, £5,000 a year ${pot100at5.lastsToPlanAge ? "also lasts to 95" : `runs out at ${pot100at5.depletionAge}`}, and the same £4,000 without any State Pension ${pot100NoState.lastsToPlanAge ? "still lasts to 95" : `runs out at ${pot100NoState.depletionAge}`} — in this calculator the State Pension changes the tax on the plan, not the pot's path, because the withdrawal is the amount you choose to take. The sustainable withdrawal the calculator solves for on these inputs is about ${gbp.format(pot100Sustainable)} a year. Change the growth to 3% and every one of those answers gets worse — the pot size alone never decides it.`,
  },
  {
    question: "What is the 4% rule — and does it work in the UK?",
    answer:
      "The 4% rule comes from 1990s US research: withdraw 4% of the pot in the first year, then raise the amount with inflation each year, and a stock-and-bond portfolio historically survived 30 years of US retirement. It was never designed for the UK: it takes no account of tax on withdrawals, it assumes a 30-year horizon (a pot started at 60 and needed at 95 must last 35), and it ignores the State Pension, which in the UK arrives part-way through and takes over part of the income. Treat it as a rough first guess — £4,000 a year from £100,000 — and then test your own figures, because the sustainable withdrawal this calculator solves for your inputs is the number that reflects your tax, your State Pension and your plan age.",
  },
  {
    question: "What withdrawal rate is sustainable from a pension pot?",
    answer:
      "There is no universal safe rate — it depends on your age, growth, inflation, tax and how long the pot must last. The calculator solves it for your figures: the sustainable withdrawal it prints is the largest yearly amount that still leaves the pot standing at your plan age. As a rough cross-check, £20,000 a year from a £400,000 pot at 60 is a 5% starting rate before the State Pension arrives, and materially less demanding after it starts.",
  },
  {
    question: "Drawdown or annuity — which is better?",
    answer:
      "They solve different problems. Drawdown keeps your pot invested and flexible, and anything left can pass to your family, but the income is not guaranteed and a bad run of markets early on does lasting damage. An annuity swaps the pot for a guaranteed income for life — no market risk, but no flexibility and usually nothing left. Many people blend them: drawdown first, then buying an annuity later when rates improve with age. Our annuity calculator shows what the same pot buys as guaranteed income.",
  },
  {
    question: "Does taking drawdown income affect my State Pension?",
    answer:
      "No — the State Pension is not means-tested and drawdown withdrawals do not reduce it. It is, however, taxable, so it uses up part of your personal allowance and basic-rate band before your withdrawals are taxed. That interaction is built into this calculator: the State Pension is taxed alongside each year's withdrawal from the age you set.",
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
  name: "Pension Drawdown Calculator UK",
  url: `${AppConfig.siteUrl}/pension-drawdown-calculator`,
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
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

export default function PensionDrawdownCalculatorPage() {
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
          Pension Drawdown Calculator UK
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          See how long your pension pot lasts in drawdown, year by year:
          your withdrawals, the tax on them at 2026/27 rates, the 25%
          tax-free amount, and the State Pension arriving alongside.
          The calculator also solves for the withdrawal that lasts to
          your plan age, and can stress-test the plan against 500
          simulated market paths.
        </p>
      </section>

      <PensionDrawdownCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A worked example: £400,000 at 60
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Take a pot of £400,000 at age 60. The plan takes £100,000 as
          tax-free cash at the start, then withdraws £12,000 a year
          rising with inflation at 2.5%, with the pot growing at 5% a
          year and the full new State Pension of{" "}
          {gbp.format(DRAWDOWN_CONSTANTS.fullNewStatePension)} a year
          starting at 67. On those figures the pot{" "}
          {example.lastsToPlanAge
            ? `lasts past age 95 with ${gbp.format(example.potAtPlanAge)} still invested`
            : `runs out at age ${example.depletionAge}`}
          , total tax across the plan comes to{" "}
          {gbp.format(example.totalTax)}, and the largest withdrawal
          that still lasts to 95 is about{" "}
          {gbp.format(exampleSustainable)} a year in today&apos;s money.
          Push the withdrawal up to £20,000 a year instead and the same
          plan runs out at age 79 — the difference between a comfortable
          plan and a failed one is often just the withdrawal rate.
          Change any assumption — growth of 3% instead of 5%, or
          withdrawals of £25,000 — and the picture shifts by years,
          which is exactly the sensitivity a drawdown plan has to be
          managed against.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two features of the example are easy to miss. First, the early
          years are the expensive ones: before the State Pension starts,
          the pot carries the whole withdrawal, so a market fall at 61
          does far more damage than the same fall at 75 — the
          simulation button above exists to show that spread. Second,
          tax is not a fixed percentage of the withdrawal: once the
          State Pension starts it fills the personal allowance first,
          and more of each withdrawal lands in the 40% band.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          A worked example: £100,000 at 60
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Most pots are nearer £100,000 than £400,000, so here is the
          same machinery on that figure: start at 60, no tax-free lump
          sum taken up front (the 25% tax-free amount comes out of
          each withdrawal instead), growth of 5%, inflation of 2.5%
          with withdrawals rising to match, and a plan that has to
          last to 95. Three versions of the plan show what actually
          decides the answer:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Plan (£100,000 pot at 60)</th>
                <th className={thClass}>Outcome</th>
                <th className={thClass}>Total tax over the plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {POT100_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.label}
                  </td>
                  <td className={tdClass}>
                    {row.result.lastsToPlanAge
                      ? `Lasts to 95, with ${gbp.format(row.result.potAtPlanAge)} left`
                      : `Runs out at age ${row.result.depletionAge}`}
                  </td>
                  <td className={tdClass}>{gbp.format(row.result.totalTax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two lessons in that table. The first is how close the line
          is: the same pot, on the same assumptions, lasts to 95 at
          £4,000 a year and runs out at 87 at £5,000 — a £1,000
          difference in the starting withdrawal is worth eight years
          of income. The second is what the State Pension does and
          does not do here. Rows one and three end with exactly the
          same pot, because the withdrawal is the amount you choose
          to take from the pot in both, and the State Pension is paid
          on top of it, not into it. What the State Pension changes
          in this model is the tax: with it filling your personal
          allowance from 67, far more of each withdrawal is taxed —{" "}
          {gbp.format(pot100at4.totalTax)} of tax across the plan,
          against none without it, on these frozen-band assumptions. In real planning the
          State Pension extends a pot a different way: it is income
          you no longer need to draw, so you can set a lower
          withdrawal after 67 — run the calculator with a smaller
          withdrawal and the pot&apos;s life stretches with it.
          Inflation is the quieter force in every row: because
          withdrawals rise at 2.5% a year, the £4,000 first-year
          withdrawal is over £6,000 in cash terms by the mid-70s and
          still climbing, which is why a pot that looks comfortable
          at 65 can be under pressure at 85. On these inputs the
          calculator&apos;s sustainable withdrawal — the most you can
          take, rising with inflation, and still have the pot standing
          at 95 — is about {gbp.format(pot100Sustainable)} a year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the 4% rule — and does it work in the UK?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The 4% rule is the most quoted number in drawdown: withdraw
          4% of the pot in year one — £4,000 from £100,000 — then
          increase the amount by inflation each year, and history says
          the pot survives. The history is specific, though. It comes
          from 1990s US research (William Bengen&apos;s work, later
          the Trinity study) on US stock and bond returns over a
          30-year retirement, before tax. Three of its assumptions do
          not survive the crossing to the UK. Tax: UK withdrawals are
          income, so part of every payment leaves as tax — the rule
          spends gross. Horizon: retiring at 60 and planning to 95 is
          35 years, not 30, and the extra five years are the expensive
          ones. And the State Pension: a UK plan is really two plans —
          the pot alone until State Pension age, then the pot topping
          up a guaranteed income — a shape the US rule never had to
          model. None of that makes 4% useless: as a first guess it
          lands in the right area, and on the UK example above the
          calculator&apos;s solved sustainable figure of about{" "}
          {gbp.format(pot100Sustainable)} a year is not far from it.
          But it is a guess calibrated on another country&apos;s
          markets and tax system — while a single point more of
          withdrawal, 5%, breaks the same plan eight years early. Your
          own growth, tax and State Pension inputs move the answer by
          more than the rule&apos;s precision is worth.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The tax rules inside the calculator
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Rule (2026/27)</th>
                <th className={thClass}>Figure</th>
                <th className={thClass}>Why it matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Tax-free cash</td>
                <td className={tdClass}>25% of each UFPLS withdrawal, or a lump sum up front</td>
                <td className={tdClass}>Capped by the Lump Sum Allowance across your lifetime</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Lump Sum Allowance</td>
                <td className={tdClass}>£268,275</td>
                <td className={tdClass}>Once used, later withdrawals are fully taxable</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Personal allowance</td>
                <td className={tdClass}>£12,570, tapered over £100,000</td>
                <td className={tdClass}>The State Pension uses most of it before withdrawals are taxed</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Basic rate band</td>
                <td className={tdClass}>20% up to £50,270</td>
                <td className={tdClass}>Keeping a year&apos;s total income inside it is the main tax lever in drawdown</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Higher / additional</td>
                <td className={tdClass}>40% to £125,140, then 45%</td>
                <td className={tdClass}>One large withdrawal can drag a year&apos;s income through both</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Full new State Pension</td>
                <td className={tdClass}>£12,547.60 a year (£241.30 a week)</td>
                <td className={tdClass}>Starts at State Pension age — 66 to 68 depending on birth year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The bands above are the England, Wales and Northern Ireland
          rates, held at their 2026/27 values for the whole projection —
          thresholds are legislated to stay frozen until April 2031 in
          any case. Scottish taxpayers have different bands and will see
          somewhat different tax. If you are still building the pot
          rather than drawing it, pension contributions remain the most
          efficient way in: the{" "}
          <Link
            href="/salary-sacrifice-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            salary sacrifice calculator
          </Link>{" "}
          shows the tax and National Insurance saved on the way in, and
          the{" "}
          <Link
            href="/40k-after-tax-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            take-home pay calculator
          </Link>{" "}
          shows how the same bands treat a salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Drawdown or annuity?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Drawdown is a bet you manage yourself: the pot stays invested,
          withdrawals flex with your life, and what is left can pass to
          your family — but nothing is guaranteed, and the plan on this
          page is only as good as its growth assumption. An annuity is
          the opposite trade: the pot is exchanged for an income that
          cannot run out and cannot fall, at the cost of flexibility and
          any inheritance from that pot. The honest comparison is a
          number, not an opinion: run the same pot through our{" "}
          <Link
            href="/annuity-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            annuity calculator
          </Link>{" "}
          and set the guaranteed figure it prints next to the
          sustainable withdrawal this calculator solves for. The gap
          between the two is the price of the guarantee — and for many
          people the right answer is both: drawdown through the active
          early years, an annuity later when a year of life buys more
          income.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If you are weighing drawdown against a guaranteed income,
          our{" "}
          <Link
            href="/blog/pension-annuity-comparison-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            pension annuity comparison UK guide
          </Link>{" "}
          compares the annuity types, rates and tax side by side.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One warning belongs on every drawdown plan: taking a taxable
          withdrawal (beyond tax-free cash alone) triggers the Money
          Purchase Annual Allowance, cutting what you can pay into
          pensions afterwards from £60,000 to £10,000 a year. If you are
          still working and contributing, that trigger can cost more
          than the withdrawal is worth — check before the first taxable
          payment, not after.
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

      <section className="space-y-3">
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          This calculator is a planning illustration, not financial
          advice and not a forecast. It assumes one pot, one person,
          smooth investment growth at the rate you set (the simulation
          varies it), 2026/27 tax bands held flat, and no charges.
          Real drawdown decisions — especially taking tax-free cash or
          triggering the Money Purchase Annual Allowance — deserve
          regulated advice; Pension Wise offers free guidance to the
          over-50s.
        </p>
      </section>

      <RelatedCalculators href="/pension-drawdown-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
