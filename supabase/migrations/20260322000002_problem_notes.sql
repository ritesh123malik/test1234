-- Migration: Problem Notes System
-- Phase 3

CREATE TABLE IF NOT EXISTS problem_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL, -- e.g., 'leetcode-1' or 'codeforces-123A'
    platform TEXT NOT NULL,   -- 'leetcode', 'codeforces', 'gfg', etc.
    title TEXT,
    content TEXT,             -- Markdown content
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    next_revision_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '3 days'), -- Spaced repetition
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique note per user per problem
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_problem_note ON problem_notes(user_id, problem_id, platform);

-- RLS
ALTER TABLE problem_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
    ON problem_notes
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problem_notes_updated_at
    BEFORE UPDATE ON problem_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
