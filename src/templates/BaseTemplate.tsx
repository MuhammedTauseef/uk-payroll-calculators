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
  footerNote: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col text-slate-700 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white shadow-sm">
              £
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-slate-900">
                {AppConfig.name}
              </span>
              <span className="hidden text-xs text-slate-500 md:block">
                {AppConfig.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:block">
            {props.leftNav}
          </nav>

          <div className="hidden shrink-0 sm:block">{props.rightNav}</div>
        </div>

        <nav
          aria-label="Main navigation"
          className="border-t border-slate-100 px-4 py-2 lg:hidden"
        >
          <div className="mx-auto w-full max-w-6xl">{props.leftNav}</div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">
        {props.children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto_auto]">
          <div className="max-w-xl space-y-3">
            <p className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-base font-bold text-white">
                £
              </span>
              <span className="text-base font-bold text-slate-900">
                {AppConfig.name}
              </span>
            </p>
            <div className="text-sm leading-relaxed text-slate-500">
              {props.footerNote}
            </div>
          </div>

          <nav aria-label="Calculator links">
            <p className="text-sm font-semibold text-slate-900">Calculators</p>
            <ul className="mt-3 space-y-2 text-sm">
              {AppConfig.nav
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-slate-600 transition hover:text-brand-800"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <nav aria-label="Guide links">
            <p className="text-sm font-semibold text-slate-900">Guides</p>
            <ul className="mt-3 space-y-2 text-sm">
              {AppConfig.guides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-600 transition hover:text-brand-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} {AppConfig.name}.
            </p>
            <p>
              Design foundation:{" "}
              <a
                href="https://github.com/ixartz/Next-js-Boilerplate"
                target="_blank"
                rel="noreferrer"
                className="underline transition hover:text-brand-800"
              >
                Next.js Boilerplate
              </a>{" "}
              by Ixartz (MIT licence).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
