import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setInstalled(standalone);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOS((v) => !v);
      return;
    }
    if (evt) {
      await evt.prompt();
      await evt.userChoice;
      setEvt(null);
    } else {
      setShowIOS(true);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-6">
      <button
        onClick={handleClick}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1ed760] text-black font-bold hover:scale-[1.02] transition shadow-[0_0_30px_rgba(30,215,96,0.35)]"
      >
        <Download size={18} />
        Install Sonara App
      </button>
      {showIOS && (
        <p className="mt-3 text-sm text-[#b3b3b3]">
          {isIOS
            ? 'On iPhone: tap the Share button in Safari, then "Add to Home Screen".'
            : "Open your browser menu and choose \"Install app\" or \"Add to Home Screen\"."}
        </p>
      )}
    </div>
  );
}
