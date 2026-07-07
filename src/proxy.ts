import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LANG, isValidLang } from '@/lib/i18n/config';

/**
 * Proxy i18n par SOUS-DOMAINE :
 *   jp.outerpedia.com/characters → réécrit vers /jp/characters
 *   outerpedia.com/characters    → réécrit vers /en/characters
 *   outerpedia.com/en/…          → redirige vers outerpedia.com/… (retire le défaut)
 * En dev (localhost) : routing par PATH (/jp/…), le défaut sans préfixe.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Assets statiques, API, outils locaux (admin/dev) : on ne touche pas.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dev') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/feed')
  ) {
    return NextResponse.next();
  }

  // Fichiers générés par Next (sitemap/robots/manifest/sw/llms).
  if (
    /^\/(sitemap.*\.xml|robots\.txt|manifest\.(json|webmanifest)|sw\.js|llms\.txt)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Sondes de bots / requêtes de fichiers (contiennent un point) → 404, sinon
  // elles matcheraient [lang] et provoqueraient des MODULE_NOT_FOUND.
  if (pathname.startsWith('/.') || pathname.includes('.')) {
    return new NextResponse(null, { status: 404 });
  }

  // --- Sous-domaine → réécriture de path ---
  const host = request.headers.get('host') ?? '';
  const subdomain = extractSubdomain(host);

  if (subdomain && isValidLang(subdomain)) {
    const firstSegment = pathname.split('/')[1];
    if (isValidLang(firstSegment)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Domaine racine (pas de sous-domaine) = langue par défaut ---
  const firstSegment = pathname.split('/')[1];

  // Préfixe langue par défaut → redirige pour le retirer (URL propre).
  if (firstSegment === DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LANG}`.length) || '/';
    return NextResponse.redirect(url);
  }

  // Préfixe d'une autre langue (dev path-based) → laisse passer.
  if (isValidLang(firstSegment)) return NextResponse.next();

  // Pas de préfixe → réécriture interne avec la langue par défaut.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname}`;
  return NextResponse.rewrite(url);
}

/** Extrait le sous-domaine de l'hôte (« jp.outerpedia.com » → « jp »). */
function extractSubdomain(host: string): string | null {
  const parts = host.split(':')[0].split('.');
  if (parts.length < 3) return null;
  const sub = parts[0];
  return sub === 'www' ? null : sub;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
