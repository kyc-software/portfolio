import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

function securityHeaders(development: boolean) {
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "frame-src 'self' https://bragi-notes.vercel.app https://tingshuo.vercel.app https://loany-simulateur.vercel.app https://bisonflow.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  return {
    "Content-Security-Policy": contentSecurityPolicy,
    "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
  };
}

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        routesDirectory: "app",
      },
      prerender: {
        enabled: true,
      },
    }),
    nitro({
      routeRules: {
        "/**": {
          headers: securityHeaders(command === "serve"),
        },
        "/assets/**": {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        },
        "/projects/**": {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        },
      },
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
}));
