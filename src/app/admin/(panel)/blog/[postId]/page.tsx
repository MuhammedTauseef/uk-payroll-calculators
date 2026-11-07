import { notFound } from "next/navigation";
import { AdminRefusal } from "@/components/admin/AdminRefusal";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { DeleteBlogPostButton } from "@/components/admin/DeleteBlogPostButton";
import { getAdminBlogPost } from "@/lib/admin/data";
import { requireAdminContext } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

// /admin/blog/[postId] — edit one post. Saving a published post
// updates it everywhere right away; setting its status back to Draft
// unpublishes it. The delete panel sits below the editor, exactly
// like the reference sites.
export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const ctx = await requireAdminContext();
  if (!ctx) return <AdminRefusal />;
  const { postId } = await params;
  const post = await getAdminBlogPost(ctx.supabase, postId).catch(() => null);
  if (!post) notFound();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit blog post</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          {post.status === "published"
            ? "This post is live. Saving updates it everywhere right away — the blog list, the article page and the sitemap. Setting the status back to Draft unpublishes it."
            : "This is a draft. It stays invisible to the public until you set the status to Published and save."}
        </p>
      </section>

      <div className="max-w-3xl space-y-8">
        <BlogPostForm post={post} />
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Delete this post</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Deleting removes the post from the blog for good — the article page, the blog list
            and the sitemap stop showing it, and its cover image is removed too. This can&rsquo;t
            be undone.
          </p>
          <div className="mt-4">
            <DeleteBlogPostButton postId={post.id} postTitle={post.title} />
          </div>
        </section>
      </div>
    </div>
  );
}
