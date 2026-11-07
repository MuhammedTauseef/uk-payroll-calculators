"use server";

import { redirect } from "next/navigation";
import { adminCredentialsMatch, getAdminCredentials } from "@/lib/admin/credentials";
import type { AdminActionState } from "@/lib/admin/state";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /admin/login — the panel accepts ONLY the credential pair
 * configured in the ADMIN_EMAIL / ADMIN_PASSWORD environment
 * variables (owner instruction; nothing is hardcoded). On a match it
 * establishes the genuine Supabase Auth session for that account via
 * the server client (cookies are written by @supabase/ssr), and the
 * usual gates take over from there: the proxy and
 * requireAdminContext verify the session AND profiles.role =
 * 'admin', and every write runs under that session so RLS enforces
 * it. On any mismatch the refusal is the same generic message — it
 * never reveals which half was wrong.
 */
export async function adminLoginAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const configured = getAdminCredentials();
  if (
    !configured ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      message:
        "The admin panel is not configured yet — its environment variables have not been set for this site.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!adminCredentialsMatch(email, password, configured)) {
    return { status: "error", message: "Invalid email or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: configured.email,
    password: configured.password,
  });
  if (error) {
    // The env pair matched but the underlying Supabase Auth account
    // is missing or has a different password — a setup gap on the
    // dashboard side, reported without leaking auth detail.
    return {
      status: "error",
      message:
        "The admin account is not ready yet — the sign-in account setup in the database dashboard may be missing or out of step with the configured credentials.",
    };
  }

  redirect("/admin");
}
