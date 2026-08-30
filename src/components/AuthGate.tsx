import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface GateCtx {
  /** Returns true if user is allowed; otherwise opens the modal and returns false. */
  requireAuth: (featureLabel?: string) => boolean;
}

const Ctx = createContext<GateCtx | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();

  const requireAuth = useCallback(
    (featureLabel?: string) => {
      if (user) return true;
      setFeature(featureLabel);
      setOpen(true);
      return false;
    },
    [user]
  );

  return (
    <Ctx.Provider value={{ requireAuth }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1a1a24] to-[#0a0a0f] rounded-2xl p-6 border border-white/10 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-[#b3b3b3] hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-14 h-14 rounded-full bg-[#1ed760]/15 text-[#1ed760] flex items-center justify-center mb-4">
              <Lock size={26} />
            </div>
            <h3 className="text-xl font-bold mb-1">Sign in to continue</h3>
            <p className="text-sm text-[#b3b3b3] mb-5">
              {feature
                ? `Sign in to use "${feature}". Listening is free without an account.`
                : `Anyone can listen for free, but you'll need an account to like, save, queue or upload.`}
            </p>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-[#1ed760] text-black font-semibold rounded-full py-3 hover:scale-[1.02] transition"
            >
              Sign in / Sign up
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="w-full text-center text-[#b3b3b3] hover:text-white text-sm mt-3 py-2"
            >
              Keep listening as guest
            </button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useAuthGate() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuthGate must be inside AuthGateProvider");
  return c;
}
