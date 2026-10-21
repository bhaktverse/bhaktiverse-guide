// Verified Archive.org audio ingestion for public.audio_library.
//
// Pipeline: advancedsearch -> /metadata/{id} -> pick playable derivatives ->
// HTTP range-verify every candidate URL -> clean/normalise title ->
// categorise + deity-tag -> dedupe (self + DB) -> insert with health columns.
//
// Only URLs that answer 200/206 with an audio content type are ever stored, so
// the catalogue cannot contain dead tracks.
//
// Auth: admin JWT, or `x-cron-secret` matching CRON_SECRET.
// Body (all optional): { offset?: number, limit?: number, perQuery?: number, maxFiles?: number }

import { authorizeJob, corsHeaders } from '../_shared/jobAuth.ts';


type Category = 'mantra' | 'bhajan' | 'aarti' | 'meditation' | 'story' | 'discourse';

interface CuratedQuery {
  query: string;
  category: Category;
  language: string;
  deity?: string;
}

const QUERIES: CuratedQuery[] = [
  { query: 'hanuman chalisa', category: 'mantra', language: 'hi', deity: 'Hanuman' },
  { query: 'shiv tandav stotram', category: 'mantra', language: 'sa', deity: 'Shiva' },
  { query: 'vishnu sahasranama', category: 'mantra', language: 'sa', deity: 'Vishnu' },
  { query: 'lalita sahasranama', category: 'mantra', language: 'sa', deity: 'Devi' },
  { query: 'aditya hridayam', category: 'mantra', language: 'sa', deity: 'Surya' },
  { query: 'durga saptashati', category: 'mantra', language: 'sa', deity: 'Durga' },
  { query: 'gayatri mantra', category: 'mantra', language: 'sa' },
  { query: 'mahamrityunjaya mantra', category: 'mantra', language: 'sa', deity: 'Shiva' },
  { query: 'om namah shivaya chanting', category: 'mantra', language: 'sa', deity: 'Shiva' },
  { query: 'hare krishna kirtan', category: 'bhajan', language: 'hi', deity: 'Krishna' },
  { query: 'krishna bhajan', category: 'bhajan', language: 'hi', deity: 'Krishna' },
  { query: 'meera bhajan', category: 'bhajan', language: 'hi', deity: 'Krishna' },
  { query: 'kabir bhajan', category: 'bhajan', language: 'hi' },
  { query: 'ram dhun bhajan', category: 'bhajan', language: 'hi', deity: 'Rama' },
  { query: 'sai baba bhajan', category: 'bhajan', language: 'hi', deity: 'Sai Baba' },
  { query: 'ganesh aarti', category: 'aarti', language: 'hi', deity: 'Ganesha' },
  { query: 'om jai jagdish hare aarti', category: 'aarti', language: 'hi' },
  { query: 'shiva aarti', category: 'aarti', language: 'hi', deity: 'Shiva' },
  { query: 'durga aarti', category: 'aarti', language: 'hi', deity: 'Durga' },
  { query: 'bhagavad gita audio', category: 'discourse', language: 'sa' },
  { query: 'ramayana audio', category: 'story', language: 'hi', deity: 'Rama' },
  { query: 'upanishad chanting', category: 'mantra', language: 'sa' },
  { query: 'vedic chanting', category: 'mantra', language: 'sa' },
  { query: 'tibetan singing bowls', category: 'meditation', language: 'instrumental' },
  { query: 'bansuri flute meditation', category: 'meditation', language: 'instrumental' },
  { query: 'sitar meditation raga', category: 'meditation', language: 'instrumental' },
  { query: 'om chanting meditation', category: 'meditation', language: 'sa' },
  { query: 'buddhist mantra chanting', category: 'mantra', language: 'sa' },
  { query: 'sanskrit stotram', category: 'mantra', language: 'sa' },
  { query: 'devotional bhajan india', category: 'bhajan', language: 'hi' },
];

const CATEGORY_KEYWORDS: [string, Category][] = [
  ['aarti', 'aarti'], ['arti', 'aarti'],
  ['chalisa', 'mantra'], ['mantra', 'mantra'], ['stotra', 'mantra'], ['sahasranam', 'mantra'],
  ['shloka', 'mantra'], ['chant', 'mantra'],
  ['dhun', 'bhajan'], ['kirtan', 'bhajan'], ['bhajan', 'bhajan'],
  ['katha', 'story'], ['ramayan', 'story'],
  ['gita', 'discourse'], ['pravachan', 'discourse'],
  ['meditation', 'meditation'], ['flute', 'meditation'], ['bowl', 'meditation'], ['raga', 'meditation'],
];

const DEITY_KEYWORDS: [string, string][] = [
  ['hanuman', 'Hanuman'], ['bajrang', 'Hanuman'], ['maruti', 'Hanuman'],
  ['shiv', 'Shiva'], ['shankar', 'Shiva'], ['mahadev', 'Shiva'], ['bholenath', 'Shiva'],
  ['krishna', 'Krishna'], ['govind', 'Krishna'], ['gopal', 'Krishna'], ['radha', 'Krishna'], ['murari', 'Krishna'],
  ['raghu', 'Rama'], ['sita', 'Rama'], ['ram ', 'Rama'],
  ['ganesh', 'Ganesha'], ['ganpati', 'Ganesha'], ['vinayak', 'Ganesha'],
  ['durga', 'Durga'], ['ambe', 'Durga'], ['laxmi', 'Lakshmi'], ['lakshmi', 'Lakshmi'],
  ['saraswati', 'Saraswati'], ['vishnu', 'Vishnu'], ['narayan', 'Vishnu'],
  ['sai', 'Sai Baba'], ['surya', 'Surya'], ['gayatri', 'Gayatri'], ['buddha', 'Buddha'],
  ['mata', 'Devi'], ['devi', 'Devi'],
];

const PREFERRED_FORMATS = ['VBR MP3', '128Kbps MP3', '64Kbps MP3', 'MP3', 'Ogg Vorbis'];
const UA = 'BhaktVerse/1.0 (audio catalogue verifier)';

interface ArchiveFile { name: string; format?: string; length?: string; size?: string }

function parseLength(len?: string): number {
  if (!len) return 0;
  if (/^\d+(\.\d+)?$/.test(len)) return Math.round(parseFloat(len));
  const parts = len.split(':').map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function cleanTitle(raw: string): string {
  let t = raw.replace(/\.(mp3|ogg)$/i, '');
  t = t.replace(/^\d{1,3}\s*[-_.]\s*/, '');
  t = t.replace(/[_-]/g, ' ');
  t = t.replace(/([a-z])([A-Z])/g, '$1 $2');
  t = t.replace(/\(\s*\d+\s*\)/g, '');
  t = t.replace(/\b(vol|track|part)\s*\.?\s*\d+\b/gi, '');
  t = t.replace(/\bmp3\b/gi, '');
  t = t.replace(/\s+/g, ' ').trim().replace(/^[-–—.\s]+|[-–—.\s]+$/g, '');
  return t
    .split(' ')
    .map((w) => (w.toUpperCase() === w && w.length <= 3 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function categorise(title: string, fallback: Category): Category {
  const low = title.toLowerCase();
  for (const [k, v] of CATEGORY_KEYWORDS) if (low.includes(k)) return v;
  return fallback;
}

function tagDeity(title: string, fallback?: string): string | null {
  const low = ` ${title.toLowerCase()} `;
  for (const [k, v] of DEITY_KEYWORDS) if (low.includes(k)) return v;
  return fallback ?? null;
}

async function searchArchive(q: string, rows: number) {
  const url =
    `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`${q} AND mediatype:audio`)}` +
    `&fl[]=identifier&fl[]=title&fl[]=creator&sort[]=downloads+desc&rows=${rows}&output=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.response?.docs ?? []) as { identifier: string; title?: string | string[]; creator?: string | string[] }[];
  } catch {
    return [];
  }
}

interface Candidate {
  title: string; artist: string; duration: number;
  audio_url: string; mirror_urls: string[]; size: number;
}

async function candidatesFor(identifier: string, artistFallback: string, maxFiles: number): Promise<Candidate[]> {
  let meta: any;
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    meta = await res.json();
  } catch {
    return [];
  }
  const files: ArchiveFile[] = meta?.files ?? [];
  const server: string | undefined = meta?.server;
  const dir: string | undefined = meta?.dir;
  const out: Candidate[] = [];
  const seen = new Set<string>();

  for (const fmt of PREFERRED_FORMATS) {
    for (const f of files) {
      if (f.format !== fmt) continue;
      const base = f.name.replace(/\.[^.]+$/, '').toLowerCase();
      if (seen.has(base)) continue;
      const duration = parseLength(f.length);
      if (duration && (duration < 25 || duration > 5400)) continue;
      seen.add(base);
      const enc = encodeURIComponent(f.name);
      const primary = `https://archive.org/download/${identifier}/${enc}`;
      const mirrors: string[] = [];
      if (server && dir) mirrors.push(`https://${server}${dir}/${enc}`);
      if (primary.endsWith('.ogg')) mirrors.push(primary.replace(/\.ogg$/, '.mp3'));
      out.push({
        title: cleanTitle(f.name),
        artist: artistFallback,
        duration: duration || 300,
        audio_url: primary,
        mirror_urls: mirrors,
        size: parseInt(f.size ?? '0', 10) || 0,
      });
      if (out.length >= maxFiles) return out;
    }
  }
  return out;
}

async function verify(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Range: 'bytes=0-200' } });
    const ct = res.headers.get('content-type') ?? '';
    if ((res.status === 200 || res.status === 206) && /audio|ogg|mpeg/i.test(ct)) {
      await res.body?.cancel();
      return ct.split(';')[0];
    }
    await res.body?.cancel();
  } catch { /* unreachable host counts as failure */ }
  return null;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const startedAt = new Date();
  try {
    const auth = await authorizeJob(req, 'sync-archive-audio');
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    const admin = auth.admin;
    const isCron = auth.kind === 'job';

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* empty body is fine */ }
    const offset = Math.max(0, Number(body.offset ?? 0) | 0);
    const limit = Math.min(30, Math.max(1, Number(body.limit ?? 8) | 0));
    const perQuery = Math.min(10, Math.max(1, Number(body.perQuery ?? 5) | 0));
    const maxFiles = Math.min(10, Math.max(1, Number(body.maxFiles ?? 5) | 0));


    const { data: existingRows } = await admin.from('audio_library').select('title').limit(2000);
    const seen = new Set((existingRows ?? []).map((r: { title: string }) => normalise(r.title)));

    const slice = QUERIES.slice(offset, offset + limit);
    const toInsert: Record<string, unknown>[] = [];
    let checked = 0;
    let rejected = 0;

    for (const q of slice) {
      const docs = await searchArchive(q.query, perQuery);
      for (const doc of docs) {
        const artistRaw = Array.isArray(doc.creator) ? doc.creator[0] : doc.creator;
        const artist = (artistRaw ?? 'Traditional').toString().slice(0, 100);
        const cands = await candidatesFor(doc.identifier, artist, maxFiles);
        const verified = await mapLimit(cands, 5, async (c) => ({ c, ct: await verify(c.audio_url) }));
        for (const { c, ct } of verified) {
          checked++;
          if (!ct) { rejected++; continue; }
          const title = c.title;
          if (title.length < 4 || title.length > 90) { rejected++; continue; }
          if (title.split(' ').some((w) => w.length > 16)) { rejected++; continue; }
          const key = normalise(title);
          if (key.length < 3 || seen.has(key)) { rejected++; continue; }
          seen.add(key);
          toInsert.push({
            title,
            artist: c.artist || 'Traditional',
            category: categorise(title, q.category),
            language: q.language,
            duration: c.duration,
            audio_url: c.audio_url,
            mirror_urls: c.mirror_urls,
            associated_deity: tagDeity(title, q.deity),
            content_type: ct,
            content_length: c.size || null,
            url_status: 'ok',
            last_checked_at: new Date().toISOString(),
          });
        }
      }
    }

    let insertedCount = 0;
    const errors: string[] = [];
    for (let i = 0; i < toInsert.length; i += 50) {
      const chunk = toInsert.slice(i, i + 50);
      const { error } = await admin.from('audio_library').insert(chunk);
      if (error) errors.push(error.message);
      else insertedCount += chunk.length;
    }

    const finishedAt = new Date();
    await admin.from('ingestion_runs').insert({
      source: 'archive-audio',
      trigger_kind: isCron ? 'cron' : 'manual',
      status: errors.length ? 'partial' : 'success',
      inserted_count: insertedCount,
      updated_count: 0,
      skipped_count: rejected,
      error_count: errors.length,
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
      log: { offset, limit, checked, errors: errors.slice(0, 10) },
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
    });

    return json({
      queries_processed: slice.length,
      next_offset: offset + slice.length < QUERIES.length ? offset + slice.length : null,
      files_checked: checked,
      rejected,
      inserted_count: insertedCount,
      errors: errors.slice(0, 5),
    });
  } catch (e) {
    console.error('sync-archive-audio error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
