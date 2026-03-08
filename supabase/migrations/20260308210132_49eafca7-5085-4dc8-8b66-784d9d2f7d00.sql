
-- Issue 1: Fix notification injection vulnerability
DROP POLICY IF EXISTS "System creates notifications" ON notifications;
CREATE POLICY "Only service role creates notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Issue 2: Drop overly-permissive profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated can view basic profile info" ON profiles;

-- Issue 3: Recreate profiles_public as security_invoker=false view
DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public
WITH (security_invoker = false) AS
SELECT id, user_id, name, avatar_url, spiritual_level, preferred_language, created_at
FROM profiles;

-- Grant access to the view for anon and authenticated
GRANT SELECT ON profiles_public TO anon, authenticated;
