import { defineMcp } from "@lovable.dev/mcp-js";
import searchSongs from "./tools/search-songs";
import trending from "./tools/trending";
import getLyrics from "./tools/get-lyrics";
import buildPlaylist from "./tools/build-playlist";

export default defineMcp({
  name: "sonara-mcp",
  title: "Sonara Music",
  version: "0.1.0",
  instructions:
    "Sonara Music tools. Search the multi-language music catalog, fetch trending tracks by language, look up synced lyrics, and build themed playlists across Bollywood, English, K-Pop, Punjabi, Tamil, Latin, and Lo-Fi.",
  tools: [searchSongs, trending, getLyrics, buildPlaylist],
});
