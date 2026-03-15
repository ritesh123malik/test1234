-- 1. PROFILES SYNC
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  xp          INTEGER DEFAULT 0,
  streak      INTEGER DEFAULT 0,
  cgpa        NUMERIC(3,2) DEFAULT 0.0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can edit own profile" ON public.profiles;
    CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
END $$;

-- Trigger for auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'username', LOWER(SPLIT_PART(NEW.email, '@', 1)) || SUBSTRING(CAST(NEW.id AS TEXT), 1, 4))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SOCIAL LINKS & STATS
CREATE TABLE IF NOT EXISTS user_social_links (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL CHECK (platform IN
                   ('leetcode','github','codeforces','hackerrank','codechef')),
  username       TEXT NOT NULL,
  is_verified    BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS user_social_stats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL,
  stats_json  JSONB NOT NULL DEFAULT '{}',
  fetched_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_stats ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS sl_all ON user_social_links;
    CREATE POLICY sl_all ON user_social_links USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS ss_all ON user_social_stats;
    CREATE POLICY ss_all ON user_social_stats USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS ss_public_read ON user_social_stats;
    CREATE POLICY ss_public_read ON user_social_stats FOR SELECT USING (true);
END $$;

-- 3. QUESTION SHEETS
CREATE TABLE IF NOT EXISTS question_sheets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = global/premium
  title       TEXT NOT NULL,
  description TEXT,
  is_premium  BOOLEAN DEFAULT false,
  is_public   BOOLEAN DEFAULT false,
  company_tag TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sheet_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id     UUID NOT NULL REFERENCES question_sheets(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  url          TEXT,
  platform     TEXT,
  difficulty   TEXT CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic_tags   TEXT[],
  status       TEXT DEFAULT 'unsolved'
               CHECK (status IN ('unsolved','in_progress','solved','revisit')),
  notes        TEXT,
  question_number INTEGER,
  added_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE question_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_questions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS qs_select ON question_sheets;
    CREATE POLICY qs_select ON question_sheets FOR SELECT
      USING (user_id = auth.uid() OR is_public = true OR is_premium = true);
    
    DROP POLICY IF EXISTS qs_insert ON question_sheets;
    CREATE POLICY qs_insert ON question_sheets FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS sq_select ON sheet_questions;
    CREATE POLICY sq_select ON sheet_questions FOR SELECT
      USING (sheet_id IN (SELECT id FROM question_sheets
             WHERE user_id = auth.uid() OR is_public = true OR is_premium = true));
    
    DROP POLICY IF EXISTS sq_all ON sheet_questions;
    CREATE POLICY sq_all ON sheet_questions FOR ALL
      USING (sheet_id IN (SELECT id FROM question_sheets WHERE user_id = auth.uid()));
END $$;

-- 4. CONTEST CALENDAR
CREATE TABLE IF NOT EXISTS contest_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  platform    TEXT NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  duration_seconds INTEGER,
  url         TEXT,
  external_id TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_contest_bookmarks (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES contest_events(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, contest_id)
);

ALTER TABLE user_contest_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS ucb_all ON user_contest_bookmarks;
    CREATE POLICY ucb_all ON user_contest_bookmarks
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. SEED PREMIUM SHEETS (Safe Inserts)
INSERT INTO question_sheets (title, description, is_premium, is_public, company_tag)
VALUES
  ('Top 75 LeetCode',      'Blind 75 — the classic must-do list',   false, true,  NULL),
  ('Striver SDE Sheet',    '180 questions by TakeUForward',          false, true,  NULL),
  ('Top 100 Meta',         'Frequently asked at Meta/Facebook',      true,  false, 'meta'),
  ('Top 100 Google',       'Frequently asked at Google',             true,  false, 'google'),
  ('Top 100 Microsoft',    'Frequently asked at Microsoft',          true,  false, 'microsoft'),
  ('Top 50 Amazon',        'Amazon Leadership + DSA combined',       true,  false, 'amazon')
ON CONFLICT DO NOTHING;
