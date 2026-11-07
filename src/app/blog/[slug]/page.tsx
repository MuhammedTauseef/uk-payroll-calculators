import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArticleBody } from "@/components/BlogArticle";
import { AppConfig } from "@/utils/AppConfig";
import { pageMetadata } from "@/utils/metadata";
import { formatDateGB } from "@/lib/blog/format";
import { buildArticleJsonLd, buildFaqPageJsonLd, serializeJsonLd } from "@/lib/blog/jsonld";
import { getPublishedBlogPost } from "@/lib/blog/queries";

type RouteParams = { params: Promise<{ slug: string }> };

// Dynamic on purpose: the post is read from blog_posts per request,
// so an admin edit or a newly published post is live immediately. An
// unknown slug — and any draft — 404s.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug).catch(() => null);
  // A missing or draft slug is a real 404, never a friendly 200 page.
  if (!post) notFound();
  const metadata = pageMetadata(`/blog/${post.slug}`, post.title, post.description);
  if (!post.cover_image_url) {
    return {
      ...metadata,
      openGraph: { ...metadata.openGraph, type: "article" },
    };
  }
  // With a cover, the cover is the social image (replaces the default
  // site-wide OG handling) for both OpenGraph and Twitter cards.
  const cover = { url: post.cover_image_url, alt: post.title };
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, type: "article", images: [cover] },
    twitter: { ...metadata.twitter, images: [cover] },
  };
}

export default async function BlogArticlePage({ params }: RouteParams) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug).catch(() => null);
  if (!post) notFound();

  const pageUrl = new URL(`/blog/${post.slug}`, AppConfig.siteUrl).toString();
  const articleJsonLd = buildArticleJsonLd(post, pageUrl);
  const faqJsonLd = buildFaqPageJsonLd(post);
  const faqs = (post.faqs ?? []).filter((faq) => faq.q?.trim() && faq.a?.trim());

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}

      <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
        <Link className="hover:text-brand-800" href="/blog">
          Blog
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {post.title}
      </h1>
      {post.published_at && (
        <p className="mt-3 text-sm text-slate-500">Published {formatDateGB(post.published_at)}</p>
      )}
      {post.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700">{post.description}</p>
      )}

      {post.cover_image_url && (
        <Image
          src={post.cover_image_url}
          alt={post.title}
          width={1280}
          height={720}
          className="mt-8 aspect-video w-full rounded-xl border border-slate-200 object-cover"
        />
      )}

      <BlogArticleBody body={post.body} />

      {faqs.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-10" aria-label="Frequently asked questions">
          <h2 className="text-xl font-semibold text-slate-900">Frequently asked questions</h2>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-slate-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:p-10">
        <h2 className="text-xl font-semibold text-slate-900">Work it out for your own numbers.</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          The calculators on this site use the April 2026 rates and rules, and they are free —
          no sign-up, nothing to install.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/ssp-calculator"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            Try the SSP calculator
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            More guides on the blog
          </Link>
        </div>
      </section>
    </article>
  );
}
