import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Play, Ticket, UserPlus, UserCheck, Share2, Heart, TrendingUp } from "lucide-react";
import {
  findArtistBySlug,
  getArtistImage,
  getArtistTopSongs,
} from "@/services/artistsService";
import {
  followArtist,
  unfollowArtist,
  isFollowing as checkIsFollowing,
  getFollowStats,
  getMonthlyListeners,
  formatCount,
} from "@/services/artistFollowService";
import type { Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { CardSkeletonRow } from "@/components/sections/CardSkeletonRow";
import { useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/components/AuthGate";
import { toast } from "sonner";
import { PersonalizedAdBanner } from "@/components/ads/PersonalizedAdBanner";


export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const artist = id ? findArtistBySlug(id) : undefined;
  const [img, setImg] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const { setQueue } = usePlayer();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();

  const [following, setFollowing] = useState(false);
  const [followStats, setFollowStats] = useState<{ total: number; today: number }>({
    total: 0,
    today: 0,
  });
  const [monthlyListeners, setMonthlyListeners] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!artist) return;
    setTracks(null);
    setImg(null);
    getArtistImage(artist.name).then(setImg);
    getArtistTopSongs(artist.name, 40).then(setTracks);
    setMonthlyListeners(getMonthlyListeners(artist.slug));
    getFollowStats(artist.slug).then(setFollowStats);
    if (user) checkIsFollowing(artist.slug, user.id).then(setFollowing);
    else setFollowing(false);
  }, [artist?.slug, user?.id]);

  // Live realtime subscription so followers count updates simultaneously
  useEffect(() => {
    if (!artist) return;
    const refresh = () => getFollowStats(artist.slug).then(setFollowStats);
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [artist?.slug]);

  if (!artist) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-[#b3b3b3]">Artist not found.</p>
        <Link to="/" className="text-[#1ed760] underline mt-4 inline-block">
          Back home
        </Link>
      </div>
    );
  }

  const ticketsUrl = `https://www.google.com/search?q=${encodeURIComponent(
    artist.name + " tour tickets"
  )}`;
  const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(
    artist.name + " latest news"
  )}`;

  const handleFollow = async () => {
    if (!requireAuth("Follow artists")) return;
    if (!user || busy) return;
    setBusy(true);
    try {
      if (following) {
        await unfollowArtist(artist.slug, user.id);
        setFollowing(false);
        setFollowStats((s) => ({ ...s, total: Math.max(0, s.total - 1), today: Math.max(0, s.today - 1) }));
        toast(`Unfollowed ${artist.name}`);
      } else {
        await followArtist(artist.slug, user.id);
        setFollowing(true);
        setFollowStats((s) => ({ total: s.total + 1, today: s.today + 1 }));
        toast.success(`Following ${artist.name}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not update");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: artist.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  };

  const desc = `Listen to ${artist.name} on Sonara — top songs, popular tracks, and the latest releases.`.slice(0, 158);
  const canonical = `/artist/${artist.slug}`;

  return (
    <div className="pb-10">
      <Helmet>
        <title>{`${artist.name} — Songs & Top Tracks | Sonara`.slice(0, 60)}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${artist.name} on Sonara`} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="profile" />
        {img && <meta property="og:image" content={img} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          name: artist.name,
          ...(img ? { image: img } : {}),
          url: `https://sonora-rhythm.lovable.app/artist/${artist.slug}`,
        })}</script>
      </Helmet>
      {/* Hero */}
      <div className="relative h-80 sm:h-[28rem] overflow-hidden">
        {img && (
          <img
            src={img}
            alt={`Portrait of ${artist.name}`}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/60 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(236,72,153,0.25),transparent_60%)]" />
        <Link
          to="/"
          aria-label="Back to home"
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70"
        >
          <ArrowLeft size={20} />
        </Link>
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>

        <div className="relative h-full flex items-end px-4 sm:px-6 lg:px-12 xl:px-16 pb-6">
          <div className="flex items-end gap-5 w-full">
            {img ? (
              <img
                src={img}
                alt={`${artist.name} artist photo on Sonara`}
                className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
              />
            ) : (
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl ring-2 ring-white/20 flex items-center justify-center text-4xl font-black">
                {artist.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded">
                  ✓ Verified Artist
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg mt-1 truncate">
                {artist.name}
              </h1>
              <p className="text-sm text-white/80 mt-1">
                <span className="font-semibold text-white">
                  {formatCount(monthlyListeners)}
                </span>{" "}
                monthly listeners
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 -mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => tracks && tracks.length > 0 && setQueue(tracks, 0)}
          className="flex items-center gap-2 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold px-5 py-2.5 rounded-full transition disabled:opacity-50 shadow-lg shadow-[#1ed760]/20"
          disabled={!tracks || tracks.length === 0}
        >
          <Play size={18} fill="currentColor" /> Play
        </button>
        <button
          onClick={handleFollow}
          disabled={busy}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition border ${
            following
              ? "bg-[#1ed760]/15 border-[#1ed760]/60 text-[#1ed760]"
              : "bg-white/5 hover:bg-white/15 border-white/20 text-white"
          }`}
        >
          {following ? <UserCheck size={18} /> : <UserPlus size={18} />}
          {following ? "Following" : "Follow"}
        </button>
        <a
          href={ticketsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-5 py-2.5 rounded-full transition border border-white/10"
        >
          <Ticket size={18} /> Tickets
        </a>
        <a
          href={newsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-5 py-2.5 rounded-full transition border border-white/10"
        >
          <TrendingUp size={18} /> News
        </a>
      </div>

      {/* Live stats banner */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Followers" value={formatCount(followStats.total)} accent="from-pink-500/30 to-rose-500/10" />
        <StatCard
          label="New today"
          value={`+${formatCount(followStats.today)}`}
          accent="from-emerald-500/30 to-emerald-500/5"
          live
        />
        <StatCard label="Monthly listeners" value={formatCount(monthlyListeners)} accent="from-purple-500/30 to-fuchsia-500/10" />
        <StatCard label="Top songs" value={String(tracks?.length ?? "—")} accent="from-sky-500/30 to-blue-500/10" />
      </section>

      <div className="mt-6">
        <PersonalizedAdBanner variant="wide" contextArtist={artist.name} />
      </div>


      {/* Songs */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Heart size={20} className="text-pink-400" /> Top Songs
        </h2>
        {!tracks && <CardSkeletonRow />}
        {tracks && tracks.length === 0 && (
          <p className="text-[#b3b3b3]">No songs found for this artist.</p>
        )}
        {tracks && tracks.length > 0 && (
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <TrackCard
                key={t.id}
                track={t}
                index={i}
                showIndex
                onPlay={() => setQueue(tracks, i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* About / extra banner */}
      {img && (
        <section className="mx-4 sm:mx-6 lg:mx-12 xl:mx-16 mb-10 relative rounded-2xl overflow-hidden h-48 sm:h-64">
          <img src={img} alt={`${artist.name} background artwork`} className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="relative h-full flex items-center px-6 sm:px-10 max-w-2xl">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">About</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">{artist.name}</h3>
              <p className="text-sm text-white/80 mt-2 line-clamp-3">
                Discover the world of {artist.name} — top hits, new releases, live concerts and the latest news, all in one place on Sonara.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  live,
}: {
  label: string;
  value: string;
  accent: string;
  live?: boolean;
}) {
  return (
    <div className={`relative rounded-xl p-4 bg-gradient-to-br ${accent} border border-white/10 backdrop-blur`}>
      {live && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      )}
      <p className="text-xs text-white/70">{label}</p>
      <p className="text-xl sm:text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
