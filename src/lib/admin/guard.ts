import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  email: string | null;
  // The admin's own session client: every admin read/write runs under
  // it, so the database RLS policies (admin-only writes, drafts
  // invisible to the public) do the enforcing.
  supabase: SupabaseClient;
};

/**
 * The server-side admin gate for every admin page and action — the
 * reference pattern: the caller's own profile row (read under their
 * session, so RLS applies) must carry role = 'admin', the same flag
 * private.is_admin() checks in the database. Returns null for anyone
 * else (signed out, no profile, or not an admin); callers must render
 * a refusal or an error, never data. Fails closed when Supabase is
 * not configured yet.
 */
export async function requireAdminContext(): Promise<AdminContext | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = (await createClient()) as SupabaseClient;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profileError || !profile) return null;
  if ((profile as { role: string }).role !== "admin") return null;

  return { userId: userData.user.id, email: userData.user.email ?? null, supabase };
}
