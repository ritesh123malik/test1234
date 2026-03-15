-- Migration: Weakness Heatmap & Topic Analysis

-- 1. Ensure topic_tags column exists
ALTER TABLE interviewer_responses
  ADD COLUMN IF NOT EXISTS topic_tags TEXT[] DEFAULT '{}';

-- 2. View: daily interview activity for the heatmap grid
-- Maps session activity to intensity levels 0-4
CREATE OR REPLACE VIEW v_user_heatmap_grid AS
SELECT
  s.user_id,
  DATE(r.created_at) AS activity_date,
  COUNT(DISTINCT s.id) AS session_count,
  COUNT(r.id) AS response_count,
  ROUND(AVG(
    (COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) +
     COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) +
     COALESCE(r.score_confidence,0)) / 5.0
  ), 2) AS avg_score,
  -- Intensity level for grid coloring (0=none, 1=low, 2=med, 3=good, 4=excellent)
  CASE
    WHEN COUNT(r.id) = 0 THEN 0
    WHEN ROUND(AVG(
      (COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) +
       COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) +
       COALESCE(r.score_confidence,0)) / 5.0), 2) < 4 THEN 1
    WHEN ROUND(AVG(
      (COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) +
       COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) +
       COALESCE(r.score_confidence,0)) / 5.0), 2) < 6 THEN 2
    WHEN ROUND(AVG(
      (COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) +
       COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) +
       COALESCE(r.score_confidence,0)) / 5.0), 2) < 8 THEN 3
    ELSE 4
  END AS intensity_level
FROM interviewer_sessions s
JOIN interviewer_responses r ON r.session_id = s.id
WHERE s.status = 'completed'
GROUP BY s.user_id, DATE(r.created_at);

-- 3. View: aggregates scores per topic per user
CREATE OR REPLACE VIEW v_topic_scores AS
SELECT
  s.user_id,
  -- Derive topic: use topic_tags if present, else use feedback_weaknesses, fallback to session type
  UNNEST(
    CASE
      WHEN r.topic_tags IS NOT NULL AND array_length(r.topic_tags, 1) > 0
        THEN r.topic_tags
      WHEN r.feedback_weaknesses IS NOT NULL AND array_length(r.feedback_weaknesses, 1) > 0
        THEN r.feedback_weaknesses
      WHEN s.type = 'DSA'
        THEN ARRAY['Arrays']  -- default fallback for untagged DSA
      WHEN s.type = 'System Design'
        THEN ARRAY['System Design']
      WHEN s.type IN ('Behavioral','HR')
        THEN ARRAY['Behavioral']
      ELSE ARRAY['General']
    END
  ) AS topic,
  ROUND(AVG(
    (COALESCE(r.score_correctness,0) + COALESCE(r.score_depth,0) +
     COALESCE(r.score_clarity,0) + COALESCE(r.score_structure,0) +
     COALESCE(r.score_confidence,0)) / 5.0
  ), 2) AS avg_score,
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

-- 4. Materialized View: cached weakness/strength report per user
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weakness_summary AS
SELECT
  user_id,
  -- Bottom 3 topics by avg_score with at least 2 attempts
  ARRAY(
    SELECT topic FROM v_topic_scores t2
    WHERE t2.user_id = t1.user_id AND t2.attempt_count >= 1
    ORDER BY t2.avg_score ASC LIMIT 3
  ) AS weak_topics,
  -- Top 3 topics by avg_score with at least 1 attempt
  ARRAY(
    SELECT topic FROM v_topic_scores t2
    WHERE t2.user_id = t1.user_id AND t2.attempt_count >= 1
    ORDER BY t2.avg_score DESC LIMIT 3
  ) AS strong_topics,
  -- Overall average across all topics
  ROUND(AVG(avg_score), 2) AS overall_avg,
  -- Total interview sessions
  SUM(attempt_count) AS total_responses,
  NOW() AS last_refreshed
FROM v_topic_scores t1
GROUP BY user_id;

-- Index for fast user lookup
CREATE UNIQUE INDEX IF NOT EXISTS mv_weakness_summary_user
  ON mv_weakness_summary(user_id);

-- 5. Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_weakness_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weakness_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
