import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAudioHint } from '@/services/audio-hint-service';
import { checkPremiumGate, incrementUsage } from '@/lib/premium-gate';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { problem_text, current_code } = await req.json();

        // Premium Gate Check
        const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'audio_hints');
        if (!allowed) {
            return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
        }

        const hint = await generateAudioHint({ problem_text, current_code }, user.id);

        // Optional: Save to interaction log
        await incrementUsage(user.id, 'audio_hints');

        return NextResponse.json({ hint });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
