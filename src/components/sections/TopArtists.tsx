import { ScrollRow } from "@/components/sections/ScrollRow";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Plus } from "lucide-react";
import { TOP_ARTISTS, getArtistImage, type Artist, type ArtistCategory } from "@/services/artistsService";
import { listCreators, type Profile } from "@/services/profileService";

interface ArtistTileProps {
  artist: Artist;
}

function ArtistTile({ artist }: ArtistTileProps) {
  const [img, setImg] = useState<string | null>(artist.image || null);
  useEffect(() => {
    if (artist.image) { setImg(artist.image); return; }
    let alive = true;
    getArtistImage(artist.name).then((url) => { if (alive) setImg(url); });
    return () => { alive = false; };
  }, [artist.name, artist.image]);


  const initials = artist.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link to={`/artist/${artist.slug}`} className="flex-shrink-0 w-28 sm:w-32 group text-center">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/40 to-pink-500/40 ring-1 ring-white/10 group-hover:ring-white/40 transition shadow-lg">
        {img ? (
          <img src={img} alt={artist.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-black">{initials}</div>
        )}
      </div>
      <div className="mt-2 text-xs sm:text-sm font-semibold truncate px-1">{artist.name}</div>
      <div className="text-[10px] text-[#b3b3b3]">Artist</div>
    </Link>
  );
}

function CreatorTile({ profile }: { profile: Profile }) {
  const initials = (profile.display_name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Link to={`/creator/${profile.user_id}`} className="flex-shrink-0 w-28 sm:w-32 group text-center">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#1ed760]/40 to-purple-500/40 ring-1 ring-[#1ed760]/30 group-hover:ring-[#1ed760] transition shadow-lg">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.display_name || ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-black">{initials}</div>
        )}
        {profile.verified && (
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#1ed760] rounded-full flex items-center justify-center ring-2 ring-[#0a0a0f]">
            <ShieldCheck size={12} className="text-black" />
          </div>
        )}
      </div>
      <div className="mt-2 text-xs sm:text-sm font-semibold truncate px-1">{profile.display_name || "Unnamed"}</div>
      <div className="text-[10px] text-[#1ed760]">AI Creator</div>
    </Link>
  );
}

// Spotify-style category sections — each with its own emoji label
const CATEGORY_SECTIONS: { title: string; category: ArtistCategory }[] = [
  { title: "🟠 Bollywood Playback Singers", category: "Bollywood Playback" },
  { title: "🎸 Hindi Indie / I-Pop", category: "Hindi Indie / I-Pop" },
  { title: "🎤 Hindi Hip-Hop & Rap", category: "Hindi Hip-Hop / Rap" },
  { title: "🟡 Punjabi & Haryanvi", category: "Punjabi & Haryanvi" },
  { title: "🟢 Tamil", category: "Tamil" },
  { title: "🔵 Telugu", category: "Telugu" },
  { title: "🟣 Malayalam", category: "Malayalam" },
  { title: "🔴 Kannada", category: "Kannada" },
  { title: "🟤 Bengali", category: "Bengali" },
  { title: "⚪ Bhojpuri", category: "Bhojpuri" },
  { title: "🌐 Global Artists", category: "Global" },
];

function CategoryRow({ title, category }: { title: string; category: ArtistCategory }) {
  const staticArtists = TOP_ARTISTS.filter((a) => a.category === category);
  const [dyn, setDyn] = useState<Artist[]>([]);

  useEffect(() => {
    let alive = true;
    import("@/services/dynamicArtistsService").then(({ getDynamicArtists }) => {
      getDynamicArtists(category).then((list) => { if (alive) setDyn(list); });
    });
    return () => { alive = false; };
  }, [category]);

  // Merge, dedup by slug, static first
  const seen = new Set<string>();
  const merged: Artist[] = [];
  for (const a of [...staticArtists, ...dyn]) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    merged.push(a);
  }
  if (merged.length === 0) return null;
  return (
    <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      <ScrollRow>
        {merged.map((a) => <ArtistTile key={a.slug} artist={a} />)}
      </ScrollRow>
    </section>
  );
}


export function TopArtists() {
  const [creators, setCreators] = useState<Profile[]>([]);

  useEffect(() => {
    listCreators().then((list) => setCreators(list.slice(0, 20)));
  }, []);

  return (
    <>
      {/* Sonara Community AI Artists */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-[#1ed760]" /> Sonara Community · AI Artists
          </h2>
          <Link to="/community" className="text-xs text-[#1ed760] hover:underline">See all →</Link>
        </div>
        <ScrollRow>
          <Link to="/upload" className="flex-shrink-0 w-28 sm:w-32 group text-center" aria-label="Become an AI creator">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#1ed760]/30 to-purple-500/30 ring-1 ring-dashed ring-[#1ed760]/50 group-hover:ring-[#1ed760] flex items-center justify-center transition">
              <Plus size={32} className="text-[#1ed760]" />
            </div>
            <div className="mt-2 text-xs sm:text-sm font-semibold">Be an AI Artist</div>
          </Link>
          {creators.length === 0 ? (
            <div className="self-center text-xs text-[#b3b3b3] pl-2">No community artists yet — be the first!</div>
          ) : (
            creators.map((c) => <CreatorTile key={c.id} profile={c} />)
          )}
        </ScrollRow>
      </section>

      {CATEGORY_SECTIONS.map((s) => (
        <CategoryRow key={s.category} title={s.title} category={s.category} />
      ))}
    </>
  );
}
