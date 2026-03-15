-- Migration: Final Rectification (Leaderboard + Experiences)

-- 0. Ensure profiles table has required columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;

-- 1. Create Interview Experiences table
CREATE TABLE IF NOT EXISTS interview_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    role TEXT DEFAULT 'SDE',
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interview_experiences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'experiences_public_read') THEN
        CREATE POLICY experiences_public_read ON interview_experiences FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'experiences_own_all') THEN
        CREATE POLICY experiences_own_all ON interview_experiences FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Materialized Views for Leaderboard (Verify/Re-apply)
DROP MATERIALIZED VIEW IF EXISTS mv_leaderboard_global;
CREATE MATERIALIZED VIEW mv_leaderboard_global AS
SELECT
  p.id AS user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.college,
  p.city,
  COALESCE(p.xp, 0) as xp,
  COALESCE(p.level, 1) as level,
  COALESCE(p.streak, 0) as current_streak,
  RANK() OVER (ORDER BY COALESCE(p.xp, 0) DESC) AS global_rank,
  COUNT(DISTINCT s.id) AS total_interviews,
  ROUND(AVG(COALESCE(s.overall_score, 0)), 1) AS avg_interview_score,
  NOW() AS last_refreshed
FROM profiles p
LEFT JOIN interviewer_sessions s ON s.user_id = p.id AND s.status = 'completed'
WHERE COALESCE(p.xp, 0) > 0 OR p.id IN (SELECT id from profiles LIMIT 10) -- Ensure some data for testing
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.college, p.city, p.xp, p.level, p.streak;

CREATE UNIQUE INDEX IF NOT EXISTS mv_lb_global_user ON mv_leaderboard_global(user_id);

-- 3. Redefine get_user_rank to be robust
DROP FUNCTION IF EXISTS get_user_rank(UUID);
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_global_rank  BIGINT;
  v_college      TEXT;
  v_city         TEXT;
  v_college_rank BIGINT;
  v_city_rank    BIGINT;
  v_college_total BIGINT;
  v_city_total    BIGINT;
  v_xp           INT;
BEGIN
  SELECT college, city, xp INTO v_college, v_city, v_xp FROM profiles WHERE id = p_user_id;

  SELECT global_rank INTO v_global_rank FROM mv_leaderboard_global WHERE user_id = p_user_id;

  -- College Rank
  IF v_college IS NOT NULL AND v_college != '' THEN
      SELECT COUNT(*) + 1 INTO v_college_rank FROM mv_leaderboard_global WHERE college = v_college AND xp > v_xp;
      SELECT COUNT(*) INTO v_college_total FROM mv_leaderboard_global WHERE college = v_college;
  END IF;

  -- City Rank
  IF v_city IS NOT NULL AND v_city != '' THEN
      SELECT COUNT(*) + 1 INTO v_city_rank FROM mv_leaderboard_global WHERE city = v_city AND xp > v_xp;
      SELECT COUNT(*) INTO v_city_total FROM mv_leaderboard_global WHERE city = v_city;
  END IF;

  RETURN json_build_object(
    'global_rank',    COALESCE(v_global_rank, 0),
    'college_rank',   COALESCE(v_college_rank, 0),
    'college_total',  COALESCE(v_college_total, 0),
    'city_rank',      COALESCE(v_city_rank, 0),
    'city_total',     COALESCE(v_city_total, 0),
    'college',        v_college,
    'city',           v_city
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
