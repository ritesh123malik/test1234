import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseResume, scoreResume } from '@/services/ats-service';
import { checkPremiumGate, incrementUsage } from '@/lib/premium-gate';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const jd = formData.get('jd') as string;

        if (!file || !jd) {
            return NextResponse.json({ error: 'File and Job Description are required.' }, { status: 400 });
        }

        // 1. Premium Gate Check
        const { allowed, reason, upgrade } = await checkPremiumGate(user.id, 'ats_scans');
        if (!allowed) {
            return NextResponse.json({ error: reason, upgrade: !!upgrade }, { status: 403 });
        }

        // 2. Parse PDF
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const resumeText = await parseResume(buffer);

        // 3. Score with AI
        const analysis = await scoreResume(resumeText, jd, user.id);

        // 4. Increment usage
        await incrementUsage(user.id, 'ats_scans');

        // 5. Save scan history (Optional, but good for UX)
        await supabase.from('resume_scans').insert({
            user_id: user.id,
            score: analysis.score,
            jd_summary: jd.slice(0, 100),
            analysis: analysis
        });

        return NextResponse.json(analysis);

    } catch (err: any) {
        console.error('ATS API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
