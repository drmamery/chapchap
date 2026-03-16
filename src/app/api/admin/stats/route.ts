export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Accès admin requis' }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();

    // Paralléliser les requêtes
    const [
      usersResult,
      shopsResult,
      productsResult,
      ordersResult,
      revenueResult,
      todayOrdersResult,
    ] = await Promise.all([
      supabase.from('users').select('id, role', { count: 'exact' }),
      supabase.from('shops').select('id, status', { count: 'exact' }),
      supabase.from('products').select('id, status', { count: 'exact' }),
      supabase.from('orders').select('id, status, total_price, created_at', { count: 'exact' }),
      supabase.from('orders').select('total_price').eq('payment_status', 'completed'),
      supabase.from('orders').select('id, total_price')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);

    const users = usersResult.data || [];
    const totalRevenue = (revenueResult.data as any[])?.reduce((s: number, o: any) => s + (o.total_price || 0), 0) || 0;
    const todayRevenue = (todayOrdersResult.data as any[])?.reduce((s: number, o: any) => s + (o.total_price || 0), 0) || 0;

    // Revenue mensuel (derniers 8 mois)
    const monthlyRevenue = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);
      const monthOrders = (ordersResult.data as any[])?.filter((o: any) => o.created_at?.startsWith(month)) || [];
      monthlyRevenue.push({
        month: d.toLocaleDateString('fr-CI', { month: 'short' }),
        revenue: monthOrders.reduce((s: number, o: any) => s + (o.total_price || 0), 0),
        orders: monthOrders.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        total_users: usersResult.count || 0,
        total_buyers: (users as any[]).filter((u: any) => u.role === 'buyer').length,
        total_sellers: (users as any[]).filter((u: any) => u.role === 'seller').length,
        total_shops: shopsResult.count || 0,
        active_shops: ((shopsResult.data || []) as any[]).filter((s: any) => s.status === 'active').length,
        total_products: productsResult.count || 0,
        total_orders: ordersResult.count || 0,
        pending_orders: ((ordersResult.data || []) as any[]).filter((o: any) => o.status === 'pending').length,
        total_revenue: totalRevenue,
        today_orders: todayOrdersResult.count || 0,
        today_revenue: todayRevenue,
        monthly_revenue: monthlyRevenue,
        order_status_distribution: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map(status => ({
          status,
          count: ((ordersResult.data || []) as any[]).filter((o: any) => o.status === status).length,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
