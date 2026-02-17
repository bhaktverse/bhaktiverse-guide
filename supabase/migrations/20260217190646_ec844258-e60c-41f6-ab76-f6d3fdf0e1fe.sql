-- Add admin INSERT policy for community-media bucket
CREATE POLICY "Admins can upload to community media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add admin UPDATE policy for community-media bucket
CREATE POLICY "Admins can update community media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Add admin DELETE policy for community-media bucket
CREATE POLICY "Admins can delete community media"
ON storage.objects FOR DELETE
USING (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));