import { NextResponse } from 'next/server';
import { checkText, type TagCheck } from '@/lib/parse-text';
import { getGuide } from '@/lib/data/guides';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { IS_DEV } from '@/lib/admin/guard';

// Node runtime : lectures disque des data layers (résolveurs de tags).
export const runtime = 'nodejs';

/** Existence d'une cible interne `/guides/…` (même règle que la gate CI). */
function guideHrefExists(href: string): boolean {
  const m = /^\/guides(?:\/([^/]+)(?:\/([^/]+))?)?\/?$/.exec(href.trim());
  if (!m) return false;
  const [, cat, slug] = m;
  if (!cat) return true; // landing racine
  if (!(GUIDE_CATEGORY_SLUGS as readonly string[]).includes(cat)) return false;
  if (!slug) return true; // landing de catégorie
  return Boolean(getGuide(cat, slug));
}

/**
 * VALIDATION d'un texte éditorial inline (outil admin) : les diagnostics
 * `checkText` (raison par tag, `guideHrefExists` pour les liens `{L}`). L'APERÇU
 * est rendu côté client depuis les refs — ici on ne fait que la résolution
 * fidèle contre les données du site. 403 en prod.
 */
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { text } = (await req.json()) as { text?: string };
  const checks: TagCheck[] = checkText(text ?? '', { guideHrefExists });
  return NextResponse.json({ checks });
}
