import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PilonCalculator from "@/components/PilonCalculator";
import { calculatePilon } from "@/lib/pilon";
import { TERMINATION, TERMINATION_RULES_VERIFIED } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/pilon-calculator",
  "PILON & PENP Calculator — Pay in Lieu of Notice Tax 2026/27",
  "Work out post-employment notice pay (PENP) with HMRC's formula ((BP × D) ÷ P) − T: the part of a termination payment taxed as earnings, and what is left for the £30,000 exemption.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const h2Class = "text-xl font-semibold text-slate-900 dark:text-slate-50";

// The worked example: a £36,000 salary (£3,000 a month), a 12-week
// notice period worked not at all, no contractual PILON clause,
// and a £10,000 ex-gratia termination payment. The employee had
// already been paid £27,000 in the tax year (nine months' salary).
const exMain = calculatePilon({
  basis: "days",
  basicPayPerPeriod: 3000,
  payPeriodDays: TERMINATION.averageDaysPerMonth,
  unworkedMonths: 0,
  unworkedDays: 84,
  taxedAsEarnings: 0,
  terminationAward: 10000,
  statutoryRedundancyPay: 0,
  otherTaxableIncome: 27000,
});
// The same leaver under the whole-months shortcut: 3 months of
// notice at £3,000 a month, no award entered (uncapped result).
const exMonths = calculatePilon({
  basis: "months",
  basicPayPerPeriod: 3000,
  payPeriodDays: TERMINATION.averageDaysPerMonth,
  unworkedMonths: 3,
  unworkedDays: 0,
  taxedAsEarnings: 0,
  terminationAward: 0,
  statutoryRedundancyPay: 0,
  otherTaxableIncome: 27000,
});
// A weekly-paid leaver: £700 a week, 4 weeks of notice unworked,
// but the contract already pays a £1,400 PILON through PAYE.
const exWeekly = calculatePilon({
  basis: "days",
  basicPayPerPeriod: 700,
  payPeriodDays: 7,
  unworkedMonths: 0,
  unworkedDays: 28,
  taxedAsEarnings: 1400,
  terminationAward: 5000,
  statutoryRedundancyPay: 0,
  otherTaxableIncome: 18200,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is pay in lieu of notice (PILON) taxed?",
    answer:
      "Yes — always. Since 6 April 2018 it has made no difference whether the PILON is in the contract or not: the part of any termination payment that represents basic pay for the notice period that was not worked is post-employment notice pay (PENP), and it is taxed as earnings through PAYE, with Income Tax and both employee and employer National Insurance, exactly like salary. The one thing that changed in 2018 is that a non-contractual PILON can no longer shelter inside the £30,000 termination-payments exemption.",
  },
  {
    question: "What is PENP and how is it calculated?",
    answer:
      "PENP stands for post-employment notice pay: the basic pay the employee would have earned if they had worked their notice, for the part of the notice period that falls after the employment ended. HMRC's statutory formula is PENP = ((BP × D) ÷ P) − T, where BP is basic pay in the last pay period before notice was given, D is the number of days in the unworked notice period, P is the number of days in that pay period, and T is anything already taxed as earnings in connection with the termination — typically a contractual PILON. If the result is negative, PENP is nil, and PENP can never be more than the termination payment itself.",
  },
  {
    question: "Does the £30,000 tax-free amount cover my notice pay?",
    answer:
      "No. The £30,000 exemption is applied only after the PENP has been taken out of the package. The order is fixed: first the PENP is taxed as earnings in full; then what is left of the termination payment is added to any statutory redundancy pay, and the first £30,000 of that combined amount is tax-free. Only the excess over £30,000 is taxed (and the employer pays Class 1A National Insurance on the excess). A package can therefore contain fully taxed notice pay and a fully tax-free balance at the same time.",
  },
  {
    question: "What counts as basic pay (BP) for the PENP calculation?",
    answer:
      "Basic pay is the employment income in the last pay period before the trigger date, measured before anything is taken off — in particular, before salary sacrifice, so an amount given up for pension contributions or a cycle-to-work scheme is added back in. Overtime, bonuses, commission, gratuities and allowances are left out, as are taxable benefits in kind and anything received in connection with the termination itself. For a monthly-paid employee with a fixed salary, BP is simply the monthly salary; for a weekly-paid employee it is the basic weekly wage.",
  },
  {
    question: "My contract already pays a PILON — will I be taxed on it twice?",
    answer:
      "No. A contractual PILON is taxed as earnings when it is paid, and HMRC's formula then counts it as T — the amount deducted at the end of the calculation — so it reduces the PENP pound for pound. The two routes reach the same place: notice pay is taxed once, as earnings. Double taxation only threatens if the employer forgets to put the contractual PILON into the T figure, which is one of the most common PENP mistakes and worth checking on any settlement calculation.",
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
  name: "PILON & PENP Calculator",
  url: `${AppConfig.siteUrl}/pilon-calculator`,
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

export default function PilonCalculatorPage() {
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
          PILON &amp; PENP Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          When employment ends before the notice period is worked,
          HMRC taxes the basic pay for the unworked notice out of the
          termination payment first. That amount is post-employment
          notice pay (PENP), worked out with the statutory formula
          ((BP × D) ÷ P) − T, and it is taxed as earnings — Income Tax
          and National Insurance — with no share of the £30,000
          exemption.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rules and sources
          behind its figures instead of hiding them, and this page
          follows sections 402A to 402E of ITEPA 2003 and HMRC&apos;s
          Employment Income Manual exactly.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified{" "}
          {TERMINATION_RULES_VERIFIED} against HMRC&apos;s Employment
          Income Manual.
        </p>
      </section>

      <PilonCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          A worked example: leaving a £36,000 job with 12 weeks&apos;
          notice
        </h2>
        <p className={bodyClass}>
          An employee on {gbp.format(36000)} a year —{" "}
          {gbp.format(3000)} a month — is told to leave immediately.
          The contract gives 12 weeks&apos; notice, none of it is
          worked, and there is no PILON clause in the contract. The
          employer agrees an ex-gratia termination payment of{" "}
          {gbp.format(10000)}. Because no notice is worked, the whole
          12 weeks is a post-employment notice period: 84 calendar
          days. Monthly paid, with the notice not a whole number of
          months, HMRC&apos;s average month of{" "}
          {TERMINATION.averageDaysPerMonth} days is P, so the formula
          runs:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  (BP × D) ÷ P = ({gbp.format(3000)} × 84) ÷{" "}
                  {TERMINATION.averageDaysPerMonth}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exMain.grossNoticePay)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Less T — nothing has been taxed as earnings already
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(exMain.taxedAsEarnings)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">
                  PENP — taxed as earnings
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(exMain.penp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Income Tax on the PENP (on top of{" "}
                  {gbp.format(27000)} already earned that year)
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(exMain.taxOnPenp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employee National Insurance on the PENP
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(exMain.niOnPenp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">
                  PENP in hand
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(exMain.netPenp)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Rest of the {gbp.format(10000)} payment, measured
                  against the £30,000 exemption
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exMain.remainderOfAward)} — all of it
                  tax-free
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          So of the {gbp.format(10000)} headline payment,{" "}
          {gbp.format(exMain.penp)} is really notice pay in disguise
          and arrives as about {gbp.format(exMain.netPenp)} after tax
          and National Insurance, while the remaining{" "}
          {gbp.format(exMain.remainderOfAward)} is paid in full,
          tax-free. Anyone who budgeted on “£10,000 tax-free” is
          roughly £2,300 worse off than they expected — which is why
          the PENP figure belongs in every settlement discussion,
          before the headline number is agreed.
        </p>
        <p className={bodyClass}>
          Two variations show the moving parts. Where the notice is a
          whole number of months and pay is a fixed monthly amount,
          HMRC allows the shortcut version: {gbp.format(3000)} × 3
          months = {gbp.format(exMonths.penp)} — slightly more than
          the days calculation, because a quarter of a year is not
          exactly 84 days. And where the contract itself pays a
          PILON, the double-count is stripped out: a weekly-paid
          worker on {gbp.format(700)} a week with 4 weeks unworked
          has notice pay of ({gbp.format(700)} × 28) ÷ 7 ={" "}
          {gbp.format(exWeekly.grossNoticePay)}, but{" "}
          {gbp.format(exWeekly.taxedAsEarnings)} of it was already
          taxed as a contractual PILON, so the PENP left to tax out
          of the termination payment is{" "}
          {gbp.format(exWeekly.penp)}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How is PENP calculated?</h2>
        <p className={bodyClass}>
          The formula is set by statute — section 402D of ITEPA 2003 —
          and it is the same for every employer:
          <strong> PENP = ((BP × D) ÷ P) − T</strong>. Each letter has
          a precise meaning:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Term
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  What it is
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2 font-medium">BP</td>
                <td className="px-4 py-2">
                  Basic pay in the last pay period ending before the
                  trigger date (the date notice is given, or the last
                  day of employment if no notice is given) — measured
                  before salary sacrifice, and excluding overtime,
                  bonuses, commission, allowances and benefits.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">D</td>
                <td className="px-4 py-2">
                  The number of calendar days in the post-employment
                  notice period: from the day after employment ends to
                  the day the minimum notice — contractual or
                  statutory, whichever the contract gives — would have
                  expired.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">P</td>
                <td className="px-4 py-2">
                  The number of calendar days in that last pay period:
                  7 for weekly pay, the days in the month for monthly
                  pay — or {TERMINATION.averageDaysPerMonth}, the
                  statutory average month, where the whole-months
                  shortcut does not apply.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">T</td>
                <td className="px-4 py-2">
                  Anything received in connection with the termination
                  that is already taxed as earnings in its own right —
                  above all a contractual PILON. Holiday pay for the
                  period up to the leaving date and termination
                  bonuses are specifically not part of T.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Three safety valves sit around the formula: if it produces
          a negative number, PENP is nil; PENP can never exceed the
          termination payment it is being taken out of; and if the
          employee works their full notice, there is no
          post-employment notice period and no PENP at all. Where the
          employment ends in the middle of the notice period, only
          the unworked remainder counts towards D. Leaving on garden
          leave is different again — the employment has not ended, so
          the pay is ordinary earnings and PENP never arises.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          The £30,000 exemption: what it covers, and what it does not
        </h2>
        <p className={bodyClass}>
          The £30,000 figure is the most quoted — and most
          misunderstood — number in termination payments. It is an
          exemption for the part of a leaving package that is
          genuinely compensation: ex-gratia payments, damages for
          loss of office, and statutory redundancy pay all share one
          £30,000 allowance between them. It has never covered notice
          pay, and since April 2018 the PENP calculation exists
          precisely to carve the notice element out before the
          exemption is applied. Amounts above £30,000 are taxed as
          the top slice of the employee&apos;s income for the year —
          there is no employee National Insurance on them, but since
          April 2020 the employer pays Class 1A National Insurance
          on the excess. Our{" "}
          <Link href="/redundancy-pay-calculator" className={linkClass}>
            redundancy pay calculator
          </Link>{" "}
          works out the statutory redundancy element itself, and our{" "}
          <Link href="/notice-period-calculator" className={linkClass}>
            notice period calculator
          </Link>{" "}
          checks the minimum notice the law and the contract allow —
          the two inputs every PENP calculation starts from.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Common PENP mistakes</h2>
        <p className={bodyClass}>
          <strong>Treating a non-contractual PILON as tax-free.</strong>{" "}
          That was arguable before April 2018; it has been wrong ever
          since. The absence of a PILON clause changes nothing — the
          formula taxes the notice element either way.{" "}
          <strong>Using pay after salary sacrifice as BP.</strong>{" "}
          Basic pay is measured before sacrifice amounts are deducted,
          so a pension sacrifice increases BP — and the PENP — above
          the salary on the final payslip.{" "}
          <strong>Putting holiday pay or a termination bonus into T.</strong>{" "}
          Both are excluded by the legislation; including them
          understates the PENP and leaves the employer exposed.{" "}
          <strong>Forgetting the employer&apos;s National Insurance.</strong>{" "}
          PENP is earnings, so employer Class 1 contributions are due
          on it on top of the payment itself — a real cost of any
          settlement, which our{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>{" "}
          helps to size. <strong>Skipping the calculation entirely.</strong>{" "}
          The employer must run the PENP formula whether or not a
          contractual PILON exists; “we paid it as an ex-gratia lump
          sum” is not an answer HMRC accepts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Rules and sources used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Item
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure / rule
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">PENP formula</td>
                <td className="px-4 py-2">
                  ((BP × D) ÷ P) − T — section 402D, ITEPA 2003
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Average month (P)</td>
                <td className="px-4 py-2">
                  {TERMINATION.averageDaysPerMonth} days for
                  monthly-paid cases outside the whole-months shortcut
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Tax on PENP</td>
                <td className="px-4 py-2">
                  Income Tax as general earnings, plus employee and
                  employer Class 1 National Insurance — no £30,000
                  exemption
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Termination exemption</td>
                <td className="px-4 py-2">
                  First{" "}
                  {gbp.format(TERMINATION.taxFreeThreshold)} of the
                  non-PENP package (including statutory redundancy
                  pay) is exempt; the excess is taxed, with employer
                  Class 1A National Insurance on it
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Applies to</td>
                <td className="px-4 py-2">
                  Terminations on or after 6 April 2018 where notice
                  is not worked in full
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sources: HMRC Employment Income Manual{" "}
          <a
            href="https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim13880"
            className={linkClass}
          >
            EIM13880 — the PENP formula
          </a>{" "}
          and{" "}
          <a
            href="https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim13874"
            className={linkClass}
          >
            EIM13874 — relevant termination awards
          </a>
          ; sections 402A to 402E and 403, Income Tax (Earnings and
          Pensions) Act 2003. Rules verified{" "}
          {TERMINATION_RULES_VERIFIED}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={h2Class}>Frequently asked questions</h2>
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

      <RelatedCalculators href="/pilon-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
