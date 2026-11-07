import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { listPublishedBlogSitemapEntries } from "@/lib/blog/queries";

/**
 * Sitemap for the whole hub: the home page, the calculators (from
 * AppConfig.nav, minus the home entry), the SSP guides (from
 * AppConfig.guides), the trust pages (from AppConfig.siteLinks), the
 * blog index and every published blog post (from the database).
 * Keeping the route list driven by AppConfig means a route added to
 * the configuration appears here automatically.
 *
 * "/blog" is deliberately EXCLUDED from the nav- and siteLinks-derived
 * lists below: it is a navigation/footer link in AppConfig, but its
 * sitemap entry comes only from the blog block at the bottom (weekly,
 * 0.6) — listing it from all three places produced three conflicting
 * entries for the same URL (technical SEO audit, 7 Nov 2026).
 *
 * The blog read is failure-safe: before the Supabase env vars are set
 * (or if the database is unreachable) the sitemap returns exactly the
 * static routes it always carried — publishing can only ever ADD
 * entries, never remove the existing ones.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const calculatorPaths = AppConfig.nav
    .map((item) => item.href)
    .filter((href) => href !== "/" && href !== "/blog");
  const guidePaths = AppConfig.guides.map((item) => item.href);
  const sitePaths = AppConfig.siteLinks
    .map((item) => item.href)
    .filter((href) => href !== "/blog");

  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1.0 },
    ...calculatorPaths.map((path) => ({ path, priority: 0.9 })),
    ...guidePaths.map((path) => ({ path, priority: 0.7 })),
    ...sitePaths.map((path) => ({ path, priority: 0.5 })),
  ];

  const entries: MetadataRoute.Sitemap = routes.map(({ path, priority }) => ({
    url: `${AppConfig.siteUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }));

  const posts = await listPublishedBlogSitemapEntries().catch(() => []);
  if (posts.length > 0) {
    entries.push({
      url: `${AppConfig.siteUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
    for (const post of posts) {
      entries.push({
        url: `${AppConfig.siteUrl}/blog/${post.slug}`,
        ...(post.lastModified ? { lastModified: new Date(post.lastModified) } : {}),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
