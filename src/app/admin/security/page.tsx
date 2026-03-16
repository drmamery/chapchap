'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info, AlertCircle, Download, Search, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDateTime } from '@/lib/utils';

const SEVERITY_CONFIG = {
  info: { icon: <Info size={14} />, color: 'text-blue-600 bg-blue-50', label: 'Info' },
  warning: { icon: <AlertTriangle size={14} />, color: 'text-yellow-700 bg-yellow-50', label: 'Avertissement' },
  critical: { icon: <AlertCircle size={14} />, color: 'text-red-700 bg-red-50 animate-pulse', label: 'Critique' },
};

const MOCK_LOGS = [
  { id: '1', event_type: 'admin_login_google', user: 'dr.mamery@gmail.com', ip_address: '197.234.218.1', severity: 'info', details: { method: 'google_oauth' }, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', event_type: 'rate_limit_exceeded', user: 'inconnu', ip_address: '41.202.100.23', severity: 'warning', details: { email: 'test@test.com', attempts: 10 }, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '3', event_type: 'unauthorized_admin_google_login', user: 'hacker@evil.com', ip_address: '89.45.12.100', severity: 'critical', details: { attempted_email: 'hacker@evil.com' }, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '4', event_type: 'login_failed_wrong_password', user: 'vendeur1@chapchap.ci', ip_address: '197.234.218.5', severity: 'warning', details: { attempts: 3 }, created_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: '5', event_type: 'user_registered', user: 'nouveau@user.ci', ip_address: '41.202.100.25', severity: 'info', details: { role: 'buyer' }, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '6', event_type: 'login_success', user: 'acheteur1@chapchap.ci', ip_address: '197.234.218.8', severity: 'info', details: {}, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '7', event_type: 'login_failed_no_user', user: 'inexistant@ci.com', ip_address: '41.202.100.30', severity: 'warning', details: { email: 'inexistant@ci.com' }, created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
];

const EVENT_LABELS: Record<string, string> = {
  admin_login_google: 'Connexion admin Google',
  rate_limit_exceeded: 'Limite de taux dépassée',
  unauthorized_admin_google_login: '⚠️ Tentative d\'accès admin non autorisée',
  login_failed_wrong_password: 'Mot de passe incorrect',
  login_failed_no_user: 'Utilisateur inexistant',
  login_success: 'Connexion réussie',
  user_registered: 'Nouvel utilisateur inscrit',
};

export default function AdminSecurityPage() {
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = MOCK_LOGS.filter(log => {
    if (severityFilter && log.severity !== severityFilter) return false;
    if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.event_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const criticalCount = MOCK_LOGS.filter(l => l.severity === 'critical').length;
  const warningCount = MOCK_LOGS.filter(l => l.severity === 'warning').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white flex items-center gap-2">
              <Shield size={24} className="text-chapchap-primary" /> Sécurité & Audit
            </h1>
            <p className="text-chapchap-muted text-sm mt-1">Logs de sécurité et actions administratives</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline btn-sm gap-2"><Download size={16} /> Exporter logs</button>
            <button className="btn-primary btn-sm gap-2"><RefreshCw size={16} /> Actualiser</button>
          </div>
        </div>

        {/* Alert cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`card p-5 border-l-4 ${criticalCount > 0 ? 'border-red-500' : 'border-green-500'}`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={criticalCount > 0 ? 'text-red-500' : 'text-green-500'} size={28} />
              <div>
                <div className="text-2xl font-bold text-chapchap-secondary dark:text-white">{criticalCount}</div>
                <div className="text-sm text-chapchap-muted">Alertes critiques</div>
              </div>
            </div>
          </div>
          <div className={`card p-5 border-l-4 ${warningCount > 2 ? 'border-yellow-500' : 'border-green-500'}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={warningCount > 2 ? 'text-yellow-500' : 'text-green-500'} size={28} />
              <div>
                <div className="text-2xl font-bold text-chapchap-secondary dark:text-white">{warningCount}</div>
                <div className="text-sm text-chapchap-muted">Avertissements</div>
              </div>
            </div>
          </div>
          <div className="card p-5 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <Shield className="text-green-500" size={28} />
              <div>
                <div className="text-2xl font-bold text-chapchap-secondary dark:text-white">100%</div>
                <div className="text-sm text-chapchap-muted">Système sécurisé</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par utilisateur ou type..." className="input pl-10 text-sm" />
          </div>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">Tous les niveaux</option>
            <option value="critical">Critique</option>
            <option value="warning">Avertissement</option>
            <option value="info">Info</option>
          </select>
        </div>

        {/* Logs table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Sévérité</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Événement</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden md:table-cell">Adresse IP</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider hidden lg:table-cell">Détails</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-chapchap-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((log, i) => {
                  const config = SEVERITY_CONFIG[log.severity as keyof typeof SEVERITY_CONFIG];
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${log.severity === 'critical' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-chapchap-secondary dark:text-white">
                          {EVENT_LABELS[log.event_type] || log.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-chapchap-muted">{log.user}</td>
                      <td className="px-4 py-3 text-xs font-mono text-chapchap-muted hidden md:table-cell">{log.ip_address}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-chapchap-muted font-mono bg-gray-50 dark:bg-gray-800 rounded px-2 py-0.5">
                          {JSON.stringify(log.details).slice(0, 50)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-chapchap-muted whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
