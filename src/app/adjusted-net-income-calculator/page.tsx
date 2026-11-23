import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import AdjustedNetIncomeCalculator from "@/components/AdjustedNetIncomeCalculator";
import { calculateAdjustedNetIncome } from "@/lib/adjusted-net-income";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/adjusted-net-income-calculator",
  "Adjusted Net Income Calculator UK — Child Benefit & the £100k Line",
  "Free adjusted net income calculator for 2025/26 and 2026/27 — your ANI, Child Benefit charge %, Personal Allowance, the £100,000 childcare line, and the pension payment that brings you back under it.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Worked example 1 — a £110,000 salary with an £8,000 net pension
// contribution, and the same salary with no contribution at all.
// Both are run through the same engine the calculator above uses,
// so the figures printed in the text always match the tool.
const ex1 = calculateAdjustedNetIncome({
  taxYear: "2026/27",
  employmentIncome: 110000,
  selfEmploymentProfit: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  propertyIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 8000,
  giftAidPaidNet: 0,
});
const ex1NoPension = calculateAdjustedNetIncome({
  taxYear: "2026/27",
  employmentIncome: 110000,
  selfEmploymentProfit: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  propertyIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  giftAidPaidNet: 0,
});

// Worked example 2 — a £68,000 salary, no deductions.
const ex2 = calculateAdjustedNetIncome({
  taxYear: "2026/27",
  employmentIncome: 68000,
  selfEmploymentProfit: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  propertyIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  giftAidPaidNet: 0,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is considered adjusted net income in the UK?",
    answer:
      "Adjusted net income is your total taxable income for the tax year — employment income, self-employment profit, pensions in payment, savings interest, dividends, rental profit and other taxable income — before the Personal Allowance, less the grossed-up value of personal pension contributions and Gift Aid donations, and less reliefs such as trading losses. Tax-free income never counts: ISA interest and dividends, Premium Bond prizes and the first £1,000 of trading or property income under the trading and property allowances are all outside the figure.",
  },
  {
    question: "How do I calculate adjusted net income?",
    answer:
      "Follow HMRC's four steps. First, add up all your taxable income to get your net income, taking off reliefs claimed in the calculation such as trading losses and pension contributions paid gross. Second, take off the grossed-up amount of any Gift Aid donations — £1.25 for every £1 you gave. Third, take off the grossed-up amount of personal pension contributions where your provider already added basic-rate relief — again £1.25 for every £1 you paid. Fourth, add back any tax relief for payments to trade unions or police organisations. The calculator above does all four steps for you.",
  },
  {
    question: "What is adjusted net income for Child Benefit?",
    answer:
      "It is the same adjusted net income figure, used for the High Income Child Benefit Charge. If you or your partner has an adjusted net income over £60,000 and either of you claims Child Benefit, the higher earner pays a charge of 1% of the Child Benefit for every complete £200 of income over £60,000 — 50% at £70,000, and the full amount at £80,000. The charge is collected through Self Assessment, or through PAYE if you ask HMRC and owe it for the first time.",
  },
  {
    question: "Do pension contributions reduce adjusted net income?",
    answer:
      "Yes — they are the main lever. A personal pension or SIPP contribution paid under relief at source reduces adjusted net income by its grossed-up value: pay in £8,000 and £10,000 comes off. A contribution taken from your pay under a net-pay arrangement or salary sacrifice reduces it £1 for £1 because the money never becomes taxable income. Employer contributions do not count either way — they are not your income. Contributions must be paid before 5 April to count for that tax year; unlike Gift Aid they cannot be carried back.",
  },
  {
    question: "What happens if my adjusted net income is over £100,000?",
    answer:
      "Three things. Your Personal Allowance of £12,570 is cut by £1 for every £2 of income over £100,000, so it is gone completely at £125,140 — an effective tax rate of about 60% on income in that band. Tax-Free Childcare stops in full, and with it the funded childcare hours for working parents in England, because both schemes test each parent's expected adjusted net income against £100,000. And at £125,140 the additional rate of income tax begins. A pension contribution that brings the figure back to £100,000 undoes all three.",
  },
  {
    question: "Is adjusted net income worked out per person or per household?",
    answer:
      "Per person, always. Adjusted net income is never combined for a couple, which produces results that surprise people: a household with one earner on £80,000 repays every penny of Child Benefit, while a household with two earners on £59,000 each keeps it all. For the Child Benefit charge, the partner with the higher adjusted net income pays. For Tax-Free Childcare, each parent is tested separately — one parent over £100,000 stops the claim for the whole family.",
  },
  {
    question: "Is adjusted net income the same as my salary or my take-home pay?",
    answer:
      "No. It is usually higher than take-home pay, because it is measured before income tax and National Insurance are taken off, and it is not always the same as salary: bonuses, taxable benefits, savings interest, dividends and rental income all go in, and pension contributions and Gift Aid come off. Two people on the same £75,000 salary can have adjusted net incomes thousands of pounds apart once a bonus, some interest and a pension contribution are counted.",
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
  name: "Adjusted Net Income Calculator UK",
  url: `${AppConfig.siteUrl}/adjusted-net-income-calculator`,
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
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

export default function AdjustedNetIncomeCalculatorPage() {
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
          Adjusted Net Income Calculator UK
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One figure quietly decides whether you repay Child Benefit,
          how much tax-free Personal Allowance you keep, and whether
          your family keeps Tax-Free Childcare: your adjusted net
          income. This calculator works it out the way HMRC does — every
          source of taxable income in, pension contributions and Gift
          Aid grossed up and taken off — and shows you where you land
          against all four thresholds at once, for 2025/26 and 2026/27.
        </p>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Adjusted net income is your total taxable income for the tax
            year, before the Personal Allowance, minus the grossed-up
            value of personal pension contributions and Gift Aid
            donations. HMRC tests it against four lines — £60,000,
            £80,000, £100,000 and £125,140 — to set your Child Benefit
            charge, your Personal Allowance and your childcare support.
          </p>
        </div>
      </section>

      <AdjustedNetIncomeCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is adjusted net income?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Adjusted net income is a statutory measure of income defined
          in section 58 of the Income Tax Act 2007 and explained in
          HMRC&apos;s guidance on GOV.UK. It is not your salary, and it
          is not your take-home pay: it is every pound of taxable income
          you have in the tax year, measured before the Personal
          Allowance, with a short list of reliefs taken back off. The
          formula is:
        </p>
        <p className="max-w-2xl rounded-xl bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          Adjusted net income = total taxable income − (pension
          contributions × 1.25) − (Gift Aid donations × 1.25)
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The × 1.25 is the grossing-up HMRC applies to payments made
          with basic-rate tax relief already added — for every £1 you
          pay into a personal pension or give under Gift Aid, £1.25
          comes off the figure. This page is part of UK Payroll
          Calculators (payrollcalc.co.uk), a free hub of UK pay and tax
          calculators; every figure on it is taken from the published
          HMRC rules, and the four thresholds below are identical in
          2025/26 and 2026/27. Two facts worth quoting exactly: the High
          Income Child Benefit Charge takes back 1% of Child Benefit
          for every £200 of adjusted net income over £60,000, and the
          Personal Allowance falls by £1 for every £2 over £100,000
          until it reaches £0 at £125,140 — both set out in HMRC&apos;s
          published guidance.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          What counts as income often catches people out. Alongside
          salary and self-employment profit, HMRC includes bonuses,
          taxable benefits, pensions in payment, savings interest (even
          the part covered by the Personal Savings Allowance), dividends
          (even the part covered by the dividend allowance) and rental
          profit. Income from a second job or a sideline counts too —
          our{" "}
          <Link href="/side-hustle-tax-calculator-uk" className={linkClass}>
            side hustle tax calculator
          </Link>{" "}
          shows how that income is taxed, but for adjusted net income it
          simply adds to the total. What never counts: anything inside
          an ISA, Premium Bond prizes, and income covered by the £1,000
          trading and property allowances.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do I calculate adjusted net income?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          HMRC sets the calculation out in four steps:
        </p>
        <ol className="max-w-2xl list-decimal space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Work out your net income.</strong> Add up all your
            taxable income for the year, then take off reliefs that are
            given inside the calculation — trading losses, property
            losses and pension contributions paid gross (with no relief
            given at the time).
          </li>
          <li>
            <strong>Take off Gift Aid donations, grossed up.</strong>{" "}
            For every £1 you donated, deduct £1.25.
          </li>
          <li>
            <strong>Take off pension contributions, grossed up.</strong>{" "}
            For personal pensions and SIPPs where the provider claimed
            basic-rate relief for you, deduct £1.25 for every £1 you
            paid in.
          </li>
          <li>
            <strong>Add back small reliefs.</strong> Tax relief for
            payments to trade unions or police organisations (worth up
            to £100) that was deducted at step 1 is added back.
          </li>
        </ol>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two kinds of pension payment never appear in the steps,
          because they are already missing from your taxable income: a
          workplace pension taken under a net-pay arrangement, and pay
          given up under salary sacrifice. If your payslip salary is
          already after sacrifice, do not deduct the sacrifice again —
          the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows the full effect of an exchange on pay, tax and pension.
          And your employer&apos;s pension contributions are not your
          income at all, so they neither raise nor lower the figure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the four adjusted net income thresholds?
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Adjusted net income</th>
                <th className={thClass}>What it controls</th>
                <th className={thClass}>What happens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Over £60,000</td>
                <td className={tdClass}>High Income Child Benefit Charge</td>
                <td className={tdClass}>You repay 1% of your Child Benefit for every complete £200 over £60,000 — 25% at £65,000, 50% at £70,000.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£80,000 or more</td>
                <td className={tdClass}>High Income Child Benefit Charge</td>
                <td className={tdClass}>The charge reaches 100% — every penny of Child Benefit is repaid. You can opt out of payments and keep the claim (and its National Insurance credits) alive.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Over £100,000</td>
                <td className={tdClass}>Personal Allowance · Tax-Free Childcare · funded hours</td>
                <td className={tdClass}>Your £12,570 Personal Allowance is cut by £1 for every £2 over the line, and Tax-Free Childcare plus the funded childcare hours for working parents stop in full — a cliff edge, not a taper.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£125,140 or more</td>
                <td className={tdClass}>Personal Allowance · additional rate</td>
                <td className={tdClass}>The Personal Allowance is £0 and the additional rate of income tax (45%) starts at this line.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The £100,000 band is the expensive one. Because the Personal
          Allowance is withdrawn across it, income between £100,000 and
          £125,140 carries an effective income tax rate of about 60% in
          England, Wales and Northern Ireland — 40% higher-rate tax plus
          roughly 20% more as the allowance disappears — before National
          Insurance. It is also why a pay rise in this band can be worth
          far less than it looks: run the rise through the{" "}
          <Link href="/pay-rise-calculator" className={linkClass}>
            pay rise calculator
          </Link>{" "}
          and then check the new salary here before you celebrate. A
          reduced Personal Allowance also changes the tax code on your
          payslip — the{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            HMRC tax code checker
          </Link>{" "}
          decodes what yours is telling payroll.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: a £110,000 salary and a pension
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Amara earns £110,000 in 2026/27 and pays £8,000 into a personal
          pension from her own bank account. Her provider adds basic-rate
          relief, so the contribution is grossed up to{" "}
          {gbp.format(ex1.pensionGross)}. Her adjusted net income is{" "}
          {gbp.format(ex1.totalIncome)} − {gbp.format(ex1.pensionGross)}{" "}
          = <strong>{gbp.format(ex1.adjustedNetIncome)}</strong> —
          exactly on the £100,000 line. She keeps her full Personal
          Allowance of {gbp.format(ex1.personalAllowance)} and stays
          eligible for Tax-Free Childcare.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Without the pension payment, her adjusted net income would be{" "}
          {gbp.format(ex1NoPension.adjustedNetIncome)}. Her Personal
          Allowance would fall to{" "}
          {gbp.format(ex1NoPension.personalAllowance)} —{" "}
          {gbp.format(ex1NoPension.personalAllowanceLost)} lost — and
          Tax-Free Childcare would stop altogether. One £8,000 payment,
          which costs her £8,000 out of pocket and puts £10,000 in her
          pension, protects both. If you are planning contributions
          around retirement rather than childcare, the{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          and the{" "}
          <Link href="/annuity-calculator" className={linkClass}>
            annuity calculator
          </Link>{" "}
          show what the pot those contributions build can pay you later.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: £68,000 and the Child Benefit charge
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Ben earns £68,000 and makes no pension contributions of his
          own, so his adjusted net income is{" "}
          {gbp.format(ex2.adjustedNetIncome)}. That is £8,000 over the
          £60,000 line — 40 complete steps of £200 — so the High Income
          Child Benefit Charge is{" "}
          <strong>{ex2.hicbcPercent}%</strong> of the Child Benefit his
          partner receives. For two children in 2026/27, Child Benefit
          is £27.05 a week for the eldest child and £17.90 for the
          second — £2,382 across the year — so the charge comes to about
          £953, paid through his tax return. His Personal Allowance is
          untouched at {gbp.format(ex2.personalAllowance)} and childcare
          support is unaffected; the £60,000 line only drives the Child
          Benefit charge. A gross pension contribution of{" "}
          {gbp.format(ex2.pensionGrossTo60k)} —{" "}
          {gbp.format(ex2.pensionNetTo60k)} out of pocket at relief at
          source — would take him to exactly £60,000 and end the charge
          entirely, which is why so many parents in the £60,000–£80,000
          band pay into a pension in February and March.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The same thresholds decide the help itself: our{" "}
          <Link href="/childcare-calculator" className={linkClass}>
            Tax-Free Childcare calculator
          </Link>{" "}
          works out the top-up per child and runs the same £100,000
          check from the childcare side.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How can I reduce my adjusted net income?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          There are four legitimate levers, and all of them work by
          moving money before 5 April — after the tax year ends, the
          figure is fixed.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Pay more into a pension.</strong> The strongest
            lever. Personal contributions come off grossed up (pay
            £8,000, deduct £10,000), workplace net-pay contributions
            come off £1 for £1, and both restore Personal Allowance and
            childcare eligibility as well as cutting the Child Benefit
            charge. Watch the £60,000 annual allowance — for very high
            earners it tapers away between adjusted income of £260,000
            and £360,000, and the{" "}
            <Link href="/tapered-annual-allowance-calculator" className={linkClass}>
              tapered annual allowance calculator
            </Link>{" "}
            works out your threshold and adjusted income and the
            contribution that switches that taper off.
          </li>
          <li>
            <strong>Use salary sacrifice.</strong> Sacrificed pay never
            becomes salary, so it reduces adjusted net income £1 for £1
            and saves National Insurance as well. Pension sacrifice is
            the usual route; cycle-to-work and electric car schemes work
            the same way, with the car&apos;s benefit-in-kind value added
            back as taxable income.
          </li>
          <li>
            <strong>Give under Gift Aid.</strong> Donations come off
            grossed up, exactly like pension contributions. Gift Aid has
            one trick pensions do not: a donation made after 5 April can
            be carried back and treated as paid in the previous tax year
            if you claim it on that year&apos;s return, filed on time.
          </li>
          <li>
            <strong>Time your income.</strong> A bonus paid in April
            rather than March falls in the next tax year; a landlord or
            sole trader can sometimes time expenses the other way.
            Deferral moves the problem rather than solving it, but it
            can rescue a year where you sit just over a line.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One route that does not work: paying into your partner&apos;s
          pension. Adjusted net income is individual, so their
          contribution reduces their figure, not yours — the higher
          earner has to make the contribution themselves. If you are
          targeting a specific take-home figure and working backwards to
          the salary that produces it, the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            required salary calculator
          </Link>{" "}
          does that job, and the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows the full tax and National Insurance picture at any
          salary. Couples should also check the{" "}
          <Link href="/marriage-allowance-calculator" className={linkClass}>
            marriage allowance calculator
          </Link>{" "}
          — it is a separate relief, but at £252 a year it is the one
          most often left unclaimed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the most common adjusted net income mistakes?
        </h2>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Using take-home pay.</strong> Adjusted net income is
            measured before tax and National Insurance — it is almost
            always higher than the amount that reaches your bank.
          </li>
          <li>
            <strong>Forgetting the small income.</strong> A few hundred
            pounds of savings interest or dividends still counts in
            full, and near a threshold it can be the amount that tips
            you over.
          </li>
          <li>
            <strong>Entering pension contributions the wrong way
            round.</strong> Relief-at-source payments are deducted
            grossed up (× 1.25); net-pay and salary-sacrifice payments
            are already out of your salary and must not be deducted
            again.
          </li>
          <li>
            <strong>Counting employer contributions.</strong> What your
            employer pays into your pension is not your income — it
            neither raises adjusted net income nor needs deducting.
          </li>
          <li>
            <strong>Thinking in household income.</strong> The figure
            is per person. One earner on £80,000 repays all Child
            Benefit; two earners on £59,000 each repay none.
          </li>
          <li>
            <strong>Checking once and forgetting bonuses.</strong>{" "}
            Childcare eligibility uses the income you expect for the
            whole year and is reconfirmed every three months — a bonus
            in March can break a claim built on April&apos;s salary.
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

      <section className="space-y-3">
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Sources: HMRC,{" "}
          <a
            href="https://www.gov.uk/guidance/adjusted-net-income"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Personal Allowances: adjusted net income
          </a>{" "}
          (GOV.UK) and section 58 of the Income Tax Act 2007; HMRC
          guidance on the High Income Child Benefit Charge and on
          Tax-Free Childcare eligibility (GOV.UK). This calculator
          applies those rules for 2025/26 and 2026/27 and is a guide,
          not advice on your tax return — HMRC decides charges and
          eligibility on your actual circumstances, so check the figures
          on your Self Assessment return, especially within a few
          hundred pounds of a threshold.
        </p>
      </section>

      <RelatedCalculators href="/adjusted-net-income-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
