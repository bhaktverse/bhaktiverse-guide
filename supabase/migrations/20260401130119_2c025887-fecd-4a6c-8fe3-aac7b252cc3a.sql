
-- Daily challenges table
CREATE TABLE public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL DEFAULT 'mantra',
  points_reward integer NOT NULL DEFAULT 10,
  deity_focus text,
  difficulty text DEFAULT 'beginner',
  active_date date DEFAULT CURRENT_DATE,
  target_count integer DEFAULT 1,
  icon text DEFAULT '🙏',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone" ON public.daily_challenges FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage challenges" ON public.daily_challenges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User challenge completions
CREATE TABLE public.user_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own completions" ON public.user_challenge_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own completions" ON public.user_challenge_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all completions" ON public.user_challenge_completions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Users create own referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Admins view all referrals" ON public.referrals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed some daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, points_reward, deity_focus, difficulty, icon, target_count) VALUES
('Morning Mantra', 'Chant Om Namo Narayanaya 108 times', 'mantra', 20, 'Vishnu', 'beginner', '📿', 108),
('Scripture Reading', 'Read one chapter of Bhagavad Gita', 'scripture', 15, 'Krishna', 'intermediate', '📖', 1),
('Temple Visit', 'Visit a temple and offer prayers', 'darshan', 30, NULL, 'beginner', '🏛️', 1),
('Meditation Session', 'Complete a 15-minute meditation', 'meditation', 25, NULL, 'beginner', '🧘', 1),
('Community Blessing', 'Share a spiritual insight with the community', 'community', 10, NULL, 'beginner', '🙏', 1),
('Hanuman Chalisa', 'Recite Hanuman Chalisa', 'mantra', 20, 'Hanuman', 'beginner', '🐒', 1),
('Krishna Bhajan', 'Listen to or sing a Krishna Bhajan', 'devotional', 15, 'Krishna', 'beginner', '🪈', 1);
