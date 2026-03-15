-- Company Wiki Table
CREATE TABLE IF NOT EXISTS company_wiki (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    content_md TEXT NOT NULL,
    hiring_process_tags TEXT[],
    salary_range_json JSONB, -- { "min": 0, "max": 0, "currency": "INR" }
    interview_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wiki_id UUID REFERENCES company_wiki NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    content_delta TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE company_wiki ENABLE ROW LEVEL SECURITY;
CREATE POLICY cw_public_read ON company_wiki FOR SELECT USING (true);

ALTER TABLE wiki_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wc_own ON wiki_contributions USING (auth.uid() = user_id);
