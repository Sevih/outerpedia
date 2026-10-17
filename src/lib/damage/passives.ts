/**
 * PASSIFS DE BOSS — les buffs que le kit d'un monstre preset pose en
 * PERMANENT au combat (`SkillSubType == PASSIVE`, `BuffCreateType` `PASSIVE`
 * ou `PASSIVE2` — le jeu charge les deux pareil, `CSkillManager.
 * GetPassiveBuffList`, spec § 16.3), demandés par Sevih (05/08/2026) : « c'est
 * un débuff comme un autre » — ils traversent le système de buffs du moteur,
 * on ne trafique JAMAIS les stats saisies pour les simuler.
 *
 * Chaîne de données (tout est DÉJÀ extrait, aucune table nouvelle) :
 *   targets.json (kit du monstre, slots `Skill_<n>`) → skills PASSIVE →
 *   `buffIds` du niveau unique (650/650 passifs de boss preset sont
 *   mono-niveau en 1.4.9 — garde testée) → buffs.json (lignes BuffTemplet :
 *   type, cible, valeur, condition).
 *
 * Classement par CIBLE du buff (`TargetType`, point de vue du BOSS) :
 *   - `ENEMY_TEAM` = l'équipe du JOUEUR → côté ATTAQUANT (ex. « Starving
 *     Devil » : taux crit +100 %, dégâts crit −85 % sur toute l'équipe) ;
 *     `ENEMY_TEAM_<CLASSE>` (`TEAM_CLASS_TARGETS`) ne touche que l'attaquant
 *     de cette classe (`targetClass`, évalué contre la classe du scénario) ;
 *     les autres sélections (`ENEMY_TEAM_HIGHEST_ATK`…) → unresolved ;
 *   - `ME`/`MY_TEAM` = le boss → côté DÉFENSEUR (ex. réductions de dégâts
 *     conditionnées à l'élément de l'attaquant, `BT_WG_DMG_REDUCE` lu par la
 *     jauge — CalcDamageWG, spec § 11).
 *   - `BT_STAT_BUFF/DEBUFF_ENHANCE` (§ 14.1) : du côté de leur PORTEUR, comme
 *     un BT_STAT — sur `ME`, ils renforcent les BT_STAT visibles du boss
 *     (`4086032_4_2` à −3000 les INVERSE) ; sur `ENEMY_TEAM`, ceux de
 *     l'attaquant (`4500347_4_2` : ses débuffs +100 %).
 *
 * Conditions ÉVALUABLES statiquement : les trois élémentaires
 * (`ATTACKER_ELEMENT_WIN/EQUAL/LOSE`) et `TARGET_ELEMENT`, par
 * `elementConditionMet` — LA fonction de condition, partagée avec gear.ts et
 * le calculateur (supériorité FORCÉE de l'attaquant comprise : elle se lit
 * par coup, cf. `bossPassiveActive`). `OWNER_RAGE` et les buffs des skills
 * d'ENRAGE (`SKT_RAGE_ENTER*`) sont gatés par la DÉCLARATION du scénario
 * (coche « Enragé », z `en` — 17/08/2026), jamais devinés. Toute autre
 * condition (`OWNER_HAS_BUFF`…) dépend de l'état du combat : le buff est
 * REMONTÉ `unresolved`, contribution 0.
 *
 * HORS périmètre (documenté, jamais tu quand c'est damage-pertinent) :
 *   - `BT_LIMIT_DMG_TURN` (plafond de dégâts par tour) : non simulé →
 *     unresolved ;
 *   - `BT_STAT_PREMIUM` sur `ME`/`MY_TEAM` : passif de FICHE du monstre, non
 *     versé aux stats (les stats de la cible sont celles du spawn) →
 *     unresolved ;
 *   - `BT_DMG*` sur `ME` : les dégâts SORTANTS du boss — le rapport ne
 *     calcule jamais les dégâts de la cible (report-inputs § 1) → ignoré
 *     silencieusement ;
 *   - `BT_STAT` sur `ME` : les stats défensives du preset viennent des stats
 *     de spawn → unresolved (aucun cas statique en donnée) — SAUF les lignes
 *     d'ENRAGE sur une stat que le rapport consomme (DEFENDER_STAT_CHANNEL),
 *     appliquées par inputs.ts aux stats de la cible via l'identité § 16.1 ;
 *   - créations dynamiques (`ON_TURN`, `SKILL_FINISH`…) : boucliers, stacks,
 *     drains — état de combat, pas des passifs statiques → ignorés (les types
 *     damage-pertinents partent en unresolved) ; les lignes du skill d'enrage
 *     échappent à ce filtre (posées AU CAST de l'enrage, cf. `rage`).
 */

import { isDebuffType, STAT_ENHANCE_TYPES, type ActiveBuff } from './aggregate';
import { getElementSuperiority } from './formula';
import { Element, ElementSuperiority } from './types';
import type { DamageBuffsData, DamageTargetsData } from './inputs';

/** Un buff passif STATIQUE du boss, classé et prêt à évaluer. */
export interface BossPassiveEntry {
  /** Skill porteur (pour remonter au nom affichable côté UI). */
  skillId: string;
  buffId: string;
  /** Côté du scénario qui le reçoit (cf. en-tête). */
  side: 'attacker' | 'defender';
  /** La forme consommée par l'agrégateur (§ 9 / § 16.1). */
  buff: ActiveBuff;
  /** Condition élémentaire (`ATTACKER_ELEMENT_*`, `TARGET_ELEMENT`) ou
   *  `OWNER_RAGE` — absente = toujours actif. */
  condition?: string;
  /** `ConditionValue` de la ligne (élément CET_* pour `TARGET_ELEMENT`). */
  conditionValue?: number;
  /** Cible `ENEMY_TEAM_<CLASSE>` : classe `CCT_*` du seul attaquant touché. */
  targetClass?: string;
  /**
   * Buff posé par le skill d'ENRAGE du boss (`SKT_RAGE_ENTER*`) — actif
   * seulement quand le scénario déclare le boss enragé (coche, z `en`).
   * Les durées de tour ne sont pas simulées : enragé = buffs d'enrage actifs.
   */
  rage?: true;
}

export interface BossPassivesStatic {
  entries: BossPassiveEntry[];
  /** Damage-pertinent mais NON évaluable statiquement — affiché, jamais tu. */
  unresolved: { buffId: string; reason: string }[];
}

/** Entrée évaluée contre les éléments du scénario (rapport + affichage). */
export interface BossPassiveApplied extends BossPassiveEntry {
  /** État sur les lignes du rapport (avantage forcé GLOBAL de l'attaquant
   *  compris). */
  active: boolean;
  /**
   * État par type de skill (`SKT_*`) quand il DIFFÈRE de `active` : la
   * supériorité forcée ne vaut que pour ces skills (buff restreint par
   * lanceur — ex. le S2 et les bursts d'Ame) et retourne la condition
   * élémentaire sur leurs lignes (inputs.ts, évaluation par coup).
   */
  bySkill?: Record<string, boolean>;
}

export interface BossPassivesInfo {
  entries: BossPassiveApplied[];
  unresolved: { buffId: string; reason: string }[];
}

/** Conditions ÉLÉMENTAIRES — `elementConditionMet` les évalue. */
const ELEMENT_CONDITIONS = new Set([
  'ATTACKER_ELEMENT_WIN',
  'ATTACKER_ELEMENT_EQUAL',
  'ATTACKER_ELEMENT_LOSE',
  // TARGET_ELEMENT (BUFF_CONDITION_TYPE 104) : `CheckElementEqual(cible,
  // ConditionValue)` = égalité STRICTE avec l'élément CET_* (désassemblé le
  // 24/08/2026, 40 octets). Ex. Ars Nova buff `9` : DMG_REDUCE −450 si
  // l'attaquant est LUMIÈRE (3) — avec le buff `7` (+300 EQUAL), rend le S1
  // de Beth au raid EXACT (4571).
  'TARGET_ELEMENT',
]);

/** Les conditions que la supériorité FORCÉE de l'attaquant peut retourner
 *  (`CheckElementWin`) — celles à réévaluer par coup. */
export function isForcedSensitiveCondition(condition: string | undefined): boolean {
  return condition !== undefined && condition.startsWith('ATTACKER_ELEMENT_');
}

/**
 * Cibles d'équipe FILTRÉES PAR CLASSE (`CCT_*` du receveur). La sémantique
 * « classe » (et non « membre en train d'agir ») est prouvée par la desc
 * officielle du S2 d'Eris : « increases the damage of ally Strikers » =
 * `MY_TEAM_ATTACKER` (2000117_2_5) — Striker = `CCT_ATTACKER` en interne.
 * Côté boss, `ENEMY_TEAM_<CLASSE>` vise la même classe dans l'équipe du
 * joueur (`teamClassOf`).
 */
export const TEAM_CLASS_TARGETS: Record<string, string> = {
  MY_TEAM_DEFENDER: 'CCT_DEFENDER',
  MY_TEAM_ATTACKER: 'CCT_ATTACKER',
  MY_TEAM_RANGER: 'CCT_RANGER',
  MY_TEAM_MAGE: 'CCT_MAGE',
  MY_TEAM_PRIEST: 'CCT_PRIEST',
};

/** Classe `CCT_*` d'une cible `MY_TEAM_<CLASSE>` ou `ENEMY_TEAM_<CLASSE>`. */
export function teamClassOf(target: string): string | undefined {
  if (target.startsWith('ENEMY_TEAM_'))
    return TEAM_CLASS_TARGETS[`MY_TEAM_${target.slice('ENEMY_TEAM_'.length)}`];
  return TEAM_CLASS_TARGETS[target];
}

/** Types côté DÉFENSEUR réellement consommés par le pipeline (§ 9.2/9.3, drapeaux). */
const DEFENDER_TYPES = new Set([
  'BT_DMG_REDUCE',
  'BT_DMG_REDUCE_FINAL',
  'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL',
  'BT_DMG_REDUCE_MY_TEAM_INCREASE',
  'BT_STEALTHED',
  'BT_INVINCIBLE',
  'BT_WG_INVINCIBLE',
  // Jauge (CalcDamageWG § 11) : retranché des dégâts de jauge du coup.
  'BT_WG_DMG_REDUCE',
]);

/** Types damage-pertinents SANS chemin d'application → unresolved, par raison. */
const UNRESOLVED_REASONS: Record<string, string> = {
  BT_LIMIT_DMG_TURN: 'plafond de dégâts par tour non simulé — contribution 0',
  BT_STAT_PREMIUM: 'passif de fiche du monstre, non versé aux stats — contribution 0',
};

/**
 * Stats du DÉFENSEUR que le pipeline consomme (les 4 entrées cibles du
 * rapport) : un `BT_STAT` d'ENRAGE sur l'une d'elles devient une entrée —
 * inputs.ts l'applique aux stats de la cible par l'identité § 16.1 (A = 0
 * pour un monstre : `stat' = trunc((stat + buffVal) × (1000 + buffRate) /
 * 1000)`). Ex. Common_Rage_Buff_3 : DMG Reduce +40 pts pendant l'enrage.
 */
const DEFENDER_STAT_CHANNEL = new Set([
  'ST_HP',
  'ST_DEF',
  'ST_DMG_REDUCE_RATE',
  'ST_E_CRI_DMG_REDUCE',
]);

/**
 * Stats ATTAQUANT que le pipeline consomme TOUJOURS pour un MONTANT : ATK
 * (facteurs § 8), CDMG (branche crit § 7.5), pierce/dmg_boost (agrégats § 9).
 * Les AUTRES stats ne pèsent un montant que si le SCÉNARIO les lit — swap
 * d'attaque § 10.1, familles `*_STAT` § 9.1 (ex. 2000067_2_6 : +50 % du taux
 * CRIT en dégâts), contexte PV § 14 — détecté par inputs.ts dans les buffs
 * actifs (`attackerAmountStats` du rapport). Crit CHANCE et buff chance hors
 * lecture de kit ne pèsent que sur des PROBABILITÉS de branche (§ 4).
 */
export const BASE_AMOUNT_STATS: readonly string[] = [
  'ST_ATK',
  'ST_CRITICAL_DMG_RATE',
  'ST_PIERCE_POWER_RATE',
  'ST_DMG_BOOST',
];

/**
 * L'entrée peut-elle changer un MONTANT de dégâts affiché ? — filtre des
 * chips du panneau contexte (Sevih 17/08/2026 : « les crit chance
 * n'interviennent pas dans les dégâts » — sauf quand le kit les lit, cf.
 * 2000067) : le moteur GARDE l'entrée (la crit chance du scénario nourrit
 * P(crit) § 4), seul l'affichage la tait. `amountStats` = les stats lues par
 * le scénario COURANT (`attackerAmountStats` du rapport, base sans rapport).
 * Côté défenseur, feedRow ne laisse déjà passer que les canaux consommés.
 */
export function passiveAffectsDamageAmount(
  e: BossPassiveEntry,
  amountStats: ReadonlySet<string>,
): boolean {
  if (e.side === 'defender') return true;
  if (e.buff.type !== 'BT_STAT') return true;
  return e.buff.stat !== undefined && amountStats.has(e.buff.stat);
}

/**
 * Les passifs STATIQUES d'un monstre preset — conditions NON évaluées (le
 * wrapper serveur s'en sert pour bâtir des props légères, le moteur les
 * évalue via `bossPassiveActive`). `undefined` si le monstre est inconnu
 * des tables targets.
 */
export function staticBossPassives(
  monsterId: string,
  targets: DamageTargetsData,
  buffs: DamageBuffsData,
): BossPassivesStatic | undefined {
  const monster = targets.targets[monsterId];
  if (!monster) return undefined;

  const entries: BossPassiveEntry[] = [];
  const unresolved: BossPassivesStatic['unresolved'] = [];
  // Une ligne de buff → entrée classée, ou raison, ou rien (hors périmètre).
  // `rage` : ligne d'un skill d'ENRAGE — le canal de STAT défenseur s'ouvre
  // (cf. DEFENDER_STAT_CHANNEL) et l'entrée est gatée par la coche enrage.
  const feedRow = (
    skillId: string,
    buffId: string,
    row: NonNullable<DamageBuffsData['buffs'][string]>[number],
    rage: boolean,
  ): void => {
    const condition = row.conditionType;
    const target = row.targetType ?? '';
    // Classement par cible (cf. en-tête) : côté du scénario, ou raison de
    // non-application quand le type est damage-pertinent sans chemin.
    const classify = (): {
      side?: BossPassiveEntry['side'];
      reason?: string;
      targetClass?: string;
    } => {
      if (target.startsWith('ENEMY_TEAM')) {
        // Équipe du JOUEUR : seuls les canaux de stats § 16.1 (et leur
        // renfort ENHANCE § 14.1) jouent sur les dégâts — soins/CP/boucliers
        // sur l'équipe : hors périmètre.
        if (row.type !== 'BT_STAT' && !STAT_ENHANCE_TYPES.has(row.type)) return {};
        if (target === 'ENEMY_TEAM') return { side: 'attacker' };
        // ENEMY_TEAM_<CLASSE> : l'attaquant seulement s'il est de la classe.
        const targetClass = teamClassOf(target);
        if (targetClass !== undefined) return { side: 'attacker', targetClass };
        return { reason: `cible ${target} — sélection d'équipe situationnelle, non attribuable` };
      }
      if (target === 'ME' || target === 'MY_TEAM') {
        if (DEFENDER_TYPES.has(row.type) || STAT_ENHANCE_TYPES.has(row.type))
          return { side: 'defender' };
        // ENRAGE : un BT_STAT sur une stat que le rapport consomme côté cible
        // devient une entrée (inputs.ts l'applique par l'identité § 16.1).
        if (rage && row.type === 'BT_STAT' && row.stat !== undefined)
          return DEFENDER_STAT_CHANNEL.has(row.stat) ? { side: 'defender' } : {}; // stat hors rapport (SPD…) : sans effet sur les dégâts reçus
        const known = UNRESOLVED_REASONS[row.type];
        if (known !== undefined) return { reason: known };
        if (row.type === 'BT_STAT')
          return { reason: 'stat du défenseur — canal non consommé par le pipeline' };
        return {}; // BT_DMG* sortants du boss : jamais calculés (§ 1)
      }
      return {};
    };
    const { side, reason: typeReason, targetClass } = classify();
    const conditionOk =
      condition === undefined || ELEMENT_CONDITIONS.has(condition) || condition === 'OWNER_RAGE';
    const reason =
      typeReason ??
      (side !== undefined && !conditionOk
        ? `condition ${condition} non évaluable statiquement`
        : undefined);
    if (reason !== undefined) {
      unresolved.push({ buffId, reason });
      return;
    }
    if (side === undefined) return;
    entries.push({
      skillId,
      buffId,
      side,
      buff: {
        type: row.type,
        ...(row.stat !== undefined ? { stat: row.stat } : {}),
        ...(row.applyingType !== undefined ? { applyingType: row.applyingType } : {}),
        ...(row.value !== undefined ? { value: row.value } : {}),
        // Buff VISIBLE et polarité : ce que lit le renfort ENHANCE (§ 14.1).
        ...(row.tooltipId ? { tooltipId: row.tooltipId } : {}),
        ...(isDebuffType(row.buffDebuffType) ? { debuff: true } : {}),
      },
      ...(condition !== undefined ? { condition } : {}),
      ...(row.conditionValue !== undefined ? { conditionValue: row.conditionValue } : {}),
      ...(targetClass !== undefined ? { targetClass } : {}),
      ...(rage ? { rage: true as const } : {}),
    });
  };
  // Un même BuffID listé deux fois (ex. `guild_raid_common_10` dans le
  // passif 170057 des raids de guilde) ne fait qu'UNE instance sans
  // `IsIDOverlap` : la seconde pose retrouve la première (`CBuff`,
  // `FindBuff(BuffID)`) — seules les lignes à `IsIDOverlap` se cumulent.
  const fed = new Set<string>();
  for (const ref of monster.skills) {
    const skill = targets.skills[ref.id];
    if (!skill) continue;
    const isPassive = skill.subType === 'PASSIVE';
    // Skill d'ENRAGE (`SKT_RAGE_ENTER*`) : ses buffs sont POSÉS quand le boss
    // s'enrage — gatés par la coche du scénario, jamais devinés. Les durées
    // (3 tours…) ne sont pas simulées : « enragé » = ils sont actifs.
    const isRage = skill.type.startsWith('SKT_RAGE_ENTER');
    if (!isPassive && !isRage) continue;
    // 650/650 passifs de boss preset sont mono-niveau (garde datagen) — le
    // niveau unique est LE niveau appliqué.
    const level = skill.levels[0];
    if (!level) continue;
    for (const buffId of level.buffIds) {
      const rows = buffs.buffs[buffId] ?? [];
      if (fed.has(buffId) && !rows.some((r) => r.isIdOverlap === true)) continue;
      fed.add(buffId);
      for (const row of rows) {
        // Passif : seules les lignes PASSIVE/PASSIVE2 sont permanentes (le
        // reste est dynamique — état de combat). Enrage : les lignes sont
        // posées au cast du skill d'enrage, quel que soit leur createType.
        if (isPassive && !isRage && row.createType !== 'PASSIVE' && row.createType !== 'PASSIVE2')
          continue;
        feedRow(ref.id, buffId, row, isRage);
      }
    }
  }
  return { entries, unresolved };
}

/** Ce que voit une condition élémentaire sur UN coup. */
export interface ElementConditionContext {
  attackerElement: Element;
  defenderElement: Element;
  /** L'attaquant porte `BT_DMG_ELEMENT_SUPERIORITY` sur CE coup — le même
   *  drapeau que le taux élémentaire § 6 (`collectCombatFlags`). */
  forcedSuperiority?: boolean;
}

/**
 * LA fonction de condition élémentaire (passifs de boss, équipement, kit,
 * calculateur) — `undefined` si la condition n'est pas élémentaire (à
 * l'appelant d'en décider).
 *
 * - `ATTACKER_ELEMENT_WIN/EQUAL/LOSE` : `CheckElementWin` — la supériorité
 *   FORCÉE de l'attaquant rend « attaquant gagnant » d'office ; l'infériorité
 *   forcée n'y joue pas (spec § 16.3). Sinon MÊME relation que le taux § 6
 *   (`getElementSuperiority`) : l'enum n'a que trois valeurs, EQUAL couvre
 *   tout ce qui n'est ni avantage ni désavantage.
 * - `TARGET_ELEMENT` : égalité STRICTE (`CheckElementEqual`) de l'élément de
 *   l'ADVERSAIRE du porteur du buff avec `ConditionValue` — absente = 0 =
 *   `CET_EARTH` (l'extracteur omet les zéros). `holder` = côté du PORTEUR :
 *   `defender` pour un passif de boss (l'élément lu est celui de
 *   l'attaquant), `attacker` pour un buff d'équipement ou de kit (celui de la
 *   cible).
 */
export function elementConditionMet(
  condition: string,
  conditionValue: number | undefined,
  ctx: ElementConditionContext,
  holder: 'attacker' | 'defender',
): boolean | undefined {
  if (!ELEMENT_CONDITIONS.has(condition)) return undefined;
  if (condition === 'TARGET_ELEMENT') {
    const opponent = holder === 'defender' ? ctx.attackerElement : ctx.defenderElement;
    return opponent === ((conditionValue ?? 0) as Element);
  }
  const sup = ctx.forcedSuperiority
    ? ElementSuperiority.AttackerWin
    : getElementSuperiority(ctx.attackerElement, ctx.defenderElement);
  if (condition === 'ATTACKER_ELEMENT_WIN') return sup === ElementSuperiority.AttackerWin;
  if (condition === 'ATTACKER_ELEMENT_LOSE') return sup === ElementSuperiority.AttackerLose;
  return sup === ElementSuperiority.Equal;
}

/** Le scénario contre lequel s'évalue un passif de boss. */
export interface BossPassiveContext extends ElementConditionContext {
  /** Classe `CCT_*` de l'attaquant — cibles `ENEMY_TEAM_<CLASSE>`. */
  attackerClass?: string;
  /** Boss déclaré enragé (coche, z `en`). */
  enraged?: boolean;
}

/** Un passif de boss est-il actif sur ce coup ? `OWNER_RAGE` et les buffs
 *  des skills d'enrage ne sont JAMAIS devinés (coche) ; une condition hors
 *  élémentaires n'arrive pas ici (unresolved) — jamais « active par défaut ». */
export function bossPassiveActive(e: BossPassiveEntry, ctx: BossPassiveContext): boolean {
  if (e.rage === true && ctx.enraged !== true) return false;
  if (e.targetClass !== undefined && e.targetClass !== ctx.attackerClass) return false;
  if (e.condition === undefined) return true;
  if (e.condition === 'OWNER_RAGE') return ctx.enraged === true;
  return elementConditionMet(e.condition, e.conditionValue, ctx, 'defender') ?? false;
}

/** Les passifs ÉVALUÉS contre le scénario (éléments, classe, enrage,
 *  supériorité forcée GLOBALE de l'attaquant) — la réévaluation par coup
 *  (supériorité forcée d'un seul skill) est faite par inputs.ts. */
export function resolveBossPassives(
  monsterId: string,
  targets: DamageTargetsData,
  buffs: DamageBuffsData,
  ctx: BossPassiveContext,
): BossPassivesInfo | undefined {
  const stat = staticBossPassives(monsterId, targets, buffs);
  if (!stat) return undefined;
  return {
    entries: stat.entries.map((e) => ({ ...e, active: bossPassiveActive(e, ctx) })),
    unresolved: stat.unresolved,
  };
}
