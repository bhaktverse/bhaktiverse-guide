const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, tags = "meditation+spiritual", limit = 20 } = await req.json();
    const JAMENDO_CLIENT_ID = Deno.env.get("JAMENDO_CLIENT_ID");
    if (!JAMENDO_CLIENT_ID) {
      throw new Error("JAMENDO_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: "json",
      limit: String(limit),
      include: "musicinfo",
      audioformat: "mp32",
      order: "popularity_total",
    });

    if (query) {
      params.set("search", query);
    }
    if (tags && !query) {
      params.set("tags", tags);
    }

    const res = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jamendo API error [${res.status}]: ${err}`);
    }

    const data = await res.json();
    const tracks = (data.results || []).map((t: any) => ({
      id: t.id,
      title: t.name,
      artist: t.artist_name,
      audioUrl: t.audio,
      coverImage: t.album_image || t.image,
      duration: t.duration,
      albumName: t.album_name,
    }));

    return new Response(JSON.stringify({ tracks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("jamendo-tracks error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
