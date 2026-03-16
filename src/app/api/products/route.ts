export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const ProductFilterSchema = z.object({
  q: z.string().optional(),
  category_id: z.string().optional(),
  shop_id: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  min_rating: z.coerce.number().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular', 'flash_sale']).default('newest'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
  in_stock: z.coerce.boolean().optional(),
  is_featured: z.coerce.boolean().optional(),
  tags: z.string().optional(),
});

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const filters = ProductFilterSchema.parse(params);
    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('products')
      .select(`
        *,
        shop:shops(id, name, slug, logo, rating, is_verified, location),
        category:categories(id, name, slug, icon),
        promotions:promotions(discount_percentage, end_date, is_active)
      `, { count: 'exact' })
      .eq('status', 'active')
      .eq('shops.status', 'active');

    // Full-text search
    if (filters.q) {
      query = query.textSearch('search_vector', filters.q, { type: 'websearch', config: 'french' });
    }

    // Filtres
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.shop_id) query = query.eq('shop_id', filters.shop_id);
    if (filters.min_price) query = query.gte('price', filters.min_price);
    if (filters.max_price) query = query.lte('price', filters.max_price);
    if (filters.min_rating) query = query.gte('rating', filters.min_rating);
    if (filters.in_stock) query = query.gt('stock', 0);
    if (filters.is_featured) query = query.eq('is_featured', true);
    if (filters.tags) {
      const tagsArray = filters.tags.split(',');
      query = query.overlaps('tags', tagsArray);
    }

    // Tri
    switch (filters.sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'rating': query = query.order('rating', { ascending: false }); break;
      case 'popular': query = query.order('order_count', { ascending: false }); break;
      case 'flash_sale':
        query = query.not('promotions', 'is', null).order('created_at', { ascending: false });
        break;
      default: query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) {
      console.error('Products query error:', error);
      return NextResponse.json({ success: false, error: 'Erreur de récupération' }, { status: 500 });
    }

    // Calculer le prix avec promo
    const productsWithDiscount = products?.map(p => {
      const activePromo = p.promotions?.find((pr: any) => 
        pr.is_active && new Date(pr.end_date) > new Date()
      );
      return {
        ...p,
        promotions: undefined,
        discount_percentage: activePromo?.discount_percentage || null,
        discounted_price: activePromo 
          ? p.price * (1 - activePromo.discount_percentage / 100)
          : null,
      };
    });

    const total = count || 0;
    const total_pages = Math.ceil(total / filters.limit);

    return NextResponse.json({
      success: true,
      data: productsWithDiscount,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        total_pages,
        has_next: filters.page < total_pages,
        has_prev: filters.page > 1,
      },
    });

  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/products - Créer un produit (vendeur)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const supabase = createServerSupabaseClient();

    // Récupérer la boutique du vendeur
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .single();

    if (!shop && user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Vous devez avoir une boutique active pour ajouter des produits' 
      }, { status: 400 });
    }

    const slug = body.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 200) + '-' + Date.now();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        shop_id: shop?.id || body.shop_id,
        category_id: body.category_id,
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        compare_price: body.compare_price || null,
        cost_price: body.cost_price || null,
        stock: body.stock || 0,
        sku: body.sku || null,
        images: body.images || [],
        thumbnail: body.images?.[0] || null,
        tags: body.tags || [],
        attributes: body.attributes || {},
        weight: body.weight || null,
        dimensions: body.dimensions || null,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Erreur création produit' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
