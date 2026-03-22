-- Migration: Unified Activity Heatmap View
-- Phase 3

-- Create a view that merges interviewer activity and unified submissions
CREATE OR REPLACE VIEW v_unified_heatmap_grid AS
WITH interviewer_activity AS (
    -- Count sessions per day
    SELECT 
        user_id,
        created_at::date AS activity_date,
        count(*) AS session_count,
        0 AS submission_count,
        'interview' AS activity_type
    FROM interviewer_sessions
    WHERE status = 'completed'
    GROUP BY 1, 2
),
platform_submissions AS (
    -- Count unified submissions per day
    SELECT 
        user_id,
        solved_at::date AS activity_date,
        0 AS session_count,
        count(*) AS submission_count,
        'submission' AS activity_type
    FROM unified_submissions
    GROUP BY 1, 2
),
combined_activity AS (
    SELECT * FROM interviewer_activity
    UNION ALL
    SELECT * FROM platform_submissions
)
SELECT 
    user_id,
    activity_date,
    sum(session_count) AS total_sessions,
    sum(submission_count) AS total_submissions,
    (sum(session_count) + sum(submission_count)) AS total_activity,
    CASE 
        WHEN (sum(session_count) + sum(submission_count)) = 0 THEN 0
        WHEN (sum(session_count) + sum(submission_count)) < 3 THEN 1
        WHEN (sum(session_count) + sum(submission_count)) < 6 THEN 2
        WHEN (sum(session_count) + sum(submission_count)) < 10 THEN 3
        ELSE 4
    END AS intensity_level
FROM combined_activity
GROUP BY 1, 2;
阻
-- Ensure we have RLS handled via the underlying tables or simple view access
-- Views often inherit permissions but check if your Supabase setup requires explicit grants
