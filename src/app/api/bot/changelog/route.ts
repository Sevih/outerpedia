import { NextResponse } from 'next/server';
import { buildBotChangelog } from '@/lib/data/bot-api';

/**
 * Journal du site pour les annonces Discord (outerbot). Aucun cache : le
 * journal est un import statique (le calcul ne coûte rien), et le bot doit
 * voir une entrée dès le redémarrage du conteneur, ou dès 00:00 UTC pour une
 * entrée programmée.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(buildBotChangelog(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
