-- Palm Reading History Table
CREATE TABLE public.palm_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  palm_image_url TEXT,
  language VARCHAR(10) DEFAULT 'hi',
  palm_type VARCHAR(50),
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.palm_reading_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own palm readings"
ON public.palm_reading_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own palm readings"
ON public.palm_reading_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palm readings"
ON public.palm_reading_history FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_palm_reading_history_user_id ON public.palm_reading_history(user_id);
CREATE INDEX idx_palm_reading_history_created_at ON public.palm_reading_history(created_at DESC);