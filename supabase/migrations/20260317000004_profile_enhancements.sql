ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cgpa NUMERIC(3,2) CHECK (cgpa >= 0 AND cgpa <= 10),
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by TEXT;

UPDATE public.profiles SET referral_code = UPPER(SUBSTRING(MD5(id::TEXT), 1, 8)) WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION public.handle_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gen_referral_code ON public.profiles;
CREATE TRIGGER gen_referral_code BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_referral_code();
