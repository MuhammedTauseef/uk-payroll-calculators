"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { TOOLS_INDEX, TOOL_CATEGORY_ORDER } from "@/lib/tools-index";

/**
 * The desktop tools sidebar (UX Phase 3, 2026-11-20): every
 * calculator grouped under the site's own categories, fixed to the
 * left of the content column from the xl breakpoint up, with its own
 * scroll. Below xl it renders nothing — the header's MobileNav panel
 * already lists the same tools there. Hidden on the admin pages,
 * which have their own panel navigation.
 *
 * Pure client-side rendering over the static tools index: no fetch,
 * no server work.
 */
export default function ToolsSidebar() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin")) return null;

  return (
    <aside
      aria-label="All calculators"
      className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 self-start overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-5 xl:block"
    >
      <p className="px-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
        Calculators
      </p>
      {TOOL_CATEGORY_ORDER.map((category) => {
        const items = TOOLS_INDEX.filter((tool) => tool.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="mt-5">
            <p className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              {category}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {items.map((tool) => {
                const active = pathname === tool.href;
                return (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "flex items-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 px-2 py-1.5 text-[13px] font-semibold text-brand-800 dark:text-brand-300"
                          : "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300"
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[13px] dark:bg-slate-800"
                      >
                        {tool.icon}
                      </span>
                      <span className="leading-snug">{tool.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
          Guides
        </p>
        <ul className="mt-1.5 space-y-0.5">
          {AppConfig.guides.map((guide) => (
            <li key={guide.href}>
              <Link
                href={guide.href}
                aria-current={pathname === guide.href ? "page" : undefined}
                className={
                  pathname === guide.href
                    ? "block rounded-lg bg-brand-50 dark:bg-brand-900/30 px-2 py-1.5 text-[13px] font-semibold text-brand-800 dark:text-brand-300"
                    : "block rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300"
                }
              >
                {guide.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/blog"
              className="block rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300"
            >
              Blog — all articles
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
