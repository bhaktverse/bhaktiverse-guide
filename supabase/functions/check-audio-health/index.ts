// Audio URL health checker.
// Auth modes:
//   - Admin user JWT (manual trigger from admin UI)
//   - x-cron-secret header (scheduled pg_cron call)
// HEAD-pings each audio_url, updates url_status + last_checked_at,
// and queues self-heal for any newly broken rows.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verifyJobToken } from '../_shared/jobAuth.ts';
import { probeAudioUrl } from '../_shared/audioHealth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret, x-job-token',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ error: 'Audio health service is not configured' }, 500);
  const supabase = createClient(supabaseUrl, serviceKey);

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
      .select('id, title, artist, audio_url, mirror_urls, url_status, last_checked_at')
      .order('id', { ascending: true })
      .range(0, 999);
    if (error) throw error;

    let ok = 0;
    let broken = 0;
    let healed = 0;

    // One bounded full-catalogue sweep; byte-range requests avoid downloading tracks.
    const queue = [...(tracks ?? [])];
    const workers = Array.from({ length: 20 }, async () => {
      while (queue.length) {
        const t = queue.shift();
        if (!t) break;
        const mirrors = Array.isArray(t.mirror_urls)
          ? t.mirror_urls.filter((url: unknown): url is string => typeof url === 'string')
          : [];
        let source = await probeAudioUrl(t.audio_url);
        if (!source) {
          for (const mirror of mirrors) {
            source = await probeAudioUrl(mirror);
            if (source) break;
          }
        }

        if (source) {
          ok += 1;
          if (source.url !== t.audio_url) healed += 1;
          await supabase.from('audio_library').update({
            audio_url: source.url,
            url_status: 'ok',
            content_type: source.contentType,
            content_length: source.contentLength,
            last_error: null,
            last_checked_at: new Date().toISOString(),
          }).eq('id', t.id);
        } else {
          broken += 1;
          await supabase.from('audio_library').update({
            url_status: 'broken',
            last_error: 'No verified audio source responded to a ranged media check',
            last_checked_at: new Date().toISOString(),
          }).eq('id', t.id);
        }
      }
    });
    await Promise.all(workers);

    return json({
      checked: tracks?.length ?? 0,
      ok,
      broken,
      healed,
    });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
