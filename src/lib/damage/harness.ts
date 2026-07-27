/**
 * Types du HARNAIS DE DEBUG du damage calculator (dev-only) —
 * réf : docs/specs/damage-debug-harness.md § 2–4.
 *
 * `TraceStep` est produit par le MOTEUR (`trace?: TraceStep[]` en paramètre
 * optionnel de ses fonctions — coût nul quand absent) ; l'UI ne fait que le
 * rendre, jamais le reconstruire. `DamageFixture` vit dans
 * `src/lib/damage/fixtures/*.json`, composé par le bouton « Capturer » du
 * panneau Debug et rejoué par `fixtures.test.ts` (vitest, sans UI).
 */

/** Une étape de la trace de calcul (spec § 2). */
export interface TraceStep {
  /** Référence de spec — « § 8.2 », « § 9 »… ancre de damage-formula.md. */
  ref: string;
  /** Libellé court de l'étape (« facteur du skill », « couche DEF »…). */
  label: string;
  /** Opérandes d'entrée, nommés (atk: 28414, factor: 1840…). */
  in: Record<string, number>;
  /** Valeur de sortie de l'étape (valeur BRUTE du moteur, aucun arrondi). */
  out: number;
  /**
   * Incertitude spec § 12 non tranchée : l'étape est neutralisée, jamais
   * remplacée par une valeur plausible.
   */
  unresolved?: boolean;
}

/** Les trois branches énumérées du rapport (jamais tirées, spec formule § 7). */
export type DamageBranch = 'normal' | 'critical' | 'miss';

/** Un scénario doré vérifié EN JEU (spec § 3). */
export interface DamageFixture {
  /** Nom parlant : « Delta S3 crit vs WB Ragnakeus VH rank S ». */
  name: string;
  /** Le scénario COMPLET : la valeur `?z=` de l'URL du calculateur (lz-string). */
  z: string;
  /** Version du jeu au moment de l'observation (« 1.4.9 »). */
  gameVersion: string;
  /** Observations en jeu : par slot de skill × branche, dégâts constatés. */
  observed: { slot: string; branch: DamageBranch; damage: number }[];
  /** Tolérance relative acceptée (défaut 0.5 % — arrondis d'affichage du jeu). */
  tolerance?: number;
  /** Contexte libre : ce qui était actif en jeu et difficile à encoder. */
  notes?: string;
}
