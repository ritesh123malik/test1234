-- Migration: Recovery of Heatmap & Speech Analysis Views
-- Path: supabase/migrations/20260322000002_recovery_views.sql

-- 1. Ensure Table Columns exist (interviewer_responses)
ALTER TABLE public.interviewer_responses
  ADD COLUMN IF NOT EXISTS topic_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS feedback_weaknesses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS speech_wpm NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS speech_filler_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS speech_vocabulary_richness NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS speech_communication_score NUMERIC(4,1);

-- 2. View: Heatmap Grid
CREATE OR REPLACE VIEW public.v_user_heatmap_grid AS
SELECT
  s.user_id,
  DATE(r.created_at) AS activity_date,
  COUNT(DISTINCT s.id) AS session_count,
  COUNT(r.id) AS response_count,
  ROUND(AVG((COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) + COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) + COALESCE(r.score_confidence,0)) / 5.0), 2) AS avg_score,
  CASE
    WHEN COUNT(r.id) = 0 THEN 0
    WHEN ROUND(AVG((COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) + COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) + COALESCE(r.score_confidence,0)) / 5.0), 2) < 4 THEN 1
    WHEN ROUND(AVG((COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) + COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) + COALESCE(r.score_confidence,0)) / 5.0), 2) < 6 THEN 2
    WHEN ROUND(AVG((COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) + COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) + COALESCE(r.score_confidence,0)) / 5.0), 2) < 8 THEN 3
    ELSE 4
  END AS intensity_level
FROM interviewer_sessions s
JOIN interviewer_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
GROUP BY s.user_id, DATE(r.created_at);

-- 3. View: Topic Scores
CREATE OR REPLACE VIEW public.v_topic_scores AS
SELECT
  s.user_id,
  UNNEST(
    CASE
      WHEN r.topic_tags IS NOT NULL AND array_length(r.topic_tags, 1) > 0 THEN r.topic_tags
      WHEN r.feedback_weaknesses IS NOT NULL AND array_length(r.feedback_weaknesses, 1) > 0 THEN r.feedback_weaknesses
      ELSE ARRAY['General']
    END
  ) AS topic,
  ROUND(AVG((COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) + COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) + COALESCE(r.score_confidence,0)) / 5.0), 2) AS avg_score,
  COUNT(r.id) AS attempt_count,
  MAX(r.created_at) AS last_attempt,
  ROUND(AVG(r.score_correctness), 2) AS avg_correctness,
  ROUND(AVG(r.score_depth), 2) AS avg_depth,
  ROUND(AVG(r.score_clarity), 2) AS avg_clarity,
  ROUND(AVG(r.score_structure), 2) AS avg_structure,
  ROUND(AVG(r.score_confidence), 2) AS avg_confidence
FROM interviewer_sessions s
JOIN interviewer_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
GROUP BY s.user_id, topic;

-- 4. View: Speech Summary
CREATE OR REPLACE VIEW public.v_speech_summary AS
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

-- 5. Materialized View for Weakness Summary
DROP MATERIALIZED VIEW IF EXISTS public.mv_weakness_summary;
CREATE MATERIALIZED VIEW public.mv_weakness_summary AS
SELECT
  user_id,
  ARRAY(SELECT topic FROM v_topic_scores t2 WHERE t2.user_id = t1.user_id AND t2.attempt_count >= 1 ORDER BY t2.avg_score ASC LIMIT 3) AS weak_topics,
  ARRAY(SELECT topic FROM v_topic_scores t2 WHERE t2.user_id = t1.user_id AND t2.attempt_count >= 1 ORDER BY t2.avg_score DESC LIMIT 3) AS strong_topics,
  ROUND(AVG(avg_score), 2) AS overall_avg,
  SUM(attempt_count) AS total_responses,
  NOW() AS last_refreshed
FROM v_topic_scores t1
GROUP BY user_id;

CREATE UNIQUE INDEX IF NOT EXISTS mv_weakness_summary_user ON public.mv_weakness_summary(user_id);
