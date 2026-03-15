-- Resume Scans Table (Migration)
CREATE TABLE IF NOT EXISTS resume_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    score INT NOT NULL,
    jd_summary TEXT,
    analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resume_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY rs_own ON resume_scans USING (auth.uid() = user_id);
