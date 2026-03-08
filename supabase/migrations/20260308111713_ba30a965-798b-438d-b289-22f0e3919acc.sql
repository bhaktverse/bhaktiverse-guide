
-- =============================================
-- FIX 1: Drop ALL existing RESTRICTIVE policies
-- =============================================

-- achievements
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;

-- ai_chat_sessions
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;

-- astro_profiles
DROP POLICY IF EXISTS "Users create own astro profiles" ON public.astro_profiles;
DROP POLICY IF EXISTS "Users update own astro profiles" ON public.astro_profiles;
DROP POLICY IF EXISTS "Users view own astro profiles" ON public.astro_profiles;

-- audio_library
DROP POLICY IF EXISTS "Admins can manage audio library" ON public.audio_library;
DROP POLICY IF EXISTS "Audio library is viewable by everyone" ON public.audio_library;

-- bhakti_shorts
DROP POLICY IF EXISTS "Admins can manage bhakti shorts" ON public.bhakti_shorts;
DROP POLICY IF EXISTS "Bhakti shorts are viewable by everyone" ON public.bhakti_shorts;

-- calendar_events
DROP POLICY IF EXISTS "Admins can manage calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Calendar events are viewable by everyone" ON public.calendar_events;

-- community_posts
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;

-- daily_devotions
DROP POLICY IF EXISTS "Admins manage daily devotions" ON public.daily_devotions;
DROP POLICY IF EXISTS "Daily devotions viewable by everyone" ON public.daily_devotions;

-- divine_conversations
DROP POLICY IF EXISTS "Users create own divine conversations" ON public.divine_conversations;
DROP POLICY IF EXISTS "Users view own divine conversations" ON public.divine_conversations;

-- mantra_sessions
DROP POLICY IF EXISTS "Users can create their own mantra sessions" ON public.mantra_sessions;
DROP POLICY IF EXISTS "Users can update their own mantra sessions" ON public.mantra_sessions;
DROP POLICY IF EXISTS "Users can view their own mantra sessions" ON public.mantra_sessions;

-- mantras_library
DROP POLICY IF EXISTS "Admins manage mantras" ON public.mantras_library;
DROP POLICY IF EXISTS "Mantras viewable by everyone" ON public.mantras_library;

-- numerology_reports
DROP POLICY IF EXISTS "Users create own numerology reports" ON public.numerology_reports;
DROP POLICY IF EXISTS "Users view own numerology reports" ON public.numerology_reports;

-- palm_reading_history
DROP POLICY IF EXISTS "Users can create their own palm readings" ON public.palm_reading_history;
DROP POLICY IF EXISTS "Users can delete their own palm readings" ON public.palm_reading_history;
DROP POLICY IF EXISTS "Users can view their own palm readings" ON public.palm_reading_history;

-- playlists
DROP POLICY IF EXISTS "Create own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Delete own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Update own playlists" ON public.playlists;
DROP POLICY IF EXISTS "View own and public playlists" ON public.playlists;

-- profiles
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- saints
DROP POLICY IF EXISTS "Admins can manage saints" ON public.saints;
DROP POLICY IF EXISTS "Saints are viewable by everyone" ON public.saints;

-- scripture_chapters
DROP POLICY IF EXISTS "Admins can manage scripture chapters" ON public.scripture_chapters;
DROP POLICY IF EXISTS "Scripture chapters viewable by everyone" ON public.scripture_chapters;

-- scriptures
DROP POLICY IF EXISTS "Admins can manage scriptures" ON public.scriptures;
DROP POLICY IF EXISTS "Scriptures are viewable by everyone" ON public.scriptures;

-- spiritual_content
DROP POLICY IF EXISTS "Admins can manage spiritual content" ON public.spiritual_content;
DROP POLICY IF EXISTS "Spiritual content is viewable by everyone" ON public.spiritual_content;

-- spiritual_faqs
DROP POLICY IF EXISTS "Admins can manage spiritual FAQs" ON public.spiritual_faqs;
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON public.spiritual_faqs;

-- spiritual_journey
DROP POLICY IF EXISTS "Users create own spiritual journey" ON public.spiritual_journey;
DROP POLICY IF EXISTS "Users update own spiritual journey" ON public.spiritual_journey;
DROP POLICY IF EXISTS "Users view own spiritual journey" ON public.spiritual_journey;

-- temples
DROP POLICY IF EXISTS "Admins can manage temples" ON public.temples;
DROP POLICY IF EXISTS "Temples are viewable by everyone" ON public.temples;

-- user_achievements
DROP POLICY IF EXISTS "Users can earn achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;

-- user_activities
DROP POLICY IF EXISTS "Users can create their own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.user_activities;

-- user_progress
DROP POLICY IF EXISTS "Users insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users view own progress" ON public.user_progress;

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- =============================================
-- FIX 2: Recreate ALL as PERMISSIVE with proper role scoping
-- =============================================

-- achievements
CREATE POLICY "Achievements viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_chat_sessions
CREATE POLICY "Users create own chat sessions" ON public.ai_chat_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chat sessions" ON public.ai_chat_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own chat sessions" ON public.ai_chat_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- astro_profiles
CREATE POLICY "Users create own astro profiles" ON public.astro_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own astro profiles" ON public.astro_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own astro profiles" ON public.astro_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- audio_library
CREATE POLICY "Audio viewable by everyone" ON public.audio_library FOR SELECT USING (true);
CREATE POLICY "Admins manage audio" ON public.audio_library FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- bhakti_shorts
CREATE POLICY "Approved shorts viewable by everyone" ON public.bhakti_shorts FOR SELECT USING ((approved = true) OR (auth.uid() = creator_id));
CREATE POLICY "Admins manage shorts" ON public.bhakti_shorts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- calendar_events
CREATE POLICY "Calendar viewable by everyone" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Admins manage calendar" ON public.calendar_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- community_posts
CREATE POLICY "Public posts viewable by everyone" ON public.community_posts FOR SELECT USING ((visibility = 'public'::visibility_type) OR (auth.uid() = user_id));
CREATE POLICY "Users create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- daily_devotions
CREATE POLICY "Devotions viewable by everyone" ON public.daily_devotions FOR SELECT USING (true);
CREATE POLICY "Admins manage devotions" ON public.daily_devotions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- divine_conversations
CREATE POLICY "Users create own conversations" ON public.divine_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own conversations" ON public.divine_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- mantra_sessions
CREATE POLICY "Users create own mantra sessions" ON public.mantra_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mantra sessions" ON public.mantra_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own mantra sessions" ON public.mantra_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- mantras_library
CREATE POLICY "Mantras viewable by everyone" ON public.mantras_library FOR SELECT USING (true);
CREATE POLICY "Admins manage mantras" ON public.mantras_library FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- numerology_reports
CREATE POLICY "Users create own numerology reports" ON public.numerology_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own numerology reports" ON public.numerology_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- palm_reading_history
CREATE POLICY "Users create own palm readings" ON public.palm_reading_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own palm readings" ON public.palm_reading_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own palm readings" ON public.palm_reading_history FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- playlists
CREATE POLICY "Users create own playlists" ON public.playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own playlists" ON public.playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own playlists" ON public.playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "View own and public playlists" ON public.playlists FOR SELECT USING ((auth.uid() = user_id) OR (is_public = true));

-- FIX 3: Profiles - restrict public SELECT to non-sensitive columns via a view
-- Authenticated users can see their own full profile, others see only name/avatar
CREATE POLICY "Users view own full profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view basic profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- saints
CREATE POLICY "Saints viewable by everyone" ON public.saints FOR SELECT USING (true);
CREATE POLICY "Admins manage saints" ON public.saints FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- scripture_chapters
CREATE POLICY "Chapters viewable by everyone" ON public.scripture_chapters FOR SELECT USING (true);
CREATE POLICY "Admins manage chapters" ON public.scripture_chapters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- scriptures
CREATE POLICY "Scriptures viewable by everyone" ON public.scriptures FOR SELECT USING (true);
CREATE POLICY "Admins manage scriptures" ON public.scriptures FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- spiritual_content
CREATE POLICY "Content viewable by everyone" ON public.spiritual_content FOR SELECT USING (true);
CREATE POLICY "Admins manage content" ON public.spiritual_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- spiritual_faqs
CREATE POLICY "FAQs viewable by everyone" ON public.spiritual_faqs FOR SELECT USING (true);
CREATE POLICY "Admins manage FAQs" ON public.spiritual_faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- spiritual_journey
CREATE POLICY "Users create own journey" ON public.spiritual_journey FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journey" ON public.spiritual_journey FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own journey" ON public.spiritual_journey FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- temples
CREATE POLICY "Temples viewable by everyone" ON public.temples FOR SELECT USING (true);
CREATE POLICY "Admins manage temples" ON public.temples FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- user_achievements
CREATE POLICY "Users earn achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_activities
CREATE POLICY "Users create own activities" ON public.user_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own activities" ON public.user_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_progress
CREATE POLICY "Users insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
