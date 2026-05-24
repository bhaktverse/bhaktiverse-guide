// Admin-only: pulls famous Hindu temples from Wikidata SPARQL + Wikipedia
// summary/image, upserts into public.temples.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Curated list of major temples (name + Wikipedia title + deity + tradition).
// Wikidata SPARQL returns inconsistent results for some temples, so we use a
// hand-curated seed and fetch the rich Wikipedia summary + image for each.
interface TempleSeed {
  name: string;
  wikiTitle: string;
  primary_deity: string;
  tradition: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

const TEMPLES: TempleSeed[] = [
  { name: 'Kashi Vishwanath Temple', wikiTitle: 'Kashi_Vishwanath_Temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3109, lng: 83.0107 },
  { name: 'Somnath Temple', wikiTitle: 'Somnath_temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Veraval', state: 'Gujarat', lat: 20.8880, lng: 70.4012 },
  { name: 'Mahakaleshwar Jyotirlinga', wikiTitle: 'Mahakaleshwar_Jyotirlinga', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1828, lng: 75.7681 },
  { name: 'Kedarnath Temple', wikiTitle: 'Kedarnath_Temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Kedarnath', state: 'Uttarakhand', lat: 30.7352, lng: 79.0669 },
  { name: 'Badrinath Temple', wikiTitle: 'Badrinath_Temple', primary_deity: 'Vishnu', tradition: 'Vaishnavism', city: 'Badrinath', state: 'Uttarakhand', lat: 30.7433, lng: 79.4938 },
  { name: 'Jagannath Temple, Puri', wikiTitle: 'Jagannath_Temple,_Puri', primary_deity: 'Jagannath', tradition: 'Vaishnavism', city: 'Puri', state: 'Odisha', lat: 19.8048, lng: 85.8180 },
  { name: 'Tirumala Venkateswara Temple', wikiTitle: 'Tirumala_Venkateswara_Temple', primary_deity: 'Venkateswara', tradition: 'Vaishnavism', city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6833, lng: 79.3475 },
  { name: 'Meenakshi Amman Temple', wikiTitle: 'Meenakshi_Temple', primary_deity: 'Meenakshi', tradition: 'Shaktism', city: 'Madurai', state: 'Tamil Nadu', lat: 9.9195, lng: 78.1193 },
  { name: 'Brihadeeswarar Temple', wikiTitle: 'Brihadisvara_Temple,_Thanjavur', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7828, lng: 79.1318 },
  { name: 'Ramanathaswamy Temple', wikiTitle: 'Ramanathaswamy_Temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Rameswaram', state: 'Tamil Nadu', lat: 9.2881, lng: 79.3174 },
  { name: 'Sabarimala Temple', wikiTitle: 'Sabarimala', primary_deity: 'Ayyappa', tradition: 'Shaivism/Vaishnavism', city: 'Pathanamthitta', state: 'Kerala', lat: 9.4356, lng: 77.0810 },
  { name: 'Padmanabhaswamy Temple', wikiTitle: 'Padmanabhaswamy_Temple', primary_deity: 'Vishnu', tradition: 'Vaishnavism', city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.4827, lng: 76.9436 },
  { name: 'Vaishno Devi Temple', wikiTitle: 'Vaishno_Devi', primary_deity: 'Durga', tradition: 'Shaktism', city: 'Katra', state: 'Jammu and Kashmir', lat: 33.0309, lng: 74.9489 },
  { name: 'Golden Temple, Amritsar', wikiTitle: 'Golden_Temple', primary_deity: 'Guru Granth Sahib', tradition: 'Sikhism', city: 'Amritsar', state: 'Punjab', lat: 31.6200, lng: 74.8765 },
  { name: 'Akshardham Temple, Delhi', wikiTitle: 'Akshardham_(Delhi)', primary_deity: 'Swaminarayan', tradition: 'Swaminarayan Sampradaya', city: 'Delhi', state: 'Delhi', lat: 28.6127, lng: 77.2773 },
  { name: 'Lingaraj Temple', wikiTitle: 'Lingaraja_Temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2381, lng: 85.8338 },
  { name: 'Kamakhya Temple', wikiTitle: 'Kamakhya_Temple', primary_deity: 'Kamakhya', tradition: 'Shaktism', city: 'Guwahati', state: 'Assam', lat: 26.1664, lng: 91.7055 },
  { name: 'Konark Sun Temple', wikiTitle: 'Konark_Sun_Temple', primary_deity: 'Surya', tradition: 'Saura', city: 'Konark', state: 'Odisha', lat: 19.8876, lng: 86.0945 },
  { name: 'Dwarkadhish Temple', wikiTitle: 'Dwarkadhish_Temple', primary_deity: 'Krishna', tradition: 'Vaishnavism', city: 'Dwarka', state: 'Gujarat', lat: 22.2380, lng: 68.9685 },
  { name: 'Banke Bihari Temple', wikiTitle: 'Banke_Bihari_Temple', primary_deity: 'Krishna', tradition: 'Vaishnavism', city: 'Vrindavan', state: 'Uttar Pradesh', lat: 27.5806, lng: 77.7006 },
  { name: 'ISKCON Temple, Bangalore', wikiTitle: 'ISKCON_Temple_Bangalore', primary_deity: 'Krishna', tradition: 'Gaudiya Vaishnavism', city: 'Bangalore', state: 'Karnataka', lat: 13.0098, lng: 77.5511 },
  { name: 'Shirdi Sai Baba Temple', wikiTitle: 'Shirdi_Sai_Baba_Temple,_Shirdi', primary_deity: 'Sai Baba', tradition: 'Sant', city: 'Shirdi', state: 'Maharashtra', lat: 19.7672, lng: 74.4763 },
  { name: 'Siddhivinayak Temple', wikiTitle: 'Siddhivinayak_Temple,_Mumbai', primary_deity: 'Ganesha', tradition: 'Ganapatya', city: 'Mumbai', state: 'Maharashtra', lat: 19.0170, lng: 72.8302 },
  { name: 'Trimbakeshwar Temple', wikiTitle: 'Trimbakeshwar_Shiva_Temple', primary_deity: 'Shiva', tradition: 'Shaivism', city: 'Nashik', state: 'Maharashtra', lat: 19.9325, lng: 73.5301 },
  { name: 'Mahabodhi Temple', wikiTitle: 'Mahabodhi_Temple', primary_deity: 'Buddha', tradition: 'Buddhism', city: 'Bodh Gaya', state: 'Bihar', lat: 24.6961, lng: 84.9911 },
];

async function fetchWikiSummary(title: string): Promise<{ extract?: string; thumbnail?: string } | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'BhaktVerse/1.0 (temple-import)' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      extract: json.extract,
      thumbnail: json.thumbnail?.source ?? json.originalimage?.source,
    };
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

    for (const t of TEMPLES) {
      const summary = await fetchWikiSummary(t.wikiTitle);
      const payload: Record<string, unknown> = {
        name: t.name,
        primary_deity: t.primary_deity,
        tradition: t.tradition,
        location: { city: t.city, state: t.state, country: 'India', lat: t.lat, lng: t.lng },
        description: summary?.extract?.slice(0, 4000) ?? null,
        image_urls: summary?.thumbnail ? [summary.thumbnail] : [],
        verified: true,
      };

      const { data: existing } = await admin
        .from('temples').select('id').eq('name', t.name).maybeSingle();

      if (existing) {
        const { error } = await admin.from('temples').update(payload).eq('id', existing.id);
        if (error) skipped.push(`${t.name} (${error.message})`);
        else updated.push(t.name);
      } else {
        const { error } = await admin.from('temples').insert(payload);
        if (error) skipped.push(`${t.name} (${error.message})`);
        else inserted.push(t.name);
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
    console.error('sync-wikidata-temples error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
