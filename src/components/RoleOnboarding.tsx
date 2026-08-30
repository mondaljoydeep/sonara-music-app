import { useEffect, useState } from "react";
import { Headphones, Mic2, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyProfile, updateMyProfile, type Profile } from "@/services/profileService";
import { pushNotification } from "@/services/notificationsService";

/**
 * Shown once after first login. Lets the user pick: Listener only,
 * or Listener + AI Song Creator. Persists to profiles.role/onboarded.
 */
export function RoleOnboarding() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      return;
    }
    getMyProfile(user.id).then((p) => {
      setProfile(p);
      setOpen(!!p && !p.onboarded);
    });
  }, [user?.id]);

  if (!user || !open || !profile) return null;

  const pick = async (role: "listener" | "creator") => {
    setBusy(true);
    try {
      const updated = await updateMyProfile(user.id, { role, onboarded: true });
      setProfile(updated);
      await pushNotification(user.id, {
        title: role === "creator" ? "🎤 You're now an AI Creator" : "🎧 Welcome, Listener",
        body:
          role === "creator"
            ? "Head to Upload to publish your first AI-generated track. Sonara AI will verify it for you."
            : "Enjoy unlimited streaming. You can switch to Creator anytime from Profile.",
        type: "system",
        link: role === "creator" ? "/upload" : "/",
      });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="w-full max-w-lg bg-gradient-to-br from-[#1a1a24] to-[#0f0f17] rounded-3xl border border-white/10 p-6 sm:p-8 animate-fade-in">
        <div className="flex items-center gap-2 text-[#1ed760] text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles size={14} /> Choose your Sonara
        </div>
        <h2 className="text-2xl sm:text-3xl font-black mb-2">How will you use Sonara?</h2>
        <p className="text-sm text-[#b3b3b3] mb-6">
          You can change this anytime from your Profile.
        </p>

        <div className="space-y-3">
          <button
            disabled={busy}
            onClick={() => pick("listener")}
            className="w-full text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#1ed760]/50 rounded-2xl p-5 transition disabled:opacity-50 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0">
                <Headphones size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Listener only</div>
                <div className="text-xs text-[#b3b3b3] mt-1">
                  Stream millions of songs, follow artists, build playlists. No upload features.
                </div>
              </div>
            </div>
          </button>

          <button
            disabled={busy}
            onClick={() => pick("creator")}
            className="w-full text-left bg-gradient-to-br from-[#1ed760]/10 to-purple-500/10 hover:from-[#1ed760]/20 hover:to-purple-500/20 border border-[#1ed760]/40 hover:border-[#1ed760] rounded-2xl p-5 transition disabled:opacity-50 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1ed760] to-purple-500 flex items-center justify-center shrink-0">
                <Mic2 size={22} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg flex items-center gap-2">
                  Listener + AI Song Creator
                  <span className="text-[10px] bg-[#1ed760] text-black font-black px-2 py-0.5 rounded-full">NEW</span>
                </div>
                <div className="text-xs text-[#b3b3b3] mt-1">
                  Everything in Listener, plus upload your AI-generated tracks, get a public artist
                  profile in the Sonara Community, and earn followers.
                </div>
                <div className="text-[11px] text-[#1ed760] mt-2 flex items-center gap-1">
                  <ShieldCheck size={12} /> Every upload is verified by Sonara AI
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-[#535353] mt-5 text-center">
          By continuing you agree to Sonara&apos;s{" "}
          <a href="/terms" className="underline">community terms</a>.
        </p>
      </div>
    </div>
  );
}
