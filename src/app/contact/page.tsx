import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/contact",
  "Contact UK Payroll Calculators",
  "How to contact UK Payroll Calculators: questions about the site, corrections to a page, or a problem with a calculator.",
);

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Contact UK Payroll Calculators
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Questions about the site, a correction to one of the pages, or
          a problem with a calculator — we want to hear about all three.
          If a calculator looks wrong, tell us which page it was and what
          you entered, and we will check the working against the official
          GOV.UK rates.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Email us
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The contact email for this site is{" "}
          <a
            className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900 dark:text-slate-50 dark:decoration-slate-500 dark:hover:decoration-slate-50"
            href="mailto:muhammadtauseef714@gmail.com"
          >
            muhammadtauseef714@gmail.com
          </a>
          . We reply within two working days where we can.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What we cannot do
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          We cannot give personal payroll or tax advice, and we cannot
          work out a figure for an individual case. For your own
          circumstances, the official guidance on GOV.UK is the starting
          point, and ACAS can help with workplace questions such as sick
          pay and notice periods.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One more thing worth knowing before you write: the calculators
          run entirely in your own browser, so we never see the figures
          you type in. If you are reporting a problem, include the
          numbers you entered in your email — we have no other way of
          seeing them.
        </p>
      </section>
    </div>
  );
}
