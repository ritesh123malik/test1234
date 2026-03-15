import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { identifyDSAPattern } from '@/services/dsa-pattern-service';
import { checkPremiumGate } from '@/lib/premium-gate';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { code, description } = await req.json();

        // Premium Gate Check
        const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'dsa_patterns');
        if (!allowed) {
            return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
        }

        const pattern = await identifyDSAPattern({ code, description }, user.id);

        return NextResponse.json(pattern);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
