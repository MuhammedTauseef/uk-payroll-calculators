"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminContext } from "@/lib/admin/guard";
import type { AdminActionState } from "@/lib/admin/state";
import {
  PUBLISH_FAQS_MESSAGE,
  readBlogFaqs,
  validateBlogPostInput,
} from "@/lib/blog/validation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refused(): AdminActionState {
  return {
    status: "error",
    message: "You are not signed in as an admin, so nothing was saved.",
  };
}

function failed(): AdminActionState {
  return {
    status: "error",
    message: "That could not be saved. Nothing was changed — please try again.",
  };
}

/**
 * Create or update a blog post from the admin editor (/admin/blog).
 * Writes run on the admin's own session, so the blog_posts RLS
 * policies (admin-only writes, drafts invisible to the public) do the
 * enforcing. Publishing keeps the post's original published_at; the
 * first publish stamps it. A brand-new post redirects to its own
 * edit page, so saving again updates instead of inserting a
 * duplicate. Setting a published post back to Draft unpublishes it —
 * it disappears from /blog, its article page and the sitemap.
 */
export async function saveBlogPostAction(
  postId: string | null,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdminContext();
  if (!ctx) return refused();

  const parsed = validateBlogPostInput({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    body: String(formData.get("body") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    status: String(formData.get("status") ?? "draft"),
  });
  if (!parsed.ok) return { status: "error", message: parsed.message };

  const faqs = readBlogFaqs(formData);
  if (parsed.value.status === "published" && faqs.length !== 5) {
    return { status: "error", message: PUBLISH_FAQS_MESSAGE };
  }

  let existingPublishedAt: string | null = null;
  if (postId) {
    if (!UUID_PATTERN.test(postId)) return failed();
    const { data: existing, error: readError } = await ctx.supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", postId)
      .maybeSingle();
    if (readError || !existing) return failed();
    existingPublishedAt = existing.published_at as string | null;
  }

  const publishedAt =
    parsed.value.status === "published"
      ? (existingPublishedAt ?? new Date().toISOString())
      : existingPublishedAt;

  const row = {
    slug: parsed.value.slug,
    title: parsed.value.title,
    description: parsed.value.description,
    body: parsed.value.body,
    faqs,
    cover_image_url: parsed.value.cover_image_url,
    status: parsed.value.status,
    published_at: publishedAt,
  };

  if (postId) {
    const { error } = await ctx.supabase.from("blog_posts").update(row).eq("id", postId);
    if (error) {
      if (error.code === "23505") {
        return {
          status: "error",
          message: "That slug is already used by another post. Change the slug and save again.",
        };
      }
      return failed();
    }
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${row.slug}`);
    revalidatePath("/sitemap.xml");
    return {
      status: "success",
      message:
        row.status === "published"
          ? "Post saved and live on the blog."
          : "Draft saved. It stays invisible to the public until you publish it.",
    };
  }

  const { data: created, error } = await ctx.supabase
    .from("blog_posts")
    .insert(row)
    .select("id")
    .single();
  if (error || !created) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That slug is already used by another post. Change the slug and save again.",
      };
    }
    return failed();
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  revalidatePath("/sitemap.xml");
  redirect(`/admin/blog/${created.id}`);
}

/**
 * Delete a blog post from the admin blog list or the post's edit
 * page. The delete runs on the admin's own session, so the blog_posts
 * DELETE policy (admin-only) enforces it. The cover object in the
 * blog-images bucket is removed on a best-effort basis afterwards — a
 * storage failure never blocks or undoes the delete. Either way the
 * admin lands back on the blog list, where the post is gone.
 */
export async function deleteBlogPostAction(
  postId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdminContext();
  if (!ctx) return refused();
  if (!UUID_PATTERN.test(postId)) return failed();
  if (String(formData.get("confirm") ?? "") !== "delete") {
    return {
      status: "error",
      message: "Confirm the delete first — deleting a post is permanent and can't be undone.",
    };
  }

  const { data: existing, error: readError } = await ctx.supabase
    .from("blog_posts")
    .select("slug, cover_image_url")
    .eq("id", postId)
    .maybeSingle();
  if (readError || !existing) return failed();

  const { error } = await ctx.supabase.from("blog_posts").delete().eq("id", postId);
  if (error) {
    return {
      status: "error",
      message: "That post could not be deleted. Nothing was changed — please try again.",
    };
  }

  // Best-effort tidy-up: remove the cover object too, so a deleted
  // post does not leave an orphaned upload in the public bucket.
  if (existing.cover_image_url) {
    try {
      const marker = "/object/public/blog-images/";
      const at = (existing.cover_image_url as string).indexOf(marker);
      if (at !== -1) {
        const path = decodeURIComponent(
          (existing.cover_image_url as string).slice(at + marker.length).split("?")[0],
        );
        if (path) await ctx.supabase.storage.from("blog-images").remove([path]);
      }
    } catch {
      // Ignored: cleanup only.
    }
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug as string}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/blog");
}
