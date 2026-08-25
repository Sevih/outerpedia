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

/**
 * Version du jeu des TABLES courantes (binaire de référence des extracteurs).
 * Le panneau Debug la compare au `gameVersion` des fixtures (badge « à
 * revérifier en jeu ») et `fixtures.test.ts` oriente son message d'échec.
 * Constante MANUELLE, à bumper à chaque patch qui régénère les tables —
 * `pnpm damage:check` avertit si elle diverge du dump-stamp de la machine
 * de datamine (le filet contre l'oubli).
 */
export const ENGINE_GAME_VERSION = '1.4.15';

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
  /**
   * Niveau du Codex du COMPTE à la capture — HORS `z` (réglage localStorage,
   * jamais dans l'URL) mais il pèse dès qu'un buff est actif (§ 16.1) :
   * capturé à part pour que le rejeu soit complet. Absent = 0.
   */
  codex?: number;
  /**
   * Niveau de GUILDE du compte à la capture — HORS `z` (réglage localStorage) ;
   * son buff MAX_HP (§ 16.2) change le HP de combat dans les modes éligibles.
   * Absent = 0.
   */
  guild?: number;
  /**
   * Buff de TITRE « Premium Body » possédé à la capture (+5 % PV, § 16.2) —
   * HORS `z` aussi. Absent = non.
   */
  premium?: boolean;
  /**
   * QUIRKS du compte à la capture (nœud d'éveil → niveau, seuls les > 0) —
   * HORS `z` aussi (réglage localStorage). Absent = aucun.
   */
  quirks?: Record<string, number>;
  /** Version du jeu au moment de l'observation (« 1.4.9 »). */
  gameVersion: string;
  /** Observations en jeu : par slot de skill × branche, dégâts constatés. */
  observed: { slot: string; branch: DamageBranch; damage: number }[];
  /** Tolérance relative acceptée (défaut 0.5 % — arrondis d'affichage du jeu). */
  tolerance?: number;
  /**
   * Référence d'incertitude § 12 (damage-formula.md) dont le scénario dépend :
   * le test la `skip` (harnais § 4) et la table l'affiche en gris — le fixture
   * devient le test d'acceptation du jour où on tranche.
   */
  skipRef?: string;
  /** Contexte libre : ce qui était actif en jeu et difficile à encoder. */
  notes?: string;
}
