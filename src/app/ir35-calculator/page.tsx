import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import Ir35Calculator from "@/components/Ir35Calculator";
import { calculateIr35 } from "@/lib/ir35";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/ir35-calculator",
  "IR35 Calculator — Inside or Outside",
  "Free IR35 calculator: check whether a contract is inside or outside IR35 from eight status questions, then compare inside vs outside take-home pay by day rate.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Worked example figures — computed by the same calculator functions
// the tool above runs, so the page can never disagree with itself.
// The running example: £500 a day, 5 days a week, 46 weeks a year.
const exMain = calculateIr35({ dayRate: 500, daysPerWeek: 5, weeksPerYear: 46 });
const exLow = calculateIr35({ dayRate: 250, daysPerWeek: 5, weeksPerYear: 46 });

const RATE_ROWS = [250, 400, 500, 600, 800].map((rate) => ({
  rate,
  result: calculateIr35({ dayRate: rate, daysPerWeek: 5, weeksPerYear: 46 }),
}));

// Named day rates readers ask for by name — same assumptions as the
// running example (5 days a week, 46 weeks a year). £400 is shown on
// the outside (limited company) route, £500 and £750 inside IR35.
const NAMED_ROWS = [
  { rate: 400, route: "outside" as const },
  { rate: 500, route: "inside" as const },
  { rate: 750, route: "inside" as const },
].map(({ rate, route }) => {
  const result = calculateIr35({
    dayRate: rate,
    daysPerWeek: 5,
    weeksPerYear: 46,
  });
  const annual = route === "inside" ? result.insideTakeHome : result.outsideTakeHome;
  return { rate, route, result, annual, monthly: Math.round((annual / 12) * 100) / 100 };
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I know if my contract is inside IR35?",
    answer: `There is no single test — HMRC looks at the whole picture, and the three factors that carry the most weight are control (does the client decide what, when, where and how the work is done?), substitution (can you send someone else instead?) and mutuality of obligation (must the client offer work and must you accept it?). The other factors are financial risk, whether you are part of the client's organisation, who provides the equipment, whether you have other clients, and whether the client pays you employee benefits. Answer the eight questions above and the calculator shows which way your contract points — then run HMRC's CEST tool on the real contract for the official view.`,
  },
  {
    question: "What is the difference between inside and outside IR35 take-home pay?",
    answer: `On a £500 day rate, 5 days a week for 46 weeks — a ${fmtMoney(exMain.grossAnnual)} contract — inside IR35 the deemed employer deducts ${fmtMoney(exMain.insideIncomeTax)} of Income Tax and ${fmtMoney(exMain.insideEmployeeNi)} of employee National Insurance, leaving ${fmtMoney(exMain.insideTakeHome)} a year. Outside IR35, the simplified limited-company route (a £12,570 salary plus all post-tax profit as dividends) leaves ${fmtMoney(exMain.outsideTakeHome)} — ${fmtMoney(Math.abs(exMain.difference))} a year less on these figures. At a £250 day rate the answer flips: outside pays ${fmtMoney(Math.abs(exLow.difference))} a year more. The gap depends on the rate, because the Personal Allowance taper, Corporation Tax and dividend tax all bite harder as income rises.`,
  },
  {
    question: "Who decides whether a contract is inside IR35?",
    answer:
      "In most cases the client decides, and must give the worker a status determination statement with the reasons. That covers public-sector clients and medium and large private-sector clients. Only where the client is a small private-sector business does the worker's own intermediary (usually their limited company) decide. The rules apply contract by contract — the same worker can have one contract inside IR35 and another outside it.",
  },
  {
    question: "What tax is deducted if I am inside IR35?",
    answer: `The deemed employer — usually the agency or the client — must deduct Income Tax and employee National Insurance from the fees paid to your company, and must pay employer National Insurance on top (${fmtMoney(exMain.insideEmployerNi)} a year on a ${fmtMoney(exMain.grossAnnual)} contract). The Apprenticeship Levy applies too where the fee-payer's pay bill is large enough. One thing is not deducted: student or postgraduate loan repayments — you pay those yourself through Self Assessment.`,
  },
  {
    question: "Is this IR35 calculator the same as HMRC's CEST tool?",
    answer:
      "No. HMRC's Check Employment Status for Tax (CEST) tool is the official checker, and HMRC will stand by a CEST result as long as the information given was accurate and follows its guidance — a CEST result can even be used as a status determination statement. This calculator is guidance only: it asks the same eight factors CEST weighs, so you can see which way a contract points and what the tax difference is, before you run the official tool on the real contract.",
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
  name: "IR35 Calculator",
  url: `${AppConfig.siteUrl}/ir35-calculator`,
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

export default function Ir35CalculatorPage() {
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
          IR35 Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Work out whether a contract is inside or outside IR35 — and
          what it pays either way. Answer eight questions about
          control, substitution and the other status factors, then
          compare inside-IR35 take-home pay against the simplified
          limited-company route on your day rate. Free, with nothing
          to sign up for.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          IR35 in plain English
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          IR35 is a tax rule about disguised employment. If you work
          for a client through your own limited company, HMRC asks one
          question: if the company were not there, would you really be
          the client&apos;s employee? If the honest answer is yes —
          the client controls your work, you cannot send a substitute,
          you are treated like staff — the contract is “inside IR35”,
          and the fees are taxed like a salary: Income Tax and
          National Insurance come off before you see the money, just
          as they would for an employee. If the answer is genuinely
          no — you run a real business, with other clients, your own
          equipment and your own risk — the contract is “outside
          IR35”, and your company is paid gross and taxed as a
          company instead. Nothing about the work itself changes; what
          changes is who deducts the tax, and how much of the day rate
          you keep. Many contractors inside IR35 skip the limited
          company altogether and are paid through an{" "}
          <Link href="/umbrella-company-calculator" className={linkClass}>
            umbrella company
          </Link>{" "}
          instead — the umbrella employs them and runs PAYE, which is
          why the umbrella route is the usual comparison for an inside
          contract.
        </p>
      </section>

      <Ir35Calculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this IR35 calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This calculator is part of UK Payroll Calculators, a free hub
          of UK payroll calculators built on the April 2026 rules — no
          sign-up, no accounts, and every figure worked out in your
          browser. It works in two parts. First, answer the eight
          status questions about how the work is actually done — not
          just what the contract says — and the calculator shows
          whether the contract looks inside IR35, outside it, or
          borderline. Then enter the day rate, days per week and
          weeks per year, and the calculator compares the take-home
          pay inside IR35 (taxed as deemed employment) with the
          simplified limited-company route outside it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you know if a contract is inside IR35?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The off-payroll working rules apply when a worker providing
          services through their own intermediary — usually a limited
          company, often called a personal service company — would
          have been an employee if they had provided the services
          directly to the client. There is no single test. HMRC looks
          at the whole picture, and the three factors that carry the
          most weight are control, substitution and mutuality of
          obligation: does the client decide what work is done, and
          when, where and how? Can the worker send someone else
          instead? And must the client offer work, and must the
          worker accept it? The other five factors the calculator
          asks about are financial risk, whether the worker is part
          of the client&apos;s organisation, who provides the
          equipment, whether the worker has other clients, and
          whether the client pays employee benefits such as holiday
          pay, sick pay or a pension. What matters is the reality of
          the working arrangement, not just the words in the contract
          — a substitution clause that is never used in practice
          counts for little.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Who decides the IR35 status?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          In most cases the client decides the worker&apos;s
          employment status for tax, and must produce a status
          determination statement — including the reasons — for the
          worker and anyone else in the chain. That covers
          public-sector clients and medium and large private-sector
          clients. Only where the client is a small business outside
          the public sector does the worker&apos;s own intermediary
          decide whether the rules apply. The rules apply contract by
          contract: a worker may have some contracts inside the
          off-payroll rules and some outside them. If a contract is
          determined to be inside IR35, the deemed employer — usually
          the agency, or the client where there is no agency — must
          deduct Income Tax and employee National Insurance from the
          fees paid to the worker&apos;s company, and must pay
          employer National Insurance (and the Apprenticeship Levy,
          where it applies) to HMRC. Umbrella company workers are
          unlikely to be affected, because they are already employed
          by the umbrella company.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Inside IR35 vs outside: the tax difference
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Take a £500 day rate, 5 days a week, 46 weeks a year — a{" "}
          {fmtMoney(exMain.grossAnnual)} contract. Inside IR35, the
          deemed employer deducts {fmtMoney(exMain.insideIncomeTax)}{" "}
          of Income Tax and {fmtMoney(exMain.insideEmployeeNi)} of
          employee National Insurance, leaving{" "}
          {fmtMoney(exMain.insideTakeHome)} a year —{" "}
          {exMain.insideKeepPercent}% of the contract value. Outside
          IR35, the simplified limited-company route pays a{" "}
          {fmtMoney(exMain.outsideSalary)} salary, then Corporation
          Tax of {fmtMoney(exMain.outsideCorporationTax)} on the{" "}
          {fmtMoney(exMain.outsideProfit)} profit and dividend tax of{" "}
          {fmtMoney(exMain.outsideDividendTax)} on the{" "}
          {fmtMoney(exMain.outsideDividends)} of dividends, leaving{" "}
          {fmtMoney(exMain.outsideTakeHome)} —{" "}
          {fmtMoney(Math.abs(exMain.difference))} a year less than
          inside. The fee-payer also pays{" "}
          {fmtMoney(exMain.insideEmployerNi)} of employer National
          Insurance on top of the contract value inside IR35. The gap
          is not fixed — it moves with the rate:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Day rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Contract value
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home inside IR35
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home outside IR35
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RATE_ROWS.map((row) => (
                <tr key={row.rate}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {fmtMoney(row.rate)}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.grossAnnual)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.insideTakeHome)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.outsideTakeHome)}</td>
                  <td className="px-4 py-2">
                    {row.result.difference >= 0 ? "+" : "−"}
                    {fmtMoney(Math.abs(row.result.difference))} (
                    {row.result.betterRoute === "inside" ? "inside wins" : "outside wins"})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every row is the same shape — 5 days a week, 46 weeks a
          year. At £250 a day the outside route wins by{" "}
          {fmtMoney(Math.abs(exLow.difference))} a year; from £400 a
          day up, inside wins, and the gap widens as the rate rises —
          because the Personal Allowance tapers away, Corporation Tax
          moves from the 19% small profits rate towards the 25% main
          rate, and more of the dividends fall into the 35.75%
          higher-rate band. The comparison is tax only: it does not
          count pension contributions, keeping money in the company,
          or the cost of running a company, all of which can change
          the answer in real life.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Take-home at three named day rates
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The three rates readers ask for by name, on exactly the
          same assumptions as the worked example above — 5 days a
          week, 46 weeks a year — with the monthly figure alongside
          the annual one, because most contractors budget monthly:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Day rate and route
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Contract value
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home a year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home a month
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NAMED_ROWS.map((row) => (
                <tr key={row.rate}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {fmtMoney(row.rate)} a day —{" "}
                    {row.route === "inside" ? "inside IR35" : "outside IR35"}
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.grossAnnual)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.annual)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.monthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Inside IR35, the monthly figure is the deemed salary after
          tax and employee NI — if you are paid that route through an{" "}
          <Link href="/umbrella-company-calculator" className={linkClass}>
            umbrella company
          </Link>
          , its margin and the employer costs come out of the rate
          before that salary is set, so run the same rate through the
          umbrella calculator before comparing offers. Outside IR35,
          the figures are the simplified limited-company route (a
          £12,570 salary, the rest as dividends); a director running
          that company has to keep its books, file its accounts and
          take the dividends in the right order, and{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          is the accounting software this site&apos;s other
          contractor and payroll guides point to for keeping those
          company finances recorded.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
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
                <td className="px-4 py-2">Status check</td>
                <td className="px-4 py-2">
                  Eight factors — control, substitution, mutuality of
                  obligation, financial risk, integration, equipment,
                  other clients, employee benefits. 0–2 answers
                  pointing to employment: likely outside; 3–5:
                  borderline; 6–8: likely inside. Guidance only — not
                  a determination.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Inside IR35</td>
                <td className="px-4 py-2">
                  Income Tax and employee National Insurance on the
                  full contract value, at the 2026/27 rates
                  (Personal Allowance £12,570, tapered above
                  £100,000; 20% / 40% / 45%; employee NI 8% to
                  £50,270, 2% above). Student loan is not deducted.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Employer NI (fee-payer)</td>
                <td className="px-4 py-2">
                  15% of the contract value above the £5,000
                  Secondary Threshold, paid on top by the deemed
                  employer — not deducted from the worker&apos;s pay.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Outside IR35 (simplified)</td>
                <td className="px-4 py-2">
                  Salary of exactly the Personal Allowance (£12,570);
                  employer NI 15% above £5,000 in full — a
                  one-director company cannot claim the Employment
                  Allowance. Profit = contract value − salary −
                  employer NI.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Corporation Tax</td>
                <td className="px-4 py-2">
                  19% on profits up to £50,000, 25% on profits over
                  £250,000, Marginal Relief between the two.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Dividend tax (2026/27)</td>
                <td className="px-4 py-2">
                  £500 dividend allowance, then 10.75% at the basic
                  rate, 35.75% at the higher rate, 39.35% at the
                  additional rate. Dividends are the top slice — the
                  salary is taxed first, and the Personal Allowance
                  covers dividend income that falls within it.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Outside take-home</td>
                <td className="px-4 py-2">
                  Salary (less any Income Tax on it once the
                  allowance tapers) + dividends − dividend tax. All
                  post-tax profit is taken as dividends in the same
                  tax year; no expenses, pension or VAT are counted.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The rules follow GOV.UK&apos;s{" "}
          <a
            href="https://www.gov.uk/guidance/understanding-off-payroll-working-ir35"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Understanding off-payroll working (IR35)
          </a>
          ,{" "}
          <a
            href="https://www.gov.uk/guidance/check-employment-status-for-tax"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Check employment status for tax (CEST)
          </a>
          ,{" "}
          <a
            href="https://www.gov.uk/corporation-tax-rates"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Corporation Tax rates
          </a>
          ,{" "}
          <a
            href="https://www.gov.uk/tax-on-dividends"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Tax on dividends
          </a>{" "}
          and{" "}
          <a
            href="https://www.gov.uk/claim-employment-allowance"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Claim Employment Allowance
          </a>
          .
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules and rates checked against GOV.UK on 9 November 2026.
          This calculator is guidance only and is not HMRC&apos;s
          CEST tool — for a determination, run CEST on the real
          contract. Tax bands are for England, Wales and Northern
          Ireland; Scotland sets its own Income Tax bands.
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

      <RelatedCalculators href="/ir35-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
