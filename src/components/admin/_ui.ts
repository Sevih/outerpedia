/**
 * Primitives de style de l'ADMIN — les classes Tailwind que les écrans se
 * recopiaient. Avant extraction : `btn` déclaré 17×, `input` 11×, `field` 7×,
 * `label` 6× (audit du 07/08). Aucune n'était importée d'ailleurs — les
 * quelques `export const btn` existants n'avaient aucun consommateur.
 *
 * Règle : on n'unifie QUE des chaînes strictement identiques. Les variantes
 * réelles (largeur, couleur explicite) se composent à l'appel — voir `input`.
 * Unifier « à peu près » aurait changé l'apparence sans le dire.
 *
 * Dev-only : ces écrans ne sont pas dans le build de prod (`.dev.tsx` +
 * garde `IS_DEV`). Le gain est de maintenance, pas de bundle.
 */

/** Bouton d'action standard (14 écrans à l'identique). */
export const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';

/**
 * Champ de saisie NU. Trois variantes coexistaient, qui n'en sont que des
 * sur-ensembles : on garde la base ici et chaque site ajoute ce qu'il avait —
 * `text-content` (redondant avec l'héritage du body, mais conservé tel quel
 * pour ne rien changer), `max-w-xs`. Voir `inputFull` pour la pleine largeur.
 */
export const input =
  'rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Champ de saisie en colonne (le cas le plus courant). */
export const inputFull = `w-full ${input}`;

/** Champ de formulaire large — plus aéré que `input` (4 éditeurs curés). */
export const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';

/** Intitulé de section d'un éditeur (6 écrans à l'identique). */
export const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';
