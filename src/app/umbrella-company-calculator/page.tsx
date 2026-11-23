import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import UmbrellaCalculator from "@/components/UmbrellaCalculator";
import { calculateUmbrella } from "@/lib/umbrella";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/umbrella-company-calculator",
  "Umbrella Company Calculator — Take-Home From the Assignment Rate",
  "Free umbrella company calculator: take-home pay from the assignment rate with every deduction shown — umbrella margin, employer NI, apprenticeship levy, holiday pay, tax and NI. £300 a day leaves £45,005.88 a year.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Worked example — computed by the same function the calculator
// runs, so the page can never disagree with itself.
const exDay = calculateUmbrella({
  rate: 300,
  rateType: "day",
  hoursPerDay: 7.5,
  daysPerWeek: 5,
  weeksPerYear: 46,
  marginPerWeek: 25,
});
const ex500 = calculateUmbrella({
  rate: 500,
  rateType: "day",
  hoursPerDay: 7.5,
  daysPerWeek: 5,
  weeksPerYear: 46,
  marginPerWeek: 25,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is umbrella take-home pay calculated?",
    answer:
      "From the top down. The assignment income (rate × days × weeks) first pays the umbrella's margin, employer National Insurance (15% of salary over £5,000) and the apprenticeship levy (0.5%). What remains is your gross salary, and Income Tax and employee NI come off that. On £300 a day over 46 weeks: £69,000 of assignment income becomes a £59,393.94 salary and £45,005.88 of take-home pay.",
  },
  {
    question: "Why is my umbrella salary so much lower than my day rate suggests?",
    answer:
      "Because the assignment rate is not a salary — it is a budget that has to carry the employer costs a normal employer pays on top of wages. Employer NI alone takes £8,159.09 on the £300-a-day example. Agencies quote an uplifted umbrella rate precisely because these costs sit inside it; comparing the umbrella rate with a PAYE salary without adjusting for that double-counts the difference.",
  },
  {
    question: "What is the umbrella margin?",
    answer:
      "The umbrella company's fee for employing you and running your payroll — typically £15 to £30 a week, or a monthly equivalent. It is the only part of the deduction chain that is the umbrella's own income, and the only part that varies much between umbrellas. Everything else — employer NI, the levy, tax, your NI — is set by law and should be identical on the same rate wherever you go.",
  },
  {
    question: "What is the 12.07% holiday pay figure on my umbrella payslip?",
    answer:
      "Holiday pay accrued at 12.07% of your working pay — the ratio of 5.6 weeks of statutory holiday to 46.4 working weeks. It is part of your gross salary, not an extra: some umbrellas hold it back and pay it when you take leave, others roll it up into each payment (your payslip must show which). On the £300-a-day example the holiday element inside the salary is about £6,396 a year.",
  },
  {
    question: "Can an umbrella company offer me 80–90% take-home?",
    answer:
      "Not lawfully, on an ordinary contract. The honest arithmetic on a £300 day rate lands near 65% of the assignment income once employer NI, the levy, tax and employee NI are paid — and a quote far above that usually means a deduction has been hidden, or the scheme is a disguised-remuneration arrangement of the kind HMRC pursues, with the tax bill landing on the worker. Compare any quote line by line against the waterfall on this page.",
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
  name: "Umbrella Company Calculator",
  url: `${AppConfig.siteUrl}/umbrella-company-calculator`,
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

export default function UmbrellaCompanyCalculatorPage() {
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
          Umbrella Company Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          An umbrella rate is not a salary: the margin, employer NI
          and the apprenticeship levy come off before your gross pay
          is set, then tax and NI come off that. On £300 a day, five
          days a week for 46 weeks, the take-home is{" "}
          {gbp.format(exDay.takeHome.netAnnual)} a year.
        </p>
      </section>

      <UmbrellaCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The deduction waterfall, line by line
        </h2>
        <p className={bodyClass}>
          Every umbrella payslip is built the same way, because the
          order is fixed by what the money legally is. The £300-a-day
          example, in full:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Line</th>
                <th className={thClass}>What it is</th>
                <th className={thClass}>£300/day, 46 weeks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Assignment income</td>
                <td className={tdClass}>Rate × days × weeks</td>
                <td className={tdClass}>{gbp.format(exDay.assignmentIncome)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Umbrella margin</td>
                <td className={tdClass}>The umbrella&apos;s fee, £25 a week here</td>
                <td className={tdClass}>− {gbp.format(exDay.marginAnnual)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Employer NI</td>
                <td className={tdClass}>15% of salary over £5,000 a year</td>
                <td className={tdClass}>− {gbp.format(exDay.employerNi)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Apprenticeship levy</td>
                <td className={tdClass}>0.5% of salary</td>
                <td className={tdClass}>− {gbp.format(exDay.apprenticeshipLevy)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Gross salary</td>
                <td className={tdClass}>
                  What is left — including {gbp.format(exDay.holidayPayElement)} of
                  holiday pay
                </td>
                <td className={tdClass}>{gbp.format(exDay.grossSalary)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Tax and employee NI</td>
                <td className={tdClass}>Standard PAYE on the gross salary</td>
                <td className={tdClass}>
                  − {gbp.format(exDay.takeHome.totalDeductions)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Take-home pay</td>
                <td className={tdClass}>
                  {gbp.format(exDay.netMonthly)} a month ·{" "}
                  {exDay.shareOfAssignmentPercent}% of the assignment income
                </td>
                <td className={tdClass}>{gbp.format(exDay.takeHome.netAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The employer NI line is the one to watch when you compare
          umbrellas, because it is circular: NI is charged on the
          salary, and the salary is what is left after NI. This
          calculator solves the two together rather than estimating
          one and hoping — the lines above add back up to the
          assignment income to the penny. Any illustration that cannot
          show you that reconciliation is guessing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is umbrella pay self-employed? No — you are an employee
        </h2>
        <p className={bodyClass}>
          Working through an umbrella does not make you
          self-employed. The umbrella company employs you: it is
          your employer on paper and in law, it runs your payroll,
          and your Income Tax and National Insurance are deducted
          through PAYE before you are paid, exactly as in an ordinary
          job. That means there is normally no Self Assessment tax
          return to file for umbrella income — if umbrella pay is
          your only income, you generally do not need to register as
          self-employed or complete a return at all. (A return can
          still be needed for other reasons — other income, or
          because HMRC asks for one.) It also means employment
          rights come with the arrangement: statutory sick and
          maternity pay, auto-enrolment into a pension, and the
          holiday pay covered above. Schemes that present umbrella
          pay as self-employment, or route it through loans or
          offshore payments to promise a higher take-home percentage,
          are not ordinary umbrellas — they are the
          disguised-remuneration arrangements HMRC pursues, and the
          tax bill lands on the worker.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The margin is a fixed fee, not a percentage
        </h2>
        <p className={bodyClass}>
          One figure is often misunderstood: the umbrella&apos;s
          margin is not a percentage of your rate. It is a fixed fee
          — typically £15 to £30 a week, or the monthly equivalent —
          agreed when you join, and it stays the same whether your
          day rate is £200 or £600. That is why the margin is the one
          line worth shopping on: on the same assignment rate, every
          other deduction (employer NI, the levy, tax, your NI) is
          set by law and comes out the same at every compliant
          umbrella, so the only honest difference between two
          take-home quotes is the margin and how holiday pay is
          handled. A quote that beats another by hundreds of pounds a
          month on the same rate has not found a cheaper margin — it
          has left something out.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: £500 a day
        </h2>
        <p className={bodyClass}>
          The same waterfall at a higher rate. Assumptions: £500 a
          day, five days a week, 46 weeks a year, and the same £25 a
          week margin the calculator uses above —{" "}
          {gbp.format(ex500.assignmentIncome)} of assignment income
          for the year:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Line</th>
                <th className={thClass}>£500/day, 46 weeks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Assignment income</td>
                <td className={tdClass}>{gbp.format(ex500.assignmentIncome)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Umbrella margin (£25 a week)</td>
                <td className={tdClass}>− {gbp.format(ex500.marginAnnual)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Employer NI</td>
                <td className={tdClass}>− {gbp.format(ex500.employerNi)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Apprenticeship levy</td>
                <td className={tdClass}>− {gbp.format(ex500.apprenticeshipLevy)}</td>
              </tr>
              <tr>
                <td className={tdClass}>
                  Gross salary (including {gbp.format(ex500.holidayPayElement)} of
                  holiday pay)
                </td>
                <td className={tdClass}>{gbp.format(ex500.grossSalary)}</td>
              </tr>
              <tr>
                <td className={tdClass}>Income Tax</td>
                <td className={tdClass}>
                  − {gbp.format(ex500.takeHome.incomeTax)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Employee NI</td>
                <td className={tdClass}>
                  − {gbp.format(ex500.takeHome.employeeNationalInsurance)}
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Take-home pay</td>
                <td className={tdClass}>
                  {gbp.format(ex500.takeHome.netAnnual)} a year ·{" "}
                  {gbp.format(ex500.netMonthly)} a month ·{" "}
                  {gbp.format(ex500.netPerWorkedWeek)} per worked week (
                  {ex500.shareOfAssignmentPercent}% of the assignment
                  income)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Note what changed with the rate: the margin did not move
          (£25 a week at both rates), but employer NI did —{" "}
          {gbp.format(ex500.employerNi)} here against{" "}
          {gbp.format(exDay.employerNi)} on £300 a day — and far more
          of the salary sits in the 40% tax band (the gross salary of{" "}
          {gbp.format(ex500.grossSalary)} stops just short of the
          £100,000 point where the Personal Allowance starts to
          taper). That is why the take-home share falls from{" "}
          {exDay.shareOfAssignmentPercent}% at £300 a day to{" "}
          {ex500.shareOfAssignmentPercent}% at £500.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Umbrella, agency PAYE or limited company?
        </h2>
        <p className={bodyClass}>
          Agency PAYE skips the margin and the levy pass-through but
          the employer costs still exist — they come out of a lower
          PAYE rate rather than the umbrella rate, so compare
          take-home figures, never headline rates. A limited company
          used to be the tax-efficient route for contractors, but
          where IR35 (the off-payroll rules) puts a contract inside
          IR35, the fee-payer deducts tax and NI before the company is
          paid and the advantage mostly disappears — the{" "}
          <Link href="/ir35-calculator" className={linkClass}>
            IR35 calculator
          </Link>{" "}
          shows that side. Inside IR35, umbrella and agency PAYE are
          the two ordinary routes, and the difference between them is
          the margin and how holiday pay is handled.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Employer NI (15% over the £5,000 secondary threshold),
          Income Tax and employee NI use the 2026/27 rates verified
          against GOV.UK. The apprenticeship levy is modelled at 0.5%
          of salary, the treatment large umbrellas apply after their
          shared £15,000 levy allowance; a small umbrella may show a
          lower levy line. Pension contributions are not deducted
          here — auto-enrolment contributions come off the gross
          salary where they apply.
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

      <RelatedCalculators href="/umbrella-company-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
