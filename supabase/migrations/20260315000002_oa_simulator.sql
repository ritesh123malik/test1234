-- OA Simulator Schema
CREATE TABLE IF NOT EXISTS oa_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
    question_ids UUID[] NOT NULL, -- References aptitude_questions
    coding_question_ids UUID[] NOT NULL, -- References a new coding_questions table
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oa_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES oa_templates NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    tab_switches INT DEFAULT 0,
    is_auto_submitted BOOLEAN DEFAULT false,
    score_percent NUMERIC(5,2),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Coding questions table
CREATE TABLE IF NOT EXISTS coding_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    constraints TEXT,
    difficulty TEXT,
    starter_codes JSONB, -- { "cpp": "...", "java": "..." }
    test_cases JSONB, -- Array of { input: "...", output: "..." }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE oa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE oa_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY oat_public_read ON oa_templates FOR SELECT USING (true);
CREATE POLICY oaa_own ON oa_attempts USING (auth.uid() = user_id);
CREATE POLICY cq_public_read ON coding_questions FOR SELECT USING (true);

-- RPC for incrementing tab switches
CREATE OR REPLACE FUNCTION increment_oa_tab_switches(att_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE oa_attempts
    SET tab_switches = tab_switches + 1
    WHERE id = att_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
