export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const unread_only = url.searchParams.get('unread') === '1';

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unread_only) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });

    const unread_count = data?.filter(n => !n.is_read).length || 0;

    return NextResponse.json({ success: true, data, unread_count });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/notifications - Marquer comme lu
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { ids, mark_all } = body;
    const supabase = createServerSupabaseClient();

    let query = supabase.from('notifications').update({
      is_read: true,
      read_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    if (!mark_all && ids?.length) {
      query = query.in('id', ids);
    }

    await query;
    return NextResponse.json({ success: true, message: 'Notifications marquées comme lues' });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/notifications/push - S'abonner aux push notifications
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const { subscription } = await request.json();
    if (!subscription) return NextResponse.json({ success: false, error: 'Subscription requise' }, { status: 400 });

    const supabase = createServerSupabaseClient();
    await supabase.from('users').update({ push_subscription: subscription }).eq('id', user.id);

    return NextResponse.json({ success: true, message: 'Abonnement push enregistré' });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
