import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // 2. Update Profile to Premium
        // Using interval '30 days' for monthly premium
        const { error } = await supabase
            .from('profiles')
            .update({
                is_premium: true,
                premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                premium_source: 'razorpay'
            })
            .eq('id', user.id);

        if (error) {
            console.error('Database Update Error:', error);
            return NextResponse.json({ error: 'Failed to update premium status' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Premium activated successfully' });
    } catch (error: any) {
        console.error('Razorpay Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
