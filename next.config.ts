import type { NextConfig } from "next";

/**
 * Baseline security headers (added after the 7 Nov 2026 expert
 * audit): MIME-sniffing protection, a referrer policy, frame
 * protection, and a Content Security Policy. The policy began as
 * 'self'-only for a static, login-free site; the blog + admin panel
 * (Nov 2026) extends it with exactly the origins the panel needs:
 * the site's own Supabase project (API/auth/storage over https, plus
 * its realtime websocket) for connect-src, and Supabase storage for
 * img-src (blog cover images). Everything else stays 'self'.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  },
];

// Blog cover images are served from the project's own Supabase
// storage (the public 'blog-images' bucket). next/image may only
// optimise remote hosts listed here, so allow exactly that origin's
// public-object path — derived from the configured Supabase URL,
// never a wildcard host (the reference sites' pattern). Before the
// env var exists, the list is simply empty.
const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname || null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Standard Next.js standalone output — the fleet-wide Dockerfile
  // (7 Nov 2026) copies .next/standalone and runs it with node.
  output: "standalone",
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
