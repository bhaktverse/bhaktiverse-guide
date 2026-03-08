
-- Robust trigger creation with error guards
-- Each trigger is wrapped in its own DO block to prevent cascade failures

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_update_likes_count ON public.post_likes;
  CREATE TRIGGER trg_update_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to create trg_update_likes_count: %', SQLERRM;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_update_comments_count ON public.post_comments;
  CREATE TRIGGER trg_update_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to create trg_update_comments_count: %', SQLERRM;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.post_comments;
  CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  WHEN (NEW.parent_comment_id IS NULL)
  EXECUTE FUNCTION public.notify_on_comment();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to create trg_notify_on_comment: %', SQLERRM;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_notify_on_reply ON public.post_comments;
  CREATE TRIGGER trg_notify_on_reply
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  WHEN (NEW.parent_comment_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_on_reply();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Failed to create trg_notify_on_reply: %', SQLERRM;
END $$;
