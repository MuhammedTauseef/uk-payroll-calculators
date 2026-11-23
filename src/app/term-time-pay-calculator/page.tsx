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

// "Term time only + 2 weeks" on the same £24,000 FTE: 39 term weeks
// plus 2 extra working weeks (INSET, training and similar) = 41
// working weeks, run through the same engine.
const exPlusTwo = calculateTermTime({
  fteAnnualSalary: 24000,
  workingWeeksPerYear: 41,
  fullTimeHoursPerWeek: 37.5,
  contractedHoursPerWeek: 37.5,
});

// Level 3 teaching assistant example — an EXAMPLE full-time salary
// only (schools and councils grade Level 3 posts differently, so
// there is no single national figure to quote): £28,000 FTE,
// 39 working weeks, 32.5 contracted hours against a 37.5-hour
// full-time pattern.
const exLevel3 = calculateTermTime({
  fteAnnualSalary: 28000,
  workingWeeksPerYear: 39,
  fullTimeHoursPerWeek: 37.5,
  contractedHoursPerWeek: 32.5,
});

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
  {
    question: "Do term-time workers get annual leave?",
    answer:
      "Yes. Term-time (part-year) workers are entitled to paid annual leave like everyone else — the statutory minimum is 5.6 weeks a year. For leave years beginning on or after 1 April 2024, GOV.UK's accrual method for part-year and irregular-hours workers builds that leave up at 12.07% of the hours worked, capped at 5.6 weeks: on a 39-week full-time pattern that works out at 4.71 weeks of holiday, which is the uplift built into every figure on this page. In practice the leave is taken during the school closures, because leave during term time is normally not possible under a term-time contract.",
  },
  {
    question: "What does term time only + 2 weeks mean?",
    answer:
      "It means the contract covers the term weeks plus 2 extra working weeks — typically INSET days, training, exam or results work, or setting up and closing down around the terms. On a 39-week term that is 41 working weeks. Those weeks earn holiday in the usual way (41 weeks attract 4.95 weeks), so the paid weeks are 45.95, and on a £24,000 full-time salary the pay is £21,148.74 a year — £1,762.39 a month — still spread in twelve equal instalments. Put 41, not 39, in the calculator's working-weeks box.",
  },
  {
    question: "How much does a Level 3 teaching assistant earn term-time only?",
    answer:
      "There is no single national answer, because schools and councils grade Level 3 posts on different NJC spinal points. As an example only: on an example full-time salary of £28,000, working 39 weeks at 32.5 hours a week against a 37.5-hour full-time pattern, the term-time pay is £20,340.62 a year — £1,695.05 a month. Read the full-time salary and the spinal point off your own contract or job advert and run those figures through the calculator above.",
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Annual leave for term-time workers
        </h2>
        <p className={bodyClass}>
          Term-time workers are part-year workers, and they get paid
          annual leave like everyone else: the statutory minimum is
          5.6 weeks a year. The leave is almost always taken during
          the school closures — a term-time contract normally does
          not allow leave during term — so instead of booking
          holiday, the worker is paid for it: the holiday weeks the
          working weeks attract are added to the paid weeks, and the
          total is spread over twelve months. That is the uplift in
          the calculation above.
        </p>
        <p className={bodyClass}>
          Two legal changes sit behind the numbers. In{" "}
          <em>Harpur Trust v Brazel</em> (2022) the Supreme Court
          held that a part-year worker on a permanent contract was
          entitled to the full 5.6 weeks, with holiday pay worked
          out from average pay over a reference period that ignored
          weeks not worked — an outcome that could pay more than a
          straight pro-rata share. The government then legislated:
          for leave years beginning on or after 1 April 2024,
          GOV.UK&apos;s rules accrue holiday for part-year and
          irregular-hours workers at 12.07% of the hours actually
          worked in each pay period, up to the 5.6-week maximum —
          the same 12.07% this page&apos;s construction is built
          from (5.6 ÷ 46.4). The same reforms allow employers to use
          rolled-up holiday pay — an extra 12.07% added to each
          payslip instead of paying holiday pay when leave is
          taken — but only for irregular-hours and part-year
          workers, and it must be shown as a separate item on the
          payslip. It is an option, not a requirement, and many
          school payrolls keep the established method used here:
          holiday weeks added to the salary and the whole amount
          averaged over the year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does &ldquo;term time only + 2 weeks&rdquo; mean?
        </h2>
        <p className={bodyClass}>
          Job adverts and contracts often add a small number of
          weeks to the term weeks: &ldquo;term time only + 2
          weeks&rdquo; (sometimes written TTO + 2) means you work
          the term weeks <em>plus</em> 2 extra weeks — typically
          INSET and training days, exam or results-period work, or
          preparing classrooms at the start and end of the year.
          Those 2 weeks are working weeks like any other: they earn
          holiday and they are paid. The arithmetic on a 39-week
          term and the same £24,000 full-time salary used above:
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
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  39 weeks (term time only)
                </td>
                <td className={tdClass}>{exHeadline.holidayWeeks}</td>
                <td className={tdClass}>{exHeadline.paidWeeks}</td>
                <td className={tdClass}>{gbp.format(exHeadline.annualPay)}</td>
                <td className={tdClass}>{gbp.format(exHeadline.monthlyPay)}</td>
              </tr>
              <tr>
                <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                  41 weeks (term time only + 2)
                </td>
                <td className={tdClass}>{exPlusTwo.holidayWeeks}</td>
                <td className={tdClass}>{exPlusTwo.paidWeeks}</td>
                <td className={tdClass}>{gbp.format(exPlusTwo.annualPay)}</td>
                <td className={tdClass}>{gbp.format(exPlusTwo.monthlyPay)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The extra 2 weeks are worth{" "}
          {gbp.format(exPlusTwo.annualPay - exHeadline.annualPay)} a
          year on these figures. Either way, the salary is still
          paid in twelve equal monthly instalments — the
          &ldquo;+ 2&rdquo; changes the annual total, not the way it
          is spread. When you use the calculator, enter all the
          working weeks together: 41, not 39.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: a Level 3 teaching assistant
        </h2>
        <p className={bodyClass}>
          Schools and councils grade Level 3 teaching assistant
          posts on different NJC spinal points, so there is no
          single national Level 3 salary to quote — the job advert
          or contract states the point and the full-time-equivalent
          salary for the post. Take an <em>example</em> full-time
          salary of £28,000, a 39-week contract and 32.5 contracted
          hours a week against a 37.5-hour full-time pattern, and
          the engine on this page gives: {exLevel3.holidayWeeks}{" "}
          holiday weeks on top of the 39 working weeks,{" "}
          {exLevel3.paidWeeks} paid weeks, and term-time pay of{" "}
          {gbp.format(exLevel3.annualPay)} a year —{" "}
          {gbp.format(exLevel3.monthlyPay)} a month in twelve equal
          instalments. Treat the £28,000 purely as an example:
          replace it with the full-time salary on your own contract,
          and the hours with your contracted hours, and the
          calculator above runs the same three steps on your real
          figures.
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
