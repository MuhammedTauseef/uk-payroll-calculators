import { AppConfig } from "@/utils/AppConfig";
import type { BlogPostRow } from "@/lib/blog/queries";

// Article + FAQPage structured data for public blog posts, built ONLY
// from fields the post actually stores — nothing is invented, and
// datePublished is emitted only when the post really has one (the
// same honesty rule as the reference sites' builders).

type FaqLike = { faqs?: { q?: string; a?: string }[] | null };

export function buildArticleJsonLd(post: BlogPostRow, pageUrl: string): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    author: { "@type": "Organization", name: AppConfig.name, url: AppConfig.siteUrl },
    publisher: { "@type": "Organization", name: AppConfig.name },
  };
  if (post.cover_image_url) {
    jsonLd.image = post.cover_image_url;
  }
  if (post.published_at) {
    jsonLd.datePublished = post.published_at;
    jsonLd.dateModified = post.updated_at;
  }
  return jsonLd;
}

export function buildFaqPageJsonLd(post: FaqLike): Record<string, unknown> | null {
  const faqs = (post.faqs ?? []).filter((faq) => faq.q?.trim() && faq.a?.trim());
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** Serialise JSON-LD for a <script> tag, escaping "</" so a post can
 * never break out of the script element. */
export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
