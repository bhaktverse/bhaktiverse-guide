
-- Fix notifications INSERT policy: drop any permissive policies and recreate scoped to service_role
DROP POLICY IF EXISTS "System creates notifications" ON public.notifications;
DROP POLICY IF EXISTS "Only service role creates notifications" ON public.notifications;

CREATE POLICY "Only service role creates notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix has_role function: set search_path to empty string for maximum safety
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
