import Link from "next/link";
import type { UsStateCode } from "@/lib/us-paycheck";

/**
 * The by-state cluster block for the US paycheck calculators
 * (22 Nov 2026): every state page carries the same block, linking
 * to every OTHER live state page, so the ten state calculators
 * form one interlinked cluster instead of ten islands. The state
 * list lives here and only here — a future state build adds its
 * entry to STATE_PAGES and drops this component on its own page,
 * and every existing state page picks the new link up on its own.
 */
export const STATE_PAGES: {
  code: UsStateCode;
  name: string;
  href: string;
}[] = [
  { code: "TX", name: "Texas", href: "/us/texas-paycheck-calculator" },
  { code: "OH", name: "Ohio", href: "/us/ohio-paycheck-calculator" },
  {
    code: "CO",
    name: "Colorado",
    href: "/us/colorado-paycheck-calculator",
  },
  { code: "AZ", name: "Arizona", href: "/us/arizona-paycheck-calculator" },
  { code: "FL", name: "Florida", href: "/us/florida-paycheck-calculator" },
  {
    code: "IL",
    name: "Illinois",
    href: "/us/illinois-paycheck-calculator",
  },
  {
    code: "NC",
    name: "North Carolina",
    href: "/us/north-carolina-paycheck-calculator",
  },
  {
    code: "PA",
    name: "Pennsylvania",
    href: "/us/pennsylvania-paycheck-calculator",
  },
  {
    code: "NJ",
    name: "New Jersey",
    href: "/us/new-jersey-paycheck-calculator",
  },
  { code: "OR", name: "Oregon", href: "/us/oregon-paycheck-calculator" },
];

export default function StatePaycheckCluster({
  state,
}: {
  state: UsStateCode;
}) {
  const others = STATE_PAGES.filter((s) => s.code !== state);
  if (others.length === 0) return null;
  return (
    <section className="space-y-3 print:hidden">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Paycheck calculators by state
      </h2>
      <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
        State tax is the line that changes when you cross a state
        line — the federal lines stay the same. The same calculator
        runs for every state we cover, each with that state&apos;s own
        2026 rules worked in:
      </p>
      <div className="flex flex-wrap gap-2">
        {others.map((s) => (
          <Link
            key={s.code}
            href={s.href}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
          >
            {s.name} paycheck calculator
          </Link>
        ))}
      </div>
    </section>
  );
}
