DROP INDEX IF EXISTS public.idx_user_challenge_completions_user;
DROP INDEX IF EXISTS public.idx_palm_reading_history_created_at;
DROP INDEX IF EXISTS public.idx_palm_reading_history_user_id;
DROP INDEX IF EXISTS public.idx_audio_library_url_status;
DROP INDEX IF EXISTS public.idx_notifications_created_at;

CREATE INDEX IF NOT EXISTS idx_audio_library_health_queue
  ON public.audio_library (last_checked_at ASC NULLS FIRST);

CREATE INDEX IF NOT EXISTS idx_audio_library_playable_created
  ON public.audio_library (created_at DESC)
  WHERE url_status IS DISTINCT FROM 'broken';

CREATE INDEX IF NOT EXISTS idx_user_activities_user_date
  ON public.user_activities (user_id, created_at DESC, activity_type);

CREATE INDEX IF NOT EXISTS idx_audio_events_type_user_created
  ON public.audio_reliability_events (event_type, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_cache_live_lookup
  ON public.api_response_cache (function_name, expires_at, cache_key);