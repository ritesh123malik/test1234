-- Referral System Migration
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users NOT NULL,
    referred_user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'premium_unlocked'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY ref_own ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
