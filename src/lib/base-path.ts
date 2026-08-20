// GITHUB_REPOSITORY is set automatically by GitHub Actions ("owner/repo"),
// so project pages (served at /<repo>/) get the right base path only in CI —
// local dev and `next start` stay at the root. Shared between next.config.ts
// and layout.tsx's metadata, since Next's auto-generated icon route doesn't
// get basePath applied the way regular assets/links do.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
export const basePath = process.env.GITHUB_ACTIONS && repo ? `/${repo}` : "";
