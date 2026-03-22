'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-900 border border-red-800 rounded-2xl p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚠</p>
        <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">
          {error.message || 'An unexpected error occurred in the application pipeline.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
