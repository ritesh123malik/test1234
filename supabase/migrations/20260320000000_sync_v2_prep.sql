-- Migration: 20260320000000_sync_v2_prep.sql
-- Goal: Extract external_id (slug/problem_id) from URLs to enable auto-sync matching.

-- 0. Aggregate stats table
CREATE TABLE IF NOT EXISTS public.user_solved_questions_summary (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('leetcode','codeforces','github')),
  total_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, platform)
);
ALTER TABLE public.user_solved_questions_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own summary" ON public.user_solved_questions_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own summary" ON public.user_solved_questions_summary USING (auth.uid() = user_id);

-- 1. Helper to extract LeetCode slug
CREATE OR REPLACE FUNCTION extract_lc_slug(url TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN split_part(split_part(url, '/problems/', 2), '/', 1);
END;
$$ LANGUAGE plpgsql;

-- 2. Helper to extract Codeforces ID
CREATE OR REPLACE FUNCTION extract_cf_id(url TEXT) 
RETURNS TEXT AS $$
DECLARE
    contest_id TEXT;
    problem_idx TEXT;
BEGIN
    -- Handle https://codeforces.com/contest/123/problem/A
    IF url LIKE '%/contest/%' THEN
        contest_id := split_part(split_part(url, '/contest/', 2), '/', 1);
        problem_idx := split_part(url, '/problem/', 2);
        RETURN contest_id || '_' || problem_idx;
    -- Handle https://codeforces.com/problemset/problem/123/A
    ELSIF url LIKE '%/problemset/problem/%' THEN
        contest_id := split_part(split_part(url, '/problem/', 2), '/', 1);
        problem_idx := split_part(url, '/problem/', 3);
        RETURN contest_id || '_' || problem_idx;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Populate existing data
UPDATE sheet_questions 
SET external_id = extract_lc_slug(url)
WHERE platform = 'leetcode' AND (external_id IS NULL OR external_id = '');

UPDATE sheet_questions 
SET external_id = extract_cf_id(url)
WHERE platform = 'codeforces' AND (external_id IS NULL OR external_id = '');

-- 4. Cleanup helpers
DROP FUNCTION extract_lc_slug(TEXT);
DROP FUNCTION extract_cf_id(TEXT);

-- 5. Index for faster matching
CREATE INDEX IF NOT EXISTS idx_sheet_questions_ext_id ON sheet_questions(platform, external_id);
CREATE INDEX IF NOT EXISTS idx_user_solved_lc_slug ON user_solved_questions(user_id, lc_slug);
CREATE INDEX IF NOT EXISTS idx_user_solved_cf_id ON user_solved_questions(user_id, cf_problem_id);
