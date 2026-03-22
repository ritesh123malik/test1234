'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'social';
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      // Use getSession (cached) instead of getUser (network) to avoid blocking
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Gracefully handle missing table during migration propagation
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          setNotifications([]);
          setUnreadCount(0);
        } else {
          console.error('Error fetching notifications:', error);
        }
        setLoading(false);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (e) {
      console.warn('Notifications: fetch failed silently', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
         const updatedNotif = payload.new as Notification;
         setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
         // Recalculate unread count is safer
         setUnreadCount(prev => {
             if (updatedNotif.is_read) return Math.max(0, prev - 1);
             return prev;
         });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic Update
    const originalNotifs = [...notifications];
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      if (error.code !== '42P01' && !error.message?.includes('schema cache')) {
        setNotifications(originalNotifs);
        setUnreadCount(originalNotifs.filter(n => !n.is_read).length);
      }
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic Update
    const originalNotifs = [...notifications];
    const originalUnread = unreadCount;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      // Revert on error if not a schema issue
      if (error.code !== '42P01' && !error.message?.includes('schema cache')) {
        setNotifications(originalNotifs);
        setUnreadCount(originalUnread);
      }
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

