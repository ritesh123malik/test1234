import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
        .update(body)
        .digest('hex');

    if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);

    // 2. Handle Payment Captured Event
    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
        const orderId = payload.payload.order.entity.id;
        const userId = payload.payload.payment.entity.notes.userId;

        if (userId) {
            // Set premium status (Backup for client-side verification)
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_premium: true,
                    premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    premium_source: 'razorpay_webhook'
                })
                .eq('id', userId);

            if (error) {
                console.error('Webhook DB Error:', error);
                return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ status: 'ok' });
}
