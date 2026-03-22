import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { topicId, difficulty = 'Medium', duration = 60 } = await req.json();

        // 1. Fetch 3 random questions for the timed test
        const { data: questions, error: qError } = await supabaseAdmin
            .from('daily_challenge_pool')
            .select('id')
            .eq('category', topicId)
            .eq('difficulty', difficulty)
            .limit(3);

        if (qError || !questions || questions.length === 0) {
            return NextResponse.json({ error: 'No questions found for this configuration' }, { status: 404 });
        }

        const questionIds = questions.map(q => q.id);

        // 2. Create a temporary template or use a generic one
        // For simplicity, we find or create a generic DSA template
        let { data: template } = await supabaseAdmin
            .from('oa_templates')
            .select('id')
            .eq('title', 'Dynamic DSA Test')
            .single();

        if (!template) {
            const { data: newTemplate, error: tError } = await supabaseAdmin
                .from('oa_templates')
                .insert({
                    title: 'Dynamic DSA Test',
                    company_name: 'PlacementIntel',
                    duration_minutes: duration,
                    question_ids: [], // No aptitude for pure DSA test
                    coding_question_ids: questionIds,
                    difficulty: difficulty.toLowerCase()
                })
                .select()
                .single();
            
            if (tError) throw tError;
            template = newTemplate;
        } else {
            // Update the template's question IDs for this specific attempt 
            // OR (Preferred) modify startOAAttempt to accept temporary question overrides.
            // For this implementation, we'll update it (simple for prototype)
            await supabaseAdmin
                .from('oa_templates')
                .update({ 
                    coding_question_ids: questionIds,
                    duration_minutes: duration,
                    difficulty: difficulty.toLowerCase()
                })
                .eq('id', template.id);
        }

        // 3. Start the attempt
        if (!template) {
            return NextResponse.json({ error: 'Failed to create test template' }, { status: 500 });
        }
        const { startOAAttempt } = await import('@/services/oa-service');
        const result = await startOAAttempt(user.id, template.id);

        return NextResponse.json(result);

    } catch (err: any) {
        console.error('Timed Test Init Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
