import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { handle, verificationCode } = await req.json();

        // Fetch CF user info to check "About" or "City" for the verification code
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const data = await response.json();

        if (data.status !== 'OK' || !data.result?.[0]) {
            return NextResponse.json({ error: 'Codeforces Protocol Error' }, { status: 404 });
        }

        const cfUser = data.result[0];
        
        // Check if verification code exists in either firstName, lastName, city, or country (places users can edit)
        const combinedString = `${cfUser.firstName || ''} ${cfUser.lastName || ''} ${cfUser.city || ''}`.toLowerCase();
        
        if (!combinedString.includes(verificationCode.toLowerCase())) {
            return NextResponse.json({ 
                verified: false, 
                message: 'Verification Code Not Detected in CF Profile' 
            });
        }

        // Mark as verified in DB
        const { error } = await supabase
            .from('codeforces_profiles')
            .update({ is_verified: true })
            .eq('user_id', user.id)
            .eq('codeforces_handle', handle);

        if (error) throw error;

        return NextResponse.json({ verified: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
