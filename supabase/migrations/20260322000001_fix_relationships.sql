-- Migration: Fix Experiences relationship to Profiles
-- Path: supabase/migrations/20260322000001_fix_relationships.sql

-- 1. Update interview_experiences to reference profiles(id) instead of auth.users(id)
-- This enables PostgREST to auto-detect the relationship for joined selects.
ALTER TABLE public.interview_experiences
  DROP CONSTRAINT IF EXISTS interview_experiences_user_id_fkey,
  ADD CONSTRAINT interview_experiences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 2. Ensure experience_votes also references profiles(id) for consistency
ALTER TABLE public.experience_votes
  DROP CONSTRAINT IF EXISTS experience_votes_user_id_fkey,
  ADD CONSTRAINT experience_votes_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
