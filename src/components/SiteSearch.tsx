"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATIC_SEARCH_INDEX, type SearchEntry } from "@/lib/tools-index";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Site-wide search in the sticky top bar (UX Phase 3, 2026-11-20).
 *
 * Why a button that opens a search row, not an always-visible box:
 * the header already carries the logo, the full pill nav (~854px at
 * xl), the theme toggle and the CTA — an inline box would push it
 * past the viewport at common laptop widths. The button lives in the
 * bar at every width; the row drops from the bar and autofocuses.
 *
 * Everything runs in the browser. Tools, guides and site pages come
 * from the static index built into the bundle at build time
 * (lib/tools-index). Blog articles live in the database, so on first
 * open the box fetches /sitemap.xml — a file the site already
 * publishes — and adds every /blog/<slug> entry with a title read
 * from the slug. No search endpoint, no per-keystroke server work.
 * If the sitemap fetch fails, tool search simply carries on alone.
 *
 * The placeholder is deliberately short ("Search calculators…"):
 * the original long one ("Search calculators, guides and articles…")
 * was clipped mid-word in the ~296px of text width a 360px phone
 * leaves the input (owner-reported 2026-11-20). The button's
 * aria-label keeps the full description for assistive tech.
 */
export default function SiteSearch() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<SearchEntry[]>([]);
  const articlesRequested = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open ]);

  // Close on Escape anywhere while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  const loadArticles = () => {
    if (articlesRequested.current) return;
    articlesRequested.current = true;
    fetch("/sitemap.xml")
      .then((response) => (response.ok ? response.text() : ""))
      .then((xml) => {
        if (!xml) return;
        const entries: SearchEntry[] = [];
        const seen = new Set<string>();
        for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
          let url: URL;
          try {
            url = new URL(match[1]);
          } catch {
            continue;
          }
          if (!url.pathname.startsWith("/blog/") || seen.has(url.pathname)) {
            continue;
          }
          seen.add(url.pathname);
          const slug = url.pathname.replace("/blog/", "");
          const title = slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          entries.push({
            href: url.pathname,
            title,
            kind: "Article",
            haystack: `${title} ${slug.replace(/-/g, " ")} blog article`.toLowerCase(),
          });
        }
        setArticles(entries);
      })
      .catch(() => {
        // Tool search still works; articles simply stay out.
      });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/);
    const all = [...STATIC_SEARCH_INDEX, ...articles];
    return all
      .filter((entry) => tokens.every((token) => entry.haystack.includes(token)))
      .slice(0, 8);
  }, [query, articles]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close search" : "Search calculators and articles"}
        onClick={() => {
          if (!open) loadArticles();
          setOpen((value) => !value);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <label htmlFor="site-search-input" className="sr-only">
              Search {AppConfig.name}
            </label>
            <input
              ref={inputRef}
              id="site-search-input"
              type="search"
              autoComplete="off"
              placeholder="Search calculators…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results.length > 0) {
                  event.preventDefault();
                  router.push(results[0].href);
                }
              }}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
            {query.trim().length >= 2 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                {results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    Nothing matches “{query.trim()}” — try a shorter word,
                    like “pay”, “tax” or “holiday”.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((entry) => (
                      <li key={entry.href}>
                        <Link
                          href={entry.href}
                          onClick={() => setOpen(false)}
                          className="flex items-baseline justify-between gap-3 px-4 py-2.5 transition hover:bg-brand-50 dark:hover:bg-brand-900/30"
                        >
                          <span className="min-w-0 truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                            {entry.title}
                          </span>
                          <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {entry.kind}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
