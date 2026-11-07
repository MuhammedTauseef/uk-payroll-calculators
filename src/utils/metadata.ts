import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Per-page metadata: the page's own title and description, its
 * canonical URL (resolved against `metadataBase` in the root layout)
 * and matching Open Graph / Twitter card fields, so search results and
 * shared links present every page properly. The home page's title is
 * marked absolute so the layout's "%s | UK Payroll Calculators"
 * template does not duplicate the site name on it.
 *
 * Every page also carries the default social image
 * (/og-default.jpg in public/); blog posts override it with their own
 * cover in their generateMetadata (technical SEO audit, 7 Nov 2026).
 */
export function pageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: AppConfig.name,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: "/og-default.jpg",
          width: 2048,
          height: 1152,
          alt: AppConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/og-default.jpg"],
    },
  };
}
