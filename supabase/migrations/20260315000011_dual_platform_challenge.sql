-- Migration: 20260315000011_dual_platform_challenge.sql

-- [PHASE A] DATABASE UPDATES

-- 1. Extend daily_challenge_pool
ALTER TABLE daily_challenge_pool ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode' CHECK (platform IN ('leetcode', 'codeforces'));
ALTER TABLE daily_challenge_pool ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE daily_challenge_pool ADD COLUMN IF NOT EXISTS rating INTEGER;

-- 2. Seed Codeforces questions
INSERT INTO daily_challenge_pool (title, slug, difficulty, topic_tags, url, xp_reward, platform, external_id, rating) VALUES 
('Theatre Square', 'theatre-square', 'Easy', ARRAY['Math'], 'https://codeforces.com/problemset/problem/1/A', 10, 'codeforces', '1A', 1000), 
('Watermelon', 'watermelon', 'Easy', ARRAY['Math'], 'https://codeforces.com/problemset/problem/4/A', 10, 'codeforces', '4A', 800), 
('Way Too Long Words', 'way-too-long-words', 'Easy', ARRAY['Strings'], 'https://codeforces.com/problemset/problem/71/A', 10, 'codeforces', '71A', 800), 
('Domino piling', 'domino-piling', 'Easy', ARRAY['Math','Greedy'], 'https://codeforces.com/problemset/problem/50/A', 10, 'codeforces', '50A', 900), 
('Bit++', 'bit-plus-plus', 'Easy', ARRAY['Implementation'], 'https://codeforces.com/problemset/problem/282/A', 10, 'codeforces', '282A', 800), 
('Next Round', 'next-round', 'Easy', ARRAY['Implementation'], 'https://codeforces.com/problemset/problem/158/A', 10, 'codeforces', '158A', 900), 
('Stones on the Table', 'stones-on-the-table', 'Easy', ARRAY['Greedy'], 'https://codeforces.com/problemset/problem/165/A', 10, 'codeforces', '165A', 900), 
('George and Accommodation', 'george-accommodation', 'Easy', ARRAY['Implementation'], 'https://codeforces.com/problemset/problem/467/A', 10, 'codeforces', '467A', 900), 
('Maximum Increase', 'maximum-increase', 'Easy', ARRAY['DP','Arrays'], 'https://codeforces.com/problemset/problem/702/A', 15, 'codeforces', '702A', 1000), 
('Twins', 'twins', 'Medium', ARRAY['Greedy','Sorting'], 'https://codeforces.com/problemset/problem/160/A', 20, 'codeforces', '160A', 1200), 
('Registration System', 'registration-system', 'Medium', ARRAY['Hash Table'], 'https://codeforces.com/problemset/problem/4/C', 20, 'codeforces', '4C', 1300), 
('Helpful Maths', 'helpful-maths', 'Medium', ARRAY['Strings','Sorting'], 'https://codeforces.com/problemset/problem/339/A', 20, 'codeforces', '339A', 1200), 
('New Year and the Cipher Suspects', 'cipher-suspects', 'Medium', ARRAY['DP','Strings'], 'https://codeforces.com/problemset/problem/750/A', 20, 'codeforces', '750A', 1200), 
('Bear and Prime 100', 'bear-prime-100', 'Medium', ARRAY['Math','Number Theory'], 'https://codeforces.com/problemset/problem/660/A', 20, 'codeforces', '660A', 1400), 
('Carousel', 'carousel', 'Medium', ARRAY['Greedy'], 'https://codeforces.com/problemset/problem/1198/C', 25, 'codeforces', '1198C', 1600), 
('Painting The Fence', 'painting-fence', 'Hard', ARRAY['Brute Force'], 'https://codeforces.com/problemset/problem/448/C', 30, 'codeforces', '448C', 1800), 
('Vasya and String', 'vasya-string', 'Hard', ARRAY['Strings','Greedy'], 'https://codeforces.com/problemset/problem/676/C', 30, 'codeforces', '676C', 1800), 
('Vasya and Triangle', 'vasya-triangle', 'Hard', ARRAY['Math','Geometry'], 'https://codeforces.com/problemset/problem/1030C', 30, 'codeforces', '1030C', 1900), 
('Books', 'books', 'Hard', ARRAY['Binary Search','Sliding Window'], 'https://codeforces.com/problemset/problem/279/B', 30, 'codeforces', '279B', 2000), 
('Pashmak and Buses', 'pashmak-buses', 'Hard', ARRAY['DP','Combinatorics'], 'https://codeforces.com/problemset/problem/459/C', 35, 'codeforces', '459C', 2200) 
ON CONFLICT (slug) DO NOTHING;

-- 3. Update daily_challenges table for multiple rows per day
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode' CHECK (platform IN ('leetcode', 'codeforces'));
DROP INDEX IF EXISTS daily_challenges_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS daily_challenges_date_platform ON daily_challenges(challenge_date, platform);

-- 4. Update daily_challenge_submissions table
ALTER TABLE daily_challenge_submissions ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode';
DROP INDEX IF EXISTS daily_challenge_submissions_user_id_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS dcs_user_date_platform ON daily_challenge_submissions(user_id, challenge_date, platform);

-- 5. Update Cron Job Function
CREATE OR REPLACE FUNCTION schedule_dual_challenge() RETURNS void AS $$ 
BEGIN 
    -- Schedule LeetCode
    INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
    SELECT CURRENT_DATE + INTERVAL '1 day', id, CASE WHEN difficulty = 'Hard' THEN 20 WHEN difficulty = 'Medium' THEN 10 ELSE 5 END, 'leetcode' 
    FROM daily_challenge_pool 
    WHERE is_active = true AND platform = 'leetcode' 
    AND id NOT IN (SELECT question_id FROM daily_challenges WHERE challenge_date > CURRENT_DATE - INTERVAL '30 days' AND platform = 'leetcode') 
    ORDER BY RANDOM() LIMIT 1 
    ON CONFLICT (challenge_date, platform) DO NOTHING; 

    -- Schedule Codeforces
    INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
    SELECT CURRENT_DATE + INTERVAL '1 day', id, CASE WHEN difficulty = 'Hard' THEN 20 WHEN difficulty = 'Medium' THEN 10 ELSE 5 END, 'codeforces' 
    FROM daily_challenge_pool 
    WHERE is_active = true AND platform = 'codeforces' 
    AND id NOT IN (SELECT question_id FROM daily_challenges WHERE challenge_date > CURRENT_DATE - INTERVAL '30 days' AND platform = 'codeforces') 
    ORDER BY RANDOM() LIMIT 1 
    ON CONFLICT (challenge_date, platform) DO NOTHING; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Seed Today's Challenges manually
INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, CASE WHEN difficulty='Hard' THEN 20 WHEN difficulty='Medium' THEN 10 ELSE 5 END, 'leetcode' 
FROM daily_challenge_pool 
WHERE platform='leetcode' AND is_active=true 
ORDER BY RANDOM() LIMIT 1 
ON CONFLICT (challenge_date, platform) DO NOTHING; 

INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, CASE WHEN difficulty='Hard' THEN 20 WHEN difficulty='Medium' THEN 10 ELSE 5 END, 'codeforces' 
FROM daily_challenge_pool 
WHERE platform='codeforces' AND is_active=true 
ORDER BY RANDOM() LIMIT 1 
ON CONFLICT (challenge_date, platform) DO NOTHING;
