import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  logging: {
    // Dev-only Server Function logging prints call arguments to the terminal — including passwords
    // from the auth forms. Keep it off so credentials never appear in logs.
    serverFunctions: false,
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
