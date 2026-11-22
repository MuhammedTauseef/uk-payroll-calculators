import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import PayslipCalculator from "@/components/PayslipCalculator";
import { calculatePayslipBreakdown } from "@/lib/payslip-calculator";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/payslip-calculator",
  "Payslip Calculator — Your Monthly Pay, Line by Line",
  "Free payslip calculator: what your monthly payslip will show — gross pay, Income Tax from your tax code, National Insurance, pension and student loan — £36,000 on 1257L with 5% pension nets £2,283.62 with a Plan 2 loan.",
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
const ex = calculatePayslipBreakdown({
  annualSalary: 36000,
  taxCode: "1257L",
  pensionPercent: 5,
  studentLoanPlan: "plan2",
  postgraduateLoanToo: false,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is the tax on my payslip calculated?",
    answer:
      "PAYE is cumulative. Each payday, your employer works out the tax due on everything you have earned since 6 April, takes off what you have already paid, and deducts the difference. On a steady salary that settles into the same monthly figure — on £36,000 with the standard 1257L code, £390.50 a month with no pension — but a bonus month or a mid-year start changes the running total and the payslip with it.",
  },
  {
    question: "What does my tax code mean?",
    answer:
      "The digits are your tax-free allowance in tens of pounds: 1257L means £12,570 of tax-free pay in the year. The letter is about how the code is applied (L is the standard uprating code). BR taxes everything at 20%, D0 at 40%, D1 at 45%, 0T gives no allowance, and a K code ADDS the amount to your taxable pay — usually because of benefits or an underpayment being collected. The payslip calculator applies any of these at face value, as payroll does.",
  },
  {
    question: "Why is my National Insurance different from my tax?",
    answer:
      "Different thresholds and rates. In 2026/27, NI is 0% up to £12,570 a year, 8% from there to £50,270 and 2% above — and unlike tax it is worked out per pay period, not cumulatively, so a single high-pay month pays NI at the high rate even if the year's income is modest. NI also ignores most pension contributions: a net-pay pension contribution reduces your tax, never your NI. Only salary sacrifice reduces both.",
  },
  {
    question: "What is the difference between a payslip calculator and a payslip generator?",
    answer:
      "The calculator answers a question — what will my pay be? — from your salary, tax code, pension and student loan. The generator on this site builds the document: a printable payslip from one period's pay, for employers who need to issue one. If you are checking your own pay, you want the calculator; if you are producing a payslip for someone else, the generator.",
  },
  {
    question: "Why is my first payslip lower than expected?",
    answer:
      "Usually one of three things. An emergency tax code (1257L on a Week 1/Month 1 basis, shown as 1257L X or W1/M1) taxes the month in isolation and ignores earlier pay, which over-deducts until HMRC issues a cumulative code. A student loan deduction may have started because your plan type reached payroll before you expected it. Or a pension contribution began at the full rate from month one. All three settle themselves; an emergency code is corrected automatically once HMRC sends your employer the cumulative code.",
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
  name: "Payslip Calculator",
  url: `${AppConfig.siteUrl}/payslip-calculator`,
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

export default function PayslipCalculatorPage() {
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
          Payslip Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Your monthly payslip, before it arrives: gross pay minus
          tax, National Insurance, pension and any student loan. On
          £36,000 with the standard 1257L code, a 5% pension and a
          Plan 2 loan, the net is {gbp.format(ex.netMonthly)} a month
          from {gbp.format(ex.grossMonthly)} gross.
        </p>
      </section>

      <PayslipCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Reading the worked example
        </h2>
        <p className={bodyClass}>
          £36,000 a year, tax code 1257L, 5% pension, Plan 2 student
          loan — the most common graduate payslip in the country:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Payslip line</th>
                <th className={thClass}>Per month</th>
                <th className={thClass}>How it is worked out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Gross pay</td>
                <td className={tdClass}>{gbp.format(ex.grossMonthly)}</td>
                <td className={tdClass}>£36,000 ÷ 12</td>
              </tr>
              <tr>
                <td className={tdClass}>Pension (5%)</td>
                <td className={tdClass}>− {gbp.format(ex.pensionMonthly)}</td>
                <td className={tdClass}>
                  Off before tax (net-pay arrangement), not before NI
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Income Tax</td>
                <td className={tdClass}>− {gbp.format(ex.incomeTaxMonthly)}</td>
                <td className={tdClass}>
                  (£34,200 − £12,570 allowance) × 20% ÷ 12
                </td>
              </tr>
              <tr>
                <td className={tdClass}>National Insurance</td>
                <td className={tdClass}>− {gbp.format(ex.employeeNiMonthly)}</td>
                <td className={tdClass}>
                  (£36,000 − £12,570) × 8% ÷ 12 — on the full gross
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Student loan (Plan 2)</td>
                <td className={tdClass}>− {gbp.format(ex.studentLoanMonthly)}</td>
                <td className={tdClass}>
                  (£3,000 − £2,448 monthly threshold) × 9%
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Net pay</td>
                <td className={tdClass}>{gbp.format(ex.netMonthly)}</td>
                <td className={tdClass}>{gbp.format(ex.netAnnual)} over the year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Note the two lines people expect to interact and mostly do
          not: the pension comes off the pay the TAX is charged on but
          not the pay the NI is charged on — which is exactly why{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice
          </Link>
          , which removes the amount from salary altogether, is worth
          more than the same contribution made the ordinary way. And
          the student loan ignores the pension entirely: it is charged
          on gross pay over the threshold, pension or no pension.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          For employers: the payslip is a legal document
        </h2>
        <p className={bodyClass}>
          Every employee and worker has the right to an itemised
          payslip on or before payday, showing gross pay, each
          deduction and net pay — and the figures on it are the ones
          HMRC reconciles against the payroll submissions. Keeping the
          wage costs behind those payslips recorded properly matters
          as much as the payslips themselves:{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          keeps employment costs in the same accounts as the rest of
          the business, so the payroll totals in the books match what
          staff were actually paid.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tax and National Insurance use the 2026/27 bands verified
          against GOV.UK; student loan thresholds are GOV.UK&apos;s
          2026/27 figures, checked 17 November 2026. Real PAYE is
          cumulative through the tax year — this calculator annualises
          a steady salary, so treat a variable-pay month as an
          estimate.
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

      <RelatedCalculators href="/payslip-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
