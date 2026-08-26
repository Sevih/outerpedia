/**
 * AMONT du moteur — LIGNES DE RAPPORT : pour un skill de l'attaquant et
 * chacun de ses ÉTATS (une chaîne de hits = un état : base, burst 1/2/3,
 * upgrade… — décision Sevih 03/08, report-inputs § 5.4 : chaque état est une
 * sous-ligne), énumère les TROIS branches (normal / critique / esquivé) avec
 * leur probabilité EXACTE (§ 4 : P = (v+1)/1001), calcule chaque hit dans
 * l'ordre du binaire avec le rattrapage d'arrondi du dernier hit (§ 8.3), et
 * pondère l'espérance. Les tirages n'existent pas ici : chaque aléa devient
 * une branche (report-inputs § 1).
 *
 * Fidélité :
 *  - Le taux de chaque branche passe par `checkDamageRate` via son chemin
 *    « attaque additive » (§ 7 étape 3) : pour un résultat FIXÉ, ce chemin
 *    refait le taux avec la même arithmétique que le chemin tiré (miss → 1000,
 *    crit → CriticalDMGRate − EnemyCriticalDamageReduce, normal → 1000, puis
 *    les modificateurs additifs § 7.6 et le plancher 300 ‰) — aucun tirage
 *    forgé, on reste dans le vrai code.
 *  - `vampiric`/`hitRecovery` sont calculés PAR HIT sur les dégâts AVANT
 *    rattrapage § 8.3 — c'est l'ordre du binaire (CalcDamage sort les trois
 *    valeurs, le rattrapage n'ajuste ensuite que les dégâts du SkillRecord).
 *  - Contexte absent = contribution 0 (jamais deviné) : les agrégats § 9
 *    lisent le contexte explicite du scénario, comme `aggregate.ts`.
 *  - Défenseur invincible (§ 7 étape 2) : une seule issue, dégâts nuls —
 *    les branches ne sont pas émises (les dégâts de jauge, eux, ne dépendent
 *    que de BT_WG_INVINCIBLE, § 11).
 */

import {
  findBuffAdditionalDamage,
  findBuffDamageReduce,
  findBuffWGDamageReduce,
  getBuffDamageFinalReduce,
  collectCombatFlags,
  type ActiveBuff,
  type AdditionalDamageContext,
  type CombatFlags,
} from './aggregate';
import {
  addCheckEnemyTeamDecreaseDamageRate,
  adjustLastHitDamage,
  calcDamage,
  calcDamageCore,
  calcDamageDOT,
  calcDamageWG,
  checkDamageRate,
  checkResistThreshold,
  getElementeryDamageRate,
  applyRate,
  mulPermille,
} from './formula';
import type { DamageBranch, TraceStep } from './harness';
import { DamageRateType, type Element } from './types';

// ── Probabilités exactes (§ 4 — jamais de tirage dans le rapport) ───────────

/**
 * P(succès) d'un CheckProbabilityPermille : roll entier uniforme sur
 * [0, 1000] inclus, succès si roll ≤ value → (value+1)/1001, bornée à
 * [0 si value < 1 ; 1 si value ≥ 1000].
 */
export function permilleSuccessProbability(value: number): number {
  if (value < 1) return 0;
  if (value >= 1000) return 1;
  return (value + 1) / 1001;
}

/**
 * P(résistance) d'un CheckResist (§ 5) : seuil float32 exact du binaire
 * (`checkResistThreshold`), puis tirage [0, 1000] → (seuil+1)/1001.
 */
export function resistProbability(attackerBuffChance: number, defenderBuffResist: number): number {
  const threshold = checkResistThreshold(attackerBuffChance, defenderBuffResist);
  if (threshold < 1) return 0;
  return permilleSuccessProbability(threshold);
}

// ── § 10.1 GetAttackStat — swap d'attaque ───────────────────────────────────

/**
 * Stat d'attaque effective : si un buff BT_SWAP_STAT_ATTACK est actif ET que
 * le scénario sait lire la stat visée, la stat swappée remplace ST_ATK
 * (OAT_RATE → MulPermille, sinon + plat). Sans lecteur de stat, on reste sur
 * ST_ATK — un swap actif sans sa stat est un contexte incomplet, pas une
 * occasion de deviner.
 */
export function resolveAttackStat(
  attackStat: number,
  swap: CombatFlags['swapAttack'],
  statOf?: (stat: string) => number,
): number {
  if (!swap || !statOf) return attackStat;
  const stat = statOf(swap.stat);
  return swap.applyingType === 'OAT_RATE' ? mulPermille(stat, swap.value) : stat + swap.value;
}

// ── Entrées du rapport ───────────────────────────────────────────────────────

/** Une ligne de hit du kit (forme extraite, `CharacterDamageTemplet`). */
export interface ReportHitInput {
  /** ID brut du templet de hit. */
  id: string;
  /** ‰ du facteur total du skill porté par ce hit (§ 8.3). */
  damageFactor: number;
  /** MaxHitCount du templet — 0 vaut 1 (§ 8.1) ; N > 1 déplie N occurrences. */
  maxHitCount?: number;
}

/**
 * Un clip d'animation du skill (§ 8.1 : le facteur total et le rattrapage
 * § 8.3 se calculent PAR CLIP) — séquence réelle des `EventAttackStart`,
 * extraite des bundles (datagen/damage/clips.ts). Les events peuvent porter
 * des templets d'AUTRES chaînes ou skills : le binaire somme tout le clip.
 */
export interface ReportClipInput {
  name: string;
  events: { id: string; factor: number; count: number }[];
}

/** Un état du skill (une chaîne de hits) — devient une sous-ligne du rapport. */
export interface ReportState {
  /** Clé de chaîne (dérivée de la convention d'ID — l'ID brut fait foi). */
  chain: string;
  hits: ReportHitInput[];
  /** Clips jouant cette chaîne (≥ 1 event de ses templets) — présents quand
   *  l'affectation est RÉSOLUE par les AnimationEvents ; absents → le moteur
   *  retombe sur l'heuristique § 12.4 (seuil 990). */
  clips?: ReportClipInput[];
}

/**
 * Attache aux états leurs clips résolus (`DamageSkill.clips` du datagen) :
 * un clip appartient à l'état dont il joue ≥ 1 templet ; une chaîne listée
 * `clipsUnresolvedChains` reste SANS clips (fallback heuristique § 12.4).
 */
export function attachChainClips(
  states: ReportState[],
  clips?: ReportClipInput[],
  unresolvedChains?: string[],
): ReportState[] {
  if (!clips?.length) return states;
  const unresolved = new Set(unresolvedChains ?? []);
  return states.map((s) => {
    if (unresolved.has(s.chain)) return s;
    const ids = new Set(s.hits.map((h) => h.id));
    const own = clips.filter((c) => c.events.some((e) => ids.has(e.id)));
    return own.length ? { ...s, clips: own } : s;
  });
}

/**
 * Regroupe les lignes de hits extraites (`DamageSkill.hits`) en états, dans
 * l'ordre de première apparition des chaînes, hits triés par index.
 */
export function groupHitsByChain(
  hits: { chain: string; hit: number; id: string; damageFactor: number; maxHitCount?: number }[],
): ReportState[] {
  const groups = new Map<string, typeof hits>();
  for (const h of hits) {
    const g = groups.get(h.chain);
    if (g) g.push(h);
    else groups.set(h.chain, [h]);
  }
  return [...groups.entries()].map(([chain, g]) => ({
    chain,
    hits: [...g]
      .sort((a, b) => a.hit - b.hit)
      .map((h) => ({ id: h.id, damageFactor: h.damageFactor, maxHitCount: h.maxHitCount })),
  }));
}

/** Le skill à rapporter, au niveau choisi. */
export interface ReportSkillInput {
  /** DamageFactor du `SkillLevelTemplet` au niveau choisi (‰) — § 8.2. */
  skillFactor: number;
  /** WGReduce du niveau (byte) — dégâts de jauge § 11. */
  wgReduce?: number;
  /** Le skill occupe le slot 1 (`SkillType == 0`) — exclut BT 116 (§ 9.3). */
  isFirstSkill?: boolean;
  /** Skill mono-cible (`SkillRangeType == 1`) — STEALTHED ne joue pas (§ 9.2). */
  monoTarget?: boolean;
  /** Les états du skill — cf. `groupHitsByChain`. Vide = rien à rapporter. */
  states: ReportState[];
}

/** Stats FINALES de l'attaquant (buffs inclus — getters CCharacterData § 10.2). */
export interface ReportAttacker {
  /** ST_ATK (4) — le swap § 10.1 est appliqué ici via les buffs du scénario. */
  attackStat: number;
  /** ST_CRITICAL_RATE (7), ‰. */
  criticalRate: number;
  /** ST_CRITICAL_DMG_RATE (8), ‰. */
  criticalDmgRate: number;
  /** ST_DMG_BOOST (25), ‰. */
  dmgBoost: number;
  /** ST_PIERCE_POWER_RATE (10), ‰. */
  piercePowerRate: number;
  /** ST_PIERCE_POWER (9), plat. */
  piercePower: number;
  /** ST_VAMPIRIC (11), ‰. */
  vampiric?: number;
  element: Element;
}

/** Stats FINALES du défenseur. */
export interface ReportDefender {
  /** ST_DEF (5). */
  defense: number;
  /** ST_AVOID (14), ‰. */
  avoid: number;
  /** ST_DMG_REDUCE_RATE (6), ‰. */
  dmgReduceRate: number;
  /** ST_E_CRI_DMG_REDUCE (26), ‰. */
  enemyCriticalDamageReduce: number;
  /** ST_HIT_HP_RECOVERY (12), ‰ — récup du défenseur au coup (§ 8.4). */
  hitHpRecovery?: number;
  element: Element;
}

/** Le scénario complet d'un calcul (report-inputs § 3.3). */
export interface ReportScenario {
  attacker: ReportAttacker;
  defender: ReportDefender;
  /** Buffs ACTIFS de l'attaquant (forme brute + stacks) — drapeaux et § 9.1. */
  attackerBuffs?: ActiveBuff[];
  /** Buffs ACTIFS du défenseur — drapeaux et § 9.2/9.3. */
  defenderBuffs?: ActiveBuff[];
  /** Contexte § 9.1 hors branche (PV, comptes, scène…) — absent = 0. */
  additionalContext?: Omit<AdditionalDamageContext, 'branch'>;
  /** Alliés VIVANTS de l'équipe du poseur côté défenseur (§ 9.2/9.3). */
  defenderCasterAliveAllies?: number;
  /** Overrides de contenu § 7.5bis (world boss special / infiltrate) : normal ×1000 forcé. */
  forceNormalOverride?: boolean;
  /** Force l'émission de la branche MISS même sans esquive — le miss n'existe
   *  plus hors buff de « miss chance » ; sert à comparer un coup manqué. */
  includeMissBranch?: boolean;
  /** Cibles décomptées pour BT_DMG_ENEMY_TEAM_DECREASE (helper § 7). */
  decreaseTargetCount?: number;
  /** GameConfig MISSED_DAMAGE_RATE — défaut 500 (1.4.15). */
  missedDamageRatePermille?: number;
  /** Sorties de FindBuffWGDamageReduce (BT 88/89, § 11) — fournies, elles
   *  REMPLACENT l'agrégation des buffs actifs (`findBuffWGDamageReduce`). */
  wgReduceFlat?: number;
  wgReduceRate?: number;
}

// ── Sorties ──────────────────────────────────────────────────────────────────

export interface HitLine {
  /** ID brut du templet du hit. */
  id: string;
  /** Position 1-based dans la séquence DÉPLIÉE de l'état (multi-hit inclus). */
  index: number;
  damage: number;
  /** Soin de l'attaquant sur ce hit (§ 8.4) — sur les dégâts AVANT § 8.3. */
  vampiric: number;
  /** Récup du défenseur sur ce hit (§ 8.4) — idem. */
  hitRecovery: number;
  /** Dernier hit rehaussé par le rattrapage d'arrondi § 8.3. */
  adjusted: boolean;
}

export interface BranchLine {
  branch: DamageBranch;
  /** Probabilité exacte de la branche (§ 4) — les branches émises somment 1. */
  probability: number;
  /** Taux final § 7 (‰, plancher 300 appliqué). */
  damageRate: number;
  hits: HitLine[];
  /** Σ des hits (rattrapage § 8.3 inclus) = total exact de la compétence. */
  totalDamage: number;
  /**
   * Trace du calcul (harnais § 2) — présente si demandée via
   * `buildSkillReport(..., { trace: true })` : agrégats § 9, taux § 7,
   * cœur § 8.2 du TOTAL, rattrapage § 8.3. Ordre réel d'exécution.
   */
  trace?: TraceStep[];
}

export interface StateLine {
  chain: string;
  /** Facteur total § 8.1. Chaîne RÉSOLUE par les AnimationEvents : Σ des
   *  facteurs des clips joués (chaque clip fait SA cascade § 8.2 + § 8.3 —
   *  détail dans `clips`) ; le clip peut rejouer un templet ou mêler d'autres
   *  chaînes, sa somme fait foi. Fallback (chaîne sans clips extraits) :
   *  Σ (MaxHitCount||1) × DamageFactor des tables — porté à 1000 ‰ (et
   *  `factorFilled` posé) quand la somme est sous 990 : le manque est un
   *  event du clip non extrait (§ 12.4) ; les sommes ∈ [990, 1000) sont des
   *  arrondis de répartition servis BRUTS. */
  totalFactor: number;
  /** FALLBACK SEULEMENT — chaîne incomplète complétée au facteur plein.
   *  Deux mesures bornent la règle : le S1 de Caren somme 700 ‰ en table et
   *  frappe 1000 ‰ en jeu (18/08/2026 — comblé) ; le S2 de Noa somme 999 ‰
   *  (3×333) et frappe 999 ‰ EXACT (22/08/2026 — brut). Seuil : 990. */
  factorFilled?: true;
  /** Détail § 8.1 par clip — présent quand la chaîne est résolue par les
   *  AnimationEvents (une cascade § 8.2/8.3 par clip, mesures Francesca S2
   *  22/08/2026 : cascade(700) + cascade(300), les deux captures exactes). */
  clips?: { name: string; totalFactor: number }[];
  /** Branches à probabilité > 0 uniquement (une branche impossible n'existe pas). */
  branches: BranchLine[];
  /** Σ P(branche) × total(branche). */
  expectedDamage: number;
}

export interface SkillReport {
  states: StateLine[];
  /** Dégâts de jauge § 11 — par skill, indépendants de la branche. */
  weaknessGaugeDamage: number;
  /** Défenseur invincible (§ 7 étape 2) : branches non émises, dégâts nuls. */
  defenderInvincible: boolean;
  /** Trace de la jauge § 11 (si demandée). */
  wgTrace?: TraceStep[];
}

/** Options de `buildSkillReport`. */
export interface SkillReportOptions {
  /** Produire les traces (harnais § 2) — coût nul sinon. */
  trace?: boolean;
}

// ── Construction du rapport ──────────────────────────────────────────────────

const BRANCH_TYPE: Record<DamageBranch, DamageRateType> = {
  normal: DamageRateType.Normal,
  critical: DamageRateType.Critical,
  miss: DamageRateType.Missed,
};

/**
 * Énumère les branches atteignables et leur probabilité exacte :
 * l'esquive se tire d'abord (§ 7.4), le critique ensuite (§ 7.5) —
 * P(miss) = P‰(avoid), P(crit) = (1 − P(miss)) × P‰(critRate), normal = reste.
 * Un override de contenu (§ 7.5bis) écrase tout : normal, P = 1.
 */
export function enumerateBranches(
  attacker: Pick<ReportAttacker, 'criticalRate'>,
  defender: Pick<ReportDefender, 'avoid'>,
  forceNormalOverride?: boolean,
  includeMiss?: boolean,
): { branch: DamageBranch; probability: number }[] {
  if (forceNormalOverride) return [{ branch: 'normal', probability: 1 }];
  const pMiss = permilleSuccessProbability(defender.avoid);
  const pCrit = (1 - pMiss) * permilleSuccessProbability(attacker.criticalRate);
  const pNormal = 1 - pMiss - pCrit;
  // Normal et critique sont TOUJOURS émises (Sevih 05/08/2026) : les dégâts
  // d'une branche ne dépendent pas de sa probabilité — P = 0 reste exact et
  // l'espérance n'en pondère rien. Le miss n'existe plus dans le jeu courant
  // hors buff de « miss chance » : émis seulement si possible (esquive > 0)
  // ou FORCÉ par le scénario (comparaison d'un coup manqué observé).
  const branches: { branch: DamageBranch; probability: number }[] = [
    { branch: 'normal', probability: pNormal > 0 ? pNormal : 0 },
    { branch: 'critical', probability: pCrit },
  ];
  if (pMiss > 0 || includeMiss) branches.push({ branch: 'miss', probability: pMiss });
  return branches;
}

/** Déplie les lignes de hits en occurrences (§ 8.1 : MaxHitCount 0 vaut 1). */
function unfoldHits(hits: ReportHitInput[]): { id: string; damageFactor: number }[] {
  const out: { id: string; damageFactor: number }[] = [];
  for (const h of hits) {
    const count = h.maxHitCount && h.maxHitCount > 0 ? h.maxHitCount : 1;
    for (let i = 0; i < count; i++) out.push({ id: h.id, damageFactor: h.damageFactor });
  }
  return out;
}

/**
 * Le rapport d'un skill : une StateLine par état, chaque état décliné par
 * branche puis par hit, l'espérance en pondération. C'est l'assembleur des
 * couches : drapeaux (aggregate), agrégats § 9 PAR BRANCHE, taux § 7, cœur
 * § 8.2, rattrapage § 8.3, annexes § 8.4, jauge § 11.
 */
export function buildSkillReport(
  skill: ReportSkillInput,
  scenario: ReportScenario,
  options?: SkillReportOptions,
): SkillReport {
  const attackerBuffs = scenario.attackerBuffs ?? [];
  const defenderBuffs = scenario.defenderBuffs ?? [];
  const flags = collectCombatFlags(attackerBuffs, defenderBuffs);
  const withTrace = options?.trace === true;

  const wgTrace = withTrace ? ([] as TraceStep[]) : undefined;
  const wgAgg = findBuffWGDamageReduce(attackerBuffs, defenderBuffs);
  const wgReduceFlat = scenario.wgReduceFlat ?? wgAgg.flat;
  const wgReduceRate = scenario.wgReduceRate ?? wgAgg.rate;
  const weaknessGaugeDamage = calcDamageWG({
    defenderWgInvincible: flags.defenderWgInvincible,
    skillWgReduce: skill.wgReduce ?? 0,
    wgReduceFlat,
    wgReduceRate,
  });
  wgTrace?.push({
    ref: '§ 11',
    label: flags.defenderWgInvincible
      ? 'jauge : BT_WG_INVINCIBLE → 0'
      : 'dégâts de jauge (BT_WG_DMG de l’attaquant + BT_WG_DMG_REDUCE du défenseur, § 11)',
    in: {
      skillWgReduce: skill.wgReduce ?? 0,
      wgReduceFlat,
      wgReduceRate,
    },
    out: weaknessGaugeDamage,
  });

  if (flags.defenderInvincible) {
    return {
      states: skill.states.map((s) => ({
        chain: s.chain,
        totalFactor: s.clips?.length
          ? s.clips.reduce((t, c) => t + c.events.reduce((x, e) => x + e.factor * e.count, 0), 0)
          : totalFactorOf(s.hits),
        branches: [],
        expectedDamage: 0,
      })),
      weaknessGaugeDamage,
      defenderInvincible: true,
      ...(wgTrace ? { wgTrace } : {}),
    };
  }

  const attackStat = resolveAttackStat(
    scenario.attacker.attackStat,
    flags.swapAttack,
    scenario.additionalContext?.attackerStat,
  );
  const elementalRate = getElementeryDamageRate({
    attackerElement: scenario.attacker.element,
    defenderElement: scenario.defender.element,
    forcedSuperiority: flags.forcedSuperiority,
    forcedInferiority: flags.forcedInferiority,
    elementDamageRateBonus: flags.elementDamageRateBonus,
  });
  const damageReduceRate = findBuffDamageReduce(defenderBuffs, {
    attackerSkillMonoTarget: skill.monoTarget,
    casterAliveAllies: scenario.defenderCasterAliveAllies,
    attackerHasDotPunish: attackerBuffs.some((b) => b.type === 'BT_DOT_PUNISH'),
  });
  const finalReduceRate = getBuffDamageFinalReduce(defenderBuffs, {
    isFirstSkill: skill.isFirstSkill,
    casterAliveAllies: scenario.defenderCasterAliveAllies,
  });

  // Préambule de trace commun aux branches (ordre réel : stat d'attaque § 10.1,
  // élément § 6, agrégats défenseur § 9.2/9.3 — § 9.1 dépend de la branche).
  const preamble: TraceStep[] = [];
  if (withTrace) {
    if (flags.swapAttack && !scenario.additionalContext?.attackerStat) {
      // Contexte incomplet (§ 10.1) : on NE devine pas la stat swappée.
      preamble.push({
        ref: '§ 10.1',
        label: 'swap d’attaque actif SANS lecteur de stat — ST_ATK conservé',
        in: { attackStat: scenario.attacker.attackStat },
        out: attackStat,
        unresolved: true,
      });
    } else if (flags.swapAttack) {
      preamble.push({
        ref: '§ 10.1',
        label: `stat d’attaque swappée (${flags.swapAttack.stat})`,
        in: { swapValue: flags.swapAttack.value },
        out: attackStat,
      });
    }
    preamble.push({
      ref: '§ 6',
      label: 'taux élémentaire',
      in: {
        attackerElement: scenario.attacker.element,
        defenderElement: scenario.defender.element,
        enchantBonus: flags.elementDamageRateBonus,
      },
      out: elementalRate,
    });
    preamble.push({
      ref: '§ 9.2',
      label: 'somme des réductions du défenseur',
      in: { defenderBuffs: defenderBuffs.length },
      out: damageReduceRate,
    });
    preamble.push({
      ref: '§ 9.3',
      label: 'réduction finale du défenseur (MAX, pas somme)',
      in: { defenderBuffs: defenderBuffs.length },
      out: finalReduceRate,
    });
  }

  const branches = enumerateBranches(
    scenario.attacker,
    scenario.defender,
    scenario.forceNormalOverride,
    scenario.includeMissBranch,
  );

  // Taux § 7 par branche — via le chemin « additive » de checkDamageRate
  // (résultat fixé, même arithmétique que le chemin tiré, cf. en-tête).
  const branchRates = branches.map(({ branch, probability }) => {
    const rateTrace = withTrace ? [...preamble] : undefined;
    const additionalDamageRate = findBuffAdditionalDamage(attackerBuffs, {
      ...scenario.additionalContext,
      branch,
    });
    rateTrace?.push({
      ref: '§ 9.1',
      label: 'somme additionnelle de l’attaquant (selon branche)',
      in: { attackerBuffs: attackerBuffs.length },
      out: additionalDamageRate,
    });
    let { rate } = checkDamageRate(
      {
        attacker: scenario.attacker,
        defender: { ...scenario.defender, hasInvincibleBuff: false },
        additionalDamageRate,
        damageReduceRate,
        previousResult: BRANCH_TYPE[branch],
        rolls: { avoid: 0, critical: 0 }, // ignorés : résultat déjà fixé
      },
      rateTrace,
    );
    if (scenario.decreaseTargetCount !== undefined && flags.enemyTeamDecreaseValue !== 0) {
      rate = addCheckEnemyTeamDecreaseDamageRate(
        rate,
        flags.enemyTeamDecreaseValue,
        scenario.decreaseTargetCount,
      );
      rateTrace?.push({
        ref: '§ 7',
        label: 'cibles décomptées (BT_DMG_ENEMY_TEAM_DECREASE)',
        in: {
          enemyTeamDecreaseValue: flags.enemyTeamDecreaseValue,
          decreaseTargetCount: scenario.decreaseTargetCount,
        },
        out: rate,
      });
    }
    return { branch, probability, rate, rateTrace };
  });

  const states = skill.states.map((state): StateLine => {
    // ── Chemin RÉSOLU : cascade § 8.2 + rattrapage § 8.3 PAR CLIP ──────────
    // (le binaire recalcule ReceiveMaxDamage à chaque scan § 8.1, donc à
    // chaque clip — S2 de Francesca : cascade(700) + cascade(300), mesures
    // exactes 22/08/2026). Les events étrangers à la chaîne comptent dans le
    // facteur du clip et consomment leur part de la cascade, mais seuls les
    // hits de LA chaîne alimentent sa ligne (les autres ont la leur).
    if (state.clips?.length) {
      const chainIds = new Set(state.hits.map((h) => h.id));
      const clipFactors = state.clips.map((clip) => ({
        name: clip.name,
        totalFactor: clip.events.reduce((sum, e) => sum + e.factor * e.count, 0),
      }));
      const branchLines = branchRates.map(
        ({ branch, probability, rate, rateTrace }): BranchLine => {
          const trace = rateTrace ? [...rateTrace] : undefined;
          const core = {
            attackStat,
            skillFactor: skill.skillFactor,
            piercePowerRate: scenario.attacker.piercePowerRate,
            piercePower: scenario.attacker.piercePower,
            defense: scenario.defender.defense,
            damageRate: rate,
            defenderMarked: flags.defenderMarked,
            elementalRate,
            isMissed: branch === 'miss',
            missedDamageRatePermille: scenario.missedDamageRatePermille,
            finalReduceRate,
          };
          const hits: HitLine[] = [];
          let stateTotal = 0;
          let index = 0;
          state.clips!.forEach((clip, ci) => {
            const clipFactor = clipFactors[ci].totalFactor;
            const clipTotal = calcDamageCore({ ...core, damageFactor: clipFactor }, trace);
            const occs: { id: string; factor: number }[] = [];
            for (const e of clip.events)
              for (let k = 0; k < e.count; k++) occs.push({ id: e.id, factor: e.factor });
            let accumulated = 0;
            occs.forEach((occ, i) => {
              const r = calcDamage({
                ...core,
                damageFactor: occ.factor,
                vampiric: scenario.attacker.vampiric,
                hitHpRecovery: scenario.defender.hitHpRecovery,
              });
              const isLast = i === occs.length - 1;
              const damage = isLast
                ? adjustLastHitDamage(clipTotal, accumulated, r.damage)
                : r.damage;
              accumulated += damage;
              if (chainIds.has(occ.id)) {
                index += 1;
                hits.push({
                  id: occ.id,
                  index,
                  damage,
                  vampiric: r.vampiric,
                  hitRecovery: r.hitRecovery,
                  adjusted: damage !== r.damage,
                });
                stateTotal += damage;
              }
            });
            trace?.push({
              ref: '§ 8.3',
              label: `clip ${clip.name} (facteur ${clipFactor} ‰) : répartition et rattrapage`,
              in: { clipTotal, events: occs.length },
              out: accumulated,
            });
          });
          return {
            branch,
            probability,
            damageRate: rate,
            hits,
            totalDamage: stateTotal,
            ...(trace ? { trace } : {}),
          };
        },
      );
      const expectedDamage = branchLines.reduce((e, b) => e + b.probability * b.totalDamage, 0);
      return {
        chain: state.chain,
        totalFactor: clipFactors.reduce((s, c) => s + c.totalFactor, 0),
        clips: clipFactors,
        branches: branchLines,
        expectedDamage,
      };
    }

    // ── Fallback : chaîne sans clips extraits — heuristique § 12.4 ─────────
    const occurrences = unfoldHits(state.hits);
    const rawFactor = occurrences.reduce((sum, o) => sum + o.damageFactor, 0);
    // § 8.1 : le facteur total réel somme les AnimationEvents du CLIP (dont
    // les « facteurs littéraux ») — invisibles des tables. Deux mesures
    // encadrent la règle : Caren S1 (Σ tables 700 ‰, jeu = 1000 — un morceau
    // du clip manque aux tables, 18/08/2026) et Noa S2 (Σ 999 = 3×333, jeu =
    // 999 EXACT — arrondi de répartition, PAS un manque, 22/08/2026). Les
    // Σ ∈ [990, 1000) de la donnée sont tous de la seconde espèce (999 = 3×333,
    // 996 = 6×166) : servis BRUTS ; en dessous (paliers ronds 700/750/800/
    // 900/920…), morceau manquant : complétés au facteur plein (le § 8.3
    // verse le manque dans le dernier hit). Le seuil 990 est une heuristique
    // bornée par les deux mesures (§ 12.4). Σ ≥ 1000 est GARDÉ tel quel
    // (1001/1002 = arrondis par excès ; bursts renforcés plausibles).
    const totalFactor = rawFactor < 990 ? 1000 : rawFactor;

    const branchLines = branchRates.map(({ branch, probability, rate, rateTrace }): BranchLine => {
      const trace = rateTrace ? [...rateTrace] : undefined;
      const core = {
        attackStat,
        skillFactor: skill.skillFactor,
        piercePowerRate: scenario.attacker.piercePowerRate,
        piercePower: scenario.attacker.piercePower,
        defense: scenario.defender.defense,
        damageRate: rate,
        defenderMarked: flags.defenderMarked,
        elementalRate,
        isMissed: branch === 'miss',
        missedDamageRatePermille: scenario.missedDamageRatePermille,
        finalReduceRate,
      };
      // § 8.1 : le total de la compétence se calcule sur le facteur TOTAL…
      const totalDamage = calcDamageCore({ ...core, damageFactor: totalFactor }, trace);
      // …§ 8.3 : chaque hit se calcule sur SON facteur, le dernier rattrape.
      let accumulated = 0;
      const hits = occurrences.map((occ, i): HitLine => {
        const r = calcDamage({
          ...core,
          damageFactor: occ.damageFactor,
          vampiric: scenario.attacker.vampiric,
          hitHpRecovery: scenario.defender.hitHpRecovery,
        });
        const isLast = i === occurrences.length - 1;
        const damage = isLast ? adjustLastHitDamage(totalDamage, accumulated, r.damage) : r.damage;
        accumulated += damage;
        return {
          id: occ.id,
          index: i + 1,
          damage,
          vampiric: r.vampiric,
          hitRecovery: r.hitRecovery,
          adjusted: damage !== r.damage,
        };
      });
      trace?.push({
        ref: '§ 8.3',
        label: 'répartition par hit et rattrapage du dernier hit',
        in: { totalDamage, hits: occurrences.length },
        out: accumulated,
      });
      return {
        branch,
        probability,
        damageRate: rate,
        hits,
        totalDamage: accumulated,
        ...(trace ? { trace } : {}),
      };
    });

    const expectedDamage = branchLines.reduce((e, b) => e + b.probability * b.totalDamage, 0);
    return {
      chain: state.chain,
      totalFactor,
      ...(rawFactor < 990 ? { factorFilled: true as const } : {}),
      branches: branchLines,
      expectedDamage,
    };
  });

  return {
    states,
    weaknessGaugeDamage,
    defenderInvincible: false,
    ...(wgTrace ? { wgTrace } : {}),
  };
}

function totalFactorOf(hits: ReportHitInput[]): number {
  return hits.reduce(
    (sum, h) => sum + (h.maxHitCount && h.maxHitCount > 0 ? h.maxHitCount : 1) * h.damageFactor,
    0,
  );
}

// ── DOT : ligne « dégâts par tick » (§ 11 + § 5) ────────────────────────────

export interface DotLineInput {
  /** Taux du DOT (‰) — templet du buff (`AttackRate`). */
  attackRate: number;
  /** Stat que le BINAIRE lit pour ce type au moment du TICK (jump table de
   *  `ProcessDamageOverTime`, désassemblée le 24/08/2026) — l'ATK pour
   *  BURN, la stat de la LIGNE pour BLEED/POISON/LIGHTNING/PUNISH, les PV
   *  max du poseur pour CURSE, l'Effectiveness pour le DoT custom 2000092. */
  statValue: number;
  /**
   * Forme du tick (jump table 56..62 du binaire) :
   * - `defense` (défaut) : `CalcDamageDOT` § 11 — défense (avec pénétration)
   *   + DMG_REDUCE cap 900 (BLEED / POISON / LIGHTNING / PUNISH).
   * - `flat` : `MulPermille(stat, rate)` SANS défense ni réduction — BURN
   *   (ATK), CURSE (PV max du poseur, cappé par `capValue`) et le DoT custom
   *   2000092 (Effectiveness). PROUVÉ in-game 24/08/2026 : Eternal Bleeding
   *   = 2 × 7000 ‰ × 636 EXACT, sans le terme de défense d'Ars Nova.
   */
  formula?: 'defense' | 'flat';
  /** Σ des `BT_*_ENHANCE` actifs SUR LA CIBLE (‰) — `ApplyRate` sur le taux
   *  AVANT la formule (GetDotDamageIncreaseBuffValue, toutes branches). */
  enhancePermille?: number;
  /** CURSE : min des `BT_DOT_CURSE_CAP` actifs sur la cible — le tick est
   *  plafonné à cette valeur (boucle de la branche 60). */
  capValue?: number;
  /** ST_DEF du défenseur. */
  defense: number;
  /** ST_PIERCE_POWER_RATE de l'attaquant, ‰. */
  piercePowerRate: number;
  /** ST_PIERCE_POWER de l'attaquant, plat. */
  piercePower: number;
  /** ST_DMG_REDUCE_RATE du défenseur, ‰ (cap 900 dans la formule). */
  dmgReduceRate: number;
  /** CreateRate du buff (‰) — colonne BuffTemplet, jamais devinée. */
  createRatePermille: number;
  /** BUFF_CHANCE de l'attaquant (‰) — Effectiveness. Défaut 0 (stat neutre). */
  buffChancePermille?: number;
  /** BUFF_RESIST du défenseur (‰). Défaut 0 (stat neutre). */
  buffResistPermille?: number;
  /** `BuffDebuffType == DEBUFF_IGNORE_RESIST` : la pose saute le CheckResist
   *  § 5 — P(pose) = P‰(CreateRate) seul (ex. le Bleed de Francesca). */
  ignoreResist?: boolean;
}

export interface DotLine {
  /** Dégâts d'UN tick (§ 11 — ignore élément, crit et taux de hit). */
  damagePerTick: number;
  /** P(pose) = P‰(CreateRate) × (1 − P(résistance § 5)). */
  applyProbability: number;
}

/**
 * Ligne DOT du rapport : dégâts par tick + probabilité de pose. La liaison
 * skill → buffs DOT (BuffIDs du niveau → buffs.json) appartient à la couche
 * d'appel ; ici on ne fait que composer la jump table de
 * `ProcessDamageOverTime` (§ 11) et § 5.
 */
export function buildDotLine(input: DotLineInput): DotLine {
  const rate = applyRate(input.attackRate, input.enhancePermille ?? 0);
  let damagePerTick =
    input.formula === 'flat'
      ? mulPermille(input.statValue, rate)
      : calcDamageDOT({ ...input, attackRate: rate });
  if (input.capValue !== undefined && damagePerTick > input.capValue) {
    damagePerTick = input.capValue;
  }
  const pCreate = permilleSuccessProbability(input.createRatePermille);
  const pResist = input.ignoreResist
    ? 0
    : resistProbability(input.buffChancePermille ?? 0, input.buffResistPermille ?? 0);
  return { damagePerTick, applyProbability: pCreate * (1 - pResist) };
}
