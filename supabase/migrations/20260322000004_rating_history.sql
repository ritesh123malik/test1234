-- Migration: User Rating History
-- Phase 3.5

CREATE TABLE IF NOT EXISTS user_rating_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- 'leetcode' | 'codeforces' | 'gfg' | 'codechef' | 'hackerrank'
    rating INT NOT NULL,
    ranking INT,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics performance
CREATE INDEX IF NOT EXISTS idx_user_rating_history_user_platform ON user_rating_history (user_id, platform, captured_at);

-- RLS
ALTER TABLE user_rating_history ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_rating_history_own" ON user_rating_history;
    CREATE POLICY "user_rating_history_own" ON user_rating_history 
    FOR ALL USING (auth.uid() = user_id);
END $$;
