import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { query = "krishna bhajan shorts", pageToken } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache (6 hour TTL)
    const { data: cached } = await supabase
      .from("youtube_shorts_cache")
      .select("results, fetched_at")
      .eq("query", query.toLowerCase().trim())
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < 6 * 60 * 60 * 1000) {
        return new Response(JSON.stringify({ results: cached.results, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch from YouTube Data API v3
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoDuration: "short",
      maxResults: "12",
      order: "relevance",
      key: YOUTUBE_API_KEY,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
    );
    if (!ytRes.ok) {
      const err = await ytRes.text();
      throw new Error(`YouTube API error [${ytRes.status}]: ${err}`);
    }

    const ytData = await ytRes.json();
    const results = (ytData.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    }));

    // Upsert cache
    await supabase.from("youtube_shorts_cache").upsert(
      { query: query.toLowerCase().trim(), results, fetched_at: new Date().toISOString() },
      { onConflict: "query" }
    );

    return new Response(
      JSON.stringify({ results, nextPageToken: ytData.nextPageToken || null, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("youtube-shorts error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
