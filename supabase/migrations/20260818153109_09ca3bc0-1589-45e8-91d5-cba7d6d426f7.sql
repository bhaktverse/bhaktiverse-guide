-- 1) No direct writes to progress tables from clients
REVOKE INSERT, UPDATE, DELETE ON public.spiritual_journey FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.audio_reliability_events FROM anon, authenticated;
GRANT ALL ON public.spiritual_journey TO service_role;
GRANT ALL ON public.audio_reliability_events TO service_role;

DROP POLICY IF EXISTS "Users can insert their own journey" ON public.spiritual_journey;
DROP POLICY IF EXISTS "Users can update their own journey" ON public.spiritual_journey;
DROP POLICY IF EXISTS "Users can create their own journey" ON public.spiritual_journey;

-- 2) Trigger guard: score columns may only change inside SECURITY DEFINER award functions
CREATE OR REPLACE FUNCTION public.guard_spiritual_journey_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) IN ('anon', 'authenticated') THEN
    RAISE EXCEPTION 'Progress can only be changed through award_activity/complete_daily_challenge';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_spiritual_journey ON public.spiritual_journey;
CREATE TRIGGER trg_guard_spiritual_journey
BEFORE INSERT OR UPDATE ON public.spiritual_journey
FOR EACH ROW EXECUTE FUNCTION public.guard_spiritual_journey_scores();

-- 3) Streak data on profiles is server-owned too
CREATE OR REPLACE FUNCTION public.guard_profile_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) IN ('anon', 'authenticated')
     AND NEW.streak_data IS DISTINCT FROM OLD.streak_data THEN
    NEW.streak_data := OLD.streak_data;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_streak ON public.profiles;
CREATE TRIGGER trg_guard_profile_streak
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_streak();

-- 4) Index hygiene
DROP INDEX IF EXISTS public.idx_audio_library_deity;
DROP INDEX IF EXISTS public.idx_audio_library_status_cat;
DROP INDEX IF EXISTS public.idx_audio_library_category_status;
DROP INDEX IF EXISTS public.idx_audio_reliability_events_type_created;
DROP INDEX IF EXISTS public.idx_notifications_user_read;

CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_time
  ON public.user_challenge_completions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_events_user_created
  ON public.audio_reliability_events (user_id, created_at DESC);
