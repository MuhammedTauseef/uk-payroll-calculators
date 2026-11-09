"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Main navigation with active-page highlighting, rendered inside the
 * BaseTemplate header (desktop bar only; the mobile strip uses
 * MobileNav with the full list).
 *
 * The row is a fixed visible set + a "More" dropdown + Blog. With
 * eleven tool pills the single-row layout overflowed the 1280px
 * header container (the last pills were clipped off-screen), so the
 * five least-used tools moved into the dropdown. The visible set
 * (6 pills + More + Blog) measures ~730px against the ~854px the
 * header leaves for the nav at 1280px, so the row fits with room
 * to spare and can never push the page sideways. The AppConfig.nav
 * order/labels/hrefs are untouched — this component only chooses
 * which of them render where.
 */
const VISIBLE_HREFS = [
  "/ssp-calculator",
  "/40k-after-tax-uk",
  "/payslip-generator",
  "/hmrc-tax-code-checker",
  "/annual-leave-calculator",
  "/overtime-calculator",
];

const DROPDOWN_HREFS = [
  "/notice-period-calculator",
  "/pro-rata-salary-calculator",
  "/employer-national-insurance-calculator",
  "/nhs-maternity-pay-calculator",
  "/paternity-pay-calculator",
];

const PILL_CLASS =
  "rounded-full px-2 py-2 text-[13px] font-medium whitespace-nowrap text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300";
const PILL_ACTIVE_CLASS =
  "rounded-full bg-brand-50 dark:bg-brand-900/30 px-2 py-2 text-[13px] font-semibold whitespace-nowrap text-brand-800 dark:text-brand-300";

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const itemByHref = (href: string) =>
    AppConfig.nav.find((item) => item.href === href);
  const visible = VISIBLE_HREFS.map(itemByHref).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const dropdown = DROPDOWN_HREFS.map(itemByHref).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const blog = itemByHref("/blog");
  const dropdownActive = dropdown.some((item) => item.href === pathname);

  // Close on navigation (also covers a dropdown link being clicked).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click and on Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  const renderPill = (item: NonNullable<ReturnType<typeof itemByHref>>) => {
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

  return (
    <ul className="flex flex-nowrap items-center gap-0.5">
      {visible.map(renderPill)}

      <li ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center gap-1 ${dropdownActive ? PILL_ACTIVE_CLASS : PILL_CLASS}`}
        >
          More
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <ul
            role="menu"
            aria-label="More calculators"
            className="absolute top-full right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            {dropdown.map((item) => {
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
                        ? "block rounded-lg bg-brand-50 px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-brand-800 dark:bg-brand-900/30 dark:text-brand-300"
                        : "block rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap text-slate-600 transition hover:bg-slate-100 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>

      {blog && renderPill(blog)}
    </ul>
  );
}
