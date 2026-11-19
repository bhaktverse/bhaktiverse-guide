
-- 1. Guards: block direct client writes only (current_user is the table owner inside SECURITY DEFINER RPCs)
CREATE OR REPLACE FUNCTION public.guard_spiritual_journey_scores()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF current_user IN ('anon','authenticated') THEN
    RAISE EXCEPTION 'Progress can only be changed through award_activity/complete_daily_challenge';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_profile_streak()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF current_user IN ('anon','authenticated') AND NEW.streak_data IS DISTINCT FROM OLD.streak_data THEN
    NEW.streak_data := OLD.streak_data;
  END IF;
  RETURN NEW;
END $$;

-- 2. award_activity: per-user serialization + bounded mantra count
CREATE OR REPLACE FUNCTION public.award_activity(_activity_type activity_type, _activity_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _uid uuid := auth.uid();
  _points integer; _today_count integer; _daily_cap constant integer := 30;
  _xp integer; _level integer; _streak jsonb; _last date; _cur integer; _longest integer;
  _new_badges jsonb := '[]'::jsonb; _count int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('award:' || _uid::text, 0));

  SELECT count(*) INTO _today_count FROM public.user_activities
  WHERE user_id = _uid AND activity_type = _activity_type AND created_at >= date_trunc('day', now());
  IF _today_count >= _daily_cap THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'daily_cap_reached', 'points_awarded', 0);
  END IF;

  _count := 1;
  IF _activity_type = 'mantra_chant' THEN
    BEGIN _count := LEAST(GREATEST(COALESCE((_activity_data->>'count')::int, 1), 1), 1008);
    EXCEPTION WHEN others THEN _count := 1; END;
  END IF;

  _points := public.activity_points(_activity_type);
  INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned, streak_contribution)
  VALUES (_uid, _activity_type, COALESCE(_activity_data, '{}'::jsonb), _points, true);

  INSERT INTO public.spiritual_journey (user_id, level, experience_points, karma_score)
  VALUES (_uid, 1, 0, 0) ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.spiritual_journey
  SET experience_points = COALESCE(experience_points, 0) + _points,
      karma_score = COALESCE(karma_score, 0) + GREATEST(_points / 5, 1),
      mantras_chanted = COALESCE(mantras_chanted, 0) + CASE WHEN _activity_type = 'mantra_chant' THEN _count ELSE 0 END,
      level = 1 + ((COALESCE(experience_points, 0) + _points) / 200),
      updated_at = now()
  WHERE user_id = _uid RETURNING experience_points, level INTO _xp, _level;

  SELECT COALESCE(streak_data, '{}'::jsonb) INTO _streak FROM public.profiles WHERE user_id = _uid LIMIT 1;
  _last := NULLIF(_streak->>'last_activity', '')::date;
  _cur := COALESCE((_streak->>'current_streak')::int, 0);
  _longest := COALESCE((_streak->>'longest_streak')::int, 0);
  IF _last IS NULL OR _last < CURRENT_DATE - 1 THEN _cur := 1;
  ELSIF _last = CURRENT_DATE - 1 THEN _cur := _cur + 1; END IF;
  _longest := GREATEST(_longest, _cur);
  UPDATE public.profiles SET streak_data = jsonb_build_object('current_streak', _cur, 'longest_streak', _longest, 'last_activity', CURRENT_DATE::text), updated_at = now()
  WHERE user_id = _uid;

  WITH granted AS (
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT _uid, a.id FROM public.achievements a
    WHERE COALESCE(a.points_required, 0) <= COALESCE(_xp, 0)
    ON CONFLICT DO NOTHING
    RETURNING achievement_id)
  SELECT COALESCE(jsonb_agg(achievement_id), '[]'::jsonb) INTO _new_badges FROM granted;

  RETURN jsonb_build_object('allowed', true, 'points_awarded', _points, 'experience_points', _xp, 'level', _level,
    'current_streak', _cur, 'longest_streak', _longest, 'new_achievements', _new_badges);
END $function$;

-- 3. complete_daily_challenge: idempotent
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(_challenge_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _uid uuid := auth.uid(); _points integer; _active date; _xp integer; _level integer; _inserted int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT points_reward, active_date INTO _points, _active FROM public.daily_challenges WHERE id = _challenge_id;
  IF _points IS NULL THEN RETURN jsonb_build_object('allowed', false, 'reason', 'unknown_challenge'); END IF;
  IF _active IS NOT NULL AND _active <> CURRENT_DATE THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'challenge_not_active_today');
  END IF;
  INSERT INTO public.user_challenge_completions (user_id, challenge_id) VALUES (_uid, _challenge_id)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS _inserted = ROW_COUNT;
  IF _inserted = 0 THEN RETURN jsonb_build_object('allowed', false, 'reason', 'already_completed'); END IF;

  INSERT INTO public.spiritual_journey (user_id, level, experience_points, karma_score)
  VALUES (_uid, 1, 0, 0) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.spiritual_journey
  SET experience_points = COALESCE(experience_points, 0) + _points,
      karma_score = COALESCE(karma_score, 0) + GREATEST(_points / 5, 1),
      level = 1 + ((COALESCE(experience_points, 0) + _points) / 200), updated_at = now()
  WHERE user_id = _uid RETURNING experience_points, level INTO _xp, _level;
  RETURN jsonb_build_object('allowed', true, 'points_awarded', _points, 'experience_points', _xp, 'level', _level);
END $function$;

-- 4. Community: protect counters/featured, cap lengths
CREATE OR REPLACE FUNCTION public.guard_community_post_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF length(NEW.content) > 2000 THEN RAISE EXCEPTION 'Post too long (max 2000 characters)'; END IF;
  IF current_user IN ('anon','authenticated') AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.likes_count := 0; NEW.comments_count := 0; NEW.shares_count := 0; NEW.featured := false;
    ELSE
      NEW.likes_count := OLD.likes_count; NEW.comments_count := OLD.comments_count;
      NEW.shares_count := OLD.shares_count; NEW.featured := OLD.featured; NEW.user_id := OLD.user_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_community_post ON public.community_posts;
CREATE TRIGGER trg_guard_community_post BEFORE INSERT OR UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.guard_community_post_fields();

CREATE OR REPLACE FUNCTION public.guard_comment_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF length(NEW.content) > 1000 THEN RAISE EXCEPTION 'Comment too long (max 1000 characters)'; END IF;
  IF current_user IN ('anon','authenticated') AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.likes_count := 0;
    ELSE NEW.likes_count := OLD.likes_count; NEW.user_id := OLD.user_id; NEW.post_id := OLD.post_id; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_comment ON public.post_comments;
CREATE TRIGGER trg_guard_comment BEFORE INSERT OR UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.guard_comment_fields();

-- 5. Audit logs: admins can only log as themselves
DROP POLICY IF EXISTS "Admins insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_user_id = auth.uid());

-- 6. Atomic single-use job token consumption
CREATE OR REPLACE FUNCTION public.consume_job_token(_token uuid, _purpose text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _ok boolean;
BEGIN
  DELETE FROM public.internal_job_tokens
  WHERE token = _token AND purpose = _purpose AND expires_at > now()
  RETURNING true INTO _ok;
  RETURN COALESCE(_ok, false);
END $$;
REVOKE ALL ON FUNCTION public.consume_job_token(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_job_token(uuid, text) TO service_role;

-- 7. Signed-in only for user RPCs
REVOKE EXECUTE ON FUNCTION public.award_activity(activity_type, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_daily_challenge(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ensure_spiritual_journey() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_activity(activity_type, jsonb), public.complete_daily_challenge(uuid), public.ensure_spiritual_journey() TO authenticated;

-- 8. Retention for ops tables
DELETE FROM public.qa_results WHERE created_at < now() - interval '30 days';
SELECT cron.schedule('bv_ops_retention', '7 2 * * *', $$
  DELETE FROM public.qa_results WHERE created_at < now() - interval '30 days';
  DELETE FROM public.qa_runs WHERE started_at < now() - interval '30 days' AND id NOT IN (SELECT DISTINCT run_id FROM public.qa_results);
  DELETE FROM public.internal_job_tokens WHERE expires_at < now();
  DELETE FROM public.ingestion_runs WHERE started_at < now() - interval '90 days';
$$);
