-- ============================================================
-- PLACEMENT INTEL — Complete Supabase Schema (Idempotent)
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES (extends Supabase auth.users) ─────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  username text unique,
  avatar_url text,
  college text,
  graduation_year int,
  target_role text default 'SDE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure newest columns exist if table was already there
alter table profiles add column if not exists username text unique;
alter table profiles add column if not exists xp int default 0;
alter table profiles add column if not exists streak int default 0;
alter table profiles add column if not exists cgpa numeric(3,2) default 0.0;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists level int default 1;

-- Missing Premium & Usage Columns for lib/premium-gate.ts
alter table profiles add column if not exists is_premium boolean default false;
alter table profiles add column if not exists premium_expires_at timestamptz;
alter table profiles add column if not exists usage_reset_at date default (now() at time zone 'utc')::date;

-- Usage Tracking Columns
alter table profiles add column if not exists ai_interviews_this_month int default 0;
alter table profiles add column if not exists ats_scans_this_month int default 0;
alter table profiles add column if not exists p2p_sessions_this_month int default 0;
alter table profiles add column if not exists aptitude_mocks_this_month int default 0;
alter table profiles add column if not exists oa_simulator_this_month int default 0;
alter table profiles add column if not exists dsa_patterns_this_month int default 0;
alter table profiles add column if not exists audio_hints_this_month int default 0;
alter table profiles add column if not exists ai_roadmap_this_month int default 0;

-- ─── SUBSCRIPTIONS ──────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan text not null default 'free',          -- 'free' | 'pro' | 'annual'
  status text not null default 'active',      -- 'active' | 'expired' | 'cancelled'
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_paise int,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─── COMPANIES ──────────────────────────────────────────────
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  website text,
  hq text,
  industry text,
  package_lpa_min int,
  package_lpa_max int,
  tier text default 'free',                   -- 'free' | 'pro'
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── QUESTIONS ──────────────────────────────────────────────
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  round text not null,                        -- 'Online Test' | 'Technical 1' | 'Technical 2' | 'Managerial' | 'HR'
  question text not null,
  topic text,                                 -- 'Arrays' | 'DP' | 'Graphs' | 'System Design' etc.
  difficulty text default 'Medium',           -- 'Easy' | 'Medium' | 'Hard'
  frequency int default 1,                    -- how many people reported this question
  year_reported int,
  source_url text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ─── BOOKMARKS ──────────────────────────────────────────────
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, question_id)
);

-- ─── USER PROGRESS ──────────────────────────────────────────
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  questions_viewed int default 0,
  questions_bookmarked int default 0,
  last_studied_at timestamptz default now(),
  prep_score int default 0,                   -- 0-100
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, company_id)
);

-- ─── RESUMES ────────────────────────────────────────────────
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text,
  score int,                                  -- 0-100
  analysis text,                              -- full AI analysis text
  strengths text[],
  improvements text[],
  missing_keywords text[],
  created_at timestamptz default now()
);

-- ─── ROADMAPS ───────────────────────────────────────────────
create table if not exists roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  level text default 'intermediate',          -- 'beginner' | 'intermediate' | 'advanced'
  duration_weeks int default 4,
  content text not null,                      -- AI generated markdown
  created_at timestamptz default now()
);

-- ─── QUESTION SUBMISSIONS (crowdsourced) ────────────────────
create table if not exists question_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  company_name text not null,
  round text not null,
  question text not null,
  topic text,
  difficulty text,
  year_appeared int,
  status text default 'pending',              -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz default now()
);

-- ─── PER-USER QUESTION STATUS (Fixes DSA-02) ────────────────
create table if not exists user_question_status (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  uuid not null, -- this should reference your question table ID
  status       text default 'solved' check (status in ('unsolved','in_progress','solved','revisit')),
  updated_at   timestamptz default now(),
  primary key (user_id, question_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table bookmarks enable row level security;
alter table user_progress enable row level security;
alter table resumes enable row level security;
alter table roadmaps enable row level security;
alter table question_submissions enable row level security;
alter table user_question_status enable row level security;
alter table companies enable row level security;
alter table questions enable row level security;

-- Policies (Drop and Recreate for idempotency)
do $$ 
begin
    -- Profiles
    drop policy if exists "profiles_own" on profiles;
    create policy "profiles_own" on profiles for all using (auth.uid() = id);

    -- Subscriptions
    drop policy if exists "subscriptions_own_read" on subscriptions;
    create policy "subscriptions_own_read" on subscriptions for select using (auth.uid() = user_id);

    -- Companies
    drop policy if exists "companies_public_read" on companies;
    create policy "companies_public_read" on companies for select using (is_active = true);

    -- Questions
    drop policy if exists "questions_public_read" on questions;
    create policy "questions_public_read" on questions for select using (is_approved = true);

    -- Bookmarks
    drop policy if exists "bookmarks_own" on bookmarks;
    create policy "bookmarks_own" on bookmarks for all using (auth.uid() = user_id);

    -- Progress
    drop policy if exists "progress_own" on user_progress;
    create policy "progress_own" on user_progress for all using (auth.uid() = user_id);

    -- Resumes
    drop policy if exists "resumes_own" on resumes;
    create policy "resumes_own" on resumes for all using (auth.uid() = user_id);

    -- Roadmaps
    drop policy if exists "roadmaps_own" on roadmaps;
    create policy "roadmaps_own" on roadmaps for all using (auth.uid() = user_id);

    -- Submissions
    drop policy if exists "submissions_insert" on question_submissions;
    create policy "submissions_insert" on question_submissions for insert with check (auth.uid() = user_id);
    
    drop policy if exists "submissions_own_read" on question_submissions;
    create policy "submissions_own_read" on question_submissions for select using (auth.uid() = user_id);

    -- User Question Status
    drop policy if exists "status_own" on user_question_status;
    create policy "status_own" on user_question_status for all using (auth.uid() = user_id);
end $$;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Manual insert for existing users without profiles
insert into public.profiles (id, email, full_name, username)
select 
  id, 
  email, 
  raw_user_meta_data->>'full_name',
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1))
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- Atomic XP Increment
create or replace function increment_xp(p_user_id uuid, p_amount int)
returns void as $$
begin
  update public.profiles set xp = xp + p_amount where id = p_user_id;
end;
$$ language plpgsql security definer;

-- Update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

drop trigger if exists progress_updated_at on user_progress;
create trigger progress_updated_at before update on user_progress
  for each row execute function update_updated_at();

-- ============================================================
-- SEED DATA (Safe Inserts)
-- ============================================================

insert into companies (name, slug, description, hq, industry, package_lpa_min, package_lpa_max, tier) values
('Google', 'google', 'World''s largest search engine and tech conglomerate.', 'Mountain View, CA', 'Technology', 40, 120, 'pro'),
('Microsoft', 'microsoft', 'Enterprise software, cloud computing, and gaming.', 'Redmond, WA', 'Technology', 35, 100, 'pro'),
('Amazon', 'amazon', 'E-commerce, cloud (AWS), and AI services.', 'Seattle, WA', 'Technology', 30, 90, 'pro'),
('Flipkart', 'flipkart', 'India''s leading e-commerce marketplace.', 'Bengaluru, India', 'E-commerce', 25, 60, 'free'),
('Infosys', 'infosys', 'IT services, consulting, and outsourcing.', 'Bengaluru, India', 'IT Services', 10, 30, 'free'),
('TCS', 'tcs', 'Largest Indian IT services company globally.', 'Mumbai, India', 'IT Services', 8, 25, 'free'),
('Razorpay', 'razorpay', 'India''s leading payment gateway and fintech.', 'Bengaluru, India', 'Fintech', 25, 55, 'free'),
('Meesho', 'meesho', 'Social commerce platform for small businesses.', 'Bengaluru, India', 'E-commerce', 20, 50, 'free'),
('Atlassian', 'atlassian', 'Collaboration tools for software teams.', 'Sydney, Australia', 'SaaS', 35, 80, 'pro'),
('Adobe', 'adobe', 'Creative software and digital document solutions.', 'San Jose, CA', 'Technology', 30, 75, 'pro')
on conflict (slug) do update set
  description = excluded.description,
  hq = excluded.hq,
  industry = excluded.industry;


-- ─── INTERVIEW EXPERIENCES ──────────────────────────────────
create table if not exists interview_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  title text not null,
  content text not null,
  role text default 'SDE',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table interview_experiences enable row level security;

do $$ 
begin
    if not exists (select 1 from pg_policies where policyname = 'experiences_public_read') then
        create policy "experiences_public_read" on interview_experiences for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'experiences_own_all') then
        create policy "experiences_own_all" on interview_experiences for all using (auth.uid() = user_id);
    end if;
end $$;
