import type { Artist, ArtistCategory } from "./artistsService";
import { TOP_ARTISTS } from "./artistsService";

const SAAVN_HOST = "https://saavn-api-eight.vercel.app";
const CACHE_KEY = "sonara:dynArtists:v2";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface Cached {
  ts: number;
  data: Record<ArtistCategory, Artist[]>;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Big query map per category — pulled from Saavn artist search
const CATEGORY_QUERIES: Record<ArtistCategory, string[]> = {
  "Bollywood Playback": ["bollywood singer", "hindi playback", "bollywood top singer", "hindi film singer"],
  "Hindi Indie / I-Pop": ["hindi indie", "indian indie pop", "indie artist india"],
  "Hindi Hip-Hop / Rap": ["hindi rapper", "desi hip hop", "indian rap"],
  "Punjabi & Haryanvi": ["punjabi singer", "haryanvi singer", "punjabi rapper"],
  Tamil: ["tamil singer", "tamil playback", "kollywood singer"],
  Telugu: ["telugu singer", "tollywood singer"],
  Malayalam: ["malayalam singer", "mollywood singer"],
  Kannada: ["kannada singer", "sandalwood singer"],
  Bengali: ["bengali singer", "bangla singer"],
  Bhojpuri: ["bhojpuri singer"],
  Global: ["pop singer", "world top artist", "rapper", "kpop group", "latin artist", "rnb singer"],
};

const inflight = new Map<string, Promise<Artist[]>>();

function readCache(): Cached | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cached;
    if (Date.now() - c.ts > TTL_MS) return null;
    return c;
  } catch {
    return null;
  }
}

function writeCache(data: Record<ArtistCategory, Artist[]>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

let memCache: Record<ArtistCategory, Artist[]> | null = null;

async function fetchSaavnArtists(query: string, limit = 14): Promise<{ name: string; image: string | null }[]> {
  try {
    const res = await fetch(`${SAAVN_HOST}/api/search/artists?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    const arr = data?.data?.results || [];
    return arr
      .map((r: any) => {
        let image: string | null = null;
        if (Array.isArray(r?.image)) {
          image = r.image.find((i: any) => i.quality === "500x500")?.url || r.image[r.image.length - 1]?.url || null;
        } else if (typeof r?.image === "string") image = r.image;
        if (image && (image.includes("artist-default") || image.includes("default-music"))) image = null;
        return { name: r?.name || "", image };
      })
      .filter((x: any) => x.name);
  } catch {
    return [];
  }
}

async function buildCategory(category: ArtistCategory): Promise<Artist[]> {
  const queries = CATEGORY_QUERIES[category];
  const results = await Promise.all(queries.map((q) => fetchSaavnArtists(q, 14)));
  const seen = new Set<string>();
  const out: Artist[] = [];
  for (const list of results) {
    for (const a of list) {
      const slug = slugify(a.name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      out.push({
        slug,
        name: a.name,
        region: category === "Global" ? "global" : "indian",
        category,
        image: a.image,
      });
    }
  }
  return out;
}

async function buildAll(): Promise<Record<ArtistCategory, Artist[]>> {
  const cats = Object.keys(CATEGORY_QUERIES) as ArtistCategory[];
  const entries = await Promise.all(cats.map(async (c) => [c, await buildCategory(c)] as const));
  const map = {} as Record<ArtistCategory, Artist[]>;
  for (const [c, list] of entries) map[c] = list;
  return map;
}

export async function getDynamicArtists(category: ArtistCategory): Promise<Artist[]> {
  if (memCache?.[category]?.length) return memCache[category];
  const cached = readCache();
  if (cached?.data?.[category]?.length) {
    memCache = cached.data;
    return cached.data[category];
  }
  const key = "__all__";
  if (!inflight.has(key)) {
    inflight.set(
      key,
      buildAll().then((all) => {
        memCache = all;
        writeCache(all);
        return all[category] || [];
      }) as any
    );
  }
  await inflight.get(key);
  return memCache?.[category] || [];
}

/** Static + dynamic, dedup by slug. Used for Search. */
export async function getAllArtistsMerged(): Promise<Artist[]> {
  const cats = Object.keys(CATEGORY_QUERIES) as ArtistCategory[];
  const dyn = await Promise.all(cats.map((c) => getDynamicArtists(c)));
  const seen = new Set<string>();
  const out: Artist[] = [];
  for (const a of TOP_ARTISTS) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    out.push(a);
  }
  for (const list of dyn) {
    for (const a of list) {
      if (seen.has(a.slug)) continue;
      seen.add(a.slug);
      out.push(a);
    }
  }
  return out;
}

/** Synchronous read of whatever is already cached (no network). */
export function getCachedMergedArtists(): Artist[] {
  const cached = memCache || readCache()?.data || null;
  if (!cached) return TOP_ARTISTS;
  const seen = new Set<string>();
  const out: Artist[] = [];
  for (const a of TOP_ARTISTS) {
    if (!seen.has(a.slug)) { seen.add(a.slug); out.push(a); }
  }
  for (const list of Object.values(cached)) {
    for (const a of list as Artist[]) {
      if (!seen.has(a.slug)) { seen.add(a.slug); out.push(a); }
    }
  }
  return out;
}
