CREATE TABLE public.audio_reliability_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  track_title text,
  track_url text,
  attempt integer NOT NULL DEFAULT 0,
  outcome text,
  was_online boolean,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.audio_reliability_events TO anon;
GRANT SELECT, INSERT ON public.audio_reliability_events TO authenticated;
GRANT ALL ON public.audio_reliability_events TO service_role;

ALTER TABLE public.audio_reliability_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_log_audio_events"
ON public.audio_reliability_events FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "admins_read_audio_events"
ON public.audio_reliability_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audio_events_created ON public.audio_reliability_events (created_at DESC);
CREATE INDEX idx_audio_events_type_created ON public.audio_reliability_events (event_type, created_at DESC);