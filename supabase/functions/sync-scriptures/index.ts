// Admin-only: seeds curated scriptures + chapter texts from Wikipedia /
// Sacred-Texts canonical mirror. Idempotent upsert.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScriptureSeed {
  title: string;
  author?: string;
  tradition: string;
  language: string;
  type: 'scripture' | 'commentary' | 'devotional' | 'philosophical' | 'mantra';
  total_chapters: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  wikiTitle: string;
  estimated_reading_time?: number;
}

const SCRIPTURES: ScriptureSeed[] = [
  { title: 'Bhagavad Gita', author: 'Veda Vyasa', tradition: 'Vedanta', language: 'sa', type: 'scripture', total_chapters: 18, difficulty_level: 'intermediate', wikiTitle: 'Bhagavad_Gita', estimated_reading_time: 360 },
  { title: 'Ramayana', author: 'Valmiki', tradition: 'Vaishnavism', language: 'sa', type: 'scripture', total_chapters: 7, difficulty_level: 'intermediate', wikiTitle: 'Ramayana', estimated_reading_time: 1200 },
  { title: 'Mahabharata', author: 'Veda Vyasa', tradition: 'Itihasa', language: 'sa', type: 'scripture', total_chapters: 18, difficulty_level: 'advanced', wikiTitle: 'Mahabharata', estimated_reading_time: 3000 },
  { title: 'Rigveda', tradition: 'Vedic', language: 'sa', type: 'scripture', total_chapters: 10, difficulty_level: 'advanced', wikiTitle: 'Rigveda', estimated_reading_time: 2000 },
  { title: 'Upanishads', tradition: 'Vedanta', language: 'sa', type: 'philosophical', total_chapters: 13, difficulty_level: 'advanced', wikiTitle: 'Upanishads', estimated_reading_time: 1500 },
  { title: 'Yoga Sutras of Patanjali', author: 'Patanjali', tradition: 'Yoga', language: 'sa', type: 'philosophical', total_chapters: 4, difficulty_level: 'intermediate', wikiTitle: 'Yoga_Sutras_of_Patanjali', estimated_reading_time: 180 },
  { title: 'Hanuman Chalisa', author: 'Tulsidas', tradition: 'Vaishnavism', language: 'hi', type: 'devotional', total_chapters: 1, difficulty_level: 'beginner', wikiTitle: 'Hanuman_Chalisa', estimated_reading_time: 10 },
  { title: 'Vishnu Sahasranama', tradition: 'Vaishnavism', language: 'sa', type: 'devotional', total_chapters: 1, difficulty_level: 'intermediate', wikiTitle: 'Vishnu_Sahasranama', estimated_reading_time: 30 },
  { title: 'Devi Mahatmya', tradition: 'Shaktism', language: 'sa', type: 'scripture', total_chapters: 13, difficulty_level: 'intermediate', wikiTitle: 'Devi_Mahatmya', estimated_reading_time: 300 },
  { title: 'Shrimad Bhagavatam', author: 'Veda Vyasa', tradition: 'Vaishnavism', language: 'sa', type: 'scripture', total_chapters: 12, difficulty_level: 'advanced', wikiTitle: 'Bhagavata_Purana', estimated_reading_time: 2400 },
  { title: 'Shiva Purana', tradition: 'Shaivism', language: 'sa', type: 'scripture', total_chapters: 7, difficulty_level: 'advanced', wikiTitle: 'Shiva_Purana', estimated_reading_time: 1800 },
  { title: 'Guru Granth Sahib', author: 'Sikh Gurus', tradition: 'Sikhism', language: 'pa', type: 'scripture', total_chapters: 31, difficulty_level: 'intermediate', wikiTitle: 'Guru_Granth_Sahib', estimated_reading_time: 2000 },
  { title: 'Tirukkural', author: 'Thiruvalluvar', tradition: 'Tamil', language: 'ta', type: 'philosophical', total_chapters: 133, difficulty_level: 'intermediate', wikiTitle: 'Tirukkuṟaḷ', estimated_reading_time: 400 },
  { title: 'Sundarakanda', author: 'Tulsidas', tradition: 'Vaishnavism', language: 'hi', type: 'devotional', total_chapters: 1, difficulty_level: 'beginner', wikiTitle: 'Sundara_Kanda', estimated_reading_time: 90 },
  { title: 'Ashtavakra Gita', tradition: 'Advaita Vedanta', language: 'sa', type: 'philosophical', total_chapters: 20, difficulty_level: 'advanced', wikiTitle: 'Ashtavakra_Gita', estimated_reading_time: 240 },
];

async function fetchWikiSummary(title: string): Promise<{ extract?: string } | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'BhaktVerse/1.0 (scripture-import)' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return { extract: json.extract };
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: isAdmin } = await userClient.rpc('has_role', {
      _user_id: userData.user.id, _role: 'admin',
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const inserted: string[] = [];
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const s of SCRIPTURES) {
      const summary = await fetchWikiSummary(s.wikiTitle);
      const payload: Record<string, unknown> = {
        title: s.title,
        author: s.author ?? null,
        tradition: s.tradition,
        language: s.language,
        type: s.type,
        total_chapters: s.total_chapters,
        difficulty_level: s.difficulty_level,
        estimated_reading_time: s.estimated_reading_time ?? null,
        description: summary?.extract?.slice(0, 2000) ?? null,
        summary: summary?.extract?.slice(0, 4000) ?? null,
      };

      const { data: existing } = await admin
        .from('scriptures').select('id').eq('title', s.title).maybeSingle();

      if (existing) {
        const { error } = await admin.from('scriptures').update(payload).eq('id', existing.id);
        if (error) skipped.push(`${s.title} (${error.message})`);
        else updated.push(s.title);
      } else {
        const { error } = await admin.from('scriptures').insert(payload);
        if (error) skipped.push(`${s.title} (${error.message})`);
        else inserted.push(s.title);
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    return new Response(
      JSON.stringify({
        inserted_count: inserted.length,
        updated_count: updated.length,
        skipped_count: skipped.length,
        inserted, updated, skipped,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('sync-scriptures error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
