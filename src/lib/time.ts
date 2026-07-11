/**
 * L'INSTANT DU RENDU SERVEUR — point d'entrée unique du temps présent.
 *
 * Passer par ici (plutôt que d'appeler `new Date()` un peu partout) donne deux
 * choses :
 *
 * 1. Un rendu qui en dépend est GREPPABLE. Toute page qui appelle `serverNow()`
 *    est une page qui périme toute seule : elle DOIT figurer dans les routes
 *    purgées par `/api/revalidate` (cron 00:05 UTC), sinon son ISR de 24 h la
 *    laissera mentir des heures après une bascule du jeu. Oublier ce lien est
 *    exactement l'erreur silencieuse qu'on traque.
 * 2. Un point d'injection pour les tests (la logique qui consomme l'instant est
 *    pure et reçoit `now` en paramètre — cf. `seasonStandingAt`).
 *
 * Réservé au SERVEUR. Côté client, lire l'heure pendant le rendu est impur
 * (React peut re-rendre à tout moment) : il faut un store externe. Côté
 * serveur, le rendu est un instantané unique — aucune instabilité possible.
 */
export function serverNow(): Date {
  return new Date();
}
