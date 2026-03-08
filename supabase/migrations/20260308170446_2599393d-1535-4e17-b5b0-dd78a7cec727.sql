
-- Notification triggers already exist, just drop and recreate to be safe
DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.post_comments;
DROP TRIGGER IF EXISTS trg_notify_on_reply ON public.post_comments;

CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reply();
