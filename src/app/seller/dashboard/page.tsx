'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Package, TrendingUp, ShoppingBag, Star, ArrowUp, ArrowDown,
  Plus, Eye, Edit, Bell, MessageSquare, Clock, Zap,
  CheckCircle, XCircle, Truck
} from 'lucide-react';
import Link from 'next/link';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { formatCFA, formatTimeAgo, ORDER_STATUS_CONFIG } from '@/lib/utils';

const salesData = [
  { day: 'Lun', revenue: 45000, orders: 3 },
  { day: 'Mar', revenue: 89000, orders: 6 },
  { day: 'Mer', revenue: 32000, orders: 2 },
  { day: 'Jeu', revenue: 125000, orders: 8 },
  { day: 'Ven', revenue: 98000, orders: 7 },
  { day: 'Sam', revenue: 215000, orders: 14 },
  { day: 'Dim', revenue: 180000, orders: 11 },
];

const STATS = [
  { label: 'CA ce mois', value: formatCFA(1845000), change: '+23.4%', up: true, icon: '💰', color: 'bg-orange-100 text-orange-700' },
  { label: 'Commandes', value: '51', change: '+8', up: true, icon: '📦', color: 'bg-blue-100 text-blue-700' },
  { label: 'Produits actifs', value: '24', change: '+3', up: true, icon: '🛍️', color: 'bg-purple-100 text-purple-700' },
  { label: 'Note boutique', value: '4.7 ⭐', change: '+0.1', up: true, icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
];

const RECENT_ORDERS = [
  { id: 'ord-1', number: 'CC-202501-00125', customer: 'Diabaté Marie', product: 'Samsung Galaxy A55', amount: 287000, status: 'preparing', time: '2h' },
  { id: 'ord-2', number: 'CC-202501-00126', customer: 'Ouattara Jean', product: 'iPhone 15', amount: 520000, status: 'pending', time: '4h' },
  { id: 'ord-3', number: 'CC-202501-00127', customer: 'Koné Bakary', product: 'Chargeur 65W', amount: 8500, status: 'shipped', time: '1j' },
  { id: 'ord-4', number: 'CC-202501-00128', customer: 'Traoré Amina', product: 'Laptop Asus', amount: 420000, status: 'delivered', time: '2j' },
];

const LOW_STOCK = [
  { name: 'iPhone 15 - 128Go', stock: 2, threshold: 5 },
  { name: 'Samsung Galaxy A55', stock: 4, threshold: 10 },
  { name: 'Chargeur 65W', stock: 8, threshold: 20 },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week');

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-chapchap-secondary dark:text-white">
              Tableau de bord 👋
            </h1>
            <p className="text-chapchap-muted mt-1">Bienvenue, TechZone Bouaké — Voici vos performances</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/seller/products/new" className="btn-primary gap-2">
              <Plus size={16} /> Ajouter un produit
            </Link>
            <Link href="/seller/orders" className="btn-outline gap-2 relative">
              <Package size={16} /> Commandes
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-2xs rounded-full flex items-center justify-center">3</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-chapchap-muted">{stat.label}</p>
                  <p className="text-xl font-display font-bold text-chapchap-secondary dark:text-white mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-semibold mt-1.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                    {stat.change}
                    <span className="text-chapchap-muted font-normal">ce mois</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-chapchap-secondary dark:text-white">Ventes de la semaine</h3>
                <p className="text-sm text-chapchap-muted">Chiffre d'affaires et commandes</p>
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                {(['week', 'month', 'year'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === tab ? 'bg-white dark:bg-gray-600 text-chapchap-primary shadow-sm' : 'text-chapchap-muted'
                    }`}
                  >
                    {tab === 'week' ? '7j' : tab === 'month' ? '30j' : '1an'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="sellRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCFA(v), 'CA']} />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B2C" fill="url(#sellRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Stats */}
          <div className="space-y-4">
            {/* Pending actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3 flex items-center gap-2">
                <Bell size={16} className="text-chapchap-primary" /> Actions requises
              </h3>
              <div className="space-y-2">
                <Link href="/seller/orders?status=pending" className="flex items-center justify-between p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 transition-colors">
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Commandes en attente</span>
                  <span className="badge bg-yellow-200 text-yellow-800 text-xs font-bold">2</span>
                </Link>
                <Link href="/seller/reviews" className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Avis sans réponse</span>
                  <span className="badge bg-blue-200 text-blue-800 text-xs font-bold">5</span>
                </Link>
                <Link href="/seller/messages" className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Messages non lus</span>
                  <span className="badge bg-purple-200 text-purple-800 text-xs font-bold">3</span>
                </Link>
              </div>
            </motion.div>

            {/* Low Stock Alert */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3 flex items-center gap-2">
                <Zap size={16} className="text-red-500" /> Stock faible
              </h3>
              <div className="space-y-2">
                {LOW_STOCK.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-chapchap-muted truncate flex-1">{item.name}</span>
                    <span className={`badge ml-2 flex-shrink-0 ${item.stock <= 3 ? 'badge-danger' : 'badge-warning'}`}>
                      {item.stock} restant{item.stock > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/seller/products" className="text-chapchap-primary text-xs font-semibold mt-3 block hover:underline">
                Gérer le stock →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-display font-bold text-chapchap-secondary dark:text-white">Commandes récentes</h3>
            <Link href="/seller/orders" className="text-chapchap-primary text-sm font-semibold hover:underline">
              Voir toutes →
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {RECENT_ORDERS.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-chapchap flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {order.customer[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-chapchap-muted">{order.number}</span>
                    <span className={`status-${order.status}`}>
                      {ORDER_STATUS_CONFIG[order.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-chapchap-secondary dark:text-white mt-0.5">
                    {order.customer} — <span className="text-chapchap-muted">{order.product}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-chapchap-secondary dark:text-white">{formatCFA(order.amount)}</p>
                  <p className="text-xs text-chapchap-muted">il y a {order.time}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {order.status === 'pending' && (
                    <>
                      <button className="btn-icon text-green-600 hover:bg-green-50 p-2" title="Accepter">
                        <CheckCircle size={16} />
                      </button>
                      <button className="btn-icon text-red-500 hover:bg-red-50 p-2" title="Refuser">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button className="btn-icon text-blue-600 hover:bg-blue-50 p-2" title="Marquer en préparation">
                      <Package size={16} />
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn-icon text-indigo-600 hover:bg-indigo-50 p-2" title="Marquer expédiée">
                      <Truck size={16} />
                    </button>
                  )}
                  <Link href={`/seller/orders/${order.id}`} className="btn-icon text-gray-400 hover:bg-gray-50 p-2">
                    <Eye size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SellerLayout>
  );
}
