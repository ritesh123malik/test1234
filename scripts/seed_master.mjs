import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (SERVICE_ROLE_KEY required)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMaster() {
    console.log('🚀 Starting Master Seed...');

    // 1. Seed Companies if missing
    const companies = [
        { name: 'Google', slug: 'google' },
        { name: 'Meta', slug: 'meta' },
        { name: 'Amazon', slug: 'amazon' },
        { name: 'Microsoft', slug: 'microsoft' },
        { name: 'Netflix', slug: 'netflix' }
    ];

    for (const comp of companies) {
        await supabase.from('companies').upsert(comp, { onConflict: 'slug' });
    }
    console.log('✅ Companies seeded.');

    // 2. Seed Daily Challenges for TODAY (LeetCode + Codeforces)
    const today = new Date().toISOString().split('T')[0];

    // LeetCode Challenge
    const { data: lcPool } = await supabase.from('daily_challenge_pool').upsert({
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        difficulty: 'Medium',
        topic_tags: ['Arrays', 'Sorting'],
        url: 'https://leetcode.com/problems/merge-intervals/',
        xp_reward: 50,
        platform: 'leetcode'
    }, { onConflict: 'slug' }).select().single();

    if (lcPool) {
        await supabase.from('daily_challenges').upsert({
            challenge_date: today,
            question_id: lcPool.id,
            bonus_xp: 20,
            platform: 'leetcode'
        }, { onConflict: 'challenge_date,platform' });
        console.log(`✅ LeetCode Challenge for ${today} seeded.`);
    }

    // Codeforces Challenge
    const { data: cfPool } = await supabase.from('daily_challenge_pool').upsert({
        title: 'Theatre Square',
        slug: 'theatre-square',
        difficulty: 'Easy',
        topic_tags: ['Math'],
        url: 'https://codeforces.com/problemset/problem/1/A',
        xp_reward: 20,
        platform: 'codeforces',
        external_id: '1A',
        rating: 1000
    }, { onConflict: 'slug' }).select().single();

    if (cfPool) {
        await supabase.from('daily_challenges').upsert({
            challenge_date: today,
            question_id: cfPool.id,
            bonus_xp: 10,
            platform: 'codeforces'
        }, { onConflict: 'challenge_date,platform' });
        console.log(`✅ Codeforces Challenge for ${today} seeded.`);
    }

    // 3. Seed "Top 100" Sheets for Google & Meta
    const metaData = await supabase.from('companies').select('id').eq('slug', 'meta').single();
    const googleData = await supabase.from('companies').select('id').eq('slug', 'google').single();

    if (metaData.data && googleData.data) {
        const sheets = [
            { title: 'Meta Top 100', description: 'Most frequent questions asked at Meta (Facebook) in the last 6 months.', is_public: true, is_premium: true, company_id: metaData.data.id },
            { title: 'Google Top 100', description: 'Curated list of Google interview questions covering dynamic programming and graphs.', is_public: true, is_premium: true, company_id: googleData.data.id }
        ];

        for (const s of sheets) {
            const { data: sheet } = await supabase.from('question_sheets').upsert(s, { onConflict: 'title' }).select().single();

            if (sheet) {
                // Add some questions to these sheets
                const questions = [
                    { title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays' },
                    { title: 'Valid Palindrome', difficulty: 'Easy', topic: 'String' },
                    { title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Heap' }
                ];

                for (const q of questions) {
                    // Create question if missing
                    const { data: qObj } = await supabase.from('questions').upsert({
                        company_id: s.company_id,
                        question: q.title,
                        difficulty: q.difficulty,
                        topic: q.topic,
                        is_approved: true
                    }, { onConflict: 'question' }).select().single();

                    if (qObj) {
                        await supabase.from('sheet_questions').upsert({
                            sheet_id: sheet.id,
                            title: qObj.question,
                            difficulty: qObj.difficulty,
                            topic_tags: [qObj.topic],
                            url: `https://leetcode.com/problemset/?search=${qObj.question}`
                        }, { onConflict: 'sheet_id,title' });
                    }
                }
            }
        }
        console.log('✅ Top 100 Sheets seeded.');
    }

    console.log('🏁 Master Seed Complete.');
}

seedMaster().catch(console.error);
