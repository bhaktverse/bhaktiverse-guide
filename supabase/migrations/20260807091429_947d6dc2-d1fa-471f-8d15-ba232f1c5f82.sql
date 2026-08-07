CREATE TABLE public.internal_job_tokens (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '5 minutes'
);

GRANT ALL ON public.internal_job_tokens TO service_role;

ALTER TABLE public.internal_job_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "internal_job_tokens_no_client_access"
  ON public.internal_job_tokens
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE INDEX idx_internal_job_tokens_expires ON public.internal_job_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_audio_library_category_status
  ON public.audio_library (category, url_status);
CREATE INDEX IF NOT EXISTS idx_audio_library_status
  ON public.audio_library (url_status);