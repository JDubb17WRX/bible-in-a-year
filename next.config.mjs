import path from "node:path";
import { fileURLToPath } from "node:url";

// Standalone output so the VPS container only needs the built server, not the
// full node_modules tree — same shape as the sibling Covenanters deployment.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Turbopack/webpack's dev-mode HMR runtime relies on eval() to wrap modules,
// so a strict script-src blocks React from ever hydrating in `next dev` (the
// page loads, but no client component becomes interactive, silently). This
// only relaxes the policy for local development — production builds don't
// need eval and keep the strict policy.
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "frame-src 'none'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
