/**
 * Clé de comptage d'une IP : l'adresse elle-même en IPv4, son préfixe `/64` en
 * IPv6. Un même accès reçoit d'ordinaire tout un `/64` (box, serveur loué) :
 * compter par adresse complète lui donnerait autant de quotas que d'adresses.
 * Une IPv4 notée en IPv6 (`::ffff:1.2.3.4`) compte comme l'IPv4. Une valeur
 * illisible (« unknown ») est sa propre clé.
 */
export function rateKey(ip: string): string {
  const raw = ip
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/%.*$/, '');
  if (!raw.includes(':')) return raw;
  const mapped = /^([0:]*(?:ffff)?):(\d{1,3}(?:\.\d{1,3}){3})$/.exec(raw);
  if (mapped) return mapped[2];
  const halves = raw.split('::');
  if (halves.length > 2) return raw;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return raw;
  const groups = [...head, ...Array<string>(missing).fill('0'), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return raw;
  return `${groups
    .slice(0, 4)
    .map((g) => parseInt(g, 16).toString(16))
    .join(':')}::/64`;
}

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
 *
 * Le compte se fait par `rateKey` : par adresse en IPv4, par `/64` en IPv6.
 */
export function createRateLimiter({ windowMs = 60_000, max = 30, maxEntries = 1000 } = {}) {
  const hits = new Map<string, { n: number; reset: number }>();

  return function rateLimited(ip: string): boolean {
    const now = Date.now();
    const key = rateKey(ip);
    const entry = hits.get(key);
    if (entry && entry.reset >= now) {
      entry.n += 1;
      return entry.n > max;
    }
    // Réinsertion en fin de Map : l'ordre d'itération reste l'ordre d'ouverture
    // des fenêtres, donc « le premier » est toujours le plus ancien.
    hits.delete(key);
    if (hits.size >= maxEntries) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
      for (const k of hits.keys()) {
        if (hits.size < maxEntries) break;
        hits.delete(k);
      }
    }
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  };
}

/**
 * Quota GLOBAL d'écritures par fenêtre, toutes IP confondues : vrai quand
 * l'appel dépasse `max`. Appelé juste avant l'insertion (contenu déjà validé),
 * il plafonne le nombre de lignes qu'une route ajoute par minute, quel que soit
 * le nombre d'adresses qui écrivent.
 */
export function createWriteQuota({ windowMs = 60_000, max = 60 } = {}) {
  let n = 0;
  let reset = 0;

  return function quotaExceeded(): boolean {
    const now = Date.now();
    if (reset < now) {
      n = 0;
      reset = now + windowMs;
    }
    n += 1;
    return n > max;
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
export function clientIp(request: { headers: Pick<Headers, 'get'> }): string {
  const real = request.headers.get('x-real-client-ip')?.trim();
  if (real) return real;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return forwarded || 'unknown';
}
