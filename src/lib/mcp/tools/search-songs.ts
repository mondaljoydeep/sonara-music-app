import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_songs",
  title: "Search songs on Sonara",
  description: "Search Sonara's music catalog (Bollywood, Pop, K-Pop, Punjabi, Tamil, Lo-Fi and more) for songs by title, artist, or lyric snippet.",
  inputSchema: {
    query: z.string().min(1).describe("Search text — song title, artist name, or lyric."),
    limit: z.number().int().min(1).max(20).default(10).describe("Max results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Search failed: ${res.status}` }], isError: true };
    }
    const json = await res.json();
    const results = (json?.data?.results ?? []).map((s: any) => ({
      id: s.id,
      title: s.name,
      artists: s.artists?.primary?.map((a: any) => a.name).join(", ") ?? "",
      album: s.album?.name,
      duration: s.duration,
      year: s.year,
      url: s.url,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { results },
    };
  },
});
