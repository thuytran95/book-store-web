import type { NextConfig } from "next";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const origin = api.replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${origin}/media/:path*` }];
  },
};

export default nextConfig;
