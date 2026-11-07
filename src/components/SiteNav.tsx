"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Main navigation with active-page highlighting, rendered inside the
 * BaseTemplate header (desktop bar and mobile strip).
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {AppConfig.nav.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold whitespace-nowrap text-brand-800"
                  : "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-600 transition hover:bg-slate-100 hover:text-brand-800"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
