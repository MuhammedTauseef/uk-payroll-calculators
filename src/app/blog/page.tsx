import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/utils/metadata";
import { formatDateGB } from "@/lib/blog/format";
import { listPublishedBlogPosts } from "@/lib/blog/queries";

export const metadata = pageMetadata(
  "/blog",
  "Blog — UK payroll guides and explainers",
  "Plain-English guides from UK Payroll Calculators: statutory sick pay, payroll, maternity and paternity pay and employer National Insurance — April 2026 rules.",
);

// Dynamic on purpose: posts are published from the admin panel and
// must appear here the moment they are published — a static prerender
// would freeze whatever happened to be published at build time.
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts().catch(() => []);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-brand-700 dark:text-brand-300 uppercase">Blog</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Payroll, explained plainly.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Guides on the parts of UK payroll employers and employees actually ask about:
          statutory sick pay, maternity and paternity pay, notice periods and employer National
          Insurance — with the figures checked against the current rules.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The first guides are on their way. In the meantime, the{" "}
          <Link href="/ssp-calculator" className="font-medium text-brand-800 dark:text-brand-300 underline">
            SSP calculator
          </Link>{" "}
          and the guides linked from it are live now.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              {post.cover_image_url && (
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  width={1280}
                  height={720}
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col px-6 py-6">
                {post.published_at && (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {formatDateGB(post.published_at)}
                  </p>
                )}
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  <Link className="hover:underline" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.description}</p>
                <p className="mt-4">
                  <Link
                    className="font-medium text-brand-800 dark:text-brand-300 underline"
                    href={`/blog/${post.slug}`}
                  >
                    Read the guide
                  </Link>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
