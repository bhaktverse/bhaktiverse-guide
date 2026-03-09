
-- Admin RLS policies for user-scoped tables
-- profiles
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- palm_reading_history
CREATE POLICY "Admins view all palm readings" ON palm_reading_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ai_chat_sessions
CREATE POLICY "Admins view all chat sessions" ON ai_chat_sessions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- mantra_sessions
CREATE POLICY "Admins view all mantra sessions" ON mantra_sessions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- divine_conversations
CREATE POLICY "Admins view all conversations" ON divine_conversations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_activities
CREATE POLICY "Admins view all activities" ON user_activities FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- notifications - admin ALL
CREATE POLICY "Admins manage all notifications" ON notifications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- spiritual_journey
CREATE POLICY "Admins view all journeys" ON spiritual_journey FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_api_usage
CREATE POLICY "Admins view all api usage" ON user_api_usage FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- numerology_reports
CREATE POLICY "Admins view all numerology" ON numerology_reports FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_favorites
CREATE POLICY "Admins view all favorites" ON user_favorites FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_achievements
CREATE POLICY "Admins view all user achievements" ON user_achievements FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- astro_profiles
CREATE POLICY "Admins view all astro profiles" ON astro_profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- kundali_match_history
CREATE POLICY "Admins view all kundali" ON kundali_match_history FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_progress
CREATE POLICY "Admins view all progress" ON user_progress FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- playlists
CREATE POLICY "Admins view all playlists" ON playlists FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- community_posts - admin ALL for moderation
CREATE POLICY "Admins moderate all posts" ON community_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- post_comments - admin ALL for moderation
CREATE POLICY "Admins moderate all comments" ON post_comments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- site_settings table for persistent config
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage settings" ON site_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
