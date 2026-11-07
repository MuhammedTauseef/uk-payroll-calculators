import { pageMetadata } from "@/utils/metadata";
import { RATES_LAST_VERIFIED } from "@/lib/rates";

export const metadata = pageMetadata(
  "/about",
  "About UK Payroll Calculators",
  "What UK Payroll Calculators is and how its figures are produced: free UK statutory pay calculators and plain-English guides, built on official GOV.UK rates.",
);

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          About UK Payroll Calculators
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is a free set of calculators and
          plain-English guides for UK statutory pay — Statutory Sick Pay,
          notice periods, pro-rata salary and employer National Insurance.
          It is made for small employers, payroll staff and employees who
          need a statutory figure worked out properly, with the working
          shown, before it goes anywhere near a payroll run.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What you can work out here
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The calculators cover the statutory payments an employer is most
          often asked about: how much SSP is payable under the current
          rules (including linked sickness periods), the statutory minimum
          notice for employers and employees, part-time pay and holiday on
          a pro-rata basis, and the full cost of employing someone once
          employer National Insurance and pension contributions are added.
          The guides answer the common questions behind those figures in
          plain English, each one linking to the calculator that works the
          answer out for your own numbers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How the figures are produced
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every rate and threshold used on this site comes from the
          official guidance published on GOV.UK. The figures live in one
          place in the site&apos;s code, each calculator shows its working
          step by step from the numbers you enter, and the rates were last
          verified against GOV.UK on {RATES_LAST_VERIFIED}. Statutory
          rates usually change each April; when they do, the site is
          updated and the verified date changes with them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What this site is — and is not
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          This site provides general guidance only. It is not affiliated
          with GOV.UK or HMRC, and nothing on it is legal, tax or payroll
          advice for a specific situation. Statutory pay has edge cases —
          linked periods, varying work patterns, salary sacrifice — that a
          general calculator cannot settle. Always check the official
          guidance on GOV.UK for your specific circumstances, and take
          professional advice where the amounts matter.
        </p>
      </section>
    </div>
  );
}
