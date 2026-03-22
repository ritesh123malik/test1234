// app/api/verify-placement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('placement_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { companyName, role, linkedinUrl, offerLetterUrl } = body;

    if (!companyName || !role) {
        return NextResponse.json({ error: 'Company and Role are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('placement_verifications')
        .insert({
            user_id: user.id,
            company_name: companyName,
            role,
            linkedin_url: linkedinUrl,
            offer_letter_url: offerLetterUrl,
            verification_status: 'pending'
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // For demo/hackathon purposes, we can auto-verify if certain conditions are met, 
    // but here we just keep it pending for "admin" review simulation.
    
    return NextResponse.json(data);
}
