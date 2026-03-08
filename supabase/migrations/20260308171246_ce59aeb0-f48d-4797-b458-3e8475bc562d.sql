
-- Create all missing triggers

-- 1. Likes count trigger
DROP TRIGGER IF EXISTS trg_update_likes_count ON public.post_likes;
CREATE TRIGGER trg_update_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- 2. Comments count trigger
DROP TRIGGER IF EXISTS trg_update_comments_count ON public.post_comments;
CREATE TRIGGER trg_update_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- 3. Notification on comment trigger
DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.post_comments;
CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- 4. Notification on reply trigger
DROP TRIGGER IF EXISTS trg_notify_on_reply ON public.post_comments;
CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reply();
