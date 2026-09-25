import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LANG, isValidLang, langBySubdomain } from '@/lib/i18n/config';
import { LANG_ROUTING } from '@/lib/site';

/**
 * CSP : servie STATIQUEMENT par `next.config.ts` (headers globaux) ; le proxy ne
 * s'en occupe plus. L'expérience « nonce + strict-dynamic en Report-Only » a été
 * CONCLUANTE mais NÉGATIVE : les rapports ont montré que TOUTES nos pages (ISR)
 * bloquaient leurs propres scripts (chunks `_next` + inline `__next_f`), car un
 * nonce par-requête ne peut pas correspondre au nonce baké dans un HTML mis en
 * cache. Le nonce impose le rendu dynamique — inacceptable pour un wiki ISR — et
 * le payload RSC inline n'est pas hashable (il change à chaque page). On reste
 * donc sur `'unsafe-inline'` côté script (défendable : données curées, aucun
 * contenu utilisateur réinjecté dans le DOM, pas de session publique). Report-Only
 * et le collecteur `/api/csp-report` ont été retirés. Détail : docs/DONE.md.
 */

/**
 * Proxy i18n par SOUS-DOMAINE :
 *   jp.outerpedia.com/characters → réécrit vers /jp/characters
 *   kr.outerpedia.com/zh/…       → redirige vers kr.outerpedia.com/… (le sous-domaine fait foi)
 *   outerpedia.com/characters    → réécrit vers /en/characters
 *   outerpedia.com/en/…          → redirige vers outerpedia.com/… (retire le défaut)
 * En dev (localhost, sans sous-domaine) : langue par défaut ; routing par PATH
 * (/jp/…) réservé au staging (`LANG_ROUTING=path`), le défaut sans préfixe.
 *
 * Mode `path` seulement : les liens internes sont SANS préfixe par construction
 * (en prod, le sous-domaine porte la langue) — sans mémoire, chaque navigation
 * retomberait sur le défaut. Le cookie `lang` la porte d'une page à l'autre :
 *   /fr/…               → laisse passer, pose `lang=fr`
 *   /… + cookie `lang=fr` → 307 vers /fr/… (état utilisateur, pas structure d'URL)
 *   /en/…               → 308 vers /… ET efface le cookie (retour au défaut)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Assets statiques, API, outils locaux (admin/dev) : on ne touche pas.
  // `/s/` : le raccourcisseur (src/app/s/[id]) vit à la RACINE, hors langue —
  // le chemin stocké est sans préfixe, c'est le sous-domaine qui porte la
  // langue. Réécrit en /{lang}/s/…, la route ne serait jamais atteinte.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dev') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/feed') ||
    pathname.startsWith('/s/')
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
  // c'est le cas des icônes, cf. `metadata.icons` dans src/app/[lang]/layout.tsx.
  // (`favicon.ico` échappe à tout : le `matcher` du proxy l'exclut nommément.)
  if (pathname.startsWith('/.') || pathname.includes('.')) {
    return new NextResponse(null, { status: 404 });
  }

  // --- Sous-domaine → réécriture de path ---
  const host = request.headers.get('host') ?? '';
  const subdomain = extractSubdomain(host);
  const hostLang = subdomain ? langBySubdomain(subdomain) : undefined;

  if (hostLang) {
    const firstSegment = pathname.split('/')[1];
    // Le SOUS-DOMAINE fait foi. Un préfixe de langue dans le path (vieux lien
    // path-based, ou switcher d'avant le passage aux sous-domaines) entre en
    // conflit avec lui : on le RETIRE et on redirige vers l'URL propre du MÊME
    // sous-domaine, servie dans SA langue — kr.outerpedia.com/zh →
    // kr.outerpedia.com/ (coréen), plus de contenu d'une AUTRE langue sur `kr`.
    // 308 : structure d'URL, comme le retrait du préfixe par défaut sur l'apex.
    if (isValidLang(firstSegment)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(`/${firstSegment}`.length) || '/';
      return NextResponse.redirect(url, 308);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${hostLang}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Domaine racine (pas de sous-domaine) = langue par défaut ---
  const firstSegment = pathname.split('/')[1];

  // Préfixe langue par défaut → redirige pour le retirer (URL propre). 308
  // PERMANENT : c'est de la structure d'URL, pas un détour temporaire — le 307
  // par défaut poussait les crawlers à revenir (audit Sitebulb 20/07).
  if (firstSegment === DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LANG}`.length) || '/';
    const res = NextResponse.redirect(url, 308);
    if (LANG_ROUTING === 'path') {
      // C'est par /en/… que le switcher revient au défaut : sans l'effacement,
      // la règle du cookie renverrait aussitôt /… vers l'ancienne langue. Le
      // navigateur met une 308 en cache sans en-tête contraire — le retour
      // suivant n'atteindrait plus le proxy et le cookie survivrait.
      res.cookies.delete(LANG_COOKIE);
      res.headers.set('Cache-Control', 'no-store');
    }
    return res;
  }

  // Préfixe d'une autre langue (dev path-based) → laisse passer, et la
  // retient pour les liens sans préfixe qui suivront.
  if (isValidLang(firstSegment)) {
    const res = NextResponse.next();
    if (LANG_ROUTING === 'path' && request.cookies.get(LANG_COOKIE)?.value !== firstSegment) {
      res.cookies.set(LANG_COOKIE, firstSegment, LANG_COOKIE_OPTIONS);
    }
    return res;
  }

  // Pas de préfixe + langue retenue → vers le chemin préfixé. 307 TEMPORAIRE :
  // c'est un état de CE visiteur, pas la structure de l'URL. La query suit
  // (clone de `nextUrl`) ; le #hash ne traverse pas le serveur, le navigateur
  // le garde sur une redirection.
  const remembered = LANG_ROUTING === 'path' ? request.cookies.get(LANG_COOKIE)?.value : undefined;
  if (remembered && remembered !== DEFAULT_LANG && isValidLang(remembered)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${remembered}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // Pas de préfixe → réécriture interne avec la langue par défaut.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname}`;
  return NextResponse.rewrite(url);
}

/** Langue retenue en mode `path` (cf. l'en-tête de `proxy`). */
const LANG_COOKIE = 'lang';
const LANG_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365,
} as const;

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
