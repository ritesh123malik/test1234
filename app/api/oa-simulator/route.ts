import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startOAAttempt, recordTabSwitch, submitOAAttempt } from '@/services/oa-service';
import { checkPremiumGate } from '@/lib/premium-gate';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get('attemptId');

    if (attemptId) {
        // Fetch specific attempt and its questions
        // Simplified for prototype
        try {
            const { data: attempt } = await supabase.from('oa_attempts').select('*, oa_templates(*)').eq('id', attemptId).single();
            return NextResponse.json({ attempt });
        } catch (e) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }
    }

    // List templates
    const { data: templates } = await supabase.from('oa_templates').select('*');
    return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'start') {
            const { templateId } = body;

            // Premium Gate Check
            const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'oa_simulator');
            if (!allowed) {
                return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
            }

            const result = await startOAAttempt(user.id, templateId);
            return NextResponse.json(result);
        }

        if (action === 'tab_switch') {
            const { attemptId } = body;
            await recordTabSwitch(attemptId);
            return NextResponse.json({ success: true });
        }

        if (action === 'submit') {
            const { attemptId, aptitudeAnswers, codingSubmissions, isAutoSubmit } = body;
            const result = await submitOAAttempt(attemptId, { aptitudeAnswers, codingSubmissions, isAutoSubmit });
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
