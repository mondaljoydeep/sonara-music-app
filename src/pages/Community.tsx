import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, ShieldCheck, Mic2, Music4, ArrowLeft } from "lucide-react";
import { listCreators, type Profile } from "@/services/profileService";
import { listApprovedSongs, type CreatorSong, songToTrack } from "@/services/communitySongsService";
import { usePlayer } from "@/context/PlayerContext";
import { TrackCard } from "@/components/cards/TrackCard";

export default function Community() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [songs, setSongs] = useState<(CreatorSong & { creator?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue } = usePlayer();

  useEffect(() => {
    (async () => {
      const [c, s] = await Promise.all([listCreators(), listApprovedSongs(60)]);
      const byUser = new Map(c.map((p) => [p.user_id, p]));
      setCreators(c);
      setSongs(s.map((song) => ({ ...song, creator: byUser.get(song.user_id) })));
      setLoading(false);
    })();
  }, []);

  const playAll = (idx: number) => {
    setQueue(
      songs.map((s) => songToTrack(s, s.creator?.display_name || "AI Creator")),
      idx,
    );
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sonara Community AI Artists",
    itemListElement: creators.slice(0, 20).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://sonora-rhythm.lovable.app/creator/${c.user_id}`,
      name: c.display_name || "AI Creator",
    })),
  };

  return (
    <div className="min-h-full pb-20">
      <Helmet>
        <title>Sonara Community — AI Artists & Independent Creators</title>
        <meta name="description" content="Discover independent AI artists on Sonara. Every community track is verified by Sonara AI before going live." />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/community" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sonara Community — AI Artists & Independent Creators" />
        <meta property="og:description" content="Discover independent AI artists on Sonara. Every community track is verified by Sonara AI before going live." />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/community" />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>
      {/* Hero */}
      <div className="relative px-4 sm:px-8 lg:px-16 pt-6 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1ed760]/20 via-purple-500/15 to-pink-500/20 blur-3xl opacity-60 -z-10" />
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-[#b3b3b3] hover:text-white mb-3">
          <ArrowLeft size={14} /> Home
        </Link>
        <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-widest mb-2">
          <Sparkles size={14} /> Sonara Community
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">AI Artists, Live.</h1>
        <p className="text-[#b3b3b3] mt-2 text-sm sm:text-base max-w-xl">
          Real creators publishing AI-generated tracks. Every song verified by Sonara AI before going live.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 bg-[#1ed760]/15 text-[#1ed760] px-2.5 py-1 rounded-full">
            <ShieldCheck size={12} /> {creators.length} AI artists
          </span>
          <span className="inline-flex items-center gap-1 bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-full">
            <Music4 size={12} /> {songs.length} tracks
          </span>
        </div>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 lg:px-16 text-[#b3b3b3] text-sm">Loading community…</div>
      ) : (
        <>
          {/* AI Artists */}
          <section className="px-4 sm:px-8 lg:px-16 mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">🎤 AI Artists</h2>
            {creators.length === 0 ? (
              <div className="text-sm text-[#b3b3b3]">
                No AI artists yet.{" "}
                <Link to="/upload" className="text-[#1ed760] hover:underline">Be the first to publish →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {creators.map((c) => (
                  <Link
                    key={c.id}
                    to={`/creator/${c.user_id}`}
                    className="group bg-gradient-to-br from-[#1a1a24] to-[#0f0f17] rounded-2xl p-3 hover:from-[#22222e] hover:to-[#171723] transition border border-white/5 hover:border-white/20"
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-600/40 to-pink-500/40 overflow-hidden ring-1 ring-white/10 mb-2 relative">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.display_name || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                          {(c.display_name || "?")[0].toUpperCase()}
                        </div>
                      )}
                      {c.verified && (
                        <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-[#1ed760] rounded-full flex items-center justify-center">
                          <ShieldCheck size={11} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold truncate flex items-center gap-1">
                      <Mic2 size={11} className="text-[#1ed760] shrink-0" />
                      <span className="truncate">{c.display_name || "Unnamed"}</span>
                    </div>
                    {c.bio && <div className="text-[10px] text-[#b3b3b3] mt-1 line-clamp-2">{c.bio}</div>}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Latest Songs */}
          {songs.length > 0 && (
            <section className="px-4 sm:px-8 lg:px-16 mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">🆕 Latest Drops</h2>
              <div className="space-y-1">
                {songs.map((s, i) => (
                  <TrackCard
                    key={s.id}
                    track={songToTrack(s, s.creator?.display_name || "AI Creator")}
                    onPlay={() => playAll(i)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
