import Link from "next/link";

/**
 * The guides strip at the foot of a tool page (restored
 * 22 Nov 2026): blog guides that were linked from a page's old
 * hand-made related section, kept as their own small block
 * under the standard RelatedCalculators block when that section
 * was standardised — so a tool page's guide links are never
 * lost in a restructure. Only guides genuinely tied to the
 * page's topic belong here; the links are passed in per page.
 */
export interface RelatedGuide {
  href: string;
  title: string;
  description: string;
}

export default function RelatedGuides({
  guides,
}: {
  guides: RelatedGuide[];
}) {
  if (guides.length === 0) return null;
  return (
    <section className="space-y-4 print:hidden">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Guides
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {guide.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {guide.description}
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Read the guide →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
