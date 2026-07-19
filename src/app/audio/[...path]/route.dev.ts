import { statSync, createReadStream, readFileSync } from 'node:fs';
import { resolve, normalize, sep } from 'node:path';
import { NextResponse } from 'next/server';
import type { ReadStream } from 'node:fs';

/**
 * DEV ONLY — sert `/audio/*` depuis le staging local (`.assets-staging/audio`),
 * c'est-à-dire nos mp3 d'OST. En prod cette route n'existe pas (`.dev.ts`) :
 * `NEXT_PUBLIC_IMG_BASE` pointe le bucket R2 (mêmes assets, préfixe `/audio`).
 *
 * On honore l'en-tête `Range` : un `<audio>` demande des tranches pour permettre
 * le seek. Sans 206, chaque déplacement re-télécharge tout le fichier.
 * Un 404 ici = mp3 pas encore ramené en staging.
 */
const ROOT = resolve(process.cwd(), '.assets-staging', 'audio');

function streamToWeb(stream: ReadStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: Buffer | string) =>
        controller.enqueue(
          typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk),
        ),
      );
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const full = normalize(resolve(ROOT, ...path));
  if (!full.startsWith(ROOT + sep)) return new NextResponse(null, { status: 400 });

  let size: number;
  try {
    size = statSync(full).size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const type = full.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'application/octet-stream';
  const range = req.headers.get('range');

  // Requête complète : on renvoie tout (petit surcoût mémoire acceptable en dev).
  if (!range) {
    return new NextResponse(new Uint8Array(readFileSync(full)), {
      headers: {
        'content-type': type,
        'content-length': String(size),
        'accept-ranges': 'bytes',
        'cache-control': 'public, max-age=3600',
      },
    });
  }

  // Requête partielle (seek) : `bytes=START-END`.
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const start = m && m[1] ? parseInt(m[1], 10) : 0;
  const end = m && m[2] ? parseInt(m[2], 10) : size - 1;
  if (start >= size || end >= size || start > end) {
    return new NextResponse(null, {
      status: 416,
      headers: { 'content-range': `bytes */${size}` },
    });
  }

  return new NextResponse(streamToWeb(createReadStream(full, { start, end })), {
    status: 206,
    headers: {
      'content-type': type,
      'content-length': String(end - start + 1),
      'content-range': `bytes ${start}-${end}/${size}`,
      'accept-ranges': 'bytes',
      'cache-control': 'public, max-age=3600',
    },
  });
}
