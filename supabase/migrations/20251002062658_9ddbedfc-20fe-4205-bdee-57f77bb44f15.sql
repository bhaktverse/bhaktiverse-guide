-- Create audio_library table with complete structure
CREATE TABLE IF NOT EXISTS audio_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  category VARCHAR(50) NOT NULL, -- 'mantra', 'bhajan', 'aarti', 'meditation', 'story', 'discourse'
  duration INTEGER NOT NULL, -- in seconds
  language VARCHAR(10) NOT NULL,
  audio_url TEXT NOT NULL,
  lyrics TEXT,
  meaning TEXT,
  pronunciation_guide TEXT,
  associated_deity VARCHAR(255),
  occasion JSONB DEFAULT '[]',
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audio_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio library is viewable by everyone"
ON audio_library FOR SELECT
USING (true);

-- Create scripture_chapters table
CREATE TABLE IF NOT EXISTS scripture_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scripture_id UUID REFERENCES scriptures(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  verse_count INTEGER DEFAULT 0,
  summary TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scripture_id, chapter_number)
);

ALTER TABLE scripture_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scripture chapters viewable by everyone"
ON scripture_chapters FOR SELECT
USING (true);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tracks JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own and public playlists"
ON playlists FOR SELECT
USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Create own playlists"
ON playlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own playlists"
ON playlists FOR UPDATE
USING (auth.uid() = user_id);