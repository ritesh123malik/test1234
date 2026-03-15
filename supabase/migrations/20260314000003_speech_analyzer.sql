-- Add speech analysis columns to existing table
ALTER TABLE interviewer_responses
  ADD COLUMN IF NOT EXISTS speech_wpm              NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS speech_filler_count     INTEGER,
  ADD COLUMN IF NOT EXISTS speech_filler_rate      NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS speech_filler_words     JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS speech_vocabulary_richness NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS speech_avg_sentence_len NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS speech_hedge_rate       NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS speech_communication_score NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS audio_duration_seconds  NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS speech_pace_label       TEXT,
  ADD COLUMN IF NOT EXISTS speech_feedback         TEXT[];

-- View for displaying speech trends across sessions
CREATE OR REPLACE VIEW v_speech_summary AS
SELECT
  s.user_id,
  s.id AS session_id,
  s.type AS session_type,
  DATE(s.created_at) AS session_date,
  ROUND(AVG(r.speech_wpm), 1) AS avg_wpm,
  ROUND(AVG(r.speech_filler_rate), 2) AS avg_filler_rate,
  ROUND(AVG(r.speech_vocabulary_richness), 3) AS avg_vocabulary,
  ROUND(AVG(r.speech_communication_score), 1) AS avg_comm_score,
  COUNT(r.id) AS response_count
FROM interviewer_sessions s
JOIN interviewer_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
  AND r.speech_communication_score IS NOT NULL
GROUP BY s.user_id, s.id, s.type, DATE(s.created_at);
