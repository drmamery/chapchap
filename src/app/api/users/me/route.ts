export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, sanitizeInput } from '@/lib/auth';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    dark_mode: z.boolean().optional(),
    language: z.string().optional(),
  }).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    const updates: any = {};
    if (parsed.data.name) updates.name = sanitizeInput(parsed.data.name);
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
    if (parsed.data.preferences) {
      updates.preferences = { ...user.preferences, ...parsed.data.preferences };
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('id, name, email, phone, role, profile_pic, is_verified, preferences')
      .single();

    if (error) return NextResponse.json({ success: false, error: 'Erreur mise à jour' }, { status: 500 });

    return NextResponse.json({ success: true, data, message: 'Profil mis à jour' });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, profile_pic, is_verified, preferences, created_at, last_login')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
