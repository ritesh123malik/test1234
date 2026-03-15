-- Migration: Daily Challenge & XP System

-- 1. Profiles Extension
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS level           INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_streak  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE,
  ADD COLUMN IF NOT EXISTS city             TEXT;

-- RLS for profiles (idempotent policy updates)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select') THEN
        CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update') THEN
        CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert') THEN
        CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 2. Daily Challenge Tables
CREATE TABLE IF NOT EXISTS daily_challenge_pool (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic_tags  TEXT[],
  platform    TEXT DEFAULT 'leetcode',
  url         TEXT NOT NULL,
  xp_reward   INTEGER NOT NULL DEFAULT 10,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  question_id   UUID NOT NULL REFERENCES daily_challenge_pool(id),
  bonus_xp      INTEGER DEFAULT 0,
  total_solvers INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_challenge_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id   UUID NOT NULL REFERENCES daily_challenges(id),
  challenge_date DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('solved','attempted','skipped')),
  xp_earned      INTEGER DEFAULT 0,
  submitted_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  source      TEXT NOT NULL CHECK (source IN (
                'daily_challenge','interview_session','sheet_completion',
                'streak_bonus','referral','manual')),
  reference_id UUID,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dc_date ON daily_challenges(challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_dcs_user ON daily_challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dcs_date ON daily_challenge_submissions(challenge_date);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id);

-- RLS for new tables
ALTER TABLE daily_challenge_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dcp_select') THEN
        CREATE POLICY dcp_select ON daily_challenge_pool FOR SELECT USING (is_active = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dc_select') THEN
        CREATE POLICY dc_select ON daily_challenges FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dcs_select') THEN
        CREATE POLICY dcs_select ON daily_challenge_submissions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dcs_insert') THEN
        CREATE POLICY dcs_insert ON daily_challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'xp_select') THEN
        CREATE POLICY xp_select ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Award XP Function
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

  RETURN json_build_object(
    'xp_earned', p_amount,
    'streak_bonus', v_streak_bonus,
    'total_xp', v_new_xp,
    'new_level', v_new_level,
    'current_streak', v_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Seed Questions & Initial Challenge
INSERT INTO daily_challenge_pool (title, slug, difficulty, topic_tags, url, xp_reward) VALUES
('Two Sum', 'two-sum', 'Easy', ARRAY['Array','Hash Table'], 'https://leetcode.com/problems/two-sum/', 10),
('Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy', ARRAY['Array','Sliding Window'], 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 10),
('Maximum Subarray', 'maximum-subarray', 'Medium', ARRAY['Array','DP'], 'https://leetcode.com/problems/maximum-subarray/', 20),
('Merge Intervals', 'merge-intervals', 'Medium', ARRAY['Array','Sorting'], 'https://leetcode.com/problems/merge-intervals/', 20),
('Valid Parentheses', 'valid-parentheses', 'Easy', ARRAY['Stack','String'], 'https://leetcode.com/problems/valid-parentheses/', 10),
('Binary Search', 'binary-search', 'Easy', ARRAY['Binary Search','Array'], 'https://leetcode.com/problems/binary-search/', 10),
('Climbing Stairs', 'climbing-stairs', 'Easy', ARRAY['DP','Math'], 'https://leetcode.com/problems/climbing-stairs/', 10),
('LRU Cache', 'lru-cache', 'Medium', ARRAY['Design','Hash Table','Linked List'], 'https://leetcode.com/problems/lru-cache/', 20),
('Word Break', 'word-break', 'Medium', ARRAY['DP','Trie'], 'https://leetcode.com/problems/word-break/', 20),
('Trapping Rain Water', 'trapping-rain-water', 'Hard', ARRAY['Array','Two Pointers','Stack'], 'https://leetcode.com/problems/trapping-rain-water/', 30)
ON CONFLICT DO NOTHING;

INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp)
SELECT
  CURRENT_DATE,
  id,
  CASE WHEN difficulty = 'Hard' THEN 20
       WHEN difficulty = 'Medium' THEN 10
       ELSE 5 END
FROM daily_challenge_pool
WHERE is_active = true
LIMIT 1
ON CONFLICT (challenge_date) DO NOTHING;

-- Note: pg_cron setup must be done manually in Supabase Dashboard as it requires superuser usually.

-- 5. Generic Increment Function
CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = %L', table_name, column_name, column_name, row_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
