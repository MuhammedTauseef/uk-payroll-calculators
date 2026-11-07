"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compact result summary bar for calculator pages, mobile only.
 *
 * Rendered inside a calculator's root element (which must be
 * `relative`): an invisible sentinel covering the calculator observes
 * whether any of it is on screen, and while it is, a fixed bottom bar
 * shows the calculator's headline figure, updating live as the visitor
 * edits the fields — so the result is never off-screen while typing.
 * The main result panel is neither moved nor replaced; desktop (md and
 * up) never sees the bar, and it is hidden in print.
 */
export default function StickyResultBar(props: {
  label: string;
  value: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setShow(entries[0]?.isIntersecting ?? false),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      {show && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 dark:border-brand-900 bg-white/95 px-4 dark:bg-slate-950/95 py-3 shadow-[0_-2px_10px_rgba(15,23,42,0.08)] backdrop-blur print:hidden md:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-3">
            <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
              {props.label}
            </span>
            <span className="text-right text-lg font-bold text-brand-800 dark:text-brand-300">
              {props.value}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
