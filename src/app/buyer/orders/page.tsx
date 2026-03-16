'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Search, Filter, ChevronRight, Clock,
  Truck, CheckCircle, XCircle, RotateCcw, Eye
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatCFA, formatDate, ORDER_STATUS_CONFIG } from '@/lib/utils';

const STATUS_TABS = [
  { key: '', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'preparing', label: 'Préparation' },
  { key: 'shipped', label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
];

const MOCK_ORDERS = [
  {
    id: 'order-001', order_number: 'CC-202501-00001', status: 'delivered',
    total_price: 287000, created_at: '2025-01-10T10:30:00Z',
    shop: { name: 'TechZone Bouaké', logo: null },
    items: [{ name: 'Samsung Galaxy A55 5G', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', quantity: 1 }],
    tracking_code: 'TRKORDER001',
  },
  {
    id: 'order-002', order_number: 'CC-202501-00002', status: 'shipped',
    total_price: 36500, created_at: '2025-01-13T14:00:00Z',
    shop: { name: 'Fashion Wax by Fatou', logo: null },
    items: [{ name: 'Robe Pagne Wax Africain', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100', quantity: 1 }],
    tracking_code: 'TRKORDER002',
  },
  {
    id: 'order-003', order_number: 'CC-202501-00003', status: 'pending',
    total_price: 9000, created_at: '2025-01-15T08:00:00Z',
    shop: { name: 'Saveurs du Centre', logo: null },
    items: [
      { name: 'Attiéké Frais 1kg', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100', quantity: 3 },
      { name: 'Épices Mélange', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100', quantity: 1 },
    ],
    tracking_code: 'TRKORDER003',
  },
];

export default function BuyerOrdersPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = MOCK_ORDERS.filter(order => {
    if (activeStatus && order.status !== activeStatus) return false;
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white mb-6">
          Mes commandes
        </h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro de commande..."
            className="input pl-10 text-sm"
          />
        </div>

        {/* Status tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeStatus === tab.key
                  ? 'bg-chapchap-primary text-white shadow-chapchap'
                  : 'bg-white dark:bg-gray-800 text-chapchap-muted hover:text-chapchap-secondary dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {filteredOrders.map((order, i) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-chapchap-primary">{order.order_number}</span>
                    <span className={`${ORDER_STATUS_CONFIG[order.status]?.bgColor} ${ORDER_STATUS_CONFIG[order.status]?.color} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                      {statusConfig?.icon} {statusConfig?.label}
                    </span>
                  </div>
                  <span className="text-xs text-chapchap-muted">{formatDate(order.created_at)}</span>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, j) => (
                        <div key={j} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-50">
                          <Image src={item.image} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-chapchap-secondary dark:text-white truncate">
                        {order.items[0].name}
                        {order.items.length > 1 && ` + ${order.items.length - 1} autre${order.items.length > 2 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-chapchap-muted mt-0.5">{order.shop.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-chapchap-secondary dark:text-white">{formatCFA(order.total_price)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
                  {order.tracking_code && (
                    <span className="text-xs text-chapchap-muted flex items-center gap-1">
                      <Package size={12} /> Suivi: <span className="font-mono font-bold text-chapchap-primary">{order.tracking_code}</span>
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {order.status === 'delivered' && (
                      <button className="btn-outline btn-sm text-xs gap-1">
                        <RotateCcw size={12} /> Retour
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="text-xs text-red-500 hover:underline font-medium">Annuler</button>
                    )}
                    <Link href={`/buyer/orders/${order.id}`} className="btn-primary btn-sm text-xs gap-1">
                      <Eye size={12} /> Détails
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="empty-state py-16">
              <div className="empty-state-icon">📦</div>
              <h3 className="text-lg font-bold text-chapchap-secondary dark:text-white mb-2">
                {activeStatus ? 'Aucune commande dans cette catégorie' : 'Aucune commande'}
              </h3>
              <p className="text-chapchap-muted mb-4">Commencez à acheter sur ChapChap !</p>
              <Link href="/products" className="btn-primary">Découvrir les produits</Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
