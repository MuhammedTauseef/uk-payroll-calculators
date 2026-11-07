import type { Metadata } from "next";
import Link from "next/link";
import { AdminRefusal } from "@/components/admin/AdminRefusal";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { requireAdminContext } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// The admin shell for every /admin page except /admin/login (which
// sits outside this route group on purpose). The guard runs here AND
// on each page/action below it — the same defence in depth as the
// reference sites: session + profiles.role = 'admin', or a refusal.
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireAdminContext();
  if (!ctx) return <AdminRefusal />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/admin" className="text-slate-900 hover:underline">
            Admin
          </Link>
          <Link href="/admin/blog" className="text-brand-800 hover:underline">
            Blog posts
          </Link>
          <Link href="/admin/blog/new" className="text-brand-800 hover:underline">
            New post
          </Link>
          <Link href="/blog" className="text-brand-800 hover:underline">
            View blog
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {ctx.email && <span className="text-sm text-slate-500">{ctx.email}</span>}
          <SignOutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
