'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Camera, Save, Shield, Bell, Moon, Globe } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSave = async (data: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser({ ...user!, ...data });
        toast.success('Profil mis à jour !');
      } else toast.error(result.error);
    } catch { toast.error('Erreur de sauvegarde'); }
    finally { setIsSaving(false); }
  };

  const TABS = [
    { id: 'profile', label: 'Profil', icon: <User size={16} /> },
    { id: 'security', label: 'Sécurité', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'preferences', label: 'Préférences', icon: <Globe size={16} /> },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-chapchap-secondary dark:text-white mb-6">Mon profil</h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${
                activeTab === tab.id ? 'bg-chapchap-primary text-white shadow-chapchap' : 'bg-white dark:bg-gray-800 text-chapchap-muted border border-gray-200 dark:border-gray-700'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card p-6 mb-6">
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-chapchap flex items-center justify-center text-white text-3xl font-bold shadow-chapchap">
                    {user?.profile_pic ? <img src={user.profile_pic} alt="" className="w-full h-full rounded-2xl object-cover" /> : user?.name?.[0] || 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-chapchap-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-chapchap-orange-600 transition-colors">
                    <Camera size={13} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-chapchap-secondary dark:text-white">{user?.name}</h2>
                  <p className="text-chapchap-muted text-sm">{user?.email}</p>
                  <span className={`badge mt-2 ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                    {user?.is_verified ? '✅ Email vérifié' : '⚠️ Email non vérifié'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div>
                  <label className="label">Nom complet</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('name', { required: 'Nom requis', minLength: { value: 2, message: 'Trop court' } })}
                      className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('email')} type="email" className="input pl-10" disabled />
                  </div>
                  <p className="text-xs text-chapchap-muted mt-1">L&apos;email ne peut pas être modifié</p>
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('phone')} type="tel" className="input pl-10" placeholder="07 XX XX XX XX" />
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="btn-primary gap-2">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  Sauvegarder
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Mot de passe actuel</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="label">Nouveau mot de passe</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="label">Confirmer le nouveau mot de passe</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <button className="btn-primary gap-2"><Shield size={16} /> Changer le mot de passe</button>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-chapchap-secondary dark:text-white mb-4">Sessions actives</h3>
              <div className="space-y-3">
                {[
                  { device: 'Chrome sur Windows', location: 'Bouaké, CI', time: 'Maintenant (session actuelle)', current: true },
                  { device: 'Safari sur iPhone', location: 'Bouaké, CI', time: 'Il y a 2 jours', current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="text-sm font-medium text-chapchap-secondary dark:text-white">{session.device}</p>
                      <p className="text-xs text-chapchap-muted">{session.location} · {session.time}</p>
                    </div>
                    {session.current ? (
                      <span className="badge-success text-2xs">Actuelle</span>
                    ) : (
                      <button className="text-red-500 text-xs hover:underline">Déconnecter</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-chapchap-secondary dark:text-white">Préférences de notifications</h3>
              {[
                { label: 'Nouvelles commandes', desc: 'Être notifié quand vous avez une nouvelle commande', default: true },
                { label: 'Statut de commande', desc: 'Mises à jour du statut de vos commandes', default: true },
                { label: 'Messages', desc: 'Nouveaux messages des vendeurs', default: true },
                { label: 'Promotions', desc: 'Offres exclusives et ventes flash', default: false },
                { label: 'Nouveaux produits', desc: 'Produits dans vos catégories préférées', default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-chapchap-secondary dark:text-white">{item.label}</p>
                    <p className="text-xs text-chapchap-muted">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chapchap-primary" />
                  </label>
                </div>
              ))}
              <button className="btn-primary gap-2 mt-2"><Save size={16} /> Sauvegarder</button>
            </div>
          </motion.div>
        )}

        {/* Preferences tab */}
        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-chapchap-secondary dark:text-white">Préférences d&apos;affichage</h3>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-chapchap-primary" />
                  <div>
                    <p className="font-medium text-sm text-chapchap-secondary dark:text-white">Mode sombre</p>
                    <p className="text-xs text-chapchap-muted">Activer le thème sombre</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chapchap-primary" />
                </label>
              </div>
              <div className="py-3">
                <p className="font-medium text-sm text-chapchap-secondary dark:text-white mb-2">Langue</p>
                <select className="input text-sm w-auto">
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
              <div className="py-3 border-t border-gray-50 dark:border-gray-700">
                <p className="font-medium text-sm text-chapchap-secondary dark:text-white mb-1">Zone de danger</p>
                <p className="text-xs text-chapchap-muted mb-3">Supprimer votre compte et toutes vos données</p>
                <button className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors px-4 py-2 rounded-xl font-semibold text-sm">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
