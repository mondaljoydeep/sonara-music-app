import { ScrollRow } from "@/components/sections/ScrollRow";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { TopBar } from "@/components/layout/TopBar";
import { InstallButton } from "@/components/InstallButton";
import sonaraLogo from "@/assets/sonara-logo.jpg";
import { HorizontalScroll } from "@/components/sections/HorizontalScroll";
import { searchSaavn, SAAVN_HOME_QUERIES } from "@/services/saavnService";
import { getBannerForSection } from "@/services/bannerRegistry";

import { TopArtists } from "@/components/sections/TopArtists";
import { NewReleasesAds } from "@/components/sections/NewReleasesAds";
import { getRecentlyPlayed, getUploads } from "@/services/libraryService";
import { getProfile, getPersonalizedQueries, getPersonalizedTrendingQuery } from "@/services/personalizationService";
import type { Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { NewReleasesAuto } from "@/components/sections/NewReleasesAuto";
import { PersonalizedAdBanner } from "@/components/ads/PersonalizedAdBanner";
import { AdvancedToolsBar } from "@/components/sections/AdvancedToolsBar";
import { Hero3DBackdrop } from "@/components/sections/Hero3DBackdrop";
import { AIDjButton } from "@/components/AIDjButton";
import { SceneModes } from "@/components/sections/SceneModes";


function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function matchesFilter(t: Track, filter: string): boolean {
  if (filter === "All") return true;
  const text = `${t.title} ${t.artist} ${t.genre || ""}`.toLowerCase();
  return text.includes(filter.toLowerCase());
}

export default function Home() {
  const [filter, setFilter] = useState("All");
  const [recent, setRecent] = useState<Track[]>([]);
  const [uploads, setUploads] = useState<Track[]>([]);
  const { setQueue } = usePlayer();
  const profile = getProfile();
  const personalized = useMemo(() => getPersonalizedQueries(), [profile.totalPlays]);

  useEffect(() => {
    setRecent(getRecentlyPlayed());
    setUploads(getUploads());
  }, []);

  const queries = useMemo(() => {
    if (filter === "All") return SAAVN_HOME_QUERIES;
    return SAAVN_HOME_QUERIES.filter((q) =>
      q.label.toLowerCase().includes(filter.toLowerCase()) ||
      q.query.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const filteredRecent = recent.filter((t) => matchesFilter(t, filter));

  return (
    <div>
      <Helmet>
        <title>Sonara — Feel Every Beat. Stream Music Worldwide</title>
        <meta name="description" content="Discover trending songs, top artists, and personalized playlists across Bollywood, Pop, Hip-Hop, K-Pop and more on Sonara." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Sonara — Feel Every Beat" />
        <meta property="og:description" content="Discover trending songs, top artists, and personalized playlists worldwide." />
        <meta property="og:url" content="/" />
      </Helmet>
      <TopBar filter={filter} onFilterChange={setFilter} />

      {/* Hero with 3D backdrop — kept lean so overlays never merge with content below */}
      <div className="relative isolate overflow-hidden">
        <Hero3DBackdrop />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-16 pt-6 pb-6 flex items-center gap-4">
          <div className="relative [perspective:800px] flex-shrink-0">
            <img
              src={sonaraLogo}
              alt="Sonara — Feel Every Beat"
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-[0_20px_60px_rgba(120,80,255,0.5)] animate-[tilt3d_6s_ease-in-out_infinite] [transform-style:preserve-3d]"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-[#1ed760] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(30,215,96,0.25)] leading-tight">
              Sonara — Feel Every Beat
            </h1>
            <p className="text-xs sm:text-base text-[#b3b3b3] mt-1 truncate">{greeting()}. Discover what's playing worldwide.</p>
          </div>
        </div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-16 pb-6">
          <AIDjButton variant="hero" />
        </div>
        <style>{`
          @keyframes tilt3d {
            0%,100% { transform: rotateY(-8deg) rotateX(6deg); }
            50%     { transform: rotateY(8deg) rotateX(-4deg); }
          }
        `}</style>
      </div>

      {/* Tools bar sits OUTSIDE the hero (own stacking context) so dialogs never merge with backdrop */}
      <InstallButton />
      <SceneModes />
      <AdvancedToolsBar />



      {filteredRecent.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">🕐 Continue Listening</h2>
          <ScrollRow>
            {filteredRecent.slice(0, 15).map((t, i) => (
              <TrackCard
                key={t.id + "_" + i}
                track={t}
                variant="grid"
                onPlay={() => setQueue(filteredRecent, i)}
              />
            ))}
          </ScrollRow>
        </section>
      )}

      <HorizontalScroll
        title="🔥 Trending For You"
        fetcher={() => searchSaavn(getPersonalizedTrendingQuery(), 20)}
        lazy={false}
        banner={getBannerForSection("trending")}
      />

      <PersonalizedAdBanner variant="wide" />

      <NewReleasesAds />

      <TopArtists />

      <NewReleasesAuto />

      <PersonalizedAdBanner variant="wide" />

      {queries.map((q) => (
        <HorizontalScroll
          key={q.id}
          title={q.label}
          fetcher={() => searchSaavn(q.query, 15)}
          banner={getBannerForSection(q.id)}
        />
      ))}

      {profile.totalPlays >= 5 && personalized.length > 0 && (
        <>
          <PersonalizedAdBanner variant="wide" />
          {personalized.map((p) => (
            <HorizontalScroll
              key={p.label}
              title={p.label}
              fetcher={() => searchSaavn(p.query, 15)}
            />
          ))}
        </>
      )}


      {uploads.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">⬆️ Community Uploads</h2>
          <ScrollRow>
            {uploads.map((t, i) => (
              <TrackCard key={t.id} track={t} variant="grid" onPlay={() => setQueue(uploads, i)} />
            ))}
          </ScrollRow>
        </section>
      )}
    </div>
  );
}
