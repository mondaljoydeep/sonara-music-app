import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";

type SR = any;

/**
 * Voice search using the browser's Web Speech API.
 * Falls back gracefully when unsupported (iOS Safari older versions).
 */
export function VoiceSearchButton() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const W = window as any;
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }
    const rec: SR = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const txt = e.results?.[0]?.[0]?.transcript?.trim();
      if (txt) navigate(`/search?q=${encodeURIComponent(txt)}`);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed") toast("Mic access denied — enable it in browser settings.");
      else if (e.error === "no-speech") toast("Didn't catch that. Try again.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.abort(); } catch { /* noop */ } };
  }, [navigate, toast]);

  if (!supported) return null;

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) { try { rec.stop(); } catch { /* noop */ } return; }
    try {
      rec.start();
      setListening(true);
      toast("🎙️ Listening — say a song, artist, or mood");
    } catch { /* already started */ }
  };

  return (
    <button
      onClick={toggle}
      aria-label={listening ? "Stop voice search" : "Voice search"}
      title="Voice search"
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition ${
        listening
          ? "bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.7)] animate-pulse"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}
