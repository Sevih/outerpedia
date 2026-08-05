/**
 * PASSIFS D'ÉQUIPEMENT du PORTEUR (spec § 15, canal 2) — arme, accessoire,
 * sets, Rogue's Charm, EE. Demandé par Sevih (05/08/2026) : « brancher les
 * moteurs » avant de chasser les deltas — un passif d'équipement est un
 * `CBuffTemplet` ordinaire (spec § 15 : mêmes agrégations § 9/§ 16.1 que les
 * buffs de skills), on ne trafique JAMAIS les stats saisies pour le simuler.
 *
 * Périmètre — même doctrine que les passifs de boss (passives.ts) :
 *   - créations `PASSIVE`/`PASSIVE2` : appliquées STATIQUEMENT quand le type
 *     est consommé par le pipeline attaquant (BT_STAT, familles BT_DMG* § 9.1,
 *     drapeaux § 6/§ 10.1, stats « PV perdus » § 14) ;
 *   - procs (`SKILL_FINISH`, `ON_SPAWN`…) damage-pertinents : NON simulés —
 *     remontés `dynamic` (ex. le marking de Rampaging Caracal se représente
 *     par la chip « cible marquée ») ; les procs hors-dégâts (soins, CP/AP,
 *     jauge d'action…) sont ignorés silencieusement ;
 *   - `BT_WG_*` : agrégation de la jauge non désassemblée (§ 12.3) →
 *     unresolved ; conditions non évaluables (§ 12.1) → unresolved.
 *
 * Sélections de niveau (spec § 17.5, prouvé binaire) :
 *   - option principale à BUFF (EE « dégâts vs élément ») : niveau de buff
 *     = `enchant + 1` ;
 *   - options SPÉCIALES (`ItemSpecialOptionTemplet`) : lignes de niveau
 *     ≤ `max(enchant, 1)` — `IsAdd=false` remplace les niveaux inférieurs,
 *     `IsAdd=true` s'ajoute (EE Lv10 `_ADD`/`_CHANGE`) ;
 *   - SETS : la ligne dont `breakLimitCounts` contient le nombre de break de
 *     la pièce (0 = base, 4 = enchantée) ; 1 set choisi = 4 pièces (2P + 4P),
 *     2 sets = 2P chacun (convention UI) ;
 *   - arme/accessoire : le buff unique porte 5 niveaux = breakthrough T0..T4
 *     → niveau `tier + 1` (convention validée par l'affichage wiki) ;
 *   - Rogue's Charm : interrupteur « +10 » (seul état damage-pertinent — la
 *     ligne Lv10 `BT_DMG_TARGET_BREAK` ; le Lv1 est un buff de CP, ignoré).
 *
 * Condition `TARGET_ELEMENT` (prouvée 05/08/2026) : `BuffConditionValue` =
 * `CHARACTER_ELEMENT_TYPE` de la CIBLE (EARTH=0, WATER=1, FIRE=2, LIGHT=3,
 * DARK=4 — dump.cs ; valeur absente = 0 = terre). Corroboration : la desc
 * officielle de l'EE 2000019 (« damage dealt to Fire enemies ») porte
 * `BuffConditionValue = 2` = CET_FIRE.
 */

import type { ActiveBuff } from './aggregate';
import { passiveConditionMet } from './passives';
import { Element } from './types';
import type {
  DamageBuffsData,
  DamageEquipmentData,
  DataBuffLevel,
  DataSpecialOption,
} from './inputs';

// ── Entrées (résolues par le pont — slugs UI → groupes des tables) ──────────

/** Arme ou accessoire : groupes d'options uniques + breakthrough 0..4. */
export interface GearUniqueInput {
  groups: string[];
  tier: number;
}

/** Un set choisi (GroupID = id de set des tables, jointure 1:1 vérifiée). */
export interface GearSetInput {
  groupId: string;
  enchanted: boolean;
  /** 1 set choisi = 4 pièces (2P + 4P), 2 sets = 2P chacun (convention UI). */
  pieces: 2 | 4;
}

export interface GearSelection {
  weapon?: GearUniqueInput;
  amulet?: GearUniqueInput;
  sets?: GearSetInput[];
  /** Rogue's Charm +10 — groupes du talisman 6★ (résolus par le pont). */
  roguesCharm?: { groups: string[] };
  /** EE porté (pièce trouvée par `characterLimit` = perso) + enchant 0..10. */
  ee?: { enchant: number };
}

// ── Sorties ─────────────────────────────────────────────────────────────────

export type GearSource = 'weapon' | 'amulet' | 'set' | 'talisman' | 'ee';

export interface GearPassiveEntry {
  source: GearSource;
  /** GroupID / id de set — lien vers le libellé côté UI. */
  sourceId: string;
  buffId: string;
  /** `attacker` = le porteur ; `defender` = débuff permanent sur l'ennemi ;
   *  `allies` = MY_TEAM_WITHOUT_ME — ne profite JAMAIS au porteur (affiché
   *  inactif, ex. Absolute Music : +dégâts aux boss pour les ALLIÉS). */
  side: 'attacker' | 'defender' | 'allies';
  buff: ActiveBuff;
  condition?: string;
  /** Élément visé par `TARGET_ELEMENT` (enum binaire). */
  conditionElement?: Element;
}

export interface GearPassiveApplied extends GearPassiveEntry {
  active: boolean;
}

/** Proc damage-pertinent NON simulé — à représenter par une chip d'état. */
export interface GearDynamicEntry {
  source: GearSource;
  sourceId: string;
  buffId: string;
  createType: string;
  buff: ActiveBuff;
}

export interface GearPassivesInfo {
  entries: GearPassiveApplied[];
  dynamic: GearDynamicEntry[];
  unresolved: { source: GearSource; sourceId: string; buffId: string; reason: string }[];
}

// ── Référentiels de classement ──────────────────────────────────────────────

/** Types côté ATTAQUANT réellement consommés (§ 9.1, § 16.1, drapeaux § 6/10.1,
 *  stats « PV perdus » § 14 — implémentées dans collectStatChannels). */
const ATTACKER_TYPES = new Set([
  'BT_STAT',
  'BT_STAT_OWNER_LOST_HP_RATE',
  'BT_STAT_OWNER_LOST_HP_RATE_HALF',
  'BT_DMG',
  'BT_DMG_TO_BOSS',
  'BT_DMG_TARGET_BREAK',
  'BT_DMG_NOT_CRITICAL',
  'BT_DMG_OWNER_STAT',
  'BT_DMG_CASTER_STAT',
  'BT_DMG_TARGET_STAT',
  'BT_DMG_OWNER_BUFF',
  'BT_DMG_OWNER_DEBUFF',
  'BT_DMG_TARGET_BUFF',
  'BT_DMG_TARGET_DEBUFF',
  'BT_DMG_OWNER_TEAM_BUFF',
  'BT_DMG_MY_TEAM_DECREASE',
  'BT_DMG_OWNER_LOST_HP_RATE',
  'BT_DMG_TARGET_LOST_HP_RATE',
  'BT_DMG_CASTER_LOST_HP_RATE',
  'BT_DMG_KILL_COUNT_STACK',
  'BT_DMG_PVP_CONTENT',
  'BT_DMG_MONADGATE_CONTENT',
  'BT_DMG_TOWER_CONTENT',
  'BT_DMG_ELEMENT_SUPERIORITY',
  'BT_DMG_ELEMENT_INFERIORITY',
  'BT_DMG_ELEMENT_ENCHANT',
  'BT_DMG_ENEMY_TEAM_DECREASE',
  'BT_SWAP_STAT_ATTACK',
]);

/** Types côté DÉFENSEUR consommés (mêmes que passives.ts § 9.2/9.3). */
const DEFENDER_TYPES = new Set([
  'BT_DMG_REDUCE',
  'BT_DMG_REDUCE_FINAL',
  'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL',
  'BT_DMG_REDUCE_MY_TEAM_INCREASE',
  'BT_STEALTHED',
  'BT_INVINCIBLE',
  'BT_WG_INVINCIBLE',
  'BT_MARKING',
]);

const ELEMENT_CONDITIONS = new Set([
  'ATTACKER_ELEMENT_WIN',
  'ATTACKER_ELEMENT_EQUAL',
  'ATTACKER_ELEMENT_LOSE',
]);

/** Une condition d'équipement est-elle satisfaite ? `undefined` = non
 *  évaluable statiquement (§ 12.1) → l'appelant remonte `unresolved`. */
export function gearConditionMet(
  condition: string | undefined,
  conditionValue: number | undefined,
  attackerElement: Element,
  defenderElement: Element,
): boolean | undefined {
  if (condition === undefined) return true;
  if (ELEMENT_CONDITIONS.has(condition))
    return passiveConditionMet(condition, attackerElement, defenderElement);
  // BuffConditionValue = CET_* de la CIBLE, absente = 0 = terre (cf. en-tête).
  if (condition === 'TARGET_ELEMENT') return defenderElement === ((conditionValue ?? 0) as Element);
  return undefined;
}

// ── Sélections de niveau (§ 17.5) ───────────────────────────────────────────

/** La ligne de buff du niveau demandé — sinon la plus haute ligne ≤ demandé,
 *  sinon la première (un buff mono-niveau sert tous les paliers). */
function pickBuffRow(rows: DataBuffLevel[], level: number): DataBuffLevel | undefined {
  let best: DataBuffLevel | undefined;
  for (const r of rows) if (r.level <= level && (!best || r.level > best.level)) best = r;
  return best ?? rows[0];
}

/** Lignes spéciales actives au niveau donné : la plus haute `IsAdd=false`
 *  ≤ niveau (remplace), plus toutes les `IsAdd=true` ≤ niveau (s'ajoutent). */
function activeSpecialRows(rows: DataSpecialOption[], level: number): DataSpecialOption[] {
  let base: DataSpecialOption | undefined;
  for (const r of rows)
    if (!r.isAdd && r.level <= level && (!base || r.level > base.level)) base = r;
  const adds = rows.filter((r) => r.isAdd && r.level <= level);
  return [...(base ? [base] : []), ...adds];
}

// ── Résolution ──────────────────────────────────────────────────────────────

/** Un buff est-il pertinent pour les dégâts du hit (signalement des procs) ? */
function damageRelevant(row: DataBuffLevel): boolean {
  return ATTACKER_TYPES.has(row.type) || DEFENDER_TYPES.has(row.type);
}

function toActiveBuff(row: DataBuffLevel): ActiveBuff {
  return {
    type: row.type,
    ...(row.stat !== undefined ? { stat: row.stat } : {}),
    ...(row.applyingType !== undefined ? { applyingType: row.applyingType } : {}),
    ...(row.value !== undefined ? { value: row.value } : {}),
  };
}

/**
 * Les passifs d'équipement du porteur, ÉVALUÉS contre les éléments du
 * scénario. `attackerId` sert à retrouver l'EE (`characterLimit`).
 */
export function resolveGearPassives(
  attackerId: string,
  gear: GearSelection,
  equipment: DamageEquipmentData,
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
): GearPassivesInfo {
  const info: GearPassivesInfo = { entries: [], dynamic: [], unresolved: [] };

  /** Classe et range une ligne de buff (au niveau déjà choisi). */
  const feed = (source: GearSource, sourceId: string, buffId: string, row: DataBuffLevel): void => {
    const ct = row.createType;
    if (ct !== 'PASSIVE' && ct !== 'PASSIVE2') {
      // Proc — jamais simulé ; signalé seulement s'il peut peser sur le hit.
      if (damageRelevant(row) || row.type === 'BT_MARKING') {
        info.dynamic.push({
          source,
          sourceId,
          buffId,
          createType: ct ?? '',
          buff: toActiveBuff(row),
        });
      }
      return;
    }
    const target = row.targetType ?? '';
    let side: GearPassiveEntry['side'] | undefined;
    if (target === 'MY_TEAM_WITHOUT_ME') side = 'allies';
    else if (target === 'ME' || target === 'MY_TEAM' || target === '') {
      if (ATTACKER_TYPES.has(row.type)) side = 'attacker';
      else if (row.type.startsWith('BT_WG_')) {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: 'agrégation jauge non désassemblée (§ 12.3)',
        });
        return;
      } else return; // soins, CP/AP, boucliers… : sans effet sur le hit calculé
    } else if (target.startsWith('ENEMY')) {
      if (DEFENDER_TYPES.has(row.type)) side = 'defender';
      else if (row.type === 'BT_STAT') {
        info.unresolved.push({
          source,
          sourceId,
          buffId,
          reason: 'stat du défenseur — canal non consommé par le pipeline',
        });
        return;
      } else return;
    } else return;

    const condition = row.conditionType;
    // `allies` : jamais appliqué au porteur — affiché inactif, pas de condition.
    const met =
      side === 'allies'
        ? false
        : gearConditionMet(condition, row.conditionValue, attackerElement, defenderElement);
    if (met === undefined) {
      info.unresolved.push({
        source,
        sourceId,
        buffId,
        reason: `condition ${condition} non évaluable statiquement (§ 12.1)`,
      });
      return;
    }
    info.entries.push({
      source,
      sourceId,
      buffId,
      side,
      buff: toActiveBuff(row),
      ...(condition !== undefined ? { condition } : {}),
      ...(condition === 'TARGET_ELEMENT'
        ? { conditionElement: (row.conditionValue ?? 0) as Element }
        : {}),
      active: met,
    });
  };

  /** Toutes les lignes de buff d'un id, au niveau demandé. */
  const feedBuff = (source: GearSource, sourceId: string, buffId: string, level: number): void => {
    const rows = buffs.buffs[buffId];
    if (!rows?.length) {
      info.unresolved.push({ source, sourceId, buffId, reason: 'buff absent de buffs.json' });
      return;
    }
    const row = pickBuffRow(rows, level);
    if (row) feed(source, sourceId, buffId, row);
  };

  /** Groupes d'options UNIQUES (arme/accessoire/talisman/EE) au niveau spécial
   *  donné ; `buffLevel` = niveau demandé aux buffs de ces lignes. */
  const feedUnique = (
    source: GearSource,
    groups: string[],
    specialLevel: number,
    buffLevel: number,
  ): void => {
    for (const gid of groups) {
      const rows = equipment.specialGroups[gid];
      if (!rows?.length) {
        info.unresolved.push({
          source,
          sourceId: gid,
          buffId: gid,
          reason: 'groupe absent des tables equipment',
        });
        continue;
      }
      for (const r of activeSpecialRows(rows, specialLevel))
        for (const b of r.buffIds ?? []) feedBuff(source, gid, b, buffLevel);
    }
  };

  if (gear.weapon) feedUnique('weapon', gear.weapon.groups, 1, gear.weapon.tier + 1);
  if (gear.amulet) feedUnique('amulet', gear.amulet.groups, 1, gear.amulet.tier + 1);
  // Rogue's Charm : interrupteur « +10 » (cf. en-tête) — lignes Lv1 + Lv10.
  if (gear.roguesCharm) feedUnique('talisman', gear.roguesCharm.groups, 10, 1);

  for (const s of gear.sets ?? []) {
    const rows = equipment.specialGroups[s.groupId];
    const breakCount = s.enchanted ? 4 : 0;
    const row = rows?.find((r) => r.breakLimitCounts.includes(breakCount)) ?? rows?.[0];
    if (!row) {
      info.unresolved.push({
        source: 'set',
        sourceId: s.groupId,
        buffId: s.groupId,
        reason: 'set absent des tables equipment',
      });
      continue;
    }
    const effects = [row.twoPiece, ...(s.pieces === 4 ? [row.fourPiece] : [])];
    for (const e of effects) {
      // IOT_STAT (ATK %…) : canal 1 du § 15 — déjà dans la fiche SAISIE.
      if (!e || e.optionType !== 'IOT_BUFF' || !e.buffId) continue;
      feedBuff('set', s.groupId, e.buffId, e.buffLevel ?? 1);
    }
  }

  if (gear.ee) {
    const piece = Object.values(equipment.pieces).find(
      (p) => p.characterLimit === attackerId && p.subType === 'ITS_EQUIP_EXCLUSIVE',
    );
    // Pas de pièce liée au perso = il n'a PAS d'EE (état normal — l'UI envoie
    // « EE porté » par défaut sans savoir si le perso en a un).
    if (piece) {
      const enchant = gear.ee.enchant;
      // Lignes spéciales : niveau max(enchant, 1) (§ 17.5) — Lv1 base, Lv10 ADD/CHANGE.
      feedUnique('ee', piece.uniqueOptionGroups, Math.max(enchant, 1), 1);
      // Option principale à BUFF (« dégâts vs élément ») : niveau enchant + 1.
      for (const gid of piece.mainOptionGroups) {
        for (const o of equipment.optionGroups[gid] ?? []) {
          if (o.optionType !== 'IOT_BUFF' || !o.buffId) continue;
          feedBuff('ee', gid, o.buffId, enchant + 1);
        }
      }
    }
  }

  return info;
}
