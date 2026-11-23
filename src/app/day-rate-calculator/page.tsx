import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import DayRateCalculator from "@/components/DayRateCalculator";
import { convertDayRate } from "@/lib/day-rate";
import type { DayRateInput } from "@/lib/day-rate";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/day-rate-calculator",
  "Day Rate Calculator UK — Day Rate to Annual Salary, 2026/27",
  "Free UK day rate calculator: turn a contractor day rate into a yearly, monthly and hourly figure — or a salary into the day rate it needs — with your real billable days and a take-home estimate.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const DEFAULTS: Omit<DayRateInput, "direction" | "dayRate" | "targetAnnualSalary"> = {
  daysPerWeek: 5,
  bankHolidaysPerYear: 8,
  holidayDaysPerYear: 25,
  otherDaysOffPerYear: 0,
  hoursPerDay: 7.5,
  upliftPercent: 30,
};

// Worked examples — computed by the same function the tool above
// runs, so the page can never disagree with itself.
const ex300 = convertDayRate({
  ...DEFAULTS,
  direction: "rateToSalary",
  dayRate: 300,
  targetAnnualSalary: 0,
});

const ex500at220 = convertDayRate({
  ...DEFAULTS,
  holidayDaysPerYear: 32,
  direction: "rateToSalary",
  dayRate: 500,
  targetAnnualSalary: 0,
});

const exSalary50k = convertDayRate({
  ...DEFAULTS,
  direction: "salaryToRate",
  dayRate: 0,
  targetAnnualSalary: 50000,
});

const exSalary50kNoUplift = convertDayRate({
  ...DEFAULTS,
  upliftPercent: 0,
  direction: "salaryToRate",
  dayRate: 0,
  targetAnnualSalary: 50000,
});

// Common day rates on the default working year (227 billable
// days), converted by the tool's own maths for the table below.
const RATE_ROWS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 750, 1000].map(
  (rate) => ({
    rate,
    result: convertDayRate({
      ...DEFAULTS,
      direction: "rateToSalary",
      dayRate: rate,
      targetAnnualSalary: 0,
    }),
  }),
);

// Employee framing — one day's pay from a salary is a different
// calculation from a contractor day rate: no uplift, and the
// divisor is the weekdays in a year (52 weeks × 5 days = 260),
// because a salary is paid for holiday and bank holidays too.
const EMPLOYEE_SALARY = 36000;
const EMPLOYEE_DAY_PAY = EMPLOYEE_SALARY / 260;
const EMPLOYEE_HOURLY_8H = EMPLOYEE_DAY_PAY / 8;
const EMPLOYEE_HOURLY_75H = EMPLOYEE_DAY_PAY / 7.5;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I convert a day rate into an annual salary?",
    answer: `Multiply the day rate by the days you can actually bill in a year — not by 365, and not by 260. Five days a week for 52 weeks is 260 weekdays; take off 8 bank holidays and 25 days of holiday and ${ex300.billableDays} billable days remain. At £300 a day that is £300 × ${ex300.billableDays} = ${fmtMoney(ex300.grossAnnual)} a year, or ${fmtMoney(ex300.monthlyGross)} a month. Every day of holiday you add or remove moves the yearly figure by a full day rate, which is why the days matter as much as the rate.`,
  },
  {
    question: "How many billable days are there in a year?",
    answer:
      "It depends on the time off you take, which is exactly why this calculator builds the figure from your own inputs instead of assuming one. A full-time contractor working 5 days a week starts from 260 weekdays. The usual deductions — 8 bank holidays in England and Wales, four to six weeks of holiday, and any gaps between contracts — land most people between 220 and 232 billable days. At 220 days, £500 a day is " +
      `${fmtMoney(ex500at220.grossAnnual)} a year; at 232 days the same rate is £116,000.`,
  },
  {
    question: "What day rate do I need to match a £50,000 salary?",
    answer: `On the standard method — the salary plus a 30% uplift for the benefits a salary carries, divided by your billable days — it is (${fmtMoney(50000)} × 1.3) ÷ ${exSalary50k.billableDays} = ${fmtMoney(exSalary50k.dayRate)} a day. Without any uplift the bare conversion is ${fmtMoney(exSalary50kNoUplift.dayRate)} a day, but that leaves you funding your own pension, holiday and sick pay out of the same money the salary used to cover, so it is not a like-for-like match.`,
  },
  {
    question: "Is a day rate before or after tax?",
    answer: `Before tax — every figure in the conversion is gross. What reaches your bank account depends on how the contract is taxed. Inside IR35, or through an umbrella company, the rate is taxed as employment income: on ${fmtMoney(ex300.grossAnnual)} of gross pay the 2026/27 Income Tax and employee National Insurance come to ${fmtMoney(ex300.incomeTax + ex300.employeeNationalInsurance)}, leaving an estimated ${fmtMoney(ex300.takeHomeAnnual)} — the estimate this calculator shows. Outside IR35 through your own limited company the tax works differently, through salary and dividends.`,
  },
  {
    question: `Is £300 a day the same as a ${fmtMoney(ex300.grossAnnual)} salary?`,
    answer: `No — the gross figures match, but the packages do not. A ${fmtMoney(ex300.grossAnnual)} salary comes with paid holiday, an employer pension contribution, sick pay and employer National Insurance paid on top; a day rate has to fund all of that itself. Taking the standard 30% benefits loading back out, £300 a day over ${ex300.billableDays} billable days is roughly a ${fmtMoney(ex300.equivalentSalary)} permanent salary in like-for-like terms — before the difference in how the two are taxed.`,
  },
  {
    question: "How do I work out one day's pay from my monthly salary?",
    answer: `Use the employee method, not the contractor one: annual salary ÷ 260. A salary is paid for every weekday of the year — 52 weeks × 5 days — including holidays and bank holidays, so one day's pay is the annual figure spread over those 260 days. On ${fmtMoney(EMPLOYEE_SALARY)} that is ${fmtMoney(EMPLOYEE_SALARY)} ÷ 260 = ${fmtMoney(EMPLOYEE_DAY_PAY)} a day. From a monthly figure, multiply by 12 first: ${fmtMoney(EMPLOYEE_SALARY / 12)} a month × 12 ÷ 260 gives the same ${fmtMoney(EMPLOYEE_DAY_PAY)}. This is the figure employers usually reach for when pricing a day of unpaid leave or a salary-sacrifice day — check your contract, because some use a calendar-day basis instead.`,
  },
  {
    question: "How many hours is a day rate?",
    answer: `There is no legal standard — the contract sets it. In practice a "day" in UK contracting usually means 7.5 or 8 working hours, and the difference matters: £300 a day is ${fmtMoney(300 / 7.5)} an hour on a 7.5-hour day but ${fmtMoney(300 / 8)} an hour on an 8-hour day. This calculator defaults to 7.5 hours and converts the day rate to an hourly figure on whatever hours-per-day you set, so check the hours your contract assumes before comparing a day rate with an hourly-paid role.`,
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
  name: "Day Rate Calculator",
  url: `${AppConfig.siteUrl}/day-rate-calculator`,
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

export default function DayRateCalculatorPage() {
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
          Day Rate Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Turn a day rate into a yearly, monthly and hourly figure —
          or a salary into the day rate you would need to charge —
          using your own billable days, not a standard year. Every
          figure is gross, and the result includes a take-home
          estimate on the 2026/27 tax rules. Free, nothing to sign
          up for.
        </p>
      </section>

      <DayRateCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this day rate calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This calculator is part of UK Payroll Calculators, a free
          hub of UK payroll calculators built on the April 2026
          rules — no sign-up, no accounts, and every figure worked
          out in your browser. Pick a direction, enter the day rate
          or the salary, then set the days honestly: the bank
          holidays you will not work, the holiday you actually take,
          and the gaps between contracts. The tool builds your
          billable days from those figures and shows the yearly,
          monthly, weekly and hourly amounts side by side, with the
          take-home estimate underneath. Nothing is locked behind an
          email address and there is no second, longer form — the
          whole calculation is on this page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you turn a day rate into a yearly figure?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Day rate × billable days. The billable days are the part
          most quick converters get wrong by assuming them: a year
          holds 260 weekdays, but nobody bills all of them. At £300
          a day on this page&apos;s defaults — 8 bank holidays and
          25 days of holiday — the working year is{" "}
          {ex300.billableDays} days, so £300 × {ex300.billableDays}{" "}
          = {fmtMoney(ex300.grossAnnual)} a year,{" "}
          {fmtMoney(ex300.monthlyGross)} a month,{" "}
          {fmtMoney(ex300.weeklyRate)} a week and{" "}
          {fmtMoney(ex300.hourlyRate)} an hour on a 7.5-hour day.
          The table runs the same maths for the rates readers ask
          about most, all on {ex300.billableDays} billable days:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Day rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per year (gross)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per month
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Per hour (7.5-hour day)
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Take-home estimate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RATE_ROWS.map((row) => (
                <tr key={row.rate}>
                  <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                    {fmtMoney(row.rate)} a day
                  </td>
                  <td className="px-4 py-2">{fmtMoney(row.result.grossAnnual)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.monthlyGross)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.hourlyRate)}</td>
                  <td className="px-4 py-2">{fmtMoney(row.result.takeHomeAnnual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The take-home column is the employment-style estimate —
          the gross figure taxed through PAYE, as it is inside IR35
          or through an umbrella company — before pension
          contributions and student loan repayments. Working outside
          IR35 through a limited company is taxed differently; the{" "}
          <Link href="/ir35-calculator" className={linkClass}>
            IR35 calculator
          </Link>{" "}
          works through the status questions and the inside/outside
          comparison on your day rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Employees: one day&apos;s pay from a monthly salary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Most people who search for a day rate are not contractors
          at all — they are employees asking what one day of their
          salary is worth, usually to price a day of unpaid leave, a
          salary-sacrifice day or a deduction they want to check. The
          method is different from everything above, because a salary
          is paid for all 260 weekdays of the year (52 weeks × 5
          days), holidays included — there are no billable days to
          deduct and no benefits uplift to add. So: annual salary ÷
          260. On {fmtMoney(EMPLOYEE_SALARY)} a year —{" "}
          {fmtMoney(EMPLOYEE_SALARY / 12)} a month — one day&apos;s
          pay is {fmtMoney(EMPLOYEE_SALARY)} ÷ 260 ={" "}
          {fmtMoney(EMPLOYEE_DAY_PAY)}, which is{" "}
          {fmtMoney(EMPLOYEE_HOURLY_8H)} an hour on an 8-hour day or{" "}
          {fmtMoney(EMPLOYEE_HOURLY_75H)} on a 7.5-hour day. If you
          are paid weekly instead, one day&apos;s pay is simply the
          weekly wage divided by the days you work each week. Two
          warnings: some contracts price deductions on a calendar-day
          basis (salary ÷ 365) instead, which produces a smaller
          daily figure, and statutory calculations — for example a
          week&apos;s pay for holiday or redundancy — have their own
          rules. The divisor in your contract is the one that binds.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          And how long is the &ldquo;day&rdquo; in any of this?
          There is no legal standard: a contractor&apos;s day is
          whatever the contract says, most often 7.5 or 8 hours, and
          the calculator above converts on the hours-per-day figure
          you give it (7.5 by default). Before comparing a day rate
          with an hourly rate — or an employee day with a contractor
          day — line the hours up first; at £300 a day the gap
          between a 7.5-hour and an 8-hour assumption is{" "}
          {fmtMoney(300 / 7.5 - 300 / 8)} an hour.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What day rate matches a salary?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Work backwards, and add the benefits back in first. The
          standard method takes the salary, adds an uplift for what
          a salary carries and a day rate does not — employer
          pension contributions, paid holiday, sick pay, and the
          employer National Insurance paid on top of a salary — then
          divides by your billable days. The usual uplift is 30%:
          a £50,000 salary becomes (£50,000 × 1.3) ÷{" "}
          {exSalary50k.billableDays} = {fmtMoney(exSalary50k.dayRate)}{" "}
          a day. Skip the uplift and the same salary converts to{" "}
          {fmtMoney(exSalary50kNoUplift.dayRate)} a day — the figure
          looks cheaper to a client, but it leaves you paying for
          your own pension and holiday out of money the salary used
          to cover. The uplift is an input in the calculator above,
          so you can test 20% or 40% if your old package was leaner
          or richer than the standard.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Running the contract: invoices and records
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A day rate only turns into money when it is invoiced, and
          the billable days this page counts are exactly what the
          invoices should show — days worked, at the agreed rate.
          Contractors also live or die by their expense records:
          every legitimate cost recorded through the year is a cost
          the tax bill recognises, whether the work is taxed through
          a limited company or on a Self Assessment return, and
          reconstructing a year of receipts in January is how
          expenses get missed. Keeping the books as you go —{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          raises the invoice for each block of days and records the
          expenses against it — means the day rate you negotiated is
          the income you actually keep track of.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign
          up after visiting them — it never changes the price you
          pay, and providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Why a day rate is not a salary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three differences sit underneath every conversion on this
          page. First, the days: a salary pays for all 52 weeks,
          including holiday and bank holidays; a day rate pays only
          for days billed. Second, the on-costs: a permanent
          employer pays National Insurance at 15% above £5,000 a
          year and at least 3% of qualifying earnings into a
          pension, on top of the salary — a contractor funds the
          equivalents out of the rate. The{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>{" "}
          shows those on-costs line by line for any salary. Third,
          the tax route: inside IR35 the rate is taxed like a
          salary, outside IR35 it can be taken as a small salary
          plus dividends — the{" "}
          <Link href="/umbrella-company-calculator" className={linkClass}>
            umbrella company calculator
          </Link>{" "}
          shows what an assignment rate leaves after the umbrella
          deductions, and the{" "}
          <Link href="/hourly-rate-converter" className={linkClass}>
            hourly rate converter
          </Link>{" "}
          does the same conversion work at an hourly level.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rules used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  How it is worked out
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">Billable days</td>
                <td className="px-4 py-2">
                  Days per week × 52, minus bank holidays, holiday
                  days and other days off — all your own inputs
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Annual contract value</td>
                <td className="px-4 py-2">Day rate × billable days</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Day rate from a salary</td>
                <td className="px-4 py-2">
                  Salary × (1 + uplift) ÷ billable days — the uplift
                  defaults to 30%
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Hourly equivalent</td>
                <td className="px-4 py-2">Day rate ÷ hours per day</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Take-home estimate</td>
                <td className="px-4 py-2">
                  The gross annual figure taxed as employment income
                  under the 2026/27 England, Wales and Northern
                  Ireland rules — Personal Allowance £12,570, 20% to
                  £50,270, 40% above; employee National Insurance 8%
                  from £12,570 to £50,270, then 2%. Before pension
                  contributions and student loan repayments
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Tax basis</td>
                <td className="px-4 py-2">
                  Conversion figures are gross. The take-home
                  estimate is the inside IR35 / umbrella position;
                  it is an estimate, not tax advice
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rules and rates checked against GOV.UK on 22 November
          2026. The conversion itself is arithmetic — the judgements
          in it are the billable days and the uplift, and both are
          yours to set above, so the figure can match your own
          working year.
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

      <RelatedCalculators href="/day-rate-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
