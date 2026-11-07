import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";

/**
 * Sitemap for the whole hub: the home page, the four calculators (from
 * AppConfig.nav, minus the home entry) and the five SSP guides (from
 * AppConfig.guides). Keeping the route list driven by AppConfig means a
 * route added to the navigation appears here automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const calculatorPaths = AppConfig.nav
    .map((item) => item.href)
    .filter((href) => href !== "/");
  const guidePaths = AppConfig.guides.map((item) => item.href);

  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1.0 },
    ...calculatorPaths.map((path) => ({ path, priority: 0.9 })),
    ...guidePaths.map((path) => ({ path, priority: 0.7 })),
  ];

  return routes.map(({ path, priority }) => ({
    url: `${AppConfig.siteUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
