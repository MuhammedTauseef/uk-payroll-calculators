import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Branded 404: the site shell still renders around this page (header,
 * footer and navigation come from the root layout), so a visitor who
 * lands on a wrong address gets the site's own wording and a clear way
 * back to the calculators instead of the default Next.js page.
 */
export default function NotFound() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-xl font-bold text-white shadow-sm">
          £
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Page not found
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The page you were looking for does not exist on UK Payroll
          Calculators — the address may be mistyped, or the page may have
          moved. The calculators themselves are all still here:
        </p>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2">
        {AppConfig.nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 font-semibold text-brand-800 dark:text-brand-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/40"
            >
              {item.label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
