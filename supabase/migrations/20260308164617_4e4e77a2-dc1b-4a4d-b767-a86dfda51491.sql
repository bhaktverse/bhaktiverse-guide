-- Remove duplicate triggers (keep the original trg_ prefixed ones)
DROP TRIGGER IF EXISTS on_new_comment ON public.post_comments;
DROP TRIGGER IF EXISTS on_new_reply ON public.post_comments;