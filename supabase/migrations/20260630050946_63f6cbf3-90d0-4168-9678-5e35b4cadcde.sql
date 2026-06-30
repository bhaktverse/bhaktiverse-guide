
-- Drop broad public SELECT policies on storage.objects for public buckets
DROP POLICY IF EXISTS "Public read access for saints images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for scriptures pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for scriptures audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio library" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for temple images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for community media" ON storage.objects;

-- Revoke PUBLIC execute on all SECURITY DEFINER functions in public schema
REVOKE EXECUTE ON FUNCTION public.notify_on_reply() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_likes_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_comments_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_increment_api_usage(uuid, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_community_stats() FROM PUBLIC;
