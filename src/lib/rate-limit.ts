/**
 * Limitation de débit par IP, en mémoire — même réglage que la V2. Un seul
 * process Node sert la prod (pas de multi-instance), la Map suffit.
 *
 * Un limiteur PAR ROUTE (factory) et pas une Map partagée : chaque route
 * consommatrice a son propre quota, un abus sur l'une ne ferme pas l'autre.
 */
export function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map<string, { n: number; reset: number }>();

  return function rateLimited(ip: string): boolean {
    const now = Date.now();
    if (hits.size > 1000) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }
    const entry = hits.get(ip);
    if (!entry || entry.reset < now) {
      hits.set(ip, { n: 1, reset: now + windowMs });
      return false;
    }
    entry.n += 1;
    return entry.n > max;
  };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
