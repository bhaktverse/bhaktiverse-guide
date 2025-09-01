-- =====================================
-- BhaktVerse Complete Database Schema
-- =====================================
-- This comprehensive SQL schema supports all the features shown in the UI
-- Run this after connecting to Supabase integration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================
-- AUTHENTICATION & USER MANAGEMENT
-- =====================================

-- Enhanced user profiles with spiritual preferences
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(15) UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    
    -- Spiritual Preferences
    preferred_language VARCHAR(10) DEFAULT 'hi',
    spiritual_level spiritual_level_enum DEFAULT 'beginner',
    favorite_deities JSONB DEFAULT '[]',
    spiritual_traditions JSONB DEFAULT '[]',
    
    -- Personalization
    daily_goals JSONB DEFAULT '{
        "mantras": 108, 
        "reading_minutes": 15, 
        "meditation_minutes": 10,
        "temple_visits": 1
    }',
    
    -- Progress Tracking
    streak_data JSONB DEFAULT '{
        "current_streak": 0, 
        "longest_streak": 0, 
        "last_activity": null
    }',
    
    -- Location & Preferences
    location_data JSONB,
    notification_preferences JSONB DEFAULT '{
        "aarti": true, 
        "festivals": true, 
        "reminders": true,
        "community": true
    }',
    
    -- Gamification
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    achievements JSONB DEFAULT '[]',
    badges JSONB DEFAULT '[]',
    
    -- Privacy & Settings
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "activity_visibility": "friends"
    }',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spiritual level enum
CREATE TYPE spiritual_level_enum AS ENUM ('beginner', 'seeker', 'devotee', 'sage');

-- =====================================
-- SAINTS & SPIRITUAL PERSONALITIES
-- =====================================

CREATE TABLE saints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    regional_names JSONB DEFAULT '{}', -- {"hindi": "स्वामी विवेकानन्द", "tamil": "விவேகானந்த்"}
    
    -- Basic Information
    birth_year INTEGER,
    death_year INTEGER,
    birth_place VARCHAR(255),
    tradition VARCHAR(255), -- Advaita, Bhakti, etc.
    lineage VARCHAR(255),
    
    -- Content
    biography TEXT,
    key_teachings TEXT,
    famous_quotes JSONB DEFAULT '[]',
    philosophy_summary TEXT,
    
    -- Media
    image_url TEXT,
    audio_samples JSONB DEFAULT '[]', -- Sample voice/chanting
    video_urls JSONB DEFAULT '[]',
    
    -- AI Personality Data
    personality_traits JSONB DEFAULT '{}', -- For AI model fine-tuning
    speaking_style TEXT,
    common_phrases JSONB DEFAULT '[]',
    teaching_methodology TEXT,
    
    -- Languages & Accessibility
    primary_language VARCHAR(10) DEFAULT 'hi',
    supported_languages JSONB DEFAULT '["hi", "en"]',
    
    -- Content Management
    verified BOOLEAN DEFAULT false,
    ai_model_trained BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    
    -- SEO & Search
    tags JSONB DEFAULT '[]',
    search_keywords TEXT, -- For full-text search
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search index for saints
CREATE INDEX idx_saints_search ON saints USING gin(to_tsvector('simple', name || ' ' || COALESCE(biography, '') || ' ' || COALESCE(key_teachings, '')));

-- =====================================
-- SCRIPTURES & SACRED TEXTS
-- =====================================

CREATE TABLE scriptures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    sanskrit_title VARCHAR(255),
    author VARCHAR(255),
    tradition VARCHAR(255),
    
    -- Content Classification
    type scripture_type_enum DEFAULT 'scripture',
    category VARCHAR(100), -- Vedas, Upanishads, Puranas, etc.
    subcategory VARCHAR(100),
    
    -- Structure
    total_chapters INTEGER,
    total_verses INTEGER,
    estimated_reading_time INTEGER, -- in minutes
    
    -- Content
    description TEXT,
    summary TEXT,
    significance TEXT,
    historical_context TEXT,
    
    -- Media Files
    pdf_url TEXT,
    audio_url TEXT,
    epub_url TEXT,
    
    -- Accessibility
    language VARCHAR(10) DEFAULT 'hi',
    available_languages JSONB DEFAULT '["hi", "en", "sa"]',
    difficulty_level difficulty_level_enum DEFAULT 'beginner',
    
    -- Engagement
    reading_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    tags JSONB DEFAULT '[]',
    
    -- Metadata
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE scripture_type_enum AS ENUM ('scripture', 'commentary', 'devotional', 'philosophical', 'mantra', 'stotra');
CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');

-- Scripture chapters for detailed tracking
CREATE TABLE scripture_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scripture_id UUID REFERENCES scriptures(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    sanskrit_title VARCHAR(255),
    
    -- Content
    content TEXT,
    summary TEXT,
    key_verses JSONB DEFAULT '[]',
    
    -- Media
    audio_url TEXT,
    duration INTEGER, -- in seconds
    
    -- Progress Tracking
    estimated_reading_time INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- SPIRITUAL CONTENT & TEACHINGS
-- =====================================

CREATE TABLE spiritual_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source Information
    source_type content_source_enum NOT NULL,
    source_id UUID, -- References saints.id, scriptures.id, etc.
    source_reference TEXT, -- Specific verse, chapter, etc.
    
    -- Content Classification
    content_type content_type_enum NOT NULL,
    category content_category_enum NOT NULL,
    subcategory VARCHAR(100),
    
    -- Content
    title VARCHAR(255),
    content TEXT NOT NULL,
    summary TEXT,
    explanation TEXT, -- AI-generated explanation
    
    -- Media
    media_url TEXT,
    media_type VARCHAR(50), -- 'audio', 'video', 'image'
    duration INTEGER, -- For audio/video in seconds
    transcript TEXT, -- For audio/video content
    
    -- Language & Accessibility
    language VARCHAR(10) DEFAULT 'hi',
    audio_pronunciation TEXT, -- Phonetic pronunciation
    translation JSONB DEFAULT '{}', -- Multi-language translations
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    difficulty_level difficulty_level_enum DEFAULT 'beginner',
    
    -- Relationships
    related_content JSONB DEFAULT '[]', -- Array of related content IDs
    prerequisites JSONB DEFAULT '[]', -- Content that should be read first
    
    -- Engagement Metrics
    engagement_metrics JSONB DEFAULT '{
        "views": 0, 
        "likes": 0, 
        "shares": 0, 
        "bookmarks": 0,
        "time_spent": 0
    }',
    
    -- Content Management
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    moderation_status moderation_status_enum DEFAULT 'approved',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE content_source_enum AS ENUM ('saint', 'scripture', 'youtube', 'book', 'audio', 'user_generated', 'ai_generated');
CREATE TYPE content_type_enum AS ENUM ('text', 'audio', 'video', 'mantra', 'prayer', 'story', 'explanation');
CREATE TYPE content_category_enum AS ENUM ('teaching', 'story', 'explanation', 'ritual', 'philosophy', 'devotional', 'meditation', 'mantra');
CREATE TYPE moderation_status_enum AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- =====================================
-- AI-POWERED FAQ SYSTEM
-- =====================================

CREATE TABLE spiritual_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    
    -- Classification
    category faq_category_enum NOT NULL,
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    
    -- Source & Attribution
    source_references JSONB DEFAULT '[]', -- References to scriptures, saints, etc.
    answered_by VARCHAR(100), -- 'ai_general', 'saint_vivekananda', etc.
    
    -- Metadata
    difficulty_level difficulty_level_enum DEFAULT 'beginner',
    language VARCHAR(10) DEFAULT 'hi',
    
    -- Engagement
    popularity_score INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    not_helpful_votes INTEGER DEFAULT 0,
    
    -- Content Management
    ai_generated BOOLEAN DEFAULT true,
    verified_by_scholar BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE faq_category_enum AS ENUM ('rituals', 'philosophy', 'practices', 'festivals', 'mantras', 'meditation', 'scriptures', 'saints', 'temples');

-- =====================================
-- TEMPLES & SACRED PLACES
-- =====================================

CREATE TABLE temples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sanskrit_name VARCHAR(255),
    
    -- Location
    location JSONB NOT NULL, -- {"lat": 28.6139, "lng": 77.2090, "address": "..."}
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Temple Information
    primary_deity VARCHAR(255),
    other_deities JSONB DEFAULT '[]',
    tradition VARCHAR(255),
    architecture_style VARCHAR(100),
    
    -- Content
    description TEXT,
    history TEXT,
    significance TEXT,
    festivals_celebrated JSONB DEFAULT '[]',
    
    -- Practical Information
    visiting_hours JSONB DEFAULT '{}', -- {"morning": "05:00-12:00", "evening": "16:00-21:00"}
    entry_fee JSONB DEFAULT '{}', -- {"indian": 0, "foreign": 50}
    dress_code TEXT,
    photography_allowed BOOLEAN DEFAULT true,
    
    -- Contact & Services
    contact_info JSONB DEFAULT '{}', -- {"phone": "", "email": "", "website": ""}
    facilities JSONB DEFAULT '[]', -- ["parking", "prasadam", "accommodation"]
    
    -- Digital Services
    live_darshan_url TEXT,
    darshan_schedule JSONB DEFAULT '{}',
    online_donations BOOLEAN DEFAULT false,
    virtual_tour_url TEXT,
    
    -- Media
    image_urls JSONB DEFAULT '[]',
    video_urls JSONB DEFAULT '[]',
    
    -- Ratings & Reviews
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Management
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial index for location-based queries
CREATE INDEX idx_temples_location ON temples USING GIST (((location->>'lat')::float), ((location->>'lng')::float));

-- =====================================
-- USER ACTIVITIES & GAMIFICATION
-- =====================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type activity_type_enum NOT NULL,
    activity_data JSONB NOT NULL, -- Specific data for each activity type
    
    -- Gamification
    points_earned INTEGER DEFAULT 0,
    streak_contribution BOOLEAN DEFAULT true,
    achievement_unlocked JSONB DEFAULT '[]',
    
    -- Context
    location JSONB, -- Where the activity happened
    duration INTEGER, -- Duration in seconds
    quality_score INTEGER, -- 1-10 rating for activity quality
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE activity_type_enum AS ENUM (
    'mantra_chant', 'scripture_read', 'meditation', 'darshan', 'donation', 
    'community_post', 'temple_visit', 'audio_listen', 'content_share',
    'quiz_complete', 'milestone_reach', 'group_activity'
);

-- User achievements and badges
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    badge_url TEXT,
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- COMMUNITY FEATURES
-- =====================================

CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    
    -- Classification
    post_type post_type_enum NOT NULL,
    spiritual_category community_category_enum NOT NULL,
    tags JSONB DEFAULT '[]',
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    
    -- Privacy & Moderation
    visibility visibility_enum DEFAULT 'public',
    moderation_status moderation_status_enum DEFAULT 'approved',
    
    -- Location (optional)
    location JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE post_type_enum AS ENUM ('text', 'image', 'video', 'audio', 'experience', 'question', 'devotional');
CREATE TYPE community_category_enum AS ENUM ('devotion', 'experience', 'learning', 'ritual', 'festival', 'pilgrimage', 'discussion');
CREATE TYPE visibility_enum AS ENUM ('public', 'followers', 'private');

-- Community interactions
CREATE TABLE community_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    interaction_type interaction_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE interaction_type_enum AS ENUM ('like', 'comment', 'share', 'bookmark', 'report');

-- Comments on posts
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id), -- For nested comments
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- AUDIO CONTENT MANAGEMENT
-- =====================================

CREATE TABLE audio_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    sanskrit_title VARCHAR(255),
    artist VARCHAR(255),
    
    -- Classification
    category audio_category_enum NOT NULL,
    subcategory VARCHAR(100),
    tradition VARCHAR(100),
    
    -- Audio Details
    duration INTEGER NOT NULL, -- in seconds
    file_size INTEGER, -- in bytes
    quality VARCHAR(20), -- '128kbps', '320kbps', etc.
    
    -- Content
    lyrics TEXT,
    meaning TEXT,
    pronunciation_guide TEXT,
    benefits TEXT, -- Spiritual benefits of listening/chanting
    
    -- Associated Information
    associated_deity VARCHAR(255),
    occasion JSONB DEFAULT '[]', -- When to chant/listen
    raga VARCHAR(100), -- Musical raga if applicable
    
    -- Media URLs
    audio_url TEXT NOT NULL,
    karaoke_url TEXT, -- Instrumental version
    video_url TEXT, -- If video version exists
    
    -- Language & Accessibility
    language VARCHAR(10) DEFAULT 'sa',
    available_languages JSONB DEFAULT '["sa", "hi", "en"]',
    difficulty_level difficulty_level_enum DEFAULT 'beginner',
    
    -- Engagement
    download_count INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    favorites_count INTEGER DEFAULT 0,
    
    -- Content Management
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE audio_category_enum AS ENUM ('mantra', 'bhajan', 'aarti', 'meditation', 'story', 'discourse', 'chanting', 'instrumental');

-- User playlists
CREATE TABLE user_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    audio_items JSONB DEFAULT '[]', -- Array of audio_library IDs with order
    total_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- FESTIVALS & CALENDAR SYSTEM
-- =====================================

CREATE TABLE festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sanskrit_name VARCHAR(255),
    regional_names JSONB DEFAULT '{}',
    
    -- Date Calculation
    date_type date_type_enum NOT NULL,
    date_formula TEXT, -- For lunar/solar calculations
    fixed_date DATE, -- For fixed date festivals
    
    -- Content
    description TEXT,
    significance TEXT,
    mythology TEXT,
    
    -- Celebration Details
    rituals JSONB DEFAULT '[]',
    traditional_foods JSONB DEFAULT '[]',
    customs JSONB DEFAULT '[]',
    regional_variations JSONB DEFAULT '{}',
    
    -- Associated Information
    associated_deities JSONB DEFAULT '[]',
    associated_temples JSONB DEFAULT '[]',
    
    -- Duration & Timing
    celebration_duration INTEGER DEFAULT 1, -- in days
    preferred_times JSONB DEFAULT '{}', -- Best times for rituals
    
    -- Classification
    category festival_category_enum DEFAULT 'major',
    tradition VARCHAR(100),
    regions JSONB DEFAULT '[]', -- Where it's celebrated
    
    -- Media
    image_urls JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE date_type_enum AS ENUM ('fixed', 'lunar', 'solar');
CREATE TYPE festival_category_enum AS ENUM ('major', 'regional', 'community', 'personal', 'seasonal');

-- Festival occurrences (calculated dates for specific years)
CREATE TABLE festival_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- AI CONVERSATION HISTORY
-- =====================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Conversation Details
    saint_personality VARCHAR(100), -- 'vivekananda', 'kabir', 'general', etc.
    conversation_title VARCHAR(255),
    
    -- Messages
    messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
    
    -- Context
    context_used JSONB DEFAULT '{}', -- What context was provided to AI
    language VARCHAR(10) DEFAULT 'hi',
    
    -- Metadata
    total_messages INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- NOTIFICATIONS SYSTEM
-- =====================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    icon_url TEXT,
    
    -- Classification
    type notification_type_enum NOT NULL,
    category VARCHAR(100),
    
    -- Action Data
    action_url TEXT,
    action_data JSONB DEFAULT '{}',
    
    -- Delivery Status
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_type_enum AS ENUM ('aarti', 'festival', 'reminder', 'achievement', 'community', 'system');

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- User activities indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_date ON user_activities(created_at);

-- Community posts indexes
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(spiritual_category);
CREATE INDEX idx_community_posts_date ON community_posts(created_at DESC);

-- Audio library indexes
CREATE INDEX idx_audio_library_category ON audio_library(category);
CREATE INDEX idx_audio_library_rating ON audio_library(rating DESC);

-- Festival occurrences indexes
CREATE INDEX idx_festival_occurrences_date ON festival_occurrences(start_date);
CREATE INDEX idx_festival_occurrences_year ON festival_occurrences(year);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- =====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================

-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User activities policies
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Public posts are viewable by everyone" ON community_posts
    FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================
-- FUNCTIONS & TRIGGERS
-- =====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spiritual_content_updated_at BEFORE UPDATE ON spiritual_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION calculate_user_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN points < 1000 THEN 1      -- Beginner
        WHEN points < 5000 THEN 2      -- Seeker  
        WHEN points < 15000 THEN 3     -- Devotee
        ELSE 4                         -- Sage
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after activity
CREATE OR REPLACE FUNCTION update_user_stats_after_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total points and level
    UPDATE user_profiles 
    SET 
        total_points = total_points + NEW.points_earned,
        current_level = calculate_user_level(total_points + NEW.points_earned)
    WHERE id = NEW.user_id;
    
    -- Update streak if applicable
    IF NEW.streak_contribution THEN
        -- Logic to update streak would go here
        -- This is simplified - real implementation would check daily activity
        UPDATE user_profiles 
        SET streak_data = jsonb_set(
            streak_data, 
            '{last_activity}', 
            to_jsonb(NOW()::text)
        )
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats after activity
CREATE TRIGGER update_user_stats_trigger 
    AFTER INSERT ON user_activities 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_activity();

-- =====================================
-- SAMPLE DATA INSERTS
-- =====================================

-- Insert sample saints
INSERT INTO saints (name, regional_names, birth_year, death_year, tradition, biography, key_teachings, personality_traits, primary_language) VALUES
('Swami Vivekananda', '{"hindi": "स्वामी विवेकानन्द", "bengali": "স্বামী বিবেকানন্দ"}', 1863, 1902, 'Advaita Vedanta', 
'Swami Vivekananda was a Hindu monk and chief disciple of the 19th-century saint Ramakrishna.', 
'Arise, awake, and stop not until the goal is reached. You are divine beings.', 
'{"speaking_style": "philosophical yet practical", "personality": "inspiring, rational, youth-oriented"}', 'en'),

('Sant Kabir', '{"hindi": "संत कबीर", "urdu": "کبیر"}', 1398, 1518, 'Bhakti', 
'Kabir was a 15th-century Indian mystic poet and saint whose writings influenced Hinduism and Islam.', 
'The path of love is not a tedious journey. Those who seek will find the truth in simple devotion.', 
'{"speaking_style": "simple yet profound", "personality": "direct, devotional, socially conscious"}', 'hi'),

('Meera Bai', '{"hindi": "मीरा बाई", "gujarati": "મીરાબાઈ"}', 1498, 1547, 'Krishna Bhakti', 
'Meera was a 16th-century Hindu mystic poet and devotee of Krishna.', 
'I am mad with love for my Krishna. The world calls me crazy, but my heart knows the divine truth.', 
'{"speaking_style": "devotional and poetic", "personality": "surrendering, passionate devotee"}', 'hi');

-- Insert sample scriptures
INSERT INTO scriptures (title, sanskrit_title, author, tradition, type, description, difficulty_level, language) VALUES
('Bhagavad Gita', 'भगवद्गीता', 'Vyasa', 'Vedanta', 'scripture', 
'The Bhagavad Gita is a 700-verse Hindu scripture that is part of the epic Mahabharata.', 'intermediate', 'sa'),

('Hanuman Chalisa', 'हनुमान चालीसा', 'Tulsidas', 'Bhakti', 'devotional', 
'A devotional hymn dedicated to Lord Hanuman, consisting of 40 verses.', 'beginner', 'hi'),

('Ramayana', 'रामायण', 'Valmiki', 'Itihasa', 'scripture', 
'The Ramayana is one of the two major Sanskrit epics of ancient India.', 'intermediate', 'sa');

-- Insert sample festivals
INSERT INTO festivals (name, sanskrit_name, date_type, description, category, associated_deities) VALUES
('Diwali', 'दीपावली', 'lunar', 'Festival of lights celebrating the victory of light over darkness.', 'major', '["Lakshmi", "Ganesha"]'),
('Holi', 'होली', 'lunar', 'Festival of colors celebrating the arrival of spring.', 'major', '["Krishna", "Radha"]'),
('Janmashtami', 'जन्माष्टमी', 'lunar', 'Birth anniversary of Lord Krishna.', 'major', '["Krishna"]');

-- Insert sample audio content
INSERT INTO audio_library (title, sanskrit_title, category, duration, lyrics, language, difficulty_level) VALUES
('Om Namah Shivaya', 'ॐ नमः शिवाय', 'mantra', 180, 'Om Namah Shivaya Om Namah Shivaya', 'sa', 'beginner'),
('Hanuman Chalisa', 'हनुमान चालीसा', 'bhajan', 480, 'Full Hanuman Chalisa verses...', 'hi', 'beginner'),
('Gayatri Mantra', 'गायत्री मन्त्र', 'mantra', 120, 'Om Bhur Bhuvaḥ Svaḥ...', 'sa', 'intermediate');

-- =====================================
-- VIEWS FOR COMMON QUERIES
-- =====================================

-- View for user dashboard statistics
CREATE VIEW user_dashboard_stats AS
SELECT 
    up.id,
    up.name,
    up.total_points,
    up.current_level,
    up.streak_data->>'current_streak' as current_streak,
    COUNT(ua.id) as total_activities,
    COUNT(CASE WHEN ua.activity_type = 'mantra_chant' THEN 1 END) as mantras_chanted,
    COUNT(CASE WHEN ua.activity_type = 'scripture_read' THEN 1 END) as scriptures_read,
    COUNT(CASE WHEN ua.activity_type = 'temple_visit' THEN 1 END) as temples_visited
FROM user_profiles up
LEFT JOIN user_activities ua ON up.id = ua.user_id
GROUP BY up.id, up.name, up.total_points, up.current_level, up.streak_data;

-- View for popular content
CREATE VIEW popular_spiritual_content AS
SELECT 
    sc.*,
    s.name as saint_name,
    scr.title as scripture_title,
    (sc.engagement_metrics->>'views')::integer as views,
    (sc.engagement_metrics->>'likes')::integer as likes
FROM spiritual_content sc
LEFT JOIN saints s ON sc.source_id = s.id AND sc.source_type = 'saint'
LEFT JOIN scriptures scr ON sc.source_id = scr.id AND sc.source_type = 'scripture'
WHERE sc.verified = true
ORDER BY (sc.engagement_metrics->>'views')::integer DESC;

-- =====================================
-- FULL-TEXT SEARCH CONFIGURATION
-- =====================================

-- Create search configuration for Hindi/Sanskrit content
CREATE TEXT SEARCH CONFIGURATION hindi_sanskrit (COPY = simple);

-- Search function for spiritual content
CREATE OR REPLACE FUNCTION search_spiritual_content(query_text TEXT, user_lang VARCHAR DEFAULT 'hi')
RETURNS TABLE (
    content_id UUID,
    title VARCHAR,
    content TEXT,
    source_type content_source_enum,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.title,
        sc.content,
        sc.source_type,
        ts_rank(to_tsvector('simple', sc.title || ' ' || sc.content), plainto_tsquery('simple', query_text)) as rank
    FROM spiritual_content sc
    WHERE 
        sc.language = user_lang
        AND to_tsvector('simple', sc.title || ' ' || sc.content) @@ plainto_tsquery('simple', query_text)
        AND sc.verified = true
    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- API HELPER FUNCTIONS
-- =====================================

-- Function to get personalized content recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    content_id UUID,
    title VARCHAR,
    content_type content_type_enum,
    category content_category_enum,
    recommendation_score REAL
) AS $$
DECLARE
    user_prefs JSONB;
    user_level INTEGER;
BEGIN
    -- Get user preferences and level
    SELECT up.favorite_deities, up.current_level INTO user_prefs, user_level
    FROM user_profiles up WHERE up.id = user_uuid;
    
    RETURN QUERY
    SELECT 
        sc.id,
        sc.title,
        sc.content_type,
        sc.category,
        -- Simple recommendation scoring based on engagement and user preferences
        (
            (sc.engagement_metrics->>'views')::integer * 0.3 +
            (sc.engagement_metrics->>'likes')::integer * 0.7 +
            CASE WHEN sc.difficulty_level::text = user_level::text THEN 50 ELSE 0 END
        )::real as recommendation_score
    FROM spiritual_content sc
    WHERE 
        sc.verified = true
        AND sc.language = 'hi' -- Can be parameterized
    ORDER BY recommendation_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- CLEANUP & MAINTENANCE
-- =====================================

-- Function to clean old notification records
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE 
        created_at < NOW() - INTERVAL '90 days'
        AND read_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- END OF SCHEMA
-- =====================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert initial admin user profile (you'll need to replace the UUID with actual auth user ID)
-- INSERT INTO user_profiles (id, name, spiritual_level, total_points, current_level) 
-- VALUES ('your-auth-user-id-here', 'Admin User', 'sage', 50000, 4);

COMMIT;