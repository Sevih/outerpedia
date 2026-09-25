/**
 * Briques communes aux flux RSS (`/feed`, `/feed/changelog`) — les routes
 * assemblent leur XML à la main, ces deux fonctions en sont la partie partagée.
 */

/** Échappe les 5 entités XML — titres/descriptions sont du texte libre. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * `YYYY-MM-DD` → date RFC-822 (format attendu par les lecteurs RSS), à minuit
 * UTC. Une entrée hors de ce format ne lève pas : elle rend `"Invalid Date"`.
 */
export function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}
