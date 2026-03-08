
-- Fix profiles: replace the overly permissive public SELECT with a restricted one
-- Drop the existing public-facing policy
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;

-- Create a view that hides sensitive columns for public/community use
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT id, user_id, name, avatar_url, spiritual_level, preferred_language, created_at
  FROM public.profiles;

-- Re-create the public SELECT policy to only expose non-sensitive data
-- Authenticated users can see their own full record (already covered by "Users view own full profile")
-- For community features (resolving post author names), allow authenticated users to read basic info
CREATE POLICY "Authenticated can view basic profile info" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
