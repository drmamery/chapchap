export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

interface MobileMoneyRequest {
  order_id: string;
  phone_number: string;
  provider: 'orange_money' | 'mtn_momo' | 'wave';
}

// Simulation API Orange Money CI
async function initiateOrangeMoney(amount: number, phone: string, reference: string): Promise<{
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  ussd_code?: string;
  error?: string;
}> {
  try {
    // En prod: appel réel à l'API Orange Money CI
    // const response = await fetch(`${process.env.ORANGE_MONEY_API_URL}/webpayment`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ORANGE_MONEY_MERCHANT_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ merchant_key, currency: 'OUV', order_id: reference, amount, return_url, cancel_url, notif_url }),
    // });
    
    // SIMULATION pour dev
    const transactionId = `OM-CI-${Date.now()}`;
    const ussdCode = `#144*82*${amount}*${reference}#`;
    
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: `https://api.orange.com/orange-money-webpay/ci/v1/webpayment?token=${transactionId}`,
      ussd_code: ussdCode,
    };
  } catch (error) {
    return { success: false, error: 'Erreur Orange Money' };
  }
}

// Simulation API MTN MoMo
async function initiateMTNMomo(amount: number, phone: string, reference: string): Promise<{
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  error?: string;
}> {
  try {
    // En prod: appel réel MTN MoMo API
    const transactionId = `MTN-${Date.now()}`;
    return {
      success: true,
      transaction_id: transactionId,
      payment_url: `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`,
    };
  } catch (error) {
    return { success: false, error: 'Erreur MTN MoMo' };
  }
}

// Simulation API Wave CI
async function initiateWave(amount: number, phone: string, reference: string): Promise<{
  success: boolean;
  transaction_id?: string;
  wave_launch_url?: string;
  error?: string;
}> {
  try {
    // En prod: appel réel Wave API
    const transactionId = `WAVE-${Date.now()}`;
    return {
      success: true,
      transaction_id: transactionId,
      wave_launch_url: `https://pay.wave.com/m/chapchap_ci/${reference}?amount=${amount}`,
    };
  } catch (error) {
    return { success: false, error: 'Erreur Wave' };
  }
}

// POST /api/payments/mobilemoney
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const body: MobileMoneyRequest = await request.json();
    const { order_id, phone_number, provider } = body;

    if (!order_id || !phone_number || !provider) {
      return NextResponse.json({ success: false, error: 'Données manquantes' }, { status: 400 });
    }

    // Valider format numéro CI
    const cleanPhone = phone_number.replace(/[\s\-\(\)]/g, '');
    const ciPhoneRegex = /^(\+?225|00225)?0[5-9]\d{8}$/;
    if (!ciPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Numéro de téléphone invalide. Format: 07 XX XX XX XX' 
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
    }

    if (order.payment_status === 'completed') {
      return NextResponse.json({ success: false, error: 'Commande déjà payée' }, { status: 400 });
    }

    // Créer référence unique
    const paymentRef = `CC-PAY-${order.order_number}-${Date.now()}`;

    // Initier selon le provider
    let providerResult: any;
    switch (provider) {
      case 'orange_money':
        providerResult = await initiateOrangeMoney(order.total_price, cleanPhone, paymentRef);
        break;
      case 'mtn_momo':
        providerResult = await initiateMTNMomo(order.total_price, cleanPhone, paymentRef);
        break;
      case 'wave':
        providerResult = await initiateWave(order.total_price, cleanPhone, paymentRef);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Provider non supporté' }, { status: 400 });
    }

    if (!providerResult.success) {
      return NextResponse.json({ success: false, error: providerResult.error }, { status: 502 });
    }

    // Enregistrer le paiement en attente
    await supabase.from('payments').insert({
      order_id: order.id,
      user_id: user.id,
      amount: order.total_price,
      currency: 'XOF',
      method: provider,
      status: 'processing',
      reference: providerResult.transaction_id,
      phone_number: cleanPhone,
      provider_data: providerResult,
      metadata: { payment_ref: paymentRef },
    });

    // Mettre à jour la commande
    await supabase.from('orders').update({
      payment_method: provider,
      payment_status: 'processing',
      payment_reference: providerResult.transaction_id,
    }).eq('id', order.id);

    // Notification à l'utilisateur
    const providerNames: Record<string, string> = {
      orange_money: 'Orange Money',
      mtn_momo: 'MTN MoMo',
      wave: 'Wave',
    };

    await createNotification(supabase, {
      user_id: user.id,
      type: 'order',
      title: `Paiement ${providerNames[provider]} initié`,
      message: `Suivez les instructions sur votre téléphone pour finaliser le paiement de ${new Intl.NumberFormat('fr-CI').format(order.total_price)} FCFA`,
      data: { order_id: order.id, payment_ref: paymentRef },
      action_url: `/buyer/orders/${order.id}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement initié',
      data: {
        transaction_id: providerResult.transaction_id,
        payment_url: providerResult.payment_url || providerResult.wave_launch_url,
        ussd_code: providerResult.ussd_code,
        amount: order.total_price,
        currency: 'XOF',
        phone: cleanPhone,
        provider,
        status: 'processing',
        instructions: getPaymentInstructions(provider, cleanPhone, order.total_price, providerResult),
      },
    });

  } catch (error) {
    console.error('Mobile money error:', error);
    return NextResponse.json({ success: false, error: 'Erreur de paiement' }, { status: 500 });
  }
}

function getPaymentInstructions(
  provider: string, 
  phone: string, 
  amount: number,
  result: any
): string[] {
  const amountStr = new Intl.NumberFormat('fr-CI').format(amount);
  
  switch (provider) {
    case 'orange_money':
      return [
        `Composez ${result.ussd_code || '#144#'} sur votre téléphone Orange`,
        `Confirmez le paiement de ${amountStr} FCFA`,
        `Saisissez votre code PIN Orange Money`,
        'Attendez la confirmation par SMS',
      ];
    case 'mtn_momo':
      return [
        `Vous allez recevoir une demande de paiement MTN MoMo`,
        `Approuvez le paiement de ${amountStr} FCFA sur ${phone}`,
        `Saisissez votre PIN MoMo pour confirmer`,
        'Attendez le SMS de confirmation',
      ];
    case 'wave':
      return [
        'Ouvrez votre application Wave',
        `Scannez le QR code ou cliquez sur le lien de paiement`,
        `Confirmez le paiement de ${amountStr} FCFA`,
        'La commande sera confirmée automatiquement',
      ];
    default:
      return [];
  }
}

// Webhook pour confirmation de paiement (appelé par les providers)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, status, provider } = body;
    
    const supabase = createServerSupabaseClient();

    // Récupérer le paiement
    const { data: payment } = await supabase
      .from('payments')
      .select('*, order:orders(*)')
      .eq('reference', transaction_id)
      .single();

    if (!payment) {
      return NextResponse.json({ received: true }); // Ne pas révéler l'erreur
    }

    if (status === 'success' || status === 'completed') {
      // Confirmer le paiement
      await supabase.from('payments').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', payment.id);

      await supabase.from('orders').update({
        payment_status: 'completed',
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      }).eq('id', payment.order_id);

      // Notifier l'acheteur
      await createNotification(supabase, {
        user_id: payment.user_id,
        type: 'order',
        title: '✅ Paiement confirmé !',
        message: `Votre paiement a été confirmé. Commande ${payment.order.order_number} en cours de préparation.`,
        data: { order_id: payment.order_id },
        action_url: `/buyer/orders/${payment.order_id}`,
      });

    } else if (status === 'failed') {
      await supabase.from('payments').update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: body.error_message,
      }).eq('id', payment.id);

      await supabase.from('orders').update({
        payment_status: 'failed',
      }).eq('id', payment.order_id);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
