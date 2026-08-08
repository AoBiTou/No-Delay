import type { NextConfig } from "next";

import { securityHeaders } from "./lib/security-headers";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        basePath: "/No-Delay",
        output: "export" as const,
        trailingSlash: true,
      }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [...securityHeaders],
            },
          ];
        },
      }),
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
