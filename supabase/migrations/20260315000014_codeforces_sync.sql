-- 1. ADD FEEDBACK COLUMN TO QUESTION_SUBMISSIONS
ALTER TABLE question_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;

-- 2. CREATE CODEFORCES_PROFILES TABLE
CREATE TABLE IF NOT EXISTS codeforces_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  codeforces_handle TEXT NOT NULL,
  rating            INTEGER DEFAULT 0,
  max_rating        INTEGER DEFAULT 0,
  rank              TEXT,
  max_rank          TEXT,
  last_synced_at    TIMESTAMPTZ DEFAULT now(),
  profile_data      JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE codeforces_profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "codeforces_own" ON codeforces_profiles;
    CREATE POLICY "codeforces_own" ON codeforces_profiles 
      FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "codeforces_public_read" ON codeforces_profiles;
    CREATE POLICY "codeforces_public_read" ON codeforces_profiles 
      FOR SELECT USING (true);
END $$;
