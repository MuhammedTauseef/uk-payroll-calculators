import "server-only";
import { timingSafeEqual } from "node:crypto";

// The admin panel's credential source: ENVIRONMENT VARIABLES only
// (the owner's instruction). ADMIN_EMAIL / ADMIN_PASSWORD are set in
// Vercel (Production) by the owner-side setup; they are never in
// code, SQL or any committed file. The pair must match the Supabase
// Auth admin user created in the dashboard — the login action signs
// in with these values, so the panel session is a genuine Supabase
// session for that user (whose profiles.role = 'admin' is what the
// database policies trust).

export type AdminCredentials = { email: string; password: string };

/** The configured admin credentials, or null when not set. */
export function getAdminCredentials(): AdminCredentials | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Constant-time check of a submitted email + password against the
 * configured pair. Email compares case-insensitively (surrounding
 * whitespace trimmed); the password must match exactly.
 */
export function adminCredentialsMatch(
  submittedEmail: string,
  submittedPassword: string,
  configured: AdminCredentials,
): boolean {
  const emailOk = safeEqual(
    submittedEmail.trim().toLowerCase(),
    configured.email.trim().toLowerCase(),
  );
  const passwordOk = safeEqual(submittedPassword, configured.password);
  return emailOk && passwordOk;
}
