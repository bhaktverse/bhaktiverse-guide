// Shared authorisation helper for scheduled/background edge functions.
//
// Two accepted paths:
//  1. Admin JWT in the Authorization header.
//  2. A single-use `x-job-token` minted by pg_cron into public.internal_job_tokens.
//
// The token path exists because Postgres cannot read edge-function secrets, so
// the previous `x-cron-secret` + `current_setting('app.cron_secret')` scheme
// silently resolved to NULL and every scheduled job got a 401.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret, x-job-token',
};

export type AuthResult =
  | { ok: true; kind: 'admin' | 'job'; admin: SupabaseClient }
  | { ok: false; status: number; error: string };

export async function authorizeJob(req: Request, purpose: string): Promise<AuthResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  // 1. Single-use job token minted by pg_cron.
  const jobToken = req.headers.get('x-job-token');
  if (jobToken) {
    const { data, error } = await admin
      .from('internal_job_tokens')
      .select('token, purpose, expires_at')
      .eq('token', jobToken)
      .maybeSingle();
    // Burn the token regardless of validity so it can never be replayed.
    await admin.from('internal_job_tokens').delete().eq('token', jobToken);
    await admin.from('internal_job_tokens').delete().lt('expires_at', new Date().toISOString());
    if (
      !error && data &&
      data.purpose === purpose &&
      new Date(data.expires_at).getTime() > Date.now()
    ) {
      return { ok: true, kind: 'job', admin };
    }
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  // 2. Legacy cron secret, still honoured when it is actually configured.
  const cronSecret = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret');
  if (cronSecret && provided && provided === cronSecret) {
    return { ok: true, kind: 'job', admin };
  }

  // 3. Admin JWT.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { ok: false, status: 401, error: 'Unauthorized' };
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return { ok: false, status: 401, error: 'Unauthorized' };
  const { data: isAdmin } = await userClient.rpc('has_role', {
    _user_id: userData.user.id,
    _role: 'admin',
  });
  if (!isAdmin) return { ok: false, status: 403, error: 'Forbidden' };
  return { ok: true, kind: 'admin', admin };
}

/** Verify + burn a single-use pg_cron job token. Requires a service-role client. */
export async function verifyJobToken(
  admin: SupabaseClient,
  token: string | null,
  purpose: string,
): Promise<boolean> {
  if (!token) return false;
  const { data } = await admin
    .from('internal_job_tokens')
    .select('token, purpose, expires_at')
    .eq('token', token)
    .maybeSingle();
  await admin.from('internal_job_tokens').delete().eq('token', token);
  await admin.from('internal_job_tokens').delete().lt('expires_at', new Date().toISOString());
  return !!data && data.purpose === purpose && new Date(data.expires_at).getTime() > Date.now();
}
