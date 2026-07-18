import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getT } from '@/i18n';
import { normalizeLang } from '@/lib/i18n/config';
import { buildSearchIndex } from '@/lib/search-index';

/**
 * Index de la recherche globale (pages + personnages + guides) pour une langue.
 * La palette (Ctrl+K) le charge à sa PREMIÈRE ouverture — on ne l'inline pas
 * dans le header rendu sur chaque page. Données build-time statiques → cache CDN
 * agressif (revalidation en arrière-plan).
 */
export async function GET(req: NextRequest) {
  const lang = normalizeLang(req.nextUrl.searchParams.get('lang') ?? 'en');
  const t = await getT(lang);
  return NextResponse.json(buildSearchIndex(lang, t), {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  });
}
