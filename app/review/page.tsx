'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ReviewPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/experiences');
    }, [router]);

    return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="mx-auto text-brand-primary animate-spin" size={40} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-xs">
                    Redirecting to Intel Hub...
                </p>
            </div>
        </div>
    );
}
