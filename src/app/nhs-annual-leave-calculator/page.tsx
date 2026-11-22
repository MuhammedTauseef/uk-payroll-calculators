import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import NhsAnnualLeaveCalculator from "@/components/NhsAnnualLeaveCalculator";
import {
  accrueNhsLeave,
  calculateNhsAnnualLeave,
} from "@/lib/nhs-annual-leave";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/nhs-annual-leave-calculator",
  "NHS Annual Leave Calculator — Days & Hours 2026/27",
  "NHS annual leave calculator: 27, 29 or 33 days plus public holidays under Agenda for Change, in days and hours — pro-rata for part-time, starters and leavers.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const h2Class = "text-xl font-semibold text-slate-900 dark:text-slate-50";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Every worked example on this page is produced by the same library
// the calculator runs on, so the printed figures can never drift
// away from the tool's own answers.
const fullTimeStarter = calculateNhsAnnualLeave({
  nation: "england",
  serviceBand: "under-5",
  contractedHours: 37.5,
});
const partTimeExample = calculateNhsAnnualLeave({
  nation: "england",
  serviceBand: "5-to-10",
  contractedHours: 20,
});
const leaverExample = accrueNhsLeave(fullTimeStarter, 0.5, 75);
const scotlandStarter = calculateNhsAnnualLeave({
  nation: "scotland",
  serviceBand: "under-5",
  contractedHours: 36,
});
const walesStarter = calculateNhsAnnualLeave({
  nation: "wales",
  serviceBand: "under-5",
  contractedHours: 37.5,
});
const niStarter = calculateNhsAnnualLeave({
  nation: "northern-ireland",
  serviceBand: "under-5",
  contractedHours: 37.5,
});
const reckonerHours = [37.5, 30, 25, 22.5, 20, 15];
const reckoner = reckonerHours.map((h) => ({
  hours: h,
  under5: calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "under-5",
    contractedHours: h,
  }).totalHours,
  fiveToTen: calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "5-to-10",
    contractedHours: h,
  }).totalHours,
  tenPlus: calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "10-plus",
    contractedHours: h,
  }).totalHours,
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much annual leave do NHS staff get?",
    answer:
      "Under Agenda for Change, full-time staff get 27 days of annual leave plus 8 public holidays on appointment — 35 days, or 262.5 hours, in total. After 5 years of NHS service it rises to 29 plus 8 (37 days, 277.5 hours), and after 10 years to 33 plus 8 (41 days, 307.5 hours). Wales adds one day at every stage, Northern Ireland has 10 public holidays instead of 8, and Scotland counts the same days on a 36-hour week.",
  },
  {
    question: "How is NHS annual leave worked out for part-time staff?",
    answer:
      "In hours, never in days. Take the full-time hours for your length of service and scale them by your contracted hours divided by the full-time week. A nurse working 20 hours a week with 5 to 10 years of service gets 217.5 × 20 ÷ 37.5 = 116 hours of annual leave, plus 60 × 20 ÷ 37.5 = 32 hours of public holidays — 148 hours in total. Multiplying your days by your own shift length instead is the most common way this calculation goes wrong.",
  },
  {
    question: "How many shifts of holiday do I get on 12-hour shifts?",
    answer:
      "Divide your leave pot in hours by your shift length. A full-time new starter has 262.5 hours, which is 262.5 ÷ 12 = about 21.9 twelve-hour shifts a year, public holidays included. Counting leave in days would give a shift worker far more real time off than a colleague on 7.5-hour days, which is why the NHS holds leave in hours for anyone who does not work standard days.",
  },
  {
    question: "What happens to my annual leave if I start or leave during the leave year?",
    answer:
      "Your entitlement is pro-rata to the part of the leave year (1 April to 31 March) that you work. If you leave, leave you have built up but not taken is paid in your final pay; if you have taken more than you had built up, your employer can only deduct the excess from final pay if your contract or a written agreement allows it. Exactly halfway through the year, a full-time new starter has built up half of 262.5 hours — 131.25 hours.",
  },
  {
    question: "Can I carry over unused NHS annual leave?",
    answer:
      "Usually up to 5 days — 37.5 hours full-time, pro-rata if you work part-time — and only with your manager's agreement; anything more is at your trust's discretion under its local policy. Statutory leave can also be carried over where long-term sickness stopped you taking it, because annual leave keeps building up while you are off sick, and it keeps building up during maternity leave too, including the public holiday element.",
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
  name: "NHS Annual Leave Calculator",
  url: `${AppConfig.siteUrl}/nhs-annual-leave-calculator`,
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

export default function NhsAnnualLeaveCalculatorPage() {
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
          NHS Annual Leave Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          NHS staff on Agenda for Change get 27 days of annual leave
          plus public holidays when they join, rising to 29 days after
          5 years of service and 33 days after 10 — 35, 37 or 41 days
          in total. Enter your service, nation and contracted hours
          below to see your entitlement in days and in hours.
        </p>
        <p className={bodyClass}>
          UK Payroll Calculators is a free library of UK pay, tax and
          leave calculators published by Muhammad Tauseef. This one
          covers the leave side of NHS employment; the{" "}
          <Link href="/nhs-pay-calculator" className={linkClass}>
            NHS pay calculator
          </Link>{" "}
          covers the money, and the general{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          covers the statutory rules that apply outside the NHS. NHS
          leave is where the two meet — it is more generous than the
          statutory minimum, and it is worked out in hours, which is
          where most of the confusion starts.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Entitlement checked
          20 November 2026 against Section 13 of the NHS Terms and
          Conditions of Service Handbook.
        </p>
      </section>

      <NhsAnnualLeaveCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>How much annual leave do NHS staff get?</h2>
        <p className={bodyClass}>
          Almost everyone who works for the NHS — nurses, midwives,
          allied health professionals, healthcare scientists, admin,
          estates and support staff — is employed under Agenda for
          Change, and Agenda for Change sets annual leave by one thing
          only: how long you have worked for the NHS. Your band, your
          job and your trust make no difference. The figures are in
          Table 6 of Section 13 of the NHS Terms and Conditions of
          Service Handbook: 27 days of annual leave on appointment,
          29 days after 5 years of reckonable service and 33 days
          after 10 years, in every case plus general public holidays
          on top. Doctors, dentists and very senior managers are on
          separate terms and are not covered by this calculator.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Length of NHS service</th>
                <th className={thClass}>Annual leave</th>
                <th className={thClass}>Public holidays</th>
                <th className={thClass}>Total days</th>
                <th className={thClass}>Total hours (full-time)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>On appointment (under 5 years)</td>
                <td className={tdClass}>27 days (202.5 hours)</td>
                <td className={tdClass}>8 days (60 hours)</td>
                <td className={tdClass}>35 days</td>
                <td className={tdClass}>262.5 hours</td>
              </tr>
              <tr>
                <td className={tdClass}>After 5 years</td>
                <td className={tdClass}>29 days (217.5 hours)</td>
                <td className={tdClass}>8 days (60 hours)</td>
                <td className={tdClass}>37 days</td>
                <td className={tdClass}>277.5 hours</td>
              </tr>
              <tr>
                <td className={tdClass}>After 10 years</td>
                <td className={tdClass}>33 days (247.5 hours)</td>
                <td className={tdClass}>8 days (60 hours)</td>
                <td className={tdClass}>41 days</td>
                <td className={tdClass}>307.5 hours</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          England figures: a 37.5-hour full-time week, so one day of
          leave is 7.5 hours. Checked against Section 13, Table 6 of
          the NHS Terms and Conditions of Service Handbook and NHS
          Employers&apos; Agenda for Change guidance, 20 November 2026.
        </p>
        <p className={bodyClass}>
          Two facts in that table are worth quoting exactly. First,
          the entitlement is stated in days but administered in
          hours: a full-time new starter&apos;s 35 days are 262.5
          hours, and it is the hours figure — not the days — that
          your roster and your leave balance actually run on.
          Second, the service that counts is reckonable service
          across the whole NHS: time with a previous NHS employer
          counts towards the 5- and 10-year steps, so moving trusts
          does not send you back to 27 days. If your balance looks
          like it has restarted, the usual cause is an ESR record
          that is missing your earlier service — evidence such as a
          P60 or an employment letter from the old employer is what
          gets it corrected.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Annual leave in Scotland, Wales and Northern Ireland
        </h2>
        <p className={bodyClass}>
          The Agenda for Change framework is UK-wide, but the four
          nations have diverged in three specific ways, and the
          calculator above applies all three. In Scotland, the
          full-time week for Agenda for Change staff reduced to 36
          hours from 1 April 2026, with pay protected — the days are
          the same, but a Scottish day of leave is worth 7.2 hours,
          so a full-time new starter&apos;s pot is{" "}
          {scotlandStarter.totalHours} hours rather than 262.5. In
          Wales, staff get one extra day of annual leave at every
          length of service — 28, 30 and 34 days — as published in
          NHS Wales health board annual leave policies, making a
          Welsh new starter&apos;s total {walesStarter.totalHours}{" "}
          hours. In Northern Ireland the leave days match England,
          but there are 10 public holidays rather than 8, because
          St Patrick&apos;s Day and the 12 July holiday are added —
          a full-time new starter gets {niStarter.totalHours} hours.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Nation</th>
                <th className={thClass}>Leave on appointment</th>
                <th className={thClass}>Public holidays</th>
                <th className={thClass}>Full-time week</th>
                <th className={thClass}>One day of leave</th>
                <th className={thClass}>New starter total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>England</td>
                <td className={tdClass}>27 days</td>
                <td className={tdClass}>8</td>
                <td className={tdClass}>37.5 hours</td>
                <td className={tdClass}>7.5 hours</td>
                <td className={tdClass}>262.5 hours</td>
              </tr>
              <tr>
                <td className={tdClass}>Wales</td>
                <td className={tdClass}>28 days</td>
                <td className={tdClass}>8</td>
                <td className={tdClass}>37.5 hours</td>
                <td className={tdClass}>7.5 hours</td>
                <td className={tdClass}>270 hours</td>
              </tr>
              <tr>
                <td className={tdClass}>Scotland</td>
                <td className={tdClass}>27 days</td>
                <td className={tdClass}>8</td>
                <td className={tdClass}>36 hours</td>
                <td className={tdClass}>7.2 hours</td>
                <td className={tdClass}>252 hours</td>
              </tr>
              <tr>
                <td className={tdClass}>Northern Ireland</td>
                <td className={tdClass}>27 days</td>
                <td className={tdClass}>10</td>
                <td className={tdClass}>37.5 hours</td>
                <td className={tdClass}>7.5 hours</td>
                <td className={tdClass}>277.5 hours</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Scotland&apos;s lower hours figure is not less leave — it
          is the same 35 days counted on a shorter week. The trap is
          comparing hours across the border: a Scottish nurse and an
          English nurse with identical service both get 35 days off,
          but the English pot looks 10.5 hours bigger on paper purely
          because the English working day is longer. Compare days
          when you compare nations, and hours when you compare
          contracts within one nation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How the calculator works out your leave</h2>
        <p className={bodyClass}>
          The method is the handbook&apos;s own, and it has three
          steps. First, take the full-time entitlement in hours for
          your length of service: days multiplied by the hours in a
          day (7.5, or 7.2 in Scotland). Second, if you work
          part-time, scale both parts — annual leave and public
          holidays, separately — by your contracted hours divided by
          the full-time week. Third, add the two parts together into
          one pot of hours. Public holidays that fall on days you
          would normally work are then booked out of that pot, and
          ones that fall on your days off cost you nothing. That is
          the whole calculation; everything else on this page is
          about the situations — starting, leaving, changing hours —
          where the pot has to be scaled to part of a year as well.
        </p>
        <p className={bodyClass}>
          One honest footnote about rounding. This calculator shows
          the straight pro-rata, to the nearest hundredth of an hour,
          so the formula printed here always reconciles exactly with
          the result. Some trusts round a part-timer&apos;s public
          holiday element up to the nearest half day under paragraph
          13.6 of the handbook, which can make a trust&apos;s own
          figure a few hours higher than the one shown here. If your
          ESR balance is slightly more generous than this page, that
          rounding — not an error — is the most likely reason.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Part-time NHS staff: your leave in hours</h2>
        <p className={bodyClass}>
          Part-time leave is where the days figure becomes actively
          misleading, so work in hours from the start. Take a staff
          nurse contracted for 20 hours a week, with between 5 and 10
          years of service, in England. Her full-time colleagues get
          217.5 hours of annual leave and 60 hours of public
          holidays. Her share is 20 ÷ 37.5 of each: annual leave
          217.5 × 20 ÷ 37.5 = {partTimeExample.leaveHours} hours, and
          public holidays 60 × 20 ÷ 37.5 ={" "}
          {partTimeExample.publicHolidayHours} hours —{" "}
          {partTimeExample.totalHours} hours in total, which is{" "}
          {partTimeExample.totalDays} days of 7.5 hours. The
          calculator above does exactly this arithmetic, and the{" "}
          <Link href="/pro-rata-holiday-calculator" className={linkClass}>
            pro-rata holiday calculator
          </Link>{" "}
          applies the same scaling to the statutory entitlement
          outside the NHS, while the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          does it for pay.
        </p>
        <p className={bodyClass}>
          The mistake to avoid: never work out part-time leave by
          multiplying your days by the length of your own shifts. A
          part-timer on three 12-hour shifts a week who books
          “27 days” at 12 hours each would take 324 hours of leave —
          far more than the pot holds. Leave is a pot of hours, and
          every shift you book comes out of it at the shift&apos;s
          real length. That is also why two part-timers on the same
          contracted hours can use their pots at completely different
          speeds: the one working long shifts spends 12 hours a day
          off, the one working short shifts spends 5. Both get
          exactly the same entitlement — the same number of hours —
          and that equality in hours is precisely what the handbook
          is designed to produce.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Leave in hours for shift workers</h2>
        <p className={bodyClass}>
          The same logic explains the question ward staff ask most:
          how many shifts is my holiday? Divide the pot by your
          shift length. A full-time new starter on 12-hour shifts
          has 262.5 hours, which buys 262.5 ÷ 12 = about 21.9
          shifts off a year, public holidays included. A colleague
          on 7.5-hour days gets 35 days off. Those are the same
          amount of leave — 262.5 hours each — counted in different
          units, and the calculator shows your own figure if you
          enter your shift length. If leave were counted in days
          for both, the shift worker would receive two-thirds more
          real time off than the office worker for the same job,
          which is why the handbook requires hours-based leave for
          anyone not working standard days.
        </p>
        <p className={bodyClass}>
          Mixed patterns — a week that combines long days, short
          days and nights — are handled the same way, one shift at a
          time: each absence is charged at the hours you would have
          worked. Night shifts that cross midnight are charged to
          the day the shift starts in most rostering systems, but
          local practice varies, and the annual total is unaffected
          either way. What does change the total is a change in your
          contracted hours: if you move from 37.5 to 30 hours
          mid-year, the year is calculated in two parts, at the old
          hours up to the change and the new hours after it — the
          same split-year treatment that applies when you cross a
          service anniversary, covered next.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          The leave year, service anniversaries and reckonable service
        </h2>
        <p className={bodyClass}>
          Most NHS employers run the leave year from 1 April to
          31 March, though a minority use your start date or another
          local year — your trust&apos;s annual leave policy or your
          ESR record will say which. When you reach 5 or 10 years of
          reckonable service part-way through a leave year, the
          higher entitlement applies from your anniversary date, not
          from the start of the year: the year is calculated in two
          parts, at the lower rate up to the anniversary and the
          higher rate after it. Reckonable service is not limited to
          your current employer — service with any NHS employer
          counts, and for annual leave it aggregates even across
          breaks in employment, unlike the stricter continuity rules
          that apply to sick pay. Bank-only and agency work generally
          does not count, and relevant non-NHS service counts only
          if your employer agrees to recognise it.
        </p>
        <p className={bodyClass}>
          That aggregation rule is worth real leave. Someone who
          worked 3 years at one trust, spent 2 years outside the
          NHS, and has now worked 3 more years elsewhere has 6 years
          of reckonable service and belongs on the 29-day rate — if
          their record shows only the current 3 years, they are
          losing 15 hours of leave a year (the difference between
          262.5 and 277.5 hours) until it is fixed. Check the service
          date on your ESR record or a recent payslip against your
          actual first NHS start date; our{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows where service and pay figures appear on a payslip.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Carrying leave over to the next year</h2>
        <p className={bodyClass}>
          The national position is simple to state and local in its
          details. Most staff can carry over up to 5 days of unused
          annual leave — 37.5 hours if you work full-time, scaled
          down pro-rata if you do not — and only with their
          manager&apos;s agreement. Anything beyond that is a matter
          for your trust&apos;s own annual leave policy, and some
          trusts also run schemes to buy extra leave or sell unused
          days back, typically up to one contractual week either
          way; none of that is in the national handbook, so the local
          policy is the document that decides. The calculator lets
          you add carried-over hours to this year&apos;s pot so the
          balance you see is the one you can actually spend.
        </p>
        <p className={bodyClass}>
          Two kinds of absence change the picture. Annual leave
          keeps building up while you are off sick — including the
          public holiday element — and statutory leave you could not
          take because of long-term sickness can be carried into the
          next leave year even without the usual agreement, which is
          why a balance after months on{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            statutory sick pay
          </Link>{" "}
          is often larger than expected. Leave also keeps building
          up throughout maternity leave, and many staff add the
          accrued block to the end of their leave before returning;
          the{" "}
          <Link
            href="/nhs-maternity-pay-calculator"
            className={linkClass}
          >
            NHS maternity pay calculator
          </Link>{" "}
          works out the pay side of that period, and the general{" "}
          <Link href="/maternity-pay-calculator" className={linkClass}>
            maternity pay calculator
          </Link>{" "}
          covers statutory maternity pay outside the NHS.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Starting or leaving during the leave year</h2>
        <p className={bodyClass}>
          If you work only part of a leave year, your entitlement is
          the same fraction of the full-year pot. This calculator
          measures the fraction in days: the days from 1 April to
          your last day (or from your start date to 31 March),
          divided by the days in the leave year. The worked example
          makes the shape clear. A full-time new starter in England
          who leaves exactly halfway through the leave year has
          built up half of 262.5 hours —{" "}
          {leaverExample.accruedTotalHours} hours. If they have
          already taken 75 hours, the remaining{" "}
          {leaverExample.balanceHours} hours are theirs to use before
          the last day or to be paid for in final pay.
        </p>
        <p className={bodyClass}>
          Payment for untaken leave on leaving is the one time NHS
          leave is converted into money, and it is taxed as earnings
          in the usual way. The{" "}
          <Link href="/holiday-pay-calculator" className={linkClass}>
            holiday pay calculator
          </Link>{" "}
          prices leave in pounds — including the statutory (A × B) −
          C formula that applies outside the NHS — once you know the
          hours from this page. The mirror-image case matters too:
          if you have taken more leave than you had built up by your
          last day, your employer can only deduct the excess from
          your final pay where your contract or another written
          agreement allows it. Check that clause before you book a
          long trip in your final months — the deduction, where it
          exists, is calculated on the same accrued-versus-taken
          figures the leaver mode above produces.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Bank holidays: how the pot works</h2>
        <p className={bodyClass}>
          The public holiday element is not a set of named days off;
          it is 60 hours (full-time, outside Northern Ireland) added
          to your pot, from which bank holidays falling on your
          working days are booked. If a bank holiday falls on your
          non-working day, nothing is deducted and nothing is owed —
          the pro-rata pot is the compensation, and it is what makes
          the system fair between a Monday-to-Friday worker and a
          colleague whose rest days happen to land on most bank
          holidays. If you are required to work a public holiday,
          you keep the hours in your pot and are paid at the
          enhanced bank holiday rate for the shift, with time off in
          lieu at plain time under Section 13 of the handbook.
        </p>
        <p className={bodyClass}>
          One quirk of the calendar is worth knowing for 2026/27:
          because Easter falls at both ends of that leave year —
          Good Friday and Easter Monday in April 2026 and again on
          26 and 29 March 2027 — England and Wales have 10 calendar
          bank holidays between 1 April 2026 and 31 March 2027,
          while the contractual entitlement remains 8 days&apos;
          worth of hours. How the extra days are handled is set
          locally; some employers give the days themselves, others
          hold the pot at 60 hours. Either way, the entitlement in
          your contract — the figure this calculator shows — does
          not change, and the same point will apply in reverse in a
          year when Easter falls only once inside the leave year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>NHS leave vs the statutory minimum</h2>
        <p className={bodyClass}>
          Every worker in the UK is entitled by law to 5.6 weeks of
          paid holiday a year — 28 days for someone working five
          days a week — and an employer may count bank holidays
          towards that total. Agenda for Change beats the legal
          floor at every length of service, and gives the public
          holidays on top rather than inside the allowance:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Basis</th>
                <th className={thClass}>Days a year (full-time)</th>
                <th className={thClass}>Hours a year</th>
                <th className={thClass}>Bank holidays</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Statutory minimum (any UK job)</td>
                <td className={tdClass}>28 days</td>
                <td className={tdClass}>210 hours</td>
                <td className={tdClass}>May be included in the 28</td>
              </tr>
              <tr>
                <td className={tdClass}>NHS, on appointment</td>
                <td className={tdClass}>35 days</td>
                <td className={tdClass}>262.5 hours</td>
                <td className={tdClass}>8 on top</td>
              </tr>
              <tr>
                <td className={tdClass}>NHS, after 5 years</td>
                <td className={tdClass}>37 days</td>
                <td className={tdClass}>277.5 hours</td>
                <td className={tdClass}>8 on top</td>
              </tr>
              <tr>
                <td className={tdClass}>NHS, after 10 years</td>
                <td className={tdClass}>41 days</td>
                <td className={tdClass}>307.5 hours</td>
                <td className={tdClass}>8 on top</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Put in weeks, a new NHS starter gets 7 weeks of leave a
          year against the statutory 5.6, and a long-serving member
          of staff gets 8.2 weeks. That difference is a real part of
          the NHS employment package — worth roughly a week and a
          half of extra rest a year at the start of a career — and
          it is one reason comparing an NHS salary with a private
          sector salary on pay alone understates the NHS offer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Ready reckoner: total leave in hours</h2>
        <p className={bodyClass}>
          Annual leave plus public holidays combined, for common
          contracted hours in England. Find your hours and your
          length of service; the calculator above gives the split
          between leave and public holidays and covers the other
          nations.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Contracted hours a week</th>
                <th className={thClass}>Under 5 years</th>
                <th className={thClass}>5 to 10 years</th>
                <th className={thClass}>10 years or more</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reckoner.map((row) => (
                <tr key={row.hours}>
                  <td className={tdClass}>
                    {row.hours} hours{row.hours === 37.5 ? " (full-time)" : ""}
                  </td>
                  <td className={tdClass}>{row.under5} hours</td>
                  <td className={tdClass}>{row.fiveToTen} hours</td>
                  <td className={tdClass}>{row.tenPlus} hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          England, straight pro-rata with no rounding of the public
          holiday element. Figures checked 20 November 2026.
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

      <RelatedCalculators href="/nhs-annual-leave-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
