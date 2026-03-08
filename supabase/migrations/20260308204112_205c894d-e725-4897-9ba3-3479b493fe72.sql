CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'total_likes', COALESCE(SUM(likes_count), 0),
    'total_comments', COALESCE(SUM(comments_count), 0)
  ) FROM community_posts WHERE visibility = 'public';
$$;