// Admin/cron: fan out to all sync functions, dedupe, log to ingestion_runs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const SOURCES = [
  "sync-wikipedia-saints",
  "sync-wikidata-temples",
  "sync-scriptures",
  "sync-archive-audio",
  "sync-genius-lyrics",
  "check-audio-health",
];

async function callFn(name: string, auth: string) {
  const r = await fetch(`${SB_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: auth },
    body: "{}",
  });
  const text = await r.text();
  try { return { ok: r.ok, status: r.status, body: JSON.parse(text) }; }
  catch { return { ok: r.ok, status: r.status, body: text }; }
}

async function dedupe(supabase: any) {
  // Dedup saints by exact name match
  const dedupes: Record<string, number> = { saints: 0, temples: 0 };
  for (const table of ["saints", "temples"]) {
    const { data } = await supabase.rpc("exec_dedupe_noop").select?.() ?? { data: null };
    void data;
    // Soft dedupe: find duplicate names, keep oldest
    const { data: dups } = await supabase
      .from(table)
      .select("id,name,created_at")
      .order("created_at", { ascending: true });
    if (!dups) continue;
    const seen = new Map<string, string>();
    const toDelete: string[] = [];
    for (const row of dups) {
      const key = String(row.name).trim().toLowerCase();
      if (seen.has(key)) toDelete.push(row.id);
      else seen.set(key, row.id);
    }
    if (toDelete.length) {
      await supabase.from(table).delete().in("id", toDelete);
      dedupes[table] = toDelete.length;
    }
  }
  return dedupes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(SB_URL, SRV);

  const auth = req.headers.get("Authorization");
  const cronKey = req.headers.get("x-cron-key");
  let trigger = "manual";
  if (cronKey && cronKey === Deno.env.get("CRON_SECRET")) trigger = "cron";
  else if (auth) {
    const userClient = createClient(SB_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  } else {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const summary: any = { sources: [] };
  for (const src of SOURCES) {
    const started = Date.now();
    const { data: row } = await supabase.from("ingestion_runs")
      .insert({ source: src, trigger_kind: trigger, status: "running" }).select().single();
    const result = await callFn(src, auth ?? `Bearer ${ANON}`);
    const body = result.body as any;
    await supabase.from("ingestion_runs").update({
      status: result.ok ? "ok" : "failed",
      inserted_count: body?.inserted_count ?? 0,
      updated_count: body?.updated_count ?? 0,
      skipped_count: body?.skipped_count ?? body?.checked ?? 0,
      error_count: result.ok ? 0 : 1,
      duration_ms: Date.now() - started,
      log: body, finished_at: new Date().toISOString(),
    }).eq("id", row!.id);
    summary.sources.push({ source: src, ok: result.ok, body });
  }

  try { summary.dedupe = await dedupe(supabase); } catch (e) { summary.dedupe_error = String(e); }

  return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
