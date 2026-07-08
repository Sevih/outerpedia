import { NextResponse } from 'next/server';
import { resolveGameText } from '@/lib/admin/game-text';
import { IS_DEV } from '@/lib/admin/guard';

// Résout une clé de texte du jeu → dict localisé (dev only).
export async function GET(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const key = new URL(req.url).searchParams.get('key') ?? '';
  return NextResponse.json({ text: resolveGameText(key) });
}
