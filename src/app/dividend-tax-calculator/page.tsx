import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import DividendTaxCalculator from "@/components/DividendTaxCalculator";
import {
  calculateDividendTax,
  optimiseSalaryDividend,
  type DividendTaxResult,
} from "@/lib/dividend-tax";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/dividend-tax-calculator",
  "Dividend Tax Calculator UK — Tax on Dividends 2026/27 & Best Salary-Dividend Mix",
  "Free UK dividend tax calculator for 2026/27: dividends stacked the way HMRC does it — Personal Allowance, the £500 dividend allowance inside the bands, then 10.75%, 35.75% and 39.35% — with a full breakdown, a monthly set-aside, and an optimiser that finds your best salary and dividend mix.",
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

// The worked examples further down the page — every one computed
// by the same engine the calculator above runs, so the page can
// never disagree with itself.
const EX_MAIN = calculateDividendTax({ salary: 12570, dividends: 30000 });
const EX_GOVUK = calculateDividendTax({ salary: 29570, dividends: 3000 });
const EX_TAXFREE = calculateDividendTax({ salary: 8000, dividends: 5070 });
const EX_HIGHER = calculateDividendTax({ salary: 60000, dividends: 20000 });
const EX_TAPER = calculateDividendTax({ salary: 110000, dividends: 20000 });
const EX_LOAN = calculateDividendTax({
  salary: 12570,
  dividends: 30000,
  undergraduatePlan: "plan2",
});
const EX_OPT = optimiseSalaryDividend({ profit: 50000 });

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax will I pay on a dividend?",
    answer:
      "It depends where the dividends land once your other income is stacked underneath them. Your Personal Allowance (£12,570 in 2026/27) covers dividends only if your salary and other income have not used it, then the first £500 of dividends is taxed at 0% under the dividend allowance, and the rest is taxed at 10.75% in the basic band, 35.75% in the higher band and 39.35% in the additional band. On the classic director's package — a £12,570 salary plus £30,000 of dividends — the dividend tax is £3,171.25 and the take-home is £39,398.75. Put your own salary and dividends into the calculator above for your figure.",
  },
  {
    question: "How do I calculate my dividend tax?",
    answer:
      "In four steps, in this order. One: add your salary, any other income and your dividends together and work out your Personal Allowance on the total (it shrinks over £100,000). Two: set the allowance against the salary and other income first — dividends are always the top slice. Three: take the £500 dividend allowance off the dividends, remembering it still uses up band room. Four: charge what is left of the dividends at the rate of each band it passes through — 10.75%, then 35.75%, then 39.35%. GOV.UK's own example runs the same steps: £29,570 of wages plus £3,000 of dividends leaves £2,500 of dividends above the allowance, taxed at 10.75% — £268.75.",
  },
  {
    question: "How much of a dividend is taxable?",
    answer:
      "Everything above two shelters: the part of your Personal Allowance your other income has not used, and the £500 dividend allowance. Dividends inside an ISA are never taxable at all. Beyond that, every pound of dividend is taxable — but at the dividend rates, which are lower than the salary rates in each band, and with no National Insurance on top. A director with a £12,570 salary has used the whole Personal Allowance on the salary, so only the £500 shelter remains; someone with no salary at all can receive £13,070 of dividends (£12,570 of allowance plus the £500) before any dividend tax is due.",
  },
  {
    question: "What are the dividend tax rates for 2026?",
    answer:
      "For the 2026/27 tax year: 10.75% at the basic rate, 35.75% at the higher rate and 39.35% at the additional rate, after a £500 dividend allowance taxed at 0%. The basic and higher rates rose by two percentage points in April 2026 (from 8.75% and 33.75% in 2025/26); the additional rate did not change. The rates are the same everywhere in the UK — dividend tax is not devolved, so a Scottish taxpayer pays the same dividend rates even though the tax on their salary is worked out on Scotland's own bands.",
  },
  {
    question: "How much dividend is tax free?",
    answer:
      "£500 a year under the dividend allowance — plus whatever of your £12,570 Personal Allowance your salary and other income have not used. With no other income at all, that makes £13,070 of dividends completely tax free. With the usual director's salary of £12,570, the Personal Allowance is fully used by the salary and only the £500 remains. The two shelters work differently, though: income covered by the Personal Allowance disappears from the calculation, while the £500 dividend allowance is charged at 0% but still counts towards your tax bands, pushing later dividends up sooner.",
  },
  {
    question: "Is it better to take dividends or salary?",
    answer:
      "Neither on its own — the best answer is almost always a mix, and it depends on the profit. Salary is paid before Corporation Tax and attracts employer and employee National Insurance; dividends are paid out of profit after Corporation Tax but carry no National Insurance and are taxed at lower personal rates. On £50,000 of company profit, the optimiser in the calculator above finds a salary of £12,570 with the rest as dividends keeps £38,861.95 — about £460 more than a £5,000 salary and about £1,830 more than a £20,000 salary. Your own best mix moves with the profit, any other income and any student loan, which is why the tool searches it rather than asserting it.",
  },
  {
    question: "Do I pay National Insurance on dividends?",
    answer:
      "No. Dividends are investment income, not earnings, so neither employee nor employer National Insurance is charged on them — that, plus the lower dividend tax rates, is the whole reason the salary-and-dividends mix exists. The catch is the order of events: a company can only pay dividends out of profit that has already borne Corporation Tax, and only if it has distributable reserves. Salary, by contrast, is a cost the company deducts before Corporation Tax — but it carries employer NI at 15% on pay over £5,000 and employee NI at 8% and 2%.",
  },
  {
    question: "When do I pay dividend tax?",
    answer:
      "Through Self Assessment, after the tax year ends. If your dividend tax is more than a small amount you register by 5 October following the tax year and pay the balancing amount by the next 31 January, with payments on account towards the following year on 31 January and 31 July where HMRC asks for them. GOV.UK's route for smaller amounts: dividends up to £10,000 can be reported without a full return, and HMRC can collect the tax by adjusting your tax code instead. Because none of it is deducted as you go, the calculator shows a monthly set-aside — on £30,000 of dividends over a £12,570 salary, £264.27 a month — so the January bill is already saved for.",
  },
  {
    question: "Does dividend tax work the same way in Scotland?",
    answer:
      "The dividend tax itself, yes — the rates (10.75%, 35.75%, 39.35%) and the £500 dividend allowance are UK-wide and are not devolved to Scotland. What differs is the tax on the salary underneath: Scotland sets its own Income Tax bands for earnings, so a Scottish director's salary tax will not match the England, Wales and Northern Ireland figures this calculator uses for the salary part. The dividend slices in the breakdown — which band of the UK stack they land in — follow the same stacking rules; it is the salary figures that a Scottish taxpayer should read as the rest-of-UK version.",
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
  name: "Dividend Tax Calculator UK",
  url: `${AppConfig.siteUrl}/dividend-tax-calculator`,
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
  showLoan = false,
}: {
  title: string;
  result: DividendTaxResult;
  showLoan?: boolean;
}) {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Salary", value: fmtMoney(result.salary) },
    ...(result.salarySacrifice > 0
      ? [
          {
            label: "Salary sacrifice (into a pension)",
            value: fmtMoney(result.salarySacrifice),
          },
        ]
      : []),
    { label: "Dividends", value: fmtMoney(result.dividends) },
    ...(result.otherIncome > 0
      ? [{ label: "Other income", value: fmtMoney(result.otherIncome) }]
      : []),
    {
      label: "Personal Allowance (on the total income)",
      value: fmtMoney(result.personalAllowance),
    },
    {
      label: "Income Tax on the salary and other income",
      value: fmtMoney(result.nonDividendTax),
    },
    { label: "Dividend tax", value: fmtMoney(result.dividendTax) },
    {
      label: "Employee National Insurance (salary only)",
      value: fmtMoney(result.employeeNi),
    },
    ...(showLoan
      ? [
          {
            label: "Student loan (on the total income)",
            value: fmtMoney(result.studentLoan),
          },
        ]
      : []),
    {
      label: "Take-home pay",
      value: fmtMoney(result.takeHomeAnnual),
      strong: true,
    },
    { label: "Take-home a month", value: fmtMoney(result.takeHomeMonthly) },
    {
      label: "Set aside for Self Assessment",
      value: `${fmtMoney(result.selfAssessmentSetAsideAnnual)} a year · ${fmtMoney(result.selfAssessmentSetAsideMonthly)} a month`,
    },
    {
      label: "Employer NI (paid by the company, on top)",
      value: fmtMoney(result.employerNi),
    },
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

export default function DividendTaxCalculatorPage() {
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
          Dividend Tax Calculator UK
        </h1>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          {/* Answer-first summary (40–60 words). */}
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Dividend tax starts above two shelters: your Personal
            Allowance (£12,570 in 2026/27) covers dividends first if
            your salary does not use it, then a £500 dividend
            allowance is taxed at 0%. What is left is taxed at
            10.75%, 35.75% or 39.35%, depending on the band it lands
            in once your salary is stacked underneath.
          </p>
        </div>
      </section>

      <DividendTaxCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this dividend tax calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators (payrollcalc.co.uk) is a free hub of
          UK pay and tax calculators, built on the rules published by
          GOV.UK and HMRC — no sign-up, no accounts, and every figure
          worked out in your browser. Enter a salary and the year&apos;s
          dividends and the calculator stacks them the way HMRC does:
          the salary and any other income first, the dividends on top,
          one Personal Allowance across the lot, and the £500 dividend
          allowance inside the bands. The breakdown under the result
          shows every slice and the rate charged on it — the working,
          not just the answer. Directors deciding how to pay
          themselves should use the second mode instead: it searches
          salary levels against your company&apos;s profit, Corporation
          Tax included, and finds the mix that keeps the most. The{" "}
          <Link href="/corporation-tax-calculator" className={linkClass}>
            corporation tax calculator
          </Link>{" "}
          works the company side of that loop on its own.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much tax do you pay on dividends?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Dividends never stand alone. GOV.UK&apos;s rule — &ldquo;to
          work out your tax band, add your total dividend income to
          your other income&rdquo; — means the salary underneath
          decides the rate the dividends pay. Two facts worth quoting
          exactly, both from GOV.UK&apos;s &ldquo;Tax on
          dividends&rdquo;: the dividend allowance is £500 a year, and
          you do not pay tax on any dividend income that falls within
          your Personal Allowance. So on the standard director&apos;s
          package below, the £12,570 salary uses the whole allowance,
          the first £500 of dividends is sheltered by the dividend
          allowance, and the remaining {fmtMoney(EX_MAIN.dividends - 500)} sits inside
          the basic-rate band and pays 10.75% —{" "}
          {fmtMoney(EX_MAIN.dividendTax)} of dividend tax on{" "}
          {fmtMoney(EX_MAIN.dividends)} of dividends.
        </p>
        <ExampleTable
          title="Worked example — a £12,570 salary plus £30,000 of dividends"
          result={EX_MAIN}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The take-home is {fmtMoney(EX_MAIN.takeHomeAnnual)} — and
          none of it was deducted along the way, which is why the
          set-aside line matters: {fmtMoney(EX_MAIN.selfAssessmentSetAsideMonthly)}{" "}
          a month put by covers the January Self Assessment bill. If
          the salary carries a pension sacrifice, or the dividends
          are only part of the income, the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          works the pension side of the same pay packet.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          UK dividend tax rates for 2026/27
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The 2026/27 dividend rates, from GOV.UK&apos;s table for 6
          April 2026 to 5 April 2027 — the basic and higher rates rose
          two percentage points in April 2026, which is why they no
          longer match the 8.75% and 33.75% figures older pages still
          show:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band (2026/27)</th>
                <th className={thClass}>Where the slice lands</th>
                <th className={thClass}>Salary rate</th>
                <th className={thClass}>Dividend rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Personal Allowance</td>
                <td className={tdClass}>
                  The first £12,570 of total income (tapering away over
                  £100,000)
                </td>
                <td className={tdClass}>0%</td>
                <td className={tdClass}>0%</td>
              </tr>
              <tr>
                <td className={tdClass}>Dividend allowance</td>
                <td className={tdClass}>
                  The first £500 of dividends in the taxable stack
                </td>
                <td className={tdClass}>—</td>
                <td className={tdClass}>0%</td>
              </tr>
              <tr>
                <td className={tdClass}>Basic rate</td>
                <td className={tdClass}>
                  Taxable income to £37,700 — total income to £50,270
                  with a full allowance
                </td>
                <td className={tdClass}>20%</td>
                <td className={tdClass}>10.75%</td>
              </tr>
              <tr>
                <td className={tdClass}>Higher rate</td>
                <td className={tdClass}>
                  Taxable income £37,701 to £125,140
                </td>
                <td className={tdClass}>40%</td>
                <td className={tdClass}>35.75%</td>
              </tr>
              <tr>
                <td className={tdClass}>Additional rate</td>
                <td className={tdClass}>Taxable income over £125,140</td>
                <td className={tdClass}>45%</td>
                <td className={tdClass}>39.35%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to calculate tax on dividend income — the stacking order
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Four steps, always in this order. First, add everything
          together — salary, other income, dividends — and take the
          Personal Allowance off the total (reduced over £100,000).
          Second, set the allowance against the salary and other
          income; dividends, as the top slice, get whatever is left.
          Third, take the £500 dividend allowance off the dividends —
          but notice it still occupies band room, so it pushes the
          next dividends up the stack. Fourth, charge each remaining
          slice of dividends at the rate of the band it lands in.
          GOV.UK&apos;s own example runs exactly this way: £29,570 of
          wages leaves £17,000 of taxable wages at 20%, and £3,000 of
          dividends then pays nothing on the first £500 and 10.75% on
          the remaining £2,500 — {fmtMoney(EX_GOVUK.dividendTax)}.
        </p>
        <ExampleTable
          title="Worked example — GOV.UK's own: £29,570 of wages plus £3,000 of dividends"
          result={EX_GOVUK}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The breakdown in the calculator above shows this stacking
          for your own figures — every slice, its band and its rate —
          because the single most common dividend mistake is applying
          the allowance twice, or forgetting that the £500 allowance
          consumes basic-rate band that the salary then cannot use.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much dividend is tax free?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two shelters stack. The Personal Allowance shelters the
          first £12,570 of total income — dividends included, if the
          salary has not used it — and the dividend allowance shelters
          a further £500 of dividends at 0%. With no salary at all,
          £13,070 of dividends arrives completely tax free. With a
          part-time salary the pair still cover a useful amount:
        </p>
        <ExampleTable
          title="Worked example — an £8,000 salary plus £5,070 of dividends: no dividend tax at all"
          result={EX_TAXFREE}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Here the allowance covers the £8,000 salary and £4,570 of
          the dividends, and the £500 dividend allowance covers the
          rest — dividend tax of {fmtMoney(EX_TAXFREE.dividendTax)}.
          Dividends held inside an ISA are outside all of this: they
          are never taxable and never use either allowance.
        </p>
      </section>

      <section className="space-y-5 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is it better to take dividends or salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The honest answer is a search, not a slogan. Salary is
          deducted before Corporation Tax but carries employer NI at
          15% over £5,000 and employee NI on top; dividends escape NI
          and pay lower personal rates, but they are paid out of
          profit that has already borne Corporation Tax — and a
          salary the company cannot afford is not a saving at all.
          The optimiser mode in the calculator tests salaries from
          £5,000 to £50,270 against the profit, running the whole loop
          on each — salary and employer NI out, Corporation Tax on
          the rest, the remainder as dividends, personal tax on the
          pair. On {fmtMoney(EX_OPT.profit)} of profit it tests{" "}
          {EX_OPT.evaluatedCount} salary points; the best three:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Salary</th>
                <th className={thClass}>Employer NI</th>
                <th className={thClass}>Corporation Tax</th>
                <th className={thClass}>Dividends</th>
                <th className={thClass}>Personal tax</th>
                <th className={thClass}>You keep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EX_OPT.topSplits.map((s, i) => (
                <tr
                  key={s.salary}
                  className={
                    i === 0
                      ? "font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>
                    {fmtMoney(s.salary)}
                    {i === 0 ? " — best" : ""}
                  </td>
                  <td className={tdClass}>{fmtMoney(s.employerNi)}</td>
                  <td className={tdClass}>{fmtMoney(s.corporationTax)}</td>
                  <td className={tdClass}>{fmtMoney(s.dividends)}</td>
                  <td className={tdClass}>{fmtMoney(s.personalTax)}</td>
                  <td className={tdClass}>{fmtMoney(s.takeHome)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The winning salary is {fmtMoney(EX_OPT.best.salary)} —
          exactly the Personal Allowance, so the salary itself pays
          no Income Tax and no employee NI, while still counting as a
          year towards the State Pension. It keeps{" "}
          {fmtMoney(EX_OPT.best.takeHome)} of the{" "}
          {fmtMoney(EX_OPT.profit)}. Contractors weighing the same
          question against an umbrella company will find the{" "}
          <Link href="/umbrella-company-calculator" className={linkClass}>
            umbrella company calculator
          </Link>{" "}
          and the{" "}
          <Link href="/ir35-calculator" className={linkClass}>
            IR35 calculator
          </Link>{" "}
          cover the employed side of that comparison.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When dividends reach the higher rate
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A salary in the higher band leaves no basic-rate room at
          all: every dividend after the £500 allowance is charged at
          35.75% from the first pound. The dividend tax jumps out of
          proportion to the dividends — on the example below,{" "}
          {fmtMoney(EX_HIGHER.dividends)} of dividends carries{" "}
          {fmtMoney(EX_HIGHER.dividendTax)} of tax, an effective rate
          of just under 35%, against 10.75% when the same dividends
          sit in the basic band.
        </p>
        <ExampleTable
          title="Worked example — a £60,000 salary plus £20,000 of dividends"
          result={EX_HIGHER}
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Dividends over £100,000: the Personal Allowance taper
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Dividends count in full towards the £100,000 line. Past it,
          the Personal Allowance is withdrawn at £1 for every £2 of
          extra income, so dividends in the £100,000–£125,140 zone
          drag allowance into tax behind them; by £125,140 the
          allowance is gone and the top slices of dividends pay the
          39.35% additional rate.
        </p>
        <ExampleTable
          title="Worked example — a £110,000 salary plus £20,000 of dividends"
          result={EX_TAPER}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Here the dividend stack starts at £110,000 of taxable
          income: after the £500 allowance, £14,640 of dividends pays
          35.75% up to the £125,140 line and £4,860 pays 39.35% above
          it — {fmtMoney(EX_TAPER.dividendTax)} in all. A pension
          contribution that brings total income back under £100,000
          restores the allowance, which is the one lever that changes
          this picture rather than just timing it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Set aside monthly: Self Assessment and the payment dates
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Nothing is deducted from a dividend when it is paid, so the
          tax arrives as one January bill unless you save for it. The
          set-aside on this page is the dividend tax plus any student
          loan — the two amounts PAYE never touches. With a Plan 2
          loan, the £12,570-plus-£30,000 package owes{" "}
          {fmtMoney(EX_LOAN.studentLoan)} of loan repayments on top of
          its dividend tax, because the loan is charged on the total
          income through Self Assessment even though no employer ever
          deducted it; the set-aside rises to{" "}
          {fmtMoney(EX_LOAN.selfAssessmentSetAsideMonthly)} a month.
          The dates to work to: register by 5 October after the tax
          year, pay the balancing amount by 31 January, and expect
          payments on account on 31 January and 31 July. For dividends
          up to £10,000, GOV.UK offers a lighter route — tell HMRC and
          the tax can be collected through your tax code instead,
          which the{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            tax code checker
          </Link>{" "}
          helps you read when it changes. The{" "}
          <Link
            href="/student-loan-repayment-calculator"
            className={linkClass}
          >
            student loan repayment calculator
          </Link>{" "}
          works through plans and thresholds on a single income.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scotland: the dividend rates and the £500 allowance on this
          page are UK-wide — dividend tax is not devolved. The salary
          underneath is worked on the England, Wales and Northern
          Ireland bands; Scotland sets its own bands for earnings, so
          a Scottish taxpayer&apos;s salary tax differs while the
          dividend tax on the same dividends is identical.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 23
          November 2026 — the dividend allowance (£500), the 2026/27
          dividend rates (10.75%, 35.75%, 39.35%), the stacking order
          and GOV.UK&apos;s own worked example from &ldquo;Tax on
          dividends&rdquo;; the Personal Allowance and its £100,000
          taper and the Class 1 thresholds from HMRC&apos;s rates and
          allowances and &ldquo;Rates and thresholds for employers
          2026 to 2027&rdquo;; the Corporation Tax rates and Marginal
          Relief in the optimiser from &ldquo;Corporation Tax rates,
          expenses and reliefs&rdquo;. The optimiser assumes one
          company with no associates, a 12-month accounting period,
          no other income and all after-tax profit paid out as
          dividends in the same year. This page is a working tool and
          a guide, not tax or financial advice.
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

      <RelatedCalculators href="/dividend-tax-calculator" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
