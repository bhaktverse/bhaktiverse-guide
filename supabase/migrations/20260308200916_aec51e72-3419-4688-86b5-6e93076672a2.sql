DROP TRIGGER IF EXISTS trg_update_likes_count ON post_likes;
CREATE TRIGGER trg_update_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS trg_update_comments_count ON post_comments;
CREATE TRIGGER trg_update_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

DROP TRIGGER IF EXISTS trg_notify_on_comment ON post_comments;
CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

DROP TRIGGER IF EXISTS trg_notify_on_reply ON post_comments;
CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_reply();