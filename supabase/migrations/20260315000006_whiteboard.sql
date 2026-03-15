-- Whiteboard Table
CREATE TABLE IF NOT EXISTS whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT DEFAULT 'Untitled Canvas',
    content_json JSONB NOT NULL, -- Excalidraw / Tldraw data
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY wb_own ON whiteboards USING (auth.uid() = user_id);
CREATE POLICY wb_public ON whiteboards FOR SELECT USING (is_public = true);
