ALTER TABLE public.kundali_match_history 
  ADD COLUMN IF NOT EXISTS partner1_tob time,
  ADD COLUMN IF NOT EXISTS partner2_tob time;