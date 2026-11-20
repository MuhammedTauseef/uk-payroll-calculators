import Link from "next/link";
import UnsubscribeForm from "@/components/UnsubscribeForm";
import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/unsubscribe",
  "Unsubscribe from email updates",
  "Remove your email address from the UK Payroll Calculators update list — one form, no sign-in, effective immediately.",
);

// /unsubscribe (UX Phase 2, 2026-11-20): the page every future
// update email will link to. The form posts to /api/unsubscribe,
// which deletes the address from the subscribers table server-side.
export default function UnsubscribePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Unsubscribe
        </h1>
        <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Sorry to see you go. Type the email address you subscribed
          with below and we will remove it from the update list straight
          away — no sign-in, no confirmation email, no hard feelings.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <UnsubscribeForm />
      </section>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Changed your mind later? You can join again from the email box
        in the footer of any page — start from the{" "}
        <Link href="/" className="font-medium text-brand-800 dark:text-brand-300 underline">
          home page
        </Link>
        .
      </p>
    </div>
  );
}
