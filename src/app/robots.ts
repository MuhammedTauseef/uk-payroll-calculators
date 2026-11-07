import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";

/** Allow every crawler everywhere, and point them at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${AppConfig.siteUrl}/sitemap.xml`,
  };
}
