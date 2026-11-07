import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Create a Supabase service-role client (server-only; bypasses RLS).
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured —
 * callers must handle null gracefully (never crash). The blog panel
 * itself writes through the admin's own session, exactly like the
 * owner's other sites; this client exists for server-side jobs that
 * have no user session.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
