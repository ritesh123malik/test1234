import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── SHEET DEFINITIONS ──────────────────────────────────────────────────────
const SHEET_CONFIGS = [
    {
        title: 'Neetcode 150',
        platform: 'leetcode',
        filter: 'neetcode',
        topics: ['Array', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search',
            'Linked List', 'Tree', 'Trie', 'Heap', 'Backtracking', 'Graph',
            'Dynamic Programming', 'Greedy', 'Intervals', 'Math', 'Bit Manipulation'],
        limit: 150,
    },
    {
        title: 'Striver A2Z DSA Sheet',
        platform: 'leetcode',
        filter: 'striver_a2z',
        topics: ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph',
            'Dynamic Programming', 'Greedy', 'Recursion', 'Binary Search',
            'Sorting', 'Math', 'Bit Manipulation', 'Trie', 'Heap'],
        limit: 455,
    },
    {
        title: 'Coding75 Expert Sheet',
        platform: 'leetcode',
        filter: 'hard_medium',
        topics: ['Dynamic Programming', 'Graph', 'Tree', 'Binary Search', 'Greedy'],
        difficulty: ['Medium', 'Hard'],
        limit: 75,
    },
    {
        title: 'Ask Senior Sheet',
        platform: 'leetcode',
        filter: 'beginner',
        topics: ['Math', 'Array', 'String', 'Sorting', 'Two Pointers'],
        difficulty: ['Easy', 'Medium'],
        limit: 300,
    },
    {
        title: 'Kartik Arora Specialist Sheet',
        platform: 'codeforces',
        filter: 'cf_specialist',
        rating_min: 1200,
        rating_max: 1800,
        limit: 200,
    },
    {
        title: 'Kartik Arora Expert Sheet',
        platform: 'codeforces',
        filter: 'cf_expert',
        rating_min: 1800,
        rating_max: 2400,
        limit: 200,
    },
    {
        title: 'ACD Sheet',
        platform: 'codeforces',
        filter: 'cf_beginner',
        rating_min: 800,
        rating_max: 1600,
        limit: 100,
    },
    {
        title: 'A2OJ Ladders',
        platform: 'codeforces',
        filter: 'cf_all',
        rating_min: 800,
        rating_max: 3500,
        limit: 500,
    },
    {
        title: 'Striver CP Sheet',
        platform: 'codeforces',
        filter: 'cf_mixed',
        rating_min: 1000,
        rating_max: 2800,
        limit: 300,
    },
    {
        title: 'TLE Eliminators Sheet',
        platform: 'codeforces',
        filter: 'cf_tle',
        rating_min: 800,
        rating_max: 2800,
        limit: 450,
    },
    {
        title: 'CSES Problem Set',
        platform: 'cses',
        filter: 'cses_all',
        limit: 300,
    },
    {
        title: 'AtCoder Training (Kenkoo)',
        platform: 'atcoder',
        filter: 'atcoder_all',
        limit: 300,
    },
    {
        title: 'C2OJ Ladders',
        platform: 'codeforces',
        filter: 'cf_c2oj',
        rating_min: 800,
        rating_max: 3000,
        limit: 400,
    },
    {
        title: 'Algozenith Premium Sheet',
        platform: 'leetcode',
        filter: 'premium_hard',
        topics: ['Dynamic Programming', 'Graph', 'Tree', 'Binary Search', 'Backtracking'],
        difficulty: ['Medium', 'Hard'],
        limit: 400,
    },
];

// ── FETCH LEETCODE PROBLEMS ─────────────────────────────────────────────────
async function fetchLeetCodeProblems() {
    console.log('Fetching LeetCode problems from open dataset...');
    const url = 'https://raw.githubusercontent.com/neenza/leetcode-problems/master/merged_problems.json';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch LeetCode dataset: ${res.status}`);
    const data = await res.json() as any;
    const questions = data.questions || [];
    console.log(`Fetched ${questions.length} LeetCode problems`);
    return questions;
}

// ── FETCH CODEFORCES PROBLEMS ───────────────────────────────────────────────
async function fetchCodeforcesProblems() {
    console.log('Fetching Codeforces problems from official API...');
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    if (!res.ok) throw new Error(`Failed to fetch Codeforces API: ${res.status}`);
    const data = await res.json() as any;
    if (data.status !== 'OK') throw new Error(`Codeforces API error: ${data.comment}`);
    console.log(`Fetched ${data.result.problems.length} Codeforces problems`);
    return data.result.problems;
}

// ── CSES HARDCODED LIST ────────────────────────────
function getCsesProblems() {
    return [
        { title: 'Weird Algorithm', url: 'https://cses.fi/problemset/task/1068', difficulty: 'Easy', topic_tags: ['Simulation'] },
        { title: 'Missing Number', url: 'https://cses.fi/problemset/task/1083', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Repetitions', url: 'https://cses.fi/problemset/task/1069', difficulty: 'Easy', topic_tags: ['Strings'] },
        { title: 'Increasing Array', url: 'https://cses.fi/problemset/task/1094', difficulty: 'Easy', topic_tags: ['Greedy'] },
        { title: 'Permutations', url: 'https://cses.fi/problemset/task/1070', difficulty: 'Easy', topic_tags: ['Constructive'] },
        { title: 'Number Spiral', url: 'https://cses.fi/problemset/task/1071', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Two Knights', url: 'https://cses.fi/problemset/task/1072', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Two Sets', url: 'https://cses.fi/problemset/task/1092', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Bit Strings', url: 'https://cses.fi/problemset/task/1617', difficulty: 'Easy', topic_tags: ['Math', 'Modular Arithmetic'] },
        { title: 'Trailing Zeros', url: 'https://cses.fi/problemset/task/1618', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Coin Piles', url: 'https://cses.fi/problemset/task/1754', difficulty: 'Easy', topic_tags: ['Math'] },
        { title: 'Palindrome Reorder', url: 'https://cses.fi/problemset/task/1755', difficulty: 'Easy', topic_tags: ['Strings', 'Greedy'] },
        { title: 'Gray Code', url: 'https://cses.fi/problemset/task/2205', difficulty: 'Medium', topic_tags: ['Bit Manipulation'] },
        { title: 'Tower of Hanoi', url: 'https://cses.fi/problemset/task/2165', difficulty: 'Medium', topic_tags: ['Recursion'] },
        { title: 'Creating Strings', url: 'https://cses.fi/problemset/task/1622', difficulty: 'Medium', topic_tags: ['Strings', 'Combinatorics'] },
        { title: 'Apple Division', url: 'https://cses.fi/problemset/task/1623', difficulty: 'Medium', topic_tags: ['Recursion', 'Subsets'] },
        { title: 'Chessboard and Queens', url: 'https://cses.fi/problemset/task/1624', difficulty: 'Hard', topic_tags: ['Backtracking'] },
        { title: 'Digit Queries', url: 'https://cses.fi/problemset/task/2431', difficulty: 'Hard', topic_tags: ['Math'] },
        { title: 'Sorting and Searching - Distinct Numbers', url: 'https://cses.fi/problemset/task/1621', difficulty: 'Easy', topic_tags: ['Sorting'] },
        { title: 'Apartments', url: 'https://cses.fi/problemset/task/1084', difficulty: 'Easy', topic_tags: ['Sorting', 'Greedy'] },
        { title: 'Ferris Wheel', url: 'https://cses.fi/problemset/task/1090', difficulty: 'Easy', topic_tags: ['Two Pointers', 'Greedy'] },
        { title: 'Concert Tickets', url: 'https://cses.fi/problemset/task/1091', difficulty: 'Medium', topic_tags: ['Sorting', 'Binary Search'] },
        { title: 'Restaurant Customers', url: 'https://cses.fi/problemset/task/1619', difficulty: 'Medium', topic_tags: ['Sorting', 'Events'] },
        { title: 'Movie Festival', url: 'https://cses.fi/problemset/task/1629', difficulty: 'Medium', topic_tags: ['Greedy', 'Intervals'] },
        { title: 'Sum of Two Values', url: 'https://cses.fi/problemset/task/1640', difficulty: 'Easy', topic_tags: ['Two Pointers', 'Hash Table'] },
        { title: 'Maximum Subarray Sum', url: 'https://cses.fi/problemset/task/1643', difficulty: 'Medium', topic_tags: ['DP'] },
        { title: 'Stick Lengths', url: 'https://cses.fi/problemset/task/1074', difficulty: 'Medium', topic_tags: ['Sorting', 'Median'] },
        { title: 'Missing Coin Sum', url: 'https://cses.fi/problemset/task/2183', difficulty: 'Medium', topic_tags: ['Sorting', 'Greedy'] },
        { title: 'Collecting Numbers', url: 'https://cses.fi/problemset/task/2216', difficulty: 'Medium', topic_tags: ['Array'] },
        { title: 'Collecting Numbers II', url: 'https://cses.fi/problemset/task/2217', difficulty: 'Hard', topic_tags: ['Array', 'Segment Tree'] },
    ];
}

// ── MAIN IMPORT FUNCTION ────────────────────────────────────────────────────
async function importAllSheets() {
    console.log('\n=== placement-intel Sheet Importer ===\n');

    // Fetch all datasets in parallel
    const [lcProblems, cfProblems] = await Promise.all([
        fetchLeetCodeProblems(),
        fetchCodeforcesProblems(),
    ]);
    const csesProblems = getCsesProblems();

    // Get all sheet IDs from Supabase
    const { data: sheets, error } = await supabase
        .from('question_sheets')
        .select('id, title')
        .is('user_id', null);

    if (error) throw new Error(`Failed to fetch sheets: ${error.message}`);
    const sheetMap = new Map(sheets!.map(s => [s.title, s.id]));

    // Process each sheet config
    for (const config of SHEET_CONFIGS) {
        const sheetId = sheetMap.get(config.title);
        if (!sheetId) {
            console.log(`SKIP: Sheet not found in DB — "${config.title}"`);
            continue;
        }

        // Check if already imported
        const { count } = await supabase
            .from('sheet_questions')
            .select('*', { count: 'exact', head: true })
            .eq('sheet_id', sheetId);

        if ((count ?? 0) > 0) {
            console.log(`SKIP: "${config.title}" already has ${count} questions`);
            continue;
        }

        let questions: any[] = [];

        // ── LeetCode sheets ────────────────────────────────────────
        if (config.platform === 'leetcode') {
            let filtered = lcProblems.filter((p: any) => {
                if (!p.title || !p.problem_slug) return false;
                const diff = p.difficulty as string;
                if (config.difficulty && !config.difficulty.includes(diff)) return false;
                if (config.topics) {
                    const tags = (p.topics || []).map((t: any) =>
                        typeof t === 'string' ? t : t.name || t.slug || ''
                    );
                    return config.topics.some(topic =>
                        tags.some((tag: string) =>
                            tag.toLowerCase().includes(topic.toLowerCase())
                        )
                    );
                }
                return true;
            });

            // Shuffle for variety then take limit
            filtered = filtered.sort(() => Math.random() - 0.5).slice(0, config.limit);

            questions = filtered.map((p: any, idx: number) => ({
                sheet_id: sheetId,
                title: p.title,
                url: `https://leetcode.com/problems/${p.problem_slug}/`,
                platform: 'leetcode',
                difficulty: p.difficulty,
                topic_tags: (p.topics || []).map((t: any) =>
                    typeof t === 'string' ? t : t.name || ''
                ).filter(Boolean).slice(0, 5),
                question_number: idx + 1,
                status: 'unsolved',
            }));
        }

        // ── Codeforces sheets ──────────────────────────────────────
        else if (config.platform === 'codeforces') {
            let filtered = cfProblems.filter((p: any) => {
                if (!p.name || !p.contestId || !p.index) return false;
                const rating = p.rating || 0;
                if (config.rating_min && rating < config.rating_min) return false;
                if (config.rating_max && rating > config.rating_max) return false;
                return true;
            });

            filtered = filtered.sort(() => Math.random() - 0.5).slice(0, config.limit);

            questions = filtered.map((p: any, idx: number) => ({
                sheet_id: sheetId,
                title: p.name,
                url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
                platform: 'codeforces',
                difficulty: p.rating <= 1200 ? 'Easy' : p.rating <= 1800 ? 'Medium' : 'Hard',
                topic_tags: (p.tags || []).slice(0, 5),
                question_number: idx + 1,
                external_id: `${p.contestId}${p.index}`,
                rating: p.rating || null,
                status: 'unsolved',
            }));
        }

        // ── CSES sheets ────────────────────────────────────────────
        else if (config.platform === 'cses') {
            questions = csesProblems.slice(0, config.limit).map((p, idx) => ({
                sheet_id: sheetId,
                ...p,
                platform: 'cses',
                question_number: idx + 1,
                status: 'unsolved',
            }));
        }

        if (questions.length === 0) {
            console.log(`WARN: No questions generated for "${config.title}"`);
            continue;
        }

        // Bulk insert in batches of 100
        let inserted = 0;
        for (let i = 0; i < questions.length; i += 100) {
            const batch = questions.slice(i, i + 100);
            const { error: insertError } = await supabase
                .from('sheet_questions')
                .insert(batch);
            if (insertError) {
                console.log(`  ERROR batch ${i}-${i + 100}: ${insertError.message}`);
            } else {
                inserted += batch.length;
            }
        }

        // Update total_questions count
        await supabase
            .from('question_sheets')
            .update({ total_questions: inserted })
            .eq('id', sheetId);

        console.log(`DONE: "${config.title}" — ${inserted} questions imported`);
    }

    console.log('\n=== Import Complete ===');
}

importAllSheets().catch(console.error);
