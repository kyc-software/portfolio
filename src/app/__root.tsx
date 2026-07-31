import figtree from "@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url";
import geistMono from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import lexend from "@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2?url";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import appCss from "./globals.css?url";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const title = "Anthony Abramo | Senior Product Engineer";
const description =
  "Senior product engineer with 10+ years of experience taking ambitious digital products from first idea to production.";
const socialTitle = "Anthony Abramo | 10+ years building products";
const socialDescription =
  "Selected live products spanning collaboration, learning, finance, and operations.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "application-name", content: "Anthony Abramo Portfolio" },
      { name: "author", content: "Anthony Abramo" },
      {
        name: "keywords",
        content:
          "Senior Product Engineer,Senior Software Engineer,Frontend Architecture,React,TypeScript,Product Engineering",
      },
      { name: "theme-color", content: "#050607" },
      { name: "color-scheme", content: "dark" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: socialTitle },
      { property: "og:description", content: socialDescription },
      { property: "og:image", content: `${siteUrl}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: socialTitle },
      { name: "twitter:description", content: socialDescription },
      { name: "twitter:image", content: `${siteUrl}/og.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preload",
        href: figtree,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: lexend,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: geistMono,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/assets/portrait-new-transparent-1800.webp",
        as: "image",
        type: "image/webp",
        fetchPriority: "high",
      },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
