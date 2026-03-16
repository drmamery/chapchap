'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag,
  Shield, Settings, LogOut, Bell, BarChart2, Tag,
  Truck, MessageSquare, Menu, X, ChevronRight, Activity
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Tableau de bord',
    items: [
      { href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytiques', icon: BarChart2 },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { href: '/admin/users', label: 'Utilisateurs', icon: Users, badge: 12 },
      { href: '/admin/shops', label: 'Boutiques', icon: Store, badge: 3 },
      { href: '/admin/products', label: 'Produits', icon: Package },
      { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag, badge: 8 },
      { href: '/admin/deliveries', label: 'Livraisons', icon: Truck },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { href: '/admin/promotions', label: 'Promotions', icon: Tag },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: 5 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/admin/security', label: 'Sécurité & Audit', icon: Shield },
      { href: '/admin/settings', label: 'Paramètres', icon: Settings },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Vérifier que l'admin est connecté
    if (!user || user.role !== 'admin') {
      router.push('/auth/login?redirect=/admin');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chapchap-dark">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-chapchap-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Vérification des droits d&apos;accès...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        bg-chapchap-secondary dark:bg-gray-900 border-r border-gray-700 dark:border-gray-800
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-700 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-chapchap rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-display font-bold text-white">
              Chap<span className="text-chapchap-primary">Chap</span>
              <span className="text-gray-400 text-xs ml-1">Admin</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-chapchap flex items-center justify-center flex-shrink-0">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt="" className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{user.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Activity size={10} className="text-green-400" />
                <span className="text-green-400 text-2xs">Administrateur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i}>
              <p className="text-2xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                        isActive
                          ? 'bg-chapchap-primary text-white shadow-chapchap'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon size={17} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-chapchap-primary text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-700 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 text-sm transition-colors">
            <span>←</span> Retour au site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 text-sm transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-800 dark:text-white font-medium capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
