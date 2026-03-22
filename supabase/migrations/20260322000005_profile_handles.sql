-- Migration: Add missing handle columns to profiles
-- Phase 3.5 Extension

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leetcode_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS codeforces_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_handle TEXT;

-- Index for sync performance
CREATE INDEX IF NOT EXISTS idx_profiles_handles ON profiles (leetcode_handle, codeforces_handle, github_handle);
