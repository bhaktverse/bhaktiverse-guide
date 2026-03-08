-- The post_likes table, its RLS policies, and update_likes_count trigger were already created.
-- The update_comments_count trigger was already created.
-- The trg_notify_on_comment and trg_notify_on_reply triggers already exist.
-- Just need the DELETE policy on ai_chat_sessions.

-- Drop and recreate to be safe (idempotent)
DROP POLICY IF EXISTS "Users delete own chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users delete own chat sessions" ON public.ai_chat_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);