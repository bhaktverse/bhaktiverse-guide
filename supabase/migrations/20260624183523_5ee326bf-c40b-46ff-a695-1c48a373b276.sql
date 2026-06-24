
CREATE TABLE IF NOT EXISTS public.astro_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  cache_key TEXT NOT NULL UNIQUE,
  dob DATE NOT NULL,
  tob TIME,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tz_offset DOUBLE PRECISION,
  chart JSONB NOT NULL,
  dashas JSONB,
  yogas JSONB,
  doshas JSONB,
  computed_with TEXT DEFAULT 'astronomia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.astro_charts TO authenticated;
GRANT ALL ON public.astro_charts TO service_role;
ALTER TABLE public.astro_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own or anonymous charts" ON public.astro_charts
  FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users insert charts" ON public.astro_charts
  FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_astro_charts_user ON public.astro_charts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_astro_charts_dob ON public.astro_charts(dob);

CREATE TABLE IF NOT EXISTS public.api_response_cache (
  cache_key TEXT PRIMARY KEY,
  function_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_response_cache TO authenticated, anon;
GRANT ALL ON public.api_response_cache TO service_role;
ALTER TABLE public.api_response_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cache" ON public.api_response_cache FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_fn ON public.api_response_cache(function_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_palm_history_user_created ON public.palm_reading_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kundali_user_created ON public.kundali_match_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_numerology_user_created ON public.numerology_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mantra_sessions_user_created ON public.mantra_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_library_status_cat ON public.audio_library(url_status, category);
CREATE INDEX IF NOT EXISTS idx_audio_library_deity ON public.audio_library(associated_deity);
CREATE INDEX IF NOT EXISTS idx_community_posts_vis_created ON public.community_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON public.post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_type ON public.user_favorites(user_id, content_type);

REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_reply() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_likes_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_comments_count() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_astro_charts_updated ON public.astro_charts;
CREATE TRIGGER trg_astro_charts_updated BEFORE UPDATE ON public.astro_charts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
