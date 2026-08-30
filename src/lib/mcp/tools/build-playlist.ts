import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "build_playlist",
  title: "Build a Sonara playlist",
  description: "Build a themed playlist by mixing tracks across up to 4 mood/genre seeds (e.g. 'romantic hindi', 'workout punjabi', 'lofi chill').",
  inputSchema: {
    seeds: z.array(z.string().min(1)).min(1).max(4).describe("Seed queries to mix."),
    size: z.number().int().min(3).max(30).default(15),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ seeds, size }) => {
    const per = Math.max(2, Math.ceil(size / seeds.length));
    const all: any[] = [];
    for (const seed of seeds) {
      const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(seed)}&limit=${per}`);
      if (!res.ok) continue;
      const json = await res.json();
      for (const s of json?.data?.results ?? []) {
        all.push({
          id: s.id,
          title: s.name,
          artist: s.artists?.primary?.[0]?.name ?? "",
          seed,
          url: s.url,
        });
      }
    }
    // interleave by seed then trim
    const bySeed = new Map<string, any[]>();
    for (const t of all) {
      if (!bySeed.has(t.seed)) bySeed.set(t.seed, []);
      bySeed.get(t.seed)!.push(t);
    }
    const interleaved: any[] = [];
    let i = 0;
    while (interleaved.length < size) {
      let added = false;
      for (const arr of bySeed.values()) {
        if (arr[i]) { interleaved.push(arr[i]); added = true; if (interleaved.length >= size) break; }
      }
      if (!added) break;
      i++;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(interleaved, null, 2) }],
      structuredContent: { playlist: interleaved, seeds },
    };
  },
});
