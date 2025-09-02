-- Create custom types first
CREATE TYPE public.spiritual_level AS ENUM ('beginner', 'seeker', 'devotee', 'sage');
CREATE TYPE public.content_source_type AS ENUM ('saint', 'scripture', 'youtube', 'book', 'audio', 'user_generated');
CREATE TYPE public.content_type AS ENUM ('text', 'audio', 'video', 'mantra', 'prayer');
CREATE TYPE public.content_category AS ENUM ('teaching', 'story', 'explanation', 'ritual', 'philosophy', 'devotional');
CREATE TYPE public.scripture_type AS ENUM ('scripture', 'commentary', 'devotional', 'philosophical', 'mantra');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.faq_category AS ENUM ('rituals', 'philosophy', 'practices', 'festivals', 'mantras', 'meditation');
CREATE TYPE public.activity_type AS ENUM ('mantra_chant', 'scripture_read', 'meditation', 'darshan', 'donation', 'community_post', 'temple_visit');
CREATE TYPE public.post_type AS ENUM ('text', 'image', 'video', 'audio', 'experience', 'question');
CREATE TYPE public.spiritual_category AS ENUM ('devotion', 'experience', 'learning', 'ritual', 'festival', 'pilgrimage');
CREATE TYPE public.visibility_type AS ENUM ('public', 'followers', 'private');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.audio_category AS ENUM ('mantra', 'bhajan', 'aarti', 'meditation', 'story', 'discourse');
CREATE TYPE public.date_type AS ENUM ('fixed', 'lunar', 'solar');
CREATE TYPE public.festival_category AS ENUM ('major', 'regional', 'community', 'personal');

-- Users profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    phone VARCHAR(15),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'hi',
    spiritual_level spiritual_level DEFAULT 'beginner',
    favorite_deities JSONB DEFAULT '[]',
    daily_goals JSONB DEFAULT '{"mantras": 108, "reading_minutes": 15, "meditation_minutes": 10}',
    streak_data JSONB DEFAULT '{"current_streak": 0, "longest_streak": 0, "last_activity": null}',
    location_data JSONB,
    notification_preferences JSONB DEFAULT '{"aarti": true, "festivals": true, "reminders": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saints & Spiritual Leaders
CREATE TABLE public.saints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    regional_names JSONB DEFAULT '{}',
    birth_year INTEGER,
    death_year INTEGER,
    tradition VARCHAR(255),
    primary_language VARCHAR(10) DEFAULT 'hi',
    biography TEXT,
    key_teachings TEXT,
    famous_quotes JSONB DEFAULT '[]',
    image_url TEXT,
    audio_samples JSONB DEFAULT '[]',
    personality_traits JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    ai_model_fine_tuned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scriptures & Holy Books
CREATE TABLE public.scriptures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    tradition VARCHAR(255),
    language VARCHAR(10) DEFAULT 'hi',
    type scripture_type DEFAULT 'scripture',
    total_chapters INTEGER DEFAULT 1,
    description TEXT,
    summary TEXT,
    pdf_url TEXT,
    audio_url TEXT,
    difficulty_level difficulty_level DEFAULT 'beginner',
    estimated_reading_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spiritual Content (Teachings, Quotes, Explanations)
CREATE TABLE public.spiritual_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type content_source_type NOT NULL,
    source_id UUID,
    content_type content_type NOT NULL,
    category content_category NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    summary TEXT,
    tags JSONB DEFAULT '[]',
    language VARCHAR(10) DEFAULT 'hi',
    duration INTEGER,
    difficulty_level difficulty_level DEFAULT 'beginner',
    media_url TEXT,
    transcript TEXT,
    audio_pronunciation TEXT,
    related_content JSONB DEFAULT '[]',
    engagement_metrics JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-Powered FAQ System
CREATE TABLE public.spiritual_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category faq_category NOT NULL,
    source_references JSONB DEFAULT '[]',
    difficulty_level difficulty_level DEFAULT 'beginner',
    language VARCHAR(10) DEFAULT 'hi',
    popularity_score INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT true,
    verified_by_scholar BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for public content (saints, scriptures, content, faqs)
CREATE POLICY "Saints are viewable by everyone" ON public.saints FOR SELECT USING (true);
CREATE POLICY "Scriptures are viewable by everyone" ON public.scriptures FOR SELECT USING (true);
CREATE POLICY "Spiritual content is viewable by everyone" ON public.spiritual_content FOR SELECT USING (true);
CREATE POLICY "FAQs are viewable by everyone" ON public.spiritual_faqs FOR SELECT USING (true);