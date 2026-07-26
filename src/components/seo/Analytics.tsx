/**
 * Cloudflare Web Analytics — beacon posé À LA MAIN, volontairement.
 *
 * Cloudflare sait l'injecter tout seul, mais SEULEMENT si le trafic traverse
 * son proxy (nuage orange). Depuis la bascule du 21/07/2026 le nuage est GRIS
 * (Caddy termine le TLS) : l'injection automatique ne se produit plus et le
 * site a mesuré zéro visite jusqu'au 22/07. Le snippet manuel, lui, fonctionne
 * dans les deux cas — il survivra donc au retour éventuel au nuage orange.
 *
 * ⚠ Si le nuage repasse en orange : laisser le mode « JS Snippet installation »
 * dans le dashboard Web Analytics. Réactiver l'injection automatique ferait
 * charger le beacon DEUX fois (pages vues comptées double).
 *
 * Le token n'est PAS un secret : il part en clair dans le HTML de chaque page,
 * c'est un identifiant de site. Il est baké au build (`NEXT_PUBLIC_*`), donc
 * figé dans le Dockerfile côté prod ; absent en dev, exprès, pour ne pas
 * polluer les statistiques avec le trafic local.
 *
 * CSP : `static.cloudflareinsights.com` est autorisé en `script-src` et
 * `cloudflareinsights.com` en `connect-src` (next.config.ts) — l'allowlist
 * d'hôtes suffit. (Le durcissement nonce + strict-dynamic, qui aurait ignoré
 * cette allowlist et exigé un nonce ici, a été abandonné : cf. src/proxy.ts.)
 */
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function Analytics() {
  if (!BEACON_TOKEN) return null;
  return (
    // `defer` est redondant avec `type="module"` (déjà différé par la spec), mais
    // il l'énonce — et satisfait `@next/next/no-sync-scripts`, qui ne sait pas
    // lire l'implicite. Mieux qu'un eslint-disable : la règle a raison sur le fond.
    <script
      type="module"
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
    />
  );
}
