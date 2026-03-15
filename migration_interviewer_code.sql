-- Add code storage and new score columns to existing table
ALTER TABLE interviewer_responses
  ADD COLUMN IF NOT EXISTS code_snippet          TEXT,
  ADD COLUMN IF NOT EXISTS score_code_correctness INTEGER CHECK (score_code_correctness BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS score_time_complexity  INTEGER CHECK (score_time_complexity  BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS score_space_complexity INTEGER CHECK (score_space_complexity BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS score_readability      INTEGER CHECK (score_readability      BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS score_edge_cases       INTEGER CHECK (score_edge_cases       BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS code_feedback          TEXT,
  ADD COLUMN IF NOT EXISTS complexity_analysis    JSONB,
  ADD COLUMN IF NOT EXISTS model_code_solution    TEXT;
