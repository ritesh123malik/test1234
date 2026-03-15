import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInterviewSlot, bookInterviewSlot, getUpcomingSlots } from '@/services/p2p-service';

export async function GET(req: NextRequest) {
    try {
        const slots = await getUpcomingSlots();
        return NextResponse.json(slots);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'create') {
            const { scheduledAt } = body;
            const result = await createInterviewSlot(user.id, scheduledAt);
            return NextResponse.json(result);
        }

        if (action === 'book') {
            const { slotId } = body;
            const result = await bookInterviewSlot(user.id, slotId);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
