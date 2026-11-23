import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SalarySacrificeCalculator from "@/components/SalarySacrificeCalculator";
import { calculateSalarySacrifice } from "@/lib/salary-sacrifice";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/salary-sacrifice-calculator",
  "Salary Sacrifice Calculator — Pension Savings in Tax and NI",
  "Free salary sacrifice calculator: what sacrificing salary into a pension saves in Income Tax and National Insurance — £40,000 with £200 a month saves £672 a year — plus the employer NI saving.",
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

// Worked examples — computed by the same function the calculator
// runs, so the page can never disagree with itself.
const exBasic = calculateSalarySacrifice({
  grossSalary: 40000,
  sacrificeAnnual: 2400,
});
const exHigher = calculateSalarySacrifice({
  grossSalary: 60000,
  sacrificeAnnual: 5000,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How does salary sacrifice work?",
    answer:
      "Your contract is rewritten at a lower salary, and your employer pays the amount you gave up into your pension instead. Because that money is never salary, it is not charged Income Tax or National Insurance — either yours or your employer's. The arrangement has to be agreed before the pay is earned; you cannot sacrifice pay you have already been paid.",
  },
  {
    question: "How much does salary sacrifice save?",
    answer:
      "Your marginal tax rate plus your National Insurance rate on the amount sacrificed. On £40,000, sacrificing £200 a month (£2,400 a year) saves £480 of tax and £192 of NI — £672 a year — so £2,400 lands in the pension for £1,728 of take-home pay given up. A higher-rate taxpayer sacrificing £5,000 saves £2,100 (40% tax + 2% NI), so the pension costs 58p per £1.",
  },
  {
    question: "What is the difference between salary sacrifice and a normal pension contribution?",
    answer:
      "National Insurance. An ordinary employee contribution from your pay saves Income Tax but is taken after NI, so you pay NI on money that goes into the pension. Sacrifice removes the amount from salary before both, so it saves NI as well — 8% in the main band, 2% above £50,270. The employer also saves 15% employer NI on the sacrificed amount, which is why some employers pass part of that saving back into the pension.",
  },
  {
    question: "Does salary sacrifice affect my mortgage or benefits?",
    answer:
      "It can. Your contractual salary is genuinely lower, and that is the figure mortgage lenders, and the calculations behind statutory maternity and sick pay, redundancy pay and some state benefits, are based on. Sacrifice also cannot take your pay below the National Minimum Wage for the hours you work. Weigh a lower reference salary against the saving before you sign — especially in a year you plan to move house or take family leave.",
  },
  {
    question: "What changes to pension salary sacrifice in April 2029?",
    answer:
      "From 6 April 2029, only the first £2,000 a year of pension contributions made through salary sacrifice stays exempt from National Insurance. Anything sacrificed above £2,000 is treated like an ordinary employee pension contribution: Income Tax relief is unchanged, but employee and employer National Insurance are charged on the excess. Nothing changes before that date. The change was announced at the Autumn Budget 2025 and is covered in GOV.UK's guidance 'Changes to salary sacrifice for pensions from April 2029'.",
  },
  {
    question: "Is there a limit to how much I can sacrifice?",
    answer:
      "Two practical limits. Your remaining pay must stay at or above the National Minimum Wage, and total pension contributions (yours plus your employer's, including the sacrificed amount) count towards the £60,000 pension annual allowance — above that, a tax charge claws the relief back. Sacrificing to bring income under £100,000 also restores Personal Allowance lost to the taper, which is the single most valuable use for many higher earners.",
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
  name: "Salary Sacrifice Calculator",
  url: `${AppConfig.siteUrl}/salary-sacrifice-calculator`,
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

export default function SalarySacrificeCalculatorPage() {
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
          Salary Sacrifice Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Sacrificing salary into a pension saves tax AND National
          Insurance on the amount given up. On a £40,000 salary,
          sacrificing £200 a month puts {gbp.format(exBasic.sacrificeAnnual)}{" "}
          into the pension for {gbp.format(exBasic.takeHomeCost)} of
          take-home pay — a saving of {gbp.format(exBasic.totalSaved)}{" "}
          a year.
        </p>
      </section>

      <SalarySacrificeCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The saving, worked through
        </h2>
        <p className={bodyClass}>
          The saving on each £1 sacrificed is your marginal Income Tax
          rate plus your National Insurance rate — nothing more exotic
          than that. Two worked examples at the 2026/27 bands:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}></th>
                <th className={thClass}>£40,000, sacrifice £2,400</th>
                <th className={thClass}>£60,000, sacrifice £5,000</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Income Tax saved</td>
                <td className={tdClass}>{gbp.format(exBasic.incomeTaxSaved)}</td>
                <td className={tdClass}>{gbp.format(exHigher.incomeTaxSaved)}</td>
              </tr>
              <tr>
                <td className={tdClass}>National Insurance saved</td>
                <td className={tdClass}>{gbp.format(exBasic.employeeNiSaved)}</td>
                <td className={tdClass}>{gbp.format(exHigher.employeeNiSaved)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Into the pension</td>
                <td className={tdClass}>{gbp.format(exBasic.sacrificeAnnual)}</td>
                <td className={tdClass}>{gbp.format(exHigher.sacrificeAnnual)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Take-home pay given up</td>
                <td className={tdClass}>{gbp.format(exBasic.takeHomeCost)}</td>
                <td className={tdClass}>{gbp.format(exHigher.takeHomeCost)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Cost per £1 in the pension</td>
                <td className={tdClass}>{exBasic.costPerPoundPence}p</td>
                <td className={tdClass}>{exHigher.costPerPoundPence}p</td>
              </tr>
              <tr>
                <td className={tdClass}>Employer NI saved (per employee)</td>
                <td className={tdClass}>{gbp.format(exBasic.employerNiSaved)}</td>
                <td className={tdClass}>{gbp.format(exHigher.employerNiSaved)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The £100,000 version deserves a line of its own. Between
          £100,000 and £125,140 the Personal Allowance is withdrawn at
          £1 for every £2 of income, so sacrificing back under
          £100,000 restores allowance as well as saving 40% tax and 2%
          NI — an effective saving of up to 62p per £1 sacrificed in
          that band. The calculator handles it automatically, because
          it runs the full take-home calculation on both salaries
          rather than applying a flat rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The April 2029 change: NI relief capped at £2,000
        </h2>
        <p className={bodyClass}>
          Announced at the Autumn Budget 2025: from 6 April 2029, only
          the first £2,000 a year of pension contributions made
          through salary sacrifice will be exempt from National
          Insurance. Contributions sacrificed above £2,000 will be
          treated as ordinary employee pension contributions — Income
          Tax relief stays exactly as it is, but employee National
          Insurance (8% in the main band, 2% above £50,270) and
          employer National Insurance (15%) will be charged on the
          excess. On a £5,000 sacrifice, that means NI on £3,000 from
          April 2029. Nothing changes before that date, sacrificing
          more than £2,000 remains allowed, and ordinary employer
          pension contributions that are not salary sacrifice are not
          affected. The detail is set out in GOV.UK&apos;s guidance
          “Changes to salary sacrifice for pensions from April 2029”.
          Until April 2029 the calculator above — full tax and NI
          saving on the whole amount sacrificed — is the correct
          picture.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much should you sacrifice?
        </h2>
        <p className={bodyClass}>
          Start from the legal floor: sacrifice can never take your
          contractual pay below the National Minimum Wage for the
          hours you actually work, so lower-paid staff have much less
          room than the headline percentages suggest. Above that
          floor, the usual order of value is: first, sacrifice enough
          to get your full employer pension match, if your scheme
          matches contributions; then look at the tax bands. Bringing
          adjusted net income back under £100,000 is the most valuable
          move for higher earners, because it restores the Personal
          Allowance withdrawn between £100,000 and £125,140 (worth up
          to 62p per £1 sacrificed, as the worked examples above
          show), and sacrificing down towards the top of the basic-rate
          band avoids paying 40% tax on that slice. Keep total
          contributions — yours and your employer&apos;s — inside the
          £60,000 pension annual allowance. Finally, ask what your
          employer does with their 15% employer NI saving: some keep
          it, some share it, and some pay it all into your pension on
          top of the sacrificed amount — on the £40,000 example above
          that is worth {gbp.format(exBasic.employerNiSaved)} a year,
          so it is worth asking before you set the amount.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Salary sacrifice for a car — why electric cars dominate
        </h2>
        <p className={bodyClass}>
          The same mechanism is widely used for cars: you give up
          gross salary, the employer leases the car, and you save
          Income Tax and National Insurance on the amount sacrificed.
          In exchange the car is a taxable benefit, charged on its
          list price (its P11D value) multiplied by a benefit-in-kind
          (BiK) percentage set by its CO₂ emissions. That is why
          electric cars dominate these schemes: a zero-emission car
          is taxed at just 3% of list price in 2025/26 and 4% in
          2026/27, while a typical petrol car sits between roughly
          20% and the 37% maximum — so the BiK tax on an EV is a
          fraction of the tax and NI saved on the sacrifice, and the
          employer also saves employer NI on the sacrificed salary
          (they pay Class 1A NI on the benefit instead). The EV rate
          is legislated to rise — 5% in 2027/28, 7% in 2028/29 and 9%
          in 2029/30 — so a lease that starts cheap gets a little
          less cheap each April, but it stays far below petrol and
          diesel rates. This calculator covers pension sacrifice
          only; a car quote needs the lease cost, the BiK charge and
          your tax band run together.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          For employers: running the arrangement
        </h2>
        <p className={bodyClass}>
          A sacrifice arrangement is a contract change, not a payroll
          toggle: the variation has to be agreed in writing before the
          pay period it covers, the payroll has to run the reduced
          salary, and the sacrificed amount has to reach the pension
          provider as an employer contribution. The employer NI saving
          — {gbp.format(exBasic.employerNiSaved)} a year on the
          £40,000 example above — is the employer&apos;s to keep,
          share or pass into the pension in full; schemes that pass it
          back see the highest take-up. The cost records for the
          arrangement sit with the rest of the payroll file, and{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          keeps those employment costs recorded alongside the
          organisation&apos;s other finances, so the true cost of each
          salary is visible in the same figures.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculations use the 2026/27 Income Tax and National
          Insurance bands verified against GOV.UK (see the rates note
          on the take-home calculator). Salary sacrifice arrangements
          for some benefits changed under the optional remuneration
          rules; pension contributions remain fully effective. This
          calculator covers pension sacrifice only.
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

      <RelatedCalculators href="/salary-sacrifice-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
