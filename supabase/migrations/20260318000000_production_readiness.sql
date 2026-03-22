-- Phase 3: Database Schema Fixes for Production Readiness

-- 1. Profiles Table Fixes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roadmap_generated_at TIMESTAMP WITH TIME ZONE;

-- 2. Daily Challenges Table Fixes
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode';
DROP INDEX IF EXISTS daily_challenges_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS daily_challenges_date_platform ON daily_challenges(challenge_date, platform);

-- 3. Daily Challenge Submissions Table Fixes
ALTER TABLE daily_challenge_submissions ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode';
DROP INDEX IF EXISTS daily_challenge_submissions_user_id_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS dcs_user_date_platform ON daily_challenge_submissions(user_id, challenge_date, platform);

-- 4. Interviewer Responses Speech Columns
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_wpm NUMERIC(6,1);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_filler_count INTEGER;
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_filler_rate NUMERIC(5,2);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_filler_words JSONB DEFAULT '{}';
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_vocabulary_richness NUMERIC(4,3);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_avg_sentence_len NUMERIC(5,1);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_hedge_rate NUMERIC(5,2);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_communication_score NUMERIC(4,1);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS audio_duration_seconds NUMERIC(8,2);
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_pace_label TEXT;
ALTER TABLE interviewer_responses ADD COLUMN IF NOT EXISTS speech_feedback TEXT[];

-- 5. Question Sheets Columns
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS reference_url TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'dsa';
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS difficulty_range TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#3B82F6';

-- 6. RLS Policies for user_social_stats
ALTER TABLE user_social_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ss_public_read ON user_social_stats;
CREATE POLICY ss_public_read ON user_social_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS ss_owner_write ON user_social_stats;
CREATE POLICY ss_owner_write ON user_social_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- 8. Seed Today's Challenges
INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, CASE WHEN difficulty='Hard' THEN 20 WHEN difficulty='Medium' THEN 10 ELSE 5 END, 'leetcode' 
FROM daily_challenge_pool 
WHERE platform='leetcode' AND is_active=true 
ORDER BY RANDOM() 
LIMIT 1 
ON CONFLICT (challenge_date, platform) DO NOTHING;

INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, CASE WHEN difficulty='Hard' THEN 20 WHEN difficulty='Medium' THEN 10 ELSE 5 END, 'codeforces' 
FROM daily_challenge_pool 
WHERE platform='codeforces' AND is_active=true 
ORDER BY RANDOM() 
LIMIT 1 
ON CONFLICT (challenge_date, platform) DO NOTHING;
