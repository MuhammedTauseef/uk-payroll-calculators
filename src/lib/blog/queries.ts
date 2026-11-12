import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

// Public (no-login) read path for /blog — the same two guards as the
// reference sites:
//   1. createPublicClient() sends no session, so RLS evaluates the
//      "blog_posts_select_published" policy — drafts are invisible.
//   2. Every query ALSO filters on status = 'published' explicitly,
//      so the public surface stays correct even if the policy layer
//      changes.
// Writes never happen here: posts are created and edited from
// /admin/blog through the admin's own authenticated session.
//
// Until the Supabase env vars are set (and the setup SQL has run),
// the public client is null and every read returns its empty value,
// so /blog renders its "on the way" state and the sitemap simply
// carries the static routes.

export type BlogFaq = { q: string; a: string };

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  faqs: BlogFaq[];
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicBlogPostSummary = Pick<
  BlogPostRow,
  "slug" | "title" | "description" | "cover_image_url" | "published_at"
>;

export type PublicBlogPost = BlogPostRow;

const SUMMARY_COLUMNS = "slug,title,description,cover_image_url,published_at";
const FULL_COLUMNS =
  "id,slug,title,description,body,faqs,cover_image_url,status,published_at,created_at,updated_at";

/** Published posts for the /blog index, newest first. */
export async function listPublishedBlogPosts(): Promise<PublicBlogPostSummary[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("APP_DATA_LOAD_FAILED");
  return (data ?? []) as PublicBlogPostSummary[];
}

/** One published post by slug, or null (unknown slug and drafts alike).
 *  Wrapped in React cache(): generateMetadata and the page component both
 *  ask for the same slug in one render — memoised to a single DB read. */
export const getPublishedBlogPost = cache(
  async (slug: string): Promise<PublicBlogPost | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("blog_posts")
      .select(FULL_COLUMNS)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error("APP_DATA_LOAD_FAILED");
    return (data as PublicBlogPost | null) ?? null;
  },
);

export type BlogSitemapEntry = { slug: string; lastModified: string | null };

/** Published posts for the sitemap. */
export async function listPublishedBlogSitemapEntries(): Promise<BlogSitemapEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("APP_DATA_LOAD_FAILED");
  return (data ?? []).map((row) => ({
    slug: row.slug as string,
    lastModified: (row.published_at as string | null) ?? (row.updated_at as string | null) ?? null,
  }));
}
