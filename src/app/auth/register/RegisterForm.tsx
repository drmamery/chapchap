'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';

const Schema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[0-9]/, 'Un chiffre requis'),
  confirm_password: z.string(),
  role: z.enum(['buyer', 'seller']),
  accept_terms: z.boolean().refine(v => v === true, { message: 'Vous devez accepter les CGU' }),
}).refine(d => d.password === d.confirm_password, {
  path: ['confirm_password'],
  message: 'Les mots de passe ne correspondent pas',
});

type Form = z.infer<typeof Schema>;

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as 'buyer' | 'seller') || 'buyer';
  const { setUser, setToken } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(Schema),
    defaultValues: { role: defaultRole, accept_terms: false },
  });

  const pw = watch('password', '');
  const role = watch('role');
  const pwChecks = [
    { label: '8 caractères minimum', ok: pw.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(pw) },
    { label: 'Un chiffre', ok: /[0-9]/.test(pw) },
  ];

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.token);
        toast.success('Compte créé ! Vérifiez votre email.');
        router.push(data.role === 'seller' ? '/seller/dashboard' : '/');
      } else {
        toast.error(result.error || 'Erreur lors de la création du compte');
      }
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chapchap-light dark:bg-chapchap-dark flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold" style={{fontFamily:'Syne,sans-serif'}}>
              Chap<span className="text-orange-500">Chap</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
          <p className="text-gray-500 mt-2">
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="text-orange-500 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([['buyer', '🛒', 'Acheteur', 'Acheter des produits'], ['seller', '🏪', 'Vendeur', 'Vendre vos produits']] as const).map(([r, icon, label, sub]) => (
              <label key={r} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                role === r ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input {...register('role')} type="radio" value={r} className="sr-only" />
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{label}</span>
                <span className="text-xs text-gray-400">{sub}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Nom complet *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('name')} className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`} placeholder="Votre nom complet" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`} placeholder="vous@exemple.ci" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Téléphone (optionnel)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('phone')} type="tel" className="w-full rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3 pl-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="07 XX XX XX XX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} className={`w-full rounded-xl border px-4 py-3 pl-10 pr-11 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pw && (
                <div className="mt-2 space-y-1">
                  {pwChecks.map(c => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle size={11} /> {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('confirm_password')} type="password" className={`w-full rounded-xl border px-4 py-3 pl-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.confirm_password ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`} placeholder="••••••••" />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.confirm_password.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register('accept_terms')} type="checkbox" className="mt-0.5 rounded text-orange-500" />
              <span className="text-sm text-gray-500">
                J&apos;accepte les{' '}
                <Link href="/terms" className="text-orange-500 hover:underline">CGU</Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-orange-500 hover:underline">Politique de confidentialité</Link>
              </span>
            </label>
            {errors.accept_terms && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={11} />{errors.accept_terms.message}</p>}

            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Création...</>
              ) : `Créer mon compte ${role === 'seller' ? 'vendeur' : 'acheteur'}`}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
