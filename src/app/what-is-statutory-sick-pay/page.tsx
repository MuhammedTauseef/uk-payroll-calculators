import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import {
  CalculatorCta,
  FaqSection,
  SiblingGuides,
  SspRatesTable,
  faqJsonLd,
  type GuideFaq,
} from "@/components/GuideSections";
import { SSP } from "@/lib/rates";

export const metadata = pageMetadata(
  "/what-is-statutory-sick-pay",
  "What is Statutory Sick Pay (SSP)?",
  "Statutory Sick Pay explained in plain English: what SSP is, who pays it, who qualifies, how much it is under the April 2026 rules and how long it lasts.",
);

const FAQS: GuideFaq[] = [
  {
    question: "Is Statutory Sick Pay paid by the government?",
    answer:
      "No. SSP is paid by your employer, through the normal payroll, in the same way as your ordinary wages. The government sets the rate and the rules, but the money comes from the employer — and the employer cannot claim any of it back from HMRC.",
  },
  {
    question: "Can part-time workers get Statutory Sick Pay?",
    answer:
      "Yes. Part-time employees qualify on exactly the same terms as full-time staff. Their SSP is worked out from their own average weekly earnings and their own pattern of qualifying days, and there is no minimum amount they must earn before SSP can be paid.",
  },
  {
    question: "Can my employer pay me less than SSP?",
    answer:
      "No. SSP is a legal minimum: an employer can pay more than SSP under a company sick pay scheme, but never less than the SSP an employee is entitled to. If an employer believes an employee does not qualify, they must explain why in writing and provide form SSP1 so the employee can look at other support.",
  },
  {
    question: "Is Statutory Sick Pay taxed?",
    answer:
      "Yes. SSP goes through the payroll like normal wages, so income tax and National Insurance are deducted in the usual way when total pay passes the normal thresholds. The £123.25 weekly figure is the gross amount before those deductions.",
  },
  {
    question: "How soon does Statutory Sick Pay start?",
    answer:
      "From the first full day of sickness. Under the April 2026 rules there are no unpaid waiting days at the start of a sickness spell — SSP runs from day one, for the qualifying days the employee would normally have worked.",
  },
];

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function WhatIsStatutorySickPayPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What is Statutory Sick Pay?
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Statutory Sick Pay (SSP) is the legal minimum an employer must pay
          an employee who is off work sick. Under the April 2026 rules, it is
          the lower of {gbp.format(SSP.weeklyCap)} a week or{" "}
          {SSP.aweFraction * 100}% of the employee&apos;s average weekly
          earnings, it is paid from the first full day of sickness, and it
          can last up to {SSP.maxWeeks} weeks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Who pays Statutory Sick Pay — the employer or the government?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The employer pays it. SSP is not a benefit claimed from the state:
          it is a legal obligation that sits with whoever employs the person
          who is sick. The employer works out the amount, pays it through
          the normal payroll on the usual payday, and deducts tax and
          National Insurance in the normal way. The government&apos;s role
          is to set the rate and the rules that every employer must follow.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The full cost sits with the employer too. Unlike some statutory
          payments, SSP cannot be reclaimed from HMRC, so the amount worked
          out on this page — and in the{" "}
          <Link
            href="/ssp-calculator"
            className="font-medium text-brand-800 underline"
          >
            SSP calculator
          </Link>{" "}
          — is both what the employee receives (before tax) and what the
          employer has to fund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Who qualifies for SSP?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          SSP covers people who work for an employer as an employee —
          full-time, part-time, fixed-term and agency workers can all
          qualify. The basic conditions are that the person is employed, is
          too sick to work, and is absent on days they would normally have
          worked (their qualifying days). The employee must also tell the
          employer they are sick, following the employer&apos;s normal
          reporting rules.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          One older barrier has gone: there is no longer a lower earnings
          limit for SSP. Under the April 2026 rules, an employee does not
          have to earn a minimum amount each week before SSP can be paid —
          low-paid and part-time staff are covered in the same way as
          everyone else, although the amount they receive reflects their
          actual earnings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How much is SSP, and how long does it last?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The weekly amount is the lower of two figures: the flat rate of{" "}
          {gbp.format(SSP.weeklyCap)}, or {SSP.aweFraction * 100}% of the
          employee&apos;s average weekly earnings. That weekly amount is
          divided by the employee&apos;s qualifying days to give a daily
          rate, and the daily rate is paid for each qualifying day of
          absence. Our guide to{" "}
          <Link
            href="/how-is-ssp-calculated"
            className="font-medium text-brand-800 underline"
          >
            how SSP is calculated
          </Link>{" "}
          walks through each step.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          SSP can be paid for up to {SSP.maxWeeks} weeks in one period of
          sickness. If an employee returns to work and is off sick again
          within eight weeks, the spells are linked and count as one period
          — the {SSP.maxWeeks}-week limit covers both together. For the
          amounts at different pay levels, see{" "}
          <Link
            href="/how-much-is-statutory-sick-pay"
            className="font-medium text-brand-800 underline"
          >
            how much SSP is
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          What does SSP look like in practice?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Take an employee whose average weekly earnings are{" "}
          {gbp.format(400)}, who normally works Monday to Friday — five
          qualifying days. First, the weekly amount: {SSP.aweFraction * 100}
          % of {gbp.format(400)} is {gbp.format(320)}, which is higher than
          the flat rate, so the weekly SSP amount is the lower figure,{" "}
          {gbp.format(SSP.weeklyCap)}. Next, the daily rate:{" "}
          {gbp.format(SSP.weeklyCap)} divided by five qualifying days is{" "}
          {gbp.format(24.65)} a day. If that employee is off sick for six
          qualifying days, the SSP payable is six times {gbp.format(24.65)}{" "}
          — {gbp.format(147.9)} in total, starting from the very first day
          of the spell.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Is SSP the same as company sick pay?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          No. Company (or occupational) sick pay is whatever extra scheme an
          employer chooses to offer in the employment contract — it might
          pay full salary for a set number of weeks, for example. SSP is the
          statutory floor underneath it: the legal minimum that applies to
          every employer, whether or not they run their own scheme. Where a
          company scheme exists, the employee receives at least their SSP
          entitlement for the days covered; where there is no scheme, SSP is
          the whole of the sick pay.
        </p>
      </section>

      <SspRatesTable />

      <CalculatorCta />

      <SiblingGuides currentHref="/what-is-statutory-sick-pay" />

      <FaqSection faqs={FAQS} />
    </div>
  );
}
