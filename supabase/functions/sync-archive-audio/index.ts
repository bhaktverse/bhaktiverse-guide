// Admin-only: pulls verified working spiritual audio from Archive.org's
// metadata API and upserts into public.audio_library.
//
// Strategy:
// 1. Search Archive.org for high-download audio items matching curated queries.
// 2. For each item, fetch /metadata/{id} to discover the actual playable file.
// 3. Pick the first MP3/OGG file (these are the canonical playable URLs).
// 4. Upsert into audio_library (deduped on title).
//
// Why this works: Archive.org's `/download/{id}/{filename}` URL is stable and
// public-CDN-backed. The current DB has many items where the filename doesn't
// match (404), so we re-derive the filename from /metadata for every item.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CuratedQuery {
  query: string;
  category: 'mantra' | 'bhajan' | 'aarti' | 'meditation' | 'story' | 'discourse';
  language: string;
  associated_deity?: string;
}

const QUERIES: CuratedQuery[] = [
  { query: 'hanuman chalisa', category: 'mantra', language: 'hi', associated_deity: 'Hanuman' },
  { query: 'shiv tandav stotram', category: 'mantra', language: 'sa', associated_deity: 'Shiva' },
  { query: 'vishnu sahasranama', category: 'mantra', language: 'sa', associated_deity: 'Vishnu' },
  { query: 'lalita sahasranama', category: 'mantra', language: 'sa', associated_deity: 'Devi' },
  { query: 'aditya hridayam', category: 'mantra', language: 'sa', associated_deity: 'Surya' },
  { query: 'durga saptashati', category: 'mantra', language: 'sa', associated_deity: 'Durga' },
  { query: 'gayatri mantra', category: 'mantra', language: 'sa' },
  { query: 'mahamrityunjaya mantra', category: 'mantra', language: 'sa', associated_deity: 'Shiva' },
  { query: 'om jai jagdish', category: 'aarti', language: 'hi' },
  { query: 'krishna bhajan', category: 'bhajan', language: 'hi', associated_deity: 'Krishna' },
  { query: 'meera bhajan', category: 'bhajan', language: 'hi', associated_deity: 'Krishna' },
  { query: 'kabir bhajan', category: 'bhajan', language: 'hi' },
  { query: 'bhagavad gita audio', category: 'discourse', language: 'sa' },
  { query: 'tibetan singing bowls', category: 'meditation', language: 'instrumental' },
  { query: 'bansuri flute meditation', category: 'meditation', language: 'instrumental' },
];

interface ArchiveSearchDoc {
  identifier: string;
  title?: string | string[];
  creator?: string | string[];
  downloads?: number;
}

interface ArchiveMetadataFile {
  name: string;
  format?: string;
  length?: string; // "mm:ss" or seconds
}

const PREFERRED_FORMATS = ['VBR MP3', 'MP3', 'Ogg Vorbis', '128Kbps MP3', '64Kbps MP3'];

function parseLength(len?: string): number {
  if (!len) return 0;
  if (/^\d+(\.\d+)?$/.test(len)) return Math.round(parseFloat(len));
  const parts = len.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function pickPlayableFile(files: ArchiveMetadataFile[]): ArchiveMetadataFile | null {
  for (const fmt of PREFERRED_FORMATS) {
    const match = files.find((f) => f.format === fmt);
    if (match) return match;
  }
  return files.find((f) => /\.(mp3|ogg)$/i.test(f.name)) || null;
}

async function searchArchive(q: CuratedQuery): Promise<ArchiveSearchDoc[]> {
  const url = new URL('https://archive.org/advancedsearch.php');
  url.searchParams.set('q', `${q.query} mediatype:audio`);
  url.searchParams.append('fl[]', 'identifier');
  url.searchParams.append('fl[]', 'title');
  url.searchParams.append('fl[]', 'creator');
  url.searchParams.append('fl[]', 'downloads');
  url.searchParams.set('rows', '5');
  url.searchParams.append('sort[]', 'downloads desc');
  url.searchParams.set('output', 'json');
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = await res.json();
  return json?.response?.docs ?? [];
}

async function getPlayableUrl(identifier: string): Promise<{ url: string; duration: number } | null> {
  const res = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!res.ok) return null;
  const meta = await res.json();
  const files: ArchiveMetadataFile[] = meta?.files ?? [];
  const file = pickPlayableFile(files);
  if (!file) return null;
  return {
    url: `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`,
    duration: parseLength(file.length),
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

    // Verify caller is an authenticated admin.
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
    const skipped: string[] = [];

    for (const q of QUERIES) {
      const docs = await searchArchive(q);
      for (const doc of docs.slice(0, 3)) {
        const title = Array.isArray(doc.title) ? doc.title[0] : (doc.title ?? doc.identifier);
        const creator = Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator ?? 'Traditional');

        // Skip if already present (dedupe by title)
        const { data: existing } = await admin
          .from('audio_library')
          .select('id')
          .eq('title', title)
          .maybeSingle();
        if (existing) { skipped.push(title); continue; }

        const playable = await getPlayableUrl(doc.identifier);
        if (!playable) { skipped.push(`${title} (no playable file)`); continue; }

        const { error: insErr } = await admin.from('audio_library').insert({
          title: title.slice(0, 250),
          artist: typeof creator === 'string' ? creator.slice(0, 250) : 'Traditional',
          category: q.category,
          language: q.language,
          duration: playable.duration || 300,
          audio_url: playable.url,
          associated_deity: q.associated_deity ?? null,
        });
        if (insErr) { skipped.push(`${title} (${insErr.message})`); continue; }
        inserted.push(title);
        // Be polite to Archive.org
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    return new Response(
      JSON.stringify({ inserted_count: inserted.length, skipped_count: skipped.length, inserted, skipped }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('sync-archive-audio error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
