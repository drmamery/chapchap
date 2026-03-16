'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Bell, User, Menu, X, Sun, Moon,
  ChevronDown, MapPin, Heart, Package, LogOut, Settings,
  Store, LayoutDashboard, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useNotifications } from '@/hooks/useNotifications';
import { useClickOutside } from '@/hooks/useClickOutside';
import { formatCFA } from '@/lib/utils';

const CATEGORIES_NAV = [
  { name: 'Électronique', href: '/products?category=electronique', icon: '📱' },
  { name: 'Mode & Vêtements', href: '/products?category=mode-vetements', icon: '👗' },
  { name: 'Alimentation', href: '/products?category=alimentation', icon: '🥘' },
  { name: 'Beauté & Santé', href: '/products?category=beaute-sante', icon: '💄' },
  { name: 'Maison & Déco', href: '/products?category=maison-deco', icon: '🏠' },
  { name: 'Auto & Moto', href: '/products?category=auto-moto', icon: '🚗' },
  { name: 'Agriculture', href: '/products?category=agriculture', icon: '🌾' },
  { name: 'Sport & Loisirs', href: '/products?category=sport-loisirs', icon: '⚽' },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(categoriesRef, () => setCategoriesOpen(false));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-chapchap-secondary text-white text-xs py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> Livraison à Bouaké et région
            </span>
            <span>📞 +225 XX XX XX XX</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <Link href="/seller/info" className="hover:text-white transition-colors">Vendre sur ChapChap</Link>
            <span>·</span>
            <Link href="/help" className="hover:text-white transition-colors">Aide</Link>
            <span>·</span>
            <Link href="/track" className="hover:text-white transition-colors">Suivre ma commande</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-chapchap-secondary/95 backdrop-blur-xl shadow-md' 
          : 'bg-white dark:bg-chapchap-secondary'
      } border-b border-gray-100 dark:border-gray-700`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-chapchap rounded-xl flex items-center justify-center shadow-chapchap group-hover:shadow-chapchap-lg transition-shadow">
                <span className="text-white font-display font-bold text-lg">C</span>
              </div>
              <span className="font-display font-bold text-2xl text-chapchap-secondary dark:text-white hidden sm:block">
                Chap<span className="text-chapchap-primary">Chap</span>
              </span>
            </Link>

            {/* Categories dropdown */}
            <div ref={categoriesRef} className="relative hidden md:block">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-chapchap-secondary dark:text-gray-200 hover:text-chapchap-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Menu size={16} />
                Catégories
                <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {CATEGORIES_NAV.map((cat, i) => (
                      <Link
                        key={i}
                        href={cat.href}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-chapchap-light dark:hover:bg-gray-700 transition-colors text-chapchap-secondary dark:text-gray-200"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="search"
                  placeholder="Rechercher produits, boutiques..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-chapchap-secondary dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-chapchap-primary/30 focus:border-chapchap-primary focus:bg-white dark:focus:bg-gray-700 transition-all"
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              
              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-icon text-gray-600 dark:text-gray-300 hover:text-chapchap-primary hover:bg-orange-50 dark:hover:bg-gray-800 md:hidden"
              >
                <Search size={20} />
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-icon text-gray-600 dark:text-gray-300 hover:text-chapchap-primary hover:bg-orange-50 dark:hover:bg-gray-800 hidden sm:flex"
                title="Basculer le thème"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              {user && (
                <Link href="/buyer/wishlist" className="btn-icon text-gray-600 dark:text-gray-300 hover:text-chapchap-primary hover:bg-orange-50 dark:hover:bg-gray-800 hidden sm:flex relative">
                  <Heart size={20} />
                </Link>
              )}

              {/* Notifications */}
              {user && (
                <Link href="/buyer/notifications" className="btn-icon text-gray-600 dark:text-gray-300 hover:text-chapchap-primary hover:bg-orange-50 dark:hover:bg-gray-800 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-chapchap-primary text-white text-2xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="btn-icon text-gray-600 dark:text-gray-300 hover:text-chapchap-primary hover:bg-orange-50 dark:hover:bg-gray-800 relative">
                <ShoppingCart size={20} />
                {cart.item_count > 0 && (
                  <motion.span
                    key={cart.item_count}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-chapchap-primary text-white text-2xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cart.item_count > 99 ? '99+' : cart.item_count}
                  </motion.span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-chapchap flex items-center justify-center text-white font-bold text-sm">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        user.name[0].toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-chapchap-secondary dark:text-white hidden lg:block max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform hidden lg:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-chapchap-secondary dark:text-white">{user.name}</p>
                          <p className="text-xs text-chapchap-muted">{user.email}</p>
                          <span className="badge-primary mt-1 text-2xs">
                            {user.role === 'buyer' ? 'Acheteur' : user.role === 'seller' ? 'Vendeur' : 'Admin'}
                          </span>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                          {user.role === 'buyer' && (
                            <>
                              <UserMenuItem href="/buyer/orders" icon={<Package size={16} />} label="Mes commandes" />
                              <UserMenuItem href="/buyer/wishlist" icon={<Heart size={16} />} label="Ma wishlist" />
                              <UserMenuItem href="/buyer/messages" icon={<MessageSquare size={16} />} label="Messages" />
                              <UserMenuItem href="/buyer/profile" icon={<User size={16} />} label="Mon profil" />
                            </>
                          )}
                          {user.role === 'seller' && (
                            <>
                              <UserMenuItem href="/seller/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard vendeur" />
                              <UserMenuItem href="/seller/orders" icon={<Package size={16} />} label="Commandes" />
                              <UserMenuItem href="/seller/shop" icon={<Store size={16} />} label="Ma boutique" />
                              <UserMenuItem href="/seller/messages" icon={<MessageSquare size={16} />} label="Messages" />
                            </>
                          )}
                          {user.role === 'admin' && (
                            <UserMenuItem href="/admin" icon={<LayoutDashboard size={16} />} label="Admin Dashboard" />
                          )}
                          <UserMenuItem href="/settings" icon={<Settings size={16} />} label="Paramètres" />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                          <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut size={16} /> Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="btn-ghost btn-sm hidden sm:flex">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="btn-primary btn-sm">
                    S&apos;inscrire
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-icon text-gray-600 dark:text-gray-300 md:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 dark:border-gray-700 md:hidden"
            >
              <form onSubmit={handleSearch} className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    className="input pl-10 text-sm"
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 dark:border-gray-700 md:hidden bg-white dark:bg-chapchap-secondary"
            >
              <div className="px-4 py-4 space-y-1">
                {!user ? (
                  <>
                    <Link href="/auth/login" className="block btn-outline w-full mb-2">Connexion</Link>
                    <Link href="/auth/register" className="block btn-primary w-full">S&apos;inscrire</Link>
                  </>
                ) : null}
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-2xs font-bold text-chapchap-muted uppercase tracking-wider px-2 mb-2">Catégories</p>
                  {CATEGORIES_NAV.slice(0, 6).map((cat, i) => (
                    <Link
                      key={i}
                      href={cat.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 text-chapchap-secondary dark:text-gray-200 transition-colors"
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between px-2">
                  <span className="text-sm text-chapchap-muted">Mode sombre</span>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 text-sm font-medium text-chapchap-secondary dark:text-white"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Clair' : 'Sombre'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function UserMenuItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-chapchap-secondary dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-chapchap-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="badge-primary text-2xs">{badge}</span>
      )}
    </Link>
  );
}
