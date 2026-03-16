'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Package,
  TrendingUp, AlertTriangle, ToggleLeft, ToggleRight, Download
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { formatCFA } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  { id: 'prod-001', name: 'Samsung Galaxy A55 5G - 128Go', price: 285000, stock: 15, status: 'active', orders: 23, views: 456, rating: 4.6, thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80', category: 'Téléphones' },
  { id: 'prod-002', name: 'iPhone 15 - 128Go Noir', price: 520000, stock: 8, status: 'active', orders: 12, views: 312, rating: 4.8, thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80', category: 'Téléphones' },
  { id: 'prod-003', name: 'Laptop Asus VivoBook 15', price: 420000, stock: 5, status: 'active', orders: 8, views: 189, rating: 4.5, thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80', category: 'Ordinateurs' },
  { id: 'prod-004', name: 'Chargeur Rapide 65W USB-C', price: 8500, stock: 0, status: 'out_of_stock', orders: 45, views: 890, rating: 4.3, thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bfad826e3?w=80', category: 'Accessoires' },
  { id: 'prod-005', name: 'Écouteurs Bluetooth TWS Pro', price: 25000, stock: 20, status: 'inactive', orders: 5, views: 78, rating: 4.1, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80', category: 'Accessoires' },
];

const STATUS_CONFIG = {
  active: { label: 'Actif', class: 'badge-success' },
  inactive: { label: 'Inactif', class: 'badge-warning' },
  out_of_stock: { label: 'Rupture', class: 'badge-danger' },
  deleted: { label: 'Supprimé', class: 'bg-gray-100 text-gray-600' },
};

export default function SellerProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = MOCK_PRODUCTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) toast.success('Produit supprimé');
  };

  const handleToggleStatus = (id: string, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    toast.success(`Produit ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
  };

  const totalProducts = MOCK_PRODUCTS.length;
  const activeProducts = MOCK_PRODUCTS.filter(p => p.status === 'active').length;
  const outOfStock = MOCK_PRODUCTS.filter(p => p.stock === 0).length;
  const totalViews = MOCK_PRODUCTS.reduce((s, p) => s + p.views, 0);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white">Mes produits</h1>
            <p className="text-chapchap-muted text-sm mt-1">{totalProducts} produits dans votre catalogue</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline btn-sm gap-2"><Download size={16} /> Exporter</button>
            <Link href="/seller/products/new" className="btn-primary gap-2">
              <Plus size={16} /> Ajouter un produit
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total produits', value: totalProducts, icon: '📦', color: 'bg-blue-50 text-blue-700' },
            { label: 'Actifs', value: activeProducts, icon: '✅', color: 'bg-green-50 text-green-700' },
            { label: 'Ruptures de stock', value: outOfStock, icon: '⚠️', color: 'bg-red-50 text-red-700' },
            { label: 'Vues totales', value: totalViews.toLocaleString('fr-CI'), icon: '👁️', color: 'bg-purple-50 text-purple-700' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="text-xl font-bold text-chapchap-secondary dark:text-white">{stat.value}</div>
                <div className="text-xs text-chapchap-muted">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input pl-10 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="out_of_stock">Ruptures de stock</option>
          </select>
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="card p-3 flex items-center gap-3 border-l-4 border-chapchap-primary bg-orange-50 dark:bg-orange-900/20">
              <span className="text-sm font-semibold text-chapchap-primary">{selected.size} sélectionné(s)</span>
              <button className="btn-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-semibold">Désactiver</button>
              <button className="btn-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold">Supprimer</button>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-chapchap-muted">Annuler</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left w-10">
                    <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} className="rounded text-chapchap-primary" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden sm:table-cell">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Ventes</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Vues</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-chapchap-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((product, i) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} className="rounded text-chapchap-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={product.thumbnail} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-chapchap-secondary dark:text-white line-clamp-1">{product.name}</p>
                          <p className="text-xs text-chapchap-muted">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-bold text-chapchap-primary text-sm">{formatCFA(product.price)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`font-semibold text-sm ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock === 0 ? '⚠️ Épuisé' : `${product.stock} unités`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_CONFIG[product.status as keyof typeof STATUS_CONFIG]?.class}>
                        {STATUS_CONFIG[product.status as keyof typeof STATUS_CONFIG]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-chapchap-muted hidden lg:table-cell">
                      <span className="flex items-center gap-1"><TrendingUp size={13} className="text-chapchap-primary" />{product.orders}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-chapchap-muted hidden lg:table-cell">
                      <span className="flex items-center gap-1"><Eye size={13} />{product.views}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.id}`} title="Voir" className="btn-icon p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/seller/products/${product.id}/edit`} title="Modifier" className="btn-icon p-2 text-chapchap-primary hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg">
                          <Edit size={15} />
                        </Link>
                        <button title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          className="btn-icon p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          {product.status === 'active' ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} />}
                        </button>
                        <button title="Supprimer" onClick={() => handleDelete(product.id, product.name)}
                          className="btn-icon p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="empty-state py-12">
              <div className="empty-state-icon">📦</div>
              <p className="text-chapchap-secondary dark:text-white font-semibold">Aucun produit trouvé</p>
              <Link href="/seller/products/new" className="btn-primary mt-4 gap-2"><Plus size={16} /> Ajouter votre premier produit</Link>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
