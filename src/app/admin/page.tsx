'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Store, ShoppingBag, TrendingUp, AlertTriangle, Shield,
  Download, Bell, CheckCircle, XCircle, Eye, Ban, Trash2,
  RefreshCw, Search, Filter, ChevronDown, ArrowUp, ArrowDown,
  Package, CreditCard, Star, MapPin, Clock, Zap, Activity
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCFA } from '@/lib/utils';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 4500000, orders: 89 },
  { month: 'Fév', revenue: 5200000, orders: 102 },
  { month: 'Mar', revenue: 4800000, orders: 95 },
  { month: 'Avr', revenue: 6100000, orders: 124 },
  { month: 'Mai', revenue: 5700000, orders: 118 },
  { month: 'Jun', revenue: 7200000, orders: 145 },
  { month: 'Jul', revenue: 6800000, orders: 137 },
  { month: 'Aoû', revenue: 8100000, orders: 162 },
];

const categoryData = [
  { name: 'Électronique', value: 35, color: '#FF6B2C' },
  { name: 'Mode', value: 28, color: '#FFD700' },
  { name: 'Alimentation', value: 18, color: '#10B981' },
  { name: 'Beauté', value: 12, color: '#8B5CF6' },
  { name: 'Autres', value: 7, color: '#6B7280' },
];

const orderStatusData = [
  { status: 'Livrées', count: 1248, color: '#10B981' },
  { status: 'En cours', count: 342, color: '#FF6B2C' },
  { status: 'En attente', count: 89, color: '#F59E0B' },
  { status: 'Annulées', count: 34, color: '#EF4444' },
];

const STATS = [
  { label: 'Chiffre d\'affaires', value: formatCFA(52450000), change: '+18.3%', up: true, icon: '💰', color: 'from-orange-400 to-orange-600' },
  { label: 'Commandes totales', value: '1,713', change: '+12.5%', up: true, icon: '📦', color: 'from-blue-400 to-blue-600' },
  { label: 'Utilisateurs actifs', value: '4,892', change: '+8.2%', up: true, icon: '👥', color: 'from-purple-400 to-purple-600' },
  { label: 'Boutiques actives', value: '247', change: '+5.1%', up: true, icon: '🏪', color: 'from-green-400 to-green-600' },
  { label: 'Produits listés', value: '12,348', change: '+22.7%', up: true, icon: '🛍️', color: 'from-yellow-400 to-yellow-600' },
  { label: 'Note moyenne', value: '4.7/5', change: '+0.2', up: true, icon: '⭐', color: 'from-red-400 to-red-600' },
];

const RECENT_ORDERS = [
  { id: 'CC-202501-00123', buyer: 'Diabaté Marie', shop: 'TechZone', amount: 287000, status: 'delivered', date: '15 jan. 2025' },
  { id: 'CC-202501-00124', buyer: 'Ouattara Jean', shop: 'Fashion Wax', amount: 36500, status: 'shipped', date: '15 jan. 2025' },
  { id: 'CC-202501-00125', buyer: 'Coulibaly Amara', shop: 'Saveurs CI', amount: 9000, status: 'preparing', date: '15 jan. 2025' },
  { id: 'CC-202501-00126', buyer: 'Traoré Fatoumata', shop: 'TechZone', amount: 520000, status: 'pending', date: '14 jan. 2025' },
  { id: 'CC-202501-00127', buyer: 'Koné Bakary', shop: 'Fashion Wax', amount: 55000, status: 'cancelled', date: '14 jan. 2025' },
];

const SECURITY_ALERTS = [
  { type: 'warning', message: '3 tentatives de connexion échouées pour user@test.ci', time: 'il y a 5 min' },
  { type: 'info', message: 'Nouvelle boutique en attente de validation: "ElecSud Bouaké"', time: 'il y a 23 min' },
  { type: 'critical', message: 'Paiement suspect détecté: commande CC-2025-00126', time: 'il y a 1h' },
  { type: 'info', message: '15 nouveaux utilisateurs inscrits aujourd\'hui', time: 'il y a 2h' },
];

const PENDING_SHOPS = [
  { name: 'ElecSud Bouaké', owner: 'Diomandé Seydou', category: 'Électronique', date: 'Aujourd\'hui' },
  { name: 'Bijoux Fatima CI', owner: 'Koné Fatima', category: 'Mode', date: 'Hier' },
  { name: 'Agri-Plus Centre', owner: 'Traoré Mamadou', category: 'Agriculture', date: 'Hier' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  preparing: 'status-preparing',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shops' | 'orders' | 'security'>('overview');
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-chapchap-secondary dark:text-white">
              Dashboard Admin
            </h1>
            <p className="text-chapchap-muted mt-1 flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              Système en ligne · Dernière mise à jour: maintenant
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="input text-sm w-auto px-3 py-2"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">Cette année</option>
            </select>
            <button className="btn-outline btn-sm gap-2">
              <Download size={16} /> Exporter
            </button>
            <button className="btn-primary btn-sm gap-2">
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5 relative overflow-hidden group hover:shadow-chapchap transition-shadow"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-6 -mt-6`} />
              <div className="relative">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-xl font-display font-bold text-chapchap-secondary dark:text-white">{stat.value}</div>
                <div className="text-xs text-chapchap-muted mt-0.5">{stat.label}</div>
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-chapchap-secondary dark:text-white">Évolution du CA</h3>
                <p className="text-sm text-chapchap-muted">Chiffre d'affaires et commandes mensuels</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-chapchap-primary rounded-full" /> CA</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-chapchap-accent rounded-full" /> Commandes</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCFA(value) : value,
                    name === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes'
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B2C" fill="url(#colorRevenue)" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#FFD700" strokeWidth={2} dot={false} yAxisId={1} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="font-display font-bold text-chapchap-secondary dark:text-white mb-1">Ventes par catégorie</h3>
            <p className="text-sm text-chapchap-muted mb-4">Répartition des ventes</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Part']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-chapchap-muted">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-chapchap-secondary dark:text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card lg:col-span-2"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-display font-bold text-chapchap-secondary dark:text-white">Commandes récentes</h3>
              <button className="text-chapchap-primary text-sm font-semibold hover:underline">Voir tout</button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {RECENT_ORDERS.map((order, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-chapchap-primary">{order.id}</span>
                      <span className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <p className="text-sm text-chapchap-secondary dark:text-white mt-0.5">
                      {order.buyer} · <span className="text-chapchap-muted">{order.shop}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-chapchap-secondary dark:text-white">{formatCFA(order.amount)}</p>
                    <p className="text-xs text-chapchap-muted">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn-icon text-blue-500 hover:bg-blue-50 p-2"><Eye size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Alerts & Pending Shops */}
          <div className="space-y-6">
            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Shield size={16} className="text-chapchap-primary" />
                <h3 className="font-semibold text-chapchap-secondary dark:text-white">Alertes Sécurité</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {SECURITY_ALERTS.map((alert, i) => (
                  <div key={i} className="p-3 flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      alert.type === 'critical' ? 'bg-red-500 animate-pulse' :
                      alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-xs text-chapchap-secondary dark:text-white">{alert.message}</p>
                      <p className="text-2xs text-chapchap-muted mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending Shops */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-chapchap-primary" />
                  <h3 className="font-semibold text-chapchap-secondary dark:text-white">Boutiques à valider</h3>
                </div>
                <span className="badge-warning">{PENDING_SHOPS.length}</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {PENDING_SHOPS.map((shop, i) => (
                  <div key={i} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-chapchap-secondary dark:text-white">{shop.name}</p>
                        <p className="text-xs text-chapchap-muted">{shop.owner} · {shop.category}</p>
                        <p className="text-2xs text-chapchap-muted mt-0.5">{shop.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="btn-icon text-green-600 hover:bg-green-50 p-1.5">
                          <CheckCircle size={16} />
                        </button>
                        <button className="btn-icon text-red-500 hover:bg-red-50 p-1.5">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <button className="text-chapchap-primary text-sm font-semibold hover:underline w-full text-center">
                  Gérer toutes les boutiques
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="font-display font-bold text-chapchap-secondary dark:text-white mb-6">
            Distribution des statuts de commandes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {orderStatusData.map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl" style={{ backgroundColor: item.color + '15' }}>
                <div className="text-3xl font-display font-bold" style={{ color: item.color }}>{item.count}</div>
                <div className="text-sm text-chapchap-muted mt-1">{item.status}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={orderStatusData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {orderStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
