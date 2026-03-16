export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    attributes: z.record(z.string()).optional().default({}),
  })).min(1),
  shipping_address: z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    address: z.string().min(5),
    city: z.string().default('Bouaké'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  payment_method: z.enum(['orange_money', 'mtn_momo', 'wave', 'stripe', 'cash_on_delivery']),
  phone_number: z.string().optional(),
  notes: z.string().optional(),
  promo_code: z.string().optional(),
});

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(id, name, thumbnail)),
        delivery:deliveries(*),
        shop:shops(id, name, logo)
      `, { count: 'exact' });

    // Filtrer par rôle
    if (user.role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else if (user.role === 'seller') {
      const { data: shop } = await supabase
        .from('shops').select('id').eq('owner_id', user.id).single();
      if (shop) query = query.eq('shop_id', shop.id);
    }
    // Admin voit tout

    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data: orders, count, error } = await query;
    if (error) return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page, limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: page < Math.ceil((count || 0) / limit),
        has_prev: page > 1,
      },
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/orders - Créer une commande
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { items, shipping_address, payment_method, phone_number, notes, promo_code } = parsed.data;
    const supabase = createServerSupabaseClient();

    // Récupérer les produits et vérifier le stock
    const productIds = items.map(i => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, stock, shop_id, thumbnail, status')
      .in('id', productIds)
      .eq('status', 'active');

    if (!products || products.length !== items.length) {
      return NextResponse.json({ success: false, error: 'Un ou plusieurs produits non disponibles' }, { status: 400 });
    }

    // Vérifier stock et calculer prix
    const orderItems: any[] = [];
    let subtotal = 0;
    let shopId: string | null = null;

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) continue;

      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}`,
        }, { status: 400 });
      }

      // ChapChap supporte 1 boutique par commande
      if (shopId && shopId !== product.shop_id) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez commander que depuis une seule boutique à la fois',
        }, { status: 400 });
      }
      shopId = product.shop_id;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        shop_id: product.shop_id,
        name: product.name,
        image: product.thumbnail,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        attributes: item.attributes,
      });
    }

    // Appliquer code promo
    let discountAmount = 0;
    if (promo_code) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .single();

      if (promo) {
        if (!promo.max_uses || promo.used_count < promo.max_uses) {
          if (subtotal >= promo.min_order_amount) {
            if (promo.discount_type === 'percentage') {
              discountAmount = subtotal * (promo.discount_value / 100);
            } else {
              discountAmount = Math.min(promo.discount_value, subtotal);
            }
            // Incrémenter usage
            await supabase.from('promo_codes').update({
              used_count: promo.used_count + 1
            }).eq('id', promo.id);
          }
        }
      }
    }

    const shippingFee = subtotal >= 50000 ? 0 : 1500; // Livraison gratuite > 50 000 FCFA
    const totalPrice = subtotal - discountAmount + shippingFee;

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        shop_id: shopId,
        status: 'pending',
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        tax_amount: 0,
        total_price: totalPrice,
        currency: 'XOF',
        payment_method,
        payment_status: 'pending',
        shipping_address,
        notes,
        promo_code: promo_code || null,
      })
      .select('*')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ success: false, error: 'Erreur création commande' }, { status: 500 });
    }

    // Créer les articles
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ success: false, error: 'Erreur articles commande' }, { status: 500 });
    }

    // Créer entrée livraison
    await supabase.from('deliveries').insert({
      order_id: order.id,
      delivery_address: shipping_address,
      status: 'unassigned',
    });

    // Vider le panier
    await supabase.from('cart_items').delete()
      .eq('user_id', user.id)
      .in('product_id', productIds);

    // Notifications
    await createNotification(supabase, {
      user_id: user.id,
      type: 'order',
      title: 'Commande passée ! 🎉',
      message: `Votre commande ${order.order_number} de ${new Intl.NumberFormat('fr-CI').format(totalPrice)} FCFA a été reçue.`,
      data: { order_id: order.id },
      action_url: `/buyer/orders/${order.id}`,
    });

    // Notifier le vendeur
    if (shopId) {
      const { data: shop } = await supabase.from('shops').select('owner_id').eq('id', shopId).single();
      if (shop) {
        await createNotification(supabase, {
          user_id: shop.owner_id,
          type: 'order',
          title: '🛍️ Nouvelle commande !',
          message: `Vous avez reçu une nouvelle commande de ${new Intl.NumberFormat('fr-CI').format(totalPrice)} FCFA`,
          data: { order_id: order.id },
          action_url: `/seller/orders/${order.id}`,
        });
      }
    }

    // Email de confirmation (async)
    sendOrderConfirmationEmail(user.email, user.name, order).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      data: { ...order, items: orderItems },
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
