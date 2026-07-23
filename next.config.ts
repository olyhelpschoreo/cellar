import type { NextConfig } from "next";

// Static export for GitHub Pages. The app is fully client-side (localStorage),
// so every route pre-renders to static HTML and hydrates in the browser.
// Served from https://olyhelpschoreo.github.io/cellar/ — hence the basePath.
const isProd = process.env.NODE_ENV === "production";
const repo = "cellar";

const basePath = isProd ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  // Exposed to the client so the service worker registers at the right scope.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
