-- Migration: Create Interview Experiences Table
-- Path: supabase/migrations/20260310082500_interview_wiki.sql

CREATE TABLE IF NOT EXISTS interview_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    round TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    outcome TEXT NOT NULL,
    year INTEGER NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interview_experiences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public experiences are viewable by everyone" ON interview_experiences
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own experiences" ON interview_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences" ON interview_experiences
    FOR UPDATE USING (auth.uid() = user_id);

-- Add to gamification awarding points
-- Update award_activity_points function to handle 'wiki_contribution'
CREATE OR REPLACE FUNCTION award_activity_points(
  p_user_id UUID,
  p_activity TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INT;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Determine points based on activity
  v_points := CASE p_activity
    WHEN 'question_solved' THEN 10
    WHEN 'quiz_completed' THEN 50
    WHEN 'design_created' THEN 100
    WHEN 'application_added' THEN 5
    WHEN 'daily_login' THEN 5
    WHEN 'wiki_contribution' THEN 75
    ELSE 0
  END;

  -- Insert activity log
  INSERT INTO user_activity_logs (user_id, activity_type, points, created_at)
  VALUES (p_user_id, p_activity, v_points, NOW());

  -- Update leaderboard entry
  INSERT INTO leaderboard_entries (user_id, total_points, questions_solved, quizzes_taken, designs_created, applications_tracked, last_updated)
  VALUES (p_user_id, v_points, 
    CASE WHEN p_activity = 'question_solved' THEN 1 ELSE 0 END,
    CASE WHEN p_activity = 'quiz_completed' THEN 1 ELSE 0 END,
    CASE WHEN p_activity = 'design_created' THEN 1 ELSE 0 END,
    CASE WHEN p_activity = 'application_added' THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = leaderboard_entries.total_points + v_points,
    questions_solved = leaderboard_entries.questions_solved + (CASE WHEN p_activity = 'question_solved' THEN 1 ELSE 0 END),
    quizzes_taken = leaderboard_entries.quizzes_taken + (CASE WHEN p_activity = 'quiz_completed' THEN 1 ELSE 0 END),
    designs_created = leaderboard_entries.designs_created + (CASE WHEN p_activity = 'design_created' THEN 1 ELSE 0 END),
    applications_tracked = leaderboard_entries.applications_tracked + (CASE WHEN p_activity = 'application_added' THEN 1 ELSE 0 END),
    last_updated = NOW();

  -- Update heatmap
  INSERT INTO contribution_heatmap (user_id, activity_date, count, points)
  VALUES (p_user_id, v_today, 1, v_points)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    count = contribution_heatmap.count + 1,
    points = contribution_heatmap.points + v_points;

  -- Update streak
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, activity_count)
  VALUES (p_user_id, 1, 1, v_today, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE 
      WHEN user_streaks.last_activity_date = v_today - INTERVAL '1 day' THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = v_today THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak,
      CASE 
        WHEN user_streaks.last_activity_date = v_today - INTERVAL '1 day' THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_activity_date = v_today,
    activity_count = user_streaks.activity_count + 1;
END;
$$;
