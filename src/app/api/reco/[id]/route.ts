import { NextResponse } from 'next/server';
import { getRecoStatPriorities } from '@/lib/data/reco-api';

/**
 * GET /api/reco/:id → recommandations d'équipement d'un personnage, dans le
 * vocabulaire du solveur (cf. `src/lib/data/reco-api.ts` pour le contrat).
 *
 * Portage V2 à l'identique — consommé par l'app desktop Gear Solver, qui
 * distingue le 404 (« ce perso n'a pas de preset ») d'une erreur de transport.
 * Ce 404 doit donc rester du JSON, pas la page d'erreur HTML de Next.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  }

  const data = getRecoStatPriorities(id);
  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
