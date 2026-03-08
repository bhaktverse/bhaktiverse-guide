
-- Trigger function: notify post author when someone comments
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
  post_preview TEXT;
BEGIN
  -- Get post author
  SELECT user_id, LEFT(content, 60) INTO post_author_id, post_preview
  FROM community_posts WHERE id = NEW.post_id;

  -- Don't notify if commenting on own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter name
  SELECT name INTO commenter_name FROM profiles WHERE user_id = NEW.user_id LIMIT 1;
  IF commenter_name IS NULL THEN commenter_name := 'A devotee'; END IF;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_author_id,
    'community',
    commenter_name || ' commented on your post',
    LEFT(NEW.content, 100),
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

-- Trigger function: notify parent comment author on reply
CREATE OR REPLACE FUNCTION public.notify_on_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_author_id UUID;
  replier_name TEXT;
BEGIN
  IF NEW.parent_comment_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO parent_author_id
  FROM post_comments WHERE id = NEW.parent_comment_id;

  IF parent_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT name INTO replier_name FROM profiles WHERE user_id = NEW.user_id LIMIT 1;
  IF replier_name IS NULL THEN replier_name := 'A devotee'; END IF;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    parent_author_id,
    'community',
    replier_name || ' replied to your comment',
    LEFT(NEW.content, 100),
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_reply
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  WHEN (NEW.parent_comment_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_on_reply();
