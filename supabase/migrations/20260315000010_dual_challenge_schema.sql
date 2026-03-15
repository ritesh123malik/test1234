-- Migration: 20260315000010_dual_challenge_schema.sql

-- 1. Add platform-specific question columns to daily_challenges
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS lc_question_id UUID REFERENCES daily_challenge_pool(id) ON DELETE SET NULL;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS cf_question_id UUID REFERENCES daily_challenge_pool(id) ON DELETE SET NULL;

-- 2. Update submissions to track specific solves
ALTER TABLE daily_challenge_submissions ADD COLUMN IF NOT EXISTS solved_question_ids UUID[] DEFAULT '{}';

-- 3. Seed some initial pool questions if they don't exist
INSERT INTO daily_challenge_pool (title, slug, difficulty, topic_tags, url, xp_reward)
VALUES 
('Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'Medium', ARRAY['Array', 'Binary Search'], 'https://leetcode.com/problems/search-in-rotated-sorted-array/', 30),
('Theatre Square', 'theatre-square', 'Easy', ARRAY['Math'], 'https://codeforces.com/problemset/problem/1/A', 20)
ON CONFLICT (slug) DO NOTHING;

-- 4. Create a Dual Challenge for Today
DO $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_lc_id UUID;
    v_cf_id UUID;
BEGIN
    SELECT id INTO v_lc_id FROM daily_challenge_pool WHERE slug = 'search-in-rotated-sorted-array' LIMIT 1;
    SELECT id INTO v_cf_id FROM daily_challenge_pool WHERE slug = 'theatre-square' LIMIT 1;
    
    INSERT INTO daily_challenges (challenge_date, question_id, lc_question_id, cf_question_id, bonus_xp)
    VALUES (v_today, v_lc_id, v_lc_id, v_cf_id, 50)
    ON CONFLICT (challenge_date) DO UPDATE SET
        lc_question_id = EXCLUDED.lc_question_id,
        cf_question_id = EXCLUDED.cf_question_id;
END $$;
