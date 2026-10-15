import { readFileSync } from 'node:fs';
import { resolve, normalize, sep } from 'node:path';
import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';

/**
 * DEV ONLY — sert `/images/*` depuis le staging local (`.assets-staging/images`),
 * c'est-à-dire NOS assets extraits du jeu. En prod cette route n'existe pas
 * (`.dev.ts`) : NEXT_PUBLIC_IMG_BASE pointe le bucket R2.
 * Un 404 ici = asset pas encore collecté (lance `pnpm assets:collect`).
 */
const ROOT = resolve(process.cwd(), '.assets-staging', 'images');

const MIME: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  gif: 'image/gif',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  // Seconde garde, en plus de l'exclusion `.dev.ts` du build de prod.
  if (!IS_DEV) return new NextResponse(null, { status: 404 });
  const { path } = await params;
  const full = normalize(resolve(ROOT, ...path));
  if (!full.startsWith(ROOT + sep)) return new NextResponse(null, { status: 400 });

  try {
    const body = readFileSync(full);
    const ext = full.split('.').pop()?.toLowerCase() ?? '';
    return new NextResponse(new Uint8Array(body), {
      headers: {
        'content-type': MIME[ext] ?? 'application/octet-stream',
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
