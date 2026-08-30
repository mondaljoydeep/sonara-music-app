
# Sonara — Big Feature Drop Plan

This is a large request (6 major features). I'll group them into 3 phases so you can see results quickly and we can adjust as we go. Before I start I need a few decisions from you (see bottom).

---

## Phase 1 — Foundations (Auth + Legal + PWA Splash)

### 1A. Login / Guest mode
- Enable **Lovable Cloud** (built-in backend, no external account needed).
- Add `/login` page with **Email/Password + Google sign-in**.
- Guest users: can browse and **listen** to songs only.
- Gated features (require login): like, save to library, add to playlist, queue management, download, upload, full player controls beyond play/pause, history, personalized recommendations.
- Add `useAuthGate()` hook + a small "Sign in to continue" modal that appears when a guest taps a gated control.
- A "Sign in" button in the sidebar/profile area; profile page shows account info + sign out.

### 1B. Privacy Policy + Terms pages
- Full long-form `/privacy` and `/terms` pages, branded as **Sonara**, covering: data collected, third-party sources (JioSaavn, YouTube, Audius), cookies, children's policy, DMCA, contact, governing law, etc.
- Linked from login page footer, profile page, and a small footer on Home.

### 1C. PWA splash screen
- Generate iOS splash images (multiple sizes) + Android `theme_color`.
- Add an in-app splash overlay (Sonara logo + tagline + fade out) shown for ~1.2s on first paint, so even in-browser launches feel app-like.
- Update `manifest.json` with proper `start_url`, `scope`, splash icons.

---

## Phase 2 — Visual richness (AI banners + Video ad section)

### 2A. AI-generated genre banners
- Use **Lovable AI Gateway** (`google/gemini-2.5-flash-image`, free during promo) via an edge function `generate-banner`.
- One banner per genre/vibe (Bollywood, Punjabi, Lo-Fi, Workout, Romantic, K-Pop, etc.) — generated **once**, cached in Cloud storage, then served as a static URL.
- Replace plain section headers on Home with cinematic banner cards (gradient overlay + genre title + "Play All" button).
- I'll pre-generate ~14 banners during build so the home page is instant.

### 2B. New-Releases Video Ad section (Spotify-style)
- New section on Home: **"📀 New Releases — For You"**.
- Auto-plays muted **video previews** (artist video clips from YouTube embed, muted, looping, autoplay) for the user's top artists' newest songs.
- Tapping a card opens the song in the player (YouTube/Saavn/Audius — whichever has it; we already have all 3).
- Section is **dismissible** — `localStorage.setItem("sonara:hideAds","1")` → user can re-enable from Profile → Settings.
- Independent of audio playback (uses muted `<video>` / YouTube iframe with `mute=1`), so it never interferes with the currently playing song.

---

## Phase 3 — Artists hub (the biggest piece)

### 3A. Top Artists section on Home
- Curated list of ~30 top artists: **Indian** (Arijit, Shreya, Diljit, AR Rahman, Atif, Neha Kakkar, Anirudh, Pritam, Honey Singh, Badshah, Sid Sriram…) + **Global** (Taylor Swift, The Weeknd, Bad Bunny, Drake, BTS, Billie, Dua Lipa, Ed Sheeran, Bruno Mars, Rihanna, Beyoncé, Coldplay…).
- Each artist tile shows real photo + name. Photos come from **JioSaavn artist API** (it returns high-res artist images). For artists not on Saavn we fall back to **Wikipedia REST API** (free, no key, returns thumbnail).
- Horizontal circular scroll, tappable.

### 3B. `/artist/:id` page
- Top section: large artist photo + name + monthly listener count (Saavn) + Follow button.
- **All Top Songs** merged from JioSaavn + YouTube + Audius (deduped by title+artist).
- **Albums** (from Saavn).
- **Concerts & news** — pulled from a free source. Options below ↓
- Buttons: "Buy tickets on Google" → opens `https://www.google.com/search?q={artist}+tour+tickets`.

### 3C. Search integration
- Search results already include songs from all 3 sources. I'll add a top "Artists" row when the query matches an artist name (using Saavn artist search endpoint).

---

## Decisions I need from you

1. **Login providers** — Email/Password + Google only, or also Apple? (Apple needs a paid Apple Dev account; Google is free.)
2. **Concert/news source** for artist pages — pick one:
   - **Songkick / Bandsintown public scrape** (no key, but unofficial — may break)
   - **Google search redirect only** (we don't show concerts in-app, just a "Find tickets on Google" button — most reliable, zero API risk)
   - **Ticketmaster Discovery API** (official, free tier, requires you to create a free key)
3. **AI banner cost** — generating ~14 banners uses Lovable AI credits (currently free promo until Oct 13). Confirm OK to proceed, or want me to skip and use solid-color gradients instead?
4. **New-Releases video ads** — use **muted YouTube embeds** (works for every song, no extra cost) or only show artists who have an Audius video (rarer)? I recommend YouTube embeds.

Once you answer these I'll execute Phase 1 → 2 → 3 in order, verifying each phase works before moving on.
