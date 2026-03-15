-- Migration: 20260314000004_premium_gating.sql

-- Add columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS premium_source TEXT,
ADD COLUMN IF NOT EXISTS ai_interviews_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ats_scans_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS p2p_sessions_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at DATE DEFAULT CURRENT_DATE;

-- Create policy for users to see their own usage/premium status (if not already covered by profile policy)
-- Usually profiles have a policy: "Users can see their own profile"

-- Function to reset usage (can be called by cron or manually)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET 
        ai_interviews_this_month = 0, 
        ats_scans_this_month = 0, 
        p2p_sessions_this_month = 0, 
        usage_reset_at = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Cron scheduling requires pg_cron extension
-- SELECT cron.schedule('monthly-usage-reset', '0 0 1 * *', 'SELECT reset_monthly_usage()');
