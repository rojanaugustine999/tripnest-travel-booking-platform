import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Content Security Policy: the browser only loads what we expect. Notes:
 * - 'unsafe-inline' scripts/styles are needed by Next.js (hydration data, styled components); a per-request nonce
 *   would force every page to render dynamically and lose caching, so this is the practical middle ground.
 * - Images come from our own site and Unsplash (sample photography); API calls go to our Supabase project only.
 * - Only applied in production: the dev server needs eval and websockets for hot reload.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Nobody can put TripNest inside a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // The browser must trust our declared file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites only learn our origin, never full URLs (which can contain booking references).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We use none of these powerful features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // HTTPS only (browsers ignore this header over plain http, so it is harmless on localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...(isProduction ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    // Dev-only Server Function logging prints call arguments to the terminal — including passwords
    // from the auth forms. Keep it off so credentials never appear in logs.
    serverFunctions: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Sample travel photography (Unsplash licence). Supabase Storage is added in Phase 4/6.
    // Object form (no `search` key) so Unsplash sizing query strings such as ?w=1600 are allowed.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
