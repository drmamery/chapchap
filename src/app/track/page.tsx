'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, QrCode } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatDateTime, formatCFA, ORDER_STATUS_CONFIG } from '@/lib/utils';

const TRACKING_STEPS = [
  { status: 'pending', label: 'Commande reçue', icon: '📋', done: true, time: '15 Jan 2025, 08:30' },
  { status: 'confirmed', label: 'Commande confirmée', icon: '✅', done: true, time: '15 Jan 2025, 09:15' },
  { status: 'preparing', label: 'En préparation', icon: '📦', done: true, time: '15 Jan 2025, 10:00' },
  { status: 'shipped', label: 'Expédiée', icon: '🚚', done: false, time: null },
  { status: 'delivered', label: 'Livrée', icon: '🎉', done: false, time: null },
];

const MOCK_TRACKED_ORDER = {
  order_number: 'CC-202501-00001',
  status: 'preparing',
  total_price: 287000,
  created_at: '2025-01-15T08:30:00Z',
  tracking_code: 'TRKORDER001',
  delivery_code: '123456',
  shop: { name: 'TechZone Bouaké', phone: '+225 07 12 34 56' },
  items: [{ name: 'Samsung Galaxy A55 5G - 128Go', quantity: 1, price: 285000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80' }],
  shipping_address: { name: 'Diabaté Marie', phone: '+225 07 11 22 33', address: 'Quartier Nimbo, Rue 12', city: 'Bouaké' },
  estimated_delivery: '16 Jan 2025',
  courier: null,
};

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<typeof MOCK_TRACKED_ORDER | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setIsLoading(true);
    setNotFound(false);
    await new Promise(r => setTimeout(r, 1200));
    if (trackingCode.toUpperCase() === 'TRKORDER001' || trackingCode === 'CC-202501-00001') {
      setTrackedOrder(MOCK_TRACKED_ORDER);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  };

  const currentStepIndex = TRACKING_STEPS.findIndex(s => s.status === trackedOrder?.status);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📍</div>
          <h1 className="text-3xl font-display font-bold text-chapchap-secondary dark:text-white">Suivre ma commande</h1>
          <p className="text-chapchap-muted mt-2">Entrez votre numéro de commande ou code de suivi</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="card p-6 mb-8">
          <label className="label">Numéro de commande ou code de suivi</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={trackingCode}
                onChange={e => { setTrackingCode(e.target.value); setNotFound(false); }}
                placeholder="CC-202501-00001 ou TRKXXXXX"
                className="input pl-11 font-mono"
              />
            </div>
            <button type="submit" disabled={isLoading || !trackingCode.trim()} className="btn-primary px-6">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Suivre'}
            </button>
          </div>
          <p className="text-xs text-chapchap-muted mt-3">
            💡 Essayez <button type="button" onClick={() => setTrackingCode('TRKORDER001')} className="text-chapchap-primary hover:underline font-mono">TRKORDER001</button> pour une démo
          </p>
        </form>

        {/* Not found */}
        {notFound && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-chapchap-secondary dark:text-white mb-2">Commande introuvable</h3>
            <p className="text-chapchap-muted">Vérifiez votre numéro de commande. Il se trouve dans l&apos;email de confirmation.</p>
          </motion.div>
        )}

        {/* Order found */}
        {trackedOrder && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Status banner */}
            <div className={`card p-6 border-l-4 ${
              trackedOrder.status === 'delivered' ? 'border-green-500' :
              trackedOrder.status === 'shipped' ? 'border-blue-500' :
              trackedOrder.status === 'cancelled' ? 'border-red-500' : 'border-chapchap-primary'
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-chapchap-muted">{trackedOrder.order_number}</span>
                    <span className={`${ORDER_STATUS_CONFIG[trackedOrder.status]?.bgColor} ${ORDER_STATUS_CONFIG[trackedOrder.status]?.color} text-xs font-bold px-3 py-1 rounded-full`}>
                      {ORDER_STATUS_CONFIG[trackedOrder.status]?.icon} {ORDER_STATUS_CONFIG[trackedOrder.status]?.label}
                    </span>
                  </div>
                  <p className="text-2xl font-display font-bold text-chapchap-primary">{formatCFA(trackedOrder.total_price)}</p>
                  <p className="text-sm text-chapchap-muted mt-1">
                    📅 Livraison estimée : <strong>{trackedOrder.estimated_delivery}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-chapchap-muted">Code de suivi</p>
                  <p className="font-mono font-bold text-chapchap-primary">{trackedOrder.tracking_code}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-chapchap-secondary dark:text-white mb-6">Étapes de livraison</h3>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6">
                  {TRACKING_STEPS.map((step, i) => {
                    const isActive = i === currentStepIndex;
                    const isDone = i < currentStepIndex || (currentStepIndex === TRACKING_STEPS.length - 1);
                    return (
                      <motion.div key={step.status} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-4 relative ${!isDone && !isActive ? 'opacity-40' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-lg transition-all ${
                          isDone ? 'bg-green-500 shadow-md' :
                          isActive ? 'bg-chapchap-primary shadow-chapchap animate-pulse' :
                          'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {isDone ? '✓' : step.icon}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`font-semibold text-sm ${isActive ? 'text-chapchap-primary' : isDone ? 'text-green-700 dark:text-green-400' : 'text-chapchap-secondary dark:text-white'}`}>
                            {step.label}
                          </p>
                          {step.time && <p className="text-xs text-chapchap-muted mt-0.5">{step.time}</p>}
                          {isActive && <p className="text-xs text-chapchap-primary font-semibold mt-0.5">En cours...</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Items */}
              <div className="card p-5">
                <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3 flex items-center gap-2">
                  <Package size={16} className="text-chapchap-primary" /> Articles
                </h3>
                {trackedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-chapchap-secondary dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-chapchap-muted text-xs">x{item.quantity} — {formatCFA(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery info */}
              <div className="card p-5">
                <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-chapchap-primary" /> Livraison
                </h3>
                <div className="space-y-2 text-sm text-chapchap-muted">
                  <p><strong className="text-chapchap-secondary dark:text-white">{trackedOrder.shipping_address.name}</strong></p>
                  <p>{trackedOrder.shipping_address.address}</p>
                  <p>{trackedOrder.shipping_address.city}</p>
                  <a href={`tel:${trackedOrder.shipping_address.phone}`} className="flex items-center gap-1 text-chapchap-primary hover:underline">
                    <Phone size={12} /> {trackedOrder.shipping_address.phone}
                  </a>
                </div>
              </div>

              {/* Shop */}
              <div className="card p-5">
                <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3">Vendeur</h3>
                <p className="text-sm font-medium text-chapchap-secondary dark:text-white">{trackedOrder.shop.name}</p>
                <a href={`tel:${trackedOrder.shop.phone}`} className="flex items-center gap-1 text-chapchap-primary hover:underline text-sm mt-1">
                  <Phone size={12} /> {trackedOrder.shop.phone}
                </a>
              </div>

              {/* Delivery code */}
              {trackedOrder.delivery_code && (
                <div className="card p-5">
                  <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-3 flex items-center gap-2">
                    <QrCode size={16} className="text-chapchap-primary" /> Code de confirmation
                  </h3>
                  <p className="text-xs text-chapchap-muted mb-2">Donnez ce code au livreur pour confirmer la réception :</p>
                  <div className="bg-chapchap-primary/10 dark:bg-chapchap-primary/20 rounded-xl p-4 text-center">
                    <p className="text-4xl font-mono font-bold tracking-[0.4em] text-chapchap-primary">
                      {trackedOrder.delivery_code}
                    </p>
                  </div>
                  <p className="text-xs text-red-500 mt-2 text-center">⚠️ Ne partagez ce code qu&apos;au livreur</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
