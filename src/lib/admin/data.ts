import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlogPostRow } from "@/lib/blog/queries";

// Admin reads for /admin/blog. Both run on the admin's own session
// (requireAdminContext runs first), so the blog_posts admin SELECT
// policy is what lets them see drafts as well as published posts.

export type AdminBlogPostRow = BlogPostRow;

const ADMIN_COLUMNS =
  "id,slug,title,description,body,faqs,cover_image_url,status,published_at,created_at,updated_at";

/** List rows carry no body/faqs/cover — the editor fetches the full row
 *  via getAdminBlogPost. Keeps the /admin/blog list payload bounded. */
export type AdminBlogPostSummary = Pick<
  BlogPostRow,
  "id" | "slug" | "title" | "description" | "status" | "published_at" | "created_at" | "updated_at"
>;

const ADMIN_LIST_COLUMNS =
  "id,slug,title,description,status,published_at,created_at,updated_at";

/** Every post (drafts included), most recently updated first. */
export async function listAdminBlogPosts(supabase: SupabaseClient): Promise<AdminBlogPostSummary[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_LIST_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("ADMIN_DATA_LOAD_FAILED");
  return (data ?? []) as unknown as AdminBlogPostSummary[];
}

/** One post by id for the editor, or null. */
export async function getAdminBlogPost(
  supabase: SupabaseClient,
  postId: string,
): Promise<AdminBlogPostRow | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_COLUMNS)
    .eq("id", postId)
    .maybeSingle();
  if (error) throw new Error("ADMIN_DATA_LOAD_FAILED");
  return (data as unknown as AdminBlogPostRow | null) ?? null;
}
