import mysql from 'mysql2/promise';

/**
 * Accès MySQL (portage V2) — UNIQUEMENT pour les fonctionnalités de partage
 * (tier-list, plus tard équipes). Tout le reste du site est statique/fichiers.
 *
 * La config vient de l'environnement (`DB_*`, câblés dans le compose du VPS —
 * repo sevih-tool). Sans elle (dev local), `getDbConnection()` rend `null` et
 * chaque fonctionnalité DOIT dégrader proprement (le partage tier-list retombe
 * sur le lien long autoporté).
 */
function dbConfig(): mysql.ConnectionOptions | null {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) return null;
  return {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD ?? '',
    database: DB_NAME,
    connectTimeout: 10_000,
  };
}

/**
 * Connexion ÉPHÉMÈRE, une par requête, ou `null` si l'env n'est pas configuré.
 * L'appelant DOIT la fermer (`await conn.end()`).
 *
 * Une connexion par requête plutôt qu'un pool : un pool face à un MySQL dont
 * les TCP inactifs sont coupés distribue des sockets morts (requête qui pend
 * puis 500 — vécu en V2). Le volume du partage est faible, les ~quelques ms de
 * connexion (réseau Docker interne) sont indolores.
 */
export async function getDbConnection(): Promise<mysql.Connection | null> {
  const cfg = dbConfig();
  if (!cfg) return null;
  return mysql.createConnection(cfg);
}
