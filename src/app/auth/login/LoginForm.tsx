'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import Script from 'next/script';

const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type LoginFormData = z.infer<typeof LoginSchema>;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '474335933735-bs3esu2rg5j8e2fa9b31dktil74634u5.apps.googleusercontent.com';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setUser, setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    if (googleReady && typeof window !== 'undefined' && (window as any).google) {
      initGoogle();
    }
  }, [googleReady]);

  const initGoogle = () => {
    if (!(window as any).google) return;
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
    });
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
      (window as any).google.accounts.id.renderButton(btn, {
        type: 'standard', theme: 'outline', size: 'large',
        text: 'signin_with', shape: 'rectangular', width: '100%',
      });
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        toast.success(`Bienvenue, ${data.data.user.name || data.data.user.full_name} !`);
        router.push(data.data.user.role === 'admin' ? '/admin' : redirect);
      } else {
        toast.error(data.error || 'Connexion Google échouée');
      }
    } catch {
      toast.error('Erreur de connexion Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.token);
        toast.success('Connexion réussie !');
        const { role } = result.data.user;
        if (role === 'admin') router.push('/admin');
        else if (role === 'seller') router.push('/seller/dashboard');
        else router.push(redirect);
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" onLoad={() => { setGoogleReady(true); setTimeout(initGoogle, 100); }} />
      <div className="min-h-screen flex">
        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <Link href="/" className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="text-3xl font-bold" style={{fontFamily:'Syne,sans-serif'}}>
                Chap<span className="text-orange-400">Chap</span>
              </span>
            </Link>
            <h2 className="text-4xl font-bold mb-4">La marketplace<br />de <span className="text-orange-400">Bouaké</span></h2>
            <p className="text-white/70 text-lg mb-8">Achetez et vendez des produits locaux en toute sécurité.</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
              {['🔒 Paiement sécurisé','🚚 Livraison rapide','✅ Vendeurs vérifiés','💬 Support 24/7'].map(f => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-chapchap-light dark:bg-chapchap-dark">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold">Chap<span className="text-orange-500">Chap</span></span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connexion</h1>
              <p className="text-gray-500 mt-2">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="text-orange-500 font-semibold hover:underline">S&apos;inscrire</Link>
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="mb-6">
              <div id="google-signin-btn" className="w-full" />
              {isGoogleLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Connexion Google...
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                <Shield size={11} className="text-orange-500" /> Google OAuth réservé à l&apos;administrateur
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-sm text-gray-400">ou</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('email')} type="email" placeholder="vous@exemple.ci"
                    className={`w-full rounded-xl border pl-11 px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    autoComplete="email" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    className={`w-full rounded-xl border pl-11 pr-11 px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-orange-500 hover:underline font-medium">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Connexion...</>
                ) : 'Se connecter'}
              </button>
            </form>

            {/* Test accounts */}
            <div className="mt-6 p-4 bg-orange-50 dark:bg-gray-800 rounded-xl border border-orange-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">🧪 Comptes de test</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><span className="font-semibold text-orange-500">Acheteur:</span> acheteur1@chapchap.ci</p>
                <p><span className="font-semibold text-blue-600">Vendeur:</span> vendeur1@chapchap.ci</p>
                <p><span className="font-semibold text-green-600">Admin:</span> dr.mamery@gmail.com (Google)</p>
                <p className="italic">Mot de passe: ChapChap2024!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
