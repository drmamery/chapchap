export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }
    // Ne pas retourner le password_hash
    const { ...safeUser } = user as any;
    delete safeUser.password_hash;
    delete safeUser.verification_token;
    delete safeUser.reset_password_token;

    return NextResponse.json({ success: true, data: safeUser });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
