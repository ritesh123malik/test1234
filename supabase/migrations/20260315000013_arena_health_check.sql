-- [ARENA HEALTH CHECK] Ensuring Institutional Identity Infrastructure
-- This script ensures all tables, columns and data for Search/Filtering are robust.

-- 1. Ensure profiles has gamification columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cgpa NUMERIC(3,2) DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- 2. Ensure Dependency Tables Exist (CRITICAL: Tables must exist before views)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  source      TEXT NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviewer_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'pending',
  overall_score NUMERIC(3,1) DEFAULT 0.0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colleges (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  city     TEXT NOT NULL,
  state    TEXT NOT NULL,
  tier     INTEGER DEFAULT 3
);

CREATE TABLE IF NOT EXISTS cities (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL
);

-- 3. Security (RLS)
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'colleges_select') THEN
        CREATE POLICY colleges_select ON colleges FOR SELECT USING (true);
    END IF;
END $$;

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cities_select') THEN
        CREATE POLICY cities_select ON cities FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Seed Data
INSERT INTO colleges (name, city, state, tier) VALUES
('IIT Bombay', 'Mumbai', 'Maharashtra', 1),
('IIT Delhi', 'New Delhi', 'Delhi', 1),
('IIT Madras', 'Chennai', 'Tamil Nadu', 1),
('IIT Kharagpur', 'Kharagpur', 'West Bengal', 1),
('IIT Kanpur', 'Kanpur', 'Uttar Pradesh', 1),
('IIT Roorkee', 'Roorkee', 'Uttarakhand', 1),
('IIT Hyderabad', 'Hyderabad', 'Telangana', 1),
('NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 1),
('NIT Surathkal', 'Mangalore', 'Karnataka', 1),
('NIT Warangal', 'Warangal', 'Telangana', 1),
('BITS Pilani', 'Pilani', 'Rajasthan', 1),
('BITS Goa', 'Goa', 'Goa', 1),
('BITS Hyderabad', 'Hyderabad', 'Telangana', 1),
('VIT Vellore', 'Vellore', 'Tamil Nadu', 2),
('SRM Institute', 'Chennai', 'Tamil Nadu', 2),
('Manipal Institute', 'Manipal', 'Karnataka', 2),
('DTU Delhi', 'New Delhi', 'Delhi', 2),
('NSIT Delhi', 'New Delhi', 'Delhi', 2),
('IIIT Hyderabad', 'Hyderabad', 'Telangana', 1),
('IIIT Bangalore', 'Bangalore', 'Karnataka', 1),
('Jadavpur University', 'Kolkata', 'West Bengal', 2),
('Anna University', 'Chennai', 'Tamil Nadu', 2),
('Pune University', 'Pune', 'Maharashtra', 2),
('Mumbai University', 'Mumbai', 'Maharashtra', 2),
('LNMIIT Jaipur', 'Jaipur', 'Rajasthan', 2),
('Other', 'Other', 'Other', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO cities (name, state) VALUES
('Mumbai', 'Maharashtra'), ('Delhi', 'Delhi'), ('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'), ('Chennai', 'Tamil Nadu'), ('Kolkata', 'West Bengal'),
('Pune', 'Maharashtra'), ('Ahmedabad', 'Gujarat'), ('Jaipur', 'Rajasthan'),
('Surat', 'Gujarat'), ('Lucknow', 'Uttar Pradesh'), ('Kanpur', 'Uttar Pradesh'),
('Nagpur', 'Maharashtra'), ('Indore', 'Madhya Pradesh'), ('Thane', 'Maharashtra'),
('Bhopal', 'Madhya Pradesh'), ('Visakhapatnam', 'Andhra Pradesh'),
('Pimpri-Chinchwad', 'Maharashtra'), ('Patna', 'Bihar'), ('Vadodara', 'Gujarat'),
('Ghaziabad', 'Uttar Pradesh'), ('Ludhiana', 'Punjab'), ('Agra', 'Uttar Pradesh'),
('Nashik', 'Maharashtra'), ('Faridabad', 'Haryana'), ('Meerut', 'Uttar Pradesh'),
('Rajkot', 'Gujarat'), ('Varanasi', 'Uttar Pradesh'), ('Srinagar', 'J&K'),
('Aurangabad', 'Maharashtra'), ('Dhanbad', 'Jharkhand'), ('Amritsar', 'Punjab'),
('Ranchi', 'Jharkhand'), ('Coimbatore', 'Tamil Nadu'), ('Jodhpur', 'Rajasthan'),
('Kochi', 'Kerala'), ('Guwahati', 'Assam'), ('Chandigarh', 'Chandigarh'),
('Thiruvananthapuram', 'Kerala'), ('Mangalore', 'Karnataka'), ('Other', 'Other')
ON CONFLICT (name) DO NOTHING;

-- 5. Materialized Views (Created outside DO block for reliability)
-- DROP existing views first to ensure they are recreated with correct schema
DROP MATERIALIZED VIEW IF EXISTS mv_leaderboard_global;
DROP MATERIALIZED VIEW IF EXISTS mv_leaderboard_weekly;

CREATE MATERIALIZED VIEW mv_leaderboard_global AS
SELECT
  p.id AS user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.college,
  p.city,
  p.xp,
  p.level,
  p.current_streak,
  RANK() OVER (ORDER BY p.xp DESC) AS global_rank,
  COUNT(DISTINCT s.id) AS total_interviews,
  ROUND(AVG(s.overall_score), 1) AS avg_interview_score,
  NOW() AS last_refreshed
FROM profiles p
LEFT JOIN interviewer_sessions s ON s.user_id = p.id AND s.status = 'completed'
WHERE p.xp > 0
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.college, p.city, p.xp, p.level, p.current_streak;

CREATE UNIQUE INDEX IF NOT EXISTS mv_lb_global_user ON mv_leaderboard_global(user_id);

CREATE MATERIALIZED VIEW mv_leaderboard_weekly AS
SELECT
  p.id AS user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.college,
  p.city,
  p.level,
  p.current_streak,
  COALESCE(SUM(xt.amount), 0) AS weekly_xp,
  RANK() OVER (ORDER BY COALESCE(SUM(xt.amount), 0) DESC) AS weekly_rank,
  NOW() AS last_refreshed
FROM profiles p
LEFT JOIN xp_transactions xt ON xt.user_id = p.id
  AND xt.created_at >= NOW() - INTERVAL '7 days'
  AND xt.amount > 0
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.college, p.city, p.level, p.current_streak
HAVING COALESCE(SUM(xt.amount), 0) > 0;

CREATE UNIQUE INDEX IF NOT EXISTS mv_lb_weekly_user ON mv_leaderboard_weekly(user_id);

-- 6. Helper RPC Functions
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_rank RECORD;
    v_weekly RECORD;
BEGIN
    SELECT global_rank, xp INTO v_rank
    FROM mv_leaderboard_global
    WHERE user_id = p_user_id;

    SELECT weekly_rank, weekly_xp INTO v_weekly
    FROM mv_leaderboard_weekly
    WHERE user_id = p_user_id;

    RETURN json_build_object(
        'global_rank', COALESCE(v_rank.global_rank, 0),
        'xp', COALESCE(v_rank.xp, 0),
        'weekly_rank', COALESCE(v_weekly.weekly_rank, 0),
        'weekly_xp', COALESCE(v_weekly.weekly_xp, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Refresh Materialized Views
REFRESH MATERIALIZED VIEW mv_leaderboard_global;
REFRESH MATERIALIZED VIEW mv_leaderboard_weekly;
