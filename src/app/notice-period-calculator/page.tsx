import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import NoticeCalculator from "@/components/NoticeCalculator";
import {
  MAX_EMPLOYER_STATUTORY_WEEKS,
  calculateNotice,
  formatDateGB,
} from "@/lib/notice";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata = pageMetadata(
  "/notice-period-calculator",
  "Notice Period Calculator",
  "Free UK notice period calculator: the statutory minimum notice an employer or employee must give under the Employment Rights Act 1996, and the last working day.",
);

const gbpNotice = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Does a notice period start on the day notice is given?",
    answer:
      "No. A notice period starts running on the day after notice is given. If notice is given on a Monday with one week to run, the period runs from Tuesday and the last working day is the following Monday — which is why this calculator adds the full notice period to the date notice is given.",
  },
  {
    question: "Can a contract give less notice than the statutory minimum?",
    answer:
      "A contract can say a shorter period, but it cannot take away the statutory minimum. If the contract says two weeks and the law requires five, five weeks is what must be given. The longer of the contract period and the statutory minimum always applies.",
  },
  {
    question: "How much notice does an employer have to give after 10 years?",
    answer:
      "Ten complete years of service means a statutory minimum of 10 weeks' notice from the employer — one week for each complete year. The minimum rises by a week per year until it reaches the maximum of 12 weeks at 12 years' service.",
  },
  {
    question: "What is payment in lieu of notice (PILON)?",
    answer:
      "Payment in lieu of notice is where the employment ends straight away and the employee is paid the salary they would have earned during the notice period instead of working it. It is only available if the contract allows it (or it is agreed), and the payment is taxed like normal pay.",
  },
  {
    question: "Does the statutory minimum apply during a probationary period?",
    answer:
      "Yes. Probation does not remove the statutory minimums: once an employee has one month's service, an employer must give at least one week's notice and the employee must give at least one week's notice, whatever the contract's probationary terms say. Many contracts set a shorter probationary notice period, but it cannot go below the statutory floor.",
  },
  {
    question: "How is notice pay calculated?",
    answer:
      "Notice pay is your normal pay for the notice period. For a salaried employee, take a week's pay as the annual salary divided by 52 and multiply by the weeks of notice: on £41,600, a week's pay is £800, so four weeks' notice pay is £3,200 — before the usual tax and National Insurance. If your pay varies week to week, your employer works from your average weekly pay over the 12 weeks before the notice period began. You are paid the same way whether you work the notice, spend it on garden leave or are paid in lieu.",
  },
  {
    question: "Can my employer reject my resignation?",
    answer:
      "No. As ACAS puts it, an employer cannot reject a resignation — once you have resigned clearly, the resignation stands, and you cannot be made to withdraw it or be kept in the job against your will beyond your notice. What your employer can hold you to is the notice itself: leaving before it ends without agreement is a breach of contract. If you want to go sooner, the safe route is to agree a shorter period — ideally in writing — or to take accrued holiday inside the notice period.",
  },
  {
    question: "Will I still get paid if I resign?",
    answer:
      "Yes. Resigning does not cancel pay you have already earned: you are paid for every day worked up to your last day, notice pay for any notice you work (or payment in lieu if your contract provides for it and your employer chooses it), and a payment for holiday you have built up but not taken, which must be included in your final pay. What you are not paid for is notice you refuse to work without agreement — an employer only has to pay for the time actually worked in that case.",
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
  name: "Notice Period Calculator",
  url: `${AppConfig.siteUrl}/notice-period-calculator`,
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

const SERVICE_TABLE: { service: string; employerMinimum: string }[] = [
  { service: "Less than 1 month", employerMinimum: "No statutory minimum" },
  { service: "1 month to 2 years", employerMinimum: "1 week" },
  { service: "2 years", employerMinimum: "2 weeks" },
  { service: "3 years", employerMinimum: "3 weeks" },
  { service: "Each further complete year", employerMinimum: "1 extra week" },
  {
    service: "12 years or more",
    employerMinimum: `${MAX_EMPLOYER_STATUTORY_WEEKS} weeks (the maximum)`,
  },
];

// Worked-example figures — computed by the same calculateNotice() the
// tool above runs, so the dates on this page can never disagree with it.
const noticeMondayExample = calculateNotice({
  whoGivesNotice: "employer",
  employmentStartDate: "2020-06-01",
  noticeDate: "2026-03-02",
  contractNoticeValue: 4,
  contractNoticeUnit: "weeks",
});
const noticeThreeMonthExample = calculateNotice({
  whoGivesNotice: "employee",
  employmentStartDate: "2022-01-03",
  noticeDate: "2026-01-05",
  contractNoticeValue: 3,
  contractNoticeUnit: "months",
});
const noticeSixtyDayExample = calculateNotice({
  whoGivesNotice: "employee",
  employmentStartDate: "2024-01-01",
  noticeDate: "2026-01-05",
  contractNoticeValue: 60 / 7,
  contractNoticeUnit: "weeks",
});

// Notice-pay example — a £41,600 salary divides cleanly: a week's
// pay is the annual salary spread over 52 weeks.
const NOTICE_PAY_SALARY = 41600;
const noticePayWeekly = NOTICE_PAY_SALARY / 52;
const noticePayFourWeeks = noticePayWeekly * 4;

export default function NoticePeriodCalculatorPage() {
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
          Notice Period Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Use this notice period calculator to work out how much notice must
          be given under UK law. Enter who is giving notice, the employment
          start date and what the contract says, and the calculator compares
          the statutory minimum with the contract period and shows the
          earliest last working day.
        </p>
      </section>

      <NoticeCalculator />

      <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Employers: a leaver is easier to handle when the final working
        day, accrued leave and handover notes sit in one employee record.
        Compare the{" "}
        <Link
          href="/blog/best-hr-systems-uk"
          className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
        >
          best HR systems for UK employers
        </Link>{" "}
        if you are choosing software to manage those processes.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much notice does my employer have to give me?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Under section 86 of the Employment Rights Act 1996, an employer
          must give at least one week&apos;s notice once an employee has a
          month&apos;s service. From two years&apos; service the minimum
          rises by one week for every complete year worked, up to a maximum
          of {MAX_EMPLOYER_STATUTORY_WEEKS} weeks at twelve years. With under
          a month&apos;s service there is no statutory minimum, and the
          contract decides.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Length of service
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Employer&apos;s statutory minimum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SERVICE_TABLE.map((row) => (
                <tr key={row.service}>
                  <td className="px-4 py-2">{row.service}</td>
                  <td className="px-4 py-2">{row.employerMinimum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much notice do I have to give my employer?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          An employee&apos;s statutory minimum is simpler: once you have one
          month&apos;s service, you must give at least one week&apos;s
          notice, and it does not rise with length of service. With under a
          month&apos;s service there is no statutory minimum. In practice the
          figure that matters is usually in the contract, which often asks
          for a month or more — and because the longer of the two applies, a
          longer contract period is the one that binds you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What if my contract says a longer notice period?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Then the contract period is the one that applies. The statutory
          minimum is a floor, not a ceiling: the effective notice is always
          the longer of the contract period and the statutory minimum, in
          whichever direction notice is given. A contract can also never
          shorten notice below the statutory floor — if it tries to, the
          statutory minimum replaces it. Where a contract states notice in
          months, this calculator converts months to weeks at 52 ÷ 12 (about
          4.33 weeks per month), the standard way of spreading a month across
          the year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When does a notice period start?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A notice period starts on the day after notice is given — the day
          notice is handed over does not itself count. The period then runs
          for the full number of weeks that apply, so the earliest last
          working day is the date notice is given plus the effective notice
          period. Notice can be given on any day of the week; it does not
          have to line up with the start of a working week or a pay period.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked examples: notice handed in on a Monday
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Employer notice after five years.</strong> An employer
          gives notice on Monday 2 March 2026 to an employee who started
          on 1 June 2020 — five complete years of service. The statutory
          minimum is one week per complete year, so{" "}
          {noticeMondayExample.statutoryWeeks} weeks; the contract says{" "}
          {noticeMondayExample.contractWeeks} weeks, and the longer
          figure wins. The period runs from the day after notice is
          given, so the earliest last working day is{" "}
          {formatDateGB(noticeMondayExample.lastWorkingDay ?? "")} — the
          Monday five weeks later.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Resigning on a three-month contract.</strong> An
          employee resigns on Monday 5 January 2026. Their own statutory
          minimum is only {noticeThreeMonthExample.statutoryWeeks} week,
          but the contract asks for three months —{" "}
          {noticeThreeMonthExample.contractWeeks} weeks at 52 ÷ 12 weeks
          per month — and the contract is longer, so it applies. Their
          last working day is{" "}
          {formatDateGB(noticeThreeMonthExample.lastWorkingDay ?? "")}.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>A 60-day clause.</strong> Where a contract states
          notice in days rather than weeks, divide by seven: 60 days is{" "}
          {noticeSixtyDayExample.contractWeeks} weeks. Given on Monday 5
          January 2026, that period ends on{" "}
          {formatDateGB(noticeSixtyDayExample.lastWorkingDay ?? "")} —
          exactly 60 days later.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What are payment in lieu of notice and garden leave?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Payment in lieu of notice (PILON)</strong> means the
          employment ends immediately and the employee is paid the salary for
          the notice period instead of working it.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Garden leave</strong> means the employee stays employed and
          paid during the notice period but is asked not to come to work or
          contact clients until it ends.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Either side can also simply agree a longer notice period than the
          minimum — nothing in the statutory rules prevents a longer period
          by agreement. This page is general guidance on how the minimums
          work, not legal advice for a specific situation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How is notice pay calculated?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          While you work your notice you are simply paid as normal — full
          pay, on the usual pay days, with the usual deductions. The
          calculation only becomes a question in its own right when the
          notice is not worked (payment in lieu), when pay varies, or
          when part of the period is spent away from work. The building
          block is a week&apos;s pay: for a salaried employee that is the
          annual salary divided by 52. On a salary of{" "}
          {gbpNotice.format(NOTICE_PAY_SALARY)}, a week&apos;s pay is{" "}
          {gbpNotice.format(noticePayWeekly)}, so four weeks of notice —
          worked, on garden leave or paid in lieu — come to{" "}
          {gbpNotice.format(noticePayFourWeeks)} before tax and National
          Insurance. If your pay is different each week, your employer
          uses your average weekly pay over the 12 weeks before the
          notice period started, including guaranteed overtime.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Holiday inside notice.</strong> Leave keeps building up
          throughout the notice period, exactly as if you were not
          leaving. Holiday you have built up but not taken by your last
          day must be paid for in your final pay — the{" "}
          <Link
            href="/annual-leave-calculator"
            className="font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300"
          >
            annual leave calculator
          </Link>{" "}
          works out how much has accrued by a leaving date. An employer
          can also require you to use up remaining holiday during the
          notice period, as long as they give you notice of at least
          twice the length of the leave they want you to take.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Sick leave inside notice.</strong> If your employer has
          given you notice and your contract asks for no more than the
          statutory minimum (or no more than a week longer), sections 87
          to 88 of the Employment Rights Act 1996 entitle you to your
          full normal pay for the statutory notice period even if you are
          off sick and your sick pay has run out — any sick pay already
          paid counts towards it. Where the contract gives noticeably
          longer notice than the statutory minimum, the contract&apos;s
          own sick pay terms apply instead. And a payment in lieu of
          notice is taxed like normal pay: since April 2018 the basic pay
          for the notice period is always taxed as earnings, even if it
          is paid after you have left.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What happens if you leave without giving notice?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Nobody can be physically made to work a notice period — but
          walking out without agreement has real consequences, and ACAS
          is blunt about the main one: leaving without working your
          notice, without agreeing it first, puts you in breach of
          contract. You are still paid for every day you actually worked,
          and for holiday built up but not taken — that money is yours
          however the job ends. You are not paid for the notice you did
          not work.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If your sudden departure costs your employer money — the
          classic case is paying over the odds for agency cover at short
          notice — they may be able to deduct that cost from your final
          pay <em>if your contract allows it</em>, or claim it back
          through the courts. Claims are uncommon in practice, but the
          contract wording is what decides, so check it before you go.
          The other cost is quieter: a reference that reflects how you
          left, which matters most in regulated industries such as
          financial services. Two situations are different. If your
          employer has seriously breached your contract first, you may
          be entitled to leave without working notice at all (resigning
          in response to a fundamental breach — constructive dismissal).
          And either side can always agree to shorten the notice: if you
          need to start a new job sooner, ask, and get any agreement in
          writing.
        </p>
      </section>

      <RelatedCalculators href="/notice-period-calculator" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.question} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
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
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
