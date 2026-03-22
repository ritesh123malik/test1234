CREATE TABLE IF NOT EXISTS public.user_solved_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  lc_slug TEXT,
  cf_problem_id TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('leetcode','codeforces')),
  solved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lc_slug),
  UNIQUE(user_id, cf_problem_id)
);
ALTER TABLE public.user_solved_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own solved" ON public.user_solved_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own solved" ON public.user_solved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_company_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  prep_score INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, company_id)
);
ALTER TABLE public.user_company_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.user_company_progress USING (auth.uid() = user_id);
