/**
 * Audit SEO / perf / accessibilité / bonnes pratiques de TOUT le site, en local.
 *
 * Amorçage automatique : en dev, `/sitemap.xml` émet déjà les URLs
 * `localhost:3000/en/…` (cf. `buildUrl` dans src/lib/seo.ts), et `robots.txt`
 * pointe dessus + exclut /admin, /api, /dev. Unlighthouse découvre donc toutes
 * les pages seul — rien à lister à la main.
 *
 * Lancement :
 *   1. garder `pnpm dev` en marche (site sur :3000) ;
 *   2. `pnpm seo:audit` → un dashboard s'ouvre, le crawl défile, rapport trié
 *      par score avec le détail des problèmes page par page.
 *
 * ⚠️ En mode dev, le score PERF n'est qu'indicatif (code non minifié, HMR,
 * React en mode dev). SEO / accessibilité / JSON-LD / bonnes pratiques sont
 * eux fiables. Pour un score perf réaliste, il faut auditer un build de prod
 * (`pnpm build && pnpm start`) — à mettre en place dans un second temps.
 *
 * NB : pas d'import `defineConfig` — le paquet `unlighthouse` (wrapper CLI)
 * n'expose pas de point d'entrée module (ERR_PACKAGE_PATH_NOT_EXPORTED). Le
 * loader de config (c12) lit simplement ce `default export`.
 */
export default {
  site: 'http://localhost:3000',
  scanner: {
    // Une seule langue suffit pour le signal SEO/JSON-LD (mêmes gabarits pour
    // les 5 locales) : on garde `en` et on saute fr/jp/kr/zh, sinon ×5 le scan.
    exclude: ['/fr(/.*)?$', '/jp(/.*)?$', '/kr(/.*)?$', '/zh(/.*)?$'],
  },
};
