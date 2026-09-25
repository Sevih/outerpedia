import { NextResponse } from 'next/server';
import { buildBotCoupons } from '@/lib/data/bot-api';

/**
 * Codes promo ACTIFS pour les annonces Discord (outerbot). Aucun cache : le bot
 * interroge chaque minute pour annoncer un code dans la minute qui suit sa
 * sauvegarde en admin, et la lecture de R2 derrière est fraîche aussi.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await buildBotCoupons(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
