-- Allow anyone to read basic profile info (name, avatar) for community features
CREATE POLICY "Anyone can view basic profile info"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the restrictive own-profile-only SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;