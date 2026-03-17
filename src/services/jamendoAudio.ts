import { supabase } from "@/integrations/supabase/client";

export interface JamendoTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage: string;
  duration: number;
  albumName?: string;
}

export async function fetchJamendoTracks(
  query?: string,
  tags?: string
): Promise<JamendoTrack[]> {
  try {
    const { data, error } = await supabase.functions.invoke("jamendo-tracks", {
      body: { query, tags, limit: 20 },
    });
    if (error) throw error;
    return data?.tracks || [];
  } catch (err) {
    console.error("fetchJamendoTracks error:", err);
    return [];
  }
}
