import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CorporationTaxCalculator from "@/components/CorporationTaxCalculator";
import {
  buildTaxableProfit,
  calculateCorporationTax,
  corporationTaxDates,
  formatGbDate,
  type CorporationTaxResult,
} from "@/lib/corporation-tax";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/corporation-tax-calculator",
  "Corporation Tax Calculator UK — 19%, 25% & Marginal Relief 2026/27",
  "Free UK Corporation Tax calculator for 2026/27 — 19% to £50,000, 25% from £250,000, Marginal Relief in between with the formula shown, limits divided by your associated companies, a taxable-profit builder, your payment and CT600 deadlines, and the monthly amount to set aside. The same calculator answers the limited company tax question: it is the same tax.",
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

function fmtWhole(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// The worked examples further down the page — every one computed
// by the same engine the calculator above runs, so the page can
// never disagree with itself.
const EX_50K = calculateCorporationTax({ profit: 50000 });
const EX_80K = calculateCorporationTax({ profit: 80000 });
const EX_100K = calculateCorporationTax({ profit: 100000 });
const EX_300K = calculateCorporationTax({ profit: 300000 });
const EX_ASSOC = calculateCorporationTax({
  profit: 80000,
  associatedCompanies: 2,
});
const EX_FOUR = calculateCorporationTax({
  profit: 62500,
  associatedCompanies: 4,
});
const EX_BUILDER_INPUT = {
  accountingProfit: 95000,
  addBackEntertaining: 2400,
  addBackDepreciation: 6000,
  capitalAllowances: 9400,
  lossesBroughtForward: 4000,
};
const EX_BUILDER = buildTaxableProfit(EX_BUILDER_INPUT);
const EX_BUILDER_CT = calculateCorporationTax({
  profit: EX_BUILDER.taxableProfit,
});
const EX_DATES = corporationTaxDates("2026-03-31", 80000);

const REGIME_LABEL: Record<CorporationTaxResult["regime"], string> = {
  small: "Small profits rate (19%)",
  marginal: "Marginal Relief band",
  main: "Main rate (25%)",
};

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I calculate my corporation tax?",
    answer:
      "In three steps. One: work out the taxable profit — not the profit in the accounts, and never the turnover. Add back costs the tax rules disallow (client entertaining, depreciation), then take off capital allowances, losses and reliefs. Two: find your band. Taxable profit of £50,000 or less pays 19%; £250,000 or more pays 25%; in between, charge 25% and give Marginal Relief back — (upper limit − profit) × 3/200. Three: divide both limits by the number of associated companies first if you have any. On £100,000 of taxable profit with no associated companies: £25,000 at 25% less £2,250 of Marginal Relief = £22,750.",
  },
  {
    question: "Is corporation tax 25% now?",
    answer:
      "Only for companies with taxable profits over £250,000. Since April 2023 there have been two rates: 19% (the small profits rate) on profits of £50,000 or less, and 25% (the main rate) above £250,000, with Marginal Relief tapering the rate between the two — so a company on £80,000 pays an effective 21.81%, not 25%. The limits are shared: with one associated company they halve to £25,000 and £125,000, so a second company can pull you into the higher rates much sooner than the headline figures suggest.",
  },
  {
    question: "How much corporation tax do you pay on £50k?",
    answer: `${fmtMoney(EX_50K.tax)} — a company with taxable profits of exactly £50,000 and no associated companies pays the 19% small profits rate on the whole amount, and keeps ${fmtMoney(EX_50K.profitAfterTax)}. Two warnings hide in that answer: the £50,000 is taxable profit (after allowances and losses), not the profit in the accounts; and if the company has even one associated company, the limit halves to £25,000 and the same £50,000 of profit pays £11,375 — £12,500 at the main rate less Marginal Relief of £1,125 at the divided limits. The calculator above shows both versions.`,
  },
  {
    question: "Is corporation tax calculated on turnover or profit?",
    answer:
      "Profit — always profit, and a specific kind of profit: taxable profit. Turnover is never taxed directly. A company with £500,000 of sales and £40,000 of taxable profit pays 19% of £40,000 (£7,600); a company with the same sales and £240,000 of taxable profit pays over £55,000. That is also why two companies with identical accounts profit can owe different tax: the one that claimed its capital allowances, or carried losses forward, has a lower taxable profit. The “Build my taxable profit” tab in the calculator walks the bridge from the accounts figure to the taxable one.",
  },
  {
    question: "Which companies are taxed at 25%?",
    answer:
      "Companies whose taxable profits reach their main-rate limit: £250,000 for a company on its own, less for companies with associates, because the limit is divided between them. Companies in the band below pay 25% on paper too, but Marginal Relief hands part of it back, so their effective rate lands between 19% and 25% — 21.81% at £80,000, 22.75% at £100,000. A few kinds of profit sit outside this structure entirely: ring fence profits from oil extraction have their own rates, and close investment holding companies cannot claim Marginal Relief.",
  },
  {
    question: "How do I reduce my Corporation Tax?",
    answer:
      "With the reliefs and deductions the rules actually give you. The main ones: claim every allowable running cost and your capital allowances (the Annual Investment Allowance covers most equipment in full); make employer pension contributions, which are deductible — inside the Marginal Relief band each £1 of contribution saves 26.5p, the highest rate anywhere in the system; claim R&D relief if the work qualifies; use losses properly, carrying them forward or back; and pay a director's salary, which is a deductible cost, as part of a salary-and-dividend mix. Timing helps too — bringing a planned purchase or pension payment into the current accounting period reduces this year's profit, not next year's.",
  },
  {
    question: "How do I avoid 25% corporation tax?",
    answer:
      "Legally, there are only three honest routes, and none of them is a scheme. First, be under the limit: profits of £50,000 or less (your share of it, with associates) pay 19% — pension contributions and brought-forward purchases are how directors genuinely get there. Second, use Marginal Relief: in the band the rate is already tapered, and every £1 of profit removed saves 26.5p. Third, claim the reliefs — capital allowances, R&D, losses — that reduce taxable profit itself. Anything promising to make the tax disappear for a fee is not planning; HMRC treats marketed avoidance as evasion risk, and the bill, interest and penalties come back to the company.",
  },
  {
    question: "When am I due to pay Corporation Tax?",
    answer: `Nine months and one day after your accounting period ends — and the return is due later, so you pay before you file. For a period ending 31 March 2026, the tax is due by ${formatGbDate(EX_DATES.paymentDeadline)} and the Company Tax Return (CT600) by ${formatGbDate(EX_DATES.filingDeadline)}. Companies with taxable profits over £1.5 million do not get the single date: they pay in quarterly instalments starting in the seventh month of the accounting period. Late payment accrues interest; a late return draws fixed penalties from the first day, even when no tax is owed.`,
  },
  {
    question: "Do small businesses have to pay Corporation Tax?",
    answer:
      "Limited companies do, whatever their size — there is no small-company exemption and no tax-free threshold; the first £50,000 of taxable profit is simply charged at the lower 19% rate instead of 25%. A company with no taxable profit owes no Corporation Tax, but it usually still has to file a Company Tax Return if HMRC sends a notice to deliver one. Sole traders and ordinary partnerships are different: they never pay Corporation Tax at all — the owners pay Income Tax on the profits through Self Assessment instead.",
  },
  {
    question: "How to calculate tax for a limited company?",
    answer:
      "It is this calculator. A limited company's tax on its profits is Corporation Tax — there is no separate “limited company tax”. You take the company's taxable profit for its accounting period, apply 19% up to £50,000, 25% from £250,000 and Marginal Relief between the two, dividing the limits if the company has associates. The company's other taxes sit around that: employer National Insurance on salaries, VAT on sales if it is registered, and the directors' own Income Tax on what they take out — which is a separate calculation, covered by the dividend tax calculator.",
  },
  {
    question: "Do ltd companies pay less tax than sole traders?",
    answer:
      "Often, but not automatically — it depends on the profit and how the money is taken out. A sole trader pays Income Tax at 20%, 40% or 45% plus Class 4 National Insurance on the whole profit. A limited company pays 19% Corporation Tax on profits up to £50,000, but the director then pays personal tax on salary and dividends as the money comes out — at the dividend rates, with no National Insurance on dividends. At modest profits taken out steadily, the company usually wins by a few points; at higher profits, or where the money stays in the company, the gap widens. The dividend tax calculator's optimiser runs the full comparison for a given profit.",
  },
  {
    question: "How do I pay myself as a ltd company director?",
    answer:
      "Usually a small salary through payroll plus dividends from the after-tax profit. The salary is a cost the company deducts before Corporation Tax (and it secures a State Pension year), while dividends are paid out of profit that has already borne Corporation Tax, carry no National Insurance, and are taxed personally at 10.75%, 35.75% or 39.35% after a £500 allowance. The best split is a search, not a rule of thumb: on £50,000 of profit the winning salary is usually the £12,570 Personal Allowance. The dividend tax calculator on this site has an optimiser that tests the splits against your profit, Corporation Tax included.",
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
  name: "Corporation Tax Calculator UK",
  url: `${AppConfig.siteUrl}/corporation-tax-calculator`,
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
}: {
  title: string;
  result: CorporationTaxResult;
}) {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Taxable profit", value: fmtMoney(result.profit) },
    {
      label: "Limits used (19% up to · 25% from)",
      value: `${fmtWhole(result.smallProfitsLimit)} · ${fmtWhole(result.mainRateLimit)}${
        result.associatedCompanies > 1
          ? ` — divided by ${result.associatedCompanies} associated companies`
          : ""
      }`,
    },
    { label: "Band", value: REGIME_LABEL[result.regime] },
    ...(result.regime === "marginal"
      ? [
          {
            label: "Tax at the 25% main rate",
            value: fmtMoney(result.profit * 0.25),
          },
          {
            label: `Marginal Relief — (${fmtWhole(result.mainRateLimit)} − ${fmtWhole(result.profit)}) × 3/200`,
            value: `−${fmtMoney(result.marginalRelief)}`,
          },
        ]
      : []),
    {
      label: "Corporation Tax",
      value: fmtMoney(result.tax),
      strong: true,
    },
    {
      label: "Effective rate",
      value: `${result.effectiveRatePercent.toFixed(2)}%`,
    },
    { label: "Profit after tax", value: fmtMoney(result.profitAfterTax) },
    {
      label: "Set aside a month",
      value: fmtMoney(result.monthlySetAside),
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

export default function CorporationTaxCalculatorPage() {
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
          Corporation Tax Calculator UK
        </h1>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          {/* Answer-first summary (40–60 words). */}
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Corporation Tax is charged on your company&apos;s taxable
            profit — not its turnover. For 2026/27, profits of £50,000
            or less pay 19%, profits of £250,000 or more pay 25%, and
            profits in between get Marginal Relief, which tapers the
            rate gradually. Associated companies share those limits.
          </p>
        </div>
      </section>

      <CorporationTaxCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this corporation tax calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators (payrollcalc.co.uk) is a free hub of
          UK pay and tax calculators, built on the rules published by
          GOV.UK and HMRC — no sign-up, no accounts, and every figure
          worked out in your browser. If you already know your taxable
          profit, enter it and the calculator applies the right band,
          divides the limits by your associated companies, and shows
          the bill, the effective rate, the profit left after tax and
          your two deadlines. If you do not — most directors do not —
          switch to the builder tab and start from the profit in your
          accounts; it walks the adjustments HMRC makes before the
          tax is charged. When the company side is settled, the{" "}
          <Link href="/dividend-tax-calculator" className={linkClass}>
            dividend tax calculator
          </Link>{" "}
          works the personal side of the same profit, including the
          salary-and-dividend mix that leaves you the most.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do I calculate my corporation tax?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three steps. First, the taxable profit (the next section
          but one shows how it differs from the accounts). Second, the
          band: 19% at or below the small profits limit, 25% at or
          above the main rate limit. Third, between the limits, the
          Marginal Relief formula — charge the whole profit at 25%,
          then give back (upper limit − profit) × 3/200. On £100,000
          that is £25,000 of tax less (£250,000 − £100,000) × 3/200 =
          £2,250 of relief:
        </p>
        <ExampleTable
          title="Worked example — £100,000 of taxable profit, no associated companies"
          result={EX_100K}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The relief is why there is no cliff edge at £50,000: the
          effective rate climbs smoothly — 19% at £50,000,{" "}
          {EX_80K.effectiveRatePercent.toFixed(2)}% at £80,000,{" "}
          {EX_100K.effectiveRatePercent.toFixed(2)}% at £100,000 —
          reaching 25% only at £250,000. Inside the band, though,
          each extra £1 of profit carries 26.5p of tax (25p of main
          rate plus 1.5p of relief withdrawn), the highest marginal
          rate in the Corporation Tax system.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Corporation Tax rates for 2026/27
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The rates from GOV.UK&apos;s &ldquo;Corporation Tax rates,
          expenses and reliefs&rdquo;, in its own words: &ldquo;If
          your company made more than £250,000 profit, you&apos;ll pay
          the main rate of Corporation Tax&rdquo;, and &ldquo;If your
          company made a profit of £50,000 or less, you&apos;ll pay
          the &lsquo;small profits rate&rsquo;, which is 19%&rdquo;.
          GOV.UK also states the point most summaries drop: the
          £50,000 and £250,000 thresholds &ldquo;are proportionately
          reduced for short accounting periods and by the total
          number of &lsquo;associated companies&rsquo; your company
          has&rdquo;.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Taxable profit (2026/27)</th>
                <th className={thClass}>Rate</th>
                <th className={thClass}>How it is charged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Up to £50,000</td>
                <td className={tdClass}>19%</td>
                <td className={tdClass}>
                  The small profits rate on the whole profit
                </td>
              </tr>
              <tr>
                <td className={tdClass}>£50,001 to £250,000</td>
                <td className={tdClass}>19% rising to 25%</td>
                <td className={tdClass}>
                  25% less Marginal Relief of (upper limit − profit) ×
                  3/200 — a 26.5% marginal rate on each extra £1
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Over £250,000</td>
                <td className={tdClass}>25%</td>
                <td className={tdClass}>
                  The main rate on the whole profit
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          At the top of the structure the arithmetic is plain:{" "}
          {fmtWhole(EX_300K.profit)} of profit pays{" "}
          {fmtMoney(EX_300K.tax)} — a flat 25%, with no relief left to
          give back.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is Corporation Tax 25% now?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          For most limited companies, no — 25% is the headline, not
          the bill. A company at the small profits limit pays 19% on
          everything:
        </p>
        <ExampleTable
          title="Worked example — £50,000 of taxable profit: the 19% band in full"
          result={EX_50K}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          And a company in the taper pays something in between. The
          £80,000 example below is the figure the best-known
          competitor calculator shows for the same profit — the
          engines agree to the penny:
        </p>
        <ExampleTable
          title="Worked example — £80,000 of taxable profit: Marginal Relief at work"
          result={EX_80K}
        />
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Taxable profit is not the profit in your accounts
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Corporation Tax is charged on profit, never on turnover —
          but not the profit your accounts show. Some costs the
          accounts deducted are added back: GOV.UK names entertaining
          clients as &ldquo;specifically disallowed&rdquo;, and
          depreciation comes out because capital costs are relieved
          through capital allowances instead. Losses brought forward
          and reliefs such as R&amp;D relief then come off. The
          builder tab in the calculator walks the whole bridge; here
          it is with round numbers:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EX_BUILDER.steps.map((s) => (
                <tr
                  key={s.label}
                  className={
                    s.kind === "result"
                      ? "font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className={tdClass}>{s.label}</td>
                  <td className={tdClass}>
                    {s.kind === "start" || s.kind === "result"
                      ? fmtMoney(s.amount)
                      : `${s.amount >= 0 ? "+" : "−"} ${fmtMoney(Math.abs(s.amount))}`}
                  </td>
                </tr>
              ))}
              <tr>
                <td className={tdClass}>
                  Corporation Tax on {fmtWhole(EX_BUILDER_CT.profit)} —
                  25% less Marginal Relief of{" "}
                  {fmtMoney(EX_BUILDER_CT.marginalRelief)}
                </td>
                <td className={`${tdClass} font-semibold`}>
                  {fmtMoney(EX_BUILDER_CT.tax)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The accounts said {fmtWhole(EX_BUILDER.accountingProfit)};
          the tax is charged on {fmtWhole(EX_BUILDER.taxableProfit)}.
          Skipping the bridge — typing the accounts figure straight
          into a calculator — is the single most common Corporation
          Tax mistake, and it cuts both ways: miss the add-backs and
          you understate the bill, miss the allowances and losses and
          you overstate it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Limited company tax calculator — the same tax, answered
          directly
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Searches for a &ldquo;limited company tax calculator&rdquo;
          are looking for this page&apos;s tax: a limited
          company&apos;s tax on its profits is Corporation Tax, and
          there is no second, separate charge. The company pays 19%,
          25% or the tapered rate between them on its taxable profit
          for the accounting period, exactly as the calculator above
          works it. What a limited company does not pay is Income Tax
          on its profits — that falls on the director personally, on
          the salary and dividends taken out, which is why the two
          calculators on this site are built to be used together: this
          one settles what the company owes, and the{" "}
          <Link href="/dividend-tax-calculator" className={linkClass}>
            dividend tax calculator
          </Link>{" "}
          settles what the director keeps — its optimiser runs both
          sides of the loop at once. Contractors deciding between a
          limited company and an umbrella will also want the{" "}
          <Link href="/ir35-calculator" className={linkClass}>
            IR35 calculator
          </Link>
          , and any company taking on staff can price the salary
          before it is promised with the{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Associated companies: your limits are shared
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two companies are associated when one controls the other,
          or both are under the control of the same person or people
          — control in the close-company sense: broadly, more than
          half of the shares, the voting power, the income on a
          distribution or the assets on a winding up. It catches the
          director with two unrelated companies of their own just as
          much as a parent and its subsidiary, and a company counts
          even if it was associated for only part of the period. Two
          kinds are left out: a company that carried on no trade or
          business at any time in the period — a genuinely dormant
          company — is disregarded, and so is a passive holding
          company that meets strict conditions (no trade, holding
          only shares in its 51% subsidiaries, passing dividends
          straight through). GOV.UK&apos;s Marginal Relief guidance
          gives the arithmetic: a company with 3 other associated
          companies divides its limits by 4 — £12,500 and{" "}
          {fmtWhole(EX_FOUR.mainRateLimit)}. The cost is real, as the
          same £80,000 shows with just one associate:
        </p>
        <ExampleTable
          title="Worked example — £80,000 of taxable profit with one associated company (2 in total)"
          result={EX_ASSOC}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One extra company costs {fmtMoney(EX_ASSOC.tax - EX_80K.tax)}{" "}
          on identical profits, because the profit now overshoots the
          halved small profits limit and most of it sits in the taper.
          Splitting one business into several companies never
          multiplies the 19% band — sharing the limits is precisely
          what the rule exists to prevent.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When do I pay Corporation Tax?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two dates, and the earlier one is the payment. Corporation
          Tax is due 9 months and 1 day after the accounting period
          ends; the Company Tax Return (the CT600) is due 12 months
          after it ends — you pay before you file. For a period
          ending 31 March 2026 that is pay by{" "}
          {formatGbDate(EX_DATES.paymentDeadline)} and file by{" "}
          {formatGbDate(EX_DATES.filingDeadline)}. Enter your own
          period end in the calculator and both dates are worked out
          for you. Three traps sit around the dates: late payment
          accrues interest from the due date; a late return draws
          fixed penalties from the first day, even when the company
          owes nothing; and companies with taxable profits over £1.5
          million leave this timetable entirely — they pay in
          quarterly instalments, the first in the seventh month of
          the accounting period, and the £1.5 million threshold is
          itself divided between the companies in a 51% group. The
          monthly set-aside in the calculator —{" "}
          {fmtMoney(EX_80K.monthlySetAside)} a month on the £80,000
          example — exists so the payment date never arrives as a
          surprise.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to reduce your Corporation Tax bill — the legal routes
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every genuine route works the same way: it reduces taxable
          profit, or moves profit into a cheaper band. Claim the
          running costs the business actually incurred and the
          capital allowances on its equipment — the Annual Investment
          Allowance writes off most plant and machinery in full in
          the year of purchase. Make employer pension contributions:
          they are a deductible cost, and inside the Marginal Relief
          band they save 26.5p per £1, more than anywhere else in the
          system; the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          shows the employee side of the same pension pound. Claim
          R&amp;D relief where the work qualifies, carry losses
          forward (or back, where the rules allow), and time planned
          spending into the period where the profit needs reducing. A
          director&apos;s salary is deductible too, which is part of
          why the salary-and-dividend mix beats taking everything one
          way. What is not on this list: anything sold as a way to
          make the tax vanish. The routes above are reliefs Parliament
          created on purpose; marketed schemes that promise more are
          where directors end up repaying the tax with interest and
          penalties on top.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What the profit is for next
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The profit after tax — {fmtMoney(EX_80K.profitAfterTax)} on
          the £80,000 example — is the number everything else hangs
          off. It is the ceiling on dividends: a company can only pay
          dividends out of accumulated after-tax profits, so the
          Corporation Tax bill fixes the director&apos;s dividend
          capacity for the year. Profit left in the company instead
          is retained profit — next year&apos;s working capital,
          buffer or purchase fund, already taxed and ready. The
          natural next step is the{" "}
          <Link href="/dividend-tax-calculator" className={linkClass}>
            dividend tax calculator
          </Link>
          : feed it the salary and the dividends this profit can
          support, or give its optimiser the profit itself and let it
          find the split — company tax, personal tax and all — that
          leaves the most in your pocket.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 23
          November 2026 — the 19% small profits rate, the 25% main
          rate and the divided £50,000/£250,000 limits from
          &ldquo;Corporation Tax rates, expenses and reliefs&rdquo;;
          the Marginal Relief formula and the rule that limits are
          reduced by the number of associated companies from
          &ldquo;Marginal Relief for Corporation Tax&rdquo;; client
          entertaining as a specifically disallowed expense and
          capital allowances from the same rates page; the payment
          deadline (9 months and 1 day) and the filing deadline (12
          months) from &ldquo;Company Tax Returns&rdquo; and
          &ldquo;Accounts and tax returns for private limited
          companies&rdquo;. The calculator models a 12-month
          accounting period and standard Marginal Relief (augmented
          profits equal to taxable profits — no franked investment
          income). Short periods reduce the limits pro-rata. This
          page is a working tool and a guide, not tax or financial
          advice.
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

      <RelatedCalculators href="/corporation-tax-calculator" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
