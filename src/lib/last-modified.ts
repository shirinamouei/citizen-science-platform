import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";

function git(...args: string[]) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function ymdFromLocalDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * When a source file was last edited, as `YYYY-MM-DD`. Runs at build time
 * (the site is statically exported), so the date refreshes on every deploy.
 *
 * Uses the file's last git commit date. If the file has uncommitted changes
 * (local dev) or git history isn't available, falls back to its mtime.
 * `path` is relative to the project root.
 */
export function getLastModified(path: string): string {
  try {
    const dirty = git("status", "--porcelain", "--", path) !== "";
    if (!dirty) {
      const committed = git("log", "-1", "--format=%cd", "--date=format:%Y-%m-%d", "--", path);
      if (committed) return committed;
    }
  } catch {
    // git missing or not a repo: fall through to mtime
  }
  return ymdFromLocalDate(statSync(path).mtime);
}

export function formatLongDate(ymd: string): string {
  // Format in UTC from the plain Y-M-D so the build machine's timezone can't shift the day.
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
