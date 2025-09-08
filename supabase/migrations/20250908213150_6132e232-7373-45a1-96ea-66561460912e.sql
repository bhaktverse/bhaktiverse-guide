-- Create custom types first
DO $$ BEGIN
    CREATE TYPE public.post_type AS ENUM ('text', 'image', 'video', 'experience', 'bhakti_short');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.visibility_type AS ENUM ('public', 'followers', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.activity_type AS ENUM ('mantra_chant', 'scripture_read', 'temple_visit', 'darshan_watch', 'community_post', 'meditation', 'donation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.rarity_type AS ENUM ('common', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM ('festival', 'vrat', 'ekadashi', 'amavasya', 'purnima', 'personal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.session_type AS ENUM ('pooja_assistant', 'meditation_guide', 'astrology', 'general_spiritual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create temples table for live darshan and booking
CREATE TABLE IF NOT EXISTS public.temples (
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
CREATE TABLE IF NOT EXISTS public.mantra_sessions (
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
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    post_type public.post_type DEFAULT 'text',
    tags JSONB DEFAULT '[]',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    visibility public.visibility_type DEFAULT 'public',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bhakti shorts table for video content
CREATE TABLE IF NOT EXISTS public.bhakti_shorts (
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
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type public.activity_type NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    streak_contribution BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements/badges table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    badge_icon TEXT,
    points_required INTEGER DEFAULT 0,
    category VARCHAR(100),
    rarity public.rarity_type DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type public.event_type NOT NULL,
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
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_type public.session_type DEFAULT 'general_spiritual',
    messages JSONB DEFAULT '[]',
    context_data JSONB DEFAULT '{}',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);