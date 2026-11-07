"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/lib/admin/login-action";
import { adminActionIdle } from "@/lib/admin/state";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "block text-sm font-medium text-slate-900 dark:text-slate-50";

// The login form. It posts to the server action, which checks the
// submitted pair against the ADMIN_EMAIL / ADMIN_PASSWORD env vars —
// credentials are never handled (or stored) in the browser beyond
// the form submission itself.
export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, adminActionIdle);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="al-email" className={labelClass}>
          Email
        </label>
        <input
          id="al-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="al-password" className={labelClass}>
          Password
        </label>
        <input
          id="al-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className={inputClass}
        />
      </div>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
