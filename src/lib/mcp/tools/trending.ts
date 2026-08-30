import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LANG_QUERY: Record<string, string> = {
  hindi: "trending hindi 2025",
  english: "top english hits 2025",
  punjabi: "trending punjabi 2025",
  tamil: "trending tamil 2025",
  kpop: "kpop hits 2025",
  latin: "latin hits 2025",
  lofi: "lofi chill 2025",
};

export default defineTool({
  name: "get_trending",
  title: "Get trending tracks",
  description: "Get currently trending tracks on Sonara filtered by language or genre (hindi, english, punjabi, tamil, kpop, latin, lofi).",
  inputSchema: {
    language: z.enum(["hindi", "english", "punjabi", "tamil", "kpop", "latin", "lofi"]).default("hindi"),
    limit: z.number().int().min(1).max(20).default(10),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ language, limit }) => {
    const q = LANG_QUERY[language];
    const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(q)}&limit=${limit}`);
    if (!res.ok) return { content: [{ type: "text", text: `Fetch failed: ${res.status}` }], isError: true };
    const json = await res.json();
    const tracks = (json?.data?.results ?? []).map((s: any) => ({
      id: s.id,
      title: s.name,
      artist: s.artists?.primary?.[0]?.name ?? "",
      album: s.album?.name,
      url: s.url,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(tracks, null, 2) }],
      structuredContent: { language, tracks },
    };
  },
});
