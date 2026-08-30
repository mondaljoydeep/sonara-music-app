import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Music2, Upload, Settings as SettingsIcon, LogIn, LogOut, Mic2, Headphones, ShieldCheck, Camera, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getLikedSongs, getPlaylists, getRecentlyPlayed } from "@/services/libraryService";
import { getProfile, getTopArtists, getTopLanguage } from "@/services/personalizationService";
import { getSettings, updateSettings, clearAllData, type Settings } from "@/services/settingsService";
import { getMyProfile, updateMyProfile, type Profile as DbProfile } from "@/services/profileService";
import { listMySongs, uploadAvatar, type CreatorSong } from "@/services/communitySongsService";
import { useToast } from "@/context/ToastContext";

const APP_VERSION = "1.0.0";

export default function Profile() {
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);
  const [myUploads, setMyUploads] = useState<CreatorSong[]>([]);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { user, signOut } = useAuth();

  const localProf = getProfile();
  const topArtists = getTopArtists(5);
  const topLang = getTopLanguage();
  const firstPlay = getRecentlyPlayed().slice(-1)[0]?.playedAt;

  useEffect(() => {
    setLikedCount(getLikedSongs().length);
    setPlaylistCount(getPlaylists().length);
    if (user) {
      getMyProfile(user.id).then((p) => {
        setDbProfile(p);
        setBioDraft(p?.bio || "");
        setNameDraft(p?.display_name || "");
      });
      listMySongs(user.id).then(setMyUploads);
    }
  }, [user?.id]);

  const updateSetting = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    updateSettings({ [k]: v } as Partial<Settings>);
    setSettings(getSettings());
  };

  const switchRole = async (role: "listener" | "creator") => {
    if (!user || !dbProfile || dbProfile.role === role) return;
    setSavingProfile(true);
    try {
      const p = await updateMyProfile(user.id, { role });
      setDbProfile(p);
      toast(role === "creator" ? "🎤 Creator mode on" : "🎧 Listener mode");
    } catch (e: any) {
      toast(e?.message || "Failed");
    } finally { setSavingProfile(false); }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const p = await updateMyProfile(user.id, {
        display_name: nameDraft.trim() || null,
        bio: bioDraft.trim() || null,
      });
      setDbProfile(p);
      setEditingBio(false);
      toast("Profile saved");
    } catch (e: any) {
      toast(e?.message || "Failed");
    } finally { setSavingProfile(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    try {
      const url = await uploadAvatar(user.id, f);
      const p = await updateMyProfile(user.id, { avatar_url: url });
      setDbProfile(p);
      toast("Avatar updated");
    } catch (err: any) {
      toast(err?.message || "Upload failed");
    }
  };

  const ytUsage = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("yt_daily_usage") || "{}");
      return u.counts || [0, 0];
    } catch { return [0, 0]; }
  })();
  const QUOTA = 9000;

  return (
    <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
      <Helmet>
        <title>Your Profile — Preferences & Settings | Sonara</title>
        <meta name="description" content="Manage your Sonara profile, listening preferences, favorite artists and account settings." />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/profile" />
        <meta property="og:title" content="Your Sonara Profile" />
        <meta property="og:description" content="Manage your Sonara profile, preferences and favorite artists." />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/profile" />
      </Helmet>
      {/* Header with avatar upload + editable name */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative group">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#1ed760] to-[#0a5c2a] flex items-center justify-center text-3xl sm:text-5xl font-black text-black overflow-hidden">
            {dbProfile?.avatar_url ? (
              <img src={dbProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (dbProfile?.display_name?.[0] || user?.email?.[0] || "S").toUpperCase()
            )}
          </div>
          {user && (
            <>
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center hover:scale-110 transition shadow-lg"
                aria-label="Change avatar"
              >
                <Camera size={14} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#b3b3b3] uppercase tracking-wider flex items-center gap-2">
            Profile
            {dbProfile?.role === "creator" && (
              <span className="inline-flex items-center gap-1 bg-[#1ed760]/15 text-[#1ed760] px-2 py-0.5 rounded-full text-[10px] normal-case tracking-normal">
                <Mic2 size={10} /> AI Creator
                {dbProfile.verified && <ShieldCheck size={10} />}
              </span>
            )}
          </div>
          {editingBio ? (
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={60}
              className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-3 py-1.5 text-xl sm:text-3xl font-black outline-none focus:border-[#1ed760] mt-1"
              placeholder="Your display name"
            />
          ) : (
            <h1 className="text-2xl sm:text-4xl font-black truncate">
              {dbProfile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest Listener"}
            </h1>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#b3b3b3] mt-1">
            <span>{likedCount} liked</span>
            <span>{playlistCount} playlists</span>
            <span>{localProf.totalPlays} played</span>
            {dbProfile?.role === "creator" && <span>{myUploads.length} uploads</span>}
          </div>
        </div>
      </div>

      {/* Bio editor */}
      {user && (
        <section className="mb-6 bg-[#1a1a24] rounded-2xl p-4 border border-white/5">
          {editingBio ? (
            <>
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="Tell the community about yourself…"
                className="w-full bg-[#0f0f17] border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#1ed760] resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  disabled={savingProfile}
                  onClick={saveProfile}
                  className="bg-[#1ed760] text-black text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                >Save</button>
                <button
                  onClick={() => { setEditingBio(false); setBioDraft(dbProfile?.bio || ""); setNameDraft(dbProfile?.display_name || ""); }}
                  className="text-xs text-[#b3b3b3] px-4 py-2"
                >Cancel</button>
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#b3b3b3] flex-1">{dbProfile?.bio || <span className="italic opacity-60">No bio yet — tap edit to add one.</span>}</p>
              <button onClick={() => setEditingBio(true)} className="text-xs text-[#1ed760] hover:underline shrink-0">Edit</button>
            </div>
          )}
        </section>
      )}

      {/* Role switcher */}
      {user && dbProfile && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#b3b3b3] mb-3 flex items-center gap-2">
            <Sparkles size={14} /> Your Sonara mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => switchRole("listener")}
              disabled={savingProfile}
              className={`text-left rounded-2xl p-4 border transition ${
                dbProfile.role === "listener"
                  ? "bg-blue-500/10 border-blue-400/50"
                  : "bg-[#1a1a24] border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-2 font-bold"><Headphones size={16} /> Listener</div>
              <div className="text-xs text-[#b3b3b3] mt-1">Stream, like, queue, follow.</div>
            </button>
            <button
              onClick={() => switchRole("creator")}
              disabled={savingProfile}
              className={`text-left rounded-2xl p-4 border transition ${
                dbProfile.role === "creator"
                  ? "bg-[#1ed760]/10 border-[#1ed760]/60"
                  : "bg-[#1a1a24] border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-2 font-bold"><Mic2 size={16} /> Listener + AI Creator</div>
              <div className="text-xs text-[#b3b3b3] mt-1">Publish AI tracks, get a public artist profile.</div>
            </button>
          </div>
        </section>
      )}

      {/* Account card */}
      <section className="mb-8 bg-gradient-to-br from-[#1a1a24] to-[#0f0f17] rounded-2xl p-5 border border-white/5">
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-[#1ed760] uppercase tracking-wider mb-1">Signed in</div>
              <div className="text-sm text-white truncate">{user.email}</div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-[#b3b3b3] hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="font-semibold mb-0.5">You&apos;re browsing as guest</div>
              <div className="text-xs text-[#b3b3b3]">Listening is free. Sign in to like, save, queue and upload.</div>
            </div>
            <Link to="/login" className="flex items-center gap-2 text-sm font-semibold bg-[#1ed760] text-black px-4 py-2 rounded-full hover:scale-[1.02] transition">
              <LogIn size={16} /> Sign in
            </Link>
          </div>
        )}
      </section>

      {(topArtists.length > 0 || topLang) && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Your Taste</h2>
          {topArtists.length > 0 && (
            <div className="text-sm text-[#b3b3b3] mb-3">You love: <span className="text-white">{topArtists.join(", ")}</span></div>
          )}
          {topLang && (
            <div className="text-sm text-[#b3b3b3] mb-3">Favorite language: <span className="text-white">{topLang}</span></div>
          )}
          {firstPlay && (
            <div className="text-sm text-[#b3b3b3]">Listening since: <span className="text-white">{new Date(firstPlay).toLocaleDateString()}</span></div>
          )}
        </section>
      )}

      {/* Upload entry (creators only) */}
      {dbProfile?.role === "creator" && (
        <section className="mb-10">
          <Link
            to="/upload"
            className="block bg-gradient-to-br from-[#1ed760]/20 via-purple-500/15 to-pink-500/20 border border-[#1ed760]/30 rounded-2xl p-5 hover:border-[#1ed760]/60 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1ed760] flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition">
                <Upload size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-widest text-[#1ed760] font-bold">AI Studio</div>
                <div className="text-lg font-black">Upload your AI track →</div>
                <div className="text-xs text-[#b3b3b3] mt-0.5">{myUploads.length} upload{myUploads.length === 1 ? "" : "s"} · Auto-verified by Sonara AI</div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* My uploads quick list */}
      {dbProfile?.role === "creator" && myUploads.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Music2 size={22} /> My Uploads
          </h2>
          <ul className="space-y-2">
            {myUploads.slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center gap-3 bg-[#1a1a24] rounded-xl p-2 pr-3">
                <div className="w-12 h-12 rounded-md bg-[#22222e] overflow-hidden shrink-0">
                  {s.artwork_url ? <img src={s.artwork_url} alt="" className="w-full h-full object-cover" /> : <Music2 size={20} className="m-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{s.title}</div>
                  <div className="text-[10px] text-[#b3b3b3]">
                    {s.status === "approved" ? "✅ Live" : s.status === "rejected" ? "🚫 Rejected" : "⏳ Pending"}
                    {s.ai_notes && <span className="ml-2 italic">— {s.ai_notes}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/upload" className="text-xs text-[#1ed760] hover:underline mt-3 inline-block">Manage all in AI Studio →</Link>
        </section>
      )}
      <section className="mb-12 max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon size={22} /> Settings
        </h2>
        <div className="space-y-4 bg-[#1a1a24] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Audio Quality</span>
            <select
              value={settings.audioQuality}
              onChange={(e) => updateSetting("audioQuality", e.target.value as Settings["audioQuality"])}
              className="bg-[#22222e] rounded-lg px-3 py-1.5 text-sm outline-none"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Autoplay</span>
            <input
              type="checkbox"
              checked={settings.autoplay}
              onChange={(e) => updateSetting("autoplay", e.target.checked)}
              className="w-5 h-5 accent-[#1ed760]"
            />
          </label>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Crossfade</span>
              <span className="text-xs text-[#b3b3b3]">{settings.crossfade}s</span>
            </div>
            <input
              type="range"
              min={0} max={12} step={1}
              value={settings.crossfade}
              onChange={(e) => updateSetting("crossfade", parseInt(e.target.value))}
              className="w-full accent-[#1ed760]"
            />
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Show lyrics on mini player</span>
            <input
              type="checkbox"
              checked={settings.lyricsOnMini}
              onChange={(e) => updateSetting("lyricsOnMini", e.target.checked)}
              className="w-5 h-5 accent-[#1ed760]"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Show new releases section</span>
            <input
              type="checkbox"
              checked={localStorage.getItem("sonara:hideAds") !== "1"}
              onChange={(e) => {
                if (e.target.checked) localStorage.removeItem("sonara:hideAds");
                else localStorage.setItem("sonara:hideAds", "1");
                toast(e.target.checked ? "Will show on home" : "Hidden from home");
              }}
              className="w-5 h-5 accent-[#1ed760]"
            />
          </label>

          <button
            onClick={() => {
              if (confirm("Clear recently played?")) {
                localStorage.removeItem("sonara_recent");
                toast("Recently played cleared");
              }
            }}
            className="w-full text-left text-sm text-[#b3b3b3] hover:text-white py-2 border-t border-white/5 pt-3"
          >
            Clear recently played
          </button>
          <button
            onClick={() => {
              if (confirm("This will delete ALL Sonara data (likes, playlists, uploads, settings). Continue?")) {
                clearAllData();
                toast("All data cleared");
                setTimeout(() => window.location.reload(), 600);
              }
            }}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 py-2"
          >
            Clear all data
          </button>
        </div>

        <div className="mt-6 bg-[#1a1a24] rounded-xl p-4">
          <div className="text-sm font-semibold mb-3">YouTube API Status</div>
          {ytUsage.map((c: number, i: number) => {
            const pct = Math.min(100, (c / QUOTA) * 100);
            return (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs text-[#b3b3b3] mb-1">
                  <span>Key {i + 1}</span>
                  <span>{c} / {QUOTA}</span>
                </div>
                <div className="h-2 bg-[#22222e] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pct > 80 ? "bg-red-500" : "bg-[#1ed760]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="text-[10px] text-[#535353]">Resets at midnight</div>
        </div>
      </section>

      <section className="mb-12 text-sm text-[#b3b3b3]">
        <div className="font-semibold text-white mb-1">About</div>
        <div>Sonara v{APP_VERSION} — Stream Everything</div>
        <div>Powered by JioSaavn + YouTube + Audius</div>
        <div className="mt-3 flex gap-4">
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
        </div>
      </section>
    </div>
  );
}
