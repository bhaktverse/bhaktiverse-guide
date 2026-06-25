// Admin-only end-to-end QA runner. Probes routes, edge functions, and DB invariants.
// Writes results into qa_runs / qa_results.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PREVIEW_BASE = Deno.env.get("PUBLIC_APP_URL") ?? "https://bhaktverse.lovable.app";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

type Result = { suite: string; test_name: string; status: "passed" | "failed" | "skipped"; duration_ms: number; error?: string; details?: any };

const ROUTES = [
  "/", "/dashboard", "/palm-reading", "/saints", "/temples", "/scriptures",
  "/audio-library", "/horoscope", "/numerology", "/kundali-match",
  "/community", "/premium", "/auth", "/profile", "/favorites", "/leaderboard",
];

const FN_PROBES: Array<{ name: string; body?: any; expect?: number[] }> = [
  { name: "hindu-panchang", body: { date: new Date().toISOString().slice(0, 10) } },
  { name: "daily-horoscope", body: { sign: "aries" } },
  { name: "numerology-analysis", body: { name: "Test", dob: "1990-01-01" } },
  { name: "jamendo-tracks", body: { tags: "meditation", limit: 1 } },
  { name: "astro-engine", body: { dob: "1990-01-01", tob: "12:00", lat: 19, lon: 73 } },
];

const TABLES_PUBLIC_READ = ["saints", "temples", "scriptures", "audio_library", "spiritual_content"];

async function probeRoute(path: string): Promise<Result> {
  const t = Date.now();
  try {
    const r = await fetch(`${PREVIEW_BASE}${path}`, { redirect: "follow" });
    const ok = r.status === 200;
    return { suite: "routes", test_name: `GET ${path}`, status: ok ? "passed" : "failed", duration_ms: Date.now() - t, error: ok ? undefined : `HTTP ${r.status}` };
  } catch (e) {
    return { suite: "routes", test_name: `GET ${path}`, status: "failed", duration_ms: Date.now() - t, error: String(e) };
  }
}

async function probeFn(name: string, body: any, expect = [200, 401, 429]): Promise<Result> {
  const t = Date.now();
  try {
    const r = await fetch(`${SB_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify(body ?? {}),
    });
    const ok = expect.includes(r.status);
    let detail: any;
    try { detail = await r.json(); } catch { /* */ }
    return { suite: "edge_functions", test_name: name, status: ok ? "passed" : "failed", duration_ms: Date.now() - t, error: ok ? undefined : `HTTP ${r.status}`, details: detail };
  } catch (e) {
    return { suite: "edge_functions", test_name: name, status: "failed", duration_ms: Date.now() - t, error: String(e) };
  }
}

async function probeTable(supabase: any, table: string): Promise<Result> {
  const t = Date.now();
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) return { suite: "db", test_name: `read ${table}`, status: "failed", duration_ms: Date.now() - t, error: error.message };
  return { suite: "db", test_name: `read ${table}`, status: (count ?? 0) > 0 ? "passed" : "skipped", duration_ms: Date.now() - t, details: { count } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(SB_URL, SRV);

  // Auth: allow either admin-with-JWT, or cron header
  const auth = req.headers.get("Authorization");
  const cronKey = req.headers.get("x-cron-key");
  let triggeredBy: string | null = null;
  let trigger = "manual";
  if (cronKey && cronKey === Deno.env.get("CRON_SECRET")) {
    trigger = "cron";
  } else if (auth) {
    const userClient = createClient(SB_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    triggeredBy = u.user.id;
  } else {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const { data: run } = await supabase.from("qa_runs").insert({ triggered_by: triggeredBy, trigger_kind: trigger, status: "running" }).select().single();
  const runId = run!.id;
  const started = Date.now();

  const results: Result[] = [];
  results.push(...await Promise.all(ROUTES.map(probeRoute)));
  results.push(...await Promise.all(FN_PROBES.map(p => probeFn(p.name, p.body, p.expect))));
  results.push(...await Promise.all(TABLES_PUBLIC_READ.map(t => probeTable(supabase, t))));

  // Persist
  await supabase.from("qa_results").insert(results.map(r => ({ ...r, run_id: runId })));

  const passed = results.filter(r => r.status === "passed").length;
  const failed = results.filter(r => r.status === "failed").length;
  const skipped = results.filter(r => r.status === "skipped").length;

  await supabase.from("qa_runs").update({
    status: failed === 0 ? "passed" : "failed",
    total: results.length, passed, failed, skipped,
    duration_ms: Date.now() - started, finished_at: new Date().toISOString(),
  }).eq("id", runId);

  return new Response(JSON.stringify({ run_id: runId, total: results.length, passed, failed, skipped }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
