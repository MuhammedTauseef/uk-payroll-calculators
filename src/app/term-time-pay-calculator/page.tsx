import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TermTimePayCalculator from "@/components/TermTimePayCalculator";
import { calculateTermTime } from "@/lib/term-time";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/term-time-pay-calculator",
  "Term Time Pay Calculator — With the Holiday Uplift Included",
  "Free term-time pay calculator: term-time-only pay from the full-time salary, built from the working weeks plus the statutory holiday uplift most calculators miss — per year, per month and per week.",
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

// Worked examples — computed by the same function the calculator
// runs, so the page can never disagree with itself.
const exHeadline = calculateTermTime({
  fteAnnualSalary: 24000,
  workingWeeksPerYear: 39,
  fullTimeHoursPerWeek: 37.5,
  contractedHoursPerWeek: 37.5,
});
const WEEK_ROWS = [38, 39, 40].map((weeks) => ({
  weeks,
  result: calculateTermTime({
    fteAnnualSalary: 24000,
    workingWeeksPerYear: weeks,
    fullTimeHoursPerWeek: 37.5,
    contractedHoursPerWeek: 37.5,
  }),
}));

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do you calculate term time pay?",
    answer:
      "In three steps. First, work out the holiday the working weeks attract: 5.6 × (working weeks ÷ 46.4) — on 39 weeks that is 4.71 weeks. Second, add the two together to get paid weeks: 39 + 4.71 = 43.71. Third, scale the full-time salary by paid weeks over the weeks in a year: £24,000 × 43.71 ÷ 52.143 = £20,117.09 a year. If the contracted hours are fewer than the full-time pattern, scale by the hours as well.",
  },
  {
    question: "Is term time only 38 weeks?",
    answer:
      "Usually not exactly. A school year in England has about 39 weeks of term, and many term-time contracts are written as 38, 39 or 40 working weeks once INSET and training days are counted — some add a week or two of holiday-period working on top. Scotland and Wales differ slightly. The contract states the number, and it is that number — not a guess at the term length — that belongs in the calculation.",
  },
  {
    question: "How are term time jobs paid?",
    answer:
      "Almost always in twelve equal monthly instalments, even though the work happens in roughly nine months of the year. The annual term-time salary is divided by 12 and paid every month including August, which smooths the income but confuses anyone comparing the monthly figure with colleagues who are paid only for the months they work. Check a payslip against the annual figure ÷ 12, not against the working weeks.",
  },
  {
    question: "Do term-time workers get paid during the school holidays?",
    answer:
      "Yes, in effect — but the pay is for the holiday entitlement the working weeks have earned, not for working. A term-time salary is built from the working weeks plus paid holiday weeks (43.71 paid weeks on a 39-week contract), then spread over twelve months. The weeks of the school holidays beyond that entitlement are unpaid, which is exactly why the annual figure is lower than the full-time salary.",
  },
  {
    question: "What is the difference between term-time only and part-time?",
    answer:
      "They are different reductions. Part-time reduces the hours or days in each week, all year round. Term-time only reduces the weeks in the year, usually at full weekly hours. Some jobs are both — part-time hours in term weeks only — and then both reductions apply: the weeks calculation on this page, scaled by the hours fraction. Our pro-rata salary calculator covers the part-time side.",
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
  name: "Term Time Pay Calculator",
  url: `${AppConfig.siteUrl}/term-time-pay-calculator`,
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

export default function TermTimePayCalculatorPage() {
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
          Term Time Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          Work out term-time-only pay from the full-time salary: the
          working weeks, plus the paid holiday those weeks attract,
          spread over the year. On a £24,000 full-time salary and a
          39-week contract that is {gbp.format(exHeadline.annualPay)}{" "}
          a year — {gbp.format(exHeadline.monthlyPay)} a month —
          including the holiday uplift most calculators leave out.
        </p>
      </section>

      <TermTimePayCalculator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do you calculate term time pay?
        </h2>
        <p className={bodyClass}>
          A term-time salary is not simply the full-time salary
          scaled by the weeks worked, because the weeks worked earn
          paid holiday. The standard construction — the one school
          and local-authority payrolls use — has three steps:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Step</th>
                <th className={thClass}>Calculation</th>
                <th className={thClass}>On 39 weeks and £24,000</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>1. Holiday weeks</td>
                <td className={tdClass}>
                  5.6 × (working weeks ÷ 46.4)
                </td>
                <td className={tdClass}>
                  5.6 × 39 ÷ 46.4 = {exHeadline.holidayWeeks} weeks
                </td>
              </tr>
              <tr>
                <td className={tdClass}>2. Paid weeks</td>
                <td className={tdClass}>Working weeks + holiday weeks</td>
                <td className={tdClass}>
                  39 + {exHeadline.holidayWeeks} = {exHeadline.paidWeeks}{" "}
                  weeks
                </td>
              </tr>
              <tr>
                <td className={tdClass}>3. Annual pay</td>
                <td className={tdClass}>
                  FTE salary × (paid weeks ÷ 52.143)
                </td>
                <td className={tdClass}>
                  £24,000 × {exHeadline.paidWeeks} ÷ 52.143 ={" "}
                  {gbp.format(exHeadline.annualPay)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The 5.6 is the statutory holiday entitlement in weeks;
          46.4 is the weeks actually worked in a full year (52.143 −
          5.6) — the same base the 12.07% holiday accrual rate comes
          from; and 52.143 is the weeks in a year. Where the job is
          also part-time in hours, the result is scaled by
          contracted ÷ full-time hours.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The holiday uplift: the step most calculators miss
        </h2>
        <p className={bodyClass}>
          Search for a term-time calculator and several of the
          results do the short version: salary × weeks ÷ 52.143,
          stop there. That prices the worked weeks and never pays
          the holiday that attaches to them. On the example above
          the short version gives{" "}
          {gbp.format(exHeadline.withoutUpliftAnnual)} —{" "}
          {gbp.format(exHeadline.upliftAmount)} a year less than the{" "}
          {gbp.format(exHeadline.annualPay)} the full construction
          gives. Holiday is earned on the weeks worked and has to be
          paid; a term-time figure without the uplift is simply an
          underpayment spread over twelve months. This calculator
          always includes it, and shows the shortcut figure alongside
          so you can see the difference on your own numbers.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Working weeks</th>
                <th className={thClass}>Holiday weeks</th>
                <th className={thClass}>Paid weeks</th>
                <th className={thClass}>Pay per year (£24,000 FTE)</th>
                <th className={thClass}>Pay per month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {WEEK_ROWS.map(({ weeks, result }) => (
                <tr key={weeks}>
                  <td
                    className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}
                  >
                    {weeks} weeks
                  </td>
                  <td className={tdClass}>{result.holidayWeeks}</td>
                  <td className={tdClass}>{result.paidWeeks}</td>
                  <td className={tdClass}>{gbp.format(result.annualPay)}</td>
                  <td className={tdClass}>{gbp.format(result.monthlyPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How are term time jobs paid?
        </h2>
        <p className={bodyClass}>
          In twelve equal monthly instalments, almost without
          exception. The annual figure is divided by 12 and paid
          every month of the year, including the summer holidays —
          so the pay does not stop in August, but each monthly
          payment is lower than the value of a working month. That
          is why a term-time payslip looks wrong if you check it
          against the weeks worked that month: it is not payment for
          that month, it is a twelfth of the year. The entitlement
          side of the same job — how much holiday a term-time or
          part-time pattern carries — is worked out by the{" "}
          <Link href="/pro-rata-holiday-calculator" className={linkClass}>
            pro-rata holiday calculator
          </Link>
          , and the part-time salary equivalent by the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>
          .
        </p>
        <p className={bodyClass}>
          For the employer, the obligation is the record: contracted
          weeks, hours and the uplift belong in the payroll file for
          every term-time member of staff, and the wage cost has to
          land in the accounts month by month.{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          keeps those costs recorded alongside the rest of the
          organisation&apos;s finances, so the term-time pay bill is
          visible in the same figures as everything else.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign up
          after visiting them — it never changes the price you pay,
          and providers cannot pay to be ranked or included.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Method follows the Working Time Regulations 1998 and ACAS
          guidance on holiday entitlement and pay for part-year
          workers, checked 16 November 2026. Individual contracts and
          local agreements (for example the NJC Green Book for
          school support staff) set the exact weeks and any extra
          leave on top of the statutory minimum — the contract
          figure governs where it is more generous.
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

      <RelatedCalculators href="/term-time-pay-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
