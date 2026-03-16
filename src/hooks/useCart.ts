'use client';

import { useCartStore, useAuthStore } from '@/store';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { calculateShipping } from '@/lib/utils';
import type { Product } from '@/types';

export function useCart() {
  const store = useCartStore();
  const { user } = useAuthStore();

  const addToCart = useCallback(async (product: Product, quantity = 1, attributes: Record<string, string> = {}) => {
    if (product.stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    store.addItem({ product_id: product.id, product, quantity, attributes });
    toast.success(`${product.name} ajouté au panier`, {
      icon: '🛒',
      style: { fontWeight: 600 },
    });

    // Sync avec le serveur si connecté
    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, quantity, attributes }),
        });
      } catch {}
    }
  }, [store, user]);

  const removeFromCart = useCallback(async (productId: string) => {
    store.removeItem(productId);
    if (user) {
      try {
        await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
      } catch {}
    }
  }, [store, user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    store.updateQuantity(productId, quantity);
    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, quantity }),
        });
      } catch {}
    }
  }, [store, user]);

  const subtotal = store.getTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const itemCount = store.getItemCount();

  // Grouper par boutique
  const shopGroups = store.items.reduce((acc, item) => {
    const shopId = item.product?.shop_id || 'unknown';
    if (!acc[shopId]) acc[shopId] = { shop: item.product?.shop, items: [] };
    acc[shopId].items.push(item);
    return acc;
  }, {} as Record<string, any>);

  const cart = {
    items: store.items,
    total: subtotal,
    item_count: itemCount,
    shops: Object.values(shopGroups),
    shipping,
    grand_total: total,
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: store.clearCart,
  };
}
