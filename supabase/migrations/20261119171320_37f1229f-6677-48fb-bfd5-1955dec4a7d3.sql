SELECT cron.unschedule('daily-festival-notifications');
SELECT cron.schedule('daily-festival-notifications', '0 18 * * *', $$
  with s as (select gen_random_uuid() as tok),
  ins as (insert into public.internal_job_tokens (token, purpose) select tok, 'festival-notifications' from s)
  select net.http_post(
    url := 'https://rbdbrbijgehakdsmnccm.supabase.co/functions/v1/festival-notifications',
    headers := jsonb_build_object('Content-Type','application/json','x-job-token', s.tok::text),
    body := '{}'::jsonb, timeout_milliseconds := 120000) from s;
$$);