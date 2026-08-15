// Telemetry alerting: scans recent audio reliability telemetry and notifies
// admins when reliability degrades (repeated fallback-to-network, high retry
// failure rate, or a growing offline cache-miss rate).
//
// Invoked by pg_cron with an internal job token, or manually by an admin JWT.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJobToken } from "../_shared/jobAuth.ts";
import { notifyJobFailure } from "../_shared/notify.ts";

const WINDOW_HOURS = 6;

// Alert thresholds — tuned so normal traffic stays quiet.
const TH = {
  minEvents: 25,          // don't alert on tiny samples
  fallbackRate: 0.20,     // >20% of plays falling back to network/mirror
  retryFailureRate: 0.30, // >30% of retries ending in failure
  cacheMissRate: 0.50,    // >50% of cache lookups missing
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Auth: internal job token OR an admin user JWT.
  let authorized = false;
  try {
    const body = req.method === "POST" ? await req.clone().json().catch(() => ({})) : {};
    if (body?.job_token) {
      authorized = await verifyJobToken(supabase, body.job_token, "telemetry-alerts");
    }
    if (!authorized) {
      const header = req.headers.get("Authorization");
      if (header?.startsWith("Bearer ")) {
        const jwt = header.replace("Bearer ", "");
        const { data } = await supabase.auth.getClaims(jwt);
        const uid = data?.claims?.sub as string | undefined;
        if (uid) {
          const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
          authorized = !!isAdmin;
        }
      }
    }
  } catch {
    authorized = false;
  }

  if (!authorized) return json({ error: "Unauthorized" }, 401);

  const since = new Date(Date.now() - WINDOW_HOURS * 3600_000).toISOString();
  const { data: events, error } = await supabase
    .from("audio_reliability_events")
    .select("event_type, outcome, created_at")
    .gte("created_at", since)
    .limit(5000);

  if (error) return json({ error: "query_failed" }, 500);

  const rows = events ?? [];
  const count = (t: string) => rows.filter((r) => r.event_type === t).length;

  const plays = count("network_play") + count("cache_hit");
  const fallbacks = count("fallback_network") + count("fallback_mirror");
  const retries = count("retry");
  const retryFailures = rows.filter((r) => r.event_type === "retry" && r.outcome === "failure").length;
  const cacheHits = count("cache_hit");
  const cacheMisses = count("cache_miss");

  const metrics = {
    window_hours: WINDOW_HOURS,
    total_events: rows.length,
    plays,
    fallbacks,
    fallback_rate: plays ? +(fallbacks / plays).toFixed(3) : 0,
    retries,
    retry_failures: retryFailures,
    retry_failure_rate: retries ? +(retryFailures / retries).toFixed(3) : 0,
    cache_hits: cacheHits,
    cache_misses: cacheMisses,
    cache_miss_rate: cacheHits + cacheMisses ? +(cacheMisses / (cacheHits + cacheMisses)).toFixed(3) : 0,
  };

  const alerts: string[] = [];
  if (rows.length >= TH.minEvents) {
    if (metrics.fallback_rate > TH.fallbackRate)
      alerts.push(`Fallback-to-network rate ${(metrics.fallback_rate * 100).toFixed(0)}% (> ${TH.fallbackRate * 100}%)`);
    if (metrics.retry_failure_rate > TH.retryFailureRate)
      alerts.push(`Retry failure rate ${(metrics.retry_failure_rate * 100).toFixed(0)}% (> ${TH.retryFailureRate * 100}%)`);
    if (metrics.cache_miss_rate > TH.cacheMissRate)
      alerts.push(`Offline cache miss rate ${(metrics.cache_miss_rate * 100).toFixed(0)}% (> ${TH.cacheMissRate * 100}%)`);
  }

  if (alerts.length) {
    await notifyJobFailure({
      job: "telemetry-alerts",
      status: "degraded",
      reason: alerts.join(" · "),
      details: metrics as unknown as Record<string, unknown>,
    });

    // In-app notification for every admin.
    const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (admins?.length) {
      await supabase.from("notifications").insert(
        admins.map((a) => ({
          user_id: a.user_id,
          type: "system",
          title: "Audio reliability degraded",
          message: alerts.join(" · "),
          data: metrics,
        })),
      );
    }
  }

  return json({ ok: true, alerts, metrics });
});
