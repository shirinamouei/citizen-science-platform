import type { NextConfig } from "next";

// GITHUB_REPOSITORY is set automatically by GitHub Actions ("owner/repo"),
// so project pages (served at /<repo>/) get the right base path only in CI —
// local dev and `next start` stay at the root.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = process.env.GITHUB_ACTIONS && repo ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
