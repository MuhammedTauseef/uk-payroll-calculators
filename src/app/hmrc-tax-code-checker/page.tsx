import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TaxCodeChecker from "@/components/TaxCodeChecker";
import { checkTaxCode } from "@/lib/taxcode";
import {
  EMPLOYEE_NI,
  INCOME_TAX,
  PAYE_RATES_LABEL,
  RATES_LAST_VERIFIED,
} from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/hmrc-tax-code-checker",
  "HMRC Tax Code Checker — What Does My Tax Code Mean?",
  "Free HMRC tax code checker: enter your code — 1257L, BR, D0, 0T, K475, 1257L W1 — to see what it means, your tax-free allowance, and what it costs vs 1257L.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

// Worked example figures — computed by the same checker functions the
// tool above runs, so the page can never disagree with itself.
const EXAMPLE_SALARY = 30000;
const exampleStandard = checkTaxCode("1257L", EXAMPLE_SALARY);
const exampleBr = checkTaxCode("BR", EXAMPLE_SALARY);
const exampleReduced = checkTaxCode("1100L", EXAMPLE_SALARY);
const exampleK = checkTaxCode("K475", EXAMPLE_SALARY);

const COMMON_CODES: { code: string; meaning: string; effect: string }[] = [
  {
    code: "1257L",
    meaning:
      "The standard code: you're entitled to the standard tax-free Personal Allowance. Most people with one job or pension have it.",
    effect: `${gbp.format(12570)} tax-free`,
  },
  {
    code: "1383M",
    meaning:
      "Marriage Allowance received: your partner transferred £1,260 of their Personal Allowance to you, on top of your own.",
    effect: `${gbp.format(13830)} tax-free`,
  },
  {
    code: "1131N",
    meaning:
      "Marriage Allowance transferred: you've given £1,260 of your Personal Allowance to your partner.",
    effect: `${gbp.format(11310)} tax-free`,
  },
  {
    code: "1100L",
    meaning:
      "A reduced allowance: HMRC has taken deductions off your Personal Allowance — in GOV.UK's example, a £1,570 company medical benefit turns 1257L into 1100L.",
    effect: `${gbp.format(11000)} tax-free`,
  },
  {
    code: "1257L W1 / 1257L M1",
    meaning:
      "An emergency code: the same allowance as 1257L, but each pay day is taxed on its own (W1 = weekly pay, M1 = monthly) instead of on the year so far. The X ending is the same idea for irregular pay dates.",
    effect: `${gbp.format(12570)} tax-free, per-pay-day basis`,
  },
  {
    code: "0T",
    meaning:
      "Your Personal Allowance has been used up, or you've started a new job and your employer doesn't yet have the details to give you a code.",
    effect: "Nothing tax-free",
  },
  {
    code: "BR",
    meaning:
      "All income from this job or pension is taxed at the basic rate — usually a second job or pension.",
    effect: "No allowance; everything at 20%",
  },
  {
    code: "D0",
    meaning:
      "All income from this job or pension is taxed at the higher rate — usually a second job or pension where your main income already uses the basic-rate band.",
    effect: "No allowance; everything at 40%",
  },
  {
    code: "D1",
    meaning:
      "All income from this job or pension is taxed at the additional rate.",
    effect: "No allowance; everything at 45%",
  },
  {
    code: "NT",
    meaning: "No tax is taken from this income.",
    effect: "No tax deducted",
  },
  {
    code: "K475",
    meaning:
      "A K code (example): the untaxed income or deductions in the code are worth more than your whole Personal Allowance, so an amount is added to your taxable pay instead.",
    effect: `${gbp.format(4750)} added to taxable pay`,
  },
  {
    code: "S1257L",
    meaning:
      "The Scottish standard code: the S means this income is taxed using the rates in Scotland, which Scotland sets separately.",
    effect: `${gbp.format(12570)} tax-free, Scottish rates`,
  },
  {
    code: "C1257L",
    meaning:
      "The Welsh standard code: the C (for Cymru) means this income is taxed using the rates in Wales.",
    effect: `${gbp.format(12570)} tax-free, Welsh rates`,
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What does tax code 1257L mean?",
    answer:
      "The numbers in a tax code are your tax-free Personal Allowance in tens of pounds: 1257 means £12,570 a year you can earn before Income Tax starts. The letter shows why you get that allowance — L means you are entitled to the standard Personal Allowance. 1257L is the code most people with one job or pension have; HMRC builds it by taking your tax-free amount and replacing its final digit with a letter.",
  },
  {
    question: "What is an emergency tax code (W1, M1 or X)?",
    answer:
      "You're on an emergency tax code if your code ends in W1 (paid weekly), M1 (paid monthly) or X (pay dates vary) — some payslips print NONCUM instead. Normally your tax is worked out on everything you've earned in the tax year so far; on an emergency code each pay day is taxed on its own, as if that week's or month's pay were your pattern for the whole year, which can take too much tax. It usually happens when you start a new job without a P45 from the old one, and it is normally temporary: HMRC updates your code once it has your full details, which can take up to 35 days from starting.",
  },
  {
    question: "What does a K tax code mean?",
    answer:
      "A K code means the income you are not paying tax on — or the deductions in your code — are worth more than your entire Personal Allowance, so instead of a tax-free amount, the number in the code (in tens of pounds) is added to your taxable pay. Common causes: tax owed from a previous year being collected through your wages, the State Pension or other taxable benefits, company benefits such as a company car, or savings interest above your Personal Savings Allowance. Your employer cannot take more than half of your pre-tax pay in one pay period under a K code.",
  },
  {
    question: "Where can I find my tax code?",
    answer:
      "In four places: on your payslip (it's printed on every one — our payslip generator shows where it sits); on a Tax Code Notice letter from HMRC, if you get one; in the HMRC app; or by signing in to HMRC's Check your Income Tax service, which shows your code for the current year and previous years. You get a separate tax code for each job or pension you have.",
  },
  {
    question: "What should I do if my tax code is wrong?",
    answer:
      "Check and update the details HMRC holds about you — that is what the code is built from. The quickest route is HMRC's Check your Income Tax service: sign in, and check your employment, pension, estimated taxable income, company benefits and expenses, correcting anything wrong or missing. HMRC then updates your code and tells you and your employer within about 15 working days; it should appear on your next or the following monthly payslip (the third weekly one). If you've overpaid, the difference is usually refunded through your pay once the new code is used. If you can't use the online service, contact HMRC's Income Tax enquiries — but if you've just started a job, wait 35 days first so HMRC has your new income details.",
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
  name: "HMRC Tax Code Checker",
  url: `${AppConfig.siteUrl}/hmrc-tax-code-checker`,
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

export default function TaxCodeCheckerPage() {
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
          HMRC Tax Code Checker
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Type your tax code to check what it means: the tax-free
          allowance it gives you, what each letter and number stands for,
          and the problems it may be signalling. Add your salary and the
          checker also shows how much more or less tax the code takes
          than the standard 1257L. Free, with nothing to sign up for.
        </p>
      </section>

      <TaxCodeChecker />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this tax code checker
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Copy the code exactly as it appears on your latest payslip or
          Tax Code Notice — including any letter in front (S for
          Scotland, C for Wales) and any ending such as W1, M1 or X. The
          verdict explains the code part by part in plain words, flags
          the situations that usually mean a code is wrong, and — once
          you add a salary — puts a yearly and monthly figure on the
          difference between your code and the standard 1257L. Nothing
          leaves your browser at any point.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How tax codes work
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Your tax code is the instruction HMRC gives your employer or
          pension provider so they take the right amount of Income Tax
          from each payment. You have a separate code for every job or
          pension. To build yours, HMRC starts with your tax-free
          Personal Allowance and takes off anything that reduces it —
          income you have not paid tax on, such as untaxed interest or
          part-time earnings, and other deductions such as company
          benefits or tax you owe — then replaces the final digit of the
          remaining amount with a letter.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            The numbers
          </strong>{" "}
          are the tax-free amount in tens of pounds: 1257 means{" "}
          {gbp.format(12570)} a year before tax starts.{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            The letter
          </strong>{" "}
          says why you get that amount: L is the standard allowance, M
          and N are Marriage Allowance (received / transferred), and T
          means HMRC has other calculations to check. Some codes have no
          numbers at all: BR, D0 and D1 tax everything at one flat rate,
          NT takes no tax, 0T gives no allowance, and a K code works in
          reverse — its number is added to your taxable pay.{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            The prefix and suffix
          </strong>{" "}
          matter too: S means Scottish rates apply and C means Welsh
          rates, while W1, M1 and X endings mean an emergency code.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Common tax codes and what they mean
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Tax code
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  What it means
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Effect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {COMMON_CODES.map((row) => (
                <tr key={row.code}>
                  <td className="px-4 py-2 font-semibold whitespace-nowrap text-slate-900 dark:text-slate-50">
                    {row.code}
                  </td>
                  <td className="px-4 py-2">{row.meaning}</td>
                  <td className="px-4 py-2">{row.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Meanings follow HMRC&apos;s own guide to{" "}
          <a
            href="https://www.gov.uk/tax-codes"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            tax codes on GOV.UK
          </a>
          . Scotland also has flat-rate codes with no equivalent
          elsewhere — SBR, and SD0 to SD3 for its intermediate, higher,
          advanced and top rates — which the checker above decodes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Worked example: one salary, three codes
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  On a {gbp.format(EXAMPLE_SALARY)} salary
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Tax-free allowance
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Income Tax for the year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Vs 1257L
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  1257L (standard)
                </td>
                <td className="px-4 py-2">{gbp.format(12570)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleStandard.taxUnderCode ?? 0)}
                </td>
                <td className="px-4 py-2">—</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  1100L (reduced allowance)
                </td>
                <td className="px-4 py-2">{gbp.format(11000)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleReduced.taxUnderCode ?? 0)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleReduced.differencePerYear ?? 0)} more
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  BR (no allowance)
                </td>
                <td className="px-4 py-2">None</td>
                <td className="px-4 py-2">
                  {gbp.format(exampleBr.taxUnderCode ?? 0)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleBr.differencePerYear ?? 0)} more (
                  {gbp.format(exampleBr.differencePerMonth ?? 0)} a month)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-50">
                  K475 (negative allowance)
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(4750)} (added to taxable pay)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleK.taxUnderCode ?? 0)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exampleK.differencePerYear ?? 0)} more
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          BR is the right code for a second job — but on a{" "}
          {gbp.format(EXAMPLE_SALARY)} main job it would take{" "}
          {gbp.format(exampleBr.differencePerYear ?? 0)} a year more tax
          than 1257L, because the whole Personal Allowance goes unused.
          (0T gives the same total as BR at this salary: both take 20%
          of everything. They part company on higher pay — 0T moves into
          the 40% band like a normal code, BR stays at 20%.) National
          Insurance is not part of the comparison: it does not depend on
          your tax code. The same salary run through our{" "}
          <Link href="/40k-after-tax-uk" className={linkClass}>
            take-home pay calculator
          </Link>{" "}
          shows the full picture, tax and National Insurance together.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Where to find your tax code
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Four places, quickest first in practice:{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            your payslip
          </strong>{" "}
          — the code is printed on every payslip, next to your pay
          details; our{" "}
          <Link href="/payslip-generator" className={linkClass}>
            payslip generator
          </Link>{" "}
          shows exactly where it sits on the document.{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            HMRC&apos;s online service
          </strong>{" "}
          — sign in to{" "}
          <a
            href="https://www.gov.uk/check-income-tax-current-year"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Check your Income Tax
          </a>{" "}
          to see your current code (and previous years&apos;), or use the
          HMRC app.{" "}
          <strong className="font-semibold text-slate-900 dark:text-slate-50">
            A Tax Code Notice
          </strong>{" "}
          — the letter HMRC sends when your code changes. And if you have
          more than one job or pension, remember each one has its own
          code: check them all, because the allowance can only sit on
          one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What to do if your tax code is wrong
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A wrong code almost always means HMRC holds wrong or missing
          information about you — employers cannot change your code
          themselves, so the fix runs through HMRC:
        </p>
        <ol className="max-w-2xl list-decimal space-y-1 pl-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            Sign in to{" "}
            <a
              href="https://www.gov.uk/check-income-tax-current-year"
              className={linkClass}
              target="_blank"
              rel="noreferrer"
            >
              Check your Income Tax
            </a>{" "}
            (through your{" "}
            <a
              href="https://www.gov.uk/personal-tax-account"
              className={linkClass}
              target="_blank"
              rel="noreferrer"
            >
              personal tax account
            </a>{" "}
            or the HMRC app) and look at what HMRC has: your employments
            and pensions, your estimated taxable income, company benefits
            and expenses.
          </li>
          <li>
            Update anything that is wrong or missing — a job you have
            left, a benefit that has stopped, an income estimate that is
            too high or too low.
          </li>
          <li>
            HMRC issues the new code to you and your employer, normally
            within about 15 working days. It should show on your next or
            the following monthly payslip (the third weekly one).
          </li>
          <li>
            Tax already overpaid is usually refunded through your pay
            once the new code is used; tax underpaid is collected by
            adjusting a future code, normally spread over a year or more.
          </li>
        </ol>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If you cannot use the online service, contact HMRC through{" "}
          <a
            href="https://www.gov.uk/find-hmrc-contacts/income-tax-enquiries"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Income Tax enquiries
          </a>
          . One exception to acting fast: if you have just started a new
          job, GOV.UK advises waiting 35 days before contacting HMRC, so
          your new income details have time to reach them — an emergency
          code in the first weeks of a job usually corrects itself.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Rates behind the comparison
        </h2>
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
                <td className="px-4 py-2">
                  Personal Allowance (code 1257L)
                </td>
                <td className="px-4 py-2">
                  {gbp.format(INCOME_TAX.personalAllowance)} (reduced by
                  £1 per £2 of income over{" "}
                  {gbp.format(INCOME_TAX.allowanceTaperThreshold)})
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Basic rate (BR)</td>
                <td className="px-4 py-2">
                  20% — on the first {gbp.format(INCOME_TAX.basicRateBand)}{" "}
                  of taxable income under a normal code
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Higher rate (D0)</td>
                <td className="px-4 py-2">
                  40% up to {gbp.format(INCOME_TAX.additionalRateThreshold)}{" "}
                  of income
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Additional rate (D1)</td>
                <td className="px-4 py-2">
                  45% on income over{" "}
                  {gbp.format(INCOME_TAX.additionalRateThreshold)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Employee National Insurance</td>
                <td className="px-4 py-2">
                  8% from {gbp.format(EMPLOYEE_NI.primaryThresholdAnnual)}{" "}
                  to {gbp.format(EMPLOYEE_NI.upperEarningsLimitAnnual)},
                  then 2% — not affected by your tax code
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two honest limits. First, the comparison is against the
          standard 1257L on the same salary — your right code depends on
          everything you earn and receive, so a difference here shows
          what the code costs, not by itself that the code is wrong.
          Second, Scotland sets its own income tax bands: this checker
          decodes Scottish (S) codes in full, but its figures use the
          England, Wales and Northern Ireland bands, and it says so on
          the result rather than inventing Scottish figures.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates: {PAYE_RATES_LABEL} (England, Wales and Northern
          Ireland). Last verified: {RATES_LAST_VERIFIED}. Tax code
          meanings checked against GOV.UK&apos;s &ldquo;Tax codes&rdquo;
          guide on 9 November 2026.
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

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/payslip-generator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Payslip Generator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              See the code in action: build a full payslip — gross pay,
              Income Tax, National Insurance and net pay — from any tax
              code, and print it or save it as a PDF.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the generator →
            </span>
          </Link>
          <Link
            href="/40k-after-tax-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Take-Home Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The whole picture on the standard code: enter an annual
              salary and see the take-home pay per year, month and week,
              with Income Tax and National Insurance.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/employer-national-insurance-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer National Insurance Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The cost on the other side of the payslip: employer Class 1
              NICs and the total cost of employing someone in 2026/27.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
