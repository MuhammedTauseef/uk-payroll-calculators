import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for PUBLIC reads (no cookies, no
 * session). Uses the anon key — safe for public pages. RLS policies
 * control what this key can access (published blog posts only).
 * Returns null if env vars are missing (build-time safety), so public
 * surfaces can render their empty state instead of crashing before
 * the project is wired up.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}
