import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  Sparkles,
  ShieldCheck,
  Music4,
  Mic2,
  Image as ImageIcon,
  FileAudio,
  Wand2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { uploadCreatorSong, listMySongs, deleteSong, type CreatorSong } from "@/services/communitySongsService";
import { getMyProfile, type Profile } from "@/services/profileService";
import { pushNotification } from "@/services/notificationsService";
import { usePlayer } from "@/context/PlayerContext";

const GENRES = ["Pop", "Hip-Hop", "EDM", "Lo-Fi", "Rock", "R&B", "Bollywood", "Indie", "Classical", "Country", "Jazz", "Ambient", "Synthwave"];
const MOODS = ["Energetic", "Chill", "Sad", "Romantic", "Dark", "Uplifting", "Dreamy", "Aggressive"];
const VOCAL_STYLES = ["Male AI", "Female AI", "Duet AI", "Instrumental", "Choir AI", "Rapper AI"];

export default function UploadPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { setQueue } = usePlayer();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [vocal, setVocal] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [mySongs, setMySongs] = useState<CreatorSong[]>([]);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      nav("/login", { replace: true });
      return;
    }
    getMyProfile(user.id).then(setProfile);
    listMySongs(user.id).then(setMySongs);
  }, [user?.id]);

  useEffect(() => {
    if (!cover) { setCoverPreview(null); return; }
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  useEffect(() => {
    if (!audio) { setAudioPreview(null); return; }
    const url = URL.createObjectURL(audio);
    setAudioPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [audio]);

  const isCreator = profile?.role === "creator";

  const validAudio = (f: File) =>
    /audio\/(mpeg|mp3|wav|flac|ogg|x-m4a|mp4|aac)/.test(f.type) || /\.(mp3|wav|flac|ogg|m4a)$/i.test(f.name);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files);
    const a = files.find(validAudio);
    const c = files.find((f) => f.type.startsWith("image/"));
    if (a) setAudio(a);
    if (c) setCover(c);
    if (!a && !c) toast("Drop an audio or image file");
  };

  const suggestTitle = () => {
    const adj = ["Neon", "Midnight", "Velvet", "Crystal", "Phantom", "Lunar", "Echo", "Solar"];
    const noun = ["Dreams", "Pulse", "Heart", "Skies", "Tide", "Rain", "Rush", "Ghost"];
    setTitle(`${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]}`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isCreator) {
      toast("Switch to Creator role in Profile to upload");
      return;
    }
    if (!title.trim() || !audio) {
      toast("Title and audio file are required");
      return;
    }
    setBusy(true);
    setProgress(5);
    try {
      const song = await uploadCreatorSong(
        user.id,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          genre: genre || undefined,
          mood: mood || undefined,
          vocalStyle: vocal || undefined,
          lyrics: lyrics.trim() || undefined,
          audioFile: audio,
          artworkFile: cover,
        },
        setProgress,
      );
      if (song.status === "approved") {
        toast("✅ Approved by Sonara AI — live on the Community!");
        await pushNotification(user.id, {
          title: `✨ "${song.title}" is live`,
          body: "Sonara AI approved your track. It's now visible on the Community page.",
          type: "upload_approved",
          link: "/community",
        });
      } else {
        toast("❌ Rejected by Sonara AI — see notes below");
        await pushNotification(user.id, {
          title: `🚫 "${song.title}" needs changes`,
          body: song.ai_notes || "Please review and re-upload.",
          type: "upload_rejected",
        });
      }
      setTitle(""); setDescription(""); setGenre(""); setMood(""); setVocal(""); setLyrics("");
      setAudio(null); setCover(null);
      if (audioRef.current) audioRef.current.value = "";
      if (coverRef.current) coverRef.current.value = "";
      const all = await listMySongs(user.id);
      setMySongs(all);
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Upload failed");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const removeMine = async (id: string) => {
    if (!confirm("Delete this song?")) return;
    await deleteSong(id);
    setMySongs((prev) => prev.filter((s) => s.id !== id));
    toast("Deleted");
  };

  const playMine = (idx: number) => {
    const list = mySongs.filter((s) => s.status === "approved");
    if (!list.length) return;
    setQueue(
      list.map((s) => ({
        id: `cs_${s.id}`,
        title: s.title,
        artist: profile?.display_name || "You",
        artwork: s.artwork_url,
        audioUrl: s.audio_url,
        duration: s.duration_sec ?? null,
        source: "uploaded",
        genre: s.genre || null,
        uploadedAt: new Date(s.created_at).getTime(),
      })),
      idx,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f] to-[#13131f] text-white pb-24">
      {/* Hero */}
      <div className="relative px-4 sm:px-8 lg:px-16 pt-6 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1ed760]/15 via-purple-500/10 to-pink-500/15 blur-3xl opacity-60 -z-10" />
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-1 text-sm text-[#b3b3b3] hover:text-white mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-widest mb-2">
          <Sparkles size={14} /> AI Song Studio
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Drop your AI track.</h1>
        <p className="text-[#b3b3b3] mt-2 max-w-lg text-sm sm:text-base">
          Upload, tag and publish to the Sonara Community. Every song is verified by Sonara AI before going live.
        </p>
        {!isCreator && (
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs px-3 py-2 rounded-full">
            ⚠️ Switch to Creator role on your Profile to enable publishing.
          </div>
        )}
      </div>

      <div className="px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============== UPLOAD FORM ============== */}
        <form onSubmit={submit} className="lg:col-span-2 space-y-5">
          {/* Drop zone with cover preview */}
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
            <label
              className="relative aspect-square sm:w-[180px] rounded-2xl border-2 border-dashed border-white/10 hover:border-[#1ed760]/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 overflow-hidden cursor-pointer flex items-center justify-center group"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-[#b3b3b3] text-xs px-3">
                  <ImageIcon size={28} className="mx-auto mb-2 opacity-70" />
                  Cover art
                  <div className="text-[10px] opacity-60 mt-1">Square JPG/PNG</div>
                </div>
              )}
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setCover(e.target.files?.[0] || null)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-xs font-semibold">Change</span>
              </div>
            </label>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 transition flex flex-col justify-center ${
                drag ? "border-[#1ed760] bg-[#1ed760]/5" : "border-white/10 bg-[#1a1a24]"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1ed760] mb-2">
                <FileAudio size={14} /> AUDIO FILE
              </div>
              {audio ? (
                <>
                  <div className="text-sm font-semibold truncate">{audio.name}</div>
                  <div className="text-[10px] text-[#b3b3b3] mt-1">
                    {(audio.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                  {audioPreview && (
                    <audio
                      src={audioPreview}
                      controls
                      className="mt-3 w-full h-9 [&::-webkit-media-controls-panel]:bg-[#22222e]"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm text-[#b3b3b3]">Drag & drop or click below</div>
                  <div className="text-[10px] text-[#535353] mt-1">MP3 · WAV · FLAC · OGG · M4A</div>
                </>
              )}
              <label className="mt-3 inline-flex w-fit items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs cursor-pointer">
                <UploadIcon size={12} /> Choose file
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={(e) => setAudio(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* Title + AI suggest */}
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title *"
              aria-label="Song title"
              maxLength={120}
              className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-base font-semibold outline-none focus:border-[#1ed760] pr-28"
            />
            <button
              type="button"
              onClick={suggestTitle}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#1ed760] hover:bg-[#1ed760]/10 px-2.5 py-1.5 rounded-full flex items-center gap-1"
            >
              <Wand2 size={12} /> Suggest
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the vibe… (optional, 280 chars)"
            maxLength={280}
            rows={2}
            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1ed760] resize-none"
          />

          {/* Chips */}
          <div className="space-y-3">
            <ChipGroup label="Genre" icon={<Music4 size={12} />} options={GENRES} value={genre} onChange={setGenre} />
            <ChipGroup label="Mood" icon={<Sparkles size={12} />} options={MOODS} value={mood} onChange={setMood} />
            <ChipGroup label="Vocal" icon={<Mic2 size={12} />} options={VOCAL_STYLES} value={vocal} onChange={setVocal} />
          </div>

          <details className="bg-[#1a1a24] border border-white/10 rounded-xl">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold flex items-center gap-2">
              📝 Lyrics (optional, helps Sonara AI verify faster)
            </summary>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste lyrics here…"
              rows={6}
              maxLength={6000}
              className="w-full bg-transparent px-4 pb-4 text-sm outline-none resize-y"
            />
          </details>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1ed760] to-purple-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-[#b3b3b3] flex items-center gap-2">
                {busy && <Loader2 size={12} className="animate-spin" />}
                {progress < 55 ? "Uploading audio…" :
                  progress < 70 ? "Uploading artwork…" :
                  progress < 85 ? "Sonara AI is verifying…" :
                  progress < 100 ? "Saving…" : "Done!"}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !isCreator}
            className="w-full bg-gradient-to-r from-[#1ed760] to-emerald-400 text-black font-bold rounded-full py-3.5 text-base hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <UploadIcon size={18} />}
            {busy ? "Publishing…" : "Publish to Sonara Community"}
          </button>

          <div className="text-[11px] text-[#535353] text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} /> Verified by Sonara AI · See <Link to="/terms" className="underline">community terms</Link>
          </div>
        </form>

        {/* ============== SIDEBAR ============== */}
        <aside className="space-y-4">
          <div className="bg-gradient-to-br from-[#1ed760]/10 to-purple-500/10 border border-[#1ed760]/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> AI Safety Rules
            </div>
            <ul className="text-xs text-[#b3b3b3] space-y-1.5">
              <li>✅ Original AI music welcome</li>
              <li>✅ Profanity, romance, dark moods allowed</li>
              <li>❌ Hate speech, CSAM, real-world violence</li>
              <li>❌ Doxxing or illegal content</li>
              <li>⚡ Auto-decision in ~5 seconds</li>
            </ul>
          </div>

          <div className="bg-[#1a1a24] rounded-2xl p-4">
            <div className="text-sm font-bold mb-3">Your uploads ({mySongs.length})</div>
            {mySongs.length === 0 ? (
              <div className="text-xs text-[#b3b3b3]">No uploads yet. Drop your first track!</div>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {mySongs.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => playMine(i)}
                      disabled={s.status !== "approved"}
                      className="w-10 h-10 rounded-md bg-[#22222e] overflow-hidden shrink-0 disabled:opacity-50"
                    >
                      {s.artwork_url ? (
                        <img src={s.artwork_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music4 size={16} className="m-auto" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{s.title}</div>
                      <div className="text-[10px] flex items-center gap-1 mt-0.5">
                        {s.status === "approved" ? (
                          <><CheckCircle2 size={10} className="text-[#1ed760]" /><span className="text-[#1ed760]">Live</span></>
                        ) : s.status === "rejected" ? (
                          <><XCircle size={10} className="text-red-400" /><span className="text-red-400">Rejected</span></>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMine(s.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/community"
            className="block bg-[#1a1a24] hover:bg-[#22222e] rounded-2xl p-4 text-sm transition"
          >
            <div className="font-bold mb-1">Explore the Community →</div>
            <div className="text-xs text-[#b3b3b3]">Discover AI artists worldwide</div>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function ChipGroup({
  label, icon, options, value, onChange,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#b3b3b3] flex items-center gap-1 mb-1.5">
        {icon} {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => onChange(value === o ? "" : o)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
              value === o
                ? "bg-[#1ed760] text-black border-[#1ed760]"
                : "bg-[#1a1a24] text-[#b3b3b3] border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
