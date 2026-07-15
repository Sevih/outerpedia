/**
 * SÉMANTIQUE des restrictions de tour — pur, sans donnée, utilisable côté client.
 *
 * Une restriction du jeu est une règle SIMPLE et détectable : une cible
 * (`element` / `class` / `star`) et un sens donné par `count` :
 *   - `count < 0`  → INTERDICTION (ban) : les persos de la cible sont exclus ;
 *   - `count > 0`  → QUOTA requis : les persos de la cible sont MIS EN AVANT
 *                    (les autres restent jouables, ils ne comptent juste pas).
 *
 * C'est ce qui permet, en very hard où la restriction est tirée au hasard, de
 * n'écrire QU'UNE roster par boss et de la filtrer/emphaser dynamiquement selon
 * la restriction choisie — au lieu de recopier la liste sous chaque restriction.
 */

/** La part d'une restriction dont dépend le filtrage (le reste est de l'affichage). */
export interface RestrictionRule {
  /** `element` | `class` | `star`. */
  type: string;
  /** Cible : `fire`… | `attacker`… | `1`|`2`|`3`. */
  subType: string;
  /** `-1` = ban ; `N > 0` = quota. */
  count: number;
}

/** Métadonnées d'un perso nécessaires au filtrage. */
export interface RestrictionSubject {
  element?: string;
  /** Classe du perso (`striker`/`healer`/…). */
  class?: string;
  /** Rareté de BASE (1/2/3). */
  rarity?: number;
}

/**
 * Alias de classe : les restrictions parlent le langage de l'UI du jeu
 * (`attacker`, `priest`), les persos portent le nom interne (`striker`, `healer`).
 */
const CLASS_ALIAS: Record<string, string> = {
  attacker: 'striker',
  priest: 'healer',
};

/** Le perso entre-t-il dans la CIBLE de la restriction (indépendamment du sens) ? */
function matchesTarget(subject: RestrictionSubject, rule: RestrictionRule): boolean {
  switch (rule.type) {
    case 'element':
      return subject.element === rule.subType;
    case 'class':
      return subject.class === (CLASS_ALIAS[rule.subType] ?? rule.subType);
    case 'star':
      return subject.rarity === Number(rule.subType);
    default:
      return false;
  }
}

/** État d'un perso sous une restriction : exclu (ban), mis en avant (quota) ou neutre. */
export type RestrictionState = 'excluded' | 'match' | 'neutral';

/**
 * État d'un perso sous UN ENSEMBLE de restrictions actives (le jeu peut en
 * cumuler) :
 *   - `excluded` s'il tombe sous un BAN (priorité — il ne peut pas jouer) ;
 *   - sinon `match` s'il remplit un QUOTA (mis en avant) ;
 *   - sinon `neutral`.
 */
export function restrictionState(
  subject: RestrictionSubject,
  rules: readonly RestrictionRule[],
): RestrictionState {
  for (const r of rules) if (r.count < 0 && matchesTarget(subject, r)) return 'excluded';
  for (const r of rules) if (r.count > 0 && matchesTarget(subject, r)) return 'match';
  return 'neutral';
}
