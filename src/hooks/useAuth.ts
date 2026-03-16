'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, token, isLoading, setUser, setToken, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    storeLogout();
    router.push('/');
    toast.success('Déconnexion réussie');
  }, [storeLogout, router]);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'buyer';

  return { user, token, isLoading, isAuthenticated, isAdmin, isSeller, isBuyer, logout, setUser, setToken };
}
