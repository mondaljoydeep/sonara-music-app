import { Link } from "react-router-dom";
import { Mail, Music2, Shield, FileText, Users, Radio } from "lucide-react";
import sonaraLogo from "@/assets/sonara-logo.jpg";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={sonaraLogo}
              alt="Sonara music streaming logo"
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/15"
            />
            <div>
              <div className="text-lg font-black tracking-tight">Sonara</div>
              <div className="text-xs text-[#1ed760]">Feel Every Beat</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#b3b3b3] max-w-xs">
            A worldwide music streaming platform — Bollywood, Pop, Hip-Hop, K-Pop, EDM and AI
            community artists, in one place.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm text-[#b3b3b3]">
            <li><Link to="/" className="hover:text-white flex items-center gap-2"><Radio size={14} /> Home</Link></li>
            <li><Link to="/search" className="hover:text-white flex items-center gap-2"><Music2 size={14} /> Search music</Link></li>
            <li><Link to="/community" className="hover:text-white flex items-center gap-2"><Users size={14} /> AI Community</Link></li>
            <li><Link to="/blog/suno-vs-udio" className="hover:text-white flex items-center gap-2"><FileText size={14} /> Suno vs Udio guide</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-[#b3b3b3]">
            <li><Link to="/privacy" className="hover:text-white flex items-center gap-2"><Shield size={14} /> Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white flex items-center gap-2"><FileText size={14} /> Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Contact</h3>
          <a
            href="mailto:developerworkjoy@gmail.com"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-[#1ed760] text-black font-semibold hover:scale-[1.02] transition"
          >
            <Mail size={15} /> developerworkjoy@gmail.com
          </a>
          <p className="mt-3 text-xs text-[#8b8b8b]">
            Business, licensing &amp; partnership enquiries welcome.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8b8b8b]">
        <p>© {year} Sonara. All rights reserved.</p>
        <p className="text-center">
          Website design and planned owned by{" "}
          <span className="text-white font-semibold tracking-wide">JOYDEEP MONDAL</span>
        </p>
      </div>
    </footer>
  );
}
