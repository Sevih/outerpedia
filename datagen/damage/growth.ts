/**
 * Extracteur DAMAGE #1b — SYSTÈMES DE CROISSANCE partagés : transcendance,
 * archive (Codex), paliers post-100, éveil (Quirks/Gift) et enchant Monad.
 *
 * Même contrat que `characters.ts` (mapping § 9) : valeurs BRUTES aux unités
 * des formules — les taux sont en ‰, les plats tels quels, les enums `ST_*`/
 * `OAT_*`/`AAT_*` non traduits. Le glossaire binaire↔UI (archive = Codex,
 * éveil = Quirks, Trust = Affinité) vit dans damage-formula.md § 16.1.
 *
 * Ce module reproduit les CANAUX de CalcFinalStat (spec § 3 / § 17) :
 *   - transcendance → `transcendentStarValueRate` (‰, HP/ATK/DEF seulement) ;
 *   - archive       → `archiveStatValueRate` (‰ de la base seule) ;
 *   - éveil/monad   → `awakeningValue`/`Rate` et `monadEnchantValue`/`Rate`
 *     (`OAT_ADD` = plat, `OAT_RATE` = ‰), les nœuds `IOT_BUFF` référencent un
 *     `BuffTemplet` résolu au niveau 1 (spec § 17.4) — résolution à venir dans
 *     l'extracteur buffs.
 */
import { indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';

/** Tri ORDINAL (sortie canonique committée — indépendante de la locale). */
const ord = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

/** Une ligne de `CharacterTranscendentTemplet` — générique (par étoile de base)
 *  ou PROPRE à un perso quand `characterId` est présent. Taux en ‰. */
export interface DamageTranscendLine {
  characterId?: string;
  basicStar: number;
  transStar: number;
  hpRate: number;
  atkRate: number;
  defRate: number;
  /** Niveau de skill accordé à ce palier (0 si aucun). */
  skillLevel: number;
  wgDmg: number;
  /** Déblocage des états burst 2/3 à ce palier (0 = non concerné). */
  burst2: number;
  burst3: number;
}

/** Un palier d'archive (Codex) : jointure `ArchiveBonusTemplet` →
 *  `CharacterArchiveStatTemplet`. Taux en ‰, sur ATK/DEF/HP seulement. */
export interface DamageArchiveTier {
  level: number;
  completeCount: number;
  atkRate: number;
  defRate: number;
  hpRate: number;
}

/** Un palier post-100 (`CharacterMaxLevelTemplet`) par (étoile, élément, step). */
export interface DamageMaxLevelStep {
  basicStar: number;
  element: string;
  step: number;
  requireLevel: number;
  maxLevel: number;
  /** `LevelUpStatModifierAfter100` (‰) — spec § 3.2. */
  modifierAfter100: number;
}

/** L'effet d'un niveau de nœud (éveil ou monad) — champs bruts du templet. */
export interface DamageNodeEffect {
  level: number;
  /** `IOT_STAT` (→ stat/applyingType/value) ou `IOT_BUFF` (→ buffId). */
  optionType: string;
  stat?: string;
  /** `OAT_ADD` = plat, `OAT_RATE` = ‰ (règle transversale, mapping § 3). */
  applyingType?: string;
  value?: number;
  buffId?: string;
  buffValue?: number;
}

/** Un nœud d'éveil (Quirks/Gift) avec ses filtres d'application (spec § 17.4). */
export interface DamageAwakeningNode {
  id: string;
  groupId: string;
  /** Type du groupe (`PVE`/`JOB`/`ELEMENTAL`/`UTILITY`/`ADVENTURE_LICENSE`) —
   *  les nœuds licence dépendent du CONTENU (spec § 17.4). */
  groupType: string;
  nodeType: string;
  /** Filtre `AAT_*` comparé à l'élément/classe/race du perso. */
  applyType: string;
  applyTypeValue: number;
  requireMainNodeId: string;
  requireMainNodeLevel: number;
  levels: DamageNodeEffect[];
}

/** Un nœud d'enchant Monad — générique ou ciblant un perso (`characterId`). */
export interface DamageMonadNode {
  id: string;
  themeId: string;
  characterId?: string;
  requirePoint: number;
  effect: Omit<DamageNodeEffect, 'level'>;
}

export interface DamageGrowthData {
  transcend: DamageTranscendLine[];
  archive: DamageArchiveTier[];
  maxLevelSteps: DamageMaxLevelStep[];
  awakening: DamageAwakeningNode[];
  monad: DamageMonadNode[];
}

/** Effet brut d'une ligne à couple `OptionType`/`StatType`/`BuffID` (champs
 *  partagés éveil/monad — mêmes colonnes, mêmes règles, spec § 17.4). */
function nodeEffect(r: Row): Omit<DamageNodeEffect, 'level'> {
  const optionType = r.OptionType ?? '';
  const out: Omit<DamageNodeEffect, 'level'> = { optionType };
  if (r.StatType && r.StatType !== 'ST_NONE') out.stat = r.StatType;
  if (r.ApplyingType && r.ApplyingType !== 'OAT_NONE') out.applyingType = r.ApplyingType;
  if (r.OptionValue) out.value = num(r.OptionValue);
  const buffIds = splitCsv(r.BuffID);
  if (buffIds.length) out.buffId = buffIds.join(',');
  if (r.BuffValue && r.BuffValue !== '0') out.buffValue = num(r.BuffValue);
  return out;
}

export function buildDamageGrowth(): DamageGrowthData {
  const transcend: DamageTranscendLine[] = loadTable('CharacterTranscendentTemplet')
    .map((t) => ({
      ...(t.CharacterID && t.CharacterID !== '0' ? { characterId: t.CharacterID } : {}),
      basicStar: num(t.BasicStar),
      transStar: num(t.TransStar),
      hpRate: num(t.RewardHPRate),
      atkRate: num(t.RewardAtkRate),
      defRate: num(t.RewardDefRate),
      skillLevel: num(t.SkillLevel),
      wgDmg: num(t.WGDMG),
      burst2: num(t.Burst2),
      burst3: num(t.Burst3),
    }))
    .sort(
      (a, b) =>
        ord(a.characterId ?? '', b.characterId ?? '') ||
        a.basicStar - b.basicStar ||
        a.transStar - b.transStar,
    );

  const archiveStats = indexBy(loadTable('CharacterArchiveStatTemplet'));
  const archive: DamageArchiveTier[] = loadTable('ArchiveBonusTemplet')
    .map((b) => {
      const s = archiveStats.get(b.CharacterArchiveStatID ?? '');
      return {
        level: num(b.Level),
        completeCount: num(b.CompleteCount),
        atkRate: num(s?.Atk_Rate),
        defRate: num(s?.Def_Rate),
        hpRate: num(s?.HP_Rate),
      };
    })
    .sort((a, b) => a.level - b.level);

  const maxLevelSteps: DamageMaxLevelStep[] = loadTable('CharacterMaxLevelTemplet')
    .map((m) => ({
      basicStar: num(m.BasicStar),
      element: m.Element ?? '',
      step: num(m.Step),
      requireLevel: num(m.RequireLevel),
      maxLevel: num(m.MaxLevel),
      modifierAfter100: num(m.LevelUpStatModifierAfter100),
    }))
    .sort((a, b) => a.basicStar - b.basicStar || ord(a.element, b.element) || a.step - b.step);

  const groups = indexBy(loadTable('CharacterAwakeningTemplet'), 'AwakeningGroupID');
  const levelsByGroup = new Map<string, Row[]>();
  for (const l of loadTable('CharacterAwakeningLevelTemplet')) {
    const k = l.AwakeningLevelGroupID;
    if (!k) continue;
    const bucket = levelsByGroup.get(k);
    if (bucket) bucket.push(l);
    else levelsByGroup.set(k, [l]);
  }
  const awakening: DamageAwakeningNode[] = loadTable('CharacterAwakeningNodeTemplet').map((n) => ({
    id: n.ID,
    groupId: n.AwakeningGroupID ?? '',
    groupType: groups.get(n.AwakeningGroupID ?? '')?.AwakeningType ?? '',
    nodeType: n.AwakeningNodeType ?? '',
    applyType: n.AwakeningApplyType ?? '',
    applyTypeValue: num(n.AwakeningApplyTypeValue),
    requireMainNodeId: n.RequireMainNodeID ?? '',
    requireMainNodeLevel: num(n.RequireMainNodeLevel),
    levels: (levelsByGroup.get(n.AwakeningLevelGroupID ?? '') ?? [])
      .map((l) => ({ level: num(l.AwakeningLevel), ...nodeEffect(l) }))
      .sort((a, b) => a.level - b.level),
  }));

  const monad: DamageMonadNode[] = loadTable('MonadGateEnchantNodeTemplet').map((m) => ({
    id: m.ID,
    themeId: m.ThemeID ?? '',
    ...(m.ApplyCharacterID && m.ApplyCharacterID !== '0'
      ? { characterId: m.ApplyCharacterID }
      : {}),
    requirePoint: num(m.RequirePoint),
    effect: nodeEffect(m),
  }));

  return { transcend, archive, maxLevelSteps, awakening, monad };
}
