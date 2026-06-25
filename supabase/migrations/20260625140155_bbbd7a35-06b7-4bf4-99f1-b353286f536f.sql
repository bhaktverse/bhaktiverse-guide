
-- QA RUNS
CREATE TABLE public.qa_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID,
  trigger_kind TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'running',
  total INT NOT NULL DEFAULT 0,
  passed INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  skipped INT NOT NULL DEFAULT 0,
  duration_ms INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
GRANT SELECT ON public.qa_runs TO authenticated;
GRANT ALL ON public.qa_runs TO service_role;
ALTER TABLE public.qa_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view qa_runs" ON public.qa_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.qa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.qa_runs(id) ON DELETE CASCADE,
  suite TEXT NOT NULL,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INT,
  error TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_results TO authenticated;
GRANT ALL ON public.qa_results TO service_role;
ALTER TABLE public.qa_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view qa_results" ON public.qa_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_qa_results_run ON public.qa_results(run_id);
CREATE INDEX idx_qa_runs_started ON public.qa_runs(started_at DESC);

-- INGESTION RUNS
CREATE TABLE public.ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  trigger_kind TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'running',
  inserted_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  duration_ms INT,
  log JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
GRANT SELECT ON public.ingestion_runs TO authenticated;
GRANT ALL ON public.ingestion_runs TO service_role;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view ingestion_runs" ON public.ingestion_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_ingestion_runs_source_started ON public.ingestion_runs(source, started_at DESC);

-- audio_library: enrich health columns
ALTER TABLE public.audio_library
  ADD COLUMN IF NOT EXISTS content_type TEXT,
  ADD COLUMN IF NOT EXISTS content_length BIGINT,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS mirror_urls JSONB DEFAULT '[]'::jsonb;
