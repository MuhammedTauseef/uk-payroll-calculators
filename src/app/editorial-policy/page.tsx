import Link from "next/link";
import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/editorial-policy",
  "Editorial & Verification Policy",
  "The standards behind UK Payroll Calculators: official sources only, worked-example verification, dated updates, prompt corrections, and plain-English writing.",
);

// /editorial-policy (UX Izafa 5, 2026-11-20): how content here is
// sourced, verified, updated and corrected. Companion to
// /methodology, which covers the calculation method itself.
export default function EditorialPolicyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Editorial &amp; Verification Policy
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This page sets out the standards every calculator and article
          on this site is held to: where the facts come from, how they
          are verified, how updates and corrections are handled, and
          how the writing is kept honest.
        </p>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Last updated: 20 November 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Sources
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Facts and figures come from primary, official sources:
          GOV.UK and HMRC for the UK tools, the IRS for the US tools
          and the ATO for the Australian tool. Secondary reporting never
          overrides a published official figure. Where a page states a
          market fact that has no official source (for example typical
          software pricing), the figure is dated and attributed on the
          page itself.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Verification
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every calculator is benchmarked against official worked
          examples and hand-computed cases before publication, and the
          same automated checks must pass again before any later change
          is released. Articles are read back against their sources
          before they are published. The full method is described on
          the{" "}
          <Link href="/methodology" className="font-medium text-brand-800 dark:text-brand-300 underline">
            methodology page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Updates
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK payroll rules change every April, and pages are updated
          and re-verified when the new official figures are published —
          the &ldquo;rules verified&rdquo; date in the footer moves
          with them. Articles carry their publication date; when an
          article&apos;s facts change, the article is updated rather
          than left quietly out of date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Corrections
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Mistakes are fixed as soon as they are confirmed — a wrong
          figure is corrected the same day wherever possible, and the
          verification date is updated. Readers can report a suspected
          error via the{" "}
          <Link href="/contact" className="font-medium text-brand-800 dark:text-brand-300 underline">
            contact page
          </Link>
          ; every report is checked against the official source, and
          the reporter&apos;s figures are worked through in full before
          anything is changed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Writing standards
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Pages are written in plain English, answer the question they
          are titled for first, and show their working — a calculator
          that cannot explain its own result does not go live. Content
          is written for this site; it is never copied from another
          publication.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Independence and commercial links
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This is an independent site, not affiliated with GOV.UK,
          HMRC, the IRS or the ATO, and no government body reviews or
          endorses its content. The calculators are free to use. Where
          a page contains a commercial or affiliate link, that
          relationship is disclosed on the page itself, and a commercial
          link never changes a figure a calculator produces.
        </p>
      </section>
    </div>
  );
}
