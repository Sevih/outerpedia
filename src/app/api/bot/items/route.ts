import { NextResponse } from 'next/server';
import { getT } from '@/i18n';
import { buildBotItems } from '@/lib/data/bot-api';

/** Catalogue équipement PRÉ-FORMATÉ pour /item (bot Discord) — textes EN prêts à l'embed. */
export const revalidate = 3600;

export async function GET() {
  const t = await getT('en');
  return NextResponse.json(buildBotItems(t), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
