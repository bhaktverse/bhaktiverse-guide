
-- Fix 1: Restrict site_settings SELECT to public-only settings for non-admins
-- Add is_public column
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Drop the overly broad policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

-- Create scoped policy: authenticated users can only read public settings
CREATE POLICY "Authenticated users read public settings"
ON public.site_settings FOR SELECT
TO authenticated
USING (is_public = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Restrict post_likes SELECT to authenticated users only
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.post_likes;

CREATE POLICY "Likes viewable by authenticated"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);
