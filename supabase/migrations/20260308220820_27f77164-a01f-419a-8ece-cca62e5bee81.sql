-- Drop the overly broad public SELECT policy on profiles
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;

-- Ensure the profiles_public view grants are correct
GRANT SELECT ON public.profiles_public TO anon, authenticated;