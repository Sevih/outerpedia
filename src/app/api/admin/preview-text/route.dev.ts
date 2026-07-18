import { NextResponse } from 'next/server';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getT } from '@/i18n';
import { normalizeLang } from '@/lib/i18n/config';
import { parseText, checkText, type TagCheck } from '@/lib/parse-text';
import { getGuide } from '@/lib/data/guides';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { IS_DEV } from '@/lib/admin/guard';

// Node runtime : react-dom/server + lectures disque des data layers.
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
 * Aperçu + validation d'un texte éditorial inline (outil admin). Rend
 * `parseText` en HTML statique (mêmes chips/couleurs/erreurs rouges que le site)
 * et renvoie les diagnostics `checkText` (raison par tag). 403 en prod.
 */
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { text, lang: rawLang } = (await req.json()) as { text?: string; lang?: string };
  const lang = normalizeLang(rawLang ?? 'en');
  const t = await getT(lang);

  let html = '';
  try {
    html = renderToStaticMarkup(createElement(Fragment, null, parseText(text ?? '', { lang, t })));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  const checks: TagCheck[] = checkText(text ?? '', { guideHrefExists });
  return NextResponse.json({ html, checks });
}
