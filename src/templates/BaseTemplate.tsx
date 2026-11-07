import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Base site shell — sticky header, centred main container and footer —
 * following the BaseTemplate pattern from ixartz/Next-js-Boilerplate
 * (MIT licence — see the LICENSE file in the project root), rebuilt for
 * this site: no auth, no i18n, no sponsors, no external services.
 * The navigation itself is passed in (leftNav / rightNav) exactly as in
 * the template, so the shell stays a pure layout component.
 */
export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  mobileNav?: React.ReactNode;
  footerNote: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col text-slate-700 dark:text-slate-300 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 backdrop-blur dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-1.5 px-3 min-[432px]:gap-2 min-[432px]:px-4 sm:gap-4">
          {/* Below 432px the logo link may shrink and the site name
              wraps to two lines ("UK Payroll" / "Calculators"): the
              fixed-width right cluster (toggle + CTA + hamburger,
              181px) plus a single-line name cannot fit a 360–390px
              phone otherwise. From 432px up the name is one line and
              the link is shrink-0 again, exactly as before. */}
          <Link href="/" className="flex min-w-0 items-center gap-2 min-[432px]:shrink-0 min-[432px]:gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white shadow-sm">
              £
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold text-slate-900 dark:text-slate-50 min-[432px]:whitespace-nowrap sm:text-base">
                {AppConfig.name}
              </span>
              {/* Tagline yields at xl: the full desktop pill nav needs
                  the width, and the name alone identifies the site. */}
              <span className="hidden text-xs whitespace-nowrap text-slate-500 dark:text-slate-400 md:block xl:hidden">
                {AppConfig.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden xl:block">
            {props.leftNav}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {props.rightNav}
            {props.mobileNav}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        {props.children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="max-w-xl space-y-3">
            <p className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-base font-bold text-white">
                £
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-50">
                {AppConfig.name}
              </span>
            </p>
            <div className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {props.footerNote}
            </div>
          </div>

          <nav aria-label="Calculator links">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Calculators</p>
            <ul className="mt-3 space-y-1 text-sm">
              {AppConfig.nav
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-1.5 text-slate-600 dark:text-slate-300 transition hover:text-brand-800 dark:hover:text-brand-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <nav aria-label="Guide links">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Guides</p>
            <ul className="mt-3 space-y-1 text-sm">
              {AppConfig.guides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-slate-600 dark:text-slate-300 transition hover:text-brand-800 dark:hover:text-brand-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site links">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Site</p>
            <ul className="mt-3 space-y-1 text-sm">
              {AppConfig.siteLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-slate-600 dark:text-slate-300 transition hover:text-brand-800 dark:hover:text-brand-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
            <p>
              © {new Date().getFullYear()} {AppConfig.name}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
