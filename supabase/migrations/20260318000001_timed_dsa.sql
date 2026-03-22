-- Migration: Timed DSA Dynamic Templates
-- Ensures category support for daily_challenge_pool and template flexibility

-- 1. Ensure category exists in daily_challenge_pool
ALTER TABLE daily_challenge_pool ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'dsa';
ALTER TABLE daily_challenge_pool ADD COLUMN IF NOT EXISTS topic TEXT;

-- 2. Indexing for fast retrieval
CREATE INDEX IF NOT EXISTS idx_dcp_category_difficulty ON daily_challenge_pool(category, difficulty);

-- 3. Ensure OA Attempt supports custom titles for practice
ALTER TABLE oa_attempts ADD COLUMN IF NOT EXISTS custom_title TEXT;
