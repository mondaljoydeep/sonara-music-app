import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Require an authenticated caller so this endpoint can't be drained anonymously
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !data?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {

    const { title, description, lyrics, genre } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userText = `Title: ${title ?? ""}\nGenre: ${genre ?? ""}\nDescription: ${description ?? ""}\nLyrics: ${(lyrics ?? "").slice(0, 4000)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are Sonara AI, a music safety reviewer. Decide if user-submitted song metadata is acceptable on a public community platform. Reject ONLY for: hate speech against protected groups, explicit sexual content involving minors, direct incitement of real-world violence, doxxing, or clearly illegal content. Profanity, romance, breakup themes, party themes, sad/dark moods, and ordinary adult themes are ALLOWED. Always call the tool.",
          },
          { role: "user", content: userText },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verdict",
              description: "Return moderation decision.",
              parameters: {
                type: "object",
                properties: {
                  safe: { type: "boolean" },
                  reason: { type: "string", description: "1-2 sentence explanation shown to the creator" },
                  tags: { type: "array", items: { type: "string" } },
                },
                required: ["safe", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verdict" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      // Fail-open in soft mode: allow with note so uploads aren't blocked by AI outage
      return new Response(JSON.stringify({ safe: true, reason: "Auto-approved (AI reviewer unavailable).", tags: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { safe: true, reason: "Auto-approved by Sonara AI.", tags: [] as string[] };
    if (call?.function?.arguments) {
      try { parsed = { ...parsed, ...JSON.parse(call.function.arguments) }; } catch { /* ignore */ }
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-upload error", e);
    return new Response(JSON.stringify({ safe: true, reason: "Auto-approved (reviewer error).", tags: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
