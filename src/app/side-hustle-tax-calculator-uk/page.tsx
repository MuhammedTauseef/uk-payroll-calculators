import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SideHustleCalculator from "@/components/SideHustleCalculator";
import { calculateSideHustle } from "@/lib/side-hustle";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/side-hustle-tax-calculator-uk",
  "Side Hustle Tax Calculator UK — Extra Tax on a Second Income, 2025/26",
  "Free UK side hustle tax calculator for 2025/26: enter your salary, side income and expenses to see the extra Income Tax and Class 4 NI to set aside — the £1,000 trading allowance or your expenses, whichever saves more, applied automatically.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// The two worked examples further down the page — computed by
// the same function the calculator above runs, so the page can
// never disagree with itself.
const EXAMPLE_A = calculateSideHustle({
  salary: 35000,
  sideIncome: 6000,
  expenses: 500,
});
const EXAMPLE_C = calculateSideHustle({
  salary: 0,
  sideIncome: 20000,
  expenses: 3000,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much can I earn from a side hustle before I pay tax?",
    answer:
      "The first £1,000 of gross side income in a tax year is covered by the trading allowance — no tax on it, and usually nothing to declare. The £1,000 is measured on the money coming in, before expenses, and it is one allowance across all your side trades added together. Above £1,000 you pay tax on the profit: the side income minus either the £1,000 allowance or your actual expenses, whichever leaves less to tax. Your salary's Personal Allowance does not shelter the side income separately — the profit is added on top of your salary and taxed at the rate your combined income reaches.",
  },
  {
    question: "Do I pay tax on a side hustle if I already have a job?",
    answer:
      "Yes. A side hustle does not get its own set of tax bands: the profit sits on top of your salary and is taxed at your marginal rate. On a £35,000 salary, a £5,000 side profit falls inside the basic-rate band and pays 20% — £1,000. If your salary already takes you past £50,270, the same profit pays 40% instead. Your employer keeps taxing your salary through PAYE exactly as before; the extra tax on the side income is settled through Self Assessment, which is what this calculator estimates.",
  },
  {
    question: "Can I claim both the £1,000 trading allowance and my expenses?",
    answer:
      "No — it is one or the other, never both. If your expenses are under £1,000, the allowance leaves less profit to tax; if they are over £1,000, claiming the real expenses wins. This calculator compares the two on your figures and uses the better one automatically. Two things to know: claiming the allowance can never create a loss, so if your expenses are bigger than your income and you want the loss on your return, claim expenses; and the choice is made on your tax return, where it can be changed up to a year after the filing deadline.",
  },
  {
    question: "Do I pay National Insurance on side hustle income?",
    answer:
      "Class 4 National Insurance, once the profit passes £12,570: 6% on profit between £12,570 and £50,270, and 2% on profit above £50,270. It is worked out on the trading profit alone — your salary neither uses up the Class 4 band nor adds to it, and the Class 1 contributions your employer deducts are a separate calculation. Class 2 costs nothing in 2025/26: profits of £6,845 or more are treated as paid, protecting your State Pension record, and below £6,845 you can choose to pay it voluntarily at £3.50 a week.",
  },
  {
    question: "When do I have to register for Self Assessment for a side hustle?",
    answer:
      "As soon as your gross side income passes £1,000 in a tax year. For 2025/26 income, register by 5 October 2026, then file the return online and pay the bill by 31 January 2027. Register even if your expenses mean little tax is due — the trigger is the gross income, not the profit. Expect the first payment to include a payment on account: an advance towards next year's bill, collected in two halves, which surprises many first-time side hustlers but is not extra tax.",
  },
  {
    question: "My side income is under £1,000 — do I need to do anything?",
    answer:
      "Usually nothing: no registration, no return, no tax — this is the trading allowance's full relief. Keep records of the income anyway. There are exceptions. You cannot use the allowance at all on income from your own employer, your spouse's or civil partner's employer, or a company or partnership you or someone connected to you controls — that income is taxed another way. And you may still need a return for another reason: claiming Tax-Free Childcare or Maternity Allowance on the income, paying voluntary Class 2, or recording a loss.",
  },
  {
    question: "Does this calculator use Scottish tax rates?",
    answer:
      "No — it uses the England, Wales and Northern Ireland Income Tax bands for 2025/26. Class 4 National Insurance is the same everywhere in the UK, so that part of the result holds for Scotland too, but a Scottish taxpayer's Income Tax on the profit is worked out at the Scottish rates, which have more bands and different thresholds. If you pay Scottish Income Tax, treat the Income Tax figure here as a guide only.",
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
  name: "Side Hustle Tax Calculator UK",
  url: `${AppConfig.siteUrl}/side-hustle-tax-calculator-uk`,
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

function ExampleTable({
  title,
  result,
  deductionLabel,
}: {
  title: string;
  result: ReturnType<typeof calculateSideHustle>;
  deductionLabel: string;
}) {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "PAYE salary", value: fmtMoney(result.salary) },
    { label: "Gross side income", value: fmtMoney(result.sideIncome) },
    { label: "Expenses", value: fmtMoney(result.expenses) },
    {
      label: `Deduction used (${deductionLabel})`,
      value: fmtMoney(result.deduction),
    },
    {
      label: "Taxable profit",
      value: fmtMoney(result.taxableProfit),
      strong: true,
    },
    {
      label: "Extra Income Tax",
      value: fmtMoney(result.extraIncomeTax),
    },
    { label: "Class 4 National Insurance", value: fmtMoney(result.class4Ni) },
    {
      label: "Total extra tax",
      value: fmtMoney(result.totalExtraTax),
      strong: true,
    },
    { label: "Kept from the side hustle", value: fmtMoney(result.netKept) },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm table-stack">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.label}
                </td>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SideHustleTaxCalculatorUkPage() {
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

      <section className="space-y-3 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Side Hustle Tax Calculator UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Tax on a side hustle is worked out on the profit, stacked
          on top of your salary at your marginal rate — 20%, 40% or
          45% for 2025/26. The first £1,000 of gross side income is
          covered by the trading allowance; above that, deduct the
          £1,000 or your actual expenses, whichever is bigger, plus
          Class 4 NI over £12,570.
        </p>
      </section>

      <SideHustleCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this side hustle tax calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is a free hub of UK payroll
          calculators and business tools, built on the rules
          published by GOV.UK and HMRC — no sign-up, no accounts,
          and every figure worked out in your browser. This
          calculator follows the same pattern, on the 2025/26 rules
          — the tax year whose returns are being filed now. Enter
          your gross PAYE salary (leave it at £0 if the side income
          is all you have), everything the side hustle brought in
          before costs, and the costs themselves. The result is the
          EXTRA tax the side income causes: the Income Tax on your
          salary plus profit, minus the tax your salary already pays
          through PAYE, plus Class 4 National Insurance on the
          profit. To see the salary side on its own, the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          breaks a wage down month by month.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is a side hustle taxed in the UK?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On top of everything else you earn — that is the whole
          mechanism. HMRC adds your trading profit to your salary
          and taxes the combined figure through the normal bands:
          the £12,570 Personal Allowance first (reduced by £1 for
          every £2 of income over £100,000, until it disappears at
          £125,140), then 20%, 40% and 45%. A salary of £35,000
          leaves £15,270 of the basic-rate band unused, so a side
          profit of £5,000 is taxed entirely at 20%. A salary of
          £55,000 has already used the whole band, so the same
          profit is taxed entirely at 40%. That is why two people
          with identical side hustles can owe very different tax —
          and why the salary box in the calculator matters as much
          as the side income box.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band (2025/26)</th>
                <th className={thClass}>Taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Personal Allowance</td>
                <td className={tdClass}>
                  The first £12,570 of income (tapering away over
                  £100,000)
                </td>
                <td className={tdClass}>0%</td>
              </tr>
              <tr>
                <td className={tdClass}>Basic rate</td>
                <td className={tdClass}>
                  £0 to £37,700 — income up to £50,270 with a full
                  allowance
                </td>
                <td className={tdClass}>20%</td>
              </tr>
              <tr>
                <td className={tdClass}>Higher rate</td>
                <td className={tdClass}>
                  £37,701 to £125,140 — income up to £125,140
                </td>
                <td className={tdClass}>40%</td>
              </tr>
              <tr>
                <td className={tdClass}>Additional rate</td>
                <td className={tdClass}>Over £125,140</td>
                <td className={tdClass}>45%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          England, Wales and Northern Ireland bands. Scotland sets
          its own Income Tax rates and thresholds, so a Scottish
          taxpayer&apos;s bill on the same profit differs.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is the £1,000 trading allowance?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A £1,000 tax-free allowance for trading income, on{" "}
          <a
            href="https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GOV.UK&apos;s guidance
          </a>
          : if your gross trading income for the year — everything
          coming in, before a single expense, and added together
          across every side trade you run — is £1,000 or less, the
          profit counts as nil. No tax, and usually no need to tell
          HMRC at all; GOV.UK calls this full relief. Above £1,000
          the allowance still works for you, as a flat £1,000
          deduction you can take instead of your expenses — partial
          relief. What the allowance never covers is income from
          your own employer, your spouse&apos;s or civil
          partner&apos;s employer, or a company or partnership you
          or someone connected to you controls: that income cannot
          use it, however small.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Your gross side income</th>
                <th className={thClass}>What happens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>£1,000 or less</td>
                <td className={tdClass}>
                  Full relief — no tax, and usually nothing to
                  declare. Keep records of the income.
                </td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Over £1,000, expenses under £1,000
                </td>
                <td className={tdClass}>
                  Register for Self Assessment; deduct the £1,000
                  allowance instead of the expenses — it leaves less
                  profit to tax.
                </td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Over £1,000, expenses over £1,000
                </td>
                <td className={tdClass}>
                  Register for Self Assessment; deduct the actual
                  expenses — they leave less profit to tax.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Trading allowance or expenses — which should you claim?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Whichever leaves the smaller profit — and the calculator
          above makes the choice for you and says which one it used.
          On {fmtMoney(EXAMPLE_A.sideIncome)} of side income with{" "}
          {fmtMoney(EXAMPLE_A.expenses)} of expenses, the two routes
          look like this: expenses leave{" "}
          {fmtMoney(EXAMPLE_A.sideIncome - EXAMPLE_A.expenses)} of
          profit, the allowance leaves{" "}
          {fmtMoney(EXAMPLE_A.sideIncome - EXAMPLE_A.deduction)}, so
          the allowance wins and the tax is worked out on{" "}
          {fmtMoney(EXAMPLE_A.taxableProfit)}. The pattern reverses
          the moment expenses pass £1,000. One caution: the
          allowance can never create or increase a loss. If your
          costs are bigger than your income and you want that loss
          on your tax return — against other income, or carried
          forward — claim the expenses, not the allowance.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When the side hustle becomes a business: keeping the
          records straight
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The tax is the easy part; the records are what a growing
          side hustle runs on. Every invoice, platform statement and
          expense receipt has to be kept — self-employed records
          until 5 years after the 31 January filing deadline — and
          the profit figure on the return has to be built from them.
          That bookkeeping layer is what accounting software is for:{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          records the income and expenses as they happen, raises the
          invoices, and keeps the totals the return needs ready
          through the year, so the estimate this page gives you in
          January is never a surprise. For the invoices themselves,
          the{" "}
          <Link href="/free-invoice-generator-uk" className={linkClass}>
            free invoice generator
          </Link>{" "}
          makes them one at a time, in your browser.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign
          up after visiting them — it never changes the price you
          pay, and providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much National Insurance does a side hustle pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Class 4, and only on the profit — GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/self-employed-national-insurance-rates"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            self-employed National Insurance rates
          </a>{" "}
          charge nothing until the profit passes £12,570, then 6%
          up to £50,270 and 2% above. Most side hustles never reach
          the threshold: a £5,000 profit pays no Class 4 at all.
          Two things catch people out. Your salary does not use up
          any of the Class 4 band — a £60,000 salary with a £15,000
          profit still pays Class 4 only on the £2,430 of profit
          above £12,570. And Class 2 is separate: at profits of
          £6,845 or more in 2025/26 it is treated as paid, so your
          State Pension record is protected for free; below that you
          can pay it voluntarily at £3.50 a week, which is usually
          worth it for the qualifying year it buys.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Trading profit (2025/26)</th>
                <th className={thClass}>Class 4 rate</th>
                <th className={thClass}>Class 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Under £6,845</td>
                <td className={tdClass}>0%</td>
                <td className={tdClass}>
                  Voluntary at £3.50 a week if you want the year to
                  count
                </td>
              </tr>
              <tr>
                <td className={tdClass}>£6,845 to £12,570</td>
                <td className={tdClass}>0%</td>
                <td className={tdClass}>
                  Treated as paid — nothing to pay
                </td>
              </tr>
              <tr>
                <td className={tdClass}>£12,570 to £50,270</td>
                <td className={tdClass}>6%</td>
                <td className={tdClass}>Treated as paid</td>
              </tr>
              <tr>
                <td className={tdClass}>Over £50,270</td>
                <td className={tdClass}>2%</td>
                <td className={tdClass}>Treated as paid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does the tax look like on real numbers?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two examples, worked by the same maths as the calculator
          above. The first is the classic evening-and-weekend
          hustle alongside a job: the expenses are small, so the
          trading allowance beats them, and the whole profit lands
          in the basic-rate band the salary has not used up. The
          second is a side income with no job at all, where the
          Personal Allowance shelters most of the profit and Class 4
          finally appears.
        </p>
        <ExampleTable
          title="Example 1 — a £35,000 job plus a £6,000 side hustle"
          result={EXAMPLE_A}
          deductionLabel="trading allowance"
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The {fmtMoney(EXAMPLE_A.totalExtraTax)} is{" "}
          {EXAMPLE_A.effectiveRatePercent}% of the side income — the
          figure to set aside from each payment as it arrives, so
          January holds no surprise. If the same person charged by
          the day instead, the{" "}
          <Link href="/day-rate-calculator" className={linkClass}>
            day rate calculator
          </Link>{" "}
          turns the rate into the yearly figure behind it.
        </p>
        <ExampleTable
          title="Example 2 — no job, £20,000 of side income"
          result={EXAMPLE_C}
          deductionLabel="actual expenses"
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Here the expenses of {fmtMoney(EXAMPLE_C.expenses)} beat
          the allowance, the profit of{" "}
          {fmtMoney(EXAMPLE_C.taxableProfit)} absorbs the full
          Personal Allowance, and Class 4 adds{" "}
          {fmtMoney(EXAMPLE_C.class4Ni)} on the slice of profit over
          £12,570. Total tax of {fmtMoney(EXAMPLE_C.totalExtraTax)}{" "}
          on {fmtMoney(EXAMPLE_C.sideIncome)} of income is an
          effective rate of just {EXAMPLE_C.effectiveRatePercent}%.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Will HMRC find out about my side hustle?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Assume yes — not because HMRC is watching you personally,
          but because the platforms are required to tell it. Since
          1 January 2024, under the UK&apos;s reporting rules for
          digital platforms (based on the OECD model rules), online
          marketplaces, delivery and ride-hailing apps, and property
          platforms such as short-let sites have had to collect
          sellers&apos; details and report their income to HMRC each
          year; the first reports, covering 2024, were sent by
          31 January 2025, and the platform also sends you a copy of
          what it reported. HMRC can match that data against tax
          returns — and against the absence of one.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Being reported is not, by itself, a problem, and it is not
          a tax bill. Tax only becomes due when your gross trading
          income passes the £1,000 trading allowance in a tax year —
          below that, the income is fully relieved whether or not a
          platform reports it, which is why people selling their own
          unwanted belongings occasionally, rather than trading,
          usually have nothing to pay. Above £1,000, the answer is
          not to hope the data does not match: register, file, and
          use the platform&apos;s own statement as one of your
          records when you do.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When do you have to register, file and pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three dates run a side hustle&apos;s tax year. Register
          for Self Assessment by 5 October after the tax year ends —
          for 2025/26 income, 5 October 2026 — as soon as the gross
          side income passes £1,000; the trigger is the gross
          figure, even if expenses leave almost no tax to pay. File
          the return online and pay the bill by 31 January 2027.
          And budget for the payment on account: the first bill
          usually adds 50% of itself again as an advance towards
          next year, with a second half due the following July. It
          is not extra tax — it comes off next year&apos;s bill —
          but it makes the first January payment half as big again
          as the tax itself, which is exactly what the figure from
          this calculator helps you prepare for.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 22
          November 2026 — the trading allowance and its full and
          partial relief from GOV.UK&apos;s guidance on tax-free
          allowances on property and trading income, the Income Tax
          bands and Personal Allowance from HMRC&apos;s rates and
          allowances (Annex A), and the Class 2 and Class 4 rates
          and thresholds for 2025/26 from GOV.UK&apos;s National
          Insurance rates and allowances. This page is a working
          tool and a guide, not tax or financial advice; it does not
          cover Scottish Income Tax bands, student loans, pension
          contributions or losses.
        </p>
      </section>

      <section className="space-y-4 print:hidden">
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

      <RelatedCalculators href="/side-hustle-tax-calculator-uk" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
