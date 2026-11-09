"use client";

/**
 * The shared "Print / save" block every calculator carries under its
 * result: a button that opens the browser's print view (where the
 * visitor can also choose "Save as PDF") plus the one-line explanation.
 * The print stylesheet in src/styles/global.css drops the site header
 * and footer, and each calculator hides its form in print and shows a
 * print-only recap of the inputs, so the printed page carries the tool
 * title, the inputs used and the result — not the site chrome.
 *
 * The defaults are the standard calculators' wording. The payslip
 * generator passes its own: its printed page holds the payslip itself,
 * not a summary of a calculation.
 */
export default function PrintButton({
  label = "Print / save this result",
  printedWhat = "a clean summary of this calculation",
}: {
  label?: string;
  printedWhat?: string;
}) {
  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="mt-4 rounded-full border border-brand-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-brand-800 dark:text-brand-300 shadow-sm transition hover:bg-brand-50 dark:hover:bg-brand-900/40"
      >
        {label}
      </button>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Opens your browser&apos;s print view with {printedWhat} — choose
        &ldquo;Save as PDF&rdquo; there to keep a copy.
      </p>
    </div>
  );
}
