import { createServerSupabaseClient } from './supabase';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'chapchap-secret-2024';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dr.mamery@gmail.com';

// ============================================================
// JWT
// ============================================================

export function signJWT(payload: { userId: string; role: UserRole; email: string }): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): { userId: string; role: UserRole; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole; email: string };
  } catch {
    return null;
  }
}

// ============================================================
// PASSWORD
// ============================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
}

// ============================================================
// MIDDLEWARE AUTH
// ============================================================

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookieToken = request.cookies.get('chapchap_token')?.value;
  return cookieToken || null;
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyJWT(token);
  if (!decoded) return null;

  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', decoded.userId)
    .eq('is_active', true)
    .single();

  return user as User | null;
}

export function requireAuth(roles?: UserRole[]) {
  return async (request: NextRequest): Promise<{ user: User } | NextResponse> => {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 401 });
    }

    if (roles && !roles.includes(user.role as UserRole)) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier que l'admin est le bon
    if (user.role === 'admin' && user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Accès admin non autorisé' }, { status: 403 });
    }

    return { user: user as User };
  };
}

// ============================================================
// GOOGLE OAUTH (Admin uniquement)
// ============================================================

export async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; picture: string; sub: string } | null> {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) return null;
    const data = await response.json();
    
    // Vérifier l'audience
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) return null;
    
    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      sub: data.sub,
    };
  } catch {
    return null;
  }
}

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL;
}

// ============================================================
// RATE LIMITING (Simple en mémoire)
// ============================================================

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = `login_${ip}`;
  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(`login_${ip}`);
}

// ============================================================
// SÉCURITÉ
// ============================================================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  array.forEach(x => result += chars[x % chars.length]);
  return result;
}

// Log sécurité
export async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  ipAddress: string,
  details: Record<string, unknown> = {},
  severity: 'info' | 'warning' | 'critical' = 'info'
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('security_logs').insert({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      details,
      severity,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Log admin
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details: Record<string, unknown>,
  ipAddress: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
