ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS contest_reminders_enabled BOOLEAN NOT NULL DEFAULT true;
