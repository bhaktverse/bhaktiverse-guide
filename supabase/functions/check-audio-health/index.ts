// Audio URL health checker.
// Auth modes:
//   - Admin user JWT (manual trigger from admin UI)
//   - x-cron-secret header (scheduled pg_cron call)
// HEAD-pings each audio_url, updates url_status + last_checked_at,
// and queues self-heal for any newly broken rows.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verifyJobToken } from '../_shared/jobAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret, x-job-token',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function headCheck(url: string, timeoutMs = 8000): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    clearTimeout(to);
    if (r.ok) return true;
    // Some CDNs reject HEAD — fall back to a 1-byte ranged GET.
    if (r.status === 405 || r.status === 403) {
      const ctrl2 = new AbortController();
      const to2 = setTimeout(() => ctrl2.abort(), timeoutMs);
      const r2 = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: ctrl2.signal,
      });
      clearTimeout(to2);
      return r2.ok || r2.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Auth: either admin JWT or matching cron secret.
  const jobTokenOk = await verifyJobToken(supabase, req.headers.get('x-job-token'), 'check-audio-health');
  const cronSecret = req.headers.get('x-cron-secret');
  const auth = req.headers.get('Authorization');
  let isAuthorized = false;
  if (jobTokenOk || (cronSecret && cronSecret === Deno.env.get('CRON_SECRET'))) {
    isAuthorized = true;
  } else if (auth) {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (userRes?.user) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userRes.user.id);
      isAuthorized = !!roles?.some((r: { role: string }) => r.role === 'admin');
    }
  }
  if (!isAuthorized) return json({ error: 'Unauthorized' }, 401);

  try {
    // Prefer rechecking stale rows first so we don't re-scan healthy URLs every run.
    const { data: tracks, error } = await supabase
      .from('audio_library')
      .select('id, title, artist, audio_url, url_status, last_checked_at')
      .order('last_checked_at', { ascending: true, nullsFirst: true })
      .limit(300);
    if (error) throw error;

    let ok = 0;
    let broken = 0;
    const newlyBroken: { id: string; title: string; artist: string | null }[] = [];

    // Bounded concurrency = 8 to stay polite to upstream CDNs.
    const queue = [...(tracks ?? [])];
    const workers = Array.from({ length: 8 }, async () => {
      while (queue.length) {
        const t = queue.shift();
        if (!t) break;
        const wasHealthy = t.url_status !== 'broken';
        const healthy = await headCheck(t.audio_url);
        if (healthy) ok++;
        else {
          broken++;
          if (wasHealthy) newlyBroken.push({ id: t.id, title: t.title, artist: t.artist });
        }
        await supabase
          .from('audio_library')
          .update({
            url_status: healthy ? 'ok' : 'broken',
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', t.id);
      }
    });
    await Promise.all(workers);

    // Fire-and-forget self-heal for newly broken rows.
    if (newlyBroken.length) {
      supabase.functions
        .invoke('audio-self-heal', { body: { ids: newlyBroken.map((b) => b.id) } })
        .catch(() => {/* logged downstream */});
    }

    return json({
      checked: tracks?.length ?? 0,
      ok,
      broken,
      heal_queued: newlyBroken.length,
    });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
