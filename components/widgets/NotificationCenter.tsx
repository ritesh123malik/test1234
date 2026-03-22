'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Building2, 
  Trophy, 
  Target, 
  Zap, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'achievement': return <Trophy className="text-brand-tertiary" size={18} />;
    case 'success': return <CheckCheck className="text-brand-success" size={18} />;
    case 'warning': return <AlertCircle className="text-brand-warning" size={18} />;
    case 'error': return <AlertCircle className="text-brand-danger" size={18} />;
    case 'social': return <Building2 className="text-brand-primary" size={18} />;
    default: return <Bell className="text-text-muted" size={18} />;
  }
};

const getBgColor = (type: string) => {
  switch (type) {
    case 'achievement': return 'bg-brand-tertiary/10';
    case 'success': return 'bg-brand-success/10';
    case 'warning': return 'bg-brand-warning/10';
    case 'error': return 'bg-brand-danger/10';
    case 'social': return 'bg-brand-primary/10';
    default: return 'bg-bg-overlay';
  }
};

export function NotificationCenter({ isOpen, onClose, isStatic = false }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();

  const Content = (
    <div className={`${isStatic ? 'w-full h-[600px]' : 'fixed top-0 right-0 h-full w-full max-w-md'} bg-bg-surface/95 backdrop-blur-2xl border-l border-border-subtle z-[101] shadow-2xl flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-text-primary uppercase">Intelligence Center</h2>
          <p className="text-[10px] font-black tracking-[0.2em] text-text-muted mt-1 uppercase">Protocol Activity & Alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            className="p-2 rounded-xl border border-border-subtle hover:bg-bg-overlay transition-all text-text-muted hover:text-brand-primary group"
            title="Mark all as read"
          >
            <CheckCheck size={18} className="group-active:scale-95" />
          </button>
          {!isStatic && (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl border border-border-subtle hover:bg-bg-overlay transition-all text-text-muted hover:text-brand-danger"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Decrypting Intel...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 opacity-50">
            <Bell size={48} className="stroke-[1px]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">No active signals detected <br/>in your sector</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`group relative p-4 rounded-3xl border transition-all cursor-pointer ${
                notif.is_read 
                  ? 'bg-bg-overlay/20 border-border-subtle' 
                  : 'bg-bg-surface border-border-strong shadow-lg shadow-brand-primary/5'
              }`}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div className="flex gap-4">
                <div className={`mt-1 p-2.5 rounded-2xl ${getBgColor(notif.type)} transition-transform group-hover:scale-110`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-xs font-black uppercase tracking-tight ${notif.is_read ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] font-black text-text-muted whitespace-nowrap uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${notif.is_read ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {notif.message}
                  </p>
                  
                  {notif.link && (
                    <Link 
                      href={notif.link}
                      className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline group/link"
                    >
                      Execute Directive <ExternalLink size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>

              {!notif.is_read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]" />
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border-subtle bg-bg-overlay/30">
         <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">
           <span>Sector Status</span>
           <span className="flex items-center gap-2 text-brand-success">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
             Fully Synchronized
           </span>
         </div>
         {!isStatic && (
           <button 
            onClick={onClose}
            className="w-full py-4 bg-text-primary text-bg-base rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-primary hover:text-white transition-all active:scale-[0.98]"
           >
             Close Archive
           </button>
         )}
      </div>
    </div>
  );

  if (isStatic) return Content;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-fit z-[101]"
          >
            {Content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

