'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
    onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
    const { unreadCount } = useNotifications();

    return (
        <div className="relative">
            <button 
                onClick={onClick}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all relative group"
            >
                <Bell size={20} className="group-active:scale-90 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-brand-danger text-white text-[9px] font-black flex items-center justify-center rounded-full border border-bg-base shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}

