export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  verifyPassword, signJWT, checkRateLimit, resetRateLimit,
  logSecurityEvent, sanitizeInput
} from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(1, 'Mot de passe requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      await logSecurityEvent(null, 'rate_limit_exceeded', ip, { email: body.email }, 'warning');
      return NextResponse.json({
        success: false,
        error: 'Trop de tentatives. Réessayez dans 15 minutes.',
      }, { status: 429 });
    }

    // Validation
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Email ou mot de passe invalide',
      }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const supabase = createServerSupabaseClient();

    // Récupérer l'utilisateur
    const { data: user } = await supabase
      .from('profiles')
      .select('id, email, name, password_hash, role, profile_pic, is_verified, is_active, failed_login_count, locked_until, preferences')
      .eq('email', email)
      .single();

    if (!user) {
      await logSecurityEvent(null, 'login_failed_no_user', ip, { email }, 'warning');
      return NextResponse.json({
        success: false,
        error: 'Email ou mot de passe incorrect',
      }, { status: 401 });
    }

    // Compte verrouillé ?
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Compte temporairement verrouillé. Réessayez dans quelques minutes.',
      }, { status: 403 });
    }

    // Compte actif ?
    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Compte suspendu. Contactez le support.',
      }, { status: 403 });
    }

    // Vérifier mot de passe
    if (!user.password_hash) {
      return NextResponse.json({
        success: false,
        error: 'Utilisez Google pour vous connecter',
      }, { status: 400 });
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      // Incrémenter tentatives échouées
      const failedCount = (user.failed_login_count || 0) + 1;
      const updateData: any = { failed_login_count: failedCount };
      
      if (failedCount >= 5) {
        updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      await supabase.from('profiles').update(updateData).eq('id', user.id);

      await logSecurityEvent(user.id, 'login_failed_wrong_password', ip, { attempts: failedCount }, 'warning');

      return NextResponse.json({
        success: false,
        error: `Mot de passe incorrect. ${failedCount >= 4 ? 'Encore 1 tentative avant verrouillage.' : ''}`,
      }, { status: 401 });
    }

    // Connexion réussie
    resetRateLimit(ip);

    await supabase.from('profiles').update({
      last_login: new Date().toISOString(),
      failed_login_count: 0,
      locked_until: null,
      login_count: supabase.rpc('increment', { row_id: user.id, amount: 1 }),
    }).eq('id', user.id);

    await logSecurityEvent(user.id, 'login_success', ip, {}, 'info');

    // Générer token
    const token = signJWT({
      userId: user.id,
      role: user.role as any,
      email: user.email,
    });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic,
      is_verified: user.is_verified,
      preferences: user.preferences,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      data: { user: userData, token },
    });

    response.cookies.set('chapchap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne',
    }, { status: 500 });
  }
}
