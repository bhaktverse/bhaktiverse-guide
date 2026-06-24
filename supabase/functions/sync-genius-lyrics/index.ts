// Admin-only: enriches audio_library rows that lack lyrics by querying Genius API.
// Uses GENIUS_API_KEY (client access token). Best-effort match by title+artist.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function searchGenius(token: string, q: string) {
  const r = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.response?.hits?.[0]?.result ?? null;
}

// Genius does not return raw lyrics via API; we store the lyrics page URL + snippet.
// (Full lyrics scraping is against Genius ToS.)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const token = Deno.env.get("GENIUS_API_KEY");
    if (!token) return new Response(JSON.stringify({ error: "GENIUS_API_KEY not configured" }), { status: 500, headers: corsHeaders });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { data: tracks } = await supabase.from("audio_library")
      .select("id, title, artist")
      .or("lyrics.is.null,lyrics.eq.")
      .limit(50);

    let updated = 0;
    for (const t of tracks ?? []) {
      const q = `${t.title} ${t.artist ?? ""}`.trim();
      const hit = await searchGenius(token, q);
      if (!hit) continue;
      const lyricsLink = `Read lyrics on Genius: ${hit.url}`;
      await supabase.from("audio_library").update({
        lyrics: lyricsLink,
        meaning: hit.full_title ?? null,
      }).eq("id", t.id);
      updated++;
      await new Promise((r) => setTimeout(r, 200));
    }

    return new Response(JSON.stringify({ checked: tracks?.length ?? 0, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
