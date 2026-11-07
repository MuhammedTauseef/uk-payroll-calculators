import type { NextConfig } from "next";

/**
 * Baseline security headers for a static, login-free site (added after
 * the 7 Nov 2026 expert audit): MIME-sniffing protection, a
 * referrer policy, frame protection, and a loose Content Security
 * Policy that only allows the site's own assets plus the inline
 * bootstrap Next.js emits ('unsafe-inline' — there are no user
 * accounts, no forms posting anywhere and no third-party origins).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
