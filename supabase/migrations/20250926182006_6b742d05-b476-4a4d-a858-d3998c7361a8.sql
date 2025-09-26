-- Fix RLS Security Issues: Enable RLS on all user-data tables

-- Enable RLS on profiles table (contains sensitive user data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ai_chat_sessions table (contains private conversations)  
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_activities table (contains user behavior data)
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mantra_sessions table (contains personal spiritual practice data)
ALTER TABLE public.mantra_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_achievements table (contains personal achievement data)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Recreate profiles policies to ensure they're properly applied
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Recreate ai_chat_sessions policies to ensure they're properly applied
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.ai_chat_sessions;

CREATE POLICY "Users can view their own chat sessions" 
ON public.ai_chat_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.ai_chat_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.ai_chat_sessions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Recreate user_activities policies to ensure they're properly applied
DROP POLICY IF EXISTS "Users can view their own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON public.user_activities;

CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.user_activities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recreate mantra_sessions policies to ensure they're properly applied
DROP POLICY IF EXISTS "Users can view their own mantra sessions" ON public.mantra_sessions;
DROP POLICY IF EXISTS "Users can create their own mantra sessions" ON public.mantra_sessions;
DROP POLICY IF EXISTS "Users can update their own mantra sessions" ON public.mantra_sessions;

CREATE POLICY "Users can view their own mantra sessions" 
ON public.mantra_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mantra sessions" 
ON public.mantra_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mantra sessions" 
ON public.mantra_sessions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Recreate user_achievements policies to ensure they're properly applied
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON public.user_achievements;

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements" 
ON public.user_achievements 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);