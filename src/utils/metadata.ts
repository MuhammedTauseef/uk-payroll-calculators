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
 * Every page also carries a default social image: the office photo
 * already hosted in the site's Supabase storage (the same file the
 * "Best HR Systems UK" post uses as its cover). It is referenced by
 * absolute URL because image binaries cannot be pushed through the
 * GitHub connector, so no local /og-default.jpg exists in the repo.
 * Blog posts override it with their own cover in their
 * generateMetadata (technical SEO audit, 7 Nov 2026).
 */
const DEFAULT_SOCIAL_IMAGE =
  "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/blog/27cf7f8b-ae10-4f72-aab2-58b4cfa01ad1/media-generation-best-hr-systems-uk-office-0-b4f47d45-1f6d-4387-ba07-299873f0cf25.jpg";
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
          url: DEFAULT_SOCIAL_IMAGE,
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
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}
