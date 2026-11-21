"use client";

import { useState } from "react";

/**
 * The form on /unsubscribe (UX Phase 2, 2026-11-20): the visitor
 * types the address they subscribed with and it is marked
 * unsubscribed in the subscribers table by /api/unsubscribe, server-side. An address
 * that was never on the list gets a gentle answer, not an error.
 */
export default function UnsubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "ok" | "not-on-list" | "invalid" | "error"
  >("idle");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => null)) as {
        status?: string;
      } | null;
      if (data?.status === "ok") setState("ok");
      else if (data?.status === "not-on-list") setState("not-on-list");
      else if (data?.status === "invalid") setState("invalid");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  if (state === "ok") {
    return (
      <p
        role="status"
        className="rounded-lg bg-brand-50 dark:bg-brand-900/30 px-4 py-3 text-base font-medium text-brand-800 dark:text-brand-300"
      >
        You&apos;ve been unsubscribed. You won&apos;t receive any more
        update emails from us — and the calculators stay free to use
        whenever you need them.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label
        htmlFor="unsubscribe-email"
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        Email address
      </label>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          id="unsubscribe-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.co.uk"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle" && state !== "sending") setState("idle");
          }}
          className="min-h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="min-h-11 shrink-0 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
        >
          {state === "sending" ? "Removing…" : "Unsubscribe"}
        </button>
      </div>
      {state === "not-on-list" && (
        <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          That email isn&apos;t on the list — it may have been removed
          already, or signed up with a different address.
        </p>
      )}
      {state === "invalid" && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          That doesn&apos;t look like a complete email address — please
          check it and try again.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          Something went wrong just now — please try again in a moment.
        </p>
      )}
    </form>
  );
}
