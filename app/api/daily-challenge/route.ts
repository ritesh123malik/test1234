import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getTodaysChallenge,
    submitDailyChallenge
} from '@/services/daily-challenge-service';

// GET /api/daily-challenge — fetch today's challenge + user status
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await getTodaysChallenge(user.id);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('Daily Challenge GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/daily-challenge — submit today's answer
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { challengeId, status, platform } = await req.json();
        if (!challengeId || !status || !platform) {
            return NextResponse.json({ error: 'challengeId, status and platform are required' }, { status: 400 });
        }

        const result = await submitDailyChallenge(user.id, challengeId, status, platform);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error('Daily Challenge POST Error:', err);
        const code = err.message.includes('Already submitted') ? 409 : 500;
        return NextResponse.json({ error: err.message }, { status: code });
    }
}
