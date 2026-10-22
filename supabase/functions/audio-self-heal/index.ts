// Admin/cron: probe every audio track, follow redirects, attempt rehost from Archive.org.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { notifyJobFailure } from "../_shared/notify.ts";
import { verifyJobToken } from '../_shared/jobAuth.ts';
import { probeAudioUrl } from '../_shared/audioHealth.ts';

// Archive.org candidates reviewed against each recording; never select an
// arbitrary file from an Archive.org item as an automatic replacement.
const VERIFIED_REPLACEMENTS: Record<string, string> = {
  'bcd6bb43-22b1-4aad-985e-86d433b7ab0a': 'https://archive.org/download/ghar-mein-padharo-gajanan-ji_202409/Ghar-Mein-Padharo-Gajanan-Ji.mp3',
  '517fa897-3f5a-49de-b3f3-f6a9fea99bf1': 'https://archive.org/download/Ramayana_721/4KISHKANYAA_KANDA.mp3',
  'fdb7f6d2-bdf1-47f9-989f-6de1c2a97d0f': 'https://archive.org/download/BestKrishnaBhajan1-151/Aas%20Rakho%20Satguru%20Ki.mp3',
  'fe0173e9-6ee4-48c2-a60f-bd970428672e': 'https://archive.org/download/AchyutamKeshavam/Achyutam%20Keshavam.mp3',
  '81847946-824b-4703-802c-2164b1b902a9': 'https://archive.org/download/BhagawanSatyaSaiBabaSingsBhajans/Baba%20Sings%20Volume_1%2FTrack%2013Shivaya%20parameshwaraya.mp3',
  '1fcf00ca-aad9-4c48-b0d5-93124b16e00e': 'https://archive.org/download/01-bajrang-baan/01%20-%20Bajrang%20Baan.mp3',
  '52347bcc-2fcc-444d-b92f-f59ec478f0e0': 'https://archive.org/download/HindiBhajanmp3-HanumanChalisaAartiyaan/6-aartiKeejeHanumanLalaKiaarti-Vol-3.mp3',
  '72d4a0ed-960a-4940-a25e-91237b38c70e': 'https://archive.org/download/radio-ceylon-08-08-2021-sunday-morning-/Radio%20Ceylon%2008-08-2021~Sunday%20Morning~01%20Bhakti%20Sangeet%20-.mp3',
  '20c27b95-ea66-4804-a1dc-cc3ba9f27082': 'https://archive.org/download/VishnuSahasranamamSooryagayathri/Vishnu%20Sahasranamam-Sooryagayathri.mp3',
  '0eb88009-8c68-4661-b4ae-aa005b17b701': 'https://archive.org/download/sunderkand4/Sunderkand%20-%201.mp3',
  '4eed1a33-235c-4ee1-9e1e-73f01de5a880': 'https://archive.org/download/fptu_aarti-keejei-hanuman-lala-ki/AartiKeejeiHanumanLalaKi.mp3',
  'a72b9712-4621-4567-8600-d03ed72701d0': 'https://archive.org/download/05-shri-hanuman-chalisa/05%20SHRI%20HANUMAN%20CHALISA.mp3',
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-job-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SB_URL = Deno.env.get("SUPABASE_URL");
  const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ANON = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SB_URL || !SRV || !ANON) return new Response(JSON.stringify({ error: "Audio repair is not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let requestedIds: string[] | null = null;
  const bodyText = await req.text();
  if (bodyText.trim()) {
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Request body must be valid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!body || typeof body !== "object" || !("ids" in body)) {
      return new Response(JSON.stringify({ error: "Request body must include an ids array" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const ids = (body as { ids?: unknown }).ids;
    if (!Array.isArray(ids) || ids.length > 100 || ids.some((id) => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
      return new Response(JSON.stringify({ error: "ids must contain at most 100 UUIDs" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    requestedIds = ids;
  }

  const auth = req.headers.get("Authorization");
  const cronKey = req.headers.get("x-cron-key");
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
    let tracksQuery = supabase.from("audio_library").select("id, title, audio_url, mirror_urls").eq("url_status", "broken").order("last_checked_at", { ascending: true, nullsFirst: true }).limit(100);
    if (requestedIds) tracksQuery = tracksQuery.in("id", requestedIds);
    const { data: tracks, error: tracksError } = await tracksQuery;
    if (tracksError) throw tracksError;
    const queue = [...(tracks ?? [])];
    const workers = Array.from({ length: 5 }, async () => {
      while (queue.length) {
      const t = queue.shift();
      if (!t) return;
      const mirrors = Array.isArray(t.mirror_urls) ? t.mirror_urls.filter((url: unknown): url is string => typeof url === "string") : [];
      let source = await probeAudioUrl(t.audio_url);
      if (!source) {
        for (const mirror of mirrors) {
          source = await probeAudioUrl(mirror);
          if (source) break;
        }
      }
      const verifiedReplacement = VERIFIED_REPLACEMENTS[t.id];
      if (!source && verifiedReplacement) source = await probeAudioUrl(verifiedReplacement);
      if (source) {
        ok++;
        if (source.url !== t.audio_url) healed++;
        details.push({ id: t.id, title: t.title, action: source.url === t.audio_url ? "confirmed" : "healed" });
        await supabase.from("audio_library").update({
          audio_url: source.url, url_status: "ok", content_type: source.contentType,
          content_length: source.contentLength, last_error: null, last_checked_at: new Date().toISOString(),
        }).eq("id", t.id);
      } else {
        broken++;
        failed++;
        details.push({ id: t.id, title: t.title, action: "broken" });
        await supabase.from("audio_library").update({
          url_status: "broken", last_error: "No verified audio source responded to a ranged media check", last_checked_at: new Date().toISOString(),
        }).eq("id", t.id);
      }
      }
    });
    await Promise.all(workers);

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

