-- YouTube Shorts cache table for API response caching
CREATE TABLE public.youtube_shorts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(query)
);

ALTER TABLE public.youtube_shorts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache" ON public.youtube_shorts_cache
  FOR SELECT TO public USING (true);

CREATE POLICY "Service role manages cache" ON public.youtube_shorts_cache
  FOR ALL TO service_role USING (true);