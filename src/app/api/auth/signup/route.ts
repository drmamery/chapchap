export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { 
  hashPassword, signJWT, validatePasswordStrength, 
  logSecurityEvent, generateSecureToken, sanitizeInput 
} from '@/lib/auth';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(8, 'Mot de passe trop court'),
  phone: z.string().optional(),
  role: z.enum(['buyer', 'seller']).default('buyer'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Validation
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.errors[0].message,
      }, { status: 400 });
    }

    const { name, email, password, phone, role } = parsed.data;

    // Vérification force du mot de passe
    const pwStrength = validatePasswordStrength(password);
    if (!pwStrength.valid) {
      return NextResponse.json({
        success: false,
        error: pwStrength.message,
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Cet email est déjà utilisé',
      }, { status: 409 });
    }

    // Hasher le mot de passe
    const password_hash = await hashPassword(password);
    const verification_token = generateSecureToken(32);

    // Créer l'utilisateur
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert({
        name: sanitizeInput(name),
        email,
        password_hash,
        phone: phone ? sanitizeInput(phone) : null,
        role,
        verification_token,
        is_verified: false,
        is_active: true,
      })
      .select('id, name, email, role, is_verified')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création du compte',
      }, { status: 500 });
    }

    // Envoyer email de vérification (non bloquant)
    sendVerificationEmail(email, name, verification_token).catch(err => {
      console.error('Email send error:', err);
    });

    // Log de sécurité
    await logSecurityEvent(newUser.id, 'user_registered', ip, { role, email }, 'info');

    // Notification de bienvenue
    await supabase.from('notifications').insert({
      user_id: newUser.id,
      type: 'system',
      title: 'Bienvenue sur ChapChap ! 🎉',
      message: `Bienvenue ${name} ! Votre compte a été créé avec succès. Vérifiez votre email pour activer votre compte.`,
      action_url: '/buyer/dashboard',
    });

    // Si vendeur, créer une entrée pré-boutique
    if (role === 'seller') {
      await supabase.from('notifications').insert({
        user_id: newUser.id,
        type: 'system',
        title: 'Créez votre boutique',
        message: 'Complétez la configuration de votre boutique pour commencer à vendre sur ChapChap.',
        action_url: '/seller/setup',
      });
    }

    // Générer JWT
    const token = signJWT({
      userId: newUser.id,
      role: newUser.role as any,
      email: newUser.email,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Vérifiez votre email.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          is_verified: false,
        },
        token,
      },
    }, { status: 201 });

    // Définir cookie httpOnly
    response.cookies.set('chapchap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur interne',
    }, { status: 500 });
  }
}
