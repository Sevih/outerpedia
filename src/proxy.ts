import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LANG, isValidLang } from '@/lib/i18n/config';

/**
 * CSP stricte (nonce + strict-dynamic) servie en REPORT-ONLY — PASSE 1. Elle ne
 * bloque RIEN : la politique réelle reste celle de `next.config.ts` (avec
 * `'unsafe-inline'`), inchangée. Le navigateur évalue celle-ci EN PLUS et remonte
 * ce qu'elle casserait à `/api/csp-report`, sur le trafic réel. On bascule en
 * réel (PASSE 3) quand les rapports ne montrent plus que du bruit d'extensions.
 * `style-src` garde `'unsafe-inline'` même en cible : React pose des styles
 * inline sans nonce, et les styles ne sont pas un vecteur XSS majeur — on durcit
 * les SCRIPTS. Voir aussi src/app/api/csp-report/route.ts.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // strict-dynamic : seuls les scripts porteurs du nonce (et leur cascade)
    // s'exécutent ; les listes de hosts sont alors ignorées par le navigateur.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com",
    "media-src 'self' https://*.youtube.com https://cdn.discordapp.com",
    "frame-src 'self' https://*.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
    // report-uri : Firefox/Safari (format historique) ; report-to : Chrome (API
    // moderne, nomme l'endpoint déclaré par l'en-tête `Reporting-Endpoints`).
    'report-uri /api/csp-report',
    'report-to csp-endpoint',
  ].join('; ');
}

/**
 * Sert une page en posant la CSP Report-Only. Le nonce doit se retrouver sur NOS
 * <script> (ceux de Next), sinon ils seraient signalés comme violations : Next
 * le pose tout seul dès qu'il lit une CSP sur les en-têtes de REQUÊTE — d'où le
 * `Content-Security-Policy` glissé côté requête (interne, jamais renvoyé au
 * navigateur, qui ne voit que le `-Report-Only`).
 */
function withCsp(request: NextRequest, rewriteTo?: URL): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const init = { request: { headers: requestHeaders } };

  const res = rewriteTo ? NextResponse.rewrite(rewriteTo, init) : NextResponse.next(init);
  res.headers.set('Content-Security-Policy-Report-Only', csp);
  res.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/csp-report"');
  return res;
}

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
  //
  // ⚠️ CE GARDE-FOU TUE AUSSI LES FICHIERS STATIQUES DE `public/` posés à la
  // RACINE : `/apple-touch-icon.png` renvoyait 404 alors que le fichier existait
  // et que le <head> le référençait. Tout asset servi depuis `public/` doit donc
  // vivre sous un préfixe AUTORISÉ ci-dessus (`/images`, `/icons`, `/audio`) —
  // c'est le cas des icônes, cf. `metadata.icons` dans src/app/layout.tsx.
  // (`favicon.ico` échappe à tout : le `matcher` du proxy l'exclut nommément.)
  if (pathname.startsWith('/.') || pathname.includes('.')) {
    return new NextResponse(null, { status: 404 });
  }

  // --- Sous-domaine → réécriture de path ---
  const host = request.headers.get('host') ?? '';
  const subdomain = extractSubdomain(host);

  if (subdomain && isValidLang(subdomain)) {
    const firstSegment = pathname.split('/')[1];
    if (isValidLang(firstSegment)) return withCsp(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname}`;
    return withCsp(request, url);
  }

  // --- Domaine racine (pas de sous-domaine) = langue par défaut ---
  const firstSegment = pathname.split('/')[1];

  // Préfixe langue par défaut → redirige pour le retirer (URL propre). 308
  // PERMANENT : c'est de la structure d'URL, pas un détour temporaire — le 307
  // par défaut poussait les crawlers à revenir (audit Sitebulb 20/07).
  if (firstSegment === DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LANG}`.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  // Préfixe d'une autre langue (dev path-based) → laisse passer.
  if (isValidLang(firstSegment)) return withCsp(request);

  // Pas de préfixe → réécriture interne avec la langue par défaut.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname}`;
  return withCsp(request, url);
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
