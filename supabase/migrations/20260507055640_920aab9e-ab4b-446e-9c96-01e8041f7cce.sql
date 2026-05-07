
-- Phase 4: hot-column indexes for scale
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility_created ON public.community_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_library_category ON public.audio_library(category);
CREATE INDEX IF NOT EXISTS idx_audio_library_language ON public.audio_library(language);
CREATE INDEX IF NOT EXISTS idx_audio_library_associated_deity ON public.audio_library(associated_deity);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_palm_reading_history_user_created ON public.palm_reading_history(user_id, created_at DESC);

-- Mark audio rows that fail health check
ALTER TABLE public.audio_library ADD COLUMN IF NOT EXISTS url_status text DEFAULT 'unknown';
ALTER TABLE public.audio_library ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_audio_library_url_status ON public.audio_library(url_status);
