import Link from "next/link";
import { RATES_LAST_VERIFIED, RATES_RULES_LABEL } from "@/lib/rates";
import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/methodology",
  "Methodology — how our calculators are built and checked",
  "How UK Payroll Calculators builds its figures: official GOV.UK and HMRC published rates, worked-example benchmarks, automated checks, and a dated verification line on every page.",
);

// /methodology (UX Izafa 5, 2026-11-20): the honest account of how
// the numbers on this site are produced and checked. No invented
// credentials — the method is the credential.
export default function MethodologyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Methodology
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every figure on this site is produced the same way: start
          from the official published rates, build the calculation to
          follow them exactly, then prove it against worked examples
          before it is allowed anywhere near a visitor. This page
          explains each step.
        </p>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Current basis: {RATES_RULES_LABEL}. Rates last verified:{" "}
          {RATES_LAST_VERIFIED}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          1. Official sources first
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK rates and rules come from GOV.UK and HMRC&apos;s published
          guidance — the same pages employers and payroll teams are
          told to rely on. The US tools follow the IRS and the
          Australian tool follows the ATO. News reports, forums and
          other calculator sites are never used as the source of a
          figure; where they are read at all, it is only to find
          questions worth answering.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          2. Checked against worked examples
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Before a calculator goes live, its results are compared with
          worked examples: official ones where the authorities publish
          them (for example the statutory redundancy example, where 15
          years of service at £600 a week must come out at exactly
          £10,200), and hand-computed cases prepared from the rules for
          the situations official examples do not cover — caps, tapers,
          part-years and edge cases included. If a single case is out
          by a penny, the calculator does not ship.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          3. Automated checks on every change
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Those benchmark cases live in the codebase as automated
          verification scripts. Any change to a calculator — even a
          purely visual one — has to pass the same cases again before
          it is released, so a design change can never quietly become a
          numbers change.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          4. A dated verification line
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Pages state the rules they are built on and when those
          figures were last verified — currently the{" "}
          {RATES_RULES_LABEL.toLowerCase()} line in the footer of every
          page. UK payroll rules change each April; when the new
          figures are published, every affected calculator is updated,
          re-benchmarked and re-verified, and the date moves with it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          5. A named person checks the numbers
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculations are checked by CEO Muhammad Tauseef, the
          site&apos;s founder, against the HMRC and GOV.UK published
          rates described above. The review card at the foot of each
          calculator records that check. If you believe a figure is
          wrong, please say so via the{" "}
          <Link href="/contact" className="font-medium text-brand-800 dark:text-brand-300 underline">
            contact page
          </Link>{" "}
          — corrections are made promptly and the verification date is
          updated, as our{" "}
          <Link href="/editorial-policy" className="font-medium text-brand-800 dark:text-brand-300 underline">
            editorial policy
          </Link>{" "}
          sets out.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What this site is not
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is an independent site. It is not
          affiliated with GOV.UK, HMRC, the IRS or the ATO, and its
          results are general guidance based on the standard rules —
          not personal financial, tax or legal advice. For a decision
          that matters, check the official guidance or speak to a
          qualified adviser.
        </p>
      </section>
    </div>
  );
}
