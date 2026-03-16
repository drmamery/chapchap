export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// GET /api/chat - Lister les conversations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('conversations')
      .select(`
        *,
        buyer:users!conversations_buyer_id_fkey(id, name, profile_pic),
        seller:users!conversations_seller_id_fkey(id, name, profile_pic),
        shop:shops(id, name, logo),
        product:products(id, name, thumbnail)
      `)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false });

    if (user.role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else if (user.role === 'seller') {
      query = query.eq('seller_id', user.id);
    }

    const { data: conversations, error } = await query;
    if (error) return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });

    // Ajouter le nombre de non-lus
    const convsWithUnread = conversations?.map(conv => ({
      ...conv,
      unread_count: user.role === 'buyer' ? conv.buyer_unread : conv.seller_unread,
    }));

    return NextResponse.json({ success: true, data: convsWithUnread });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/chat - Créer une conversation ou envoyer un message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { shop_id, product_id, message, conversation_id } = body;

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message vide' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    let conv: any;

    if (conversation_id) {
      // Conversation existante
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversation_id)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .single();

      if (!data) return NextResponse.json({ success: false, error: 'Conversation non trouvée' }, { status: 404 });
      conv = data;
    } else {
      // Nouvelle conversation (acheteur → vendeur)
      if (!shop_id) return NextResponse.json({ success: false, error: 'shop_id requis' }, { status: 400 });

      const { data: shop } = await supabase
        .from('shops').select('id, owner_id').eq('id', shop_id).single();

      if (!shop) return NextResponse.json({ success: false, error: 'Boutique non trouvée' }, { status: 404 });

      // Vérifier conversation existante
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('seller_id', shop.owner_id)
        .eq('shop_id', shop_id)
        .maybeSingle();

      if (existing) {
        conv = existing;
      } else {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            seller_id: shop.owner_id,
            shop_id,
            product_id: product_id || null,
          })
          .select('*')
          .single();
        conv = newConv;
      }
    }

    // Sanitiser le message
    const sanitizedContent = message.trim().slice(0, 2000);

    // Envoyer le message
    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: user.id,
        content: sanitizedContent,
        message_type: 'text',
        is_read: false,
      })
      .select('*, sender:users(id, name, profile_pic)')
      .single();

    if (msgError) return NextResponse.json({ success: false, error: 'Erreur envoi' }, { status: 500 });

    // Mettre à jour la conversation
    const isFromBuyer = user.id === conv.buyer_id;
    await supabase.from('conversations').update({
      last_message: sanitizedContent.slice(0, 100),
      last_message_at: new Date().toISOString(),
      ...(isFromBuyer 
        ? { seller_unread: (conv.seller_unread || 0) + 1 }
        : { buyer_unread: (conv.buyer_unread || 0) + 1 }
      ),
    }).eq('id', conv.id);

    // Notifier le destinataire
    const recipientId = isFromBuyer ? conv.seller_id : conv.buyer_id;
    await createNotification(supabase, {
      user_id: recipientId,
      type: 'message',
      title: `💬 Nouveau message de ${user.name}`,
      message: sanitizedContent.slice(0, 80) + (sanitizedContent.length > 80 ? '...' : ''),
      data: { conversation_id: conv.id, sender_id: user.id },
      action_url: `/messages/${conv.id}`,
    });

    return NextResponse.json({ success: true, data: { message: msg, conversation_id: conv.id } }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
