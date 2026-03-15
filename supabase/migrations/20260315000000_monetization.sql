-- Migration for Monetization & Premium Gating
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_interviews_this_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ats_scans_this_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS p2p_sessions_this_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_reset_at DATE DEFAULT CURRENT_DATE;

-- Note: In a real environment, we'd use pg_cron for the monthly reset.
-- For this prototype, we will handle reset logic in the premium-gate.ts if usage_reset_at < CURRENT_DATE.
