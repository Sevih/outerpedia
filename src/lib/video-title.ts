import { GUIDE_CATEGORIES } from '@/lib/data/guide-categories';

/**
 * Nettoyage des titres de vidéos À L'AFFICHAGE — la donnée garde le titre
 * YouTube tel quel (c'est ce que l'auteur a écrit, et il sert au SEO et au
 * `title` de l'iframe).
 *
 * Les titres viennent des créateurs, qui y mettent de quoi être trouvés : le nom
 * du jeu et celui du mode. Sur la page du mode en question, ces mots sont déjà
 * dits par la page elle-même, et ils coûtent la moitié de la place — « Dimensional
 * Singularity KSAI - Regina/Roxie Team | Outerplane » (61 caractères) tient dans
 * un onglet à « KSAI - Regina/Roxie Team » (24). Les onglets du lecteur sont le
 * cas qui pique : plusieurs libellés côte à côte, dont seule la fin distingue.
 *
 * On RETIRE à l'affichage plutôt que de reprendre les titres un par un : il y en
 * a 132, chaque vidéo ajoutée en apporte un nouveau, et le nom du mode revient
 * dans presque tous.
 */

/** Nom du JEU (le site, lui, est « Outerpedia »). */
export const GAME_NAME = 'Outerplane';

/** `a - b` → `a` et `b` : séparateurs qu'un retrait peut laisser orphelins. */
const SEP = '-–—|:';

/**
 * Les motifs sont DÉRIVÉS des catégories de guides (`label.en`), jamais recopiés :
 * un mode ajouté au jeu est nettoyé sans que personne y pense, et un mode
 * renommé ne laisse pas une liste périmée derrière lui.
 *
 * Du plus long au plus court, pour qu'un motif inclus dans un autre ne le
 * décapite pas d'abord.
 */
const NOISE: readonly string[] = [
  ...Object.values(GUIDE_CATEGORIES).map((c) => c.label.en),
  GAME_NAME,
].sort((a, b) => b.length - a.length);

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Un motif tolère PLUSIEURS espaces entre ses mots : les titres réels en ont
 * (« Dimensional Singularity  - Rin/Lambda Team »), et un motif à espace unique
 * passerait à côté.
 */
const PATTERNS: readonly RegExp[] = NOISE.map(
  (m) => new RegExp(`\\b${escape(m).split(/\s+/).join('\\s+')}\\b`, 'gi'),
);

/**
 * Le titre débarrassé du nom du jeu, des noms de modes et de ce que leur retrait
 * laisse derrière. Rend le titre d'origine si le nettoyage ne laisserait rien de
 * lisible — mieux vaut un libellé bavard qu'un libellé vide.
 */
export function cleanVideoTitle(title: string): string {
  let out = title;
  for (const p of PATTERNS)
    out = out.replace(p, (m, ...rest) => {
      const offset = rest[rest.length - 2] as number;
      const whole = rest[rest.length - 1] as string;
      const avant = whole.slice(0, offset).trimEnd();
      const apres = whole.slice(offset + m.length).trim();
      // Un motif qui TERMINE le titre sans séparateur devant lui appartient à la
      // phrase, il ne l'étiquette pas : « … Testing, and New World Boss » se
      // réduirait à « … and New ». Précédé d'un séparateur (« Skuld — Dimensional
      // Singularity »), c'est bien une étiquette, et elle part.
      return !apres && avant && !new RegExp(`[${SEP}]$`).test(avant) ? m : ' ';
    });

  out = out
    // Crochets et parenthèses vidés de leur contenu (« … [Outerplane] »).
    .replace(/[([{]\s*[)\]}]/g, ' ')
    // Séparateurs devenus consécutifs : le PREMIER fait foi (« - : » → « - »).
    .replace(new RegExp(`([${SEP}])(\\s*[${SEP}])+`, 'g'), '$1')
    // Séparateur qui ne sépare plus rien, avant une ponctuation ou la fin.
    .replace(new RegExp(`[${SEP}]\\s*(?=[!?.,]|$)`, 'g'), '')
    .replace(/\s+/g, ' ')
    // Bords : un titre ne commence ni ne finit par un séparateur.
    .replace(new RegExp(`^[\\s${SEP},.]+`), '')
    .replace(new RegExp(`[\\s${SEP},]+$`), '')
    // Espace avant une ponctuation collée au mot d'avant (« DStella ! »).
    .replace(/\s+([!?.,:;])/g, '$1')
    .trim();

  // Un titre qui n'était QUE du bruit (« Outerplane - World Boss ») se garde
  // entier : il vaut encore mieux que rien du tout.
  return out.length ? out : title;
}
