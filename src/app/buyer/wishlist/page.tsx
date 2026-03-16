'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatCFA } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

const MOCK_WISHLIST = [
  { id: 'prod-001', name: 'Samsung Galaxy A55 5G - 128Go', price: 285000, compare_price: 320000, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', shop: { name: 'TechZone Bouaké' }, rating: 4.6 },
  { id: 'prod-005', name: 'Robe Pagne Wax Africain', price: 35000, compare_price: 45000, stock: 30, thumbnail: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', shop: { name: 'Fashion Wax by Fatou' }, rating: 4.9 },
  { id: 'prod-002', name: 'iPhone 15 - 128Go Noir', price: 520000, compare_price: 580000, stock: 0, thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', shop: { name: 'TechZone Bouaké' }, rating: 4.8 },
];

export default function WishlistPage() {
  const [items, setItems] = useState(MOCK_WISHLIST);
  const { addToCart } = useCart();

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Retiré des favoris');
  };

  const addAllToCart = () => {
    const inStock = items.filter(i => i.stock > 0);
    inStock.forEach(i => addToCart(i as any));
    if (inStock.length < items.length) {
      toast(`${inStock.length} article(s) ajouté(s). ${items.length - inStock.length} hors stock.`, { icon: '⚠️' });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white flex items-center gap-2">
              <Heart className="text-red-500 fill-current" size={24} /> Ma wishlist
            </h1>
            <p className="text-chapchap-muted text-sm mt-1">{items.length} article{items.length !== 1 ? 's' : ''} sauvegardé{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-3">
              <button className="btn-outline btn-sm gap-2"><Share2 size={15} /> Partager</button>
              <button onClick={addAllToCart} className="btn-primary btn-sm gap-2"><ShoppingCart size={15} /> Tout ajouter au panier</button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state py-24">
            <div className="empty-state-icon">💝</div>
            <h3 className="text-xl font-bold text-chapchap-secondary dark:text-white mb-2">Votre wishlist est vide</h3>
            <p className="text-chapchap-muted mb-6">Sauvegardez des produits que vous aimez pour les retrouver facilement</p>
            <Link href="/products" className="btn-primary">Parcourir les produits</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.06 }} className="card overflow-hidden group">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Link href={`/products/${item.id}`}>
                      <Image src={item.thumbnail} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="badge bg-gray-800 text-white">Rupture de stock</span>
                      </div>
                    )}
                    <button onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 btn-icon bg-white/90 text-red-500 hover:bg-red-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${item.id}`}>
                      <p className="text-xs text-chapchap-muted">{item.shop.name}</p>
                      <h3 className="font-semibold text-sm text-chapchap-secondary dark:text-white mt-0.5 line-clamp-2 hover:text-chapchap-primary transition-colors">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-chapchap-primary">{formatCFA(item.price)}</span>
                      {item.compare_price && <span className="text-xs text-gray-400 line-through">{formatCFA(item.compare_price)}</span>}
                    </div>
                    <button
                      onClick={() => item.stock > 0 && addToCart(item as any)}
                      disabled={item.stock === 0}
                      className="btn-primary w-full mt-3 py-2.5 text-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ShoppingCart size={15} />
                      {item.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
