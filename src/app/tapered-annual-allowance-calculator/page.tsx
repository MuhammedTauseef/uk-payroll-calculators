import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TaperedAnnualAllowanceCalculator from "@/components/TaperedAnnualAllowanceCalculator";
import { calculateTaperedAnnualAllowance } from "@/lib/tapered-annual-allowance";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/tapered-annual-allowance-calculator",
  "Tapered Annual Allowance Calculator UK — Threshold & Adjusted Income",
  "Free tapered annual allowance calculator for 2025/26 and 2026/27 — we build your threshold income and adjusted income from your pay and pension inputs, then show your tapered allowance, carry forward, the contribution that escapes the taper, and any tax charge.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const noCarryForward = [
  { year: "2023/24", pensionSavings: 60000, allowance: 60000 },
  { year: "2024/25", pensionSavings: 60000, allowance: 60000 },
  { year: "2025/26", pensionSavings: 60000, allowance: 60000 },
];

// Worked example 1 — a £250,000 salary with £30,000 of employer
// contributions: tapered, and the escape contribution that
// switches the taper off. Run through the same engine the
// calculator uses, so the figures in the text always match the tool.
const ex1 = calculateTaperedAnnualAllowance({
  taxYear: "2026/27",
  employmentIncome: 250000,
  selfEmploymentProfit: 0,
  propertyIncome: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  contributionsGross: 0,
  employerContributions: 30000,
  salarySacrifice: 0,
  giftAidPaidNet: 0,
  flexiblyAccessed: false,
  plannedSavings: 0,
  marginalRatePercent: 45,
  carryForward: noCarryForward,
});

// Worked example 2 — a £270,000 salary, £10,000 from the employer,
// and a £60,000 personal contribution (£75,000 grossed up): the
// contribution pulls threshold income under £200,000 and the
// taper never starts. Shown with and without the contribution.
const ex2 = calculateTaperedAnnualAllowance({
  taxYear: "2026/27",
  employmentIncome: 270000,
  selfEmploymentProfit: 0,
  propertyIncome: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 60000,
  contributionsGross: 0,
  employerContributions: 10000,
  salarySacrifice: 0,
  giftAidPaidNet: 0,
  flexiblyAccessed: false,
  plannedSavings: 0,
  marginalRatePercent: 45,
  carryForward: noCarryForward,
});
const ex2NoContribution = calculateTaperedAnnualAllowance({
  taxYear: "2026/27",
  employmentIncome: 270000,
  selfEmploymentProfit: 0,
  propertyIncome: 0,
  savingsIncome: 0,
  dividendIncome: 0,
  otherIncome: 0,
  pensionPaidNet: 0,
  contributionsGross: 0,
  employerContributions: 10000,
  salarySacrifice: 0,
  giftAidPaidNet: 0,
  flexiblyAccessed: false,
  plannedSavings: 0,
  marginalRatePercent: 45,
  carryForward: noCarryForward,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I calculate my tapered annual allowance?",
    answer:
      "Work out two income figures first. Threshold income is your net income, less the gross amount of personal pension contributions where relief was given at source, plus any pay given up under a salary sacrifice arrangement made after 8 July 2015. Adjusted income is your net income plus pension savings your employer made, plus contributions taken from your pay before tax or claimed as relief. If threshold income is over £200,000 AND adjusted income is over £260,000, your £60,000 allowance falls by £1 for every £2 of adjusted income over £260,000, down to a minimum of £10,000. The calculator above builds both figures from your income and pension inputs, so you do not have to arrive knowing them.",
  },
  {
    question: "What is the taper threshold for the pension annual allowance?",
    answer:
      "There are two thresholds, and both must be crossed. The threshold income limit is £200,000 and the adjusted income limit is £260,000. Cross only one and nothing happens: adjusted income of £340,000 with threshold income of £190,000 leaves your allowance at the full £60,000, because the threshold test is applied first and on its own. Both limits, and the £60,000 standard allowance and £10,000 floor, have been unchanged since 6 April 2023 and are the same in 2025/26 and 2026/27.",
  },
  {
    question: "What is the difference between threshold income and adjusted income?",
    answer:
      "Threshold income is roughly your income after your own personal pension contributions — it is the anti-avoidance test that stops people contributing their way under the line with money that was never taxed as theirs. Adjusted income adds back everything that builds your pension: employer contributions, workplace contributions taken before tax, and sacrificed pay. For most employees adjusted income is the bigger figure, and it is the one that sets how much allowance you lose. Your employer's contributions count towards adjusted income but never towards threshold income, which is why a large employer contribution can taper you even on a salary below £260,000.",
  },
  {
    question: "What happens if I exceed my pension annual allowance?",
    answer:
      "The excess is added to your taxable income for the year and charged to income tax at your marginal rate — 40% or 45% for most people caught by the taper — through your Self Assessment return. Carry forward can protect you first: unused allowance from the previous three tax years is used before any charge arises, oldest year first. If the charge is over £2,000 and your pension savings went over the allowance, you can usually elect for the scheme to pay it from your pension under Scheme Pays, in exchange for lower benefits later. Ignoring it is not an option — pension schemes report your savings to HMRC.",
  },
  {
    question: "Can I still carry forward unused allowance if I am tapered?",
    answer:
      "Yes. Carry forward works exactly the same way: unused allowance from the previous three tax years is added to this year's allowance, and you use this year's allowance first, then the earliest year's unused amount. The catch is that a year in which you were tapered only contributes its tapered allowance — a year with a £20,000 tapered allowance and £15,000 of savings leaves £5,000 to carry forward, not £45,000. You must have been a member of a registered pension scheme in each year you carry forward from. Carry forward cannot be added to the £10,000 money purchase annual allowance if you have flexibly accessed a pension.",
  },
  {
    question: "I use salary sacrifice to get under £200,000 — am I safe?",
    answer:
      "Not on sacrifice alone. For arrangements made after 8 July 2015, HMRC adds sacrificed pay back into threshold income, and the sacrificed amount also counts as an employer contribution inside adjusted income — so sacrificing £30,000 of a £230,000 salary leaves threshold income at £230,000, not £200,000. Sacrifice still saves income tax and National Insurance in the usual way, and it is the right tool for other thresholds such as the £100,000 childcare line. To beat the pension taper itself you need a personal contribution paid from your own money under relief at source, which genuinely reduces threshold income.",
  },
  {
    question: "Does my employer's pension contribution count towards the taper?",
    answer:
      "Yes — it is usually the deciding input. Employer contributions are added into adjusted income, and for defined benefit schemes such as the NHS, teachers' and civil service schemes the figure is the pension input amount (the growth in your benefits, valued at 16 times the annual pension increase plus any lump sum growth), which can be far larger than the cash contributions on your payslip. Employer money does not count towards threshold income. That split is why someone on a £190,000 salary with £150,000 of employer pension savings is not tapered, while someone on a £250,000 salary with £30,000 from their employer is.",
  },
  {
    question: "How do I calculate my adjusted net income, and is it the same thing?",
    answer:
      "No — adjusted net income and adjusted income are two different HMRC measures with confusingly similar names. Adjusted net income (section 58, Income Tax Act 2007) decides your Child Benefit charge, Personal Allowance and Tax-Free Childcare, and it is reduced by pension contributions and Gift Aid. Adjusted income, used only for the pension taper, is a wider figure that adds employer pension savings back in, and Gift Aid does not reduce it. If you need the Child Benefit and childcare figure, use our adjusted net income calculator; if you need the pension taper figure, you are in the right place here.",
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
  name: "Tapered Annual Allowance Calculator UK",
  url: `${AppConfig.siteUrl}/tapered-annual-allowance-calculator`,
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

export default function TaperedAnnualAllowanceCalculatorPage() {
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
          Tapered Annual Allowance Calculator UK
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Earn enough, and the £60,000 pension annual allowance starts
          to shrink — but whether it shrinks, and by how much, depends
          on two income figures most people have never been given:
          threshold income and adjusted income. This calculator builds
          both from your pay, your pension contributions and your
          employer&apos;s, then shows your tapered allowance, your
          carry forward, and the exact contribution that would switch
          the taper off — for 2025/26 and 2026/27.
        </p>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Your annual allowance is tapered only if your threshold
            income is over £200,000 AND your adjusted income is over
            £260,000. It then falls by £1 for every £2 of adjusted
            income over £260,000, from £60,000 down to a floor of
            £10,000 at £360,000. Keep threshold income at £200,000 or
            below and the taper cannot apply at all.
          </p>
        </div>
      </section>

      <TaperedAnnualAllowanceCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the tapered annual allowance?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The annual allowance is the most that can go into your
          pensions in a tax year — from you, your employer and anyone
          else — before a tax charge claws back the relief. For most
          people it is £60,000. Since April 2016, high earners have
          had that allowance tapered: reduced in proportion to how
          far their income passes two high lines. The current lines
          were set on 6 April 2023, when the standard allowance rose
          from £40,000 to £60,000, the adjusted income limit rose
          from £240,000 to £260,000 and the minimum tapered allowance
          rose from £4,000 to £10,000; they have not moved since, and
          they are identical in 2025/26 and 2026/27.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This page is part of UK Payroll Calculators
          (payrollcalc.co.uk), a free hub of UK pay and tax
          calculators. Every figure on it follows HMRC&apos;s
          published method in the GOV.UK guidance &quot;Work out your
          reduced (tapered) annual allowance&quot; and the HS345
          helpsheet. Two facts worth quoting exactly: the taper needs
          BOTH tests passed — threshold income over £200,000 and
          adjusted income over £260,000 — and a personal pension
          contribution paid under relief at source reduces threshold
          income but not adjusted income, which is why it is the one
          lever that can switch the taper off completely.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Do not confuse the two &quot;adjusted&quot; figures. This
          page is about <strong>adjusted income</strong> for the
          pension taper. The separate measure called{" "}
          <Link href="/adjusted-net-income-calculator" className={linkClass}>
            adjusted net income
          </Link>{" "}
          decides your Child Benefit charge, your Personal Allowance
          and Tax-Free Childcare at the £60,000 and £100,000 lines —
          our calculator for that test is the one linked there, and
          many people caught by one measure need to check the other
          as well.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the difference between threshold income and adjusted income?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This is the question that decides everything, and the one
          HMRC&apos;s names make hardest. Both measures start from
          the same place — your net income, meaning all your taxable
          income less the reliefs given inside the calculation, such
          as pension contributions taken from your pay before tax.
          They then move in opposite directions:
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Threshold income</strong> takes your own personal
            pension contributions OFF. It is designed as an
            anti-avoidance test: it asks what your income looks like
            before you shelter it in a pension of your own. Pay given
            up under a salary sacrifice arrangement made after 8 July
            2015 is added back, so sacrifice cannot fake a lower
            figure either.
          </li>
          <li>
            <strong>Adjusted income</strong> puts every pension
            saving back ON: your employer&apos;s contributions,
            workplace contributions taken before tax, and sacrificed
            pay all count. It asks how much income you really had,
            including the part that went straight into your pension.
          </li>
        </ul>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Item</th>
                <th className={thClass}>Threshold income</th>
                <th className={thClass}>Adjusted income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Salary, bonus, self-employment, rent, interest, dividends</td>
                <td className={tdClass}>Counts</td>
                <td className={tdClass}>Counts</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Your personal pension contributions (relief at source)</td>
                <td className={tdClass}>Taken off — this is the escape lever</td>
                <td className={tdClass}>Not added — they came out of income already counted</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Workplace contributions taken before tax (net pay)</td>
                <td className={tdClass}>Already out of your pay — no further effect</td>
                <td className={tdClass}>Added back in full</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Employer pension contributions</td>
                <td className={tdClass}>Never counts</td>
                <td className={tdClass}>Counts in full — usually the deciding input</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Salary sacrificed into a pension (post-8 July 2015)</td>
                <td className={tdClass}>Added back</td>
                <td className={tdClass}>Counts as an employer saving</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Gift Aid donations</td>
                <td className={tdClass}>No effect</td>
                <td className={tdClass}>No effect — Gift Aid reduces adjusted net income instead</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          For a typical employee, adjusted income is salary plus
          employer pension contributions, and threshold income is
          salary minus personal contributions — so adjusted income is
          almost always the bigger number, and it is adjusted income
          that sets the size of the cut once both tests are passed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do I calculate my tapered annual allowance?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          HMRC&apos;s method has four stages. The calculator above
          runs all of them from your raw inputs — the stages are set
          out here so you can see exactly what it is doing:
        </p>
        <ol className="max-w-2xl list-decimal space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Work out your net income.</strong> Add up all
            your taxable income — employment, self-employment,
            property, savings, dividends, pensions in payment — then
            take off reliefs given inside the calculation, including
            pension contributions taken from your pay before tax
            under a net-pay arrangement and contributions paid gross
            with relief claimed on your return.
          </li>
          <li>
            <strong>Work out your threshold income.</strong> From net
            income, take off the gross amount of your personal
            pension contributions where relief was given at source
            (what you paid, grossed up by 1.25), take off any lump
            sum death benefits received, and add back any pay given
            up under salary sacrifice or flexible remuneration
            arrangements made after 8 July 2015.
          </li>
          <li>
            <strong>Work out your adjusted income.</strong> From net
            income, add back the contributions taken off at stage 1,
            add any relief claimed for overseas pension schemes, and
            add your employer&apos;s pension savings — for a defined
            benefit scheme, the pension input amount from your
            benefit statement (the growth in your pension valued at
            16 times the extra annual pension, plus lump sum growth).
          </li>
          <li>
            <strong>Apply the two tests.</strong> If threshold income
            is £200,000 or less, stop: your allowance is the full
            £60,000. If both measures are over their lines, deduct £1
            for every £2 of adjusted income over £260,000, rounding
            the reduction down to the nearest pound, and stop at the
            £10,000 floor.
          </li>
        </ol>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One input deserves care: the employment figure. Enter your
          pay after any salary sacrifice (your contract salary is the
          reduced one) but before net-pay pension deductions, and put
          the sacrificed amount in its own box so the calculator can
          add it back where HMRC does. The{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows what an exchange does to your take-home pay; this
          page shows what it does — and does not do — to the taper.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much annual allowance do I get at each income?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Once both tests are passed, the allowance depends only on
          adjusted income. The table is the same for 2025/26 and
          2026/27:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Adjusted income</th>
                <th className={thClass}>Reduction</th>
                <th className={thClass}>Your annual allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£260,000 or less</td>
                <td className={tdClass}>£0</td>
                <td className={tdClass}>£60,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£270,000</td>
                <td className={tdClass}>£5,000</td>
                <td className={tdClass}>£55,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£280,000</td>
                <td className={tdClass}>£10,000</td>
                <td className={tdClass}>£50,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£300,000</td>
                <td className={tdClass}>£20,000</td>
                <td className={tdClass}>£40,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£320,000</td>
                <td className={tdClass}>£30,000</td>
                <td className={tdClass}>£30,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£340,000</td>
                <td className={tdClass}>£40,000</td>
                <td className={tdClass}>£20,000</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£360,000 or more</td>
                <td className={tdClass}>£50,000 (maximum)</td>
                <td className={tdClass}>£10,000 — the floor</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Remember the table only bites if threshold income is also
          over £200,000. And the allowance in the last column is
          before carry forward: unused allowance from the previous
          three years is added on top, which is why the calculator
          asks about those years too.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: tapered on a £250,000 salary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Daniel earns {gbp.format(ex1.totalIncome)} in 2026/27 and
          his employer puts {gbp.format(30000)} into his pension. He
          makes no personal contributions, so his threshold income is{" "}
          {gbp.format(ex1.thresholdIncome)} — over the £200,000 line —
          and his adjusted income is {gbp.format(ex1.totalIncome)} +{" "}
          {gbp.format(30000)} = <strong>{gbp.format(ex1.adjustedIncome)}</strong>,
          which is {gbp.format(ex1.adjustedIncome - 260000)} over the
          £260,000 line. His allowance falls by half of that:{" "}
          {gbp.format(ex1.reduction)}, leaving{" "}
          <strong>{gbp.format(ex1.taperedAllowance)}</strong>.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The escape is in the same numbers. A gross personal
          contribution of {gbp.format(ex1.escapeContributionGross)} —{" "}
          {gbp.format(ex1.escapeContributionNet)} out of his own
          pocket at relief at source — would take his threshold income
          to exactly £200,000, the threshold test would fail, and his
          allowance would be the full £60,000 again. The contribution
          itself counts towards that allowance, and at{" "}
          {gbp.format(ex1.escapeContributionGross)} it fits inside
          £60,000 with room to spare — which is precisely why this
          move is usually planned in February and March, once the
          year&apos;s bonus is known. Our{" "}
          <Link href="/pay-rise-calculator" className={linkClass}>
            pay rise calculator
          </Link>{" "}
          and the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          show what the same salary changes do to the pay that
          actually reaches his bank.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: the contribution that switches the taper off
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Omar earns {gbp.format(ex2.totalIncome)} and his employer
          contributes {gbp.format(10000)}. Without any personal
          contribution his threshold income would be{" "}
          {gbp.format(ex2NoContribution.thresholdIncome)} and his
          adjusted income {gbp.format(ex2NoContribution.adjustedIncome)},
          so he would be tapered to{" "}
          {gbp.format(ex2NoContribution.taperedAllowance)}. Instead he
          pays {gbp.format(60000)} from his own bank account into a
          personal pension. His provider adds basic-rate relief, so
          the gross contribution is {gbp.format(ex2.rasGross)} and his
          threshold income becomes {gbp.format(ex2.totalIncome)} −{" "}
          {gbp.format(ex2.rasGross)} ={" "}
          <strong>{gbp.format(ex2.thresholdIncome)}</strong> — under
          £200,000. The threshold test fails, so his allowance is the
          full <strong>{gbp.format(ex2.taperedAllowance)}</strong>,
          even though his adjusted income is still{" "}
          {gbp.format(ex2.adjustedIncome)}.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          There is a catch, and it is the one most often missed: the
          contribution counts as pension savings. Omar&apos;s total
          input for the year is {gbp.format(ex2.rasGross)} of his own
          money plus {gbp.format(10000)} from his employer —{" "}
          {gbp.format(85000)} against a £60,000 allowance. Unless he
          has at least {gbp.format(25000)} of carry forward from the
          previous three years, the top {gbp.format(25000)} faces an
          annual allowance charge even though the taper itself is
          beaten. Escaping the taper and funding the escape are two
          separate sums — the calculator does both, which is why it
          asks for your planned savings and your last three years.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How can I escape the pension taper?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          There is one clean lever, two partial ones, and two popular
          moves that do not work at all:
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Pay a personal pension contribution (works).</strong>{" "}
            Money you pay into a personal pension or SIPP under
            relief at source reduces threshold income by its grossed
            amount — pay in £40,000 of your own money and £50,000
            comes off. Land threshold income on £200,000 or below
            and the taper is off, whatever your adjusted income. The
            contribution must be paid before 5 April, it counts
            towards the allowance it restores, and earnings are the
            limit for relief — you cannot contribute more than your
            UK earnings (plus carry forward of allowance, which is
            a separate limit) with full relief.
          </li>
          <li>
            <strong>Use carry forward (works, differently).</strong>{" "}
            Carry forward does not stop you being tapered, but it
            raises the allowance you are tested against, so a
            tapered allowance of £20,000 plus £45,000 carried
            forward shelters £65,000 of savings. Details in the next
            section.
          </li>
          <li>
            <strong>Time your income (sometimes).</strong> A bonus
            deferred into the next tax year, or a defined benefit
            member&apos;s promotion timing, can keep one year&apos;s
            figures under a line. It moves the problem rather than
            solving it, and employer contributions are rarely in
            your control.
          </li>
          <li>
            <strong>Salary sacrifice (does not work for this).</strong>{" "}
            Post-8 July 2015 sacrifice is added back to threshold
            income and counted as an employer saving in adjusted
            income, so it leaves both measures unchanged. It remains
            excellent for the £100,000 adjusted net income line —
            just not for this one.
          </li>
          <li>
            <strong>Gift Aid (does not work for this).</strong>{" "}
            Donations reduce adjusted net income for Child Benefit
            and the Personal Allowance, but neither pension measure
            moves. Generous, tax-efficient, and useless against the
            taper.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If the pension is being built for retirement income rather
          than tax planning, the{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          and the{" "}
          <Link href="/annuity-calculator" className={linkClass}>
            annuity calculator
          </Link>{" "}
          show what the pot can pay you when you stop.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is carry forward, and how does it work with the taper?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Carry forward lets you use annual allowance you did not
          use in the previous three tax years. Your available
          allowance for this year is this year&apos;s (tapered)
          allowance plus the unused amounts, and the order is fixed:
          this year&apos;s allowance first, then the earliest
          year&apos;s unused allowance, and so on. Three conditions
          catch people out:
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>You must have been a scheme member</strong> in
            each year you carry forward from — enrolled in a
            registered pension scheme, even if nothing was paid in.
          </li>
          <li>
            <strong>A tapered year only gives its tapered amount.</strong>{" "}
            If your allowance in 2024/25 was tapered to £20,000 and
            you saved £15,000, the unused amount is £5,000 — the
            other £40,000 of the standard allowance never existed
            for you. This is why the calculator lets you replace
            each year&apos;s allowance.
          </li>
          <li>
            <strong>The years have different standard allowances.</strong>{" "}
            For a 2026/27 calculation all three earlier years are
            £60,000 years. For 2025/26 the window reaches back to
            2022/23, when the standard allowance was £40,000 and the
            taper lines were lower (£240,000 adjusted income, £4,000
            floor) — the calculator pre-fills £40,000 for that year.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Carry forward is also the difference between a clever
          escape and an expensive one: as the second worked example
          shows, a contribution big enough to beat the taper can
          itself exceed the restored allowance, and only unused
          allowance from earlier years shelters the overshoot.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What happens if I exceed my pension annual allowance?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Savings above your available allowance (this year&apos;s
          allowance plus carry forward) are not banned — they are
          charged. The excess is added to your taxable income for
          the year as a top slice and taxed at your marginal rate:
          40% for a higher-rate taxpayer, 45% at additional rate, and
          effectively more inside the £100,000–£125,140 band where
          the Personal Allowance is also being withdrawn. The charge
          is declared on your Self Assessment return for the year the
          savings were made.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two practical points. First, if the charge is more than
          £2,000 and your savings exceeded the allowance, you can
          usually make a Scheme Pays election and have the pension
          scheme settle the bill from your pot, at the cost of lower
          benefits later — the deadline is 31 July following the tax
          year. Second, your schemes report your pension savings to
          HMRC whether or not you file, and defined benefit members
          in particular can be charged for growth they never saw as
          cash: if your statement shows a pension input amount above
          your allowance, work through the carry forward boxes above
          before assuming a bill. A reduced allowance also changes
          the tax code on your payslip in later years — the{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            HMRC tax code checker
          </Link>{" "}
          decodes what yours is doing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the money purchase annual allowance (MPAA)?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Once you flexibly access a money purchase pension — taking
          taxable cash or income from a SIPP or drawdown plan, among
          other triggers — your allowance for money purchase savings
          drops to £10,000 a year, permanently. The MPAA replaces the
          taper for those savings: it is £10,000 whether your income
          is £120,000 or £1.2 million, and carry forward cannot be
          added to it.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          High earners who have triggered it get a comparison rather
          than a simple swap: money purchase savings are tested
          against the £10,000 MPAA, while other savings (typically
          defined benefit) are tested against the alternative annual
          allowance — your tapered allowance minus £10,000 — which
          can still take carry forward. If the tapered allowance
          works out higher overall for your mix of savings, HMRC uses
          the better comparison (HS345 sets this out). Tick the
          flexibly-accessed box in the calculator and it shows both
          figures side by side.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the 60% tax trap, and how is it different?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Searchers land on these two traps together because the same
          people fall into both, but they are different mechanisms.
          The 60% trap sits between £100,000 and £125,140 of{" "}
          <Link href="/adjusted-net-income-calculator" className={linkClass}>
            adjusted net income
          </Link>
          : your Personal Allowance is withdrawn at £1 per £2, so
          income in that band carries about 60% effective income tax.
          The pension taper sits far higher — £200,000 and £260,000 —
          and taxes nothing directly; it removes tax relief by
          shrinking the allowance your savings are tested against.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The planning moves differ too. Salary sacrifice defeats
          the 60% trap but not the taper; a personal pension
          contribution defeats both, because it reduces adjusted net
          income and threshold income at the same time. If you are
          working out which salary you need for a target take-home
          figure while steering around both, the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            required salary calculator
          </Link>{" "}
          works backwards from the number you want to keep.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the most common tapered allowance mistakes?
        </h2>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Testing salary instead of adjusted income.</strong>{" "}
            A £230,000 salary with £40,000 of employer contributions
            is £270,000 of adjusted income — tapered. A £270,000
            salary with no employer contributions and a big personal
            contribution may not be. The payslip figure settles
            nothing on its own.
          </li>
          <li>
            <strong>Assuming salary sacrifice fixes it.</strong> For
            arrangements made after 8 July 2015 it is added straight
            back. It is the most expensive misunderstanding in this
            area, because the sacrifice itself is locked into the
            pension either way.
          </li>
          <li>
            <strong>Forgetting defined benefit growth.</strong> NHS,
            teachers&apos; and civil service members are tapered on
            the growth in their promised pension, valued at 16 times
            the annual increase — a promotion year can create a
            five-figure pension input amount with no cash changing
            hands. Your annual benefit statement carries the figure.
          </li>
          <li>
            <strong>Escaping the taper and breaching the allowance.</strong>{" "}
            The contribution that restores £60,000 of allowance
            counts towards that £60,000. Without carry forward behind
            it, an oversized escape contribution simply swaps a taper
            problem for an excess charge.
          </li>
          <li>
            <strong>Using the wrong year&apos;s rules.</strong>{" "}
            Before 2023/24 the allowance was £40,000, the adjusted
            income line £240,000 and the floor £4,000. A 2025/26
            carry forward calculation that treats 2022/23 as a
            £60,000 year overstates what you can shelter.
          </li>
          <li>
            <strong>Mixing up the two &quot;adjusted&quot; measures.</strong>{" "}
            Gift Aid and personal contributions reduce adjusted net
            income; only personal contributions reduce threshold
            income, and nothing you donate reduces adjusted income.
            Filing one measure&apos;s answer on the other&apos;s
            question produces confident, wrong numbers.
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
            href="https://www.gov.uk/guidance/pension-schemes-work-out-your-tapered-annual-allowance"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Work out your reduced (tapered) annual allowance
          </a>{" "}
          (GOV.UK); HMRC helpsheet HS345,{" "}
          <a
            href="https://www.gov.uk/government/publications/pensions-tax-charges-on-any-excess-over-the-lifetime-allowance-annual-allowance-special-annual-allowance-and-on-unauthorised-payments-hs345-self/hs345-pension-savings-tax-charges-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Pension savings — tax charges (2026)
          </a>
          ; and HMRC&apos;s Pensions Tax Manual PTM057100–PTM057200 on
          threshold and adjusted income. This calculator applies
          those rules for 2025/26 and 2026/27 and is a guide, not
          advice on your tax return — defined benefit input amounts,
          scheme-specific timings and anything within a few hundred
          pounds of a threshold should be checked against your
          pension savings statement and, for sums this size,
          regulated advice is worth its fee.
        </p>
      </section>

      <RelatedCalculators href="/tapered-annual-allowance-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
