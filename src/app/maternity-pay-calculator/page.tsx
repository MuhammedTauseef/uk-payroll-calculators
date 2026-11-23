import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import MaternityPayCalculator from "@/components/MaternityPayCalculator";
import { calculateMaternityPay } from "@/lib/maternity-pay";
import {
  MATERNITY,
  PAYE_RATES_LABEL,
  SMP,
} from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/maternity-pay-calculator",
  "Maternity Pay Calculator — SMP 2026/27",
  "Work out Statutory Maternity Pay at the 2026/27 rate: 90% of earnings for 6 weeks, then £194.32 a week for 33 weeks, with your key dates and eligibility checks.",
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

const exampleA = calculateMaternityPay({
  annualSalary: 36000,
  dueDate: "",
  employmentStart: "",
  leaveStart: "",
});
const exampleB = calculateMaternityPay({
  annualSalary: 25000,
  dueDate: "",
  employmentStart: "",
  leaveStart: "",
});
const exampleC = calculateMaternityPay({
  annualSalary: 15600,
  dueDate: "",
  employmentStart: "",
  leaveStart: "",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Statutory Maternity Pay in 2026/27?",
    answer:
      "SMP is paid for up to 39 weeks. For the first 6 weeks you get 90% of your average weekly earnings, with no cap. For the remaining 33 weeks you get £194.32 a week, or 90% of your average weekly earnings if that is lower. Any leave you take beyond 39 weeks, up to 52 weeks in total, is unpaid.",
  },
  {
    question: "Is maternity pay taxed?",
    answer:
      "Yes. Statutory Maternity Pay is treated as earnings, so Income Tax and National Insurance are taken off in the same way as your normal wages, and it is paid through your employer's payroll on your usual pay day. Maternity Allowance, the benefit you claim instead if you cannot get SMP, is not taxed.",
  },
  {
    question: "What if I earn less than £129 a week?",
    answer:
      "If your average weekly earnings are below £129 — the 2026/27 Lower Earnings Limit — your employer cannot pay you SMP. They must give you form SMP1 explaining why, within 7 days of their decision. You can use that form to claim Maternity Allowance from the Department for Work and Pensions instead, which pays up to the same £194.32 a week and is tax-free.",
  },
  {
    question: "When can I start my maternity leave and pay?",
    answer:
      "The earliest you can start is 11 weeks before the week your baby is due. Most people start closer to the birth. If you are off work with a pregnancy-related illness in the 4 weeks before your due week, your leave and SMP start automatically on the day after your first day of absence. You must take at least 2 weeks of leave after the birth — 4 weeks if you work in a factory.",
  },
  {
    question: "Can my partner share my maternity leave and pay?",
    answer:
      "Yes, through Shared Parental Leave. You can end your maternity leave and pay early and convert what is left into Shared Parental Leave and Pay, which you and your partner can split in flexible blocks during the baby's first year. The first 6 weeks of SMP at 90% of earnings cannot be shared — that part always belongs to you — and Shared Parental Pay is paid at the flat rate of £194.32 a week or 90% of earnings if lower.",
  },
  {
    question: "Is maternity leave 9 months or 12 months?",
    answer:
      "Both numbers are real — they measure different things. Maternity leave lasts up to 52 weeks, which is 12 months, and every employee can take the whole year from day one of a job. Statutory Maternity Pay lasts 39 weeks, which is roughly 9 months. So a full year off means 39 paid weeks followed by 13 unpaid weeks. You do not have to take the whole year: you can return at any point after the first 2 weeks (4 weeks in a factory), as long as you give the right notice.",
  },
  {
    question: "I am self-employed — can I get Statutory Maternity Pay?",
    answer:
      "No. SMP is paid by an employer through payroll, so if you are self-employed there is no employer to pay it. Instead you claim Maternity Allowance from the Department for Work and Pensions, using the claim form on GOV.UK. It pays up to £194.32 a week for up to 39 weeks and is tax-free; for the self-employed the amount depends on your Class 2 National Insurance record in the 66 weeks before your due week — £27 a week if no Class 2 contributions have been paid.",
  },
  {
    question: "Does my employer have to pay more than SMP?",
    answer:
      "No — SMP is the statutory minimum, and this calculator works out that statutory amount only. Many employers offer an enhanced (occupational) maternity scheme that pays more, often linked to your length of service and sometimes to coming back to work for a set period afterwards. Your contract, staff handbook or employer's maternity policy is where the scheme is set out. NHS staff are covered by the Agenda for Change scheme instead — our NHS maternity pay calculator models it.",
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
  name: "Maternity Pay Calculator",
  url: `${AppConfig.siteUrl}/maternity-pay-calculator`,
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

export default function MaternityPayCalculatorPage() {
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
          Maternity Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Statutory Maternity Pay (SMP) pays 90% of your average weekly
          earnings for the first 6 weeks, then {gbp.format(SMP.weeklyRate)}{" "}
          a week — or 90% of earnings if that is lower — for the next 33
          weeks. Enter your salary and due date to see your total, your
          key dates and whether you pass the two eligibility tests.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this page uses
          the statutory rules exactly as GOV.UK sets them out.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified
          20 November 2026 against GOV.UK.
        </p>
      </section>

      <MaternityPayCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          How much is Statutory Maternity Pay in 2026/27?
        </h2>
        <p className={bodyClass}>
          SMP is paid for up to 39 weeks in two stages: 90% of your
          average weekly earnings for the first 6 weeks, then the lower
          of {gbp.format(SMP.weeklyRate)} a week or 90% of your earnings
          for the remaining 33 weeks. The flat rate rose from £187.18 to{" "}
          {gbp.format(SMP.weeklyRate)} on 6 April 2026. If you take the
          full 52 weeks of maternity leave, the last 13 weeks are unpaid.
          On a salary of £36,000, the full 39 weeks of SMP come to{" "}
          {gbp.format(exampleA.pay.totalPay)} before tax.
        </p>
        <p className={bodyClass}>
          The two stages behave very differently. The first 6 weeks have
          no cap, so a higher salary means a higher payment: at £50,000
          a year the first stage pays about £865 a week, while at
          £20,000 it pays about £346. From week 7 everyone who earns
          enough to pass the flat-rate test gets exactly the same{" "}
          {gbp.format(SMP.weeklyRate)} a week, whatever they earn. That
          is why the gap between salaries mostly shows up in the first
          six weeks, and why the flat-rate weeks — 33 of the 39 — are
          the stretch most families have to budget hardest for. If your
          employer offers an enhanced (occupational) maternity scheme,
          it replaces or tops up these statutory amounts; NHS staff can
          model the Agenda for Change scheme in our{" "}
          <Link href="/nhs-maternity-pay-calculator" className={linkClass}>
            NHS maternity pay calculator
          </Link>
          .
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Annual salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Weeks 1–6 (per week)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Weeks 7–39 (per week)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Total SMP, 39 weeks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[exampleC, exampleB, exampleA].map((ex, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    {gbp.format([15600, 25000, 36000][i])}
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(ex.pay.stages[0].weeklyAmount)}
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(ex.pay.stages[1].weeklyAmount)}
                  </td>
                  <td className="px-4 py-2">{gbp.format(ex.pay.totalPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Worked example, in full: a salary of £25,000 is average weekly
          earnings of £480.77. The first 6 weeks pay 90% of that —
          £432.69 a week, {gbp.format(exampleB.pay.stages[0].total)} in
          total. Because 90% of earnings (£432.69) is more than the flat
          rate, weeks 7 to 39 pay {gbp.format(SMP.weeklyRate)} a week —{" "}
          {gbp.format(exampleB.pay.stages[1].total)} over 33 weeks. The
          whole 39 weeks of SMP come to {gbp.format(exampleB.pay.totalPay)}{" "}
          before tax and National Insurance. Compare that with the
          £15,600 salary in the table: average earnings of exactly £300
          a week, 90% of which is £270 — still above the flat rate, so
          the second stage is the same {gbp.format(SMP.weeklyRate)}, and
          only the first stage shrinks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is maternity leave 9 months or 12 months?</h2>
        <p className={bodyClass}>
          Both — because leave and pay are two different
          entitlements with two different lengths. Maternity{" "}
          <em>leave</em> is up to 52 weeks: 12 months off work,
          available to every employee from the first day of a job,
          with no service test. Maternity <em>pay</em> — SMP — runs
          for 39 of those weeks: roughly 9 months. Put the two
          together and a full year off is 39 paid weeks followed by
          13 unpaid weeks, which is exactly the shape the calculator
          above prices. Nothing forces you to take the unpaid tail:
          you can come back at any point after the compulsory first
          2 weeks (4 weeks if you work in a factory), and many
          people plan their return around the week the pay stops
          rather than the week the leave ends.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Enhanced maternity pay: the part this calculator leaves out
        </h2>
        <p className={bodyClass}>
          Everything on this page is the statutory scheme — the
          legal floor. A large number of employers pay more than
          SMP under an enhanced, or occupational, maternity scheme:
          full pay for a period, then half pay, or a longer stretch
          at a higher rate than {gbp.format(SMP.weeklyRate)} a week.
          Enhanced schemes usually carry their own conditions — a
          minimum length of service before the baby is due is
          common, and some schemes ask you to repay part of the
          extra if you do not return to work afterwards — so the
          figures that apply to you are the ones in your contract,
          your staff handbook or your employer&apos;s maternity
          policy, not on this page. Check them before you budget:
          an enhanced scheme can change the month-by-month picture
          completely. NHS staff do not need to guess — the Agenda
          for Change occupational scheme is modelled in full in our{" "}
          <Link href="/nhs-maternity-pay-calculator" className={linkClass}>
            NHS maternity pay calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          How is your average weekly earnings figure worked out?
        </h2>
        <p className={bodyClass}>
          Your employer works out average weekly earnings from your
          gross pay in the “relevant period” — normally the 8 weeks, or
          2 months if you are paid monthly, ending with the last pay day
          on or before the end of your qualifying week. Everything
          subject to National Insurance counts: salary, wages, overtime,
          bonuses and commission paid in that window. This calculator
          estimates the figure as your annual salary divided by 52,
          which is the standard estimate before the baby is due; your
          employer&apos;s payroll figure, from your actual pay in the
          relevant period, is the one that is finally used.
        </p>
        <p className={bodyClass}>
          Two consequences are worth knowing. First, a bonus or a pay
          rise that lands inside the relevant period raises your average
          — and therefore the whole first 6 weeks of SMP, which are paid
          at 90% of it with no cap. Second, if you are paid monthly, the
          two months in the window rarely contain the same number of
          days, so the employer&apos;s figure can differ by a few pounds
          a week from salary ÷ 52. If your pay varies week to week —
          shifts, term-time patterns, zero-hours work — the same
          8-week average applies; our{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          and{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          can help you turn part-time or hourly pay into the annual
          figure this calculator needs. Part-time staff are treated
          exactly like full-time staff: SMP is based on what you
          actually earn, so enter your part-time salary, not the
          full-time equivalent.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Who qualifies for Statutory Maternity Pay?</h2>
        <p className={bodyClass}>
          You qualify if you pass two tests. The service test: you must
          have worked continuously for the same employer for at least 26
          weeks by the end of your qualifying week — the 15th week
          before the week your baby is due. The earnings test: your
          average weekly earnings in the relevant period must be at
          least {gbp.format(MATERNITY.lowerEarningsLimitWeekly)} a week,
          the 2026/27 Lower Earnings Limit. You must also still be
          employed by that employer in the qualifying week, give the
          correct notice, and provide proof of the pregnancy, normally
          the MATB1 certificate your midwife or doctor issues from
          around 20 weeks into the pregnancy.
        </p>
        <p className={bodyClass}>
          The calculator above runs both tests against your own dates:
          enter your due date and the day you started with this
          employer, and it prints the last date you could have started
          and still passed the service test, alongside the earnings
          check on the salary you entered. Continuous service is more
          forgiving than people expect — weeks on sick leave, annual
          leave or other statutory leave still count, and a change of
          employer usually breaks it, though there are exceptions where
          a business is transferred. Agency workers can qualify through
          their agency, and if you have two jobs you can qualify for SMP
          from each employer separately, because the tests are applied
          employer by employer. Maternity leave itself has no service
          test at all: every employee can take 52 weeks of leave from
          day one of a job — it is the pay that carries the conditions.
          Partners have their own, shorter entitlement, modelled in our{" "}
          <Link href="/paternity-pay-calculator" className={linkClass}>
            paternity pay calculator
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          What are the key dates for maternity leave and pay?
        </h2>
        <p className={bodyClass}>
          Four dates drive everything. Your due week (the expected week
          of childbirth) is the Sunday-to-Saturday week containing your
          due date. Fifteen weeks before it sits the qualifying week,
          which fixes both your eligibility and the earnings window. You
          must tell your employer that you are pregnant, when the baby
          is due and when you want your leave to start by the end of
          that qualifying week. And the earliest your leave — and SMP —
          can begin is the start of the 11th week before your due week.
          The calculator prints all four dates from your due date.
        </p>
        <p className={bodyClass}>
          You can choose any start date from that earliest point up to
          the day after the baby is born. If the baby arrives early,
          leave and pay start the day after the birth. If you are absent
          from work for a pregnancy-related reason in the last 4 weeks
          before your due week, leave starts automatically the day
          after your first day of absence — you cannot be made to use
          sick leave instead, and our{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            Statutory Sick Pay calculator
          </Link>{" "}
          covers what applies outside that window. After the birth you
          must take at least 2 weeks of leave (4 weeks in a factory)
          before returning. Changing your start date is allowed: give
          your employer at least 28 days&apos; notice of the new date.
          Coming back early needs 8 weeks&apos; notice; returning at the
          end of the full 52 weeks needs none.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What happens if you do not qualify for SMP?</h2>
        <p className={bodyClass}>
          If you fail either test, your employer must give you form
          SMP1, explaining why, within 7 days of deciding. That form is
          your route to Maternity Allowance, the Department for Work and
          Pensions benefit for people who cannot get SMP — including the
          self-employed, recent job-changers and many agency workers.
          Maternity Allowance pays the same maximum as the SMP flat
          rate, {gbp.format(SMP.weeklyRate)} a week for 39 weeks (or
          90% of your earnings if lower), and unlike SMP it is
          completely tax-free. You qualify through a different test: 26
          weeks of work in the 66 weeks before your due week, earning
          at least £30 a week in 13 of those weeks.
        </p>
        <p className={bodyClass}>
          Do not assume a failed test ends the matter. Check the dates
          first: the service test is measured at the qualifying week,
          not at the birth, so a job started in early pregnancy often
          passes comfortably. Check the earnings window too — if your
          pay dipped in the relevant 8 weeks because of unpaid absence,
          the figure your employer must use may still clear the{" "}
          {gbp.format(MATERNITY.lowerEarningsLimitWeekly)} limit, and if
          your employer has used the wrong period you can ask them to
          recalculate. If you were on Statutory Sick Pay or another
          statutory payment during the window, those amounts count
          towards your average. And if the problem is genuinely the
          earnings limit, Maternity Allowance is not a consolation
          prize: for someone whose 90% figure sits below the flat rate
          anyway, it can pay exactly the same amount, tax-free.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Self-employed? Your route is Maternity Allowance
        </h2>
        <p className={bodyClass}>
          If you are self-employed, SMP is not available to you at
          all: it is paid by an employer through payroll, and there
          is no employer in the picture. Your route is Maternity
          Allowance, claimed from the Department for Work and
          Pensions using the claim form on GOV.UK. It pays up to{" "}
          {gbp.format(SMP.weeklyRate)} a week for up to 39 weeks —
          the same maximum as the SMP flat rate — and it is
          tax-free. For the self-employed, the amount turns on your
          Class 2 National Insurance record in the 66 weeks before
          your due week: with Class 2 contributions paid in at
          least 13 of those weeks you get the full rate, and if no
          Class 2 contributions have been paid the rate is £27 a
          week. If HMRC tells you that you have paid too few weeks,
          you can be offered the chance to pay voluntary Class 2
          contributions to lift the amount — check that letter
          carefully before deciding, because the difference over 39
          weeks runs into thousands of pounds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          How does maternity pay look month by month?
        </h2>
        <p className={bodyClass}>
          SMP is a weekly payment, but most employers pay it through the
          monthly payroll, so what lands in your account is a monthly
          sum that moves as the stages change: a higher first month or
          two at 90% of earnings, then a long, flat stretch at{" "}
          {gbp.format(SMP.weeklyRate)} a week — roughly £840 a month —
          then nothing for the final 13 weeks if you take the whole
          year. Enter your planned start date in the calculator and it
          splits your own figures into calendar months, counting each
          week&apos;s pay in the month in which that week of leave
          begins, so you can see exactly where the drop comes.
        </p>
        <p className={bodyClass}>
          That shape is the thing to plan around. The first 6 weeks are
          close to normal pay for most people; the shock is week 7. If
          your household budget depends on your salary, the months at
          the flat rate and the unpaid weeks at the end are where
          savings, a partner&apos;s income or a planned early return
          have to fill the gap. Remember that your own holiday keeps
          building up all through the leave — including the unpaid
          weeks — and many people use some of it at the end of leave to
          stretch the paid time further. Our{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          works out the entitlement, and the{" "}
          <Link href="/holiday-pay-calculator" className={linkClass}>
            holiday pay calculator
          </Link>{" "}
          prices it. Some employers will also agree to spread an
          occupational scheme evenly across the leave; SMP itself,
          though, must follow the statutory stages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          What else changes while you are on maternity leave?
        </h2>
        <p className={bodyClass}>
          Your contract continues throughout maternity leave. Holiday
          accrues as if you were at work, your employer&apos;s pension
          contributions continue at your normal rate during paid leave
          (based on your usual pay, not your SMP), and you keep rights
          such as notice periods and redundancy protection — indeed,
          during the protected period you have priority for suitable
          alternative vacancies if your role is made redundant. You can
          also work up to 10 keeping-in-touch (KIT) days without losing
          SMP or ending your leave; they are voluntary on both sides,
          and how they are paid is a matter for agreement between you
          and your employer.
        </p>
        <p className={bodyClass}>
          Three planning points follow from this. First, SMP counts as
          earnings for tax and National Insurance, and your tax code
          keeps working as normal — because your income falls, many
          people find they have overpaid tax by the end of the leave
          period and receive a refund through payroll or a repayment
          afterwards; our{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows the deductions on any salary. Second, if your partner
          wants time off too, you can curtail your leave and convert the
          balance into Shared Parental Leave, as the fifth FAQ below
          explains, or your partner may take their own two weeks of{" "}
          <Link href="/paternity-pay-calculator" className={linkClass}>
            Statutory Paternity Pay
          </Link>{" "}
          around the birth. If instead you lose your job during this
          period, the{" "}
          <Link href="/redundancy-pay-calculator" className={linkClass}>
            redundancy pay calculator
          </Link>{" "}
          sets out the statutory minimum you would be owed — and note
          that SMP continues to be payable by your former employer even
          if your employment ends after the qualifying week. Third,
          childcare costs usually start as leave ends: Tax-Free
          Childcare adds £2 for every £8 you pay in, up to £2,000 a
          year per child, and our{" "}
          <Link href="/childcare-calculator" className={linkClass}>
            tax-free childcare calculator
          </Link>{" "}
          works out the top-up on the bill you expect before you go
          back.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>A note for employers</h2>
        <p className={bodyClass}>
          Employers pay SMP through the normal payroll but recover it
          from HMRC: 92% of the SMP paid, or 109% if the employer&apos;s
          total Class 1 National Insurance bill for the previous tax
          year was £45,000 or less — the extra 17% is Small
          Employers&apos; Relief, compensating for the employer
          National Insurance due on the SMP itself. Recovery is usually
          taken by reducing the monthly PAYE payment; if the amount due
          to HMRC is not large enough to absorb it, you can apply to
          HMRC for advance funding. The true cost of an employee on
          maternity leave is therefore mostly the cost of cover, not the
          SMP — our{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>{" "}
          and{" "}
          <Link
            href="/employer-national-insurance-calculator"
            className={linkClass}
          >
            employer National Insurance calculator
          </Link>{" "}
          show the wider picture, and our guide to{" "}
          <Link href="/blog/employer-of-record-uk" className={linkClass}>
            employing staff in the UK through an employer of record
          </Link>{" "}
          covers the route for overseas companies with no UK payroll at
          all. Keep the SMP1 duty in mind too: if an employee does not
          qualify, the form must be issued within 7 days of the decision
          so she can claim Maternity Allowance without delay.
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
                <td className="px-4 py-2">SMP flat weekly rate (weeks 7–39)</td>
                <td className="px-4 py-2">{gbp.format(SMP.weeklyRate)} per week</td>
              </tr>
              <tr>
                <td className="px-4 py-2">SMP earnings-related stage (weeks 1–6)</td>
                <td className="px-4 py-2">
                  {MATERNITY.aweFraction * 100}% of average weekly earnings, no cap
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Weeks SMP is payable</td>
                <td className="px-4 py-2">{MATERNITY.totalPaidWeeks} weeks</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Minimum earnings to qualify</td>
                <td className="px-4 py-2">
                  {gbp.format(MATERNITY.lowerEarningsLimitWeekly)} per week
                  (Lower Earnings Limit)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Service needed to qualify</td>
                <td className="px-4 py-2">
                  26 weeks by the end of the qualifying week
                </td>
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

      <RelatedCalculators href="/maternity-pay-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
