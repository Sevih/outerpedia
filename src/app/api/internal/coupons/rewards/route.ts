import { NextResponse } from 'next/server';
import { refuseUnlessBearer } from '@/lib/internal-auth';
import { catalogOptions, getItemEntry } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';

/**
 * Récompenses possibles d'un coupon, pour le bot Discord (route INTERNE, même
 * jeton que `/api/internal/coupons`) :
 *   ?q=gold      → 25 meilleurs résultats, classés comme le picker de l'admin ;
 *   ?ids=a,b     → noms EN de ces ids (aperçu avant confirmation).
 * Même catalogue que l'éditeur admin (`catalogOptions`).
 */
export const dynamic = 'force-dynamic';

/** Plafond d'une autocomplétion Discord. */
const DISCORD_CHOICES = 25;

export function GET(request: Request) {
  const refused = refuseUnlessBearer(request, 'COUPON_API_SECRET');
  if (refused) return refused;

  const params = new URL(request.url).searchParams;
  const ids = params.get('ids');
  if (ids !== null) {
    return NextResponse.json(
      ids
        .split(',')
        .filter(Boolean)
        .map((id) => ({ id, name: getItemEntry(id)?.name.en ?? null })),
    );
  }

  const options = catalogOptions().map((o) => ({ id: o.id, name: o.name }));
  return NextResponse.json(rankItemMatches(options, params.get('q') ?? '', DISCORD_CHOICES));
}
