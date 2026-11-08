import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/disclaimer",
  "Disclaimer",
  "UK Payroll Calculators' disclaimer: results are estimates from the published 2026/27 rates, not professional advice for a specific situation.",
);

export default function DisclaimerPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Disclaimer
        </h1>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Estimates only
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Every result on this site is an estimate, worked from the
          figures entered and the published 2026/27 rates and
          thresholds. A result shows what the rules produce for the
          numbers given — it is not a payslip, a payment instruction or a
          confirmed entitlement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Individual circumstances vary
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Real pay is shaped by things a general calculator cannot see.
          Student loan repayments, pension contributions, salary
          sacrifice arrangements, Scottish income tax rates and benefits
          in kind can all change the real figures, sometimes by a lot.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Not professional advice
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Nothing on this site is legal, tax, accounting or payroll
          advice for a specific situation. The guides explain the general
          rules in plain English; they do not settle an individual case.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Verify before you rely
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Before making a payroll decision, check the figure against the
          official guidance on GOV.UK and HMRC&apos;s employer guidance,
          or ask a qualified accountant. Where the amounts matter, that
          check is not optional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Not affiliated with GOV.UK or HMRC
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is an independent site. It is not
          affiliated with, endorsed by or acting on behalf of GOV.UK or
          HMRC, and the official guidance on GOV.UK always takes
          precedence over anything here.
        </p>
      </section>
    </div>
  );
}
