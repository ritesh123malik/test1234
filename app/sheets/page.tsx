import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SheetsGallery from '@/components/sheets/SheetsGallery';
import SheetHeader from '@/components/sheets/SheetHeader';

export default async function SheetsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login?redirect=/sheets');

    // Fetch User Subscription for premium status
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

    const hasPro = subscription?.plan === 'pro' || subscription?.plan === 'annual';

    // Fetch Sheets: Premium/Public + User's Own
    const { data: sheets } = await supabase
        .from('question_sheets')
        .select(`
            *,
            questions_count:sheet_questions(count)
        `)
        .or(`is_public.eq.true,is_premium.eq.true,user_id.eq.${user.id}`)
        .order('is_premium', { ascending: false });

    return (
        <div className="min-h-screen bg-bg-base py-12 text-text-primary">
            <div className="max-w-container mx-auto px-4">
                <SheetHeader />
                <SheetsGallery initialSheets={sheets || []} hasPro={hasPro} />
            </div>
        </div>
    );
}

function Plus({ size, className }: { size?: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}
