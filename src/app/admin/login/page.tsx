import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminCredentials } from "@/lib/admin/credentials";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * /admin/login — sign in with the admin email + password. The panel
 * accepts only the pair configured in the ADMIN_EMAIL /
 * ADMIN_PASSWORD environment variables; the matching account itself
 * lives in Supabase Auth (created in the dashboard, with its profile
 * set to role = 'admin'), and a successful login establishes that
 * account's real session. Same pattern as the owner's other sites'
 * admin panels, with the credentials sourced from the environment.
 */
export default function AdminLoginPage() {
  const configured =
    getAdminCredentials() !== null &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Admin sign in</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Sign in to write and publish blog posts. Drafts stay invisible until you publish them.
      </p>

      {!configured ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm leading-6 text-amber-800 dark:text-amber-200"
        >
          The admin panel is not connected yet — its environment variables (the Supabase keys and
          the admin sign-in pair) have not been set for this site. Nothing can be signed in or
          saved until they are.
        </p>
      ) : (
        <AdminLoginForm />
      )}
    </div>
  );
}
