'use client';

import { useEffect, useCallback } from 'react';
import { useNotificationStore, useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuthStore();
  const {
    notifications, unreadCount,
    setNotifications, addNotification, markAsRead, markAllAsRead, setUnreadCount,
  } = useNotificationStore();

  // Charger les notifications initiales
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      const { data } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setNotifications(data as Notification[]);
    };

    loadNotifications();
  }, [user, setNotifications]);

  // Abonnement temps réel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as Notification;
          addNotification(notif);
          // Toast pour notifs importantes
          if (notif.type === 'order' || notif.type === 'message') {
            toast(notif.title, {
              icon: notif.type === 'order' ? '📦' : '💬',
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, addNotification]);

  const markRead = useCallback(async (id: string) => {
    markAsRead(id);
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
  }, [markAsRead]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    markAllAsRead();
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
  }, [user, markAllAsRead]);

  return { notifications, unreadCount, markRead, markAllRead };
}
