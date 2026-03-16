export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const ReviewSchema = z.object({
  product_id: z.string().uuid().optional(),
  shop_id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional().default([]),
});

// GET /api/reviews?product_id=xxx
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const product_id = url.searchParams.get('product_id');
    const shop_id = url.searchParams.get('shop_id');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('reviews')
      .select('*, user:users(id, name, profile_pic)', { count: 'exact' })
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (product_id) query = query.eq('product_id', product_id);
    if (shop_id) query = query.eq('shop_id', shop_id);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });

    // Calcul stats
    const stats = data ? {
      average: data.reduce((s, r) => s + r.rating, 0) / (data.length || 1),
      distribution: [5, 4, 3, 2, 1].map(r => ({
        stars: r,
        count: data.filter(rv => rv.rating === r).length,
      })),
    } : null;

    return NextResponse.json({
      success: true,
      data,
      stats,
      pagination: {
        page, limit, total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: page < Math.ceil((count || 0) / limit),
        has_prev: page > 1,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/reviews - Créer un avis
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    const { product_id, shop_id, order_id, rating, comment, images } = parsed.data;
    const supabase = createServerSupabaseClient();

    // Vérifier que la commande appartient bien à l'utilisateur et est livrée
    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single();

    if (!order) return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
    if (order.status !== 'delivered') return NextResponse.json({ success: false, error: 'Vous ne pouvez noter qu\'une commande livrée' }, { status: 400 });

    // Vérifier pas de doublon
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('order_id', order_id)
      .maybeSingle();

    if (existing) return NextResponse.json({ success: false, error: 'Vous avez déjà noté cette commande' }, { status: 409 });

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: product_id || null,
        shop_id: shop_id || null,
        order_id,
        rating,
        comment: comment || null,
        images: images || [],
        is_verified_purchase: true,
        is_visible: true,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: 'Erreur création avis' }, { status: 500 });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
