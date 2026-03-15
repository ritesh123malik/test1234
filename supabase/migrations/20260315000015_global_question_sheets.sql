-- supabase/migrations/20260315000015_global_question_sheets.sql

-- Block 1: Add columns to question_sheets
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS reference_url TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'dsa'
  CHECK (category IN ('dsa','cp','interview','mixed'));
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS difficulty_range TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE question_sheets ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT '#3B82F6';

-- Add unique constraint on title for seeding safety
ALTER TABLE question_sheets ADD CONSTRAINT question_sheets_title_key UNIQUE (title);

-- Block 2: Add platform column to sheet_questions
ALTER TABLE sheet_questions ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'leetcode'
  CHECK (platform IN ('leetcode','codeforces','codechef','atcoder','cses','gfg','custom'));
ALTER TABLE sheet_questions ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE sheet_questions ADD COLUMN IF NOT EXISTS rating INTEGER;

-- Block 3: Seed the 14 sheet metadata rows
INSERT INTO question_sheets
  (user_id, title, description, is_premium, is_public, company_tag, 
   source_url, reference_url, category, difficulty_range, total_questions, author, banner_color)
VALUES
  (NULL,'Striver A2Z DSA Sheet','Complete A to Z DSA — 455 problems basics to advanced',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/17bvDMyAaPReats0neBB_JOdm50vUElaWtthc4JVsJB4',
   'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
   'dsa','Easy-Hard',455,'Raj Vikramaditya (Striver)','#F97316'),
  (NULL,'Ask Senior Sheet','Full DSA sheet — Math for beginners fully solved',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1WqBHyKfCUX0ZuxcLS38YjncOE26B6dweNxuor0Eh11g',
   'https://asksenior.in/learn',
   'dsa','Easy-Medium',300,'Ask Senior','#8B5CF6'),
  (NULL,'Algozenith Premium Sheet','Premium DSA sheet by Algozenith',
   true,false,NULL,
   'https://docs.google.com/spreadsheets/d/1-kFigIqH3xcWjsjnGqKiVx_eoOXGOgzXMLGwie7S4S4',
   'https://algozenith.com',
   'dsa','Medium-Hard',400,'Algozenith','#EF4444'),
  (NULL,'ACD Sheet','100 problems — Codeforces 800-rated focus',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1k6F1hVOQhyHuNJHuOCTFukyBbXiTX3Y4Arz2cx-YH94',
   'https://acodedaily.com',
   'cp','800-1600',100,'ACodeDaily','#10B981'),
  (NULL,'Kartik Arora Specialist Sheet','Codeforces Specialist preparation',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1krbQLgfxedAREtSGAmQ7LzxrC5WZfpHMl1pqgj5Mxdo',
   'https://docs.google.com/document/d/1EUTucOFpmHPnblOXO0J7hEyVH0RvM91j1pTO60AdzVM',
   'cp','1200-1800',200,'Kartik Arora','#3B82F6'),
  (NULL,'Kartik Arora Expert Sheet','Codeforces Expert preparation',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1yLiZfGNqnaZo2MDCgWNSFdFk_H830sNjXEA22p5VInc',
   'https://docs.google.com/document/d/1-wkEQSYLLaKne-6GJ4Wc_dTGmnRn5Fv_Ax64LrheK_M',
   'cp','1800-2400',200,'Kartik Arora','#6366F1'),
  (NULL,'Neetcode 150','Top 150 LeetCode patterns for FAANG interviews',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1YGM46-1ORNcLccldQOU-bhovFG-Hl6UUJJhrFP0vyHs',
   'https://neetcode.io/practice?tab=allNC',
   'interview','Easy-Hard',150,'Neetcode','#0EA5E9'),
  (NULL,'A2OJ Ladders','Topic-wise Codeforces problem ladders by rating',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1BHlu1Y0KyZBWjQeLtjNZGryRXROUgPlfgJF52LVQbBc',
   'https://earthshakira.github.io/a2oj-clientside/server/',
   'cp','800-3500',500,'A2OJ','#F59E0B'),
  (NULL,'Coding75 Expert Sheet','Expert-level DSA by Coding75',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/145k2fuCde-DbXoeo7U3TGKOJjJZR8TKW17hdQlkATj8',
   'https://coding75.com/dsa-cp/sheets/expert-sheet',
   'dsa','Medium-Hard',75,'Coding75','#EC4899'),
  (NULL,'Striver CP Sheet','Competitive programming sheet by Striver',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/18x9USXwYoGLUlLiDu6FFNtW_UbvIBy-XGfxlrZoyjt8',
   'https://takeuforward.org/interview-experience/strivers-cp-sheet',
   'cp','Easy-Hard',300,'Raj Vikramaditya (Striver)','#F97316'),
  (NULL,'TLE Eliminators Sheet','CP sheet by TLE Eliminators',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1KWa_8CAaHg96j1FolJMwZ2t0lFtZ9HTtPY55rETeDw4',
   'https://www.tle-eliminators.com/cp-sheet',
   'cp','800-2800',450,'TLE Eliminators','#14B8A6'),
  (NULL,'CSES Problem Set','Classic competitive programming — full CSES set',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1e9AeRjFmmKpsYAP8AHhKuZ1rESmErk00Vrr6odGrG6o',
   'https://cses.fi/problemset',
   'cp','Easy-Hard',300,'CSES','#8B5CF6'),
  (NULL,'AtCoder Training (Kenkoo)','AtCoder problems organized for training',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/143j0SigIb4V5VLkSaTQDk_Yk-4IqVqqotMte23Rt4OU',
   'https://kenkoooo.com/atcoder/#/training/',
   'cp','100-2400',300,'Kenkoo','#0EA5E9'),
  (NULL,'C2OJ Ladders','CodeChef rated problem ladders',
   false,true,NULL,
   'https://docs.google.com/spreadsheets/d/1ZePvdQBefqT1HXM1qD0Bq_mvKjhCy0RMnn0-3r32s0k',
   'https://c2-ladders-juol.onrender.com/',
   'cp','800-3000',400,'C2OJ','#F59E0B')
ON CONFLICT (title) DO NOTHING;
