export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const ShopSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(150),
  description: z.string().max(2000).optional(),
  category_id: z.string().optional(),
  location: z.object({
    city: z.string().default('Bouaké'),
    quarter: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  min_order_amount: z.number().optional(),
  estimated_delivery_time: z.string().optional(),
});

// GET /api/shops
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const category_id = url.searchParams.get('category_id') || '';
    const city = url.searchParams.get('city') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const supabase = createServerSupabaseClient();
    let dbQuery = supabase
      .from('shops')
      .select('*, owner:users(id, name, profile_pic), category:categories(id, name, icon)', { count: 'exact' })
      .eq('status', 'active');

    if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);
    if (category_id) dbQuery = dbQuery.eq('category_id', category_id);
    if (city) dbQuery = dbQuery.contains('location', { city });

    const from = (page - 1) * limit;
    const { data, count, error } = await dbQuery
      .order('rating', { ascending: false })
      .range(from, from + limit - 1);

    if (error) return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });

    return NextResponse.json({
      success: true,
      data,
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

// POST /api/shops - Créer une boutique
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ success: false, error: 'Rôle vendeur requis' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ShopSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    const supabase = createServerSupabaseClient();

    // Vérifier pas de boutique existante
    const { data: existing } = await supabase.from('shops').select('id').eq('owner_id', user.id).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: 'Vous avez déjà une boutique' }, { status: 409 });

    const slug = parsed.data.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 150) + '-' + Date.now();

    const { data: shop, error } = await supabase
      .from('shops')
      .insert({ ...parsed.data, owner_id: user.id, slug, status: 'pending_review' })
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: 'Erreur création boutique' }, { status: 500 });

    return NextResponse.json({ success: true, data: shop, message: 'Boutique créée. En attente de validation.' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
