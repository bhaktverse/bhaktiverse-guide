// Admin/cron: probe every audio track, follow redirects, attempt rehost from Archive.org.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { notifyJobFailure } from "../_shared/notify.ts";
import { verifyJobToken } from '../_shared/jobAuth.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-job-token",
};

async function probe(url: string) {
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!r.ok && r.status !== 405) {
      // Try GET range
      r = await fetch(url, { method: "GET", headers: { Range: "bytes=0-1024" } });
    }
    return {
      ok: r.ok,
      status: r.status,
      finalUrl: r.url,
      contentType: r.headers.get("content-type"),
      contentLength: Number(r.headers.get("content-length") ?? 0) || null,
    };
  } catch (e) {
    return { ok: false, status: 0, error: String(e) };
  }
}

async function rehostFromArchive(url: string): Promise<string | null> {
  const m = url.match(/archive\.org\/download\/([^/]+)/);
  if (!m) return null;
  const item = m[1];
  try {
    const r = await fetch(`https://archive.org/metadata/${item}`);
    if (!r.ok) return null;
    const j = await r.json();
    const file = (j.files ?? []).find((f: any) => /\.(mp3|ogg|m4a)$/i.test(f.name));
    if (!file) return null;
    return `https://archive.org/download/${item}/${encodeURIComponent(file.name)}`;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = req.headers.get("Authorization");
  const cronKey = req.headers.get("x-cron-key");
  const SB_URL = Deno.env.get("SUPABASE_URL")!;
  const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(SB_URL, SRV);

  const jobTokenOk = await verifyJobToken(supabase, req.headers.get("x-job-token"), "audio-self-heal");
  const isCron = jobTokenOk || (cronKey && cronKey === Deno.env.get("CRON_SECRET"));
  if (!isCron) {
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const u = createClient(SB_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: user } = await u.auth.getUser();
    if (!user?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: ok } = await u.rpc("has_role", { _user_id: user.user.id, _role: "admin" });
    if (!ok) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  }

  const startedAt = Date.now();
  const { data: runRow } = await supabase
    .from("audio_heal_runs")
    .insert({ status: "running", trigger_kind: isCron ? "cron" : "manual" })
    .select("id").single();
  const runId = runRow?.id as string | undefined;

  let ok = 0, healed = 0, broken = 0, failed = 0;
  const details: Array<Record<string, unknown>> = [];
  try {
    const { data: tracks } = await supabase.from("audio_library").select("id, title, audio_url").limit(500);
    for (const t of tracks ?? []) {
      const p = await probe(t.audio_url);
      if (p.ok) {
        ok++;
        await supabase.from("audio_library").update({
          url_status: "ok",
          content_type: (p as any).contentType, content_length: (p as any).contentLength,
          last_error: null, last_checked_at: new Date().toISOString(),
        }).eq("id", t.id);
        continue;
      }
      const replacement = await rehostFromArchive(t.audio_url);
      if (replacement) {
        const p2 = await probe(replacement);
        if (p2.ok) {
          healed++;
          details.push({ id: t.id, title: t.title, action: "healed", from: t.audio_url, to: replacement });
          await supabase.from("audio_library").update({
            audio_url: replacement, url_status: "ok",
            content_type: (p2 as any).contentType, content_length: (p2 as any).contentLength,
            last_error: null, last_checked_at: new Date().toISOString(),
          }).eq("id", t.id);
          continue;
        }
      }
      broken++;
      failed++;
      details.push({ id: t.id, title: t.title, action: "broken", status: p.status });
      await supabase.from("audio_library").update({
        url_status: "broken", last_error: `HTTP ${p.status}`, last_checked_at: new Date().toISOString(),
      }).eq("id", t.id);
    }

    const totalChecked = (tracks?.length ?? 0);
    if (runId) {
      await supabase.from("audio_heal_runs").update({
        status: "ok", total_checked: totalChecked,
        healthy_count: ok, healed_count: healed, broken_count: broken, failed_count: failed,
        details: details.slice(0, 200),
        duration_ms: Date.now() - startedAt,
        finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    if (broken > 0 && totalChecked > 0 && broken / totalChecked > 0.05) {
      await notifyJobFailure({
        job: "audio-self-heal", status: "degraded", run_id: runId ?? null,
        reason: `${broken}/${totalChecked} tracks broken (${Math.round(broken / totalChecked * 100)}%)`,
        details: { ok, healed, broken, failed },
      });
    }

    return new Response(JSON.stringify({ checked: totalChecked, ok, healed, broken, runId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (runId) {
      await supabase.from("audio_heal_runs").update({
        status: "failed", error: String(e),
        duration_ms: Date.now() - startedAt, finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }
    await notifyJobFailure({
      job: "audio-self-heal", status: "failed", run_id: runId ?? null,
      reason: String(e),
    });
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

