"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CATEGORY_FLAGS, TOOL_CATEGORY_ORDER } from "@/lib/tools-index";
import Flag from "@/components/Flag";

export interface DirectoryTool {
  href: string;
  title: string;
  description: string;
  audience: string;
  linkText: string;
  category: string;
  icon: ReactNode;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";

/**
 * The all-calculators directory: search box + category chips +
 * the full tools list grouped under category headings (the
 * grouped layout settled on 22 Nov 2026, following the Tiny
 * Calculators directory: Pay & Salary, Tax & HMRC, Family & Baby,
 * Money & Finance, Business Tools, Converters, then US and
 * Australia). 100% client-side — the list is rendered into the
 * (static) homepage and filtered in the browser as the visitor
 * types or taps a chip. No API route, no server search, no extra
 * page cost. Typing also offers dropdown suggestions that jump
 * straight to a tool; the groups below filter at the same time.
 * Each card carries its description in two lines: what the tool
 * works out, then who it is for / what is special about it.
 */
export default function ToolsDirectory({ tools }: { tools: DirectoryTool[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(tools.map((t) => t.category)))],
    [tools],
  );

  const queryMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return tools;
    const tokens = q.split(/\s+/);
    return tools.filter((tool) => {
      const haystack =
        `${tool.title} ${tool.description} ${tool.audience} ${tool.category} ${tool.href}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [query, tools]);

  const visible = useMemo(
    () =>
      category === "All"
        ? queryMatches
        : queryMatches.filter((t) => t.category === category),
    [queryMatches, category],
  );

  const suggestions = query.trim().length >= 2 ? queryMatches.slice(0, 8) : [];

  // The visible tools grouped under their category headings, in
  // the canonical TOOL_CATEGORY_ORDER; a category the order does
  // not know (none today) keeps its first-appearance place at the
  // end rather than vanishing.
  const groups = useMemo(() => {
    const byCategory = new Map<string, DirectoryTool[]>();
    for (const tool of visible) {
      const list = byCategory.get(tool.category);
      if (list) list.push(tool);
      else byCategory.set(tool.category, [tool]);
    }
    const ordered: { category: string; tools: DirectoryTool[] }[] = [];
    for (const c of TOOL_CATEGORY_ORDER) {
      const list = byCategory.get(c);
      if (list) {
        ordered.push({ category: c, tools: list });
        byCategory.delete(c);
      }
    }
    for (const [c, list] of byCategory) {
      ordered.push({ category: c, tools: list });
    }
    return ordered;
  }, [visible]);

  return (
    <div>
      <div className="relative max-w-2xl">
        <label
          htmlFor="tool-search"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Search all {tools.length} calculators and converters
        </label>
        <input
          id="tool-search"
          type="search"
          autoComplete="off"
          placeholder='Try "stone", "ssp", "vat" or "gallons"…'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a suggestion registers first.
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && suggestions.length > 0) {
              e.preventDefault();
              window.location.href = suggestions[0].href;
            }
          }}
          className={`${inputClass} mt-1`}
          aria-label="Search calculators and converters"
        />
        {open && query.trim().length >= 2 && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
            {suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                No calculator matches “{query.trim()}” — try a shorter
                word, like “pay”, “tax” or “kg”.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {suggestions.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="flex items-baseline justify-between gap-3 px-4 py-3 transition hover:bg-brand-50 dark:hover:bg-brand-900/30"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {tool.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {tool.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
              category === c
                ? "bg-brand-700 text-white hover:bg-brand-800"
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          No calculators in this view match — clear the search or pick
          “All” to see the full list.
        </p>
      ) : (
        groups.map((group, gi) => (
          <section key={group.category} className={gi === 0 ? "mt-6" : "mt-10"}>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {CATEGORY_FLAGS[group.category] ? (
                <>
                  <Flag flag={CATEGORY_FLAGS[group.category]} />{" "}
                </>
              ) : (
                ""
              )}
              {group.category}
              <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {group.tools.length}{" "}
                {group.tools.length === 1 ? "calculator" : "calculators"}
              </span>
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {group.tools.map((calc, i) => {
                // Odd card out: the last card of a group spans the
                // full row as a wide feature card instead of
                // leaving a half-empty slot.
                const wide =
                  i === group.tools.length - 1 && group.tools.length % 2 === 1;
                return (
                  <Link
                    key={calc.href}
                    href={calc.href}
                    className={`group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md ${wide ? "sm:col-span-2 sm:flex sm:items-start sm:gap-5" : ""}`}
                  >
                    <span
                      className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm ${wide ? "sm:mb-0" : ""}`}
                    >
                      {calc.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {calc.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {calc.description}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {calc.audience}
                      </p>
                      <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                        {calc.linkText}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
