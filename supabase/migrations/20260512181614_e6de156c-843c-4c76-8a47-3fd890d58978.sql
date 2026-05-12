-- Phase H: Scale indexes for 1M users — fast search across saints/temples/audio + composite indexes for hot queries.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_saints_name_trgm
  ON public.saints USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_temples_name_trgm
  ON public.temples USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_audio_library_title_trgm
  ON public.audio_library USING gin (title gin_trgm_ops);

-- Hot lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_saints_tradition ON public.saints (tradition);
CREATE INDEX IF NOT EXISTS idx_temples_primary_deity ON public.temples (primary_deity);
CREATE INDEX IF NOT EXISTS idx_audio_library_category_lang ON public.audio_library (category, language);
CREATE INDEX IF NOT EXISTS idx_audio_library_url_status ON public.audio_library (url_status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events (date);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON public.user_activities (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility_created ON public.community_posts (visibility, created_at DESC);
