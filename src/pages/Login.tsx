import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import sonaraLogo from "@/assets/sonara-logo.jpg";

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setInfo(null); setBusy(true);
    const r = mode === "signin"
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password);
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    if (mode === "signup") setInfo("Check your email to verify, then sign in.");
    else nav("/", { replace: true });
  };

  const handleGoogle = async () => {
    setErr(null); setBusy(true);
    const r = await signInWithGoogle();
    setBusy(false);
    if (r.error) setErr(r.error);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <img src={sonaraLogo} alt="Sonara" className="w-14 h-14 rounded-2xl shadow-[0_0_40px_rgba(120,80,255,0.35)]" />
          <span className="text-3xl font-black tracking-tight">Sonara</span>
        </Link>
        <h1 className="text-2xl font-black text-center mb-2">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-[#b3b3b3] text-center mb-6">
          Listening is free for everyone — sign in to like, save, queue and upload.
        </p>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full bg-white text-black font-semibold rounded-full py-3 mb-4 flex items-center justify-center gap-2 hover:scale-[1.01] transition disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7 29.5 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.4l-6.5-5.4c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.5 39.1 16.2 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.4c-.5.4 7.2-5.3 7.2-14.9 0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-[#535353]">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1ed760]"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1ed760]"
          />
          {err && <div className="text-sm text-red-400">{err}</div>}
          {info && <div className="text-sm text-[#1ed760]">{info}</div>}
          <button
            type="submit" disabled={busy}
            className="w-full bg-[#1ed760] text-black font-semibold rounded-full py-3 hover:scale-[1.01] transition disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); setInfo(null); }}
          className="w-full text-sm text-[#b3b3b3] hover:text-white mt-4"
        >
          {mode === "signin" ? "New to Sonara? Create an account" : "Already have an account? Sign in"}
        </button>

        <Link to="/" className="block text-center text-xs text-[#535353] hover:text-white mt-6">
          Continue as guest (listen only)
        </Link>

        <div className="text-[11px] text-[#535353] text-center mt-8">
          By continuing you agree to Sonara&apos;s{" "}
          <Link to="/terms" className="underline hover:text-white">Terms</Link> &{" "}
          <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
