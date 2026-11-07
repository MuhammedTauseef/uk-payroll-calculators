"use client";

import { useEffect, useState } from "react";

/**
 * Header dark/light toggle.
 *
 * The theme itself is owned by the `dark` class on <html>: the inline
 * script in the root layout sets it before first paint from
 * localStorage ("theme") or the visitor's prefers-color-scheme, so
 * this button never has to guess on first render — the two icons are
 * shown/hidden purely by CSS (moon in light mode, sun in dark mode),
 * which means no hydration mismatch and no icon flash. Clicking flips
 * the class, mirrors color-scheme for native UI, and persists the
 * choice. aria-pressed syncs from the real class after mount.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    const next = el.classList.toggle("dark");
    el.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage unavailable (private mode): the class still flips for
      // this visit; the choice simply will not persist.
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
    >
      {/* Moon — shown in light mode (tap for dark). */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 dark:hidden"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* Sun — shown in dark mode (tap for light). */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden h-5 w-5 dark:block"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
