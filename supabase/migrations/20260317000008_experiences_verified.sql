ALTER TABLE public.interview_experiences
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('Easy','Medium','Hard')),
  ADD COLUMN IF NOT EXISTS rounds JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS outcome TEXT CHECK (outcome IN ('Selected','Rejected','Pending'));

CREATE POLICY "Verified users share experiences" ON public.interview_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read verified" ON public.interview_experiences
  FOR SELECT USING (is_verified = true OR auth.uid() = user_id);
