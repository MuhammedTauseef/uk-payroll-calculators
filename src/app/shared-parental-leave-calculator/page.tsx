import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SharedParentalLeaveCalculator, {
  SplEligibilityChecker,
} from "@/components/SharedParentalLeaveCalculator";
import { calculateSharedParentalLeave } from "@/lib/shared-parental-leave";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/shared-parental-leave-calculator",
  "Shared Parental Leave Calculator UK — Blocks, Deadlines & ShPP",
  "Free shared parental leave calculator for 2025/26 and 2026/27 — plan both parents' blocks with real dates, 8-week notice deadlines, the first-birthday cut-off and shared parental pay at £194.32 a week, each week at the rate in force.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Worked example 1 — GOV.UK's own example, run through the same
// engine the calculator above uses: a mother on £300 a week
// (£15,600 a year) who takes 22 weeks of maternity leave and SMP,
// leaving 30 weeks of leave and 17 weeks of pay to share.
const exOfficial = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 15600,
  partnerAnnualSalary: 0,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [],
});

// Worked example 2 — a mother on £30,000 whose partner on £36,000
// takes the 17 shared pay weeks in one block from the day her
// maternity leave ends.
const exShared = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 30000,
  partnerAnnualSalary: 36000,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2026-11-02", weeks: 17 }],
});

// Worked example 3 — a partner on £10,000 a year, whose 90% figure
// (£173.08 a week) sits below the flat rate and caps their pay.
const exLow = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 30000,
  partnerAnnualSalary: 10000,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2026-11-02", weeks: 5 }],
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is shared parental leave?",
    answer:
      "Shared parental leave lets two parents share up to 50 weeks of leave and up to 37 weeks of pay from the mother's 52 weeks of maternity leave and 39 weeks of maternity pay. The mother ends (curtails) her maternity leave and pay early, and what is left becomes a shared pool either parent can take — in up to 3 blocks each — at any point before the baby's first birthday. The first 2 weeks after the birth (4 for factory workers) are compulsory maternity leave and can never be shared.",
  },
  {
    question: "How much is shared parental pay in 2026/27?",
    answer:
      "Statutory shared parental pay is £194.32 a week in 2026/27, or 90% of the average weekly earnings of the parent taking the week if that is lower. It was £187.18 a week in 2025/26. Each week is paid at the rate in force on the day the week starts, so a block that straddles 6 April is paid at both rates. The pay pool is 37 weeks in total — the mother's 39 weeks of maternity pay minus the weeks she takes herself.",
  },
  {
    question: "Who is eligible for shared parental leave?",
    answer:
      "Both parents have a test to pass. The mother must be an employee who has worked for the same employer for at least 26 weeks by the end of the 15th week before the due date, and must still be with that employer when her shared leave starts; for the pay she must also earn at least the lower earnings limit (£129 a week in 2026/27) on average. The other parent must have worked in at least 26 of the 66 weeks before the due week and earned at least £390 in total across any 13 of those weeks. A parent taking their own blocks must be an employee of their own employer — workers can share the pay but not take the leave. The scheme covers England, Scotland and Wales, not Northern Ireland.",
  },
  {
    question: "Can both parents take shared parental leave at the same time?",
    answer:
      "Yes. The two of you can be off together, take turns, or mix the two — the only limit is the pool. Every week either of you takes comes out of the same 50 weeks of leave and 37 weeks of pay, so a week when you are both off uses 2 weeks of each pool. Overlapping at the start is popular: the partner takes shared leave alongside the mother's maternity leave (once she has given her binding notice), which is separate from their 2 weeks of paternity leave.",
  },
  {
    question: "Do we have to take shared parental leave in one block?",
    answer:
      "No — each parent can take up to 3 separate blocks, and more if the employer agrees. Blocks are booked with at least 8 weeks' written notice of the dates, and a block is normally a continuous run of whole weeks; splitting a block into separate single weeks (discontinuous leave) needs the employer's agreement. Each parent also gets up to 20 SPLIT days — days they can work during shared leave without ending it — on top of the mother's 10 KIT days during maternity leave.",
  },
  {
    question: "When does shared parental leave have to be taken by?",
    answer:
      "Everything — every block of leave and every week of pay — must be taken before the baby's first birthday (or the first anniversary of an adoption placement). Weeks left in the pool after that are lost; they cannot be carried into holiday or paid out. Work backwards from the birthday: the last block needs its 8 weeks' notice too, so in practice the final notice deadline falls about 8 weeks before the last block starts.",
  },
  {
    question: "Does shared parental pay replace paternity pay?",
    answer:
      "No. The partner's 2 weeks of paternity leave and Statutory Paternity Pay are separate and are not taken out of the shared pool. Paternity leave can be taken before or after shared parental leave, and for babies born on or after 6 April 2026 GOV.UK's guidance for parents says it can also be taken between blocks of shared parental leave. Taking shared leave first does not use up paternity leave, but paternity leave generally has to be taken within the first year too — check the paternity pay calculator for its own dates and deadlines.",
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
  name: "Shared Parental Leave Calculator UK",
  url: `${AppConfig.siteUrl}/shared-parental-leave-calculator`,
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

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

export default function SharedParentalLeaveCalculatorPage() {
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
          Shared Parental Leave Calculator UK
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Shared parental leave is the one part of the baby year that is
          genuinely yours to design — up to 50 weeks of leave and 37
          weeks of pay, split between two parents, in blocks, together
          or in turns. It is also the part with the sharpest deadlines:
          8 weeks&apos; notice for every block and a hard stop at the
          first birthday. This calculator plans the whole thing from
          your due date — blocks, dates, notice deadlines and pay — in
          one go, free and with no sign-up.
        </p>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            The mother can share everything from her 52 weeks of
            maternity leave and 39 weeks of pay except the first 2
            weeks after the birth — up to 50 weeks of leave and 37
            weeks of shared parental pay at £194.32 a week in 2026/27
            (or 90% of the taking parent&apos;s earnings if lower),
            taken in up to 3 blocks each, with 8 weeks&apos; notice per
            block, all before the baby&apos;s first birthday.
          </p>
        </div>
      </section>

      <SharedParentalLeaveCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What is shared parental leave?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Shared parental leave (SPL) exists because maternity leave, on
          its own, gives a family exactly one shape of year: the mother
          off, the other parent back at work after a fortnight. SPL
          turns the mother&apos;s entitlement into a shared pool the two
          parents divide between them. She ends — the official word is
          curtails — her maternity leave and her Statutory Maternity Pay
          (SMP) early, and whatever she has not used becomes available
          to both of them as shared parental leave and statutory shared
          parental pay (ShPP). This page is part of UK Payroll
          Calculators (payrollcalc.co.uk), a free hub of UK pay and tax
          calculators, and every figure on it follows GOV.UK&apos;s
          published guidance on shared parental leave and pay. Two facts
          worth quoting exactly: the pool is at most 50 weeks of leave
          and 37 weeks of pay, because 2 of the 52 maternity weeks are
          compulsory and can never be shared; and every week of it must
          be taken before the child&apos;s first birthday, or it is
          lost.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The mother does not have to go back to work for the pool to
          exist — she can stay on maternity leave while her partner
          takes shared leave out of the pool, as long as she has given
          her employer a binding notice with the date her maternity
          leave will end. That one detail is what makes the popular
          patterns possible: both parents off together in the early
          weeks, the partner taking a long block when the mother goes
          back, or the two alternating month by month. Once maternity
          leave or pay has been ended, though, it cannot be restarted —
          a curtailed week is gone for good, which is why the plan
          matters before any notice is handed in. If the mother is
          staying on maternity leave for the whole year instead, the{" "}
          <Link href="/maternity-pay-calculator" className={linkClass}>
            maternity pay calculator
          </Link>{" "}
          works out her 39 weeks of SMP on its own, and NHS staff have
          their own occupational scheme in the{" "}
          <Link href="/nhs-maternity-pay-calculator" className={linkClass}>
            NHS maternity pay calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does this calculator work out your plan?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Four steps, in the order the rules apply them:
        </p>
        <ol className="max-w-2xl list-decimal space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>The pool is created.</strong> Leave pool = 52 −
            the weeks of maternity leave the mother takes. Pay pool =
            39 − the weeks of SMP she takes. Take 22 weeks of each, as
            in GOV.UK&apos;s example below, and the pool is 30 weeks
            of leave and 17 weeks of pay.
          </li>
          <li>
            <strong>The mother&apos;s SMP is priced.</strong> Her
            first 6 weeks pay 90% of her average weekly earnings with
            no cap; the rest pay the flat rate, or 90% of her earnings
            if that is lower.
          </li>
          <li>
            <strong>Your blocks are priced week by week.</strong>{" "}
            Each week of shared leave pays the flat rate in force on
            the day that week starts, capped at 90% of the earnings of
            the parent taking it — the partner&apos;s weeks are capped
            on the partner&apos;s pay, not the mother&apos;s. Weeks
            are paid from the pool in date order; once the 37-week pay
            pool is used up, further blocks are unpaid leave.
          </li>
          <li>
            <strong>The deadlines are worked backwards.</strong> Every
            block needs 8 weeks&apos; written notice, so each start
            date produces a notice-by date — and the binding notice
            that ends the mother&apos;s maternity leave needs the same
            8 weeks before her leave ends.
          </li>
        </ol>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three simplifications to know about. Maternity leave is
          counted from the baby&apos;s due date; if the mother&apos;s
          leave actually starts earlier, her dates all move earlier by
          the same amount, but the week counts and pay do not change.
          Average weekly earnings are taken as annual salary ÷ 52 — the
          statutory measure uses the 8 weeks before the qualifying
          week, which your payslips can refine; the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows the deductions side of the same pay. And all figures
          here are statutory pay before Income Tax and National
          Insurance — shared parental pay is taxed like ordinary pay,
          so the amount that reaches a bank account is lower; the{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows what a given salary nets after both.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are the shared parental leave rates in 2025/26 and
          2026/27?
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Rule</th>
                <th className={thClass}>2025/26</th>
                <th className={thClass}>2026/27</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Shared parental pay (and SMP after week 6)
                </td>
                <td className={tdClass}>£187.18 a week</td>
                <td className={tdClass}>£194.32 a week</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  …or, if lower, 90% of the taking parent&apos;s average
                  weekly earnings
                </td>
                <td className={tdClass}>applies in both years</td>
                <td className={tdClass}>applies in both years</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Lower earnings limit (average pay needed for ShPP)
                </td>
                <td className={tdClass}>£125 a week</td>
                <td className={tdClass}>£129 a week</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Shared pool — leave
                </td>
                <td className={tdClass}>up to 50 weeks</td>
                <td className={tdClass}>up to 50 weeks</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Shared pool — pay
                </td>
                <td className={tdClass}>up to 37 weeks</td>
                <td className={tdClass}>up to 37 weeks</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Compulsory maternity leave (never shared)
                </td>
                <td className={tdClass}>2 weeks (4 for factory workers)</td>
                <td className={tdClass}>2 weeks (4 for factory workers)</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Blocks per parent
                </td>
                <td className={tdClass}>up to 3 each</td>
                <td className={tdClass}>up to 3 each</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Notice for each block
                </td>
                <td className={tdClass}>at least 8 weeks, in writing</td>
                <td className={tdClass}>at least 8 weeks, in writing</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  SPLIT days (work during shared leave)
                </td>
                <td className={tdClass}>up to 20 per parent</td>
                <td className={tdClass}>up to 20 per parent</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  Cut-off
                </td>
                <td className={tdClass}>baby&apos;s first birthday</td>
                <td className={tdClass}>baby&apos;s first birthday</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The rate change on 6 April catches people out because it
          applies week by week, not to the whole plan. A block that
          starts in March and runs into April is paid at £187.18 for
          the weeks starting before 6 April 2026 and £194.32 for the
          weeks starting on or after it — this calculator applies the
          change automatically, which is why two otherwise identical
          blocks can pay slightly different totals. Rates for years
          after 2026/27 are announced each autumn; until the 2027/28
          rate is published, weeks after 5 April 2027 are shown at the
          2026/27 rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: GOV.UK&apos;s 22-week mother
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          GOV.UK&apos;s own example is the cleanest way to see the
          pool: a mother takes 22 weeks of maternity leave and 22
          weeks of SMP, which leaves{" "}
          <strong>{exOfficial.leavePoolWeeks} weeks of shared leave</strong>{" "}
          and <strong>{exOfficial.payPoolWeeks} weeks of shared pay</strong>{" "}
          for the two parents to divide. On earnings of £300 a week her
          SMP is 6 weeks at 90% — £270 a week — followed by 16 weeks at
          the flat rate of {gbp.format(194.32)}, a total of{" "}
          {gbp.format(exOfficial.motherSmp.total)}. When she moves onto
          shared leave herself, GOV.UK&apos;s example keeps her on the
          same {gbp.format(194.32)} a week: after week 6 the flat rate
          follows the family whichever parent takes the week and
          whichever scheme pays it. That is the single most useful fact
          about the whole system — past the first 6 weeks, the
          household is usually paid the same whoever is at home, so the
          decision becomes about time, not money.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The dates in this example: a baby due on 1 June 2026, the
          mother&apos;s maternity leave ending on{" "}
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${exOfficial.dates.maternityEnd}T00:00:00Z`))}
          , and the binding notice for that end date due 8 weeks
          earlier. Every block either parent books after that needs
          its own 8 weeks&apos; notice, and the last week of anything
          must finish before 1 June 2027 — the first birthday.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Does sharing cost us money? The three-way comparison
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Take a mother on £30,000 and a partner on £36,000, with the
          same 22-week curtailment. If the mother simply takes
          everything, her 39 weeks of SMP come to{" "}
          {gbp.format(exShared.scenarios.motherTakesAll.payTotal)}. If
          instead the partner takes the 17 shared pay weeks in one
          block from the day her maternity leave ends, the household
          receives {gbp.format(exShared.motherSmp.total)} of SMP plus{" "}
          {gbp.format(exShared.partner.shppTotal)} of ShPP —{" "}
          <strong>{gbp.format(exShared.householdPayTotal)}</strong> in
          total, exactly the same, because every shared week sits after
          week 6 and pays both parents the same flat rate. The
          calculator above runs this comparison on your own figures
          live, including the half-and-half split.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Sharing genuinely costs money in only two situations. The
          first is moving a week out of the mother&apos;s first 6
          weeks: those pay 90% of her earnings with no cap, so a week
          surrendered there swaps her highest-paid week for a flat-rate
          week — and in any case the first 2 weeks cannot move at all.
          The second is a low-earning partner: on £10,000 a year, 90%
          of the partner&apos;s earnings is {gbp.format(173.08)} a
          week, below the flat rate, so each of their shared weeks
          pays {gbp.format(194.32 - 173.08)} less than the same week
          would pay the mother — {gbp.format(exLow.partner.shppTotal)}{" "}
          across a 5-week block instead of{" "}
          {gbp.format(5 * 194.32)}. Neither effect is a reason not to
          share; both are reasons to choose <em>which</em> weeks each
          parent takes. The same £100,000 line that governs childcare
          support can also bite in a baby year — a partner keeping a
          high salary while the mother shares leave may want the{" "}
          <Link
            href="/adjusted-net-income-calculator"
            className={linkClass}
          >
            adjusted net income calculator
          </Link>{" "}
          open in the next tab, and the{" "}
          <Link href="/childcare-calculator" className={linkClass}>
            Tax-Free Childcare calculator
          </Link>{" "}
          for what the family can claim once the leave year ends.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Who is eligible for shared parental leave? A 60-second check
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Eligibility is where most plans quietly fail, because the two
          parents face different tests and both have to pass. The
          mother must be an <em>employee</em> (not just a worker) with
          26 weeks&apos; service for the same employer by the end of
          the 15th week before the due date, still with that employer
          when her shared leave starts, and — for the pay — average
          earnings at or above the lower earnings limit. The other
          parent faces a looser work test instead: work in at least 26
          of the 66 weeks before the due week, with at least £390
          earned across any 13 of those weeks; self-employment counts
          towards that test. Answer the six questions and the checker
          applies both tests the way GOV.UK sets them out:
        </p>
        <SplEligibilityChecker />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two consequences worth knowing before you plan around them.
          A mother who gets Maternity Allowance rather than SMP — often
          because she changed jobs or is self-employed — can still
          create a shared pool for her partner by ending the allowance
          early, although she cannot take shared leave herself. And a
          parent who is a worker rather than an employee can share the
          pay but cannot take the leave, which is why agency and
          zero-hours arrangements need a conversation with the employer
          before any dates are promised. Couples planning the return to
          work should also run the{" "}
          <Link href="/paternity-pay-calculator" className={linkClass}>
            paternity pay calculator
          </Link>{" "}
          — the partner&apos;s 2 weeks of paternity leave sit outside
          the shared pool entirely and have their own deadlines.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What dates and deadlines do you need to hit?
        </h2>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>The binding notice.</strong> Before any shared
            leave exists, the mother gives her employer a binding
            notice stating the date her maternity leave (and, separately
            or together, her pay) will end — at least 8 weeks before
            that end date. It is called binding because ended maternity
            leave and pay cannot be restarted.
          </li>
          <li>
            <strong>Eight weeks per block.</strong> Every block, for
            either parent, needs at least 8 weeks&apos; written notice
            of its dates to that parent&apos;s own employer — and
            changing a booked block needs another 8 weeks. The
            calculator prints the notice-by date next to every block
            for exactly this reason.
          </li>
          <li>
            <strong>The first birthday.</strong> All leave and pay must
            be taken before the baby turns one. There is no carry-over
            into annual leave and no payment in lieu — a pool week
            still unused at the birthday simply disappears, which is
            why the plan above shows unused weeks in plain sight.
          </li>
          <li>
            <strong>Three blocks, then negotiation.</strong> Each
            parent can book up to 3 blocks as of right. A fourth block,
            or splitting one block into scattered single weeks, is
            possible only with the employer&apos;s agreement — ask
            early, while there is still time to fall back to 3 tidy
            blocks.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Around the edges of the plan sit the days designed for
          keeping in touch: up to 20 SPLIT days per parent during
          shared leave, plus the mother&apos;s 10 KIT days during
          maternity leave. They are optional, paid by agreement, and do
          not end the leave — useful for handovers, training days and
          easing back in. What they are not is extra leave: the pools
          above are the whole entitlement. When the leave year ends,
          ordinary entitlements resume — holiday accrues throughout
          shared leave exactly as it does through maternity leave, and
          the{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          works out what a returner is owed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does this calculator not cover?
        </h2>
        <ul className="max-w-2xl list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Enhanced and occupational pay.</strong> Many
            employers top up shared parental pay — some match their
            maternity scheme, some pay full salary for a set number of
            weeks. The statutory figures here are the floor, not your
            contract; check both employers&apos; policies before
            treating any total as final.
          </li>
          <li>
            <strong>Tax and National Insurance on the pay.</strong>{" "}
            Figures are gross statutory amounts. What lands in the bank
            depends on each parent&apos;s tax code and the rest of
            their year — the{" "}
            <Link href="/salary-sacrifice-calculator" className={linkClass}>
              salary sacrifice calculator
            </Link>{" "}
            and the take-home tools on this site cover that side.
          </li>
          <li>
            <strong>Adoption and surrogacy in full.</strong> The same
            pool exists for adopters — 52 weeks of adoption leave and
            39 weeks of Statutory Adoption Pay, shared the same way
            from the placement date — but the qualifying week and
            evidence differ, so treat the numbers as the shape of the
            answer, not the answer.
          </li>
          <li>
            <strong>Northern Ireland.</strong> Shared parental leave
            and pay apply in England, Scotland and Wales only.
          </li>
          <li>
            <strong>Twins and multiples.</strong> The entitlement is
            per pregnancy, not per baby — one pool, one first-birthday
            cut-off, however many babies arrive.
          </li>
        </ul>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One more planning point couples often miss: the two
          employers do not talk to each other. Each parent books with
          their own employer, on their own notice, and the pools only
          balance if the family keeps the count — which is the entire
          reason this page prints a single shared plan you can take to
          both. If one parent is between jobs, the{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            SSP calculator
          </Link>{" "}
          and the rest of the hub cover the surrounding entitlements,
          and couples where one partner earns under the tax threshold
          should check the{" "}
          <Link href="/marriage-allowance-calculator" className={linkClass}>
            marriage allowance
          </Link>{" "}
          — a baby year is exactly when the £252 transfer most often
          goes unclaimed.
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

      <section className="space-y-3">
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Sources: GOV.UK,{" "}
          <a
            href="https://www.gov.uk/shared-parental-leave-and-pay"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Shared Parental Leave and Pay
          </a>{" "}
          (eligibility, the 50-week and 37-week pools, blocks, notice
          and the worked example) and GOV.UK&apos;s rates and
          thresholds for employers (ShPP at £187.18 a week in 2025/26
          and £194.32 in 2026/27; lower earnings limit £125, then
          £129). This calculator applies those rules and is a planning
          guide, not advice — your employers confirm eligibility and
          enhanced pay from your contracts, and HMRC decides any
          dispute about statutory pay.
        </p>
      </section>

      <RelatedCalculators href="/shared-parental-leave-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
