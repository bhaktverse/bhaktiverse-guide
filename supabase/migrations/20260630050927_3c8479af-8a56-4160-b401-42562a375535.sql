
-- 1) Lock down SECURITY DEFINER helpers that don't need public execute
REVOKE EXECUTE ON FUNCTION public.check_and_increment_api_usage(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_api_usage(uuid, text, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_community_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_stats() TO service_role, authenticated;
-- authenticated kept because the dashboard reads stats; anon revoked.

-- Note: public.has_role is intentionally executable by anon/authenticated because
-- it is referenced from RLS policies and must run in the querying role's context.

-- 2) Tighten always-true RLS policies
-- youtube_shorts_cache: was FOR ALL USING(true) — restrict to service_role only
DROP POLICY IF EXISTS "Service role manages cache" ON public.youtube_shorts_cache;
CREATE POLICY "Service role manages cache"
  ON public.youtube_shorts_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- notifications: was INSERT WITH CHECK(true) — restrict inserts to service_role
DROP POLICY IF EXISTS "Only service role creates notifications" ON public.notifications;
CREATE POLICY "Only service role creates notifications"
  ON public.notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- palm_quality_telemetry: was INSERT WITH CHECK(true) — require row to be
-- anonymous or owned by the inserter.
DROP POLICY IF EXISTS "Anyone can insert telemetry" ON public.palm_quality_telemetry;
CREATE POLICY "Insert own or anonymous telemetry"
  ON public.palm_quality_telemetry
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3) Remove broad SELECT policy that allowed listing of audio-library bucket.
-- Files remain accessible via their public URL (public bucket), but anonymous
-- LIST queries are no longer permitted.
DROP POLICY IF EXISTS "Public Access to Audio Library" ON storage.objects;
