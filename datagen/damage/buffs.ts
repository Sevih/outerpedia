/**
 * Extracteur DAMAGE #3 — BUFFS : le sous-ensemble de `BuffTemplet` ATTEIGNABLE
 * depuis les artefacts damage déjà émis (kits, éveil, monad, équipement,
 * artefacts, cibles) + les buffs d'affinité (`TrustBuffTemplet`) — jamais les
 * 10 838 lignes entières (mapping § 5). Les kits de MONSTRES référencent la
 * MÊME table (clé logique = colonne `BuffID`, ≠ `ID` de ligne) : les passifs
 * défensifs des cibles et les buffs d'état break entrent dans la fermeture.
 *
 * `BuffTemplet` ne porte AUCUNE colonne de référence vers d'autres buffs
 * (vérifié 03/08/2026) : la « fermeture transitive » du plan § 6 se réduit à
 * la résolution directe des refs collectées. Un `BuffID` peut avoir PLUSIEURS
 * lignes (`Level` — ex. les options principales d'EE, résolues au niveau
 * `enchant + 1`, spec § 17.5) : on émet toutes ses lignes, triées par niveau.
 *
 * Champs livrés : le sous-ensemble consommé par les formules (§ 9 familles,
 * § 14 valeur/stacks/soins, § 15 marqueurs d'équipement, § 5 CreateRate →
 * CheckResist) + déclencheurs/durées bruts. Les champs purement visuels
 * (effets, textes, icônes) sont hors périmètre (report-inputs § 4).
 */
import { loadTable, num, bool, splitCsv, type Row } from '../lib/tables';
import type { DamageCharactersData } from './characters';
import type { DamageGrowthData } from './growth';
import type { DamageEquipmentData } from './equipment';
import type { DamageTargetsData } from './targets';

/** Une ligne de `BuffTemplet` (un niveau d'un buff), champs bruts non vides. */
export interface DamageBuffLevel {
  level: number;
  /** `BT_*` — la famille pilote la formule (§ 9 / § 14). */
  type: string;
  targetType: string;
  /** ‰ — proba de pose (`CheckProbabilityPermille` puis `CheckResist` § 5). */
  createRate: number;
  /** Valeur effective en combat = `value × stacks` (§ 14.1). */
  stackCount: number;
  buffDebuffType: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  /** Skills déclencheurs/portée (`SKT_*`, CSV brut) — conditions d'application. */
  callerSkillType?: string;
  targetSkillType?: string;
  callerDamageId?: string;
  createType?: string;
  conditionType?: string;
  conditionValue?: number;
  startCool?: number;
  cool?: number;
  turnDuration?: number;
  removeType?: string;
  hitOverCount?: number;
  ccType?: string;
  isIdOverlap?: boolean;
  isTypeOverlap?: boolean;
  additiveAttack?: boolean;
  removeOnCasterDie?: boolean;
  /** Marqueurs des passifs d'équipement (spec § 15). */
  isEquip?: boolean;
  isEquipBuff?: boolean;
  isCC?: boolean;
  isShield?: boolean;
  isDebuff?: boolean;
  isIgnoreImmune?: boolean;
  isIgnoreResist?: boolean;
}

export interface DamageBuffsData {
  /** `BuffID` → ses niveaux (toutes les lignes du templet, triées). */
  buffs: Record<string, DamageBuffLevel[]>;
  /** Paliers d'affinité (`TrustBuffTemplet`, ordre de la table) → `BuffID`. */
  trust: { id: string; buffId: string }[];
  /** Refs collectées mais ABSENTES de `BuffTemplet` (réfs mortes du jeu). */
  unresolved: string[];
}

function buffLevel(r: Row): DamageBuffLevel {
  const opt = <T>(cond: boolean, key: string, val: T): Record<string, T> | object =>
    cond ? { [key]: val } : {};
  return {
    level: num(r.Level),
    type: r.Type ?? '',
    targetType: r.TargetType ?? '',
    createRate: num(r.CreateRate),
    stackCount: num(r.StackCount),
    buffDebuffType: r.BuffDebuffType ?? '',
    ...opt(!!r.StatType && r.StatType !== 'ST_NONE', 'stat', r.StatType),
    ...opt(!!r.ApplyingType && r.ApplyingType !== 'OAT_NONE', 'applyingType', r.ApplyingType),
    ...opt(!!r.Value && r.Value !== '0', 'value', num(r.Value)),
    ...opt(
      !!r.CallerSkillType && r.CallerSkillType !== 'SKT_NONE',
      'callerSkillType',
      r.CallerSkillType,
    ),
    ...opt(
      !!r.TargetSkillType && r.TargetSkillType !== 'SKT_NONE',
      'targetSkillType',
      r.TargetSkillType,
    ),
    ...opt(!!r.CallerDamageID && r.CallerDamageID !== '0', 'callerDamageId', r.CallerDamageID),
    ...opt(!!r.BuffCreateType && r.BuffCreateType !== 'NONE', 'createType', r.BuffCreateType),
    ...opt(
      !!r.BuffConditionType && r.BuffConditionType !== 'NONE',
      'conditionType',
      r.BuffConditionType,
    ),
    ...opt(
      !!r.BuffConditionValue && r.BuffConditionValue !== '0',
      'conditionValue',
      num(r.BuffConditionValue),
    ),
    ...opt(num(r.BuffStartCool) !== 0, 'startCool', num(r.BuffStartCool)),
    ...opt(num(r.BuffCool) !== 0, 'cool', num(r.BuffCool)),
    ...opt(num(r.TurnDuration) !== 0, 'turnDuration', num(r.TurnDuration)),
    ...opt(!!r.BuffRemoveType && r.BuffRemoveType !== 'NONE', 'removeType', r.BuffRemoveType),
    ...opt(num(r.HitOverCount) !== 0, 'hitOverCount', num(r.HitOverCount)),
    ...opt(!!r.BuffCCType && r.BuffCCType !== 'NONE', 'ccType', r.BuffCCType),
    ...opt(bool(r.IsIDOverlap), 'isIdOverlap', true),
    ...opt(bool(r.IsTypeOverlap), 'isTypeOverlap', true),
    ...opt(bool(r.AdditiveAttack), 'additiveAttack', true),
    ...opt(bool(r.RemoveOnCasterDie), 'removeOnCasterDie', true),
    ...opt(bool(r.IsEquip), 'isEquip', true),
    ...opt(bool(r.IsEquipBuff), 'isEquipBuff', true),
    ...opt(bool(r.IsCC), 'isCC', true),
    ...opt(bool(r.IsShield), 'isShield', true),
    ...opt(bool(r.IsDebuff), 'isDebuff', true),
    ...opt(bool(r.IsIgnoreImmune), 'isIgnoreImmune', true),
    ...opt(bool(r.IsIgnoreResist), 'isIgnoreResist', true),
  };
}

/** Toutes les refs `BuffID` portées par les artefacts damage émis (CSV éclatés). */
export function collectBuffRefs(
  characters: DamageCharactersData,
  growth: DamageGrowthData,
  equipment: DamageEquipmentData,
  targets: DamageTargetsData,
): Set<string> {
  const refs = new Set<string>();
  const add = (v: string | undefined): void => {
    for (const b of splitCsv(v)) if (b !== '0') refs.add(b);
  };
  for (const s of Object.values(characters.skills))
    for (const l of s.levels) for (const b of l.buffIds) add(b);
  for (const s of Object.values(targets.skills))
    for (const l of s.levels) for (const b of l.buffIds) add(b);
  for (const t of Object.values(targets.targets))
    for (const b of t.rage?.breakBuffIds ?? []) add(b);
  for (const b of targets.rankBuffIds) add(b);
  for (const n of growth.awakening) for (const l of n.levels) add(l.buffId);
  for (const m of growth.monad) add(m.effect.buffId);
  for (const g of Object.values(equipment.optionGroups)) for (const o of g) add(o.buffId);
  for (const g of Object.values(equipment.specialGroups))
    for (const s of g) {
      for (const b of s.buffIds ?? []) add(b);
      add(s.twoPiece?.buffId);
      add(s.fourPiece?.buffId);
    }
  for (const a of equipment.artifacts) for (const b of a.buffIds) add(b);
  for (const t of loadTable('TrustBuffTemplet')) add(t.BuffID);
  return refs;
}

export function buildDamageBuffs(
  characters: DamageCharactersData,
  growth: DamageGrowthData,
  equipment: DamageEquipmentData,
  targets: DamageTargetsData,
): DamageBuffsData {
  const refs = collectBuffRefs(characters, growth, equipment, targets);

  const rowsById = new Map<string, Row[]>();
  for (const r of loadTable('BuffTemplet')) {
    const id = r.BuffID;
    if (!id || !refs.has(id)) continue;
    const bucket = rowsById.get(id);
    if (bucket) bucket.push(r);
    else rowsById.set(id, [r]);
  }

  const buffs: Record<string, DamageBuffLevel[]> = {};
  const unresolved: string[] = [];
  for (const id of [...refs].sort()) {
    const rows = rowsById.get(id);
    if (!rows) {
      unresolved.push(id);
      continue;
    }
    buffs[id] = rows.map(buffLevel).sort((a, b) => a.level - b.level);
  }

  const trust = loadTable('TrustBuffTemplet')
    .map((t) => ({ id: t.ID, buffId: t.BuffID ?? '' }))
    .sort((a, b) => num(a.id) - num(b.id));

  return { buffs, trust, unresolved };
}
