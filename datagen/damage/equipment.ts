/**
 * Extracteur DAMAGE #2 — ÉQUIPEMENT : pièces, groupes d'options main/sub,
 * facteurs d'enchant, break limit, singularité, sets 2P/4P, EE, artefacts.
 *
 * Même contrat que `characters.ts` (mapping § 9) : valeurs BRUTES aux unités
 * des formules (spec § 15 / § 17.5) — les facteurs d'enchant/break limit sont
 * des float32 côté jeu, livrés ici tels que lus (le moteur fait les `fround`),
 * les `OAT_ADD`/`OAT_RATE` alimentent `itemOptionValue`/`Rate`, les `BID_*`
 * restent des références (résolues par l'extracteur buffs, à venir).
 *
 * Jointures constatées sur tables (03/08/2026) :
 *   - `MainOptionGroupID`/`SubOptionGroupID` (CSV) → `ItemOptionTemplet`
 *     par `GroupID` (`Rate` = poids de tirage /10000) ;
 *   - `SetOptionID` (CSV) → `ItemSpecialOptionTemplet` par `GroupID` : les
 *     SETS sélectionnent leur `Level` par le NOMBRE DE BREAK LIMIT de la
 *     pièce (`BreakLimitCount`, ex. « 0,1,2,3 » puis « 4 ») ;
 *   - `UniqueOptionID` (CSV) → `ItemSpecialOptionTemplet` par **ID DE
 *     LIGNE** (pas GroupID — la ligne de base porte souvent le même id que
 *     son groupe, ce qui masquait la différence) : l'extracteur résout
 *     ligne → groupe et émet le groupe entier — l'effet unique d'un EE y vit
 *     en `Level` 1 (base) et `Level` 10 (l'effet « EE+10 » de l'UI, qui
 *     s'AJOUTE — `IsAdd=True`, buff `_ADD` — ou REMPLACE — `IsAdd=False`,
 *     buff `_CHANGE` — selon l'EE) ;
 *   - `ItemBreakLimitTemplet` (`Factor1..4`, cumulés par
 *     `GetBreakLimitFactor` sur [0..breakCount-1]) se résout par
 *     (`BasicStar`, `ItemGrade`) — le `BreakLimitGroupID` des pièces n'est
 *     PAS une clé de cette table, il est livré brut ;
 *   - enchant par (`ItemSubType`, `EnchantLevel`) → `UpgradeFactorforOP` ;
 *   - artefacts : `OptionID` = CSV de buffs (`bid_artifact_*`, variante `_e`).
 *
 * GARDE DE SORTIE : une pièce limitée à un perso (`CharacterLimit` — les EE)
 * n'est émise que si le perso est au roster validé (cf. `roster.ts`).
 */
import { groupBy, loadTable, num, numf, bool, splitCsv, type Row } from '../lib/tables';
import { integratedIds } from './roster';

/** Une option d'item (`ItemOptionTemplet`) — main (Rate 10000) ou sub (tirée). */
export interface DamageItemOption {
  id: string;
  /** `IOT_STAT` (→ stat/applyingType/value) ou `IOT_BUFF` (→ buffId). */
  optionType: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  /** Croissance par enchant des options à BUFF (EE) : niveau ajouté par palier. */
  factor?: number;
  maxValue?: number;
  buffId?: string;
  /** Poids de tirage (/10000) — 10000 = option fixe. */
  rate: number;
}

/** Un effet 2P/4P d'un set (colonnes `*_2P`/`*_4P`). */
export interface DamageSetEffect {
  optionType: string;
  stat?: string;
  applyingType?: string;
  value?: number;
  buffId?: string;
  buffLevel?: number;
}

/** Une ligne de `ItemSpecialOptionTemplet` (set OU option unique EE/talisman). */
export interface DamageSpecialOption {
  level: number;
  /** `IsAdd=true` : s'AJOUTE aux niveaux inférieurs (spec § 17.5). */
  isAdd: boolean;
  /** Nombres de break limit auxquels ce niveau s'applique (sets). */
  breakLimitCounts: number[];
  ignoreLowSet: boolean;
  twoPiece?: DamageSetEffect;
  fourPiece?: DamageSetEffect;
  /** Effet « solo » (unique EE/talisman) : `BuffID` de la ligne — CSV éclaté
   *  (30 lignes en 1.4.9 portent DEUX buffs, ex. Absolute Music). */
  buffIds?: string[];
}

/** Une pièce équipable (`ItemTemplet`, `ITS_EQUIP_*`). */
export interface DamagePiece {
  id: string;
  subType: string;
  grade: string;
  basicStar: number;
  classLimit?: string;
  characterLimit?: string;
  mainOptionGroups: string[];
  subOptionGroups: string[];
  uniqueOptionGroups: string[];
  setOptionGroups: string[];
  breakLimitGroup?: string;
}

/** Facteur d'enchant par (sous-type, niveau) — float brut du templet. */
export interface DamageEnchantLine {
  subType: string;
  level: number;
  factor: number;
}

/** Facteurs de break limit par groupe (`Factor1..4`, floats bruts). */
export interface DamageBreakLimitLine {
  id: string;
  basicStar: number;
  grade: string;
  factors: number[];
}

/** Une ligne de `SingularityEquipEnchantTemplet` (brute). */
export interface DamageSingularityLine {
  subType: string;
  enchantType: string;
  level: number;
  nextLevel: number;
  factor: number;
  addMaxLevel: number;
  addSmeltingCount: number;
  addSpecialOptionGroup?: string;
}

/** Un artefact : ses effets sont des buffs ordinaires (spec § 15) — sauf une
 *  poignée à effet DIRECT (`BuffType` `ABT_*` + `BuffValue`, ex. ABT_REDUCE_HP
 *  des artefacts maudits). */
export interface DamageArtifact {
  id: string;
  type: string;
  grade: string;
  buffIds: string[];
  buffType?: string;
  buffValue?: number;
}

export interface DamageEquipmentData {
  pieces: Record<string, DamagePiece>;
  /** `ItemOptionTemplet` par `GroupID` — groupes RÉFÉRENCÉS par les pièces émises. */
  optionGroups: Record<string, DamageItemOption[]>;
  /** `ItemSpecialOptionTemplet` par `GroupID` — idem (sets + options uniques). */
  specialGroups: Record<string, DamageSpecialOption[]>;
  enchant: DamageEnchantLine[];
  breakLimits: DamageBreakLimitLine[];
  singularity: DamageSingularityLine[];
  artifacts: DamageArtifact[];
}

/** Un effet 2P/4P depuis les colonnes suffixées, `undefined` si vide. */
function setEffect(r: Row, suffix: '2P' | '4P'): DamageSetEffect | undefined {
  const optionType = r[`OptionType_${suffix}`];
  const stat = r[`StatType_${suffix}`];
  const buffId = r[`BuffID_${suffix}`];
  if (!optionType || (optionType === 'IOT_STAT' && (!stat || stat === 'ST_NONE') && !buffId))
    return undefined;
  const out: DamageSetEffect = { optionType };
  if (stat && stat !== 'ST_NONE') out.stat = stat;
  const applying = r[`ApplyingType_${suffix}`];
  if (applying && applying !== 'OAT_NONE') out.applyingType = applying;
  const value = r[`OptionValue_${suffix}`];
  if (value) out.value = num(value);
  if (buffId) out.buffId = buffId;
  const buffLevel = r[`BuffLevel_${suffix}`];
  if (buffLevel) out.buffLevel = num(buffLevel);
  return out;
}

export function buildDamageEquipment(): DamageEquipmentData {
  const roster = integratedIds();

  // Index ligne → groupe d'ItemSpecialOptionTemplet, pour résoudre les
  // `UniqueOptionID` (référencés par ID DE LIGNE, cf. en-tête).
  const specialRows = loadTable('ItemSpecialOptionTemplet');
  const specialGroupOfRow = new Map<string, string>();
  for (const s of specialRows) if (s.ID && s.GroupID) specialGroupOfRow.set(s.ID, s.GroupID);

  const pieces: Record<string, DamagePiece> = {};
  const referencedOptionGroups = new Set<string>();
  const referencedSpecialGroups = new Set<string>();
  for (const i of loadTable('ItemTemplet')) {
    if (!(i.ItemSubType ?? '').startsWith('ITS_EQUIP')) continue;
    // Garde de roster : les pièces liées à un perso (EE) suivent sa sortie.
    const limit = i.CharacterLimit;
    if (limit && limit !== '0' && roster && !roster.has(limit)) continue;

    const mainOptionGroups = splitCsv(i.MainOptionGroupID);
    const subOptionGroups = splitCsv(i.SubOptionGroupID);
    const uniqueOptionGroups = [
      ...new Set(
        splitCsv(i.UniqueOptionID)
          .filter((g) => g !== '0')
          .map((ref) => specialGroupOfRow.get(ref) ?? ref),
      ),
    ];
    const setOptionGroups = splitCsv(i.SetOptionID).filter((g) => g !== '0');
    for (const g of [...mainOptionGroups, ...subOptionGroups]) referencedOptionGroups.add(g);
    for (const g of [...uniqueOptionGroups, ...setOptionGroups]) referencedSpecialGroups.add(g);

    pieces[i.ID] = {
      id: i.ID,
      subType: i.ItemSubType ?? '',
      grade: i.ItemGrade ?? '',
      basicStar: num(i.BasicStar),
      ...(i.ClassLimit && i.ClassLimit !== 'CCT_NONE' ? { classLimit: i.ClassLimit } : {}),
      ...(limit && limit !== '0' ? { characterLimit: limit } : {}),
      mainOptionGroups,
      subOptionGroups,
      uniqueOptionGroups,
      setOptionGroups,
      ...(i.BreakLimitGroupID && i.BreakLimitGroupID !== '0'
        ? { breakLimitGroup: i.BreakLimitGroupID }
        : {}),
    };
  }

  // Les options uniques (EE/talisman) vivent dans les DEUX tables sous le même
  // GroupID — un groupe unique est donc aussi cherché côté ItemOptionTemplet.
  for (const g of referencedSpecialGroups) referencedOptionGroups.add(g);

  const optionGroups: Record<string, DamageItemOption[]> = {};
  for (const [gid, rows] of groupBy(loadTable('ItemOptionTemplet'), 'GroupID')) {
    if (!referencedOptionGroups.has(gid)) continue;
    optionGroups[gid] = rows.map((o) => ({
      id: o.ID,
      optionType: o.OptionType ?? '',
      ...(o.StatType && o.StatType !== 'ST_NONE' ? { stat: o.StatType } : {}),
      ...(o.ApplyingType && o.ApplyingType !== 'OAT_NONE' ? { applyingType: o.ApplyingType } : {}),
      ...(o.OptionValue ? { value: num(o.OptionValue) } : {}),
      ...(o.OptionFactor ? { factor: num(o.OptionFactor) } : {}),
      ...(o.OptionMaxValue ? { maxValue: num(o.OptionMaxValue) } : {}),
      ...(o.BuffID ? { buffId: o.BuffID } : {}),
      rate: num(o.Rate),
    }));
  }

  const specialGroups: Record<string, DamageSpecialOption[]> = {};
  for (const [gid, rows] of groupBy(specialRows, 'GroupID')) {
    if (!referencedSpecialGroups.has(gid)) continue;
    specialGroups[gid] = rows
      .map((s) => {
        const twoPiece = setEffect(s, '2P');
        const fourPiece = setEffect(s, '4P');
        return {
          level: num(s.Level),
          isAdd: bool(s.IsAdd),
          breakLimitCounts: splitCsv(s.BreakLimitCount).map((v) => num(v)),
          ignoreLowSet: bool(s.IgnoreLowSet),
          ...(twoPiece ? { twoPiece } : {}),
          ...(fourPiece ? { fourPiece } : {}),
          ...(s.BuffID ? { buffIds: splitCsv(s.BuffID) } : {}),
        };
      })
      .sort((a, b) => a.level - b.level);
  }

  const enchant: DamageEnchantLine[] = loadTable('ItemEnchantTemplet')
    .map((e) => ({
      subType: e.ItemSubType ?? '',
      level: num(e.EnchantLevel),
      factor: numf(e.UpgradeFactorforOP),
    }))
    .sort(
      (a, b) => (a.subType < b.subType ? -1 : a.subType > b.subType ? 1 : 0) || a.level - b.level,
    );

  const breakLimits: DamageBreakLimitLine[] = loadTable('ItemBreakLimitTemplet').map((b) => ({
    id: b.ID,
    basicStar: num(b.BasicStar),
    grade: b.ItemGrade ?? '',
    factors: [numf(b.Factor1), numf(b.Factor2), numf(b.Factor3), numf(b.Factor4)],
  }));

  const singularity: DamageSingularityLine[] = loadTable('SingularityEquipEnchantTemplet').map(
    (s) => ({
      subType: s.ItemSubType ?? '',
      enchantType: s.EnchantType ?? '',
      level: num(s.EnchantLevel),
      nextLevel: num(s.NextEnchantLevel),
      factor: numf(s.UpgradeFactorforOP),
      addMaxLevel: num(s.AddMaxLevel),
      addSmeltingCount: num(s.AddSmeltingCount),
      ...(s.AddSpecialOptionGroupID && s.AddSpecialOptionGroupID !== '0'
        ? { addSpecialOptionGroup: s.AddSpecialOptionGroupID }
        : {}),
    }),
  );

  const artifacts: DamageArtifact[] = loadTable('ArtifactTemplet').map((a) => ({
    id: a.ID,
    type: a.ArtifactType ?? '',
    grade: a.ArtifactGrade ?? '',
    buffIds: splitCsv(a.OptionID),
    ...(a.BuffType && a.BuffType !== 'ABT_NONE' ? { buffType: a.BuffType } : {}),
    ...(a.BuffValue ? { buffValue: num(a.BuffValue) } : {}),
  }));

  return { pieces, optionGroups, specialGroups, enchant, breakLimits, singularity, artifacts };
}
