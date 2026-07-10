import { readFileSync } from 'node:fs';
import { NextResponse } from 'next/server';
import { buildImageIndex, type ImageIndex } from '@datagen/assets/source';
import { IS_DEV } from '@/lib/admin/guard';

/**
 * DEV ONLY — sert un sprite BRUT de `.gamedata/extracted/images` par basename
 * (`/api/admin/sprite/MT_4024001`). Complément de `/images/*` (staging) pour
 * les surfaces ADMIN : les vignettes de monstres et sprites non encore
 * collectés n'existent que dans l'extraction du jeu. 404 = sprite absent.
 */
let index: ImageIndex | null = null;
const getIndex = (): ImageIndex => (index ??= buildImageIndex());

const MIME: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { name } = await params;
  if (!/^[\w.-]+$/.test(name)) return new NextResponse(null, { status: 400 });

  const full = getIndex().get(name.toLowerCase().replace(/\.(png|webp|jpe?g)$/i, ''));
  if (!full) return new NextResponse(null, { status: 404 });

  try {
    const body = readFileSync(full);
    const ext = full.split('.').pop()?.toLowerCase() ?? '';
    return new NextResponse(new Uint8Array(body), {
      headers: {
        'content-type': MIME[ext] ?? 'application/octet-stream',
        'cache-control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
