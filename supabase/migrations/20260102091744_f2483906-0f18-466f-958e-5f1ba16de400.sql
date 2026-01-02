-- Grant admin role to test user srsolutioninfo@gmail.com
INSERT INTO user_roles (user_id, role) 
VALUES ('44ac479f-2aa0-4b2b-b758-6a34a38077ac', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update spiritual journey to Level 5 with 1000+ XP for premium access
UPDATE spiritual_journey 
SET 
  level = 5,
  experience_points = 1500,
  karma_score = 500,
  updated_at = NOW()
WHERE user_id = '44ac479f-2aa0-4b2b-b758-6a34a38077ac';