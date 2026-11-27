"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The expertise & review card (UX Izafa 5, 2026-11-20), shown at the
 * foot of every calculator page and blog article: who checked the
 * numbers, what they were checked against, and where the method is
 * written down. The authority named follows the section, exactly as
 * the footer note does — HMRC/GOV.UK for UK pages, the IRS on /us/*
 * and the ATO on /au/*. No photograph: the owner's photo is not used
 * without his say-so.
 */
export default function ReviewCard() {
  const pathname = usePathname() ?? "";

  const authority = pathname.startsWith("/us/")
    ? "the IRS published rates"
    : pathname.startsWith("/au/")
      ? "the ATO published rates"
      : "HMRC and GOV.UK published rates";

  return (
    <section
      aria-label="How these calculations are checked"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-brand-50 dark:bg-brand-900/20 p-6"
    >
      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Calculations checked by CEO Muhammad Tauseef
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        The figures on this page were verified against {authority},
        benchmarked against worked examples, and re-checked whenever
        the published rates change. How that checking works is written
        down in full — no figure here asks to be taken on trust.
      </p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
        <Link
          href="/methodology"
          className="text-brand-800 dark:text-brand-300 underline"
        >
          Our methodology
        </Link>
        <Link
          href="/editorial-policy"
          className="text-brand-800 dark:text-brand-300 underline"
        >
          Editorial &amp; verification policy
        </Link>
      </p>
    </section>
  );
}
