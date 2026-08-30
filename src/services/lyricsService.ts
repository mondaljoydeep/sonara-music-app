export interface LyricsLine {
  time: number;
  text: string;
}

export interface LyricsResult {
  found: boolean;
  synced?: boolean;
  lines?: LyricsLine[];
  plain?: string;
}

function parseLRC(lrc: string): LyricsLine[] {
  return lrc
    .split("\n")
    .map((line) => {
      const m = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
      if (!m) return null;
      return {
        time: parseInt(m[1]) * 60 + parseFloat(m[2]),
        text: m[3].trim(),
      };
    })
    .filter((l): l is LyricsLine => !!l && !!l.text);
}

export async function getLyrics(title: string, artist: string): Promise<LyricsResult> {
  try {
    const clean = title
      .replace(/\(Official.*?\)/gi, "")
      .replace(/\[.*?\]/gi, "")
      .replace(/ft\..*/gi, "")
      .trim();

    const res = await fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(clean)}&artist_name=${encodeURIComponent(artist)}`
    );
    const results = await res.json();
    if (!Array.isArray(results) || !results.length) return { found: false };
    const best = results[0];
    if (best.syncedLyrics) {
      return {
        found: true,
        synced: true,
        lines: parseLRC(best.syncedLyrics),
        plain: best.plainLyrics,
      };
    }
    if (best.plainLyrics) {
      return { found: true, synced: false, plain: best.plainLyrics };
    }
    return { found: false };
  } catch {
    return { found: false };
  }
}
