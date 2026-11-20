"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * The site-wide email box (UX Phase 2, 2026-11-20): one form, shown
 * in the footer of every page and at the foot of every calculator
 * page. It posts to /api/subscribe, which writes to the subscribers
 * table server-side — the browser never touches the database. The
 * `source` recorded with each address is simply the page the visitor
 * was on. Hidden on the admin pages and on /unsubscribe itself.
 *
 * Copy is deliberately plain and honest: a few emails a year when
 * rates change or a new calculator lands, no spam, unsubscribe
 * anytime (the small link under the form goes to /unsubscribe).
 */
export default function SubscribeBox({
  variant = "card",
}: {
  variant?: "card" | "footer";
}) {
  const pathname = usePathname() ?? "";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "ok" | "already" | "invalid" | "error"
  >("idle");

  if (pathname.startsWith("/admin") || pathname === "/unsubscribe") {
    return null;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: pathname }),
      });
      const data = (await response.json().catch(() => null)) as {
        status?: string;
      } | null;
      if (data?.status === "ok") setState("ok");
      else if (data?.status === "already") setState("already");
      else if (data?.status === "invalid") setState("invalid");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  const form = (
    <>
      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
        UK pay &amp; tax updates
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        New rates and new calculators, a few times a year. No spam —
        unsubscribe anytime.
      </p>

      {state === "ok" ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-2 text-sm font-medium text-brand-800 dark:text-brand-300"
        >
          You&apos;re on the list — thank you. The next update will land
          in your inbox when rates change or a new calculator goes live.
        </p>
      ) : state === "already" ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-2 text-sm font-medium text-brand-800 dark:text-brand-300"
        >
          You&apos;re already on the list — no need to sign up twice.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3" noValidate>
          <label
            htmlFor={variant === "footer" ? "subscribe-email-footer" : "subscribe-email-card"}
            className="sr-only"
          >
            Email address
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={variant === "footer" ? "subscribe-email-footer" : "subscribe-email-card"}
              type="email"
              autoComplete="email"
              placeholder="you@example.co.uk"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (state === "invalid" || state === "error") setState("idle");
              }}
              className="min-h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="min-h-11 shrink-0 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
            >
              {state === "sending" ? "Joining…" : "Subscribe"}
            </button>
          </div>
          {state === "invalid" && (
            <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
              That doesn&apos;t look like a complete email address — please
              check it and try again.
            </p>
          )}
          {state === "error" && (
            <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
              Something went wrong just now — please try again in a moment.
            </p>
          )}
        </form>
      )}

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        On the list already and want off?{" "}
        <Link
          href="/unsubscribe"
          className="font-medium text-brand-800 dark:text-brand-300 underline"
        >
          Unsubscribe
        </Link>
      </p>
    </>
  );

  if (variant === "footer") {
    return <div className="max-w-xl">{form}</div>;
  }

  return (
    <section
      aria-label="Email updates"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {form}
    </section>
  );
}
