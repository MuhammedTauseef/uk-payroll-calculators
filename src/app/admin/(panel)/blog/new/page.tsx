import { AdminRefusal } from "@/components/admin/AdminRefusal";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { requireAdminContext } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

// /admin/blog/new — a fresh draft. Drafts stay invisible to the
// public; set the status to Published when the post — including all
// 5 FAQs — is ready.
export default async function AdminBlogNewPage() {
  const ctx = await requireAdminContext();
  if (!ctx) return <AdminRefusal />;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">New blog post</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Drafts stay invisible to the public. Set the status to Published when the post —
          including all 5 FAQs — is ready.
        </p>
      </section>
      <div className="max-w-3xl">
        <BlogPostForm post={null} />
      </div>
    </div>
  );
}
