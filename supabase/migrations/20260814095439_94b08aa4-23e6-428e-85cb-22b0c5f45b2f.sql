-- ============ Server-side gamification validation ============

CREATE OR REPLACE FUNCTION public.activity_points(_activity_type public.activity_type)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _activity_type
    WHEN 'mantra_chant' THEN 5
    WHEN 'scripture_read' THEN 10
    WHEN 'meditation' THEN 8
    WHEN 'darshan' THEN 15
    WHEN 'donation' THEN 20
    WHEN 'community_post' THEN 5
    WHEN 'temple_visit' THEN 25
    ELSE 1
  END
$$;

CREATE OR REPLACE FUNCTION public.award_activity(
  _activity_type public.activity_type,
  _activity_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _points integer;
  _today_count integer;
  _daily_cap constant integer := 30;
  _xp integer;
  _level integer;
  _streak jsonb;
  _last date;
  _cur integer;
  _longest integer;
  _new_badges jsonb := '[]'::jsonb;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT count(*) INTO _today_count
  FROM public.user_activities
  WHERE user_id = _uid
    AND activity_type = _activity_type
    AND created_at >= date_trunc('day', now());

  IF _today_count >= _daily_cap THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'daily_cap_reached', 'points_awarded', 0);
  END IF;

  _points := public.activity_points(_activity_type);

  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned, streak_contribution)
  VALUES (_uid, _activity_type, COALESCE(_activity_data, '{}'::jsonb), _points, true);

  INSERT INTO public.spiritual_journey (user_id, level, experience_points, karma_score)
  VALUES (_uid, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.spiritual_journey
  SET experience_points = COALESCE(experience_points, 0) + _points,
      karma_score = COALESCE(karma_score, 0) + GREATEST(_points / 5, 1),
      mantras_chanted = COALESCE(mantras_chanted, 0)
        + CASE WHEN _activity_type = 'mantra_chant'
               THEN GREATEST(COALESCE((_activity_data->>'count')::int, 1), 1) ELSE 0 END,
      level = 1 + ((COALESCE(experience_points, 0) + _points) / 200),
      updated_at = now()
  WHERE user_id = _uid
  RETURNING experience_points, level INTO _xp, _level;

  -- streak maintenance on profiles.streak_data
  SELECT COALESCE(streak_data, '{}'::jsonb) INTO _streak FROM public.profiles WHERE user_id = _uid LIMIT 1;
  _last := NULLIF(_streak->>'last_activity', '')::date;
  _cur := COALESCE((_streak->>'current_streak')::int, 0);
  _longest := COALESCE((_streak->>'longest_streak')::int, 0);

  IF _last IS NULL OR _last < CURRENT_DATE - 1 THEN
    _cur := 1;
  ELSIF _last = CURRENT_DATE - 1 THEN
    _cur := _cur + 1;
  END IF;
  _longest := GREATEST(_longest, _cur);

  UPDATE public.profiles
  SET streak_data = jsonb_build_object(
        'current_streak', _cur,
        'longest_streak', _longest,
        'last_activity', CURRENT_DATE::text
      ),
      updated_at = now()
  WHERE user_id = _uid;

  -- auto-grant achievements
  WITH granted AS (
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT _uid, a.id
    FROM public.achievements a
    WHERE COALESCE(a.points_required, 0) <= COALESCE(_xp, 0)
      AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = _uid AND ua.achievement_id = a.id
      )
    RETURNING achievement_id
  )
  SELECT COALESCE(jsonb_agg(achievement_id), '[]'::jsonb) INTO _new_badges FROM granted;

  RETURN jsonb_build_object(
    'allowed', true,
    'points_awarded', _points,
    'experience_points', _xp,
    'level', _level,
    'current_streak', _cur,
    'longest_streak', _longest,
    'new_achievements', _new_badges
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_daily_challenge(_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _points integer;
  _active date;
  _xp integer;
  _level integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT points_reward, active_date INTO _points, _active
  FROM public.daily_challenges WHERE id = _challenge_id;

  IF _points IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'unknown_challenge');
  END IF;

  IF _active IS NOT NULL AND _active <> CURRENT_DATE THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'challenge_not_active_today');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_challenge_completions
    WHERE user_id = _uid AND challenge_id = _challenge_id
      AND completed_at >= date_trunc('day', now())
  ) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'already_completed');
  END IF;

  INSERT INTO public.user_challenge_completions (user_id, challenge_id)
  VALUES (_uid, _challenge_id);

  INSERT INTO public.spiritual_journey (user_id, level, experience_points, karma_score)
  VALUES (_uid, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.spiritual_journey
  SET experience_points = COALESCE(experience_points, 0) + _points,
      karma_score = COALESCE(karma_score, 0) + GREATEST(_points / 5, 1),
      level = 1 + ((COALESCE(experience_points, 0) + _points) / 200),
      updated_at = now()
  WHERE user_id = _uid
  RETURNING experience_points, level INTO _xp, _level;

  RETURN jsonb_build_object('allowed', true, 'points_awarded', _points,
                            'experience_points', _xp, 'level', _level);
END;
$$;

REVOKE ALL ON FUNCTION public.award_activity(public.activity_type, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_daily_challenge(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_activity(public.activity_type, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_daily_challenge(uuid) TO authenticated;

-- Remove client-side write paths so points cannot be spoofed
REVOKE INSERT, UPDATE, DELETE ON public.user_activities FROM authenticated, anon;
REVOKE UPDATE ON public.spiritual_journey FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_achievements FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_challenge_completions FROM authenticated, anon;

GRANT ALL ON public.user_activities TO service_role;
GRANT ALL ON public.spiritual_journey TO service_role;
GRANT ALL ON public.user_achievements TO service_role;
GRANT ALL ON public.user_challenge_completions TO service_role;

-- ============ Scaling indexes ============
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created
  ON public.user_activities (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_created
  ON public.user_activities (user_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spiritual_journey_xp
  ON public.spiritual_journey (experience_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user
  ON public.user_challenge_completions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_library_status_category
  ON public.audio_library (url_status, category);
CREATE INDEX IF NOT EXISTS idx_mantra_sessions_user_date
  ON public.mantra_sessions (user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_audio_reliability_events_type_created
  ON public.audio_reliability_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_palm_quality_telemetry_created
  ON public.palm_quality_telemetry (created_at DESC);