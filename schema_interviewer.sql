-- interviewer_sessions Table
CREATE TABLE IF NOT EXISTS interviewer_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('DSA','Behavioral','System Design','HR')),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','completed','abandoned')),
  overall_score NUMERIC(4,2),
  created_at    TIMESTAMPTZ DEFAULT now(),
  ended_at      TIMESTAMPTZ
);

-- Index for fast user-level queries
CREATE INDEX IF NOT EXISTS idx_sessions_user ON interviewer_sessions(user_id);

-- interviewer_responses Table
CREATE TABLE IF NOT EXISTS interviewer_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES interviewer_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text   TEXT NOT NULL,
  answer_text     TEXT,
  audio_url       TEXT,
  score_correctness  INTEGER CHECK (score_correctness BETWEEN 0 AND 10),
  score_depth        INTEGER CHECK (score_depth BETWEEN 0 AND 10),
  score_clarity      INTEGER CHECK (score_clarity BETWEEN 0 AND 10),
  score_structure    INTEGER CHECK (score_structure BETWEEN 0 AND 10),
  score_confidence   INTEGER CHECK (score_confidence BETWEEN 0 AND 10),
  feedback_overall   TEXT,
  feedback_strengths TEXT[],
  feedback_weaknesses TEXT[],
  missing_points     TEXT[],
  model_answer       TEXT,
  follow_up_question TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON interviewer_responses(session_id);

-- Enable Row Level Security
ALTER TABLE interviewer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewer_responses ENABLE ROW LEVEL SECURITY;

-- Sessions: User-level access
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_select') THEN
        CREATE POLICY sessions_select ON interviewer_sessions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_insert') THEN
        CREATE POLICY sessions_insert ON interviewer_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_update') THEN
        CREATE POLICY sessions_update ON interviewer_sessions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Responses: Derived session ownership
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'responses_select') THEN
        CREATE POLICY responses_select ON interviewer_responses FOR SELECT
          USING (session_id IN (SELECT id FROM interviewer_sessions WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'responses_insert') THEN
        CREATE POLICY responses_insert ON interviewer_responses FOR INSERT
          WITH CHECK (session_id IN (SELECT id FROM interviewer_sessions WHERE user_id = auth.uid()));
    END IF;
END $$;
