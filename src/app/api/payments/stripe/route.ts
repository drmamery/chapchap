export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// POST /api/payments/stripe
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const { order_id, payment_method_id } = await request.json();
    const supabase = createServerSupabaseClient();

    const { data: order } = await supabase
      .from('orders')
      .select('*, buyer:users(name, email)')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
    }

    if (order.payment_status === 'completed') {
      return NextResponse.json({ success: false, error: 'Commande déjà payée' }, { status: 400 });
    }

    // Créer PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_price), // FCFA
      currency: 'xof',
      payment_method: payment_method_id,
      confirm: true,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: user.id,
      },
      description: `ChapChap - Commande ${order.order_number}`,
      receipt_email: user.email,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/buyer/orders/${order.id}?payment=success`,
    });

    // Enregistrer paiement
    await supabase.from('payments').insert({
      order_id: order.id,
      user_id: user.id,
      amount: order.total_price,
      currency: 'XOF',
      method: 'stripe',
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
      reference: paymentIntent.id,
      provider_data: { payment_intent_id: paymentIntent.id },
    });

    if (paymentIntent.status === 'succeeded') {
      await supabase.from('orders').update({
        payment_status: 'completed',
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        payment_reference: paymentIntent.id,
      }).eq('id', order.id);

      return NextResponse.json({
        success: true,
        message: 'Paiement réussi',
        data: { payment_intent_id: paymentIntent.id, status: 'succeeded' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        requires_action: paymentIntent.status === 'requires_action',
      },
    });

  } catch (error: any) {
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Stripe payment error:', error);
    return NextResponse.json({ success: false, error: 'Erreur de paiement' }, { status: 500 });
  }
}
