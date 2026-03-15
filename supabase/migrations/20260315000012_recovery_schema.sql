-- [RECOVERY] PlacementIntel Daily Challenge System Reset/Sanitization
-- This script ensures all tables exist before applying dual-platform updates.

-- 1. Ensure Base daily_challenge_pool exists
CREATE TABLE IF NOT EXISTS daily_challenge_pool (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic_tags  TEXT[],
  platform    TEXT DEFAULT 'leetcode' CHECK (platform IN ('leetcode', 'codeforces')),
  url         TEXT NOT NULL,
  xp_reward   INTEGER NOT NULL DEFAULT 10,
  is_active   BOOLEAN DEFAULT true,
  external_id TEXT,
  rating      INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Ensure daily_challenges table exists and is updated
CREATE TABLE IF NOT EXISTS daily_challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  question_id   UUID REFERENCES daily_challenge_pool(id),
  platform      TEXT DEFAULT 'leetcode' CHECK (platform IN ('leetcode', 'codeforces')),
  bonus_xp      INTEGER DEFAULT 0,
  total_solvers INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Fix constraints for daily_challenges if they exist but are wrong
DROP INDEX IF EXISTS daily_challenges_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS daily_challenges_date_platform ON daily_challenges(challenge_date, platform);

-- 3. Ensure daily_challenge_submissions exists and is updated
CREATE TABLE IF NOT EXISTS daily_challenge_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id   UUID NOT NULL REFERENCES daily_challenges(id),
  challenge_date DATE NOT NULL,
  platform       TEXT DEFAULT 'leetcode',
  status         TEXT NOT NULL CHECK (status IN ('solved','attempted','skipped')),
  xp_earned      INTEGER DEFAULT 0,
  submitted_at   TIMESTAMPTZ DEFAULT now()
);

-- Fix constraints for submissions
DROP INDEX IF EXISTS daily_challenge_submissions_user_id_challenge_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS dcs_user_date_platform ON daily_challenge_submissions(user_id, challenge_date, platform);

-- 4. Seed Codeforces questions (Safe insert)
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

-- 5. Seed Today if missing
INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, 10, 'leetcode' FROM daily_challenge_pool WHERE platform='leetcode' LIMIT 1
ON CONFLICT (challenge_date, platform) DO NOTHING;

INSERT INTO daily_challenges (challenge_date, question_id, bonus_xp, platform) 
SELECT CURRENT_DATE, id, 10, 'codeforces' FROM daily_challenge_pool WHERE platform='codeforces' LIMIT 1
ON CONFLICT (challenge_date, platform) DO NOTHING;
