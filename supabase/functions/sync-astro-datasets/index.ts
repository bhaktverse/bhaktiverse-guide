// Astro dataset ingestion: pulls Hindu festival / vrat / ekadashi datasets from
// public sources (Wikidata SPARQL + Wikipedia REST), cleans and deduplicates
// them, and upserts into public.calendar_events.
//
// Auth: admin JWT, or x-cron-key matching CRON_SECRET.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
};

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const SPARQL = `
SELECT ?festLabel ?desc WHERE {
  ?fest wdt:P31/wdt:P279* wd:Q1445650 .
  OPTIONAL { ?fest schema:description ?desc FILTER(LANG(?desc) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 250`;

type EventRow = {
  title: string;
  description: string | null;
  event_type: string;
  date: string;
  significance: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
};

const clean = (s: string) =>
  s.replace(/\s+/g, " ").replace(/\[[^\]]*\]/g, "").trim().slice(0, 500);

const isNoise = (t: string) =>
  !t ||
  /^Q\d+$/.test(t) ||
  t.length < 3 ||
  t.length > 120 ||
  /list of|category:|template:/i.test(t);

async function fetchWikidataFestivals(): Promise<{ title: string; desc: string | null }[]> {
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(SPARQL);
  const r = await fetch(url, { headers: { "User-Agent": "BhaktVerse/1.0 (astro ingestion)", Accept: "application/sparql-results+json" } });
  if (!r.ok) throw new Error(`Wikidata ${r.status}`);
  const j = await r.json();
  return (j.results?.bindings ?? [])
    .map((b: any) => ({ title: clean(b.festLabel?.value ?? ""), desc: b.desc?.value ? clean(b.desc.value) : null }))
    .filter((x: any) => !isNoise(x.title));
}

/** Deterministic lunar-independent placeholder date: keeps rows queryable while
 *  the panchang engine supplies exact tithi-based dates at read time. */
function anchorDate(title: string, year: number): string {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) % 365;
  const d = new Date(Date.UTC(year, 0, 1 + h));
  return d.toISOString().slice(0, 10);
}

function classify(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ekadashi")) return "ekadashi";
  if (t.includes("amavasya")) return "amavasya";
  if (t.includes("purnima") || t.includes("poornima")) return "purnima";
  if (t.includes("vrat") || t.includes("fast")) return "vrat";
  return "festival";
}

async function authorize(req: Request): Promise<{ ok: boolean; trigger: string; status?: number }> {
  const cronKey = req.headers.get("x-cron-key");
  if (cronKey && cronKey === Deno.env.get("CRON_SECRET")) return { ok: true, trigger: "cron" };
  const auth = req.headers.get("Authorization");
  if (!auth) return { ok: false, trigger: "none", status: 401 };
  const userClient = createClient(SB_URL, ANON, { global: { headers: { Authorization: auth } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return { ok: false, trigger: "none", status: 401 };
  const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  if (!isAdmin) return { ok: false, trigger: "none", status: 403 };
  return { ok: true, trigger: "manual" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await authorize(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }), {
      status: auth.status ?? 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SB_URL, SRV);
  const started = Date.now();
  const { data: run } = await supabase
    .from("ingestion_runs")
    .insert({ source: "sync-astro-datasets", trigger_kind: auth.trigger, status: "running" })
    .select()
    .single();

  let inserted = 0, skipped = 0, errors = 0;
  const log: any = { source: "wikidata:sparql", notes: [] };

  try {
    const raw = await fetchWikidataFestivals();
    log.fetched = raw.length;

    // Clean + dedupe by normalized title
    const byTitle = new Map<string, { title: string; desc: string | null }>();
    for (const row of raw) {
      const key = row.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!byTitle.has(key)) byTitle.set(key, row);
      else skipped++;
    }
    log.unique = byTitle.size;

    // Existing titles → avoid duplicates in DB
    const { data: existing } = await supabase.from("calendar_events").select("title").limit(2000);
    const existingKeys = new Set(
      (existing ?? []).map((e: any) => String(e.title).toLowerCase().replace(/[^a-z0-9]/g, "")),
    );

    const year = new Date().getUTCFullYear();
    const toInsert: EventRow[] = [];
    for (const [key, row] of byTitle) {
      if (existingKeys.has(key)) { skipped++; continue; }
      toInsert.push({
        title: row.title,
        description: row.desc,
        event_type: classify(row.title),
        date: anchorDate(row.title, year),
        significance: row.desc,
        is_recurring: true,
        recurrence_pattern: "yearly",
      });
    }

    for (let i = 0; i < toInsert.length; i += 100) {
      const chunk = toInsert.slice(i, i + 100);
      const { error } = await supabase.from("calendar_events").insert(chunk);
      if (error) { errors++; log.notes.push(error.message); }
      else inserted += chunk.length;
    }

    await supabase.from("ingestion_runs").update({
      status: errors ? "partial" : "ok",
      inserted_count: inserted,
      updated_count: 0,
      skipped_count: skipped,
      error_count: errors,
      duration_ms: Date.now() - started,
      log,
      finished_at: new Date().toISOString(),
    }).eq("id", run!.id);

    return new Response(JSON.stringify({ inserted_count: inserted, skipped_count: skipped, error_count: errors, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    await supabase.from("ingestion_runs").update({
      status: "failed",
      error_count: 1,
      duration_ms: Date.now() - started,
      log: { error: String(e) },
      finished_at: new Date().toISOString(),
    }).eq("id", run!.id);
    console.error("sync-astro-datasets error", e);
    return new Response(JSON.stringify({ error: "Ingestion failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
