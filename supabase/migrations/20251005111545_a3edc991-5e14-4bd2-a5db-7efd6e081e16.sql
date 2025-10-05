-- Create enum types for astrology and numerology
CREATE TYPE public.zodiac_sign AS ENUM (
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
);

CREATE TYPE public.planet_type AS ENUM (
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'
);

-- Astrology profiles table
CREATE TABLE public.astro_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  tob TIME,
  place VARCHAR(255),
  lagna zodiac_sign,
  rashi zodiac_sign,
  planets_data JSONB DEFAULT '{}',
  yogas JSONB DEFAULT '[]',
  dasha_data JSONB DEFAULT '{}',
  chart_hash VARCHAR(64) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Numerology reports table
CREATE TABLE public.numerology_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  birth_number INTEGER,
  destiny_number INTEGER,
  expression_number INTEGER,
  soul_number INTEGER,
  personality_number INTEGER,
  lucky_color VARCHAR(50),
  lucky_day VARCHAR(20),
  lucky_mantra TEXT,
  lucky_gemstone VARCHAR(50),
  report_text TEXT,
  detailed_analysis JSONB DEFAULT '{}',
  remedies JSONB DEFAULT '[]',
  ai_version VARCHAR(50) DEFAULT 'v1',
  name_dob_hash VARCHAR(64) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Divine conversations table (AI chat history with caching)
CREATE TABLE public.divine_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  topic VARCHAR(100),
  confidence_score DECIMAL(3,2),
  is_cached BOOLEAN DEFAULT false,
  conversation_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mantras library table
CREATE TABLE public.mantras_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planet planet_type,
  deity VARCHAR(100),
  mantra TEXT NOT NULL,
  meaning TEXT,
  benefits TEXT,
  pronunciation TEXT,
  audio_url TEXT,
  bija_mantra TEXT,
  repetitions INTEGER DEFAULT 108,
  best_time VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily devotion recommendations
CREATE TABLE public.daily_devotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  planet planet_type NOT NULL,
  deity VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  mantra TEXT,
  fast_recommendation TEXT,
  puja_items JSONB DEFAULT '[]',
  story TEXT,
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_of_week, planet)
);

-- User spiritual journey (gamification)
CREATE TABLE public.spiritual_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  mantras_chanted INTEGER DEFAULT 0,
  consultations_done INTEGER DEFAULT 0,
  karma_score INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  current_quest VARCHAR(255),
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.astro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numerology_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divine_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantras_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_journey ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own astro profiles"
  ON public.astro_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own astro profiles"
  ON public.astro_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own astro profiles"
  ON public.astro_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own numerology reports"
  ON public.numerology_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own numerology reports"
  ON public.numerology_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own divine conversations"
  ON public.divine_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own divine conversations"
  ON public.divine_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mantras viewable by everyone"
  ON public.mantras_library FOR SELECT
  USING (true);

CREATE POLICY "Daily devotions viewable by everyone"
  ON public.daily_devotions FOR SELECT
  USING (true);

CREATE POLICY "Users view own spiritual journey"
  ON public.spiritual_journey FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own spiritual journey"
  ON public.spiritual_journey FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own spiritual journey"
  ON public.spiritual_journey FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all divine content
CREATE POLICY "Admins manage mantras"
  ON public.mantras_library FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage daily devotions"
  ON public.daily_devotions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample mantras
INSERT INTO public.mantras_library (planet, deity, mantra, meaning, benefits, bija_mantra, repetitions, best_time) VALUES
('sun', 'Surya Dev', 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', 'Salutations to the Sun God', 'Enhances confidence, leadership, vitality, and success', 'ह्रां', 108, 'Sunrise'),
('moon', 'Chandra Dev', 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः', 'Salutations to the Moon God', 'Improves emotional balance, intuition, and mental peace', 'श्रां', 108, 'Evening'),
('mars', 'Hanuman Ji', 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः', 'Salutations to Mars', 'Increases courage, energy, and removes obstacles', 'क्रां', 108, 'Tuesday morning'),
('mercury', 'Budh Dev', 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', 'Salutations to Mercury', 'Enhances intelligence, communication, and learning', 'ब्रां', 108, 'Wednesday morning'),
('jupiter', 'Brihaspati', 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', 'Salutations to Jupiter', 'Brings wisdom, prosperity, and spiritual growth', 'ग्रां', 108, 'Thursday morning'),
('venus', 'Shukra Dev', 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', 'Salutations to Venus', 'Attracts love, luxury, beauty, and harmony', 'द्रां', 108, 'Friday morning'),
('saturn', 'Shani Dev', 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', 'Salutations to Saturn', 'Removes obstacles, brings discipline and longevity', 'प्रां', 108, 'Saturday evening'),
('rahu', 'Rahu Dev', 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः', 'Salutations to Rahu', 'Protects from negative energies and illusions', 'भ्रां', 108, 'Saturday'),
('ketu', 'Ketu Dev', 'ॐ स्रां स्रीं स्रौं सः केतवे नमः', 'Salutations to Ketu', 'Enhances spiritual liberation and moksha', 'स्रां', 108, 'Any time');

-- Insert daily devotion recommendations
INSERT INTO public.daily_devotions (day_of_week, planet, deity, color, mantra, fast_recommendation, puja_items, story, benefits) VALUES
(0, 'sun', 'Surya Narayan', 'Red', 'Aditya Hridayam', 'Optional sunrise fast', '["Red flowers", "Jaggery", "Wheat", "Copper vessel"]', 'Sun gives life energy to all beings', 'Success, health, leadership'),
(1, 'moon', 'Chandra Dev', 'White', 'Chandra Gayatri', 'Avoid salty food', '["White flowers", "Rice", "Milk", "Silver items"]', 'Moon governs mind and emotions', 'Mental peace, emotional balance'),
(2, 'mars', 'Hanuman Ji', 'Red', 'Hanuman Chalisa', 'Optional evening fast', '["Red flowers", "Jaggery", "Red cloth", "Sindoor"]', 'Mars gives courage and strength', 'Energy, courage, protection'),
(3, 'mercury', 'Vishnu Ji', 'Green', 'Vishnu Sahasranama', 'Green vegetables', '["Green flowers", "Green cloth", "Tulsi leaves"]', 'Mercury rules intellect', 'Intelligence, communication'),
(4, 'jupiter', 'Brihaspati', 'Yellow', 'Guru Stotra', 'Yellow dal and banana', '["Yellow flowers", "Turmeric", "Saffron", "Banana"]', 'Jupiter brings wisdom', 'Wisdom, prosperity, spirituality'),
(5, 'venus', 'Lakshmi Ji', 'White/Pink', 'Lakshmi Aarti', 'White sweet items', '["White flowers", "Kheer", "Silver items"]', 'Venus rules love and beauty', 'Love, beauty, prosperity'),
(6, 'saturn', 'Shani Dev', 'Black', 'Shani Stotra', 'Oil and black til', '["Black sesame", "Mustard oil", "Iron items", "Black cloth"]', 'Saturn teaches discipline', 'Discipline, longevity, karma balance');

-- Create indexes for performance
CREATE INDEX idx_astro_profiles_user ON public.astro_profiles(user_id);
CREATE INDEX idx_astro_profiles_hash ON public.astro_profiles(chart_hash);
CREATE INDEX idx_numerology_user ON public.numerology_reports(user_id);
CREATE INDEX idx_numerology_hash ON public.numerology_reports(name_dob_hash);
CREATE INDEX idx_conversations_user ON public.divine_conversations(user_id);
CREATE INDEX idx_spiritual_journey_user ON public.spiritual_journey(user_id);