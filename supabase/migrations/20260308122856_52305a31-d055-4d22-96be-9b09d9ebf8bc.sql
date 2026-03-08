SELECT cron.schedule(
  'daily-festival-notifications',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url:='https://rbdbrbijgehakdsmnccm.supabase.co/functions/v1/festival-notifications',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZGJyYmlqZ2VoYWtkc21uY2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjYzMjYsImV4cCI6MjA3MjMwMjMyNn0.Mr__j2FL8ZrJz9lj40iIobKxBw3GfOFI4zO0XBn8pQE"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);