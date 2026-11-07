import Link from "next/link";

// Shown instead of admin data whenever requireAdminContext() refuses
// (signed out, or signed in without the admin role). It never leaks
// whether any data exists — just the way back in.
export function AdminRefusal() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Admin access only</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This area is for the site admin. If that is you, sign in with the admin account and try
        again.
      </p>
      <p className="mt-5">
        <Link
          href="/admin/login"
          className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          Go to admin sign in
        </Link>
      </p>
    </div>
  );
}
