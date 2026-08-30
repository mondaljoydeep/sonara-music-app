import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ShieldCheck, Mic2, Share2, Play, Pause, Shuffle, ListPlus } from "lucide-react";
import { getProfileByUserId, type Profile } from "@/services/profileService";
import { listSongsByCreator, type CreatorSong, songToTrack } from "@/services/communitySongsService";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { toast } from "sonner";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [songs, setSongs] = useState<CreatorSong[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue, addToQueue, togglePlay, toggleShuffle, track: current, isPlaying } = usePlayer();

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [p, s] = await Promise.all([getProfileByUserId(id), listSongsByCreator(id)]);
      setProfile(p);
      setSongs(s);
      setLoading(false);
    })();
  }, [id]);

  const tracks = useMemo(
    () => songs.map((s) => songToTrack(s, profile?.display_name || "AI Creator")),
    [songs, profile?.display_name],
  );

  const isCreatorPlaying = !!current && tracks.some((t) => t.id === current.id) && isPlaying;

  const playFrom = (idx: number) => {
    const t = tracks[idx];
    if (current?.id === t.id) { togglePlay(); return; }
    setQueue(tracks, idx);
  };

  const playAll = () => {
    if (!tracks.length) return;
    if (isCreatorPlaying) { togglePlay(); return; }
    if (current && tracks.some((t) => t.id === current.id)) { togglePlay(); return; }
    setQueue(tracks, 0);
  };

  const shufflePlay = () => {
    if (!tracks.length) return;
    toggleShuffle();
    setQueue(tracks, Math.floor(Math.random() * tracks.length));
  };

  const queueAll = () => {
    tracks.forEach((t) => addToQueue(t));
    toast.success(`Added ${tracks.length} track${tracks.length === 1 ? "" : "s"} to queue`);
  };

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: profile?.display_name || "AI Creator", url }).catch(() => {});
    else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  if (loading) return <div className="p-8 text-[#b3b3b3]">Loading…</div>;
  if (!profile) return (
    <div className="p-8 text-center">
      <div className="text-xl font-bold mb-2">Creator not found</div>
      <Link to="/community" className="text-[#1ed760] hover:underline">← Back to community</Link>
    </div>
  );

  const canonical = `https://sonora-rhythm.lovable.app/creator/${id}`;
  const name = profile.display_name || "AI Creator";
  const desc = profile.bio || `${name} is an independent AI music creator on Sonara with ${songs.length} approved track${songs.length === 1 ? "" : "s"}.`;
  const personLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name,
    description: desc,
    url: canonical,
    ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
  };

  return (
    <div className="min-h-full pb-20">
      <Helmet>
        <title>{`${name} — AI Creator on Sonara`}</title>
        <meta name="description" content={desc.slice(0, 155)} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${name} — AI Creator on Sonara`} />
        <meta property="og:description" content={desc.slice(0, 155)} />
        <meta property="og:url" content={canonical} />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
        <script type="application/ld+json">{JSON.stringify(personLd)}</script>
      </Helmet>
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]" />
        <Link to="/community" className="absolute top-4 left-4 sm:left-8 flex items-center gap-1 text-xs text-white/80 hover:text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
          <ArrowLeft size={14} /> Community
        </Link>
      </div>
      <div className="-mt-20 sm:-mt-24 px-4 sm:px-8 lg:px-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden ring-4 ring-[#0a0a0f] bg-gradient-to-br from-purple-600 to-pink-500 shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-black">
                {(profile.display_name || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1ed760] mb-1">
              <Mic2 size={12} /> AI Creator
              {profile.verified && <span className="inline-flex items-center gap-1 bg-[#1ed760] text-black px-2 py-0.5 rounded-full text-[10px]"><ShieldCheck size={10} /> Verified</span>}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black truncate">{profile.display_name || "Unnamed"}</h1>
            {profile.bio && <p className="text-sm text-[#b3b3b3] mt-2 max-w-2xl">{profile.bio}</p>}
            <div className="text-xs text-[#b3b3b3] mt-2">{songs.length} approved track{songs.length === 1 ? "" : "s"}</div>
          </div>
          <button onClick={share} className="self-start sm:self-end flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <section className="px-4 sm:px-8 lg:px-16 mt-8">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold">Tracks</h2>
          {songs.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={playAll}
                className="flex items-center gap-2 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold px-5 py-2.5 rounded-full text-sm shadow-lg hover:scale-[1.03] transition"
                aria-label={isCreatorPlaying ? "Pause" : "Play all"}
              >
                {isCreatorPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                {isCreatorPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={shufflePlay}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-sm"
              >
                <Shuffle size={14} /> Shuffle
              </button>
              <button
                onClick={queueAll}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-sm"
              >
                <ListPlus size={14} /> Queue all
              </button>
            </div>
          )}
        </div>
        {songs.length === 0 ? (
          <div className="text-sm text-[#b3b3b3]">No public tracks yet.</div>
        ) : (
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <TrackCard
                key={t.id}
                track={t}
                index={i}
                showIndex
                onPlay={() => playFrom(i)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
