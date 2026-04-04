-- Fix 1: Remove user UPDATE policy on user_api_usage to prevent rate limit bypass
DROP POLICY IF EXISTS "Users update own usage" ON public.user_api_usage;

-- Fix 2: Add community-media storage policies for user uploads
-- Allow authenticated users to upload files under their own user_id folder
CREATE POLICY "Users upload own community media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users delete own community media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'community-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own uploaded files
CREATE POLICY "Users update own community media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'community-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);