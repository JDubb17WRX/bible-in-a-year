import path from "node:path";
import { fileURLToPath } from "node:url";

// Standalone output so the VPS container only needs the built server, not the
// full node_modules tree — same shape as the sibling Covenanters deployment.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Next's App Router bootstraps hydration with small inline <script> tags and
// (in dev) Turbopack's HMR runtime uses eval() to wrap modules, so a strict
// script-src blocks React from ever mounting — the page loads but stays
// blank/inert. The Covenanters app hits the same constraint and carries the
// same relaxation unconditionally; matching that here rather than trying to
// be stricter, since a nonce-based CSP would need its own middleware wiring.
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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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
