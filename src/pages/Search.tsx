import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { searchYouTube } from "@/services/youtubeService";
import { searchAudius } from "@/services/audiusService";
import { searchSaavn } from "@/services/saavnService";
import { TOP_ARTISTS, type Artist } from "@/services/artistsService";
import { getCachedMergedArtists, getAllArtistsMerged } from "@/services/dynamicArtistsService";
import type { Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { CardSkeletonRow } from "@/components/sections/CardSkeletonRow";
import { PersonalizedAdBanner } from "@/components/ads/PersonalizedAdBanner";


const GENRES = [
  { name: "Bollywood", cls: "gradient-bollywood" },
  { name: "Pop", cls: "gradient-pop" },
  { name: "Hip-Hop", cls: "gradient-hiphop" },
  { name: "Rock", cls: "gradient-rock" },
  { name: "Electronic", cls: "gradient-electronic" },
  { name: "Jazz", cls: "gradient-jazz" },
  { name: "Classical", cls: "gradient-classical" },
  { name: "Lo-Fi", cls: "gradient-lofi" },
  { name: "K-Pop", cls: "gradient-kpop" },
  { name: "R&B", cls: "gradient-rnb" },
  { name: "Punjabi", cls: "gradient-punjabi" },
  { name: "Tamil", cls: "gradient-tamil" },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<Track[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { setQueue } = usePlayer();
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const q = params.get("q") || "";
    if (q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Saavn first — resolve independently so we render as soon as it's ready,
    // then append YouTube + Audius. Guarantees Indian + international Saavn
    // results always sit on top of the list.
    const [js, yt, au] = await Promise.allSettled([
      searchSaavn(q, 25),
      searchYouTube(q, 15),
      searchAudius(q, 10),
    ]);
    const jsRes = js.status === "fulfilled" ? js.value : [];
    const ytRes = yt.status === "fulfilled" ? yt.value : [];
    const auRes = au.status === "fulfilled" ? au.value : [];
    const seen = new Set<string>();
    const merged: Track[] = [];
    for (const t of [...jsRes, ...ytRes, ...auRes]) {
      const key = `${t.title}::${t.artist}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(t);
    }
    setResults(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void runSearch(query);
      if (query) setParams({ q: query }, { replace: true });
      else setParams({}, { replace: true });
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="pt-4">
      <Helmet>
        <title>Search music, artists & albums | Sonara</title>
        <meta name="description" content="Search millions of songs, artists, and albums across JioSaavn, YouTube, and Audius on Sonara." />
        <link rel="canonical" href="/search" />
        <meta property="og:title" content="Search music on Sonara" />
        <meta property="og:description" content="Search millions of songs, artists, and albums on Sonara." />
        <meta property="og:url" content="/search" />
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16">
        <h1 className="sr-only">Search music, artists, and albums on Sonara</h1>
        <div className="flex items-center gap-2 bg-[#1a1a24] border border-white/5 rounded-full px-4 py-3 max-w-2xl">
          <SearchIcon size={20} className="text-[#b3b3b3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists…"
            aria-label="Search songs, artists and albums"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#b3b3b3]"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[#b3b3b3] hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 mt-6">
        {!query && (
          <>
            <PersonalizedAdBanner variant="compact" className="mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {GENRES.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setQuery(g.name)}
                  className={`relative aspect-[16/10] rounded-xl overflow-hidden ${g.cls} text-left p-4 hover:scale-[1.02] transition`}
                >
                  <span className="font-black text-lg sm:text-xl text-white drop-shadow">
                    {g.name}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {query && <ArtistMatches query={query} />}
        {query && <PersonalizedAdBanner variant="compact" contextQuery={query} className="mb-4" />}
        {query && loading && <CardSkeletonRow count={4} />}
        {query && !loading && results && results.length === 0 && (
          <div className="text-[#b3b3b3] mt-6">No results for "{query}"</div>
        )}
        {query && results && results.length > 0 && (
          <div className="space-y-1 mt-2">
            {results.map((t, i) => (
              <TrackCard
                key={t.id}
                track={t}
                index={i}
                showIndex
                onPlay={() => setQueue(results, i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistMatches({ query }: { query: string }) {
  const [pool, setPool] = useState<Artist[]>(() => getCachedMergedArtists());
  useEffect(() => {
    getAllArtistsMerged().then(setPool);
  }, []);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return pool.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query, pool]);
  if (matches.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-[#b3b3b3] mb-2 mt-2">Artists</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {matches.map((a) => (
          <Link
            key={a.slug}
            to={`/artist/${a.slug}`}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold"
          >
            {a.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

