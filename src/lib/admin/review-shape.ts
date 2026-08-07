/**
 * FORME des reviews « Premium & Limited » — types + normalisation, sans aucune
 * I/O. Module volontairement PUR : il est importé des DEUX côtés de la
 * frontière admin.
 *
 * Pourquoi il existe : `normalizeReview` était écrit deux fois, à l'identique
 * (audit du 07/08) — une fois dans `general-guide-store.ts` (serveur : il lit
 * et écrit les JSON du guide) et une fois dans `PremiumLimitedParts.tsx`
 * (client, brique PARTAGÉE avec les outils publics de `/contribute`). Ce
 * n'était pas de la négligence : la brique client ne PEUT PAS importer le store,
 * qui tire `node:fs`. La seule dédup correcte passe donc par un module sans I/O
 * — exactement ce que réclame le message `SHARED_BRICK_MSG` d'eslint.config.mjs
 * (« sors la fonction concernée dans un module admin-only »).
 *
 * RÈGLE : ne JAMAIS importer ici `node:fs`, `node:path`, une server action ni
 * quoi que ce soit dont la sûreté repose sur `IS_DEV`. Ce fichier part dans le
 * bundle de production.
 */
import type { LocalizedText } from '@contracts';

/** Étoiles de transcendance notées par les reviews. */
export const STARS = ['3', '4', '5', '6'] as const;
export type StarKey = (typeof STARS)[number];

export interface ReviewEntryData {
  name: string;
  review: LocalizedText;
  /** Cibles de transcendance recommandées (texte éditorial : « 4 to 5 », « Any »…). */
  recommendedPve: string;
  recommendedPvp: string;
  /** Note éditoriale (1-5) par étoile de transcendance, PvE/PvP. */
  impact: Record<StarKey, { pve: string; pvp: string }>;
  /**
   * Perso PAS ENCORE SORTI (absent de la data du site) : la review est rédigée
   * d'avance (contribution). On N'exige PAS que le nom résolve, et le rendu du
   * guide SAUTE l'entrée tant que le perso n'existe pas — elle apparaît toute
   * seule à la sortie (cf. `reviewCards`).
   */
  unreleased?: boolean;
}

/** Grille d'impact vide (les 4 étoiles présentes, PvE et PvP). */
export const emptyImpact = (): ReviewEntryData['impact'] => ({
  '3': { pve: '', pvp: '' },
  '4': { pve: '', pvp: '' },
  '5': { pve: '', pvp: '' },
  '6': { pve: '', pvp: '' },
});

/** Review vierge (formulaire neuf). */
export const emptyReview = (): ReviewEntryData => ({
  name: '',
  review: { en: '' },
  recommendedPve: '',
  recommendedPvp: '',
  impact: emptyImpact(),
});

/**
 * Normalise une review chargée/importée : grille d'impact complète, champs
 * toujours présents. L'entrée vient d'un JSON externe (export de contributeur)
 * — donc `Partial`, et rien n'est supposé là.
 */
export function normalizeReview(r: Partial<ReviewEntryData>): ReviewEntryData {
  const impact = emptyImpact();
  for (const s of STARS) {
    const cell = r.impact?.[s];
    if (cell) impact[s] = { pve: cell.pve ?? '', pvp: cell.pvp ?? '' };
  }
  return {
    name: r.name ?? '',
    review: r.review ?? { en: '' },
    recommendedPve: r.recommendedPve ?? '',
    recommendedPvp: r.recommendedPvp ?? '',
    impact,
    ...(r.unreleased ? { unreleased: true } : {}),
  };
}

/**
 * Un texte localisé porte-t-il quelque chose ? (au moins une langue non vide)
 *
 * Le garde `typeof x === 'string'` n'est pas décoratif : ces objets viennent
 * aussi d'un JSON importé à la main, où une valeur peut être un nombre ou
 * `null` — `x.trim()` jetterait. C'était la variante défensive des deux copies
 * fusionnées ici, on garde la plus sûre.
 */
export const hasText = (t?: LocalizedText): boolean =>
  t ? Object.values(t).some((x) => typeof x === 'string' && x.trim()) : false;
