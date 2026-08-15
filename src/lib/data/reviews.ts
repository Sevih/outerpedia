/**
 * Reviews communautaires — lues sur l'API du bot Discord (outerbot), qui
 * indexe le forum #hero-reviews du serveur EvaMains dans sa base SQLite.
 *
 * `BOT_API_URL` = réseau Docker interne en prod (http://outerbot:3001) ;
 * absent en dev et au build CI. Toute erreur (bot injoignable, réponse non-OK)
 * rend `[]` : la fiche se rend alors sans section Reviews, elle ne casse
 * jamais. Revalidation courte (60 s, inchangée) : c'est la seule donnée de
 * la fiche qui bouge sans redéploiement.
 */

/** Contrat HTTP du bot (`GET /reviews/:slug`) — inchangé depuis l'ancien bot. */
export interface Review {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  /** Hash d'avatar Discord (null = avatar par défaut dérivé de l'id). */
  avatar: string | null;
  rating: number;
  text: string;
  /** Votes 👍/👎 nets (amorce du bot déduite). */
  score: number;
  source: string;
  timestamp: string;
}

const BOT_API_URL = (process.env.BOT_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

/**
 * Reviews d'un perso, triées par le bot (score puis date). `[]` en toute erreur.
 *
 * Timeout indispensable ici : le bot est un service SÉPARÉ du VPS, et un
 * conteneur en cours de démarrage accepte la connexion sans répondre — cas où
 * le `catch` ne voit rien et où `fetch` pend. Comme cet appel est awaité au
 * rendu de la FICHE PERSO (avec `revalidate: 60`, donc très souvent), une
 * indisponibilité du bot suspendrait la régénération de toutes les fiches.
 * 2 s : les reviews sont un complément, la fiche se rend très bien sans.
 */
export async function getReviewsForCharacter(slug: string): Promise<Review[]> {
  try {
    const res = await fetch(`${BOT_API_URL}/reviews/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return [];
    return (await res.json()) as Review[];
  } catch {
    return [];
  }
}
