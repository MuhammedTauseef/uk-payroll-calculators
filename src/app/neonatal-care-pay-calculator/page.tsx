import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import NeonatalCarePayCalculator from "@/components/NeonatalCarePayCalculator";
import { calculateNeonatal } from "@/lib/neonatal";
import { NEONATAL } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/neonatal-care-pay-calculator",
  "Neonatal Care Pay Calculator — SNCP 2026/27",
  "Work out Statutory Neonatal Care Pay: up to 12 weeks at £194.32 a week or 90% of average weekly earnings if lower, with the 26-week service and Lower Earnings Limit checks.",
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

const exampleA = calculateNeonatal({
  taxYear: "2026-27",
  averageWeeklyEarnings: 600,
  daysInCare: 63,
  birthDate: "",
  careStartDate: "",
  employmentStart: "",
});
const exampleB = calculateNeonatal({
  taxYear: "2026-27",
  averageWeeklyEarnings: 180,
  daysInCare: 21,
  birthDate: "",
  careStartDate: "",
  employmentStart: "",
});
const exampleC = calculateNeonatal({
  taxYear: "2025-26",
  averageWeeklyEarnings: 150,
  daysInCare: 14,
  birthDate: "",
  careStartDate: "",
  employmentStart: "",
});

const exampleMax = calculateNeonatal({
  taxYear: "2026-27",
  averageWeeklyEarnings: 1000,
  daysInCare: 84,
  birthDate: "",
  careStartDate: "",
  employmentStart: "",
});

const rate2627 = NEONATAL.years["2026-27"];
const rate2526 = NEONATAL.years["2025-26"];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much is Statutory Neonatal Care Pay in 2026/27?",
    answer:
      "SNCP pays the same amount every week: £194.32 a week, or 90% of your average weekly earnings if that is lower. It runs for one week for every full week your baby spends in neonatal care, up to a maximum of 12 weeks — so the most anyone can receive in 2026/27 is £2,331.84. In 2025/26 the flat rate was £187.18 a week. Unlike maternity pay, there is no higher-rate opening stage: the rate never changes from week to week.",
  },
  {
    question: "Is neonatal care pay taxed?",
    answer:
      "Yes. Statutory Neonatal Care Pay is treated as earnings, so Income Tax and National Insurance are deducted in the same way as your normal wages, and it is paid by your employer through payroll on your usual pay day. Your employer can claim most of it back from HMRC, but that does not change what you are paid.",
  },
  {
    question: "What if my average earnings are below £129 a week?",
    answer:
      "Then Statutory Neonatal Care Pay is not payable: the earnings test requires average weekly earnings of at least the Lower Earnings Limit — £129 a week in 2026/27, £125 in 2025/26. Your employer must explain the decision in writing within 28 days of your notice for pay, using form NEO1 or their own letter. The leave itself is a day-one right with no earnings test, so you can still take the time off unpaid, and if you disagree with the decision you can take it to HMRC's Statutory Payments Dispute Team within 6 months.",
  },
  {
    question: "Can I take neonatal care leave at the same time as maternity leave?",
    answer:
      "No — the two cannot overlap. Neonatal Care Leave is taken after maternity or adoption leave has ended, and it is in addition to that leave, not instead of it. While your baby is in neonatal care (or in the first week after), neonatal leave can be interrupted by other pre-booked parental leave, such as paternity leave or Shared Parental Leave, with the remaining neonatal leave tagged on immediately afterwards.",
  },
  {
    question: "How long do I have to use neonatal care leave?",
    answer:
      "All neonatal care leave must be taken within 68 weeks of your baby's date of birth. You earn one week for every 7 consecutive days your baby spends in neonatal care, up to 12 weeks. Leave taken while the baby is in care, or in the first week after, can be split into separate blocks of at least a week; leave taken later than that must be taken as one single continuous block.",
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
  name: "Neonatal Care Pay Calculator",
  url: `${AppConfig.siteUrl}/neonatal-care-pay-calculator`,
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

export default function NeonatalCarePayCalculatorPage() {
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
          Neonatal Care Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Statutory Neonatal Care Pay (SNCP) pays{" "}
          {gbp.format(rate2627.weeklyRate)} a week — or 90% of your
          average weekly earnings if that is lower — for one week for
          every full week your baby spends in neonatal care, up to 12
          weeks. Enter your earnings and the days in care to see your
          weekly amount, your total and the eligibility checks.
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
          24 November 2026 against GOV.UK.
        </p>
      </section>

      <NeonatalCarePayCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          How much is Statutory Neonatal Care Pay?
        </h2>
        <p className={bodyClass}>
          Every week of SNCP pays the same amount: the lower of the
          tax year&apos;s flat rate and 90% of your average weekly
          earnings. The flat rate is {gbp.format(rate2526.weeklyRate)}{" "}
          a week in 2025/26 and {gbp.format(rate2627.weeklyRate)} a
          week in 2026/27, having risen on 6 April 2026 in line with
          the other statutory family payments. There is no higher-rate
          opening stage — unlike Statutory Maternity Pay, which pays
          90% of earnings for its first 6 weeks, SNCP is flat from the
          first week to the last. The most anyone can receive is 12
          weeks at the flat rate:{" "}
          {gbp.format(exampleMax.totalPay)} in 2026/27.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Example
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Days in care
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Weeks paid
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  SNCP per week
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Total SNCP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Earnings £600 a week (2026/27)
                </td>
                <td className="px-4 py-2">63</td>
                <td className="px-4 py-2">{exampleA.weeksEntitled}</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleA.weeklyAmount)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleA.totalPay)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Earnings £180 a week (2026/27)
                </td>
                <td className="px-4 py-2">21</td>
                <td className="px-4 py-2">{exampleB.weeksEntitled}</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleB.weeklyAmount)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleB.totalPay)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Earnings £150 a week (2025/26)
                </td>
                <td className="px-4 py-2">14</td>
                <td className="px-4 py-2">{exampleC.weeksEntitled}</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleC.weeklyAmount)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleC.totalPay)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Worked example, in full: a parent whose baby spends 63 days
          in neonatal care has earned 9 full weeks of leave and pay. If
          their average weekly earnings are £600, then 90% of earnings
          is £540 — more than the flat rate — so each week pays{" "}
          {gbp.format(exampleA.weeklyAmount)}, and the 9 weeks come to{" "}
          {gbp.format(exampleA.totalPay)} before tax. Now take a
          lower-paid parent earning £180 a week, whose baby spends 21
          days in care: 3 weeks are earned, 90% of earnings is £162,
          which is below the flat rate, so each week pays{" "}
          {gbp.format(exampleB.weeklyAmount)} and the total is{" "}
          {gbp.format(exampleB.totalPay)}. The crossover point in
          2026/27 is average earnings of about £215.91 a week: earn
          more than that and the flat rate caps your pay; earn less
          and you receive 90% of what you earn.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          How do I calculate my neonatal care pay?
        </h2>
        <p className={bodyClass}>
          The calculation has three steps. First, count the full weeks
          your baby spent in neonatal care: every block of 7
          consecutive days earns one week, part-weeks earn nothing,
          and the total is capped at 12 weeks — so a stay of 20 days
          earns 2 weeks, and a stay of 84 days or more earns the full
          12. Second, work out the weekly amount: 90% of your average
          weekly earnings, capped at the flat rate for the tax year.
          Third, multiply — the weekly amount never changes, so the
          total is simply the weekly amount times the weeks earned.
          The calculator above does all three steps and runs the
          eligibility tests at the same time.
        </p>
        <p className={bodyClass}>
          Your average weekly earnings are worked out by your employer
          from your gross pay in the “relevant period” — usually the 8
          weeks ending with the last pay day on or before the Saturday
          of your qualifying week. If you are paid monthly, your
          employer adds up the pay in that window, divides by the
          number of months, multiplies by 12 and divides by 52; if you
          are paid weekly or irregularly, they divide the total by the
          number of days and multiply by 7. Everything subject to
          National Insurance counts, including overtime and bonuses
          paid in the window. For a salaried employee, annual salary
          divided by 52 is the standard estimate — our{" "}
          <Link href="/maternity-pay-calculator" className={linkClass}>
            maternity pay calculator
          </Link>{" "}
          uses the same relevant-period rules for SMP, and our{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          shows the tax and National Insurance that will come off the
          SNCP once it is paid.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Who can take Neonatal Care Leave?</h2>
        <p className={bodyClass}>
          The leave is for employees in England, Scotland and Wales
          whose baby was born on or after 6 April 2025, started
          neonatal care within 28 days of the birth and spent at least
          7 consecutive days in it. “Neonatal care” covers hospital
          care, consultant-supervised medical care after leaving
          hospital, and palliative or end-of-life care. You must be
          the baby&apos;s parent — biological, adoptive, or an
          intended parent through surrogacy who applies for a parental
          order within 6 months — with caring responsibility for the
          baby, or the partner of the baby&apos;s mother or adopter
          with shared caring responsibility. The leave is a day-one
          right: there is no minimum service for the time off itself,
          however long you have worked for your employer.
        </p>
        <p className={bodyClass}>
          The pay carries two extra tests, and the calculator checks
          both. The service test: you must have been continuously
          employed by the same employer for at least 26 weeks ending
          with the qualifying week. The earnings test: your average
          weekly earnings in the relevant period must be at least the
          Lower Earnings Limit — £125 a week in 2025/26, £129 in
          2026/27. You must also still be employed in the week before
          the pay starts. The qualifying week is the week immediately
          before your baby entered neonatal care, unless you also
          qualify for maternity or paternity pay for the same baby —
          then it is the earlier week used for that claim, the 15th
          week before your due week (for adoption pay, it is the week
          you were told you had been matched). Agency and zero-hours
          workers can sometimes qualify for the pay through their
          employer even where the leave itself does not apply to them,
          because the pay follows tax employment status rather than
          employment-law status.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Can both parents claim neonatal care leave and pay?
        </h2>
        <p className={bodyClass}>
          Yes. The entitlement belongs to each parent separately, not
          to the baby or the household. If both parents are employees
          and each passes the service and earnings tests with their
          own employer, each can take up to 12 weeks of Neonatal Care
          Leave and be paid SNCP by their own employer — including at
          the same time as each other, for example while one parent is
          at the hospital and the other is settling the baby at home.
          Nothing is split or shared between you, and one parent
          claiming does not reduce the other&apos;s entitlement. That
          is different from{" "}
          <Link
            href="/shared-parental-leave-calculator"
            className={linkClass}
          >
            Shared Parental Leave
          </Link>
          , where a fixed pot of leave is divided between the parents:
          neonatal leave sits entirely outside that pot, on top of
          whatever maternity, paternity, adoption or shared parental
          leave each of you takes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is neonatal care pay full pay?</h2>
        <p className={bodyClass}>
          No. Statutory Neonatal Care Pay is not full pay and is not
          designed to be: it pays {gbp.format(rate2627.weeklyRate)} a
          week, or 90% of your average weekly earnings if that is
          lower, for up to 12 weeks. For anyone earning more than
          about £215.91 a week, that is a substantial drop from normal
          wages — at £600 a week of earnings, SNCP replaces less than
          a third of pay. What your employer must pay is the statutory
          amount; anything above it is voluntary. Some employers run
          an enhanced (contractual) neonatal care scheme that tops the
          statutory amount up to full pay for some or all of the
          leave, in the same way many enhance maternity pay — check
          your contract, staff handbook or employer&apos;s family
          leave policy, because the difference over a long hospital
          stay is large. NHS staff should also check their Agenda for
          Change terms alongside our{" "}
          <Link href="/nhs-maternity-pay-calculator" className={linkClass}>
            NHS maternity pay calculator
          </Link>
          , since occupational schemes interact with the statutory
          payments.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Can an employer refuse neonatal leave?</h2>
        <p className={bodyClass}>
          If you are an eligible employee and you give the correct
          notice, neonatal care leave is a statutory entitlement — your
          employer cannot refuse the leave, postpone it or ask you to
          take a different kind of leave instead, and your employment
          rights (pay rises, holiday accrual, the right to return to
          your job) are protected while you are away. The pay is
          different: your employer can decline to pay SNCP if you fail
          one of the pay tests — the 26-week service rule or the
          earnings limit — but they must tell you in writing within 28
          days of receiving your notice for pay, using form NEO1 or
          their own letter, and give the reason. If you think the
          decision is wrong, raise it with your employer first; if it
          is still unresolved you can take it to HMRC&apos;s Statutory
          Payments Dispute Team, within 6 months of the decision. An
          employer must pay any outstanding SNCP even if you are made
          redundant or the business stops trading.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          How do I apply for neonatal care leave?
        </h2>
        <p className={bodyClass}>
          You apply by giving your employer notice — there is no
          government form and no claim to HMRC. Notice for the pay
          must be in writing (an email or letter is fine); notice for
          the leave while your baby is in care can be informal, even a
          phone call or text. You need to tell your employer your
          name, the baby&apos;s date of birth, the date neonatal care
          started (and the date it ended, once you know it), when you
          want your leave to begin and how many weeks you are taking,
          and confirm that you are taking the leave to care for your
          baby and have parental responsibility for them. For leave
          taken while the baby is in care, or in the first week after
          (tier 1), give notice as soon as you can — ideally before
          your usual start of work — and renew it by the end of each
          week the leave continues; the notice for pay must reach your
          employer within 28 days of the start of your leave.
        </p>
        <p className={bodyClass}>
          For leave taken more than a week after your baby leaves
          neonatal care (tier 2), the notice periods are fixed: 15
          days&apos; notice for a single week of leave or pay, and at
          least 28 days&apos; notice for two or more weeks. Your
          employer can agree to waive or shorten the notice
          requirements, and many do in practice — but they cannot
          extend them. Keep copies of everything you send: if there is
          ever a dispute about entitlement, the notice dates are what
          decide it. If your baby is likely to be in care for a long
          time, you can agree a different notice rhythm with your
          employer for tier 1 leave, such as a single notice covering
          the expected stay.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Can neonatal care leave be added to the end of maternity
          leave?
        </h2>
        <p className={bodyClass}>
          Yes — that is exactly how the scheme is designed to work.
          Neonatal Care Leave cannot overlap with maternity or
          adoption leave, so it is taken after that leave ends,
          effectively extending your time at home by the number of
          weeks your baby spent in neonatal care, up to 12. A mother
          whose baby spends 5 weeks in hospital can therefore take her
          52 weeks of maternity leave and then 5 weeks of neonatal
          care leave, as long as all of it falls within 68 weeks of
          the birth. The same applies the other way round for a
          partner: neonatal leave can sit before or after their{" "}
          <Link href="/paternity-pay-calculator" className={linkClass}>
            paternity leave
          </Link>{" "}
          and any{" "}
          <Link
            href="/shared-parental-leave-calculator"
            className={linkClass}
          >
            Shared Parental Leave
          </Link>
          , and in tier 1 it can even be interrupted by pre-booked
          parental leave, with the remaining neonatal weeks tagged on
          immediately afterwards. What you cannot do is be on two
          kinds of statutory leave in the same week.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Do you get longer maternity leave if your baby is in
          neonatal care?
        </h2>
        <p className={bodyClass}>
          Maternity leave itself does not get longer — it stays at up
          to 52 weeks, and Statutory Maternity Pay still runs for 39
          of them, exactly as it would if your baby had come home
          straight away. And yes, you can take maternity leave if your
          baby is in neonatal care (NICU): your leave and pay run as
          normal from the start date you gave your employer, and if
          your baby is born early, maternity leave starts the day
          after the birth automatically. The extra time comes from the
          separate neonatal entitlement on top: up to 12 further weeks
          of leave, paid at the SNCP rate, taken after your maternity
          leave ends. So the honest answer to “is my leave longer?” is
          that the maternity part is unchanged, but your total time
          away from work can be — up to 64 weeks in all, within the
          68-week window from the birth. If sickness absence is part
          of the picture for you rather than the baby, our{" "}
          <Link href="/ssp-calculator" className={linkClass}>
            Statutory Sick Pay calculator
          </Link>{" "}
          covers the separate rules that apply to your own illness.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Tier 1 and tier 2: when the leave can be taken
        </h2>
        <p className={bodyClass}>
          The scheme splits the leave into two tiers because families
          use it in two different ways. Tier 1 covers the period while
          your baby is in neonatal care and the first week after care
          ends. Leave in tier 1 is flexible: you can take it in
          separate blocks of at least one week at a time — a week at
          the hospital, back to work, another week later — to match
          how the care unfolds. Tier 2 is everything after that first
          week: any leave you have left must be taken in one single
          continuous block, which suits parents who save the leave for
          after the baby comes home. Either way, every week must be
          taken within 68 weeks of the birth, and leave is counted in
          whole weeks — you cannot take odd days of neonatal care
          leave. Your accrued holiday continues to build up throughout,
          and our{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          works out that separate entitlement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>A note for employers</h2>
        <p className={bodyClass}>
          Employers pay SNCP through the normal payroll and recover it
          from HMRC through the Employer Payment Summary: 92% of what
          you pay, or — if your total Class 1 National Insurance bill
          for the previous tax year was £45,000 or less — 108.5% in
          2025/26 and 109% in 2026/27 under Small Employers&apos;
          Relief, the extra percentage compensating for the employer
          National Insurance due on the SNCP itself. If your PAYE bill
          is not large enough to absorb the recovery, you can apply to
          HMRC for advance funding instead. Keep records for 3 years:
          the dates and amounts of SNCP paid, any weeks claimed but
          not paid and why, and the employee&apos;s declaration (form
          NEO2 or your own record). If an employee does not qualify
          for pay, form NEO1 or an equivalent letter must go out
          within 28 days of their notice. The wider cost of an
          employee&apos;s absence is mostly the cost of cover — our{" "}
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
          show the full picture.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Statutory rates used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  2025/26
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  2026/27
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">SNCP flat weekly rate</td>
                <td className="px-4 py-2">
                  {gbp.format(rate2526.weeklyRate)} per week
                </td>
                <td className="px-4 py-2">
                  {gbp.format(rate2627.weeklyRate)} per week
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Earnings-related alternative
                </td>
                <td className="px-4 py-2" colSpan={2}>
                  {NEONATAL.aweFraction * 100}% of average weekly
                  earnings, if lower — the same in every week (no
                  higher-rate opening stage)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Maximum weeks payable</td>
                <td className="px-4 py-2" colSpan={2}>
                  {NEONATAL.maxWeeks} weeks — one per 7 consecutive
                  days in neonatal care, taken within{" "}
                  {NEONATAL.leaveWindowWeeks} weeks of the birth
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Minimum earnings to qualify
                </td>
                <td className="px-4 py-2">
                  {gbp.format(rate2526.lowerEarningsLimitWeekly)} per
                  week (Lower Earnings Limit)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(rate2627.lowerEarningsLimitWeekly)} per
                  week (Lower Earnings Limit)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Service needed for pay</td>
                <td className="px-4 py-2" colSpan={2}>
                  26 weeks by the end of the qualifying week (leave
                  itself is a day-one right)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Employer recovery from HMRC
                </td>
                <td className="px-4 py-2">
                  92%, or 108.5% with Small Employers&apos; Relief
                </td>
                <td className="px-4 py-2">
                  92%, or 109% with Small Employers&apos; Relief
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: GOV.UK “Rates and thresholds for employers” and the
          Statutory Neonatal Care Pay employer guide. Rules verified
          24 November 2026.
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

      <RelatedCalculators href="/neonatal-care-pay-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
