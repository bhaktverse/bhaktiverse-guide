import { supabase } from "@/integrations/supabase/client";

export interface YouTubeShort {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  publishedAt?: string;
}

export const SHORTS_CATEGORIES = [
  { key: "featured", label: "Featured", query: "" },
  { key: "krishna", label: "Krishna", query: "krishna bhajan shorts" },
  { key: "ram", label: "Ram", query: "ram bhajan shorts hindi" },
  { key: "shiv", label: "Shiv", query: "shiv bhajan shorts" },
  { key: "hanuman", label: "Hanuman", query: "hanuman mantra shorts" },
  { key: "devi", label: "Devi", query: "devi bhajan shorts" },
] as const;

export async function fetchYouTubeShorts(query: string): Promise<YouTubeShort[]> {
  try {
    const { data, error } = await supabase.functions.invoke("youtube-shorts", {
      body: { query },
    });
    if (error) throw error;
    return (data?.results || []).filter((s: any) => s.videoId);
  } catch (err) {
    console.error("fetchYouTubeShorts error:", err);
    return [];
  }
}
