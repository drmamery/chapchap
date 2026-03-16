'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setInitialized, token } = useAuthStore();

  useEffect(() => {
    // Restaurer la session depuis le token stocké
    const restore = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          } else {
            setUser(null);
            setToken(null);
          }
        } catch {
          // Token invalide, nettoyer
          setUser(null);
          setToken(null);
        }
      }
      setInitialized(true);
    };

    restore();
  }, []); // eslint-disable-line

  return <>{children}</>;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
