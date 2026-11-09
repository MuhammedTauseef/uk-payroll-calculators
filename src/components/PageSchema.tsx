"use client";

import { usePathname } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Central JSON-LD for the pages that define no schema of their own,
 * plus site-wide breadcrumbs — rendered once from the root layout,
 * keyed off the current path (the same pattern FooterNote uses).
 *
 * - The utility pages (/about, /blog, /contact, /cookies,
 *   /disclaimer, /privacy-policy, /terms) carry no JSON-LD at all;
 *   they get a basic WebPage entry naming them and tying them to
 *   the site.
 * - Every page gets a BreadcrumbList derived from its URL path:
 *   Home, then one item per path segment (names title-cased from
 *   the slug, with acronym overrides below).
 *
 * Tool pages keep their own FAQPage / WebApplication schema; blog
 * posts keep their Article schema. Admin pages are excluded.
 */

const UTILITY_PAGES: Record<string, string> = {
  "/about": "About UK Payroll Calculators",
  "/blog": "Blog",
  "/contact": "Contact UK Payroll Calculators",
  "/cookies": "Cookie Policy",
  "/disclaimer": "Disclaimer",
  "/privacy-policy": "Privacy Policy",
  "/terms": "Terms of Use",
};

const SEGMENT_NAMES: Record<string, string> = {
  us: "United States",
  au: "Australia",
  ssp: "SSP",
  hmrc: "HMRC",
  nhs: "NHS",
  ir35: "IR35",
  uk: "UK",
  "40k": "£40k",
};

function segmentName(slug: string): string {
  return slug
    .split("-")
    .map(
      (w) =>
        SEGMENT_NAMES[w] ??
        (w ? w.charAt(0).toUpperCase() + w.slice(1) : w),
    )
    .join(" ");
}

export default function PageSchema() {
  const pathname = usePathname() ?? "/";

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const jsonLd: Record<string, unknown>[] = [];

  const utilityName = UTILITY_PAGES[pathname];
  if (utilityName) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: utilityName,
      url: `${AppConfig.siteUrl}${pathname}`,
      isPartOf: {
        "@type": "WebSite",
        name: AppConfig.name,
        url: AppConfig.siteUrl,
      },
    });
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const itemListElement = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: AppConfig.siteUrl,
      },
      ...segments.map((segment, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name:
          i === segments.length - 1 && utilityName
            ? utilityName
            : segmentName(segment),
        item: `${AppConfig.siteUrl}/${segments.slice(0, i + 1).join("/")}`,
      })),
    ];
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    });
  }

  if (jsonLd.length === 0) {
    return null;
  }

  return (
    <>
      {jsonLd.map((entry) => (
        <script
          key={String(entry["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

// Serving note: central schema for utility pages + breadcrumbs (technical SEO, Nov 2026).
