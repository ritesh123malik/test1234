-- P2P Mock Interview Schema
CREATE TABLE IF NOT EXISTS mock_interview_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users NOT NULL,
    peer_id UUID REFERENCES auth.users,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'available', -- 'available', 'booked', 'completed', 'cancelled'
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mock_interview_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY mis_public_read ON mock_interview_slots FOR SELECT USING (true);
CREATE POLICY mis_host ON mock_interview_slots USING (auth.uid() = host_id);
CREATE POLICY mis_peer ON mock_interview_slots FOR UPDATE USING (auth.uid() = peer_id OR auth.uid() = host_id);
