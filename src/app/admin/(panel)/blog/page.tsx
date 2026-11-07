import Link from "next/link";
import { AdminRefusal } from "@/components/admin/AdminRefusal";
import { DeleteBlogPostButton } from "@/components/admin/DeleteBlogPostButton";
import { listAdminBlogPosts } from "@/lib/admin/data";
import { requireAdminContext } from "@/lib/admin/guard";
import { formatDateGB } from "@/lib/blog/format";

export const dynamic = "force-dynamic";

// /admin/blog — every post, drafts included. Published posts are live
// the moment they are saved; drafts exist only here.
export default async function AdminBlogPage() {
  const ctx = await requireAdminContext();
  if (!ctx) return <AdminRefusal />;
  const posts = await listAdminBlogPosts(ctx.supabase).catch(() => null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700">
            Write and publish blog posts here — no deploy needed. Drafts are visible only in
            this list; published posts are live on /blog the moment you save them.
          </p>
        </section>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          New post
        </Link>
      </div>

      {posts === null ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
          The posts could not be loaded. Check the database connection and try again.
        </p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No blog posts yet</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Write the first one with the New post button. A post can stay a draft for as long as
            you like — nothing is public until you set it to Published.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                <th className="px-4 py-3 font-medium">Edit</th>
                <th className="px-4 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-slate-900 hover:underline"
                      href={`/admin/blog/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">/blog/{post.slug}</td>
                  <td className="px-4 py-3">
                    {post.status === "published" ? (
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDateGB(post.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-brand-800 underline"
                      href={`/admin/blog/${post.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <DeleteBlogPostButton postId={post.id} postTitle={post.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
