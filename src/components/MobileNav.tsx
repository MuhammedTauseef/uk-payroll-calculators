"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppConfig } from "@/utils/AppConfig";
import Flag from "@/components/Flag";

/**
 * Mobile navigation: a hamburger button in the header (below the lg
 * breakpoint) that opens a full-width panel under the header listing
 * every nav link with full-height (≥44px) tap targets. The desktop pill
 * row lives in SiteNav and is untouched. The panel only renders while
 * open, so it adds no layout shift on load.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Same country grouping as the desktop mega menu: Home and Blog sit
  // outside the groups; every calculator sits under its country
  // heading, derived from AppConfig.nav by flag.
  const home = AppConfig.nav.find((item) => item.href === "/");
  const blog = AppConfig.nav.find((item) => item.href === "/blog");
  const groups = [
    { heading: "UK Calculators", flag: "🇬🇧" },
    { heading: "US Calculators", flag: "🇺🇸" },
    { heading: "AU Calculators", flag: "🇦🇺" },
    { heading: "CH Calculators", flag: "🇨🇭" },
  ].map((group) => ({
    ...group,
    items: AppConfig.nav.filter((item) => item.flag === group.flag),
  }));

  // Accordion: one country group open at a time, so the panel opens
  // short instead of one long scroll. The group holding the current
  // page starts open; on pages outside the groups, the UK group does.
  const [openGroup, setOpenGroup] = useState<string>(() => {
    const current = groups.find((group) =>
      group.items.some((item) => item.href === pathname),
    );
    return current ? current.flag : "🇬🇧";
  });

  const renderRow = (item: (typeof AppConfig.nav)[number]) => {
    const active = pathname === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={
            active
              ? "flex min-h-11 items-center rounded-lg bg-brand-50 dark:bg-brand-900/30 px-3 py-3 text-base font-semibold text-brand-800 dark:text-brand-300"
              : "flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          }
        >
          <span
            aria-hidden="true"
            className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800"
          >
            {item.icon}
          </span>
          <span>{item.label}</span>
          {item.flag ? (
            <span aria-hidden="true" className="ml-auto pl-3">
              <Flag
                flag={item.flag}
                className="block h-5 w-7 rounded-[3px] object-cover"
              />
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  // Close when the route changes (a link tap also closes via onClick).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Main navigation"
          className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg"
        >
          <ul className="mx-auto w-full max-w-6xl px-4 py-2">
            {home && renderRow(home)}
            {groups.map((group) => {
              const expanded = openGroup === group.flag;
              return (
                <li key={group.heading}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenGroup(expanded ? "" : group.flag)}
                    className="flex min-h-11 w-full items-center px-3 pt-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                  >
                    {group.heading}
                    <Flag
                      flag={group.flag}
                      className="ml-1.5 inline-block h-3 w-[18px] rounded-[2px] object-cover"
                    />
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1-.02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {expanded && <ul>{group.items.map(renderRow)}</ul>}
                </li>
              );
            })}
            {blog && renderRow(blog)}
          </ul>
        </nav>
      )}
    </div>
  );
}
