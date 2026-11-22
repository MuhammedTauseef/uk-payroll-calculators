import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import ChildcareCalculator from "@/components/ChildcareCalculator";
import { calculateChildcare } from "@/lib/childcare";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/childcare-calculator",
  "Tax-Free Childcare Calculator UK — Top-Up & Eligibility",
  "Free tax-free childcare calculator: work out your top-up — £2 for every £8, up to £2,000 a year per child (£4,000 if disabled) — plus the £100,000 check.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const example = calculateChildcare({
  children: [{ monthlyCost: 1000, disabled: false }],
  household: "couple",
  parent1Income: 35000,
  parent2Income: 30000,
  parentAgeBand: "21+",
});
const exampleChild = example.perChild[0];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does the government add in Tax-Free Childcare?",
    answer:
      "For every £8 you pay into your childcare account, the government adds £2 — it covers 20% of your bill. The top-up is capped at £500 per child every 3 months (£2,000 a year), or £1,000 every 3 months (£4,000 a year) for a disabled child.",
  },
  {
    question: "What is the £100,000 rule for Tax-Free Childcare?",
    answer:
      "Each parent's expected adjusted net income must be £100,000 or less. It is a cliff edge, not a taper: if either parent expects £100,001, the whole entitlement stops, and the 30 hours of free childcare usually goes with it. Pension contributions and salary sacrifice reduce adjusted net income, which is why a contribution in March can rescue a claim for the whole year.",
  },
  {
    question: "How much do I need to earn to qualify for Tax-Free Childcare?",
    answer:
      "Each parent must usually expect to earn at least the National Minimum Wage for 16 hours a week over the next 3 months — £2,643.68 per quarter for someone aged 21 or over at April 2026 rates. Exceptions apply, for example on parental leave, or if a parent cannot work and the other does.",
  },
  {
    question: "Can I get Tax-Free Childcare and Universal Credit together?",
    answer:
      "No. You cannot claim Tax-Free Childcare while you get Universal Credit (or the old childcare vouchers or Working Tax Credit). Universal Credit can cover up to 85% of childcare costs and suits many lower-income households better; Tax-Free Childcare usually wins once household income is too high for Universal Credit. Compare both before you switch, because leaving Universal Credit is not easily reversed.",
  },
  {
    question: "How does the £500 quarterly cap work over a full year?",
    answer:
      "The top-up is assessed in 3-month blocks, each capped at £500 per child — so four full blocks make the £2,000 yearly maximum (£1,000 a block and £4,000 a year for a disabled child). What matters is the total bill inside each block, not the monthly pattern, and cap one block does not use never rolls into the next: a £3,000 term-time bill in one block earns the full £500, while a block under £2,500 of bills leaves some allowance behind. The quarter-by-quarter tracker in the results above shows each of your four blocks separately.",
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
  name: "Tax-Free Childcare Calculator UK",
  url: `${AppConfig.siteUrl}/childcare-calculator`,
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

export default function ChildcareCalculatorPage() {
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
          Tax-Free Childcare Calculator UK
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this childcare calculator to work out how much Tax-Free
          Childcare adds to your bill: £2 for every £8 you pay in, up
          to £2,000 per child per year (£4,000 for a disabled child).
          Enter each child&apos;s bill per week, per month or per
          quarter; the calculator checks every child separately, tracks
          the £500 quarterly cap across the year, and flags the
          £100,000 eligibility cliff and the minimum-earnings rule.
        </p>
      </section>

      <ChildcareCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Tax-Free Childcare works
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          You open a childcare account on GOV.UK for each child, pay
          money in, and the government tops it up by 25% of your deposit
          — the £2 for every £8 — which is 20% of the total your provider
          receives. You then pay the provider from the account. The
          top-up is capped per child in 3-month blocks: £500 a quarter
          (£2,000 a year), doubled for a disabled child. A worked example
          makes the cap concrete: a nursery bill of{" "}
          {gbp.format(exampleChild.monthlyCost)} a month is{" "}
          {gbp.format(exampleChild.quarterlyBill)} a quarter, which would
          earn {gbp.format(exampleChild.quarterlyBill * 0.2)} of top-up
          before the cap — the cap cuts it to{" "}
          {gbp.format(exampleChild.quarterlyTopUp)} a quarter,{" "}
          {gbp.format(exampleChild.annualTopUp)} a year, and you pay in{" "}
          {gbp.format(exampleChild.quarterlyDeposit)} a quarter yourself.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two consequences follow. First, once your quarterly bill passes
          £2,500 per child (£5,000 for a disabled child), extra spending
          earns no extra top-up — the scheme pays a flat fifth of a
          typical full-time nursery bill and no more. Second, because the
          cap is quarterly, uneven bills waste allowance: a quiet quarter
          cannot lend its unused cap to a busy one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Who can claim: the eligibility rules
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Rule</th>
                <th className={thClass}>What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Working parents</td>
                <td className={tdClass}>Each parent must usually be working — employed, self-employed, or on parental or sick leave from a job.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Minimum earnings</td>
                <td className={tdClass}>Each parent must expect to earn at least 16 hours a week at National Minimum Wage over the next 3 months — £2,643.68 a quarter at 21+ (April 2026 rates).</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>£100,000 limit</td>
                <td className={tdClass}>Each parent&apos;s expected adjusted net income must be £100,000 or less. One pound over, for either parent, stops the whole claim.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Child&apos;s age</td>
                <td className={tdClass}>Covered until 1 September after the 11th birthday, or the 16th birthday if disabled.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Reconfirm</td>
                <td className={tdClass}>Eligibility must be reconfirmed every 3 months in the account; miss it and top-ups pause.</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Not with other support</td>
                <td className={tdClass}>Cannot be claimed alongside Universal Credit, Working Tax Credit or employer childcare vouchers.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The £100,000 line is the rule that catches growing families
          out, because adjusted net income is not the same as salary: it
          is income after pension contributions and salary sacrifice.
          A parent heading for £105,000 who puts £5,001 into a pension
          is back under the line and keeps up to £2,000 per child of
          top-up plus, in England, the funded hours. Our{" "}
          <Link
            href="/salary-sacrifice-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            salary sacrifice calculator
          </Link>{" "}
          shows what an exchange does to take-home pay, and the{" "}
          <Link
            href="/40k-after-tax-uk"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            take-home pay calculator
          </Link>{" "}
          shows the full picture at any salary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Tax-Free Childcare, free hours or Universal Credit?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The three schemes stack and clash in specific ways. In England,
          working parents can also get funded hours — 30 hours a week for
          children from 9 months to school age, on the same £100,000 and
          minimum-earnings conditions — and funded hours and Tax-Free
          Childcare can be used together, the top-up covering the hours
          and extras the funding does not. Scotland funds 1,140 hours a
          year for 3 and 4 year olds (and eligible 2 year olds), and
          Wales runs its own Childcare Offer; Tax-Free Childcare itself
          is UK-wide and works the same in all four nations.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Scheme</th>
                <th className={thClass}>What it pays</th>
                <th className={thClass}>Usually suits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Tax-Free Childcare</td>
                <td className={tdClass}>20% of the bill, up to £2,000 per child a year (£4,000 disabled)</td>
                <td className={tdClass}>Working parents not on Universal Credit, including the self-employed</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Universal Credit childcare</td>
                <td className={tdClass}>Up to 85% of the bill, subject to monthly caps, paid in arrears</td>
                <td className={tdClass}>Lower-income working households already claiming Universal Credit</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Funded hours (England)</td>
                <td className={tdClass}>30 hours a week of funded childcare, term-time basis, from 9 months</td>
                <td className={tdClass}>Almost every working family — and it can run alongside Tax-Free Childcare</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>Childcare vouchers (closed)</td>
                <td className={tdClass}>Up to £243 a month of salary sacrificed free of tax and NI</td>
                <td className={tdClass}>Only parents who joined before October 2018 and stayed with the same employer</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Parents returning from leave hit these rules at the worst
          possible time. If you are working out what leave itself pays,
          the{" "}
          <Link
            href="/nhs-maternity-pay-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            NHS maternity pay calculator
          </Link>{" "}
          and{" "}
          <Link
            href="/paternity-pay-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            paternity pay calculator
          </Link>{" "}
          cover the two most common schemes, and the{" "}
          <Link
            href="/pro-rata-salary-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            pro-rata salary calculator
          </Link>{" "}
          shows what a move to part-time hours does to pay when you go back.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          For employers: childcare support runs through payroll
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Employers no longer run Tax-Free Childcare — parents claim it
          themselves — but payroll still carries the older voucher
          schemes for staff who stayed in them, the salary-sacrifice
          arrangements parents use to stay under the £100,000 line, and
          the workplace-nursery benefits some firms offer instead.
          Payroll software that handles sacrifice and benefits cleanly,
          such as{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            Zoho Payroll
          </a>
          , keeps those deductions and their pension knock-ons in one
          place instead of a spreadsheet per employee.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay, and
          providers cannot pay to be ranked or included.
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
          This calculator applies the Tax-Free Childcare rules as
          published by GOV.UK for 2026/27 and is a guide, not advice on
          your claim. Eligibility is decided by HMRC on your actual
          circumstances — check the Childcare Choices service before you
          rely on a figure, especially near the £100,000 line.
        </p>
      </section>

      <RelatedCalculators href="/childcare-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
