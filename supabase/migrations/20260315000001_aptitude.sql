-- Aptitude Module Schema
CREATE TABLE IF NOT EXISTS aptitude_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('quantitative','logical','verbal','data_interpretation')),
    sub_category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_option TEXT NOT NULL, -- e.g., "A", "B", "C", "D" or exact string
    explanation TEXT NOT NULL,
    company_tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aptitude_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    mode TEXT CHECK (mode IN ('practice','timed_mock','company_mock')),
    category TEXT, -- "mixed" or specific
    company_filter TEXT,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    time_taken_seconds INT,
    time_limit_seconds INT,
    completed BOOLEAN DEFAULT false,
    score_percent NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aptitude_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES aptitude_sessions NOT NULL,
    question_id UUID REFERENCES aptitude_questions NOT NULL,
    selected_option TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY aq_public_read ON aptitude_questions FOR SELECT USING (true);
CREATE POLICY as_own ON aptitude_sessions USING (auth.uid() = user_id);
CREATE POLICY aa_own ON aptitude_answers USING (session_id IN (SELECT id FROM aptitude_sessions WHERE user_id = auth.uid()));

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_aq_category ON aptitude_questions(category);
CREATE INDEX IF NOT EXISTS idx_as_user ON aptitude_sessions(user_id);

-- RPC for incrementing score (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_aptitude_score(sess_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE aptitude_sessions
    SET correct_answers = correct_answers + 1
    WHERE id = sess_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
