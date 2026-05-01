// Admin-only: pulls structured saint biographies from Wikipedia REST API
// and upserts into public.saints.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaintSeed {
  name: string;
  wikiTitle: string;
  tradition: string;
  primary_language?: string;
  birth_year?: number;
  death_year?: number;
}

const SAINTS: SaintSeed[] = [
  { name: 'Adi Shankaracharya', wikiTitle: 'Adi_Shankara', tradition: 'Advaita Vedanta', primary_language: 'sa', birth_year: 788, death_year: 820 },
  { name: 'Ramanujacharya', wikiTitle: 'Ramanuja', tradition: 'Vishishtadvaita', primary_language: 'sa', birth_year: 1017, death_year: 1137 },
  { name: 'Madhvacharya', wikiTitle: 'Madhvacharya', tradition: 'Dvaita Vedanta', birth_year: 1238, death_year: 1317 },
  { name: 'Chaitanya Mahaprabhu', wikiTitle: 'Chaitanya_Mahaprabhu', tradition: 'Gaudiya Vaishnavism', primary_language: 'bn', birth_year: 1486, death_year: 1534 },
  { name: 'Tulsidas', wikiTitle: 'Tulsidas', tradition: 'Vaishnavism', primary_language: 'hi', birth_year: 1532, death_year: 1623 },
  { name: 'Surdas', wikiTitle: 'Surdas', tradition: 'Vaishnavism', primary_language: 'hi', birth_year: 1478, death_year: 1583 },
  { name: 'Mirabai', wikiTitle: 'Meera', tradition: 'Bhakti', primary_language: 'hi', birth_year: 1498, death_year: 1547 },
  { name: 'Kabir', wikiTitle: 'Kabir', tradition: 'Sant Mat', primary_language: 'hi', birth_year: 1398, death_year: 1518 },
  { name: 'Guru Nanak', wikiTitle: 'Guru_Nanak', tradition: 'Sikhism', primary_language: 'pa', birth_year: 1469, death_year: 1539 },
  { name: 'Sant Tukaram', wikiTitle: 'Tukaram', tradition: 'Varkari', primary_language: 'mr', birth_year: 1608, death_year: 1649 },
  { name: 'Sant Jnaneshwar', wikiTitle: 'Dnyaneshwar', tradition: 'Varkari', primary_language: 'mr', birth_year: 1275, death_year: 1296 },
  { name: 'Swami Vivekananda', wikiTitle: 'Swami_Vivekananda', tradition: 'Vedanta', primary_language: 'en', birth_year: 1863, death_year: 1902 },
  { name: 'Ramakrishna Paramahamsa', wikiTitle: 'Ramakrishna', tradition: 'Vedanta / Tantra', primary_language: 'bn', birth_year: 1836, death_year: 1886 },
  { name: 'Ramana Maharshi', wikiTitle: 'Ramana_Maharshi', tradition: 'Advaita Vedanta', primary_language: 'ta', birth_year: 1879, death_year: 1950 },
  { name: 'Paramahansa Yogananda', wikiTitle: 'Paramahansa_Yogananda', tradition: 'Kriya Yoga', primary_language: 'en', birth_year: 1893, death_year: 1952 },
  { name: 'Sri Aurobindo', wikiTitle: 'Sri_Aurobindo', tradition: 'Integral Yoga', primary_language: 'en', birth_year: 1872, death_year: 1950 },
  { name: 'Shirdi Sai Baba', wikiTitle: 'Sai_Baba_of_Shirdi', tradition: 'Sant', primary_language: 'mr', death_year: 1918 },
  { name: 'Adi Shankara', wikiTitle: 'Adi_Shankara', tradition: 'Advaita Vedanta' },
  { name: 'Andal', wikiTitle: 'Andal', tradition: 'Sri Vaishnavism', primary_language: 'ta' },
  { name: 'Basavanna', wikiTitle: 'Basava', tradition: 'Lingayatism', primary_language: 'kn', birth_year: 1131, death_year: 1167 },
];

async function fetchWikiSummary(title: string): Promise<{ extract?: string; thumbnail?: string } | null> {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'BhaktVerse/1.0 (saint-import)' },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return {
    extract: json.extract,
    thumbnail: json.thumbnail?.source ?? json.originalimage?.source,
  };
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

    for (const s of SAINTS) {
      const summary = await fetchWikiSummary(s.wikiTitle);
      if (!summary?.extract) { skipped.push(`${s.name} (no wiki)`); continue; }

      const payload = {
        name: s.name,
        tradition: s.tradition,
        primary_language: s.primary_language ?? 'hi',
        birth_year: s.birth_year ?? null,
        death_year: s.death_year ?? null,
        biography: summary.extract.slice(0, 4000),
        image_url: summary.thumbnail ?? null,
        verified: true,
      };

      const { data: existing } = await admin
        .from('saints').select('id').eq('name', s.name).maybeSingle();

      if (existing) {
        const { error } = await admin.from('saints').update(payload).eq('id', existing.id);
        if (error) skipped.push(`${s.name} (${error.message})`);
        else updated.push(s.name);
      } else {
        const { error } = await admin.from('saints').insert(payload);
        if (error) skipped.push(`${s.name} (${error.message})`);
        else inserted.push(s.name);
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
    console.error('sync-wikipedia-saints error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
