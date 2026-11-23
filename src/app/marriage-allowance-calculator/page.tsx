import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import MarriageAllowanceCalculator from "@/components/MarriageAllowanceCalculator";
import { calculateMarriageAllowance } from "@/lib/marriage-allowance";
import { MARRIAGE_ALLOWANCE } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/marriage-allowance-calculator",
  "Marriage Allowance Calculator UK 2026/27 — Save up to £252 a Year",
  "Free Marriage Allowance calculator: enter both incomes to check whether you qualify, how much you would save as a couple, and what backdating to 2022/23 could add — on the 2026/27 rules.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Worked examples — computed by the same function the tool above
// runs, so the page can never disagree with itself.
const exFull = calculateMarriageAllowance({
  incomeA: 8000,
  incomeB: 35000,
  region: "EWNI",
  backdateYears: 4,
});

const exGov = calculateMarriageAllowance({
  incomeA: 11500,
  incomeB: 20000,
  region: "EWNI",
  backdateYears: 0,
});

const exPartial = calculateMarriageAllowance({
  incomeA: 12000,
  incomeB: 20000,
  region: "EWNI",
  backdateYears: 0,
});

const EXAMPLE_ROWS = [
  {
    label: "One partner not working, the other on £35,000",
    lower: 8000,
    higher: 35000,
    result: exFull,
  },
  {
    label: "Part-time £11,500, partner on £20,000 (GOV.UK's own example incomes)",
    lower: 11500,
    higher: 20000,
    result: exGov,
  },
  {
    label: "Part-time £12,000, partner on £20,000",
    lower: 12000,
    higher: 20000,
    result: exPartial,
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Marriage Allowance worth?",
    answer:
      "Up to £252 a year. The lower earner transfers £1,260 of their Personal Allowance to their partner, and the partner's tax bill falls by 20% of that amount — £252 — in every tax year the claim runs. It renews automatically each year until you cancel it or your circumstances change.",
  },
  {
    question: "Is Marriage Allowance automatic?",
    answer:
      "No — and this is the point most eligible couples miss. HMRC never applies Marriage Allowance automatically, however clearly you qualify: nothing happens until the lower earner makes a claim, and couples who never claim simply never receive it, even though HMRC holds both partners' income records. What is automatic is what happens after a successful claim: the allowance then transfers every year, through the tax codes, until you cancel it, your income changes take you outside the conditions, or the marriage or civil partnership ends.",
  },
  {
    question: "Who can claim Marriage Allowance?",
    answer:
      "Couples who are married or in a civil partnership — living together is not enough — where one partner's income is below the £12,570 Personal Allowance and the other pays basic-rate tax: income between £12,571 and £50,270 in England, Wales and Northern Ireland, or between £12,571 and £43,662 in Scotland. Both partners must have been born on or after 6 April 1935; couples where one partner was born before that date may do better with Married Couple's Allowance instead.",
  },
  {
    question: "How far back can I backdate a Marriage Allowance claim?",
    answer:
      "Four tax years — a claim made in 2026/27 can reach back to 2022/23. The Personal Allowance and the £1,260 transfer were the same in each of those years, so a couple who qualified throughout could receive £252 × 4 = £1,008 for the backdated years as a lump sum, plus £252 for the current year: £1,260 in all. The window closes year by year — the 2022/23 claim must be made by 5 April 2027.",
  },
  {
    question: "I earn between £11,310 and £12,570. Is it still worth claiming?",
    answer: `Usually, yes — but the saving shrinks, and this is the case most headline figures skip. Transferring £1,260 cuts your own allowance to £11,310, so you start paying tax on your income above £11,310. On £12,000 that extra tax is ${fmtMoney(exPartial.transferorExtraTax)}, against your partner's ${fmtMoney(exPartial.recipientSaving)} saving — a net ${fmtMoney(exPartial.netAnnualSaving)} a year for the couple. The calculator above works this case properly instead of just quoting £252.`,
  },
  {
    question: "What happens to our tax codes?",
    answer:
      "HMRC changes both. The partner receiving the allowance usually goes onto tax code 1383M (the M shows they receive Marriage Allowance), and the partner who transferred it goes onto 1131N (the N shows they gave it up). The backdated years are not handled through the tax code — they are paid as a lump sum, by cheque or bank transfer.",
  },
  {
    question: "Can pensioners claim Marriage Allowance?",
    answer:
      "Yes. Income means all taxable income, including the State Pension and private pensions — a retired partner whose pension income is below £12,570 can transfer the allowance to a partner who is still working and paying basic-rate tax, and a working partner's pension income counts the same way. The conditions are about income levels, not about being of working age.",
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
  name: "Marriage Allowance Calculator",
  url: `${AppConfig.siteUrl}/marriage-allowance-calculator`,
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

export default function MarriageAllowanceCalculatorPage() {
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
          Marriage Allowance Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If one of you earns less than the £12,570 Personal
          Allowance and the other pays basic-rate tax, the lower
          earner can transfer £1,260 of allowance across and cut the
          couple&apos;s tax by up to £252 a year — backdatable to
          2022/23. Enter both incomes and this calculator checks
          whether you qualify, and what you would really save.
        </p>
      </section>

      <MarriageAllowanceCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this Marriage Allowance calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This calculator is part of UK Payroll Calculators, a free
          hub of UK payroll calculators built on the April 2026
          rules — no sign-up, no accounts, and every figure worked
          out in your browser. Enter each partner&apos;s gross
          annual income from all sources — wages, pensions,
          self-employment — in either order; the tool works out who
          would transfer and who would receive. Then choose how many
          earlier years to backdate over. Unlike a headline check,
          it works both sides of the transfer: what the higher
          earner saves, and the extra tax the lower earner may start
          paying, so the figure it shows is the couple&apos;s real
          position.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How Marriage Allowance works
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every UK taxpayer has a Personal Allowance — £12,570 of
          income free of tax in 2026/27. A partner who does not use
          all of theirs can elect to transfer a fixed slice, £1,260
          (10% of the allowance, rounded), to their husband, wife or
          civil partner. The transfer is all-or-nothing: you cannot
          transfer part of the £1,260. The receiving partner&apos;s
          tax bill then falls by 20% of the transfer — up to £252 —
          given through their tax code if they are employed. The
          transferring partner&apos;s own allowance falls to
          £11,310, which is where the catch sits: a lower earner
          with income between £11,310 and £12,570 starts paying tax
          on the slice above £11,310, and that comes off the
          couple&apos;s saving. GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/marriage-allowance"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Marriage Allowance guide
          </a>{" "}
          sets the rules this calculator follows.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Couple
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Higher earner saves
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Lower earner pays
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Net saving a year
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EXAMPLE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {row.label}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.recipientSaving)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.transferorExtraTax)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.netAnnualSaving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The middle row is GOV.UK&apos;s own worked example: on
          £11,500 the lower earner pays no tax before the claim, and{" "}
          {fmtMoney(exGov.transferorExtraTax)} after it — tax on the
          £190 above £11,310 — while their partner saves the full{" "}
          {fmtMoney(exGov.recipientSaving)}. The couple is{" "}
          {fmtMoney(exGov.netAnnualSaving)} a year better off, not
          £252. Any calculator that quotes £252 for every couple is
          skipping half the calculation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Backdating: up to four earlier years
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A claim made now can include any tax year back to 2022/23
          in which you were eligible. The Personal Allowance and
          the £1,260 transfer were the same in each of those years,
          so each backdated year is worth up to £252 — £1,008 for
          the four years, paid as a lump sum, on top of the current
          year&apos;s saving. The years fall away one by one: the
          2022/23 year can only be claimed until 5 April 2027.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Tax year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Maximum saving
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Claim by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MARRIAGE_ALLOWANCE.backdateYears.map((y) => (
                <tr key={y.label}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {y.label}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(y.maxSaving)}</td>
                  <td className="px-4 py-2">{y.claimDeadline}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  2026/27 (current year)
                </td>
                <td className="px-4 py-2">{fmtMoney(MARRIAGE_ALLOWANCE.maxSaving)}</td>
                <td className="px-4 py-2">Claim runs on automatically once made</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The backdated figures assume your incomes were much the
          same in those years. If one of you earned more in an
          earlier year — enough to break either condition — that
          year does not qualify, and the claim for it will simply
          not pay out.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Scotland, tax codes and the older allowance
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Scotland sets its own income tax bands, so the receiving
          partner there must pay the starter, basic or intermediate
          rate — in practice an income between £12,571 and £43,662.
          The transfer itself is the same £1,260 and the maximum
          saving the same £252; a Scottish lower earner&apos;s extra
          tax on the slice above £11,310 is charged at the 19%
          starter rate rather than 20%. After a successful claim
          HMRC usually moves the receiving partner to tax code{" "}
          {MARRIAGE_ALLOWANCE.recipientTaxCode} and the transferring
          partner to {MARRIAGE_ALLOWANCE.transferorTaxCode} — the{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            tax code checker
          </Link>{" "}
          explains what the letters and numbers mean. One separate
          case: if either partner was born before 6 April 1935, the
          older Married Couple&apos;s Allowance may be worth more —
          the two allowances cannot be claimed together, so check
          that route on GOV.UK before electing for Marriage
          Allowance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to claim — free, through GOV.UK
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          On timing: you can claim at any point — there is no need
          to wait for a new tax year — and a claim for the current
          year takes effect through the two tax codes for the rest
          of that year. The claim then runs on by itself: once made,
          it continues every tax year until you cancel it or your
          circumstances take you out of the conditions, so there is
          nothing to renew. The backdated years work to fixed
          deadlines instead — each year in the table above closes on
          its own 5 April, and a year claimed in time is paid as a
          single lump sum, separate from the tax code changes. The
          one timescale that costs money is delay itself: every
          5 April that passes removes the oldest year from the
          table, £252 at a time.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The lower earner makes the claim, online through GOV.UK,
          and it costs nothing. You will need both partners&apos;
          National Insurance numbers and the date of the marriage or
          civil partnership. Once approved, the allowance transfers
          automatically every year until you cancel it, your income
          changes take you out of the conditions, or the
          relationship ends. Claims for earlier years are made on
          the same service or by post for some backdated cases, and
          are paid as a lump sum. Never pay a claims company to do
          this for you: the application is the same form, and those
          firms typically keep a large share of the refund as their
          fee. If either partner completes a Self Assessment return,
          the claim can also be made through the return. To see
          what the transfer does to a monthly payslip, run the
          higher earner&apos;s salary through the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          with tax code {MARRIAGE_ALLOWANCE.recipientTaxCode}, or
          check a salary&apos;s full after-tax position in the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rules used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  How it is worked out
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Amount transferred</td>
                <td className="px-4 py-2">
                  £1,260 — 10% of the £12,570 Personal Allowance,
                  rounded up; the transfer is fixed, all-or-nothing
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Recipient&apos;s saving</td>
                <td className="px-4 py-2">
                  20% of £1,260 = £252, capped at the Income Tax the
                  recipient actually pays
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Transferor&apos;s extra tax</td>
                <td className="px-4 py-2">
                  Their allowance falls to £11,310; income above
                  £11,310 is taxed at 20% (19% in Scotland)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Recipient&apos;s income limit</td>
                <td className="px-4 py-2">
                  £50,270 in England, Wales and Northern Ireland;
                  £43,662 in Scotland
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Backdating</td>
                <td className="px-4 py-2">
                  Up to 4 earlier tax years, back to 2022/23, at the
                  same net saving per year — assuming incomes were
                  much the same in those years
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">What is not covered</td>
                <td className="px-4 py-2">
                  Married Couple&apos;s Allowance (a partner born
                  before 6 April 1935), and cases where either
                  partner&apos;s tax position turns on dividends,
                  savings income or benefits — GOV.UK advises calling
                  the Income Tax helpline for those
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules and rates checked against GOV.UK on 22 November
          2026. This calculator is an estimate on the standard
          conditions — it assumes you are married or in a civil
          partnership and that the incomes entered are your taxable
          incomes for the year.
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

      <RelatedCalculators href="/marriage-allowance-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
