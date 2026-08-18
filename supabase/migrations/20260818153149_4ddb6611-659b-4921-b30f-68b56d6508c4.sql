REVOKE ALL ON FUNCTION public.guard_spiritual_journey_scores() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_streak() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.ensure_spiritual_journey()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.spiritual_journey (user_id, level, experience_points, karma_score)
  VALUES (_uid, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_spiritual_journey() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_spiritual_journey() TO authenticated;