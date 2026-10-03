/**
 * Limitation de débit par IP, en mémoire. Un seul process Node sert la prod
 * (pas de multi-instance), la Map suffit.
 *
 * Un limiteur PAR ROUTE (factory) et pas une Map partagée : chaque route
 * consommatrice a son propre quota, un abus sur l'une ne ferme pas l'autre.
 *
 * La Map est BORNÉE (`maxEntries`) : au-delà, les entrées expirées partent
 * d'abord, puis les plus anciennes. Sans borne, un flot d'IP distinctes la
 * ferait grossir sans fin — le nettoyage des seules expirées tournait à vide.
 */
export function createRateLimiter({ windowMs = 60_000, max = 30, maxEntries = 1000 } = {}) {
  const hits = new Map<string, { n: number; reset: number }>();

  return function rateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = hits.get(ip);
    if (entry && entry.reset >= now) {
      entry.n += 1;
      return entry.n > max;
    }
    // Réinsertion en fin de Map : l'ordre d'itération reste l'ordre d'ouverture
    // des fenêtres, donc « le premier » est toujours le plus ancien.
    hits.delete(ip);
    if (hits.size >= maxEntries) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
      for (const k of hits.keys()) {
        if (hits.size < maxEntries) break;
        hits.delete(k);
      }
    }
    hits.set(ip, { n: 1, reset: now + windowMs });
    return false;
  };
}

/**
 * IP du visiteur, telle que Caddy la pose (audit S1).
 *
 * `X-Real-Client-IP` est ÉCRASÉ par Caddy (`sevih-tool/stack/Caddyfile`,
 * snippet `client_ip`) : la valeur de `CF-Connecting-IP` quand le pair est
 * Cloudflare, l'IP du pair sinon (`zh` en nuage gris). Un visiteur ne peut pas
 * le fournir.
 *
 * Repli (dev local, Caddy pas encore redéployé) : la DERNIÈRE valeur de
 * `X-Forwarded-For`, celle que le proxy ajoute lui-même. Jamais la première :
 * derrière un proxy qui fait suivre l'en-tête, c'est le visiteur qui l'écrit.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get('x-real-client-ip')?.trim();
  if (real) return real;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return forwarded || 'unknown';
}
