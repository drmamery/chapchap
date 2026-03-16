'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, ShoppingBag, Zap, Star, ArrowRight, ChevronLeft, ChevronRight,
  Shield, Truck, CreditCard, Headphones, MapPin, TrendingUp, Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopCard } from '@/components/shop/ShopCard';
import { FlashSaleTimer } from '@/components/ui/FlashSaleTimer';
import { CategoryGrid } from '@/components/ui/CategoryGrid';
import { formatCFA } from '@/lib/utils';

// Bannières hero
const HERO_SLIDES = [
  {
    id: 1,
    title: 'Bienvenue sur ChapChap',
    subtitle: 'La marketplace de Bouaké',
    description: 'Achetez et vendez des produits locaux en toute sécurité. Paiement Mobile Money, livraison rapide.',
    cta: 'Découvrir les produits',
    ctaLink: '/products',
    bg: 'from-chapchap-primary via-chapchap-orange-600 to-chapchap-orange-800',
    accent: '#FFD700',
    emoji: '🛒',
    image: null,
  },
  {
    id: 2,
    title: 'Vendez sur ChapChap',
    subtitle: 'Ouvrez votre boutique',
    description: 'Rejoignez des centaines de vendeurs et atteignez des milliers de clients dans toute la région.',
    cta: 'Créer ma boutique',
    ctaLink: '/auth/register?role=seller',
    bg: 'from-chapchap-secondary via-blue-900 to-indigo-900',
    accent: '#FF6B2C',
    emoji: '🏪',
    image: null,
  },
  {
    id: 3,
    title: 'Ventes Flash du Jour',
    subtitle: 'Jusqu\'à -50% de réduction',
    description: 'Profitez de nos offres exclusives à durée limitée. Nouveaux deals chaque jour !',
    cta: 'Voir les offres',
    ctaLink: '/products?sort=flash_sale',
    bg: 'from-red-600 via-red-700 to-orange-800',
    accent: '#FFD700',
    emoji: '⚡',
    image: null,
  },
];

const FEATURES = [
  { icon: '🔒', title: 'Paiement sécurisé', desc: 'Orange Money, MTN MoMo, Wave & Stripe' },
  { icon: '🚚', title: 'Livraison rapide', desc: 'Dans tout Bouaké et la région' },
  { icon: '⭐', title: 'Vendeurs vérifiés', desc: 'Boutiques contrôlées par ChapChap' },
  { icon: '💬', title: 'Support 24/7', desc: 'Chat, email et téléphone' },
];

const STATS = [
  { value: '500+', label: 'Vendeurs actifs', icon: '🏪' },
  { value: '10K+', label: 'Produits disponibles', icon: '📦' },
  { value: '50K+', label: 'Clients satisfaits', icon: '😊' },
  { value: '4.8/5', label: 'Note moyenne', icon: '⭐' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <MainLayout>
      {/* ============================
          HERO
          ============================ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[75vh] md:min-h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
          />
        </AnimatePresence>

        {/* Motif africain en arrière-plan */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 20c-5.5 0-10-4.5-10-10S14.5 0 20 0s10 4.5 10 10-4.5 10-10 10zm0-3a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[75vh] md:min-h-[80vh] text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6 text-white text-sm font-semibold"
          >
            <span className="text-lg">{slide.emoji}</span>
            {slide.subtitle}
          </motion.div>

          {/* Titre */}
          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl xl:text-7xl font-display font-bold text-white mb-4 leading-tight max-w-4xl"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl"
          >
            {slide.description}
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="w-full max-w-2xl mb-8"
          >
            <div className={`flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isSearchFocused ? 'ring-4 ring-white/50 scale-105' : ''}`}>
              <Search className="ml-5 text-gray-400 flex-shrink-0" size={22} />
              <input
                type="search"
                placeholder="Rechercher des produits, boutiques..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 px-4 py-4 text-gray-800 text-base outline-none font-body"
              />
              <button
                type="submit"
                className="btn-primary rounded-l-none rounded-r-2xl px-6 py-4 text-base"
              >
                Rechercher
              </button>
            </div>
            {/* Tags populaires */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {['Samsung', 'Pagne Wax', 'Attiéké', 'Ordinateur', 'Cosmétiques'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setSearchQuery(tag); }}
                  className="text-white/80 text-xs bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 backdrop-blur-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.form>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href={slide.ctaLink} className="btn-gold btn-lg">
              {slide.cta}
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/register" className="btn-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-2xl px-8 py-4 font-semibold transition-all inline-flex items-center gap-2">
              Créer un compte gratuit
            </Link>
          </motion.div>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-white h-2' : 'w-2 h-2 bg-white/50 hover:bg-white/70'}`}
            />
          ))}
        </div>

        {/* Slide arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>

        {/* Courbe du bas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="rgb(255 247 243 / 1)" className="fill-chapchap-light dark:fill-chapchap-dark" />
          </svg>
        </div>
      </section>

      {/* ============================
          STATS
          ============================ */}
      <section className="py-8 bg-chapchap-light dark:bg-chapchap-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-display font-bold text-chapchap-primary">{stat.value}</div>
                <div className="text-sm text-chapchap-muted mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          CATÉGORIES
          ============================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div>
              <h2 className="section-title">Catégories</h2>
              <p className="text-chapchap-muted mt-1">Explorez tous nos produits</p>
            </div>
            <Link href="/products" className="btn-outline btn-sm hidden sm:flex">
              Voir tout <ArrowRight size={16} />
            </Link>
          </motion.div>
          <CategoryGrid />
        </div>
      </section>

      {/* ============================
          VENTE FLASH
          ============================ */}
      <section className="py-12 bg-gradient-to-br from-chapchap-secondary to-blue-900 dark:from-gray-900 dark:to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-chapchap-primary text-3xl">⚡</span>
                <h2 className="text-3xl font-display font-bold text-white">Ventes Flash</h2>
                <span className="badge bg-chapchap-primary text-white animate-pulse">LIVE</span>
              </div>
              <p className="text-white/60">Offres exclusives à durée limitée</p>
            </div>
            <div className="flex items-center gap-4">
              <FlashSaleTimer endTime={new Date(Date.now() + 4 * 60 * 60 * 1000)} />
              <Link href="/products?sort=flash_sale" className="btn-primary hidden sm:flex">
                Tout voir <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Produits flash sale - mocked */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Samsung Galaxy A55', price: 256500, original: 285000, discount: 10, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
              { name: 'Robe Pagne Wax', price: 29750, original: 35000, discount: 15, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400' },
              { name: 'Attiéké Frais 1kg', price: 1425, original: 1500, discount: 5, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
              { name: 'Chargeur 65W USB-C', price: 6800, original: 8500, discount: 20, img: 'https://images.unsplash.com/photo-1593941707882-a5bfad826e3?w=400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-interactive bg-white dark:bg-gray-800 group"
              >
                <div className="relative overflow-hidden aspect-square bg-gray-50">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 badge bg-chapchap-primary text-white text-xs font-bold animate-pulse">
                    -{item.discount}%
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-chapchap-secondary dark:text-white line-clamp-2 mb-2">{item.name}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-chapchap-primary font-bold font-display">{formatCFA(item.price)}</span>
                    <span className="text-gray-400 text-xs line-through">{formatCFA(item.original)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          PRODUITS POPULAIRES
          ============================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-chapchap-primary" size={20} />
                <h2 className="section-title">Produits Populaires</h2>
              </div>
              <p className="text-chapchap-muted">Les plus vendus en ce moment</p>
            </div>
            <Link href="/products" className="btn-outline btn-sm hidden sm:flex">
              Voir tout <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCardSkeleton />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          BOUTIQUES VEDETTES
          ============================ */}
      <section className="py-12 bg-gradient-warm dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏪</span>
                <h2 className="section-title">Boutiques Vedettes</h2>
              </div>
              <p className="text-chapchap-muted">Vendeurs vérifiés et recommandés</p>
            </div>
            <Link href="/shops" className="btn-outline btn-sm hidden sm:flex">
              Toutes les boutiques <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'TechZone Bouaké',
                category: 'Électronique',
                rating: 4.7,
                reviews: 89,
                products: 45,
                badge: '✅ Vérifié',
                logo: '📱',
              },
              {
                name: 'Fashion Wax by Fatou',
                category: 'Mode & Vêtements',
                rating: 4.9,
                reviews: 156,
                products: 78,
                badge: '⭐ Top Vendeur',
                logo: '👗',
              },
              {
                name: 'Saveurs du Centre',
                category: 'Alimentation',
                rating: 4.5,
                reviews: 67,
                products: 32,
                badge: '🌿 Local',
                logo: '🥘',
              },
            ].map((shop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-interactive p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-chapchap flex items-center justify-center text-3xl flex-shrink-0 shadow-chapchap">
                    {shop.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-bold text-chapchap-secondary dark:text-white group-hover:text-chapchap-primary transition-colors">
                        {shop.name}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">{shop.badge}</span>
                    </div>
                    <p className="text-sm text-chapchap-muted mb-2">{shop.category}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-chapchap-accent fill-current" />
                        <span className="font-semibold">{shop.rating}</span>
                        <span className="text-chapchap-muted">({shop.reviews})</span>
                      </div>
                      <span className="text-chapchap-muted">·</span>
                      <span className="text-chapchap-muted">{shop.products} produits</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-chapchap-muted flex items-center gap-1">
                    <MapPin size={12} /> Bouaké, CI
                  </span>
                  <Link href={`/shops/${i + 1}`} className="text-chapchap-primary text-sm font-semibold hover:underline flex items-center gap-1">
                    Visiter <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          FONCTIONNALITÉS
          ============================ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-3">Pourquoi ChapChap ?</h2>
            <p className="text-chapchap-muted max-w-xl mx-auto">
              La marketplace conçue pour Bouaké, avec des solutions de paiement et de livraison adaptées à la Côte d&apos;Ivoire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center hover:shadow-chapchap hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display font-bold text-chapchap-secondary dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-chapchap-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          CTA VENDEUR
          ============================ */}
      <section className="py-16 bg-gradient-chapchap">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Vendez sur ChapChap
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté de vendeurs et développez votre business. 
              Inscription gratuite, sans abonnement mensuel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=seller" className="btn-gold btn-lg">
                Ouvrir ma boutique gratuitement
                <ArrowRight size={20} />
              </Link>
              <Link href="/seller/info" className="btn-lg bg-white/20 backdrop-blur-sm text-white border border-white/40 hover:bg-white/30 rounded-2xl px-8 py-4 font-semibold transition-all inline-flex items-center gap-2">
                En savoir plus
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-6">
              ✓ Gratuit · ✓ Sans commission cachée · ✓ Support dédié · ✓ Paiements sécurisés
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================
          VILLES DESSERVIES
          ============================ */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-2">Zones de livraison</h2>
          <p className="text-chapchap-muted mb-8">Nous livrons dans toute la région</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Bouaké', 'Sakassou', 'Béoumi', 'Brobo', 'Tiébissou', 'Botro', 'Djébonoua', 'Diabo'].map(city => (
              <span key={city} className="flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full px-4 py-2 text-sm font-medium shadow-sm border border-gray-100 dark:border-gray-700">
                <MapPin size={14} className="text-chapchap-primary" />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

// Skeleton card temporaire (sera remplacé par ProductCard réel)
function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-2/3 rounded" />
      </div>
    </div>
  );
}
