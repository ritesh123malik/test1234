-- Migration: 20260315000008_mock_test_schema.sql

-- 1. Subject Categories
CREATE TABLE IF NOT EXISTS subject_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES subject_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_option INTEGER NOT NULL, -- 0-3
    explanation TEXT,
    subject TEXT, -- redundant but used in UI
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    time_limit_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES subject_categories(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB, -- [0, 2, -1, 1...]
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Subject Progress (Aggregated)
CREATE TABLE IF NOT EXISTS user_subject_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    questions_attempted INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy NUMERIC(5,2),
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject)
);

-- 5. RLS
ALTER TABLE subject_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subject_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY sc_public_read ON subject_categories FOR SELECT USING (true);
CREATE POLICY qq_public_read ON quiz_questions FOR SELECT USING (true);
CREATE POLICY qa_own_all ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY usp_own_all ON user_subject_progress FOR ALL USING (auth.uid() = user_id);

-- 6. Seed Data
INSERT INTO subject_categories (name, description, icon, order_index) VALUES
('Data Structures', 'Arrays, Linked Lists, Trees, Graphs, and Heaps.', 'Brain', 1),
('Algorithms', 'Sorting, Searching, Dynamic Programming, and Greedy.', 'Zap', 2),
('Operating Systems', 'Processes, Memory Management, and Concurrency.', 'Cpu', 3),
('DBMS & SQL', 'Relational Algebra, Normalization, and Query Optimization.', 'Database', 4),
('System Design', 'Scalability, Load Balancing, and Microservices.', 'Layers', 5)
ON CONFLICT (name) DO NOTHING;

-- Seed some questions (Example for Data Structures)
WITH ds_cat AS (SELECT id FROM subject_categories WHERE name = 'Data Structures' LIMIT 1)
INSERT INTO quiz_questions (category_id, question, options, correct_option, explanation, subject, difficulty)
SELECT 
    ds_cat.id,
    'What is the time complexity of searching in a Balanced Binary Search Tree?',
    '["O(1)", "O(n)", "O(log n)", "O(n log n)"]',
    2,
    'In a balanced BST, each comparison halves the search space, leading to logarithmic time complexity.',
    'Data Structures',
    'Easy'
FROM ds_cat
ON CONFLICT DO NOTHING;

WITH os_cat AS (SELECT id FROM subject_categories WHERE name = 'Operating Systems' LIMIT 1)
INSERT INTO quiz_questions (category_id, question, options, correct_option, explanation, subject, difficulty)
SELECT 
    os_cat.id,
    'Which of the following is not a necessary condition for Deadlock?',
    '["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Waiting", "Context Switching"]',
    4,
    'The four necessary conditions for deadlock are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
    'Operating Systems',
    'Medium'
FROM os_cat
ON CONFLICT DO NOTHING;
