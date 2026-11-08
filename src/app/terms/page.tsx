import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/terms",
  "Terms of Use",
  "The terms for using UK Payroll Calculators: the calculators give estimates from published GOV.UK rates, and the site is provided as is.",
);

export default function TermsPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Last updated: 8 November 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Using this site
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          By using UK Payroll Calculators you accept these terms. The
          site is free to use, and no account or sign-up is needed. If
          you do not accept the terms, please do not use the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The calculators
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculators produce estimates from the figures you enter
          and the published GOV.UK rates and thresholds. They are a
          starting point for checking a figure, not a substitute for
          running the numbers through your own payroll process — check
          any result before it is used in a real payroll.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Accuracy and changes
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every rate on this site is verified against GOV.UK, and the
          rates are updated when they change, usually each April. We work
          to keep the content accurate, but pages, calculators and these
          terms may change without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Intellectual property
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The content of this site — its text, design and code — belongs
          to UK Payroll Calculators, except for material taken from
          GOV.UK, which is Crown copyright and is used under the Open
          Government Licence.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Acceptable use
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Do not misuse this site. That includes automated scraping at a
          volume that harms the site or other visitors&apos; use of it,
          and any attempt to access the site&apos;s admin area without
          authorisation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Liability
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Nothing in these terms excludes or limits liability that
          cannot legally be excluded or limited. Otherwise, the site and
          its calculators are provided &ldquo;as is&rdquo;, and we are
          not liable for decisions taken in reliance on an estimate
          without checking it against the official guidance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Governing law
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          These terms are governed by the law of England and Wales.
        </p>
      </section>
    </div>
  );
}
