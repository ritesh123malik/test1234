-- Migration: 20260314000005_aptitude_module.sql

-- 1. Aptitude Questions Table
CREATE TABLE IF NOT EXISTS aptitude_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('quantitative', 'logical', 'verbal', 'data_interpretation')),
    sub_category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Format: {"A": "Choice 1", "B": "Choice 2", ...}
    correct_option TEXT NOT NULL, -- e.g., "A"
    explanation TEXT NOT NULL,
    company_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Aptitude Sessions Table
CREATE TABLE IF NOT EXISTS aptitude_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    mode TEXT CHECK (mode IN ('practice', 'timed_mock', 'company_mock')),
    category TEXT, -- 'mixed' or specific category
    company_filter TEXT,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    time_taken_seconds INT,
    time_limit_seconds INT,
    completed BOOLEAN DEFAULT false,
    score_percent NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Aptitude Answers Table (Tracking individual responses)
CREATE TABLE IF NOT EXISTS aptitude_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES aptitude_sessions NOT NULL ON DELETE CASCADE,
    question_id UUID REFERENCES aptitude_questions NOT NULL,
    selected_option TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_answers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Questions are public read
CREATE POLICY aq_public_read ON aptitude_questions FOR SELECT USING (true);

-- Sessions: Users can only see/manage their own
CREATE POLICY as_own_all ON aptitude_sessions USING (auth.uid() = user_id);

-- Answers: Users can only see/manage answers for their own sessions
CREATE POLICY aa_own_all ON aptitude_answers 
USING (session_id IN (SELECT id FROM aptitude_sessions WHERE user_id = auth.uid()));

-- 6. Helper RPC for incrementing score
CREATE OR REPLACE FUNCTION increment_aptitude_score(s_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE aptitude_sessions 
    SET correct_answers = correct_answers + 1 
    WHERE id = s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
