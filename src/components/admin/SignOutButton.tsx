"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Signs the admin out (Supabase session) and returns to the login
// page. Shown in the admin panel header.
export function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Even if the call fails, leave the panel — the session cookie
      // is what the guard reads, and the login page is public.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      Sign out
    </button>
  );
}
