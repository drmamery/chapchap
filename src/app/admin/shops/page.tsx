'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Eye, Ban, Star, MapPin, Package } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOCK_SHOPS = [
  { id: 'shop-001', name: 'TechZone Bouaké', owner: 'Koné Amadou', category: 'Électronique', status: 'active', is_verified: true, rating: 4.7, products: 45, total_sales: 89, created_at: '2024-12-01', location: 'Commerce, Bouaké' },
  { id: 'shop-002', name: 'Fashion Wax by Fatou', owner: 'Traoré Fatou', category: 'Mode', status: 'active', is_verified: true, rating: 4.9, products: 78, total_sales: 156, created_at: '2024-11-15', location: 'Koko, Bouaké' },
  { id: 'shop-003', name: 'Saveurs du Centre', owner: 'Coulibaly Ibrahim', category: 'Alimentation', status: 'active', is_verified: true, rating: 4.5, products: 32, total_sales: 67, created_at: '2024-10-20', location: 'Kennedy, Bouaké' },
  { id: 'shop-004', name: 'ElecSud Bouaké', owner: 'Diomandé Seydou', category: 'Électronique', status: 'pending_review', is_verified: false, rating: 0, products: 0, total_sales: 0, created_at: '2025-01-15', location: 'Air France, Bouaké' },
  { id: 'shop-005', name: 'Bijoux Fatima CI', owner: 'Koné Fatima', category: 'Mode', status: 'pending_review', is_verified: false, rating: 0, products: 0, total_sales: 0, created_at: '2025-01-14', location: 'Gonfreville, Bouaké' },
  { id: 'shop-006', name: 'Agri-Plus Centre', owner: 'Traoré Mamadou', category: 'Agriculture', status: 'suspended', is_verified: false, rating: 3.2, products: 8, total_sales: 12, created_at: '2024-08-10', location: 'Nimbo, Bouaké' },
];

const STATUS_CONFIG = {
  active: { label: 'Active', class: 'badge-success' },
  pending_review: { label: 'En attente', class: 'badge-warning' },
  suspended: { label: 'Suspendue', class: 'badge-danger' },
  closed: { label: 'Fermée', class: 'bg-gray-100 text-gray-600' },
};

export default function AdminShopsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = MOCK_SHOPS.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.owner.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = (shopId: string, name: string) => toast.success(`Boutique "${name}" approuvée ✅`);
  const handleReject = (shopId: string, name: string) => toast.error(`Boutique "${name}" refusée ❌`);
  const handleSuspend = (shopId: string, name: string) => toast.success(`Boutique "${name}" suspendue`);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white">Gestion des boutiques</h1>
            <p className="text-chapchap-muted text-sm mt-1">{MOCK_SHOPS.length} boutiques au total</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: MOCK_SHOPS.length, icon: '🏪' },
            { label: 'Actives', value: MOCK_SHOPS.filter(s => s.status === 'active').length, icon: '✅' },
            { label: 'En attente', value: MOCK_SHOPS.filter(s => s.status === 'pending_review').length, icon: '⏳' },
            { label: 'Suspendues', value: MOCK_SHOPS.filter(s => s.status === 'suspended').length, icon: '🚫' },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <div className="text-xl font-bold text-chapchap-secondary dark:text-white">{stat.value}</div>
                <div className="text-xs text-chapchap-muted">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher boutique ou propriétaire..." className="input pl-10 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="pending_review">En attente</option>
            <option value="suspended">Suspendues</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Boutique</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Produits</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden xl:table-cell">Créée le</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-chapchap-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((shop, i) => (
                  <motion.tr key={shop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-chapchap-secondary dark:text-white">{shop.name}</p>
                          {shop.is_verified && <span className="text-green-600 text-xs">✅</span>}
                        </div>
                        <p className="text-xs text-chapchap-muted">{shop.owner}</p>
                        <p className="text-xs text-chapchap-muted flex items-center gap-1 mt-0.5"><MapPin size={10} />{shop.location}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-chapchap-muted hidden md:table-cell">{shop.category}</td>
                    <td className="px-4 py-4">
                      <span className={STATUS_CONFIG[shop.status as keyof typeof STATUS_CONFIG]?.class}>
                        {STATUS_CONFIG[shop.status as keyof typeof STATUS_CONFIG]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {shop.rating > 0 ? (
                        <span className="flex items-center gap-1 text-sm"><Star size={13} className="text-chapchap-accent fill-current" />{shop.rating}</span>
                      ) : <span className="text-chapchap-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4 text-sm text-chapchap-muted hidden lg:table-cell">
                      <span className="flex items-center gap-1"><Package size={13} />{shop.products}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-chapchap-muted hidden xl:table-cell">{formatDate(shop.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button title="Voir" className="btn-icon p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Eye size={15} /></button>
                        {shop.status === 'pending_review' && (
                          <>
                            <button onClick={() => handleApprove(shop.id, shop.name)} title="Approuver" className="btn-icon p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"><CheckCircle size={15} /></button>
                            <button onClick={() => handleReject(shop.id, shop.name)} title="Refuser" className="btn-icon p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><XCircle size={15} /></button>
                          </>
                        )}
                        {shop.status === 'active' && (
                          <button onClick={() => handleSuspend(shop.id, shop.name)} title="Suspendre" className="btn-icon p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"><Ban size={15} /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
