-- Hourly telemetry alert scan. Mints a single-use job token (same handshake
-- used by the other scheduled jobs) and calls the telemetry-alerts function.
SELECT cron.unschedule('telemetry-alerts-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'telemetry-alerts-hourly');

SELECT cron.schedule(
  'telemetry-alerts-hourly',
  '15 * * * *',
  $$
  WITH t AS (
    INSERT INTO public.internal_job_tokens (token, purpose, expires_at)
    VALUES (gen_random_uuid(), 'telemetry-alerts', now() + interval '5 minutes')
    RETURNING token
  )
  SELECT net.http_post(
    url := 'https://rbdbrbijgehakdsmnccm.supabase.co/functions/v1/telemetry-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-job-token', (SELECT token::text FROM t)
    ),
    body := '{}'::jsonb
  );
  $$
);