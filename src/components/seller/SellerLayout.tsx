'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Store, Star,
  MessageSquare, Settings, LogOut, Bell, Tag, Menu, X,
  TrendingUp, PlusCircle, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store';

const NAV_ITEMS = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/orders', label: 'Commandes', icon: ShoppingBag, badge: 3 },
  { href: '/seller/products', label: 'Mes produits', icon: Package },
  { href: '/seller/products/new', label: 'Ajouter produit', icon: PlusCircle },
  { href: '/seller/shop', label: 'Ma boutique', icon: Store },
  { href: '/seller/promotions', label: 'Promotions', icon: Tag },
  { href: '/seller/analytics', label: 'Statistiques', icon: TrendingUp },
  { href: '/seller/reviews', label: 'Avis clients', icon: Star },
  { href: '/seller/messages', label: 'Messages', icon: MessageSquare, badge: 2 },
  { href: '/seller/settings', label: 'Paramètres', icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-chapchap rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-chapchap-secondary dark:text-white">
              Chap<span className="text-chapchap-primary">Chap</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Shop info */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-chapchap flex items-center justify-center text-white text-lg flex-shrink-0">
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-chapchap-secondary dark:text-white truncate">
                {user?.name || 'Ma Boutique'}
              </p>
              <span className="badge-success text-2xs">✅ Boutique active</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link ${isActive ? 'active' : ''} relative`}
                >
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="badge-primary text-2xs">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-chapchap-muted hover:text-chapchap-secondary hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors">
            ← Retour au site
          </Link>
          <button
            onClick={() => { logout(); router.push('/auth/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/seller/orders?status=pending" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
