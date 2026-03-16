import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client lazy — créé seulement quand appelé (pas au chargement du module)
let _supabase: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabase) {
      const url = getSupabaseUrl();
      const key = getSupabaseAnonKey();
      if (!url || !key) return () => ({ data: null, error: { message: 'Supabase not configured' } });
      _supabase = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    }
    return (_supabase as any)[prop];
  },
});

// Client serveur — toujours lazy
export const createServerSupabaseClient = () => {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
