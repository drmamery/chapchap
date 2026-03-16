'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Shield, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCartStore } from '@/store';
import { formatCFA, calculateShipping } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const subtotal = getTotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 max-w-lg text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white mb-3">Panier vide</h1>
            <p className="text-chapchap-muted mb-8">Vous n&apos;avez pas encore ajouté de produits à votre panier.</p>
            <Link href="/products" className="btn-primary btn-lg">
              <ShoppingBag size={20} /> Découvrir les produits
            </Link>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white mb-6">
          Mon panier <span className="text-chapchap-muted font-normal text-lg">({items.length} article{items.length > 1 ? 's' : ''})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.product_id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 flex gap-4"
                >
                  <Link href={`/products/${item.product_id}`} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    {item.product?.thumbnail && (
                      <Image src={item.product.thumbnail} alt={item.product?.name || ''} width={80} height={80} className="w-full h-full object-cover" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`} className="font-semibold text-chapchap-secondary dark:text-white hover:text-chapchap-primary transition-colors line-clamp-2 text-sm">
                      {item.product?.name || 'Produit'}
                    </Link>
                    {item.product?.shop && (
                      <p className="text-xs text-chapchap-muted mt-0.5">{item.product.shop.name}</p>
                    )}
                    {Object.entries(item.attributes || {}).map(([k, v]) => (
                      <span key={k} className="badge-primary text-2xs mr-1 mt-1">{k}: {v as string}</span>
                    ))}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-chapchap-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-chapchap-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-chapchap-primary">{formatCFA((item.product?.price || 0) * item.quantity)}</span>
                        <button onClick={() => removeItem(item.product_id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24 space-y-4">
              <h3 className="font-display font-bold text-chapchap-secondary dark:text-white">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-chapchap-muted">Sous-total</span>
                  <span>{formatCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-chapchap-muted">Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? '🎉 Gratuite' : formatCFA(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-chapchap-muted bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                    💡 Ajoutez {formatCFA(50000 - subtotal)} pour la livraison gratuite !
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-chapchap-primary">{formatCFA(total)}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full py-3.5 text-base">
                Commander <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="btn-ghost w-full text-sm">← Continuer les achats</Link>
              <div className="pt-2 space-y-2 text-xs text-chapchap-muted">
                <p className="flex items-center gap-2"><Shield size={12} className="text-green-600" /> Paiement 100% sécurisé</p>
                <p className="flex items-center gap-2"><Truck size={12} className="text-chapchap-primary" /> Livraison 24-48h à Bouaké</p>
                <p className="flex items-center gap-2"><Tag size={12} className="text-blue-500" /> Codes promo disponibles au checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
