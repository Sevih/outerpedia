/**
 * Report des traductions sur un texte localisé — SOURCE UNIQUE du comportement
 * des boutons « Translate » des éditeurs admin et de l'import de contributions.
 *
 * L'ANGLAIS FAIT FOI : une retraduction ÉCRASE les langues cibles. Ne remplir
 * que les langues vides (ancien comportement) rendait toute CORRECTION de l'EN
 * inrattrapable — les autres langues restaient sur l'ancienne version sans
 * aucun moyen de les régénérer, puisqu'elles n'étaient plus vides.
 *
 * Seuls les CHANGEMENTS sont comptés : re-cliquer sans avoir touché l'EN
 * annonce honnêtement que rien n'a bougé.
 */
import type { Lang } from '@/lib/i18n/config';

type Localized = Partial<Record<Lang, string>>;

/**
 * Écrase les langues `targets` de `rec` par la traduction `tr`. L'EN est ignoré
 * même s'il figure dans `targets` (c'est la source, jamais une cible).
 */
export function applyTranslation(rec: Localized, tr: Localized, targets: readonly Lang[]): number {
  let changed = 0;
  for (const l of targets) {
    if (l === 'en') continue;
    const next = tr[l]?.trim();
    if (!next || rec[l] === next) continue;
    rec[l] = next;
    changed++;
  }
  return changed;
}

export interface Freshness {
  /** Ce texte doit-il repasser par le traducteur ? */
  isStale(rec: Localized, targets: readonly Lang[]): boolean;
  /** À appeler après une traduction réussie (l'EN devient la référence). */
  markFresh(rec: Localized): void;
}

/**
 * Périmètre d'une retraduction : n'envoyer au traducteur QUE ce qui a bougé.
 *
 * Un texte est PÉRIMÉ si son EN est inconnu — donc modifié ou ajouté depuis le
 * chargement de la page — ou s'il lui manque une langue. Tout le reste est déjà
 * à jour : le retraduire brûlerait du quota DeepL pour un résultat identique.
 *
 * La référence est l'ENSEMBLE DES EN au montage (l'état sur disque), pas une
 * position dans une liste : ajouter, supprimer ou réordonner des entrées ne
 * fausse donc rien. Deux textes au même EN partagent leur fraîcheur, ce qui est
 * exact — même source, même traduction.
 */
export function createFreshness(baseline: Iterable<string | undefined>): Freshness {
  const fresh = new Set<string>();
  const add = (en?: string) => {
    const t = en?.trim();
    if (t) fresh.add(t);
  };
  for (const en of baseline) add(en);
  return {
    isStale(rec, targets) {
      const en = rec.en?.trim();
      if (!en) return false; // rien à traduire
      if (!fresh.has(en)) return true; // EN édité ou nouveau
      return targets.some((l) => l !== 'en' && !rec[l]?.trim()); // langue manquante
    },
    markFresh(rec) {
      add(rec.en);
    },
  };
}
