import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

export default {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ["@flowly/ui"],
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
} satisfies NextConfig;
