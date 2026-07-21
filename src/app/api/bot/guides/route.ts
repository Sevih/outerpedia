import { NextResponse } from 'next/server';
import { buildBotGuides } from '@/lib/data/bot-api';

/** Guides visibles pour /guide (bot Discord) — titres EN, liens reconstruits par le bot. */
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(buildBotGuides(), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
