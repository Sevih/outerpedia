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

export type GearSource = 'weapon' | 'amulet' | 'set' | 'talisman' | 'ee' | 'kit' | 'quirk';

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

/** Les skills que le rapport LIGNE réellement (S1/S2/S3 + bursts) — un buff
 *  restreint hors de cet ensemble (chain attacks…) ne pèse sur aucune ligne. */
const REPORT_SKILL_TYPES = new Set([
  'SKT_FIRST',
  'SKT_SECOND',
  'SKT_ULTIMATE',
  'SKT_BURST_1',
  'SKT_BURST_2',
  'SKT_BURST_3',
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

/** Collecteur partagé équipement/kit : classe et range les lignes de buff. */
function makeCollector(
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
): {
  info: GearPassivesInfo;
  feed: (source: GearSource, sourceId: string, buffId: string, row: DataBuffLevel) => void;
  feedBuff: (source: GearSource, sourceId: string, buffId: string, level: number) => void;
} {
  const info: GearPassivesInfo = { entries: [], dynamic: [], unresolved: [] };

  /** Classe et range une ligne de buff (au niveau déjà choisi). */
  const feed = (source: GearSource, sourceId: string, buffId: string, row: DataBuffLevel): void => {
    const ct = row.createType;
    if (ct !== 'PASSIVE' && ct !== 'PASSIVE2') {
      // Proc — jamais simulé ; signalé seulement s'il peut peser sur le hit.
      if (damageRelevant(row) || row.type === 'BT_MARKING' || row.type.startsWith('BT_GROUP')) {
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
    // BT_STAT_PREMIUM (paliers de transcendance, mains d'EE…) : AFFICHÉ dans
    // la fiche du héros, donc déjà dans les stats SAISIES — jamais recompté.
    // Preuve : pierce 30 % identique sur deux équipements différents de la
    // même Dianne T-max (captures Sevih 05/08/2026) = le
    // `trancendent_8_pierce_30` rendu dans la fiche.
    if (row.type === 'BT_STAT_PREMIUM') return;
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

    // Buff restreint à UN skill (`TargetSkillType`) : l'application par slot
    // n'est pas branchée — signalé, contribution 0 (jamais versé à tous).
    if (row.targetSkillType !== undefined && side !== 'allies') {
      info.unresolved.push({
        source,
        sourceId,
        buffId,
        reason: `restreint à ${row.targetSkillType} — application par slot non branchée`,
      });
      return;
    }
    // Restriction par skill LANCEUR (`CallerSkillType`, CSV — ex. nœuds
    // « Chain Damage » : SKT_STRIKE_* seulement). Les chain attacks ne sont
    // pas des lignes du rapport : hors intersection → contribution 0, signalé.
    if (row.callerSkillType !== undefined && row.callerSkillType !== 'SKT_ALL') {
      const callers = row.callerSkillType.split(',').map((s) => s.trim());
      const overlaps = callers.some((c) => REPORT_SKILL_TYPES.has(c));
      info.unresolved.push({
        source,
        sourceId,
        buffId,
        reason: overlaps
          ? `restreint à ${row.callerSkillType} — application par slot non branchée`
          : `réservé à ${row.callerSkillType} (hors des lignes du rapport) — contribution 0`,
      });
      return;
    }

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

  return { info, feed, feedBuff };
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
  const { info, feedBuff } = makeCollector(buffs, attackerElement, defenderElement);

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

// ── Passifs du PERSONNAGE (kit — même canal que les boss, côté joueur) ──────

/** Miroir minimal du kit (characters.json) consommé ici. */
export interface KitCharacter {
  id: string;
  basicStar: number;
  skills: { slot: number; id: string }[];
}

export interface KitSkill {
  id: string;
  type: string;
  levels: { level: number; buffIds: string[] }[];
}

/** Palier du passif UNIQUE par transcendance (`growth.transcend.skillLevel`,
 *  prouvé tables : basicStar 3 → transStar 9 = niveau 4). */
export function uniquePassiveLevel(
  transcend: { basicStar: number; transStar: number; skillLevel: number }[],
  basicStar: number,
  transStar: number,
): number {
  let best = 0;
  for (const r of transcend) {
    if (r.basicStar !== basicStar || r.transStar > transStar) continue;
    if (r.skillLevel > best) best = r.skillLevel;
  }
  return best;
}

/**
 * Les passifs STATIQUES du kit de l'attaquant (skills `*_PASSIVE`), évalués
 * contre les éléments du scénario — même doctrine que l'équipement :
 * `BT_STAT_PREMIUM` (affiché dans la fiche) jamais recompté, procs/GROUP
 * signalés `dynamic` (ex. le passif par tour de H.Dianne = les chips
 * atk/chd/crit/spd), restrictions par skill signalées.
 *
 * Sélection de niveau : `SKT_UNIQUE_PASSIVE` = palier de TRANSCENDANCE
 * (`growth.transcend.skillLevel`) ; les autres passifs (classe, chain…) au
 * niveau MAX (pas de saisie UI — les niveaux ne portent que des textes en
 * 1.4.9 pour ces slots).
 */
// ── QUIRKS du compte (nœuds d'éveil « à impact » — buffs, jamais les stats) ──

/** Miroir minimal d'un nœud d'éveil (growth.awakening). */
export interface QuirkNode {
  id: string;
  groupType: string;
  applyType: string;
  applyTypeValue: number;
  levels: { level: number; optionType: string; buffId?: string }[];
}

/** Enums du binaire (dump.cs) — portée d'un nœud par classe/sous-classe. */
const CLASS_ENUM: Record<string, number> = {
  CCT_DEFENDER: 1,
  CCT_ATTACKER: 2,
  CCT_RANGER: 3,
  CCT_MAGE: 4,
  CCT_PRIEST: 5,
};
const SUBCLASS_ENUM: Record<string, number> = {
  ATTACKER: 1,
  BRUISER: 2,
  WIZARD: 3,
  ENCHANTER: 4,
  VANGUARD: 5,
  TACTICIAN: 6,
  SWEEPER: 7,
  PHALANX: 8,
  RELIEVER: 9,
  SAGE: 10,
};

/**
 * Les QUIRKS actifs du compte (réglage UI, hors z — comme le Codex), niveau
 * par nœud → buff du niveau (les nœuds `IOT_STAT` sont dans la fiche
 * AFFICHÉE via le paramètre éveil de CalcFinalStat § 17.4 — jamais recomptés,
 * l'UI ne propose d'ailleurs que les nœuds « à impact »). Portée du nœud :
 * `AAT_NONE` = tous, `AAT_ELEMENTAL`/`AAT_CLASS`/`AAT_SUBCLASS` = l'attaquant
 * doit matcher (enums du binaire ci-dessus) ; un type de portée inconnu est
 * SIGNALÉ, jamais deviné.
 */
export function resolveQuirkPassives(
  quirks: Record<string, number>,
  awakening: QuirkNode[],
  char: { element: Element; class?: string; subClass?: string },
  buffs: DamageBuffsData,
  defenderElement: Element,
  /** `DUNGEON_MODE` du combat (`DM_NORMAL`…) — gate de CONTENU de l'arbre
   *  licence ; absent (cible manuelle) = inconnu, signalé. */
  targetMode?: string,
): GearPassivesInfo {
  const { info, feedBuff } = makeCollector(buffs, char.element, defenderElement);
  for (const [nodeId, level] of Object.entries(quirks)) {
    if (level < 1) continue;
    const node = awakening.find((n) => n.id === nodeId);
    if (!node) {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: 'nœud absent des tables awakening',
      });
      continue;
    }
    // Gate de CONTENU du groupe (colonne de scope de la table des groupes —
    // preuve : les 4 captures Valentine 06/08/2026 rejouent EXACTEMENT en
    // retirant l'arbre licence hors contenu Adventure License) :
    // ELEMENTAL/JOB/UTILITY = tous contenus ; PVE = tout le PvE (seule scène
    // du rapport) ; ADVENTURE_LICENSE = ce contenu-là seulement.
    if (node.groupType === 'ADVENTURE_LICENSE') {
      if (targetMode === undefined) {
        info.unresolved.push({
          source: 'quirk',
          sourceId: nodeId,
          buffId: nodeId,
          reason: 'arbre licence — mode du combat inconnu (cible manuelle), contribution 0',
        });
        continue;
      }
      if (!targetMode.startsWith('DM_ADVENTURE')) continue; // hors contenu : rien
    } else if (!['ELEMENTAL', 'JOB', 'UTILITY', 'PVE'].includes(node.groupType)) {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: `arbre ${node.groupType} — portée de contenu inconnue, contribution 0`,
      });
      continue;
    }
    // Portée du nœud : ne s'applique qu'à l'attaquant qui matche.
    if (node.applyType === 'AAT_ELEMENTAL') {
      if (char.element !== (node.applyTypeValue as Element)) continue;
    } else if (node.applyType === 'AAT_CLASS') {
      if (CLASS_ENUM[char.class ?? ''] !== node.applyTypeValue) continue;
    } else if (node.applyType === 'AAT_SUBCLASS') {
      if (SUBCLASS_ENUM[char.subClass ?? ''] !== node.applyTypeValue) continue;
    } else if (node.applyType !== 'AAT_NONE') {
      info.unresolved.push({
        source: 'quirk',
        sourceId: nodeId,
        buffId: nodeId,
        reason: `portée ${node.applyType} inconnue — contribution 0`,
      });
      continue;
    }
    // Le niveau saisi REMPLACE les inférieurs (un buff par niveau).
    const row = node.levels.find((l) => l.level === level) ?? node.levels[node.levels.length - 1];
    if (row?.optionType !== 'IOT_BUFF' || !row.buffId) continue; // stat : déjà en fiche
    feedBuff('quirk', nodeId, row.buffId, 1);
  }
  return info;
}

export function resolveKitPassives(
  char: KitCharacter,
  transStar: number,
  skills: Record<string, KitSkill>,
  transcend: { basicStar: number; transStar: number; skillLevel: number }[],
  buffs: DamageBuffsData,
  attackerElement: Element,
  defenderElement: Element,
): GearPassivesInfo {
  const { info, feedBuff } = makeCollector(buffs, attackerElement, defenderElement);
  for (const ref of char.skills) {
    const sk = skills[ref.id];
    if (!sk || !sk.type.includes('PASSIVE')) continue;
    const wanted =
      sk.type === 'SKT_UNIQUE_PASSIVE'
        ? uniquePassiveLevel(transcend, char.basicStar, transStar)
        : sk.levels.length;
    if (wanted < 1) continue;
    const lv =
      sk.levels.filter((l) => l.level <= wanted).sort((a, b) => b.level - a.level)[0] ??
      sk.levels[0];
    for (const b of lv.buffIds) feedBuff('kit', sk.id, b, 1);
  }
  return info;
}
