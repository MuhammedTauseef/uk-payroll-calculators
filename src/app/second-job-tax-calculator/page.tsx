import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import SecondJobCalculator from "@/components/SecondJobCalculator";
import { calculateSecondJob } from "@/lib/second-job";
import { employeeNiFor } from "@/lib/takehome";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/second-job-tax-calculator",
  "Second Job Tax Calculator UK — Two Jobs Tax & Take-Home, 2026/27",
  "Free second job tax calculator for 2026/27: two PAYE jobs taxed together the way HMRC does it — one Personal Allowance, National Insurance per job, BR/D0 payslip view with the refund worked out, student loan on total income.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// The worked examples further down the page — every one computed
// by the same engine the calculator above runs, so the page can
// never disagree with itself.
const EX_MAIN = calculateSecondJob({ job1Salary: 35000, job2Salary: 10000 });
const EX_NI = calculateSecondJob({ job1Salary: 30000, job2Salary: 20000 });
const EX_REFUND = calculateSecondJob({
  job1Salary: 8000,
  job2Salary: 10000,
  job2TaxCode: "BR",
});
const EX_D0 = calculateSecondJob({
  job1Salary: 35000,
  job2Salary: 10000,
  job2TaxCode: "D0",
});
const EX_TAPER = calculateSecondJob({
  job1Salary: 90000,
  job2Salary: 20000,
});
const EX_LOAN = calculateSecondJob({
  job1Salary: 35000,
  job2Salary: 10000,
  undergraduatePlan: "plan2",
});
// What National Insurance would be if the two salaries were one
// job — the comparison that shows what the per-job rule saves.
const NI_SINGLE_45K = employeeNiFor(45000);
const NI_SINGLE_50K = employeeNiFor(50000);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much tax will I pay on a second job?",
    answer:
      "Your second job does not get its own tax bands. HMRC adds the two incomes together and charges Income Tax on the total, with one Personal Allowance (£12,570 in 2026/27) between the two jobs — so the second job is taxed from its first pound at whatever rate your combined income reaches: 20% while the total is under £50,270, 40% above it. On a £35,000 main job, a £10,000 second job adds exactly £2,000 of Income Tax (20% of £10,000) and no National Insurance at all, so you keep £8,000 of it — £666.67 a month. Use the calculator above with your own two salaries for your figure.",
  },
  {
    question: "Why is my second job taxed at 40%?",
    answer:
      "There are two usual causes, and they need different fixes. The first is your tax code: if the second job is on a D0 code, the employer deducts 40% from every pound, whatever you earn — HMRC uses D0 where it expects your other income to use up the basic-rate band. The second is real: if your two incomes added together pass £50,270, the slice above that line genuinely is taxed at 40%. If the D0 deductions turn out to be too much — on a £35,000 main job with a £10,000 second job, D0 over-deducts by £2,000 a year — the excess comes back through HMRC's P800 calculation after the tax year ends, or sooner if you ask HMRC to change the code.",
  },
  {
    question: "Do I pay National Insurance on a second job?",
    answer:
      "Only if the second job itself pays more than £12,570 a year. Employee National Insurance is worked out on each job separately, and every job gets its own Primary Threshold of £12,570 a year (2026/27): earnings under it pay no NI, earnings between £12,570 and £50,270 in that job pay 8%, and earnings above £50,270 in that job pay 2%. A second job of £10,000 a year therefore pays no National Insurance at all, however much the main job pays — the rule that surprises most people, and the one most simple calculators get wrong by charging NI on the combined salary.",
  },
  {
    question: "Is National Insurance calculated per job?",
    answer:
      "Yes — per job, per pay period, with no reference to your other earnings. Each employer applies the same thresholds to the pay from that job alone. That is why two jobs of £25,000 pay less National Insurance in total than one job of £50,000. The exception runs the other way for high earners: if you have two well-paid jobs you can end up paying the 8% main rate twice over, and HMRC lets you apply to defer National Insurance in the second job so only the 2% rate is deducted there, with any balance settled after the year ends. There is also an annual maximum calculation that caps the main-rate amount across all your jobs.",
  },
  {
    question: "Will my tax code change if I get a second job?",
    answer:
      "Almost always, yes. Your main job keeps the normal code — 1257L for most people — because that is where your Personal Allowance lives. The second job is usually given a BR code (everything taxed at 20%), a D0 code (everything at 40%) or 0T (no allowance, taxed through the bands), and you will get a tax code notice for each job. The codes are how HMRC splits one allowance and one set of bands across two payrolls; the year's final bill is always worked out on the two incomes added together, and any gap between what the payslips took and that bill is settled afterwards. If a code looks wrong, your personal tax account shows which job holds your allowance — and you can ask HMRC to split the allowance between the jobs instead.",
  },
  {
    question: "Is it worth having a second job?",
    answer:
      "In pure tax terms, always — there is no point at which a second job leaves you worse off for having taken it. The question is how much of it you keep. While your combined income is in the basic-rate band and the second job is under its own £12,570 NI threshold, you keep 80p of every £1. Once the combined income passes £50,270 you keep roughly 52p–60p, depending on the second job's own National Insurance, and inside the £100,000–£125,140 taper zone — where the Personal Allowance is withdrawn — roughly 32p–47p of each extra £1. The calculator above shows your own keep figure, per £100 and per month, which is the number to set against the hours the job takes.",
  },
  {
    question: "Can I be self-employed and have a second job?",
    answer:
      "Yes — but that income is not taxed under the two-jobs rules on this page. A PAYE job plus self-employed income means the job is taxed through PAYE as usual, and the self-employed profit is added on top and settled through Self Assessment, with Class 4 National Insurance on the profit instead of Class 1 on the pay. There is also a £1,000 trading allowance that can shelter the first slice of side income. Our side hustle tax calculator works that version out — salary, side profit, expenses and the trading allowance included.",
  },
  {
    question: "Why does HMRC think I have two jobs?",
    answer:
      "Usually because a job you have left is still open on HMRC's records. When you leave, your old employer sends a P45 and HMRC closes the employment; if the P45 never arrives, or you start the new job before the old one is closed, HMRC's system shows two live jobs — and may split your Personal Allowance across them or put the new job on an emergency or BR code. A duplicate record from a payroll change at the same employer can do the same. Check your personal tax account: it lists every employment HMRC has for you. A finished job still showing as live can be corrected there or by phone, and the code — and the tax — then follows.",
  },
  {
    question: "Does this calculator use Scottish tax rates?",
    answer:
      "No. The Income Tax figures use the England, Wales and Northern Ireland bands for 2026/27. Scotland sets its own Income Tax rates and thresholds, so a Scottish taxpayer's Income Tax on the same two jobs will differ. The National Insurance figures, though, hold for the whole UK — Class 1 is charged per job at the same thresholds in Scotland too, so the per-job NI story on this page applies exactly.",
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
  name: "Second Job Tax Calculator UK",
  url: `${AppConfig.siteUrl}/second-job-tax-calculator`,
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

function ExampleTable({
  title,
  result,
  showLoan = false,
}: {
  title: string;
  result: ReturnType<typeof calculateSecondJob>;
  showLoan?: boolean;
}) {
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "Main job", value: fmtMoney(result.job1.gross) },
    { label: "Second job", value: fmtMoney(result.job2.gross) },
    {
      label: "Personal Allowance (one, shared)",
      value: fmtMoney(result.personalAllowance),
    },
    { label: "Income Tax on the combined income", value: fmtMoney(result.incomeTax) },
    {
      label: "National Insurance — main job",
      value: fmtMoney(result.job1.nationalInsurance),
    },
    {
      label: "National Insurance — second job",
      value: fmtMoney(result.job2.nationalInsurance),
    },
    ...(showLoan
      ? [
          {
            label: "Student loan (on the total income)",
            value: fmtMoney(result.totalStudentLoan),
          },
        ]
      : []),
    {
      label: "Combined take-home pay",
      value: fmtMoney(result.takeHomeAnnual),
      strong: true,
    },
    { label: "Take-home a month", value: fmtMoney(result.takeHomeMonthly) },
    {
      label: "Kept from the second job",
      value: `${fmtMoney(result.keepFromJob2Annual)} a year · ${fmtMoney(result.keepFromJob2Monthly)} a month`,
      strong: true,
    },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm table-stack">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.label}
                </td>
                <td
                  className={
                    row.strong
                      ? `${tdClass} font-semibold text-slate-900 dark:text-slate-50`
                      : tdClass
                  }
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SecondJobTaxCalculatorPage() {
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

      <section className="space-y-3 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Second Job Tax Calculator UK
        </h1>
        <div className="max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            The short answer
          </h2>
          {/* Answer-first summary (40–60 words). */}
          <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Tax on a second job is worked out on both incomes added
            together, with one Personal Allowance — normally used by
            your main job — so the second job is taxed from the first
            pound, at 20% under a BR code or 40% under D0. National
            Insurance is charged per job: a second job under £12,570
            pays no NI at all.
          </p>
        </div>
      </section>

      <SecondJobCalculator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this second job tax calculator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators (payrollcalc.co.uk) is a free hub of
          UK pay and tax calculators, built on the rules published by
          GOV.UK and HMRC — no sign-up, no accounts, and every figure
          worked out in your browser. Enter the gross pay from each
          job. The calculator does the two things HMRC does: it adds
          the incomes together for Income Tax, with a single Personal
          Allowance between them, and it works National Insurance out
          on each job separately. It then shows the second result most
          people actually need — what the two employers will deduct
          through the payslips under the tax codes each job carries,
          and whether that leaves a refund or a shortfall. If you want
          one job on its own, broken down pay packet by pay packet,
          the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          does that job by itself.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How much tax do you pay on a second job?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One pot of income, one set of bands. HMRC does not give a
          second job its own Personal Allowance or its own basic-rate
          band: the two salaries are added together and taxed as if
          they were one income. GOV.UK&apos;s tax codes guidance is
          the mechanism behind it — your Personal Allowance can only
          be used once, so it stays with your main job (usually the
          one you earn most from), and the second job is taxed from
          its first pound. Two facts worth quoting exactly, both from
          GOV.UK: the Personal Allowance is £12,570 for 2026/27, and
          it is withdrawn by £1 for every £2 of income over £100,000.
          So a £35,000 salary uses the allowance and £22,430 of the
          basic-rate band; a £10,000 second job then sits entirely in
          what is left of the band and pays 20% — {fmtMoney(EX_MAIN.job2.incomeTax)}{" "}
          — while a second job that pushes the combined total past
          £50,270 starts paying 40% on the part above the line.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Band (2026/27)</th>
                <th className={thClass}>Combined taxable income</th>
                <th className={thClass}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Personal Allowance</td>
                <td className={tdClass}>
                  The first £12,570 of combined income (tapering away
                  over £100,000)
                </td>
                <td className={tdClass}>0%</td>
              </tr>
              <tr>
                <td className={tdClass}>Basic rate</td>
                <td className={tdClass}>
                  £0 to £37,700 — combined income up to £50,270 with a
                  full allowance
                </td>
                <td className={tdClass}>20%</td>
              </tr>
              <tr>
                <td className={tdClass}>Higher rate</td>
                <td className={tdClass}>
                  £37,701 to £125,140 of taxable income
                </td>
                <td className={tdClass}>40%</td>
              </tr>
              <tr>
                <td className={tdClass}>Additional rate</td>
                <td className={tdClass}>Over £125,140</td>
                <td className={tdClass}>45%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ExampleTable
          title="Worked example — a £35,000 job plus a £10,000 second job"
          result={EX_MAIN}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The second job keeps {fmtMoney(EX_MAIN.keepFromJob2Annual)}{" "}
          of its {fmtMoney(EX_MAIN.job2.gross)} — £80 of every £100,
          or {fmtMoney(EX_MAIN.keepFromJob2Monthly)} a month. If the
          question is the other way round — what salary would give
          you a target take-home — the{" "}
          <Link href="/reverse-salary-calculator" className={linkClass}>
            reverse salary calculator
          </Link>{" "}
          works from the monthly figure backwards.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Do you pay National Insurance on a second job?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          National Insurance plays by the opposite rule to Income
          Tax: it is calculated per job. GOV.UK&apos;s &ldquo;Rates
          and thresholds for employers 2026 to 2027&rdquo; sets the
          Class 1 Primary Threshold at £12,570 a year and the Upper
          Earnings Limit at £50,270 — 8% between them, 2% above —
          and each employment applies those thresholds to its own
          pay, on its own. So the £10,000 second job above pays no
          National Insurance at all: its pay never reaches its own
          threshold. The combined NI is{" "}
          {fmtMoney(EX_MAIN.totalNationalInsurance)}, all of it on
          the main job. Had the same {fmtMoney(EX_MAIN.combinedGross)}{" "}
          been one salary, the NI would have been{" "}
          {fmtMoney(NI_SINGLE_45K)} — the per-job rule saves{" "}
          {fmtMoney(NI_SINGLE_45K - EX_MAIN.totalNationalInsurance)}{" "}
          a year. This is the figure most simple calculators get
          wrong, because they charge NI on the combined salary.
        </p>
        <ExampleTable
          title="Worked example — a £30,000 job plus a £20,000 second job"
          result={EX_NI}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Here the second job does pass its own threshold, so it pays{" "}
          {fmtMoney(EX_NI.job2.nationalInsurance)} of NI on the slice
          above £12,570. Even so, the two jobs together pay{" "}
          {fmtMoney(EX_NI.totalNationalInsurance)} of NI against{" "}
          {fmtMoney(NI_SINGLE_50K)} on a single £50,000 salary —
          a saving of {fmtMoney(NI_SINGLE_50K - EX_NI.totalNationalInsurance)}{" "}
          from the second Primary Threshold.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Why is my second job taxed at 40%? BR, D0 and the payslip view
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The tax on your payslip is not the tax on your year — it is
          each employer applying the code HMRC gave that job, to that
          job&apos;s pay, knowing nothing about the other. The codes
          a second job usually carries are flat-rate codes, explained
          in GOV.UK&apos;s tax codes guide and decoded letter by
          letter in our{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            tax code checker
          </Link>
          : BR takes 20% of everything, D0 takes 40% of everything,
          D1 takes 45%, and 0T gives no allowance but uses the bands.
          A D0 code on a second job whose combined income never
          leaves the basic-rate band over-deducts all year: on the
          £35,000 + £10,000 example, D0 takes{" "}
          {fmtMoney(EX_D0.payslip.job2TaxDeducted)} from the second
          job against extra tax of {fmtMoney(EX_D0.job2.incomeTax)} —
          an overpayment of {fmtMoney(EX_D0.payslip.difference)}.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The refund works the other way when the allowance is in
          the wrong place. Take a main job of{" "}
          {fmtMoney(EX_REFUND.combinedGross - EX_REFUND.job2.gross)}{" "}
          and a second job of {fmtMoney(EX_REFUND.job2.gross)} on BR:
          the year&apos;s true tax is {fmtMoney(EX_REFUND.incomeTax)},
          but BR deducts {fmtMoney(EX_REFUND.payslip.job2TaxDeducted)}{" "}
          from the second job — {fmtMoney(EX_REFUND.payslip.difference)}{" "}
          too much. Money over-deducted through PAYE comes back
          through HMRC&apos;s P800 tax calculation after the tax year
          ends (a refund, or a credit against tax owed), and you do
          not have to wait: asking HMRC to move some allowance onto
          the second job, or onto a normal code there, stops the
          over-deduction in-year. The payslip view in the calculator
          above runs your own codes through the same comparison.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Will my tax code change if I get a second job?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Yes — expect a new tax code notice for the second job, and
          sometimes a changed one for the main job too. HMRC learns
          about the second job from the employer&apos;s payroll
          report, decides where the Personal Allowance does most
          good (normally the main job), and issues the second job a
          BR, D0 or 0T code. You can ask for a different arrangement:
          the allowance can be split between the two jobs in whatever
          proportion suits the pay pattern, which is the split option
          in the calculator above. Splitting never changes the
          year&apos;s bill — tax is always charged on the combined
          income — it only changes which payslip takes what, and
          whether the year ends with a refund or a shortfall. And if
          HMRC&apos;s records show a job you have left, that is the
          usual reason a code goes wrong: a missing P45 leaves the
          old employment open, the allowance gets split with a job
          that no longer exists, and the fix starts with checking
          the employments listed in your personal tax account.
        </p>
      </section>

      <section className="space-y-5 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The two cliffs: £50,270 and £100,000
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two lines change what a second job is worth. The first is
          £50,270 of combined income: below it the second job is
          taxed at 20%; every pound above it is taxed at 40%, even
          if neither job reaches the line alone — a £40,000 job plus
          a £25,000 job has £14,730 of its income in the higher band.
          The second is £100,000: past it, the Personal Allowance is
          withdrawn at £1 for every £2 of extra income, so in the
          £100,000–£125,140 zone each extra pound is taxed at 40%
          and drags 50p of allowance into tax behind it — an
          effective 60% Income Tax rate, before National Insurance.
        </p>
        <ExampleTable
          title="Worked example — a £90,000 job plus a £20,000 second job (the taper)"
          result={EX_TAPER}
        />
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The second job&apos;s extra Income Tax here is{" "}
          {fmtMoney(EX_TAPER.job2.incomeTax)} on{" "}
          {fmtMoney(EX_TAPER.job2.gross)} — 50% before its{" "}
          {fmtMoney(EX_TAPER.job2.nationalInsurance)} of National
          Insurance — because £5,000 of Personal Allowance has been
          withdrawn on top of the 40% band. This is the one place a
          pension changes the story rather than just the timing:
          contributions that bring combined pay back under £100,000
          restore the allowance, which is what the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          works through.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Student loan repayments with two jobs
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The year&apos;s student loan liability is charged on your
          total income over the plan threshold — the second job
          counts in full. On the £35,000 + £10,000 example with a
          Plan 2 loan, the repayment is{" "}
          {fmtMoney(EX_LOAN.totalStudentLoan)}: the second job adds{" "}
          {fmtMoney(EX_LOAN.job2.studentLoan)} of it, because the
          threshold is crossed once, on the combined figure. In-year
          the picture is messier — each employer deducts on that
          job&apos;s pay alone, so a second job under the monthly
          threshold has nothing deducted even when the combined
          income is well over it, and the difference is settled
          later. The{" "}
          <Link
            href="/student-loan-repayment-calculator"
            className={linkClass}
          >
            student loan repayment calculator
          </Link>{" "}
          works through plans, thresholds and payoff dates on a
          single income.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Is a second job worth it?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Tax never makes a second job pay less than nothing — every
          extra pound leaves you with something. What changes is the
          share you keep: 80p in the pound in the cleanest case
          (basic-rate band, second job under its NI threshold),
          roughly 52p–60p once the combined income is in the higher
          band, and roughly 32p–47p inside the £100,000 taper zone,
          where the second job's own National Insurance decides where
          in the range you land. The honest
          comparison is that keep figure, per month, against the
          hours and the commute — which is why the calculator leads
          with it. One boundary worth knowing: everything on this
          page is about two PAYE jobs. If the extra work is
          self-employed — your own clients, your own invoices — it is
          taxed as a side hustle instead, through Self Assessment
          with a £1,000 trading allowance and Class 4 NI, and our{" "}
          <Link
            href="/side-hustle-tax-calculator-uk"
            className={linkClass}
          >
            side hustle tax calculator
          </Link>{" "}
          is the tool for that version.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scotland: this page uses the England, Wales and Northern
          Ireland Income Tax bands. Scotland sets its own Income Tax
          rates and thresholds, so a Scottish taxpayer&apos;s Income
          Tax on the same two jobs differs — but National Insurance
          is UK-wide, charged per job at the same thresholds, so the
          NI figures and the per-job story hold exactly.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 23
          November 2026 — the Income Tax bands, Personal Allowance
          and its £100,000 taper from HMRC&apos;s rates and
          allowances, the Class 1 Primary Threshold (£12,570) and
          Upper Earnings Limit (£50,270) and the 8% and 2% employee
          rates from &ldquo;Rates and thresholds for employers 2026
          to 2027&rdquo;, and the BR, D0 and 0T code meanings from
          GOV.UK&apos;s tax codes guidance. The pension option uses
          the salary-sacrifice / net-pay basis (contributions taken
          off pay before tax, NI and student loan); a
          relief-at-source pension gives a slightly different NI
          figure. This page is a working tool and a guide, not tax
          or financial advice.
        </p>
      </section>

      <section className="space-y-4 print:hidden">
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

      <RelatedCalculators href="/second-job-tax-calculator" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
