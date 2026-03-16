'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/products', label: 'Explorer', icon: Search },
  { href: '/cart', label: 'Panier', icon: ShoppingCart, showBadge: true },
  { href: '/buyer/wishlist', label: 'Favoris', icon: Heart },
  { href: '/buyer/profile', label: 'Profil', icon: User, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const { user } = useAuthStore();
  const cartCount = getItemCount();

  // Ne pas afficher sur les pages admin/seller
  if (pathname.startsWith('/admin') || pathname.startsWith('/seller')) return null;

  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const href = item.authRequired && !user ? '/auth/login' : item.href;

        return (
          <Link key={item.href} href={href} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.showBadge && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-chapchap-primary text-white text-2xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </div>
            <span className="text-2xs font-medium mt-0.5">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute top-0 inset-x-1 h-0.5 bg-chapchap-primary rounded-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
