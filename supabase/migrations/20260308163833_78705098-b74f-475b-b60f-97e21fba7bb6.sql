
-- Create comment notification triggers on post_comments table
CREATE TRIGGER on_new_comment 
  AFTER INSERT ON public.post_comments
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_on_comment();

CREATE TRIGGER on_new_reply 
  AFTER INSERT ON public.post_comments
  FOR EACH ROW 
  WHEN (NEW.parent_comment_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_on_reply();
