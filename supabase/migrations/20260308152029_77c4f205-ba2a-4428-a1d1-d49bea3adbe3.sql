
-- Horoscope cache table
CREATE TABLE public.horoscope_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rashi_name varchar NOT NULL,
  prediction_date date NOT NULL DEFAULT CURRENT_DATE,
  prediction_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rashi_name, prediction_date)
);

ALTER TABLE public.horoscope_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Horoscope cache readable by everyone"
  ON public.horoscope_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role manages horoscope cache"
  ON public.horoscope_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- Kundali match history table
CREATE TABLE public.kundali_match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner1_name varchar NOT NULL,
  partner1_dob date NOT NULL,
  partner1_rashi varchar,
  partner1_place varchar,
  partner2_name varchar NOT NULL,
  partner2_dob date NOT NULL,
  partner2_rashi varchar,
  partner2_place varchar,
  total_score integer,
  percentage integer,
  gun_milan_data jsonb,
  ai_analysis text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.kundali_match_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own kundali history"
  ON public.kundali_match_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own kundali history"
  ON public.kundali_match_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own kundali history"
  ON public.kundali_match_history FOR DELETE
  USING (auth.uid() = user_id);
