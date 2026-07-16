import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

initOpenNextCloudflareForDev();

// CSP baseline (E1-D1-T09): self + inline (Next App Router без nonce). Telegram Mini App
// работает в WebView, не в iframe — frame-ancestors 'none' безопасен. В dev React использует
// eval() для дебага (в prod — нет), поэтому 'unsafe-eval' только в dev. Harden (nonce-based) в этапе 8.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = `'self' 'unsafe-inline' https://telegram.org${isDev ? " 'unsafe-eval'" : ""}`;

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://i.ytimg.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

export default {
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ["@flowly/ui"],
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
} satisfies NextConfig;
