export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });
  response.cookies.delete('chapchap_token');
  response.cookies.delete('chapchap_admin_token');
  return response;
}
