// Audio URL health checker — admin-triggered. Pings HEAD on each audio_url
// and updates url_status: 'ok' | 'broken' | 'unknown'.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify admin
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', userRes.user.id);
    const isAdmin = roles?.some((r: any) => r.role === 'admin');
    if (!isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

    const { data: tracks, error } = await supabase
      .from('audio_library')
      .select('id, audio_url')
      .limit(500);
    if (error) throw error;

    let ok = 0, broken = 0;
    for (const t of tracks ?? []) {
      let status: 'ok' | 'broken' = 'broken';
      try {
        const r = await fetch(t.audio_url, { method: 'HEAD', redirect: 'follow' });
        if (r.ok) { status = 'ok'; ok++; } else { broken++; }
      } catch { broken++; }
      await supabase.from('audio_library').update({
        url_status: status, last_checked_at: new Date().toISOString(),
      }).eq('id', t.id);
    }

    return new Response(JSON.stringify({ checked: tracks?.length ?? 0, ok, broken }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
