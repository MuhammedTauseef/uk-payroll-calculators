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
  "/how-is-ssp-calculated",
  "How is SSP Calculated?",
  "How SSP is calculated in three steps: the weekly amount (the lower of £123.25 or 80% of earnings), the daily rate, and payment per qualifying day absent.",
);

const FAQS: GuideFaq[] = [
  {
    question: "Who calculates SSP — me or my employer?",
    answer:
      "Your employer (or their payroll provider) calculates SSP, using your earnings and working pattern from their payroll records. You do not have to claim it or fill in a calculation yourself — but you can check the figures with a free SSP calculator, and if the result looks wrong, ask payroll to show you their working.",
  },
  {
    question: "Do weekends count in the SSP calculation?",
    answer:
      "Only if they are days you normally work. The calculation counts qualifying days — your normal working days — and ignores the rest. For a Monday-to-Friday worker, a weekend inside a sickness spell adds nothing; for a weekend worker, those same days are exactly what gets paid.",
  },
  {
    question: "What if my earnings change from week to week?",
    answer:
      "That is precisely why the calculation uses average weekly earnings rather than last week's pay. Variable pay — overtime, commission, shift work — is averaged over the weeks before the sickness, so one unusually good or bad week does not skew the SSP amount.",
  },
  {
    question: "Can an employer calculate SSP in a different way?",
    answer:
      "An employer can run a more generous company sick pay scheme and pay more than SSP, on their own terms. What they cannot do is use a method that leaves the employee worse off than the statutory calculation — the three-step SSP method sets the legal floor for every sickness spell.",
  },
  {
    question: "Where does the 28-week limit fit into the calculation?",
    answer:
      "At the days-payable step. The total qualifying days that can ever be paid in one period is 28 times the weekly qualifying days, including any days already paid in a linked spell. Once that count is reached, the calculation produces £0 for further days until a new, unlinked period begins.",
  },
];

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function HowIsSspCalculatedPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          How is SSP calculated?
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          SSP is calculated in three steps. First, the weekly amount is set
          at the lower of {gbp.format(SSP.weeklyCap)} or{" "}
          {SSP.aweFraction * 100}% of average weekly earnings. Second, that
          weekly amount is divided by the employee&apos;s qualifying days to
          give a daily rate. Third, the daily rate is paid for each
          qualifying day of absence, up to {SSP.maxWeeks} weeks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Step 1: work out the weekly amount
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every SSP calculation starts with average weekly earnings — the
          employee&apos;s normal weekly pay. From that figure, take{" "}
          {SSP.aweFraction * 100}% and compare it with the flat statutory
          rate of {gbp.format(SSP.weeklyCap)}: the weekly SSP amount is
          whichever is lower. Average earnings of {gbp.format(300)} give an{" "}
          {SSP.aweFraction * 100}% figure of {gbp.format(240)}, so the flat
          rate wins and the weekly amount is {gbp.format(SSP.weeklyCap)}.
          Average earnings of {gbp.format(120)} give{" "}
          {gbp.format(96)} — lower than the flat rate — so the weekly amount
          is {gbp.format(96)}. This single comparison is the heart of the
          calculation; everything after it is splitting the weekly amount
          across days. If you want the amounts at other pay levels, see{" "}
          <Link
            href="/how-much-is-ssp-per-week"
            className="font-medium text-brand-800 dark:text-brand-300 underline"
          >
            how much SSP is per week
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Step 2: turn the weekly amount into a daily rate
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          SSP is paid per day, so the weekly amount is divided by the
          employee&apos;s qualifying days — the days of the week they
          normally work, agreed between employer and employee. A
          Monday-to-Friday employee has five qualifying days; a three-day
          worker has three. A weekly amount of {gbp.format(SSP.weeklyCap)}{" "}
          therefore becomes a daily rate of {gbp.format(24.65)} for the
          five-day worker and {gbp.format(41.09)} for the three-day worker.
          The weekly total is identical either way — the division simply
          matches the payment to each employee&apos;s working pattern, so
          part-weeks of sickness can be paid accurately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Step 3: pay for each qualifying day absent
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Finally, multiply the daily rate by the number of qualifying days
          the employee is absent. Payment runs from the first full day of
          sickness — there are no waiting days to subtract. Only qualifying
          days count: days the employee would not normally work are never
          paid and never use up entitlement. The entitlement itself is
          capped at {SSP.maxWeeks} weeks of qualifying days in one period,
          and sickness spells eight weeks or less apart are linked, so days
          already paid in an earlier linked spell reduce what is left. Our
          guide to{" "}
          <Link
            href="/what-is-statutory-sick-pay"
            className="font-medium text-brand-800 dark:text-brand-300 underline"
          >
            what SSP is
          </Link>{" "}
          explains the rules around the calculation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: the full calculation
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An employee with average weekly earnings of {gbp.format(350)},
          working five qualifying days a week, is off sick for eight
          qualifying days. Step 1: {SSP.aweFraction * 100}% of{" "}
          {gbp.format(350)} is {gbp.format(280)} — above the flat rate, so
          the weekly amount is {gbp.format(SSP.weeklyCap)}. Step 2:{" "}
          {gbp.format(SSP.weeklyCap)} divided by five qualifying days is a
          daily rate of {gbp.format(24.65)}. Step 3: eight days at{" "}
          {gbp.format(24.65)} comes to {gbp.format(197.2)} of SSP in total.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Now the same absence for a lower-paid colleague earning{" "}
          {gbp.format(90)} a week over three qualifying days. Step 1:{" "}
          {SSP.aweFraction * 100}% of {gbp.format(90)} is {gbp.format(72)} —
          below the flat rate, so the weekly amount is {gbp.format(72)}.
          Step 2: {gbp.format(72)} divided by three qualifying days is a
          daily rate of {gbp.format(24)}. Step 3: if two of their days fall
          in the spell, the SSP payable is {gbp.format(48)}. Same three
          steps, same rules — only the earnings and the working pattern
          changed. The free{" "}
          <Link
            href="/ssp-calculator"
            className="font-medium text-brand-800 dark:text-brand-300 underline"
          >
            SSP calculator
          </Link>{" "}
          runs exactly this calculation, linked spells included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How are average weekly earnings worked out?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Average weekly earnings are the employee&apos;s normal weekly pay,
          based on what they were actually paid in the weeks running up to
          the sickness — the figures already sitting in the employer&apos;s
          payroll records. Using an average, rather than the single last pay
          packet, smooths out overtime, bonuses and quiet weeks, so the SSP
          amount reflects what the employee typically earns. It is fixed at
          the start of the sickness period and is the figure the{" "}
          {SSP.aweFraction * 100}% comparison in step 1 is applied to. If
          earnings have only just started — a brand-new employee, for
          example — the average is taken over the pay received so far.
        </p>
      </section>

      <SspRatesTable />

      <CalculatorCta />

      <SiblingGuides currentHref="/how-is-ssp-calculated" />

      <FaqSection faqs={FAQS} />
    </div>
  );
}
