-- Migration: Add multi-platform support and unified submissions
-- Phase 1 & 3 Foundation

-- 1. Extend PROFILES with platform usernames
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gfg_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS codechef_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hackerrank_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS atcoder_username TEXT;

-- 2. Create UNIFIED_SUBMISSIONS table
CREATE TABLE IF NOT EXISTS unified_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- 'leetcode' | 'codeforces' | 'gfg' | 'codechef' | 'hackerrank' | 'atcoder'
    problem_id TEXT NOT NULL,
    problem_title TEXT NOT NULL,
    difficulty TEXT, -- 'easy' | 'medium' | 'hard'
    solved_at TIMESTAMPTZ NOT NULL,
    tags TEXT[],
    contest_id TEXT,
    rating_change INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, platform, problem_id, solved_at)
);

-- 3. Enable RLS
ALTER TABLE unified_submissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "unified_submissions_own" ON unified_submissions;
    CREATE POLICY "unified_submissions_own" ON unified_submissions 
    FOR ALL USING (auth.uid() = user_id);
END $$;

-- 5. Indexing for heatmap performance
CREATE INDEX IF NOT EXISTS idx_unified_submissions_user_date ON unified_submissions (user_id, solved_at);
CREATE INDEX IF NOT EXISTS idx_unified_submissions_platform ON unified_submissions (platform);
