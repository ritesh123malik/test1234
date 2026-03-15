-- Migration: 20260315000009_seed_popular_sheets.sql

-- 1. Helper Function to seed questions for a sheet by title
CREATE OR REPLACE FUNCTION seed_sheet_questions(p_sheet_title TEXT, p_questions JSONB)
RETURNS void AS $$
DECLARE
    v_sheet_id UUID;
    v_q JSONB;
BEGIN
    SELECT id INTO v_sheet_id FROM question_sheets WHERE title = p_sheet_title LIMIT 1;
    
    IF v_sheet_id IS NOT NULL THEN
        FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions)
        LOOP
            INSERT INTO sheet_questions (sheet_id, title, url, platform, difficulty, topic_tags, status)
            VALUES (
                v_sheet_id,
                v_q->>'title',
                v_q->>'url',
                v_q->>'platform',
                v_q->>'difficulty',
                ARRAY(SELECT jsonb_array_elements_text(v_q->'topic_tags')),
                'unsolved'
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Seed Top 100 Meta
SELECT seed_sheet_questions('Top 100 Meta', '[
    {"title": "LCA of Binary Tree", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Tree", "DFS"]},
    {"title": "Valid Palindrome II", "url": "https://leetcode.com/problems/valid-palindrome-ii/", "platform": "leetcode", "difficulty": "Easy", "topic_tags": ["String", "Two Pointers"]},
    {"title": "Subarray Sum Equals K", "url": "https://leetcode.com/problems/subarray-sum-equals-k/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Array", "Hash Table"]},
    {"title": "Vertical Order Traversal", "url": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/", "platform": "leetcode", "difficulty": "Hard", "topic_tags": ["Tree", "DFS"]}
]');

-- 3. Seed Top 100 Google
SELECT seed_sheet_questions('Top 100 Google', '[
    {"title": "Longest String Chain", "url": "https://leetcode.com/problems/longest-string-chain/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["DP", "String"]},
    {"title": "Robot Room Cleaner", "url": "https://leetcode.com/problems/robot-room-cleaner/", "platform": "leetcode", "difficulty": "Hard", "topic_tags": ["Backtracking", "Interactive"]},
    {"title": "Find Original Array", "url": "https://leetcode.com/problems/find-original-array-from-doubled-array/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Sorting", "Hash Table"]},
    {"title": "Logger Rate Limiter", "url": "https://leetcode.com/problems/logger-rate-limiter/", "platform": "leetcode", "difficulty": "Easy", "topic_tags": ["Design", "Hash Table"]}
]');

-- 4. Seed Blind 75
SELECT seed_sheet_questions('Top 75 LeetCode', '[
    {"title": "Two Sum", "url": "https://leetcode.com/problems/two-sum/", "platform": "leetcode", "difficulty": "Easy", "topic_tags": ["Array", "Hash Table"]},
    {"title": "Three Sum", "url": "https://leetcode.com/problems/3sum/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Array", "Two Pointers"]},
    {"title": "Clone Graph", "url": "https://leetcode.com/problems/clone-graph/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Graph", "DFS"]},
    {"title": "Non-overlapping Intervals", "url": "https://leetcode.com/problems/non-overlapping-intervals/", "platform": "leetcode", "difficulty": "Medium", "topic_tags": ["Greedy", "Sorting"]}
]');

DROP FUNCTION seed_sheet_questions(TEXT, JSONB);
