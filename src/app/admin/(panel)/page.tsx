import Link from "next/link";
import { listAdminBlogPosts } from "@/lib/admin/data";
import { requireAdminContext } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

// /admin — the panel home: what is live, what is waiting, and the way
// into the editor. (The layout has already verified the admin; the
// context is re-read here for the post counts.)
export default async function AdminDashboardPage() {
  const ctx = await requireAdminContext();
  const posts = ctx ? await listAdminBlogPosts(ctx.supabase).catch(() => []) : [];
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.length - published;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Write and publish blog posts here — no deploy needed. Drafts are visible only in this
          panel; published posts are live on{" "}
          <Link href="/blog" className="font-medium text-brand-800 underline">
            /blog
          </Link>{" "}
          the moment you save them.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-bold text-slate-900">{posts.length}</p>
          <p className="mt-1 text-sm text-slate-600">Posts in total</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-bold text-slate-900">{published}</p>
          <p className="mt-1 text-sm text-slate-600">Published and live</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-bold text-slate-900">{drafts}</p>
          <p className="mt-1 text-sm text-slate-600">Drafts (invisible to the public)</p>
        </div>
      </div>

      <p>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          Write a new post
        </Link>
      </p>
    </div>
  );
}
