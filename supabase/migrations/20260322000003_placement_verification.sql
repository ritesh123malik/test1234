-- Migration: Verified Placement Badge System
-- Phase 3

CREATE TABLE IF NOT EXISTS placement_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    offer_letter_url TEXT, -- Link to uploaded proof in storage
    linkedin_url TEXT,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verified_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_placement_verifications_user_id ON placement_verifications(user_id);

-- RLS
ALTER TABLE placement_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and create their own verifications"
    ON placement_verifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
    ON placement_verifications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add verified_placement flag to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_placed_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_role TEXT;
