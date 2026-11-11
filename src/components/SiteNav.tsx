"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Main navigation with active-page highlighting, rendered inside the
 * BaseTemplate header (desktop bar only; the mobile strip uses
 * MobileNav with the same grouped list).
 *
 * Layout: a fixed visible pill set + a "Calculators" mega menu + Blog.
 * The mega menu follows the pattern proven on PakkiNaukri: one wide
 * panel holding EVERY calculator, grouped by country (UK / US / AU),
 * each row with its own icon and country flag, plus a Guides column.
 * Before this, Employer Cost, IR35, Texas and AU had no desktop nav
 * entry at all — the old "More" dropdown held only five UK tools.
 * Groups are derived from AppConfig.nav by flag, so a new calculator
 * lands in the right country group automatically.
 *
 * The visible set (6 pills + Calculators + Blog) stays inside the
 * ~854px the header leaves for the nav at 1280px, and the panel is
 * width-capped to the viewport, so neither can push the page sideways.
 */
const VISIBLE_HREFS = [
  "/ssp-calculator",
  "/40k-after-tax-uk",
  "/payslip-generator",
  "/hmrc-tax-code-checker",
  "/annual-leave-calculator",
  "/overtime-calculator",
];

const PILL_CLASS =
  "rounded-full px-2 py-2 text-[13px] font-medium whitespace-nowrap text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300";
const PILL_ACTIVE_CLASS =
  "rounded-full bg-brand-50 dark:bg-brand-900/30 px-2 py-2 text-[13px] font-semibold whitespace-nowrap text-brand-800 dark:text-brand-300";

type NavItem = (typeof AppConfig.nav)[number];

const GROUP_HEADING_CLASS =
  "px-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500";

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const itemByHref = (href: string) =>
    AppConfig.nav.find((item) => item.href === href);
  const visible = VISIBLE_HREFS.map(itemByHref).filter(
    (item): item is NavItem => Boolean(item),
  );
  const blog = itemByHref("/blog");

  const ukItems = AppConfig.nav.filter((item) => item.flag === "🇬🇧");
  const usItems = AppConfig.nav.filter((item) => item.flag === "🇺🇸");
  const auItems = AppConfig.nav.filter((item) => item.flag === "🇦🇺");
  const calculatorHrefs = new Set(
    [...ukItems, ...usItems, ...auItems].map((item) => item.href),
  );
  const panelActive = calculatorHrefs.has(pathname);

  // Close on navigation (also covers a panel link being clicked).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click and on Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  const renderPill = (item: NavItem) => {
    const active = pathname === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={active ? PILL_ACTIVE_CLASS : PILL_CLASS}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  const renderPanelLink = (item: NavItem) => {
    const active = pathname === item.href;
    return (
      <li key={item.href} role="none">
        <Link
          href={item.href}
          role="menuitem"
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={
            active
              ? "flex items-center gap-2 rounded-lg bg-brand-50 px-2 py-1.5 text-[13px] font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-300"
              : "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
          }
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm dark:bg-slate-800"
          >
            {item.icon}
          </span>
          <span className="whitespace-nowrap">{item.label}</span>
          {item.flag ? (
            <span aria-hidden="true" className="ml-auto pl-2">
              {item.flag}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  return (
    <ul className="flex flex-nowrap items-center gap-0.5">
      {visible.map(renderPill)}

      <li ref={panelRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center gap-1 ${panelActive ? PILL_ACTIVE_CLASS : PILL_CLASS}`}
        >
          Calculators
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1-.02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            aria-label="All calculators by country"
            className="absolute top-full right-0 z-50 mt-2 w-[min(62rem,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="grid grid-cols-4 gap-6 p-5">
              <div className="col-span-2">
                <p className={GROUP_HEADING_CLASS}>UK Calculators 🇬🇧</p>
                <ul className="mt-2 grid grid-cols-2 gap-x-3">
                  {ukItems.map(renderPanelLink)}
                </ul>
              </div>

              <div>
                <p className={GROUP_HEADING_CLASS}>US Calculators 🇺🇸</p>
                <ul className="mt-2">{usItems.map(renderPanelLink)}</ul>
                <p className={`${GROUP_HEADING_CLASS} mt-5`}>
                  AU Calculators 🇦🇺
                </p>
                <ul className="mt-2">{auItems.map(renderPanelLink)}</ul>
                <p className="px-2 pt-4 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                  New calculators are added as each country&apos;s rules
                  are verified.
                </p>
              </div>

              <div>
                <p className={GROUP_HEADING_CLASS}>Guides</p>
                <ul className="mt-2">
                  {AppConfig.guides.map((guide) => {
                    const active = pathname === guide.href;
                    return (
                      <li key={guide.href} role="none">
                        <Link
                          href={guide.href}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className={
                            active
                              ? "block rounded-lg bg-brand-50 px-2 py-1.5 text-[13px] font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-300"
                              : "block rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
                          }
                        >
                          {guide.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Every calculator is free to use — no sign-up, built on the
              April 2026 rules.
            </p>
          </div>
        )}
      </li>

      {blog && renderPill(blog)}
    </ul>
  );
}
