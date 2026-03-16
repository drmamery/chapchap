'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, UserCheck, UserX, Mail, Ban, Trash2,
  Eye, ChevronDown, Download, RefreshCw, Shield, Users
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: 'user-001', name: 'Koné Amadou', email: 'vendeur1@chapchap.ci', role: 'seller', is_verified: true, is_active: true, created_at: '2024-12-01', last_login: new Date(Date.now() - 2 * 3600000).toISOString(), login_count: 145, shop: 'TechZone Bouaké' },
  { id: 'user-002', name: 'Traoré Fatou', email: 'vendeur2@chapchap.ci', role: 'seller', is_verified: true, is_active: true, created_at: '2024-11-15', last_login: new Date(Date.now() - 5 * 3600000).toISOString(), login_count: 89, shop: 'Fashion Wax by Fatou' },
  { id: 'user-003', name: 'Diabaté Marie', email: 'acheteur1@chapchap.ci', role: 'buyer', is_verified: true, is_active: true, created_at: '2025-01-05', last_login: new Date(Date.now() - 12 * 3600000).toISOString(), login_count: 23, shop: null },
  { id: 'user-004', name: 'Ouattara Jean', email: 'acheteur2@chapchap.ci', role: 'buyer', is_verified: false, is_active: true, created_at: '2025-01-14', last_login: null, login_count: 2, shop: null },
  { id: 'user-005', name: 'Bamba Koné', email: 'suspect@test.ci', role: 'buyer', is_verified: true, is_active: false, created_at: '2025-01-12', last_login: new Date(Date.now() - 24 * 3600000).toISOString(), login_count: 8, shop: null },
];

const ROLE_CONFIG = {
  buyer: { label: 'Acheteur', color: 'badge-info' },
  seller: { label: 'Vendeur', color: 'badge-primary' },
  admin: { label: 'Admin', color: 'badge-gold' },
  courier: { label: 'Livreur', color: 'badge-success' },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filtered = MOCK_USERS.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'suspended' && u.is_active) return false;
    if (statusFilter === 'unverified' && u.is_verified) return false;
    return true;
  });

  const handleAction = (action: string, userId: string, userName: string) => {
    const messages: Record<string, string> = {
      suspend: `${userName} a été suspendu`,
      activate: `${userName} a été activé`,
      delete: `${userName} a été supprimé`,
    };
    toast.success(messages[action] || 'Action effectuée');
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white flex items-center gap-2">
              <Users size={24} className="text-chapchap-primary" /> Gestion des utilisateurs
            </h1>
            <p className="text-chapchap-muted text-sm mt-1">{MOCK_USERS.length} utilisateurs au total</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline btn-sm gap-2"><Download size={16} /> Exporter CSV</button>
            <button className="btn-primary btn-sm gap-2"><RefreshCw size={16} /> Actualiser</button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: MOCK_USERS.length, icon: '👥', color: 'bg-blue-100 text-blue-700' },
            { label: 'Acheteurs', value: MOCK_USERS.filter(u => u.role === 'buyer').length, icon: '🛒', color: 'bg-green-100 text-green-700' },
            { label: 'Vendeurs', value: MOCK_USERS.filter(u => u.role === 'seller').length, icon: '🏪', color: 'bg-orange-100 text-orange-700' },
            { label: 'Suspendus', value: MOCK_USERS.filter(u => !u.is_active).length, icon: '🚫', color: 'bg-red-100 text-red-700' },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..." className="input pl-10 text-sm" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">Tous les rôles</option>
            <option value="buyer">Acheteurs</option>
            <option value="seller">Vendeurs</option>
            <option value="courier">Livreurs</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="unverified">Non vérifiés</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedUsers.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-3 flex items-center gap-3 border-l-4 border-chapchap-primary bg-orange-50 dark:bg-orange-900/20">
            <span className="text-sm font-semibold text-chapchap-primary">{selectedUsers.size} sélectionné(s)</span>
            <button className="btn-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-200">Suspendre</button>
            <button className="btn-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200">Supprimer</button>
            <button onClick={() => setSelectedUsers(new Set())} className="ml-auto text-xs text-chapchap-muted hover:text-chapchap-secondary">Annuler</button>
          </motion.div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" onChange={e => {
                      if (e.target.checked) setSelectedUsers(new Set(filtered.map(u => u.id)));
                      else setSelectedUsers(new Set());
                    }} className="rounded text-chapchap-primary" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden md:table-cell">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Dernière connexion</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Inscrit le</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-chapchap-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded text-chapchap-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-chapchap flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-chapchap-secondary dark:text-white">{user.name}</p>
                          <p className="text-xs text-chapchap-muted">{user.email}</p>
                          {user.shop && <p className="text-2xs text-chapchap-primary">🏪 {user.shop}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.color}>
                        {ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-2xs ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {user.is_active ? '● Actif' : '● Suspendu'}
                        </span>
                        {!user.is_verified && <span className="badge-warning text-2xs">Non vérifié</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-chapchap-muted hidden lg:table-cell">
                      {user.last_login ? formatTimeAgo(user.last_login) : 'Jamais'}
                      <br /><span className="text-2xs">{user.login_count} connexions</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-chapchap-muted hidden lg:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button title="Voir profil" className="btn-icon p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <Eye size={15} />
                        </button>
                        <button title="Envoyer email" className="btn-icon p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          <Mail size={15} />
                        </button>
                        {user.is_active ? (
                          <button
                            title="Suspendre"
                            onClick={() => handleAction('suspend', user.id, user.name)}
                            className="btn-icon p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
                          >
                            <Ban size={15} />
                          </button>
                        ) : (
                          <button
                            title="Activer"
                            onClick={() => handleAction('activate', user.id, user.name)}
                            className="btn-icon p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                        <button
                          title="Supprimer"
                          onClick={() => handleAction('delete', user.id, user.name)}
                          className="btn-icon p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
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
              <div className="empty-state-icon">👤</div>
              <p className="text-chapchap-muted">Aucun utilisateur trouvé</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-chapchap-muted">
            <span>Affichage de {filtered.length} sur {MOCK_USERS.length} utilisateurs</span>
            <div className="flex items-center gap-2">
              <button className="btn-outline btn-sm text-xs" disabled>← Précédent</button>
              <span className="px-3 py-1.5 bg-chapchap-primary text-white rounded-lg text-xs font-bold">1</span>
              <button className="btn-outline btn-sm text-xs" disabled>Suivant →</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
