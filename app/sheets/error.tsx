'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-bg-surface/40 backdrop-blur-xl border border-border-subtle rounded-[2.5rem] p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-danger/10 text-brand-danger rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl italic font-black">!</span>
        </div>
        <h2 className="text-xl font-black text-text-primary mb-2">Segment Error</h2>
        <p className="text-text-muted text-sm mb-8">
          The requested module encountered an execution fault. 
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-4 bg-text-primary text-bg-base font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-primary transition-all active:scale-95"
          >
            Retry Module
          </button>
          <Link
            href="/dashboard"
            className="w-full py-4 bg-bg-overlay/50 text-text-muted font-black uppercase tracking-widest text-[10px] rounded-xl hover:text-text-primary transition-all text-center"
          >
            Back to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
