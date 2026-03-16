'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown, Grid2X2, List } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatCFA } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Star, Heart, ShoppingCart } from 'lucide-react';

const CATEGORIES = [
  { id: 'electronique', name: 'Électronique', icon: '📱' },
  { id: 'mode-vetements', name: 'Mode & Wax', icon: '👗' },
  { id: 'alimentation', name: 'Alimentation', icon: '🥘' },
  { id: 'beaute-sante', name: 'Beauté & Santé', icon: '💄' },
  { id: 'maison-deco', name: 'Maison & Déco', icon: '🏠' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'popular', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'flash_sale', label: 'Ventes flash' },
];

// Mock products
const MOCK_PRODUCTS = [
  { id: 'prod-001', name: 'Samsung Galaxy A55 5G', price: 285000, compare_price: 320000, rating: 4.6, reviews: 23, stock: 15, thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', shop: { name: 'TechZone Bouaké', is_verified: true }, discount: 10 },
  { id: 'prod-002', name: 'iPhone 15 - 128Go Noir', price: 520000, compare_price: 580000, rating: 4.8, reviews: 12, stock: 8, thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', shop: { name: 'TechZone Bouaké', is_verified: true }, discount: 10 },
  { id: 'prod-003', name: 'Laptop Asus VivoBook 15', price: 420000, compare_price: 480000, rating: 4.5, reviews: 8, stock: 5, thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', shop: { name: 'TechZone Bouaké', is_verified: true }, discount: null },
  { id: 'prod-004', name: 'Chargeur Rapide 65W USB-C', price: 8500, compare_price: 12000, rating: 4.3, reviews: 45, stock: 50, thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bfad826e3?w=400', shop: { name: 'TechZone Bouaké', is_verified: true }, discount: 29 },
  { id: 'prod-005', name: 'Robe Pagne Wax Africain', price: 35000, compare_price: 45000, rating: 4.9, reviews: 67, stock: 30, thumbnail: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', shop: { name: 'Fashion Wax by Fatou', is_verified: true }, discount: 22 },
  { id: 'prod-006', name: 'Boubou Grand Bazin Homme', price: 55000, compare_price: 70000, rating: 4.8, reviews: 34, stock: 20, thumbnail: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=400', shop: { name: 'Fashion Wax by Fatou', is_verified: true }, discount: 21 },
  { id: 'prod-007', name: 'Attiéké Frais - 1kg', price: 1500, compare_price: null, rating: 4.7, reviews: 89, stock: 200, thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', shop: { name: 'Saveurs du Centre', is_verified: true }, discount: null },
  { id: 'prod-008', name: 'Huile de palme rouge 5L', price: 6500, compare_price: 8000, rating: 4.6, reviews: 44, stock: 100, thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', shop: { name: 'Saveurs du Centre', is_verified: true }, discount: 19 },
  { id: 'prod-009', name: 'Épices Mélange Ivoirien 250g', price: 2500, compare_price: 3000, rating: 4.8, reviews: 28, stock: 150, thumbnail: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', shop: { name: 'Saveurs du Centre', is_verified: true }, discount: 17 },
  { id: 'prod-010', name: 'Sac à main Cuir Local', price: 18000, compare_price: 22000, rating: 4.4, reviews: 15, stock: 12, thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', shop: { name: 'Fashion Wax by Fatou', is_verified: true }, discount: 18 },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = parseInt(searchParams.get('min_price') || '0');
  const maxPrice = parseInt(searchParams.get('max_price') || '1000000');

  const [localMin, setLocalMin] = useState(String(minPrice));
  const [localMax, setLocalMax] = useState(String(maxPrice));

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  // Filter mock products
  const filtered = MOCK_PRODUCTS.filter(p => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    return true;
  });

  const toggleWishlist = (id: string) => {
    setWishlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            {q ? (
              <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white">
                Résultats pour &ldquo;<span className="text-chapchap-primary">{q}</span>&rdquo;
              </h1>
            ) : (
              <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white">
                {category ? CATEGORIES.find(c => c.id === category)?.name || 'Produits' : 'Tous les produits'}
              </h1>
            )}
            <p className="text-chapchap-muted text-sm mt-1">{filtered.length} produits trouvés</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className="input text-sm pr-8 py-2.5 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn-outline btn-sm gap-2 ${filtersOpen ? 'bg-orange-50 border-chapchap-primary text-chapchap-primary' : ''}`}
            >
              <SlidersHorizontal size={16} /> Filtres
            </button>

            {/* View mode */}
            <div className="hidden sm:flex border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-chapchap-primary text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <Grid2X2 size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-chapchap-primary text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-64 space-y-6">
                  {/* Categories */}
                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-chapchap-secondary dark:text-white text-sm">Catégories</h3>
                      {category && (
                        <button onClick={() => updateFilter('category', '')} className="text-2xs text-chapchap-primary">Effacer</button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => updateFilter('category', category === cat.id ? '' : cat.id)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                            category === cat.id
                              ? 'bg-orange-50 text-chapchap-primary font-semibold dark:bg-orange-900/20'
                              : 'text-chapchap-muted hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span>{cat.icon}</span> {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-chapchap-secondary dark:text-white text-sm mb-3">Fourchette de prix</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-chapchap-muted">Prix minimum (FCFA)</label>
                        <input
                          type="number"
                          value={localMin}
                          onChange={e => setLocalMin(e.target.value)}
                          onBlur={() => updateFilter('min_price', localMin)}
                          placeholder="0"
                          className="input text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-chapchap-muted">Prix maximum (FCFA)</label>
                        <input
                          type="number"
                          value={localMax}
                          onChange={e => setLocalMax(e.target.value)}
                          onBlur={() => updateFilter('max_price', localMax)}
                          placeholder="1 000 000"
                          className="input text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick filters */}
                  <div className="card p-4">
                    <h3 className="font-semibold text-chapchap-secondary dark:text-white text-sm mb-3">Filtres rapides</h3>
                    <div className="space-y-2">
                      {[
                        { label: '⚡ Ventes flash', key: 'sort', value: 'flash_sale' },
                        { label: '✨ Produits vedettes', key: 'featured', value: '1' },
                        { label: '✅ En stock', key: 'in_stock', value: '1' },
                        { label: '⭐ Note 4+', key: 'min_rating', value: '4' },
                      ].map(f => (
                        <label key={f.label} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" onChange={() => updateFilter(f.key, f.value)} className="rounded text-chapchap-primary" />
                          <span className="text-sm text-chapchap-muted group-hover:text-chapchap-secondary dark:group-hover:text-white transition-colors">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters chips */}
            {(q || category) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {q && (
                  <span className="flex items-center gap-2 badge-primary px-3 py-1.5">
                    🔍 {q}
                    <button onClick={() => updateFilter('q', '')}><X size={12} /></button>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-2 badge-primary px-3 py-1.5">
                    {CATEGORIES.find(c => c.id === category)?.icon} {CATEGORIES.find(c => c.id === category)?.name}
                    <button onClick={() => updateFilter('category', '')}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
            }>
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={viewMode === 'list' ? 'card flex gap-4 p-4' : 'product-card'}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="product-card-image">
                        <Link href={`/products/${product.id}`}>
                          <Image src={product.thumbnail} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </Link>
                        {product.discount && (
                          <div className="product-card-badge">
                            <span className="badge bg-chapchap-primary text-white font-bold">-{product.discount}%</span>
                          </div>
                        )}
                        <div className="product-card-actions">
                          <button onClick={() => toggleWishlist(product.id)} className={`btn-icon bg-white shadow-md text-sm p-2 ${wishlisted.has(product.id) ? 'text-red-500' : 'text-gray-400'}`}>
                            <Heart size={16} fill={wishlisted.has(product.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button onClick={() => addToCart(product as any)} className="btn-icon bg-chapchap-primary text-white shadow-md p-2">
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="product-card-body">
                        <Link href={`/products/${product.id}`}>
                          <p className="text-xs text-chapchap-muted mb-1">{product.shop.name}</p>
                          <h3 className="text-sm font-semibold text-chapchap-secondary dark:text-white line-clamp-2 mb-2 hover:text-chapchap-primary transition-colors">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={11} className="text-chapchap-accent fill-current" />
                          <span className="text-xs font-semibold">{product.rating}</span>
                          <span className="text-2xs text-chapchap-muted">({product.reviews})</span>
                        </div>
                        <div className="mt-auto flex items-center gap-2">
                          <span className="font-display font-bold text-chapchap-primary text-base">{formatCFA(product.price)}</span>
                          {product.compare_price && (
                            <span className="text-gray-400 text-xs line-through">{formatCFA(product.compare_price)}</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href={`/products/${product.id}`} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        <Image src={product.thumbnail} alt={product.name} width={96} height={96} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-chapchap-muted">{product.shop.name}</p>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-chapchap-secondary dark:text-white hover:text-chapchap-primary transition-colors mt-0.5">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1 my-1">
                          <Star size={12} className="text-chapchap-accent fill-current" />
                          <span className="text-xs font-semibold">{product.rating}</span>
                          <span className="text-2xs text-chapchap-muted">({product.reviews} avis)</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-chapchap-primary">{formatCFA(product.price)}</span>
                            {product.compare_price && <span className="text-sm text-gray-400 line-through">{formatCFA(product.compare_price)}</span>}
                          </div>
                          <button onClick={() => addToCart(product as any)} className="btn-primary btn-sm gap-1">
                            <ShoppingCart size={14} /> Ajouter
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state py-24">
                <div className="empty-state-icon">🔍</div>
                <h3 className="text-xl font-bold text-chapchap-secondary dark:text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-chapchap-muted">Essayez avec d&apos;autres mots-clés ou filtres</p>
                <button onClick={() => router.push('/products')} className="btn-outline mt-4">Réinitialiser les filtres</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
