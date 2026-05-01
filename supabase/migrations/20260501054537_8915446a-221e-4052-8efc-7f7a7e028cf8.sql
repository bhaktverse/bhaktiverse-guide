-- 1) Deduplicate saints: keep the earliest-created row per name
WITH ranked AS (
  SELECT id, name,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
  FROM public.saints
)
DELETE FROM public.saints s
USING ranked r
WHERE s.id = r.id AND r.rn > 1;

-- 2) Prevent future duplicates
ALTER TABLE public.saints
  ADD CONSTRAINT saints_name_unique UNIQUE (name);

-- 3) Enrich audio rows missing deity tags using simple title keyword matching
UPDATE public.audio_library
SET associated_deity = CASE
  WHEN title ILIKE '%krishna%' OR title ILIKE '%govind%' OR title ILIKE '%hare krishna%' OR title ILIKE '%radha%' THEN 'Krishna'
  WHEN title ILIKE '%hanuman%' OR title ILIKE '%bajrang%' OR title ILIKE '%chalisa%' THEN 'Hanuman'
  WHEN title ILIKE '%vishnu%' OR title ILIKE '%narayan%' OR title ILIKE '%ram %' OR title ILIKE '%rama %' OR title ILIKE '%sita%' THEN 'Vishnu'
  WHEN title ILIKE '%shiv%' OR title ILIKE '%mahadev%' OR title ILIKE '%bhole%' THEN 'Shiva'
  WHEN title ILIKE '%durga%' OR title ILIKE '%devi%' OR title ILIKE '%maa %' OR title ILIKE '%amba%' THEN 'Durga'
  WHEN title ILIKE '%ganesh%' OR title ILIKE '%vinayak%' OR title ILIKE '%ganpati%' THEN 'Ganesha'
  WHEN title ILIKE '%saraswati%' THEN 'Saraswati'
  WHEN title ILIKE '%lakshmi%' THEN 'Lakshmi'
  ELSE associated_deity
END
WHERE associated_deity IS NULL OR associated_deity = '';