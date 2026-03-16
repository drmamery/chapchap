export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyGoogleToken, isAdminEmail, signJWT, logSecurityEvent, logAdminAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { id_token, credential } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const token = id_token || credential;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token Google requis',
      }, { status: 400 });
    }

    // Vérifier le token Google
    const googleUser = await verifyGoogleToken(token);
    if (!googleUser) {
      await logSecurityEvent(null, 'google_oauth_invalid_token', ip, {}, 'warning');
      return NextResponse.json({
        success: false,
        error: 'Token Google invalide',
      }, { status: 401 });
    }

    // VÉRIFICATION CRITIQUE: Seul l'admin autorisé peut se connecter via Google admin
    if (!isAdminEmail(googleUser.email)) {
      await logSecurityEvent(null, 'unauthorized_admin_google_login', ip, {
        attempted_email: googleUser.email,
      }, 'critical');
      
      return NextResponse.json({
        success: false,
        error: 'Accès admin non autorisé pour cet email',
      }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();

    // Récupérer ou créer l'admin
    let { data: adminUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    if (!adminUser) {
      // Créer l'admin s'il n'existe pas
      const { data: newAdmin, error } = await supabase
        .from('profiles')
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          role: 'admin',
          avatar_url: googleUser.picture,
          google_id: googleUser.sub,
          is_verified: true,
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Erreur de création du compte admin',
        }, { status: 500 });
      }
      adminUser = newAdmin;
    } else {
      // Vérifier que c'est bien un admin
      if (adminUser.role !== 'admin') {
        await logSecurityEvent(adminUser.id, 'non_admin_google_login_attempt', ip, {}, 'critical');
        return NextResponse.json({
          success: false,
          error: 'Accès refusé',
        }, { status: 403 });
      }

      // Mettre à jour profil
      await supabase.from('profiles').update({
        avatar_url: googleUser.picture,
        google_id: googleUser.sub,
        last_login: new Date().toISOString(),
      }).eq('id', adminUser.id);
    }

    // Log connexion admin
    await logSecurityEvent(adminUser.id, 'admin_login_google', ip, {}, 'info');
    await logAdminAction(adminUser.id, 'admin_login', null, null, { method: 'google_oauth' }, ip);

    // Générer token admin
    const jwtToken = signJWT({
      userId: adminUser.id,
      role: 'admin',
      email: adminUser.email,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Connexion admin réussie',
      data: {
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin',
          avatar_url: adminUser.profile_pic,
        },
        token: jwtToken,
        redirect: '/admin',
      },
    });

    // Cookie sécurisé admin
    response.cookies.set('chapchap_admin_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',  // Plus restrictif pour admin
      maxAge: 60 * 60 * 8, // 8 heures seulement
      path: '/admin',
    });

    response.cookies.set('chapchap_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur d\'authentification Google',
    }, { status: 500 });
  }
}
