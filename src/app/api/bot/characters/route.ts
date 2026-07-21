import { NextResponse } from 'next/server';
import { buildBotCharacters } from '@/lib/data/bot-api';

/**
 * Persos publiés pour le bot Discord (outerbot) : forum-sync (un post de
 * reviews par perso) + /char. Statique avec revalidation : le cron du bot
 * force son refresh toutes les 6 h, un perso ajouté apparaît sans redeploy.
 */
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(buildBotCharacters(), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
