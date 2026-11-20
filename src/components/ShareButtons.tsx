"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Social share buttons (UX Izafa 5, 2026-11-20) for calculator and
 * article pages: plain share links for Facebook, X, WhatsApp and
 * LinkedIn, opened in a new tab. No share-count scripts, no trackers,
 * no third-party JavaScript — the links carry only the page's
 * canonical URL and its title.
 *
 * The title is read from the document once mounted (it is the page's
 * own metadata title), with the site-name suffix trimmed.
 */
export default function ShareButtons() {
  const pathname = usePathname() ?? "";
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(
      document.title.replace(` | ${AppConfig.name}`, "").trim() ||
        AppConfig.name,
    );
  }, [pathname]);

  const url = `${AppConfig.siteUrl}${pathname}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Share this page:
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.label}`}
          className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
