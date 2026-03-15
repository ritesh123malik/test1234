import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    startAptitudeSession,
    submitAptitudeAnswer,
    completeAptitudeSession
} from '@/services/aptitude-service';
import { checkPremiumGate, incrementUsage } from '@/lib/premium-gate';
import { getAIResponse } from '@/lib/ai-service';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    try {
        // 1. Fetch Session
        const { data: session, error: sError } = await supabase
            .from('aptitude_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (sError || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // 2. Fetch Questions for this session
        let qQuery = supabase
            .from('aptitude_questions')
            .select('*');

        if (session.category && session.category !== 'All' && session.category !== 'mixed') {
            qQuery = qQuery.eq('category', session.category.toLowerCase());
        }

        if (session.company_filter) {
            qQuery = qQuery.contains('company_tags', [session.company_filter]);
        }

        const { data: questions } = await qQuery.limit(session.total_questions);

        return NextResponse.json({ session, questions });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'start') {
            // Premium Gate for Timed/Company Mock
            if (body.mode !== 'practice') {
                const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'aptitude_mocks');
                if (!allowed) {
                    return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
                }
            }

            const result = await startAptitudeSession(user.id, {
                mode: body.mode,
                category: body.category,
                difficulty: body.difficulty,
                count: body.count || 10,
                company_filter: body.company_filter
            });
            return NextResponse.json(result);
        }

        if (action === 'submit_answer') {
            const { session_id, question_id, selected_option, time_spent_seconds } = body;
            const result = await submitAptitudeAnswer(session_id, question_id, selected_option, time_spent_seconds);
            return NextResponse.json(result);
        }

        if (action === 'complete') {
            const { session_id, time_taken_seconds } = body;
            const result = await completeAptitudeSession(session_id, time_taken_seconds);
            return NextResponse.json(result);
        }

        if (action === 'ai_explain') {
            const { question_text, selected_option, correct_option } = body;
            const prompt = `You are an aptitude tutor. Explain the solution to this question step by step. 
            Include the formula or trick used. Provide a tip to solve similar questions 30% faster. 
            Question: ${question_text}
            User selected: ${selected_option}
            Correct option: ${correct_option}
            Be concise — max 150 words.`;

            const explanation = await getAIResponse(prompt, user.id);
            return NextResponse.json({ explanation });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err: any) {
        console.error('Aptitude API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
