import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationType } from '@/types';

interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  action_url?: string;
  icon?: string;
}

export async function createNotification(
  supabase: SupabaseClient,
  params: CreateNotificationParams
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: params.user_id,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      action_url: params.action_url,
      icon: params.icon,
      is_read: false,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function sendPushNotification(
  subscription: PushSubscription | string,
  payload: { title: string; body: string; url?: string; icon?: string }
): Promise<void> {
  try {
    const webpush = await import('web-push');
    webpush.default.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:chapchap.ci@gmail.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );

    const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
    await webpush.default.sendNotification(sub, JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
    }));
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  let query = supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (notificationIds?.length) {
    query = query.in('id', notificationIds);
  }

  await query;
}
