import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStreakHistory } from '@/services/daily-challenge-service';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const history = await getStreakHistory(user.id);
        return NextResponse.json({ history });
    } catch (err: any) {
        console.error('Daily Challenge History Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
