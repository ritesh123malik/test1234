'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSyncProps {
  userId: string;
  leetcodeHandle?: string;
  codeforcesHandle?: string;
  githubHandle?: string;
  lastSyncedAt?: string;
}

export function ProfileSync({ 
  userId, 
  leetcodeHandle, 
  codeforcesHandle, 
  githubHandle,
  lastSyncedAt 
}: ProfileSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);

  const handleSync = async () => {
    if (!leetcodeHandle && !codeforcesHandle && !githubHandle) {
      toast.error('No handles linked. Please update your profile.');
      return;
    }

    setSyncing(true);
    const toastId = toast.loading('Synchronizing Neural ID with external platforms...');

    try {
      const response = await fetch('/api/neural/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setSyncedAt(new Date().toISOString());
        toast.success('Neural Intelligence Synchronized!', {
          id: toastId,
          description: `Score updated to ${Math.round(data.score)} N`
        });
        // Optionally refresh the page or update parent state
        window.location.reload();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Sync Failed', {
        id: toastId,
        description: error.message
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          syncing 
            ? 'bg-surface2 text-muted cursor-wait' 
            : 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white'
        }`}
      >
        <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Syncing_Intelligence...' : 'Sync_Neural_ID'}
      </button>
      {syncedAt && (
        <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter flex items-center gap-1.5 px-1">
          <CheckCircle2 size={10} className="text-brand-success" />
          Last_Sync: {new Date(syncedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
