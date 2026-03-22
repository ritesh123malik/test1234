CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE INDEX idx_notif_user ON public.notifications(user_id);
CREATE INDEX idx_notif_unread ON public.notifications(user_id, is_read);
