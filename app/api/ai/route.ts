import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPremiumGate, incrementUsage } from '@/lib/premium-gate';
import {
    getAIResponse,
    explainProblem,
    generateSolutionApproach,
    getHint,
    debugCode,
    generatePracticeQuestions
} from '@/lib/ai-service';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FAIL-SAFE: Self-healing profile creation (matches Fix 1 from user suggestion)
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
        console.warn(`API AI: Profile missing for user ${user.id}, creating on the fly...`);
        const { getSupabaseAdmin } = await import('@/lib/supabase/admin');
        const admin = getSupabaseAdmin();
        if (admin) {
            await admin.from('profiles').upsert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                username: user.user_metadata?.username || user.email?.split('@')[0],
                is_premium: false
            });
            await admin.from('subscriptions').upsert({ user_id: user.id, plan: 'free', status: 'active' });
        }
    }

    try {
        const body = await req.json();
        const { action, problem, difficulty, count, topic, code, language, subtopics, systemPrompt: bodySystemPrompt } = body;

        // 1. Check Premium Gate (Selective)
        if (action !== 'chat') {
            const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'ai_interviews');
            if (!allowed) {
                return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
            }
        }

        let result = '';

        switch (action) {
            case 'explain':
                result = await explainProblem(problem, difficulty || 'Medium');
                break;
            case 'approach':
                result = await generateSolutionApproach(problem, user.id);
                break;
            case 'hint':
                result = await getHint(problem, user.id);
                break;
            case 'debug':
                result = await debugCode(code, language || 'javascript', user.id);
                break;
            case 'chat':
                result = await getAIResponse(problem, user.id, bodySystemPrompt);
                break;
            case 'generate-questions':
                const questions = await generatePracticeQuestions(topic, difficulty, count, subtopics);
                return NextResponse.json({ success: true, result: questions });
            case 'generate-simulation':
                const simQuestions = await generatePracticeQuestions(topic, difficulty, count, subtopics, body.mode, body.format);
                return NextResponse.json({ success: true, questions: simQuestions });
            default:
                result = await getAIResponse(problem, user.id, "You're a LeetCode expert.");
        }


        // 2. Increment usage
        await incrementUsage(user.id, 'ai_interviews');

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get AI response' },
            { status: 500 }
        );
    }
}
