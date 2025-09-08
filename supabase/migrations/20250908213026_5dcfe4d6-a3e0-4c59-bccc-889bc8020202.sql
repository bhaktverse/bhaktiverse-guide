-- Create temples table for live darshan and booking
CREATE TABLE public.temples (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location JSONB NOT NULL,
    primary_deity VARCHAR(255),
    tradition VARCHAR(255),
    description TEXT,
    history TEXT,
    visiting_hours JSONB,
    contact_info JSONB,
    live_darshan_url TEXT,
    youtube_channel_id TEXT,
    darshan_schedule JSONB,
    facilities JSONB DEFAULT '[]',
    entrance_fee JSONB,
    image_urls JSONB DEFAULT '[]',
    rating DECIMAL(3,2) DEFAULT 0.00,
    verified BOOLEAN DEFAULT false,
    booking_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mantra tracker table
CREATE TABLE public.mantra_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    mantra_name VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    target_count INTEGER DEFAULT 108,
    duration_minutes INTEGER,
    session_date DATE DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false,
    streak_day INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community posts table
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    post_type ENUM('text', 'image', 'video', 'experience', 'bhakti_short') DEFAULT 'text',
    tags JSONB DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bhakti shorts table for video content
CREATE TABLE public.bhakti_shorts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    creator_id UUID,
    category VARCHAR(100) DEFAULT 'devotional',
    duration_seconds INTEGER,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT false,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user activities for gamification
CREATE TABLE public.user_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type ENUM('mantra_chant', 'scripture_read', 'temple_visit', 'darshan_watch', 'community_post', 'meditation', 'donation') NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    streak_contribution BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements/badges table
CREATE TABLE public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    badge_icon TEXT,
    points_required INTEGER DEFAULT 0,
    category VARCHAR(100),
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements junction table
CREATE TABLE public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create calendar events table
CREATE TABLE public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('festival', 'vrat', 'ekadashi', 'amavasya', 'purnima', 'personal') NOT NULL,
    date DATE NOT NULL,
    time TIME,
    duration_hours INTEGER DEFAULT 1,
    reminder_enabled BOOLEAN DEFAULT true,
    regional_significance JSONB DEFAULT '[]',
    rituals JSONB DEFAULT '[]',
    significance TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI chat sessions table
CREATE TABLE public.ai_chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_type ENUM('pooja_assistant', 'meditation_guide', 'astrology', 'general_spiritual') DEFAULT 'general_spiritual',
    messages JSONB DEFAULT '[]',
    context_data JSONB DEFAULT '{}',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantra_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bhakti_shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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