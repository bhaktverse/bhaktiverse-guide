
-- Audio self-heal run log
CREATE TABLE IF NOT EXISTS public.audio_heal_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  total_checked integer NOT NULL DEFAULT 0,
  healthy_count integer NOT NULL DEFAULT 0,
  broken_count integer NOT NULL DEFAULT 0,
  healed_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  details jsonb,
  error text,
  duration_ms integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  trigger_kind text NOT NULL DEFAULT 'manual'
);
GRANT SELECT ON public.audio_heal_runs TO authenticated;
GRANT ALL ON public.audio_heal_runs TO service_role;
ALTER TABLE public.audio_heal_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audio heal runs" ON public.audio_heal_runs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Palm landmark accuracy telemetry
CREATE TABLE IF NOT EXISTS public.palm_quality_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  quality_preset text NOT NULL,
  detection_rate real NOT NULL DEFAULT 0,
  avg_confidence real NOT NULL DEFAULT 0,
  jitter_px real NOT NULL DEFAULT 0,
  fps real NOT NULL DEFAULT 0,
  frames_total integer NOT NULL DEFAULT 0,
  frames_detected integer NOT NULL DEFAULT 0,
  session_ms integer NOT NULL DEFAULT 0,
  device_info jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.palm_quality_telemetry TO authenticated;
GRANT SELECT, INSERT ON public.palm_quality_telemetry TO anon;
GRANT ALL ON public.palm_quality_telemetry TO service_role;
ALTER TABLE public.palm_quality_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert telemetry" ON public.palm_quality_telemetry
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users read own telemetry" ON public.palm_quality_telemetry
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_palm_quality_telemetry_preset_time
  ON public.palm_quality_telemetry(quality_preset, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_heal_runs_started ON public.audio_heal_runs(started_at DESC);
