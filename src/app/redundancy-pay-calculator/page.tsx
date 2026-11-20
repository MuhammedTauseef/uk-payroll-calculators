import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import RedundancyCalculator from "@/components/RedundancyCalculator";
import { calculateRedundancy } from "@/lib/redundancy";
import { PAYE_RATES_LABEL, REDUNDANCY } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";

export const metadata: Metadata = pageMetadata(
  "/redundancy-pay-calculator",
  "Redundancy Pay Calculator — Statutory 2026",
  "Work out statutory redundancy pay with the £751 weekly cap: age-band weeks for every year of service, plus notice pay and the £30,000 tax-free check.",
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

const exampleA = calculateRedundancy({
  dateOfBirth: "1981-06-15",
  employmentStart: "2011-11-15",
  employmentEnd: "2026-11-15",
  grossWeeklyPay: 600,
  otherTerminationPayments: 0,
});
const exampleB = calculateRedundancy({
  dateOfBirth: "1981-06-15",
  employmentStart: "2016-11-15",
  employmentEnd: "2026-11-15",
  grossWeeklyPay: 600,
  otherTerminationPayments: 0,
});
const exampleC = calculateRedundancy({
  dateOfBirth: "1976-06-15",
  employmentStart: "2001-11-15",
  employmentEnd: "2026-11-15",
  grossWeeklyPay: 900,
  otherTerminationPayments: 0,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much statutory redundancy pay will I get?",
    answer:
      "It depends on three things: your age in each year you worked, how many complete years of service you have (up to 20), and your gross weekly pay (capped at £751). Each year earns half a week's pay if you were under 22 in it, one week if you were 22 to 40, and one and a half weeks if you were 41 or over. A 45-year-old with 15 years of service on £600 a week gets 17 weeks' pay — £10,200.",
  },
  {
    question: "What is the maximum statutory redundancy pay?",
    answer:
      "£22,530. That is 30 weeks' pay — the most the formula can produce, from 20 years of service all falling in the 41-and-over band — at the maximum week's pay of £751. The cap applies to dismissals on or after 6 April 2026 in England, Scotland and Wales; it was £719 for dismissals in the year before.",
  },
  {
    question: "Is redundancy pay taxed?",
    answer:
      "No — statutory redundancy pay itself is tax-free. But it counts towards the £30,000 tax-free limit that covers termination payments as a whole, including ex-gratia payments and settlement sums. If your total package goes above £30,000, the excess is taxed as earnings. Pay in lieu of notice is different: it is taxed as ordinary earnings from the first pound and does not use the £30,000 allowance.",
  },
  {
    question: "I have less than 2 years of service — do I get anything?",
    answer:
      "There is no statutory redundancy pay with under 2 complete years of service in England, Scotland and Wales. You are still entitled to be paid for your notice period (or pay in lieu of it), for any holiday you have built up but not taken, and to any enhanced redundancy amount your contract promises — some employers pay from the first year, so always check your contract and staff handbook.",
  },
  {
    question: "What happens if my employer cannot afford to pay me?",
    answer:
      "If your employer is insolvent, you can claim your statutory redundancy pay, notice pay, holiday pay and unpaid wages from the government's Redundancy Payments Service, paid from the National Insurance Fund. Apply within 6 months of your job ending (the service can accept up to 12 months in some circumstances). If your employer is not insolvent but refuses to pay, you can claim through an employment tribunal — the time limit is 3 months less a day from when the payment was due, and you must start Acas early conciliation first.",
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
  name: "Redundancy Pay Calculator",
  url: `${AppConfig.siteUrl}/redundancy-pay-calculator`,
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

export default function RedundancyPayCalculatorPage() {
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
          Redundancy Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Statutory redundancy pay multiplies your capped weekly pay —
          at most {gbp.format(REDUNDANCY.weeklyPayCap)} — by the weeks
          your service earns: half a week for each year you were under
          22, one week for each year aged 22 to 40, and one and a half
          weeks for each year aged 41 or over. Enter your dates and pay
          to see every year worked out.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this page uses
          the statutory formula exactly as GOV.UK sets it out.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified
          20 November 2026 against GOV.UK.
        </p>
      </section>

      <RedundancyCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>How is statutory redundancy pay calculated?</h2>
        <p className={bodyClass}>
          The calculation counts backwards from the date your employment
          ends. Take your complete years of service — part years do not
          count, and no more than the most recent 20 years are used.
          For each of those years, look at your age when that year of
          service began: under 22 earns half a week&apos;s pay, 22 to 40
          earns one week&apos;s pay, and 41 or over earns one and a half
          weeks&apos; pay. Add the weeks up and multiply by one
          week&apos;s gross pay, capped at{" "}
          {gbp.format(REDUNDANCY.weeklyPayCap)}. That is the whole
          formula — there is no discretion in it, which is why the
          calculator above prints the split year by year: you can check
          every line against your own start date and birth date.
        </p>
        <p className={bodyClass}>
          The age bands are what surprise people. Two employees with the
          same service and the same pay can receive very different
          amounts because their years fell in different bands. Fifteen
          years of service ending at age 45 earns 17 weeks&apos; pay —
          the four years that began at ages 41 to 44 count at one and a
          half weeks each. The same fifteen years ending at age 35 earns
          15 weeks, because every year sits in the middle band. And
          service as a teenager or in your early twenties is worth the
          least: years that began before your 22nd birthday count at
          half rate. It also means a long-serving employee keeps gaining
          more per year after 41 — one reason older workers often have
          the largest statutory entitlements, and why employers planning
          redundancies use our{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>{" "}
          to model the full cost of a role before decisions are made.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Your age in that year of service
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Weeks of pay earned
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Under 22</td>
                <td className="px-4 py-2">Half a week&apos;s pay</td>
              </tr>
              <tr>
                <td className="px-4 py-2">22 to 40</td>
                <td className="px-4 py-2">One week&apos;s pay</td>
              </tr>
              <tr>
                <td className="px-4 py-2">41 or over</td>
                <td className="px-4 py-2">One and a half weeks&apos; pay</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Who qualifies for statutory redundancy pay?</h2>
        <p className={bodyClass}>
          You qualify if you are an employee, you are being dismissed
          for redundancy, and you have at least 2 complete years of
          continuous service with the same employer when your employment
          ends. The 2 years are measured to your last day, including
          your notice period if you work it. A fixed-term contract of 2
          years or more that expires and is not renewed for redundancy
          reasons counts in the same way. These rules cover England,
          Scotland and Wales; Northern Ireland has the same formula but
          a different weekly pay cap (£783 from April 2026), so this
          calculator should not be used for Northern Ireland dismissals.
        </p>
        <p className={bodyClass}>
          Some groups are outside the scheme altogether — members of the
          armed forces, Crown servants, parliamentary staff, share
          fishermen and domestic staff in an immediate family member&apos;s
          home are the main ones GOV.UK lists. Contractors and the
          genuinely self-employed have no statutory entitlement, however
          long the engagement. You can also lose the payment in two
          situations: if you unreasonably refuse an offer of suitable
          alternative work with the same employer, or if you are
          dismissed for gross misconduct during the process. Continuity
          of service is rarely broken by absence — sickness, maternity
          leave, temporary lay-offs and most strikes do not reset the
          clock — but moving to a genuinely different employer does,
          unless the business itself was transferred, in which case your
          service normally carries across. If your role disappears while
          you are on maternity leave, special priority rules apply to
          suitable vacancies; the{" "}
          <Link href="/maternity-pay-calculator" className={linkClass}>
            maternity pay calculator
          </Link>{" "}
          page explains the wider position.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What counts as a week&apos;s pay?</h2>
        <p className={bodyClass}>
          A week&apos;s pay is your gross weekly pay before tax, but the
          law caps it: for dismissals on or after 6 April 2026 at most{" "}
          {gbp.format(REDUNDANCY.weeklyPayCap)} counts, however much you
          earn. The cap was £719 for dismissals from 6 April 2025 and
          £700 from 6 April 2024, so the date your employment ends
          decides which cap applies. If you earn £900 a week, the
          statutory calculation sees {gbp.format(REDUNDANCY.weeklyPayCap)}{" "}
          — the rest is invisible to the formula, which is why the
          maximum possible statutory payment is{" "}
          {gbp.format(REDUNDANCY.maxStatutoryPay)}.
        </p>
        <p className={bodyClass}>
          If your hours and pay are fixed, a week&apos;s pay is simply
          your contractual weekly amount — annual salary divided by 52
          for salaried staff (or the part-time equivalent from our{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>
          ), a conversion our{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          can help with. If your pay varies — shift work, piece work,
          variable hours — the law uses your average hourly rate over
          the 12 weeks before the day you were given notice, multiplied
          by your average weekly hours over the same period; weeks in
          which you were not paid are skipped and earlier weeks counted
          instead. Guaranteed contractual overtime and regular
          commission form part of pay; purely voluntary, non-guaranteed
          overtime generally does not. One warning: if you were on
          reduced pay during part of the 12 weeks — for example on
          statutory sick pay, which our{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            SSP calculator
          </Link>{" "}
          works out — the average can dip, and the rules on which weeks
          count become worth checking carefully, because a few pounds a
          week runs through every year of the calculation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Worked examples, step by step</h2>
        <p className={bodyClass}>
          Example one: 15 years of service, leaving at 45, £600 a week.
          The fifteen years began at ages 30 to 44. Four of them — the
          years beginning at 41, 42, 43 and 44 — earn one and a half
          weeks each: 6 weeks. The other eleven earn one week each: 11
          weeks. Total 17 weeks × £600 ={" "}
          <strong>{gbp.format(exampleA.statutoryPay)}</strong>. This is
          the same shape as the worked example in the official guidance:
          the weeks, not the person&apos;s total service, drive the
          result.
        </p>
        <p className={bodyClass}>
          Example two: 10 years of service, leaving at 45, £600 a week.
          The years began at ages 35 to 44, so four fall in the top band
          (6 weeks) and six in the middle band (6 weeks): 12 weeks ×
          £600 = <strong>{gbp.format(exampleB.statutoryPay)}</strong>.
          Compare the two examples: five extra years of service added
          five weeks — £3,000 — because the extra years all sat in the
          one-week band while the top-band years stayed the same.
        </p>
        <p className={bodyClass}>
          Example three: the cap biting. Leaving at 50 with 25 years of
          service on £900 a week: only the last 20 years count, and only{" "}
          {gbp.format(REDUNDANCY.weeklyPayCap)} of the £900 counts. The
          twenty years began at ages 30 to 49 — nine in the top band
          (13.5 weeks) and eleven in the middle band (11 weeks) — giving
          24.5 weeks × {gbp.format(REDUNDANCY.weeklyPayCap)} ={" "}
          <strong>{gbp.format(exampleC.statutoryPay)}</strong>. Without
          the cap the same service would have produced £22,050; the cap
          is worth more than £3,600 of difference here, which is why
          higher earners should always check whether their contract
          offers an enhanced scheme on top of the statutory floor.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is redundancy pay taxed?</h2>
        <p className={bodyClass}>
          Statutory redundancy pay is never taxed. It does, however,
          count towards the £30,000 limit that applies to termination
          payments taken together — redundancy pay, ex-gratia payments,
          settlement agreement sums and similar amounts all share the
          same £30,000 of tax-free room. Enter any other termination
          payments in the calculator and it shows how much of the
          allowance your whole package uses and how much, if any, spills
          over into taxable territory. Above £30,000, the excess is
          taxed as earnings at your marginal rate, and since April 2020
          employers also pay employer National Insurance on the part of
          a termination package above £30,000.
        </p>
        <p className={bodyClass}>
          Two common misunderstandings are worth clearing up. First,
          notice pay is not part of the £30,000 allowance at all: pay in
          lieu of notice is taxed as ordinary earnings from the first
          pound, along with holiday pay and any wages owed — our{" "}
          <Link href="/notice-period-calculator" className={linkClass}>
            notice period calculator
          </Link>{" "}
          works out the notice itself. Second, the tax-free status does
          not depend on the payment being labelled “redundancy” — a
          settlement sum for giving up the job counts towards the same
          limit, while a payment for an injury or a pension contribution
          made by the employer is treated under different rules. If your
          package is anywhere near £30,000, the split between its parts
          matters as much as the total, and it is worth taking advice
          before signing anything. Our{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows what the taxable slice would leave you after Income Tax
          and National Insurance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What else are you owed when the job ends?</h2>
        <p className={bodyClass}>
          Redundancy pay is only one of three payments that usually fall
          due. Notice: your employer must give at least the statutory
          minimum — 1 week after a month&apos;s service, then a week for
          each complete year up to 12 weeks at 12 years — or whatever
          longer notice your contract promises, and if you are not
          required to work it, the pay for it is owed as well (taxed as
          earnings, as explained above). Holiday: any statutory holiday
          you have built up but not taken must be paid in your final
          pay, worked out by the (A × B) − C formula our{" "}
          <Link href="/holiday-pay-calculator" className={linkClass}>
            holiday pay calculator
          </Link>{" "}
          applies, with entitlement itself explained in the{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>
          . And paperwork: you are legally entitled to a written
          statement showing how your redundancy payment was calculated —
          ask for it, and check it line by line against the year-by-year
          table this calculator prints.
        </p>
        <p className={bodyClass}>
          Timing matters too. Redundancy pay should be paid on your
          last day or on an agreed date shortly after; unreasonable
          delay is itself a claim. During your notice period you are
          entitled to reasonable paid time off to look for work or
          arrange training if you have 2 years of service, and you can
          sometimes leave early for a new job by giving counter-notice
          without losing your redundancy pay, if your employer agrees
          (or a tribunal later finds the refusal unreasonable). Finally,
          check the knock-on effects before you spend the payment: a
          redundancy lump sum can affect means-tested benefits, and if
          you are close to pension age the interaction with your pension
          is worth modelling — the{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          shows how long a pot lasts once work stops.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          What if your employer will not or cannot pay?
        </h2>
        <p className={bodyClass}>
          If the employer is insolvent, the state steps in: the
          Redundancy Payments Service pays statutory redundancy pay,
          up to 8 weeks of unpaid wages, accrued holiday pay for up to 6
          weeks, and statutory notice pay, all from the National
          Insurance Fund. Apply within 6 months of the job ending. If
          the employer is trading but refuses, or has made an error, the
          route is Acas early conciliation followed by an employment
          tribunal claim for the redundancy payment — the deadline is 3
          months less a day from the date the payment should have been
          made, and it is strictly enforced, so do not let a promise of
          “we&apos;re sorting it” run the clock down.
        </p>
        <p className={bodyClass}>
          Before it reaches that point, most disputes are arithmetic.
          The three errors behind most underpayments are a wrong start
          date (service from a predecessor employer or a transferred
          business left out), the wrong week&apos;s pay (an average
          taken over a period that includes unpaid or sick weeks, or
          the wrong year&apos;s cap), and age bands applied to the age
          at leaving instead of the age in each year of service — the
          mistake that quietly removes the top-band years. Run your own
          dates through the calculator, compare the year-by-year table
          with the employer&apos;s written statement, and put the
          difference to them in writing. Employers reading this from the
          other side can check the payroll side of a leaving payment —
          including how it is reported — with our{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Statutory rates used by this calculator</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Maximum week&apos;s pay (from 6 April 2026)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(REDUNDANCY.weeklyPayCap)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Maximum statutory redundancy pay</td>
                <td className="px-4 py-2">
                  {gbp.format(REDUNDANCY.maxStatutoryPay)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Service that counts</td>
                <td className="px-4 py-2">At most 20 complete years</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Service needed to qualify</td>
                <td className="px-4 py-2">At least 2 complete years</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Tax-free limit, termination payments</td>
                <td className="px-4 py-2">£30,000 combined</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {PAYE_RATES_LABEL}. Rules verified 20 November 2026.
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

      <section className="space-y-4 print:hidden">
        <h2 className={h2Class}>Related calculators</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/notice-period-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Notice Period Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Your last day and your notice entitlement, from your start
              date, contract terms and who gave notice.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/holiday-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Holiday Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The holiday pay owed in your final pay packet, by the
              statutory (A × B) − C formula — plus pay for holiday taken.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/employer-cost-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer Cost Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              For employers: the full cost of a role, including employer
              National Insurance and workplace pension contributions.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What the taxable part of a leaving package leaves you after
              Income Tax and National Insurance.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
      <SubscribeBox />
    </div>
  );
}
