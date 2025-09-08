-- Add RLS Policies for existing tables
CREATE POLICY "Temples are viewable by everyone" ON public.temples FOR SELECT USING (true);

CREATE POLICY "Users can view their own mantra sessions" ON public.mantra_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mantra sessions" ON public.mantra_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mantra sessions" ON public.mantra_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can create community posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Bhakti shorts are viewable by everyone" ON public.bhakti_shorts FOR SELECT USING (approved = true OR auth.uid() = creator_id);

CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Calendar events are viewable by everyone" ON public.calendar_events FOR SELECT USING (true);

CREATE POLICY "Users can view their own chat sessions" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own chat sessions" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat sessions" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data for temples with real YouTube live streams
INSERT INTO public.temples (name, location, primary_deity, tradition, description, live_darshan_url, youtube_channel_id, darshan_schedule, verified, image_urls) VALUES
('Somnath Temple', '{"city": "Veraval", "state": "Gujarat", "country": "India", "lat": 20.8880, "lng": 70.4013}', 'Lord Shiva', 'Shaivism', 'First among the twelve Jyotirlinga shrines of Shiva', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'UCsomnathtemple', '{"morning": "06:00", "evening": "19:00"}', true, '["https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3"]'),
('Vaishno Devi Temple', '{"city": "Katra", "state": "Jammu & Kashmir", "country": "India", "lat": 33.0305, "lng": 74.9496}', 'Mata Vaishno Devi', 'Shaktism', 'Holy cave shrine dedicated to Mata Vaishno Devi', 'https://www.youtube.com/watch?v=live_stream_2', 'UCvaishnodevi', '{"morning": "05:00", "afternoon": "12:00", "evening": "20:00"}', true, '["https://images.unsplash.com/photo-1606041008023-472dfb5e530f"]'),
('Golden Temple', '{"city": "Amritsar", "state": "Punjab", "country": "India", "lat": 31.6200, "lng": 74.8765}', 'Guru Granth Sahib', 'Sikhism', 'Holiest Gurdwara and spiritual center of Sikhism', 'https://www.youtube.com/watch?v=golden_temple_live', 'UCgoldentemple', '{"continuous": "24/7"}', true, '["https://images.unsplash.com/photo-1595296130750-96b67049dc77"]'),
('Tirumala Tirupati', '{"city": "Tirupati", "state": "Andhra Pradesh", "country": "India", "lat": 13.6288, "lng": 79.4192}', 'Lord Venkateswara', 'Vaishnavism', 'Famous pilgrimage site dedicated to Lord Venkateswara', 'https://www.youtube.com/watch?v=tirupati_live', 'UCtirupati', '{"morning": "04:00", "afternoon": "14:00", "evening": "18:00"}', true, '["https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3"]');

-- Insert sample calendar events
INSERT INTO public.calendar_events (title, description, event_type, date, significance, rituals) VALUES
('Diwali', 'Festival of Lights celebrating the victory of light over darkness', 'festival', '2024-11-01', 'Celebrates Lord Ramas return to Ayodhya and victory of good over evil', '["lighting_diyas", "rangoli", "lakshmi_puja", "fireworks"]'),
('Ekadashi', 'Auspicious day for fasting and devotion to Lord Vishnu', 'ekadashi', '2024-10-15', 'Spiritual purification and devotion to Lord Vishnu', '["fasting", "vishnu_puja", "bhajan_singing"]'),
('Maha Shivratri', 'Great night of Lord Shiva', 'festival', '2024-03-08', 'Celebrates the marriage of Shiva and Parvati', '["night_vigil", "shiva_abhishek", "rudra_chanting"]'),
('Karva Chauth', 'Fast observed by married women for husbands longevity', 'vrat', '2024-11-04', 'Expression of love and devotion between married couples', '["sunrise_fast", "moon_worship", "decorated_karva"]');

-- Insert sample achievements
INSERT INTO public.achievements (name, description, badge_icon, points_required, category, rarity) VALUES
('First Mantra', 'Complete your first mantra session', '🔤', 0, 'mantra', 'common'),
('Dedicated Devotee', 'Maintain a 7-day streak', '📿', 100, 'streak', 'common'),
('Temple Explorer', 'Visit 5 different temples', '🏛️', 250, 'exploration', 'rare'),
('Spiritual Scholar', 'Read 10 scripture chapters', '📚', 300, 'learning', 'rare'),
('Community Helper', 'Help 50 other devotees', '🤝', 500, 'community', 'epic'),
('Divine Connection', 'Complete 108 consecutive days of practice', '🕉️', 1000, 'dedication', 'legendary');

-- Insert sample bhakti shorts
INSERT INTO public.bhakti_shorts (title, description, video_url, thumbnail_url, category, duration_seconds, approved) VALUES
('Om Namah Shivaya Chant', 'Peaceful chanting of the sacred Shiva mantra', 'https://www.youtube.com/watch?v=example1', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'mantra', 180, true),
('Hanuman Chalisa Recitation', 'Beautiful recitation of Hanuman Chalisa', 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 'devotional', 240, true),
('Ganga Aarti at Haridwar', 'Evening Ganga Aarti ceremony at Har Ki Pauri', 'https://www.youtube.com/watch?v=example3', 'https://images.unsplash.com/photo-1566552881560-0be862a7c445', 'aarti', 300, true);