
-- Cleanup stale RLS policies from previous migrations
DROP POLICY IF EXISTS "System creates notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated can view basic profile info" ON profiles;
