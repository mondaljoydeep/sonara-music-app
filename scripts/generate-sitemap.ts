import { writeFileSync } from "fs";
import { resolve } from "path";

// Shim browser globals BEFORE importing app code that touches localStorage
// at module load. ESM import hoisting means we can't use static imports for
// the app modules — use dynamic import after the shim is set.
(globalThis as any).localStorage ??= {
  getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}, key: () => null, length: 0,
};
(globalThis as any).window ??= globalThis;

const { TOP_ARTISTS } = await import("../src/services/artistsService");

const BASE_URL = "https://sonora-rhythm.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/search", changefreq: "weekly", priority: "0.8" },
  { path: "/library", changefreq: "weekly", priority: "0.6" },
  { path: "/community", changefreq: "daily", priority: "0.8" },
  { path: "/upload", changefreq: "monthly", priority: "0.5" },
  { path: "/profile", changefreq: "monthly", priority: "0.4" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/player", changefreq: "weekly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/blog/suno-vs-udio", changefreq: "monthly", priority: "0.7" },
];

// Dynamic artist routes generated from the static TOP_ARTISTS catalog.
// Creator profiles are keyed by Supabase user_id and can't be enumerated at
// build time from a script; add them here once a server-side prerender exists.
const artistEntries: SitemapEntry[] = TOP_ARTISTS.map((a: { slug: string }) => ({
  path: `/artist/${a.slug}`,
  changefreq: "weekly",
  priority: "0.6",
}));

const entries = [...staticEntries, ...artistEntries];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

try {
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
} catch (err) {
  console.warn("Notice: Could not write sitemap.xml during build:", err);
}

