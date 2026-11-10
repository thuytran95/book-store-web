import type { NextConfig } from "next";

// The /media rewrite is proxied by the Next server, so inside Docker it must reach the
// backend by its service name (API_INTERNAL_URL), not the browser-facing localhost URL.
const api =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";
const origin = api.replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${origin}/media/:path*` }];
  },
};

export default nextConfig;
