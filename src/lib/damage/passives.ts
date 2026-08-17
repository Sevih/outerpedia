/**
 * PASSIFS DE BOSS — les buffs que le kit d'un monstre preset pose en
 * PERMANENT au combat (`SkillSubType == PASSIVE`, `BuffCreateType == PASSIVE`),
 * demandés par Sevih (05/08/2026) : « c'est un débuff comme un autre » — ils
 * traversent le système de buffs du moteur, on ne trafique JAMAIS les stats
 * saisies pour les simuler.
 *
 * Chaîne de données (tout est DÉJÀ extrait, aucune table nouvelle) :
 *   targets.json (kit du monstre, slots `Skill_<n>`) → skills PASSIVE →
 *   `buffIds` du niveau unique (650/650 passifs de boss preset sont
 *   mono-niveau en 1.4.9 — garde testée) → buffs.json (lignes BuffTemplet :
 *   type, cible, valeur, condition).
 *
 * Classement par CIBLE du buff (`TargetType`, point de vue du BOSS) :
 *   - `ENEMY_TEAM*` = l'équipe du JOUEUR → côté ATTAQUANT (ex. « Starving
 *     Devil » : taux crit +100 %, dégâts crit −85 % sur toute l'équipe) ;
 *   - `ME`/`MY_TEAM` = le boss → côté DÉFENSEUR (ex. réductions de dégâts
 *     conditionnées à l'élément de l'attaquant).
 *
 * Conditions ÉVALUABLES statiquement : les trois élémentaires
 * (`ATTACKER_ELEMENT_WIN/EQUAL/LOSE`, enum binaire `ELEMENT_SUPERIORITY_TYPE`
 * à TROIS valeurs — EQUAL est le « ni avantage ni désavantage », pas « même
 * élément ») — résolues par la MÊME relation § 6 que le taux élémentaire
 * (`getElementSuperiority`). `OWNER_RAGE` et les buffs des skills d'ENRAGE
 * (`SKT_RAGE_ENTER*`) sont gatés par la DÉCLARATION du scénario (coche
 * « Enragé », z `en` — 17/08/2026), jamais devinés. Toute autre condition
 * (`OWNER_HAS_BUFF`…) dépend de l'état du combat : le buff est REMONTÉ
 * `unresolved`, contribution 0.
 *
 * HORS périmètre (documenté, jamais tu quand c'est damage-pertinent) :
 *   - `BT_WG_DMG_REDUCE` : l'agrégation de la jauge n'est pas désassemblée
 *     (spec formule § 12.3) → unresolved ;
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

import type { ActiveBuff } from './aggregate';
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
  /** Condition élémentaire (`ATTACKER_ELEMENT_*`) ou `OWNER_RAGE` — absente =
   *  toujours actif. */
  condition?: string;
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
  active: boolean;
}

export interface BossPassivesInfo {
  entries: BossPassiveApplied[];
  unresolved: { buffId: string; reason: string }[];
}

const ELEMENT_CONDITIONS = new Set([
  'ATTACKER_ELEMENT_WIN',
  'ATTACKER_ELEMENT_EQUAL',
  'ATTACKER_ELEMENT_LOSE',
]);

/** Types côté DÉFENSEUR réellement consommés par le pipeline (§ 9.2/9.3, drapeaux). */
const DEFENDER_TYPES = new Set([
  'BT_DMG_REDUCE',
  'BT_DMG_REDUCE_FINAL',
  'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL',
  'BT_DMG_REDUCE_MY_TEAM_INCREASE',
  'BT_STEALTHED',
  'BT_INVINCIBLE',
  'BT_WG_INVINCIBLE',
]);

/** Types damage-pertinents SANS chemin d'application → unresolved, par raison. */
const UNRESOLVED_REASONS: Record<string, string> = {
  BT_WG_DMG_REDUCE: 'agrégation jauge non désassemblée (§ 12.3)',
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
 * évalue via `passiveConditionMet`). `undefined` si le monstre est inconnu
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
    const classify = (): { side?: BossPassiveEntry['side']; reason?: string } => {
      if (target.startsWith('ENEMY_TEAM')) {
        // Équipe du JOUEUR : seuls les canaux de stats § 16.1 jouent sur
        // les dégâts — soins/CP/boucliers sur l'équipe : hors périmètre.
        return row.type === 'BT_STAT' ? { side: 'attacker' } : {};
      }
      if (target === 'ME' || target === 'MY_TEAM') {
        if (DEFENDER_TYPES.has(row.type)) return { side: 'defender' };
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
    const { side, reason: typeReason } = classify();
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
      },
      ...(condition !== undefined ? { condition } : {}),
      ...(rage ? { rage: true as const } : {}),
    });
  };
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
      for (const row of buffs.buffs[buffId] ?? []) {
        // Passif : seules les lignes PASSIVE sont permanentes (le reste est
        // dynamique — état de combat). Enrage : les lignes sont posées au cast
        // du skill d'enrage, quel que soit leur createType.
        if (isPassive && !isRage && row.createType !== 'PASSIVE') continue;
        feedRow(ref.id, buffId, row, isRage);
      }
    }
  }
  return { entries, unresolved };
}

/**
 * Une condition élémentaire est-elle satisfaite ? MÊME relation que le taux
 * § 6 (`getElementSuperiority`) — l'enum binaire n'a que trois valeurs, EQUAL
 * couvre tout ce qui n'est ni avantage ni désavantage.
 */
export function passiveConditionMet(
  condition: string | undefined,
  attackerElement: Element,
  defenderElement: Element,
): boolean {
  if (condition === undefined) return true;
  const sup = getElementSuperiority(attackerElement, defenderElement);
  if (condition === 'ATTACKER_ELEMENT_WIN') return sup === ElementSuperiority.AttackerWin;
  if (condition === 'ATTACKER_ELEMENT_LOSE') return sup === ElementSuperiority.AttackerLose;
  if (condition === 'ATTACKER_ELEMENT_EQUAL') return sup === ElementSuperiority.Equal;
  return false; // condition inconnue : jamais « active par défaut »
}

/** Les passifs ÉVALUÉS contre les éléments du scénario et l'état d'enrage
 *  déclaré (coche, z `en`) — `OWNER_RAGE` et les buffs des skills d'enrage ne
 *  sont JAMAIS devinés. */
export function resolveBossPassives(
  monsterId: string,
  targets: DamageTargetsData,
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
  enraged = false,
): BossPassivesInfo | undefined {
  const stat = staticBossPassives(monsterId, targets, buffs);
  if (!stat) return undefined;
  return {
    entries: stat.entries.map((e) => ({
      ...e,
      active:
        (e.rage !== true || enraged) &&
        (e.condition === 'OWNER_RAGE'
          ? enraged
          : passiveConditionMet(e.condition, attackerElement, defenderElement)),
    })),
    unresolved: stat.unresolved,
  };
}
