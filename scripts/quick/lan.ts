/**
 * lan — qui a le droit de parler à quick quand il s'ouvre à l'autre PC.
 *
 * quick n'écoutait que sur la boucle locale. Avec `DEV_PEERS` dans
 * `.env.local` (les adresses du fixe et du portable, cf. scripts/dev-caddy.mjs)
 * il écoute sur le réseau, pour que le Caddy de l'autre poste le relaie sous
 * `https://quick.outerpedia.local`. Or chaque geste committe ET pousse `main`,
 * et l'onglet Discord poste avec le jeton du bot : deux gardes, pures, testées.
 *
 *   - l'ADRESSE qui se connecte : la boucle locale ou un poste déclaré, rien
 *     d'autre du réseau ;
 *   - l'ORIGINE d'une requête qui écrit : une page d'un autre site ouverte dans
 *     le navigateur peut viser `localhost:4747` sans rien lire de la réponse —
 *     l'effet, lui, aurait lieu. Le navigateur signe ces requêtes d'un en-tête
 *     `Origin` ; on refuse celles qui ne viennent pas de la page de quick.
 */

/** Le nom sous lequel Caddy sert quick, sur les deux postes (Caddyfile.dev). */
export const QUICK_HOST = 'quick.outerpedia.local';

/** `DEV_PEERS` : adresses séparées par des virgules ou des espaces. */
export function parsePeers(raw: string | undefined): string[] {
  return (raw ?? '').split(/[\s,]+/).filter(Boolean);
}

/** Node rend une IPv4 reçue sur une socket double pile sous la forme `::ffff:a.b.c.d`. */
const bare = (address: string) => address.replace(/^::ffff:/, '');

export function isAllowedRemote(address: string | undefined, peers: string[]): boolean {
  if (!address) return false;
  const a = bare(address);
  return a === '127.0.0.1' || a === '::1' || peers.includes(a);
}

/**
 * Une requête sans `Origin` n'est pas celle d'une page (curl, le lanceur) : la
 * garde d'adresse suffit. Avec, elle doit venir de la page de quick elle-même.
 */
export function isAllowedOrigin(origin: string | undefined, port: number): boolean {
  if (!origin) return true;
  return [`http://localhost:${port}`, `http://127.0.0.1:${port}`, `https://${QUICK_HOST}`].includes(
    origin,
  );
}
