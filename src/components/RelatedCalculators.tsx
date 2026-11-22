import Link from "next/link";
import { RELATED_BY_HREF, TOOLS_INDEX } from "@/lib/tools-index";

/**
 * The standard related-calculators block at the foot of every
 * tool page (22 Nov 2026): the 3–4 genuinely related tools listed
 * for the page in RELATED_BY_HREF (src/lib/tools-index.ts),
 * rendered as cards in the style of the hand-made related
 * sections it replaces — one shared component, so the block is
 * identical on every page and a new tool joins the web through
 * the index alone. Titles, icons and categories are read from
 * TOOLS_INDEX at render time, so nothing here can drift when a
 * tool is renamed.
 */
export default function RelatedCalculators({ href }: { href: string }) {
  const related = (RELATED_BY_HREF[href] ?? []).flatMap((h) => {
    const tool = TOOLS_INDEX.find((t) => t.href === h);
    return tool ? [tool] : [];
  });
  if (related.length === 0) return null;
  return (
    <section className="space-y-4 print:hidden">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Related calculators
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span aria-hidden className="shrink-0 text-xl leading-none">
                  {tool.icon}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {tool.title}
                </h3>
              </span>
              <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {tool.category}
              </span>
            </span>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
