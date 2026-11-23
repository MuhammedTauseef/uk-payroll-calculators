import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import HolidayPayCalculator from "@/components/HolidayPayCalculator";
import { calculateHolidayPay } from "@/lib/holidaypay";
import { PAYE_RATES_LABEL } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/holiday-pay-calculator",
  "Holiday Pay Calculator — UK 2026/27",
  "Work out holiday pay in pounds: a week's pay for regular staff, the 12.07% accrual for irregular hours, rolled-up pay, and what leavers are owed.",
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

const regular = calculateHolidayPay({
  mode: "regular",
  weeklyPay: 600,
  daysPerWeek: 5,
  daysOfHoliday: 10,
  hoursWorked: 0,
  hourlyRate: 0,
  payForPeriod: 0,
  entitlementWeeks: 5.6,
  proportionOfYearWorked: 0,
  leaveTakenWeeks: 0,
});
const irregular = calculateHolidayPay({
  mode: "irregular",
  weeklyPay: 0,
  daysPerWeek: 0,
  daysOfHoliday: 0,
  hoursWorked: 480,
  hourlyRate: 12,
  payForPeriod: 0,
  entitlementWeeks: 5.6,
  proportionOfYearWorked: 0,
  leaveTakenWeeks: 0,
});
const rolledUp = calculateHolidayPay({
  mode: "rolledup",
  weeklyPay: 0,
  daysPerWeek: 0,
  daysOfHoliday: 0,
  hoursWorked: 0,
  hourlyRate: 0,
  payForPeriod: 1000,
  entitlementWeeks: 5.6,
  proportionOfYearWorked: 0,
  leaveTakenWeeks: 0,
});
const leaving = calculateHolidayPay({
  mode: "leaving",
  weeklyPay: 600,
  daysPerWeek: 5,
  daysOfHoliday: 0,
  hoursWorked: 0,
  hourlyRate: 0,
  payForPeriod: 0,
  entitlementWeeks: 5.6,
  proportionOfYearWorked: 0.75,
  leaveTakenWeeks: 2.4,
});
// One day of holiday for a zero-hours worker: the hours the shift
// would have run (8) at the 52-week average hourly rate from the
// irregular example above (£12) — plain multiplication, shown in
// the copy so the reader can repeat it with their own figures.
const zeroHoursDayHours = 8;
const zeroHoursDayPay = zeroHoursDayHours * 12;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is holiday pay calculated?",
    answer:
      "Holiday pay is based on a week's pay. If your pay is fixed, a week of holiday pays your normal weekly pay, and one day pays that divided by the days you work each week — £600 a week over 5 days is £120 a day. If your pay varies, a week's pay is your average weekly pay across the last 52 weeks in which you were paid.",
  },
  {
    question: "How much is one day's holiday pay?",
    answer:
      "For regular hours, one day pays your weekly pay divided by the days you work in a week: £600 a week over 5 days is £120 for one day. If your pay varies, the same division is applied to your average weekly pay over the last 52 paid weeks. For zero-hours and irregular-hours workers there is no fixed day rate — a day of holiday pays the hours you would have worked that day at your average hourly rate over the last 52 paid weeks, so an 8-hour day at a £12 average rate pays £96, drawn from the holiday hours you have built up at 12.07% of hours worked.",
  },
  {
    question: "How much holiday pay do zero-hours and irregular-hours workers get?",
    answer:
      "For leave years beginning on or after 1 April 2024, you build up holiday at 12.07% of the hours you work in each pay period. When you take the holiday, it is paid at your average hourly rate across the last 52 paid weeks. Working 480 hours at an average of £12 an hour builds up 57.94 hours of holiday, worth £695.23 when taken.",
  },
  {
    question: "Is rolled-up holiday pay legal?",
    answer:
      "Yes, but only for irregular-hours and part-year workers, and only for leave years beginning on or after 1 April 2024. The employer adds at least 12.07% on top of the pay for the work done, pays it with that pay, and shows it as a separate item on the payslip. Rolled-up pay is not lawful for regular-hours workers, whose holiday must be paid when the leave is taken.",
  },
  {
    question: "What holiday pay am I owed when I leave a job?",
    answer:
      "You are paid for statutory holiday you have built up but not taken, using the formula (A × B) − C: A is your full-year entitlement, B is the proportion of the leave year that has passed, and C is the leave you have already taken. If you have taken more than you built up, your employer can only deduct the excess from final pay if you agreed to that in writing beforehand.",
  },
  {
    question: "Does holiday pay include overtime, commission and bonuses?",
    answer:
      "For the first 4 weeks of statutory holiday each year, yes — pay must reflect your normal earnings, including regular overtime, commission and bonuses you would normally receive, which is why variable pay is averaged over 52 weeks. For the remaining 1.6 weeks of the statutory minimum, basic pay is enough unless your contract promises more. Many employers simply use the higher standard for all 5.6 weeks.",
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
  name: "Holiday Pay Calculator",
  url: `${AppConfig.siteUrl}/holiday-pay-calculator`,
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

export default function HolidayPayCalculatorPage() {
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
          Holiday Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Holiday pay is a week&apos;s pay for each week of leave: your
          normal weekly pay if your hours are regular, your average pay
          over the last 52 paid weeks if it varies, or 12.07% of hours
          worked building up as you go if you work irregular hours.
          Choose your situation below and see the money, not just the
          days.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          This page prices holiday in pounds; its companion, the{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>
          , works out how many days or hours of leave you are entitled
          to in the first place. Most holiday-pay disputes are really
          about which of the four methods below applies — so the
          calculator asks that question first.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified
          20 November 2026 against GOV.UK.
        </p>
      </section>

      <HolidayPayCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>How is holiday pay calculated?</h2>
        <p className={bodyClass}>
          Almost everything in holiday pay law comes back to one idea: a
          week&apos;s pay. If you work regular hours for fixed pay, a
          week&apos;s pay is your normal weekly amount, and one day of
          holiday is worth that amount divided by the days in your
          working week — £600 over 5 days is{" "}
          {gbp.format(regular.dailyRate ?? 0)} a day, so two weeks of
          holiday (10 working days) pays{" "}
          {gbp.format(regular.payForDays ?? 0)}, and your full 5.6 weeks
          of statutory leave across a year are worth{" "}
          {gbp.format(regular.fullYearValue ?? 0)}. If your hours are
          fixed but your pay varies — monthly bonuses, fluctuating
          commission — the same shape applies, but a week&apos;s pay is
          an average, worked out over the 52-week reference period
          explained next. And if your pay is hourly and your hours
          change every week, you are probably an irregular-hours worker,
          where the 12.07% method further down this page applies
          instead.
        </p>
        <p className={bodyClass}>
          Part-time staff use exactly the same rules, just scaled: a
          3-day-a-week worker on £360 has the same £120 daily rate as
          the full-timer above, because the weekly pay is divided by 3
          days, not 5. What changes is the number of days of leave, not
          the value of each day — the{" "}
          <Link href="/pro-rata-holiday-calculator" className={linkClass}>
            pro-rata holiday calculator
          </Link>{" "}
          works out the entitlement side for part-time and part-year
          patterns, and our{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          does the same job for pay itself. One more group is often
          missed: workers whose contract gives more than the statutory
          5.6 weeks. The statutory methods on this page price the legal
          minimum; extra contractual days are paid on the same
          week&apos;s-pay basis unless the contract sets a different,
          clear rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How much is one day&apos;s holiday pay?</h2>
        <p className={bodyClass}>
          One day of holiday pays one day&apos;s worth of a
          week&apos;s pay — and the working is short enough to do on
          any payslip. Regular hours: divide the weekly pay by the
          days worked in the week. £600 over 5 days is{" "}
          {gbp.format(regular.dailyRate ?? 0)} for one day, which is
          why a week&apos;s holiday pays exactly a normal week&apos;s
          wages. Variable pay: the same division, applied to the
          52-week average week instead — an average week of £512.40
          over 5 days is £102.48 a day. Zero-hours and irregular
          hours: there is no set day rate, because there is no set
          day. A day of holiday pays the hours that day&apos;s shift
          would have run, at your average hourly rate over the last
          52 paid weeks — an 8-hour shift at a £12 average is{" "}
          {gbp.format(zeroHoursDayPay)} — and the time comes out of
          the holiday hours you have accrued at 12.07% of hours
          worked. If a single day&apos;s holiday pay on your payslip
          does not match one of those three workings, the method —
          not the arithmetic — is the first thing to question.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How does the 52-week reference period work?</h2>
        <p className={bodyClass}>
          When pay varies, a week&apos;s pay is the average of your last
          52 weeks of pay — but only weeks in which you were actually
          paid count. A week with no pay at all (unpaid leave, a gap
          between assignments, a week on no hours) is skipped, and the
          count reaches further back until it has 52 paid weeks, up to a
          maximum of 104 weeks. If you have been employed for less than
          52 weeks, the average uses the weeks you have. The arithmetic
          is simple division — £26,644.80 of pay across 52 paid weeks is
          an average week of £512.40 — but the weeks you include decide
          the answer, which is why the rule about skipping unpaid weeks
          matters: including them would drag the average down for
          exactly the workers the rule protects.
        </p>
        <p className={bodyClass}>
          What goes into each week&apos;s pay matters as much as the
          average. For at least the first 4 weeks of statutory leave
          each year, holiday pay must reflect normal remuneration:
          regular (guaranteed or habitually worked) overtime,
          commission, bonuses and regular allowances all count. For the
          remaining 1.6 weeks of the statutory minimum, the legal floor
          is basic pay only, though many contracts and employers pay the
          higher basis throughout. Practical tip: if your pay has risen
          recently, the 52-week average will lag behind your current
          rate — that is correct in law, not an error. If your hours
          have recently become regular after years of variable work,
          check which basis your employer is using, because the
          difference between a fixed week&apos;s pay and a 52-week
          average can run both ways. Payslips are the evidence for all
          of this — our{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows how a payslip&apos;s figures are built up.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Zero-hours and irregular-hours workers: how holiday pay builds up
        </h2>
        <p className={bodyClass}>
          For leave years beginning on or after 1 April 2024, irregular-
          hours workers (whose paid hours vary in each pay period) and
          part-year workers (contracted all year but only required to
          work part of it, with unpaid weeks) build up holiday as they
          work: 12.07% of the hours worked in each pay period, credited
          on the last day of that period. The 12.07% is not arbitrary —
          it is the statutory 5.6 weeks expressed as a share of the
          46.4 weeks a full-year worker actually works (5.6 ÷ 46.4).
          Fractions of an hour round to the nearest hour — down if the
          part is under 30 minutes, up if it is 30 minutes or more —
          and the total that can build up in a year is capped at 28
          days&apos; worth. When the leave is taken, it is paid at the
          worker&apos;s{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            average hourly rate
          </Link>{" "}
          over the last 52 paid weeks,
          not necessarily the rate for the job that earned it.
        </p>
        <p className={bodyClass}>
          Two situations catch employers out. First, accrual does not
          stop when work does: during sick leave or family leave, an
          irregular-hours worker keeps building up holiday based on
          their average weekly hours over the 52 weeks before the leave
          began — if you are checking a balance after a period on{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            statutory sick pay
          </Link>{" "}
          or{" "}
          <Link href="/paternity-pay-calculator" className={linkClass}>
            paternity leave
          </Link>
          , the hours did not freeze. Second, the new method only
          applies to leave years starting on or after 1 April 2024:
          someone whose leave year runs January to December was under
          the old rules until 1 January 2025, and older balances may
          have been calculated the previous way. If a balance looks
          wrong, ask which leave year and which method produced it
          before arguing about the number itself.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is rolled-up holiday pay allowed?</h2>
        <p className={bodyClass}>
          Rolled-up holiday pay — paying the holiday money with each
          pay packet instead of when leave is taken — is lawful again,
          but only for irregular-hours and part-year workers, and only
          for leave years beginning on or after 1 April 2024. The
          uplift must be at least 12.07% of the pay for the work done in
          that pay period: £1,000 of shift pay carries{" "}
          {gbp.format(rolledUp.rolledUpAmount ?? 0)} of rolled-up
          holiday pay,{" "}
          {gbp.format(rolledUp.rolledUpTotal ?? 0)} in total, and it
          must appear as a separate, identifiable item on the payslip.
          Paying a single blended hourly rate that silently includes
          holiday pay is not compliant — if the holiday element cannot
          be picked out of the payslip, it has not been paid in law.
        </p>
        <p className={bodyClass}>
          For regular-hours workers, rolled-up pay remains unlawful:
          their holiday pay must be paid when the leave is taken, so
          that taking a holiday never means a week without wages. Even
          where rolled-up pay is allowed, it does not remove the right
          to the leave itself — the worker is still entitled to take the
          time off, it is simply unpaid at that point because it was
          paid earlier. Employers using rolled-up pay should still make
          sure workers actually take leave across the year; a worker who
          reaches the year end with pay but no rest is a compliance
          problem, not a saving. If you are a worker trying to check a
          payslip, multiply the period&apos;s gross pay for work done
          by 12.07% and compare it with the separate holiday line — the
          two should match to the penny.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Worked examples with the arithmetic shown</h2>
        <p className={bodyClass}>
          Regular hours. Amara earns £600 a week and works 5 days. Her
          daily holiday rate is £600 ÷ 5 ={" "}
          {gbp.format(regular.dailyRate ?? 0)}. A fortnight&apos;s
          holiday is 10 working days: 10 × £120 ={" "}
          {gbp.format(regular.payForDays ?? 0)} — exactly two normal
          weeks&apos; pay, as it should be. Across a full year, her
          28 days of statutory leave are worth 5.6 × £600 ={" "}
          {gbp.format(regular.fullYearValue ?? 0)}.
        </p>
        <p className={bodyClass}>
          Irregular hours. Ben works variable shifts and has worked 480
          hours so far this leave year at an average of £12 an hour.
          His accrued holiday is 480 × 12.07% ={" "}
          {irregular.accruedHoursExact} hours —{" "}
          {irregular.accruedHoursBooked} hours once the fraction rounds
          to the nearest hour — and when he takes it, it pays{" "}
          {irregular.accruedHoursExact} × £12 ={" "}
          {gbp.format(irregular.accruedPayValue ?? 0)}. Note the two
          different uses of the hours: the exact figure sets the money,
          while the rounded figure is the time he can book.
        </p>
        <p className={bodyClass}>
          Rolled-up pay. Carla is a term-time-only worker. In a month
          where she earns £1,000 for the work done, her employer must
          add at least 12.07% — £1,000 × 0.1207 ={" "}
          {gbp.format(rolledUp.rolledUpAmount ?? 0)} — shown as its own
          payslip line, bringing the month&apos;s pay to{" "}
          {gbp.format(rolledUp.rolledUpTotal ?? 0)}. If her payslip
          shows only a flat hourly rate with no holiday line, the
          £120.70 has not been separately paid.
        </p>
        <p className={bodyClass}>
          Leaving a job. Dev leaves three quarters of the way through
          his leave year. He has built up 5.6 × 0.75 = 4.2 weeks of
          leave and has taken 2.4 weeks (12 days), so he is owed
          4.2 − 2.4 = {leaving.weeksOwed} weeks. At his £600 weekly pay
          that is {leaving.weeksOwed} × £600 ={" "}
          {gbp.format(leaving.paymentInLieu ?? 0)} in his final pay —
          the same £1,080 you get counting in days: 21 days built up,
          12 taken, 9 owed at £120 a day.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What are you owed when you leave a job?</h2>
        <p className={bodyClass}>
          Every leaver is entitled to be paid for statutory holiday
          built up but not taken by the last day — the one kind of
          holiday pay that is always paid in money rather than time.
          The formula is set by law: (A × B) − C, where A is the
          full-year entitlement, B is the proportion of the leave year
          that has passed when the job ends, and C is the leave already
          taken. The result, in weeks, is multiplied by a week&apos;s
          pay. The calculator&apos;s leaving mode does exactly this, and
          it handles the uncomfortable mirror image too: if you have
          taken more than you had built up, the result is negative — but
          your employer can only take that money back out of your final
          pay if there is a written agreement (usually in your contract
          or handbook) allowing it. Without one, the overpayment cannot
          simply be deducted.
        </p>
        <p className={bodyClass}>
          Holiday pay is one of three amounts that typically make up a
          final pay packet, alongside notice pay and, where it applies,
          redundancy pay — the{" "}
          <Link href="/redundancy-pay-calculator" className={linkClass}>
            redundancy pay calculator
          </Link>{" "}
          works that out year by year, and the{" "}
          <Link href="/notice-period-calculator" className={linkClass}>
            notice period calculator
          </Link>{" "}
          finds your last day and notice entitlement. Payment in lieu of
          holiday is taxed as earnings in the usual way, unlike
          statutory redundancy pay, which is tax-free — one reason the
          split of a final payment matters. If your final payslip looks
          short, ask for the (A × B) − C figures in writing: employers
          must be able to show A, B and C, and most errors are in B
          (the proportion of the year) or in leave taken that was
          recorded twice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Why is my holiday pay less than my normal pay?
        </h2>
        <p className={bodyClass}>
          Sometimes it should be, and sometimes it is a warning sign.
          The legitimate reasons come first. A 52-week average lags
          behind you: if your pay rose two months ago, most of the
          weeks in the average are still at the old rate, so holiday
          pay is lower than this month&apos;s normal pay — correct in
          law, and it catches up over the year. The average also
          includes your quieter weeks: a variable-pay worker whose
          strong months are balanced by weak ones is paid the
          average, not the strong month. The first-4-weeks rule cuts
          the other way for some: only the first 4 weeks of statutory
          leave each year must be paid at full normal remuneration
          including regular overtime and commission — the remaining
          1.6 weeks can lawfully be paid at basic pay only, so a
          fifth week of holiday can genuinely pay less than the
          first four. And check you are comparing like with like:
          holiday pay is taxed and charged National Insurance like
          any other pay, so a gross holiday figure set against a net
          normal week always looks short.
        </p>
        <p className={bodyClass}>
          The warning signs are different. Unpaid weeks counted into
          a 52-week average drag it down unlawfully — weeks with no
          pay must be skipped, reaching further back. A fixed
          week&apos;s pay used for a worker whose pay varies, or a
          12.07% accrual applied to a regular-hours worker, are
          method errors, not judgement calls. And if your hourly rate
          has risen but the average your employer uses has not moved
          at all in a year, the reference period is probably stale.
          The next section sets out how to challenge a figure that
          falls on the wrong side of that line.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What can you do if your holiday pay looks wrong?</h2>
        <p className={bodyClass}>
          Start by identifying which of the four methods on this page
          produced the figure, because most errors are method errors,
          not arithmetic errors: a fixed week&apos;s pay used where a
          52-week average was due, a 12.07% accrual applied to a
          regular-hours worker, or unpaid weeks wrongly counted into an
          average. Then ask your employer, in writing, for the figures
          behind the payment — the 52 weekly amounts in an average, or
          the accrual record for irregular hours. Employers have to keep
          pay records, and from 6 April 2026 they must also keep records
          of annual leave and holiday pay, so the numbers exist and you
          are entitled to see how your pay was worked out. Run the same
          inputs through the calculator above and put the two results
          side by side: a difference with the method named is far harder
          to wave away than a general complaint.
        </p>
        <p className={bodyClass}>
          If the shortfall is not corrected, underpaid holiday pay is
          treated in law as an unlawful deduction from wages. A claim
          goes to an employment tribunal, and the deadline is strict:
          3 months less a day from the date of the deduction — or, where
          the same error repeats each pay day, from the last deduction
          in the series. You must contact Acas for early conciliation
          before the tribunal will accept the claim, and the clock
          pauses during conciliation, but it does not reset. Two
          practical points follow. First, do not let an employer&apos;s
          promise to “look into it” carry you past the deadline — start
          the Acas process while the conversation continues. Second,
          keep your own evidence from the start: contracts, rotas,
          timesheets and payslips are what turn a disagreement about
          method into a provable figure, and for irregular-hours work
          the recorded hours are the whole case, because every method on
          this page is built from them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>The key holiday pay figures at a glance</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Statutory holiday entitlement</td>
                <td className="px-4 py-2">5.6 weeks a year (28 days full-time)</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Irregular-hours accrual rate</td>
                <td className="px-4 py-2">12.07% of hours worked each pay period</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Rolled-up holiday pay uplift</td>
                <td className="px-4 py-2">At least 12.07% of pay for work done</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Holiday pay reference period</td>
                <td className="px-4 py-2">Last 52 paid weeks (looking back up to 104)</td>
              </tr>
              <tr>
                <td className="px-4 py-2">New accrual rules apply from</td>
                <td className="px-4 py-2">Leave years beginning on or after 1 April 2024</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Maximum accrual for irregular-hours workers</td>
                <td className="px-4 py-2">28 days&apos; worth in a leave year</td>
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

      <RelatedCalculators href="/holiday-pay-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
