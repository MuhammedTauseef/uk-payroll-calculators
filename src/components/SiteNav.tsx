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
    <ul className="flex flex-nowrap items-center gap-0.5">
      {/* "Home" is omitted here: the logo at the left of the header is
          the home link (the mobile menu keeps the full list). Dropping
          it is what lets all eight remaining pills fit one row at xl. */}
      {AppConfig.nav
        .filter((item) => item.href !== "/")
        .map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-brand-50 dark:bg-brand-900/30 px-2.5 py-2 text-[13px] font-semibold whitespace-nowrap text-brand-800 dark:text-brand-300"
                  : "rounded-full px-2.5 py-2 text-[13px] font-medium whitespace-nowrap text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-800 dark:hover:text-brand-300"
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
