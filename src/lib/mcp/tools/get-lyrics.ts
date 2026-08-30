import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_lyrics",
  title: "Get song lyrics",
  description: "Fetch lyrics for a song by title and artist using Sonara's lyrics provider (LRCLib).",
  inputSchema: {
    title: z.string().min(1).describe("Song title"),
    artist: z.string().min(1).describe("Primary artist name"),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ title, artist }) => {
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Sonara MCP" } });
    if (res.status === 404) {
      return { content: [{ type: "text", text: "No lyrics found." }], structuredContent: { found: false } };
    }
    if (!res.ok) return { content: [{ type: "text", text: `Lookup failed: ${res.status}` }], isError: true };
    const data = await res.json();
    const lyrics = data?.syncedLyrics || data?.plainLyrics || "";
    return {
      content: [{ type: "text", text: lyrics || "No lyrics available." }],
      structuredContent: { found: !!lyrics, synced: !!data?.syncedLyrics, lyrics },
    };
  },
});
