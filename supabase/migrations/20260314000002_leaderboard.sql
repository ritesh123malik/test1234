-- Migration: College & City Leaderboard

-- 1. Seed Lists (Colleges & Cities)
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

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'colleges_select') THEN
        CREATE POLICY colleges_select ON colleges FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cities_select') THEN
        CREATE POLICY cities_select ON cities FOR SELECT USING (true);
    END IF;
END $$;

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

-- 2. Materialized Views
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_leaderboard_global AS
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
WHERE p.xp >= 0 AND (p.username IS NOT NULL OR p.full_name IS NOT NULL)
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.college, p.city, p.xp, p.level, p.current_streak;

CREATE UNIQUE INDEX IF NOT EXISTS mv_lb_global_user ON mv_leaderboard_global(user_id);
CREATE INDEX IF NOT EXISTS mv_lb_global_rank ON mv_leaderboard_global(global_rank);
CREATE INDEX IF NOT EXISTS mv_lb_global_college ON mv_leaderboard_global(college);
CREATE INDEX IF NOT EXISTS mv_lb_global_city ON mv_leaderboard_global(city);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_leaderboard_weekly AS
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
HAVING COALESCE(SUM(xt.amount), 0) >= 0;

CREATE UNIQUE INDEX IF NOT EXISTS mv_lb_weekly_user ON mv_leaderboard_weekly(user_id);
CREATE INDEX IF NOT EXISTS mv_lb_weekly_rank ON mv_leaderboard_weekly(weekly_rank);
CREATE INDEX IF NOT EXISTS mv_lb_weekly_college ON mv_leaderboard_weekly(college);

-- 3. Refresh Function & Cron Job
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_leaderboard_global;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_leaderboard_weekly;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: cron.schedule requires pg_cron extension to be enabled in dashboard.
-- We wrap it in a block to avoid errors if extension is not present.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
          'refresh-leaderboards',
          '*/15 * * * *',
          $$ SELECT refresh_leaderboards(); $$
        );
    END IF;
END $$;

-- 4. User Rank Helper Function
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_global_rank  BIGINT;
  v_weekly_rank  BIGINT;
  v_college_rank BIGINT;
  v_city_rank    BIGINT;
  v_college      TEXT;
  v_city         TEXT;
  v_college_total BIGINT;
  v_city_total    BIGINT;
BEGIN
  SELECT college, city INTO v_college, v_city FROM profiles WHERE id = p_user_id;

  SELECT global_rank INTO v_global_rank FROM mv_leaderboard_global WHERE user_id = p_user_id;
  SELECT weekly_rank INTO v_weekly_rank FROM mv_leaderboard_weekly WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_college_rank FROM mv_leaderboard_global WHERE college = v_college AND xp >= (SELECT xp FROM profiles WHERE id = p_user_id);
  SELECT COUNT(*) INTO v_college_total FROM mv_leaderboard_global WHERE college = v_college;

  SELECT COUNT(*) INTO v_city_rank FROM mv_leaderboard_global WHERE city = v_city AND xp >= (SELECT xp FROM profiles WHERE id = p_user_id);
  SELECT COUNT(*) INTO v_city_total FROM mv_leaderboard_global WHERE city = v_city;

  RETURN json_build_object(
    'global_rank',    v_global_rank,
    'weekly_rank',    v_weekly_rank,
    'college_rank',   v_college_rank,
    'college_total',  v_college_total,
    'city_rank',      v_city_rank,
    'city_total',     v_city_total,
    'college',        v_college,
    'city',           v_city
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Perform initial refresh
SELECT refresh_leaderboards();

-- 5. Redefine award_xp to include real-time refresh (optional for high traffic)
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_source     TEXT,
  p_reference  UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_today        DATE := CURRENT_DATE;
  v_last_active  DATE;
  v_streak       INTEGER;
  v_new_xp       INTEGER;
  v_new_level    INTEGER;
  v_streak_bonus INTEGER := 0;
BEGIN
  -- Get current profile state
  SELECT last_active_date, current_streak
  INTO v_last_active, v_streak
  FROM profiles WHERE id = p_user_id;

  -- Streak logic
  IF v_last_active = v_today - INTERVAL '1 day' THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSIF v_last_active = v_today THEN
    v_streak := COALESCE(v_streak, 1);
  ELSE
    v_streak := 1;
  END IF;

  -- Streak bonus XP
  IF v_streak > 0 AND v_streak % 7 = 0 THEN
    v_streak_bonus := 25;
  ELSIF v_streak >= 3 THEN
    v_streak_bonus := 5;
  END IF;

  -- Level calculation
  SELECT xp INTO v_new_xp FROM profiles WHERE id = p_user_id;
  v_new_xp := COALESCE(v_new_xp, 0) + p_amount + v_streak_bonus;
  v_new_level := floor(sqrt(v_new_xp::float / 100)) + 1;

  -- Update profile atomically
  UPDATE profiles SET
    xp             = v_new_xp,
    level          = v_new_level,
    current_streak = v_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_streak),
    last_active_date = v_today
  WHERE id = p_user_id;

  -- Log XP transaction
  INSERT INTO xp_transactions (user_id, amount, source, reference_id, description)
  VALUES (p_user_id, p_amount + v_streak_bonus, p_source, p_reference, p_description);

  -- Real-time leaderboard refresh
  PERFORM refresh_leaderboards();

  RETURN json_build_object(
    'xp_earned', p_amount,
    'streak_bonus', v_streak_bonus,
    'total_xp', v_new_xp,
    'new_level', v_new_level,
    'current_streak', v_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

