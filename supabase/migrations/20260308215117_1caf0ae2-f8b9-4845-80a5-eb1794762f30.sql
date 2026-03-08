-- Add is_shared column to palm_reading_history
ALTER TABLE public.palm_reading_history ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;

-- Fix security definer view: recreate profiles_public as SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS SELECT id, user_id, name, avatar_url, spiritual_level, preferred_language, created_at
FROM public.profiles;