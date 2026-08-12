/**
 * Ingrédients de stats par personnage pour GEAR-SOLVER — port FIDÈLE de
 * `gear-solver/data/calc-stats.mjs` (source de vérité du contrat ; ses
 * commentaires expliquent chaque choix, résumés ici).
 *
 * L'app compose au runtime le bloc de stats « sans équipement » depuis la
 * progression capturée (niveau, TransStar, codex, gifts…) ; ce module extrait
 * les blocs BRUTS par source. Règles d'encodage (contrat, NE PAS « corriger ») :
 *   - CHC/CHD/PEN/DMG± : per-mille ÷10 → points de %
 *   - ATK/DEF/HP OAT_RATE → atkPct/defPct/hpPct ; OAT_ADD → flat
 *   - SPD OAT_RATE → flat PRÉ-CUIT contre `baseForRate.spd` (baseline constante
 *     par perso, l'approximation est exacte) ; EFF/RES OAT_RATE → effRate/resRate
 *     (le composeur les applique via BuffValueRate — cf. le cas Notia +50% EFF)
 *
 * ⚠ Sortie pour l'app externe : enums moteur bruts, AUCUN slug wiki.
 */
import type { Row } from '../lib/tables';

const ELEMENT_INDEX: Record<string, number> = {
  CET_EARTH: 0,
  CET_WATER: 1,
  CET_FIRE: 2,
  CET_LIGHT: 3,
  CET_DARK: 4,
};
const CLASS_INDEX: Record<string, number> = {
  CCT_DEFENDER: 1,
  CCT_ATTACKER: 2,
  CCT_RANGER: 3,
  CCT_MAGE: 4,
  CCT_PRIEST: 5,
};
const SUBCLASS_INDEX: Record<string, number> = {
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

function num(v: string | undefined): number {
  if (!v) return 0;
  const p = parseInt(v, 10);
  return Number.isFinite(p) ? p : 0;
}
function splitCsv(s: string | undefined): string[] {
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export interface StatBlock {
  atk: number;
  def: number;
  hp: number;
  spd: number;
  chc: number;
  chd: number;
  pen: number;
  dmgInc: number;
  dmgRed: number;
  eff: number;
  res: number;
  effRate: number;
  resRate: number;
  atkPct: number;
  defPct: number;
  hpPct: number;
}
function zeroStats(): StatBlock {
  return {
    atk: 0,
    def: 0,
    hp: 0,
    spd: 0,
    chc: 0,
    chd: 0,
    pen: 0,
    dmgInc: 0,
    dmgRed: 0,
    eff: 0,
    res: 0,
    effRate: 0,
    resRate: 0,
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
  };
}
function isEmpty(s: StatBlock): boolean {
  for (const k of Object.keys(s) as (keyof StatBlock)[]) if (s[k] !== 0) return false;
  return true;
}

/** Index par clé (tri optionnel) — évite les `.filter()` par perso sur des tables à milliers de lignes. */
function indexBy(rows: Row[], keyField: string, sortField?: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r[keyField];
    if (k == null) continue;
    let arr = m.get(k);
    if (!arr) {
      arr = [];
      m.set(k, arr);
    }
    arr.push(r);
  }
  if (sortField) {
    for (const arr of m.values()) arr.sort((a, b) => num(a[sortField]) - num(b[sortField]));
  }
  return m;
}

/** Ligne d'UN skill (rows triées par SkillLevel) : niveau exact, sinon le max. */
function pickSkillLevelRow(rows: Row[] | undefined, level?: number): Row | undefined {
  if (!rows || rows.length === 0) return undefined;
  if (level != null) {
    for (const r of rows) if (num(r.SkillLevel) === level) return r;
    return undefined;
  }
  return rows[rows.length - 1];
}
/** Ligne de buff au Level max (rows triées par Level). */
function pickMaxBuff(rows: Row[] | undefined): Row | undefined {
  return rows && rows.length > 0 ? rows[rows.length - 1] : undefined;
}

export interface MinMax {
  min: number;
  max: number;
}
export interface BaseStats {
  atk: MinMax;
  def: MinMax;
  hp: MinMax;
  spd: MinMax;
  chc: MinMax;
  chd: MinMax;
  eff: MinMax;
  res: MinMax;
}

// Ancrages lv1 (Min) / lv100 (Max). L'interpolation en jeu est entière :
// stat(L) = Min + floor((Max-Min) × (L-1) / 99) — reproduite côté app.
function extractBase(row: Row): BaseStats {
  return {
    atk: { min: num(row.Atk_Min), max: num(row.Atk_Max) },
    def: { min: num(row.Def_Min), max: num(row.Def_Max) },
    hp: { min: num(row.HP_Min), max: num(row.HP_Max) },
    spd: { min: num(row.Speed_Min), max: num(row.Speed_Max) },
    chc: { min: num(row.CriticalRate_Min) / 10, max: num(row.CriticalRate_Max) / 10 },
    chd: { min: num(row.CriticalDMGRate_Min) / 10, max: num(row.CriticalDMGRate_Max) / 10 },
    eff: { min: num(row.BuffChance_Min), max: num(row.BuffChance_Max) },
    res: { min: num(row.BuffResist_Min), max: num(row.BuffResist_Max) },
  };
}

// Ajouts d'évolution par EvolutionLevel (cumulés côté app selon le TransStar capturé).
function extractEvoByLevel(evoRows: Row[] | undefined): Record<string, StatBlock> {
  const out: Record<string, StatBlock> = {};
  if (!evoRows) return out;
  for (const r of evoRows) {
    const lvl = String(num(r.EvolutionLevel));
    const dest = out[lvl] ?? zeroStats();
    for (let i = 1; i <= 3; i++) {
      const t = r[`RewardStatType_${i}`];
      const v = num(r[`RewardValue_${i}`]);
      if (t === 'ST_ATK') dest.atk += v;
      else if (t === 'ST_DEF') dest.def += v;
      else if (t === 'ST_HP') dest.hp += v;
      else if (t === 'ST_SPEED') dest.spd += v;
      else if (t === 'ST_BUFF_CHANCE') dest.eff += v;
      else if (t === 'ST_BUFF_RESIST') dest.res += v;
      else if (t === 'ST_CRITICAL_RATE') dest.chc += v / 10;
      else if (t === 'ST_CRITICAL_DMG_RATE') dest.chd += v / 10;
      else if (t === 'ST_DMG_BOOST') dest.dmgInc += v / 10;
      else if (t === 'ST_DMG_REDUCE_RATE') dest.dmgRed += v / 10;
      else if (t === 'ST_PIERCE_POWER_RATE') dest.pen += v / 10;
    }
    out[lvl] = dest;
  }
  return out;
}

export interface CodexLevel {
  atkPct: number;
  defPct: number;
  hpPct: number;
}
// Multiplicateurs % du codex (Hero Archive) Lv 1..11 — GLOBAL, pas par perso.
function extractCodexCurve(archiveStats: Row[]): CodexLevel[] {
  const out: CodexLevel[] = [{ atkPct: 0, defPct: 0, hpPct: 0 }]; // Lv 0 = pas de codex
  for (const r of archiveStats.slice().sort((a, b) => num(a.ID) - num(b.ID))) {
    out.push({
      atkPct: num(r.Atk_Rate) / 10,
      defPct: num(r.Def_Rate) / 10,
      hpPct: num(r.HP_Rate) / 10,
    });
  }
  return out;
}

export interface TranscendStar {
  atkPct: number;
  defPct: number;
  hpPct: number;
  skillLevel: number;
  showUIStar: number;
  starPlus: number;
}
// Bonus % par TransStar + niveau de Skill_8 débloqué. Les lignes catch-all
// `CharacterID="0"` (filtrées par BasicStar) servent les persos sans lignes propres.
function extractTranscendByStar(
  transcendByCharId: Map<string, Row[]>,
  basicStar: number,
  charId: string,
): Record<string, TranscendStar> {
  const charSpecific = transcendByCharId.get(charId) ?? [];
  const pool =
    charSpecific.length > 0
      ? charSpecific
      : (transcendByCharId.get('0') ?? []).filter((r) => num(r.BasicStar) === basicStar);
  const out: Record<string, TranscendStar> = {};
  for (const r of pool) {
    const star = num(r.TransStar);
    if (star === 0) continue;
    out[String(star)] = {
      atkPct: num(r.RewardAtkRate) / 10,
      defPct: num(r.RewardDefRate) / 10,
      hpPct: num(r.RewardHPRate) / 10,
      skillLevel: num(r.SkillLevel),
      // Métadonnées d'étoiles UI pour la formule de BP (CalcBattlePower) :
      // star_bonus = ShowUIStar×500 + StarPlus×120.
      showUIStar: num(r.ShowUIStar),
      starPlus: num(r.StarPlus),
    };
  }
  return out;
}

/**
 * Route un triplet (StatType, ApplyingType, Value) vers le bon champ du bloc.
 * Partagé buffs/geas — mêmes règles d'encodage (cf. en-tête).
 */
function applyStatBonus(
  dest: StatBlock,
  statType: string | undefined,
  applying: string | undefined,
  value: number,
  baseForRate: { spd: number },
): void {
  const rate = applying === 'OAT_RATE';
  const add = applying === 'OAT_ADD';
  if (!rate && !add) return;
  switch (statType) {
    case 'ST_CRITICAL_RATE':
      dest.chc += value / 10;
      return;
    case 'ST_CRITICAL_DMG_RATE':
      dest.chd += value / 10;
      return;
    case 'ST_PIERCE_POWER_RATE':
      dest.pen += value / 10;
      return;
    case 'ST_DMG_REDUCE_RATE':
      dest.dmgRed += value / 10;
      return;
    case 'ST_DMG_BOOST':
      dest.dmgInc += value / 10;
      return;
    case 'ST_ATK':
      if (rate) dest.atkPct += value / 10;
      else dest.atk += value;
      return;
    case 'ST_DEF':
      if (rate) dest.defPct += value / 10;
      else dest.def += value;
      return;
    case 'ST_HP':
      if (rate) dest.hpPct += value / 10;
      else dest.hp += value;
      return;
    case 'ST_SPEED':
      if (rate) dest.spd += Math.floor((baseForRate.spd * value) / 1000);
      else dest.spd += value;
      return;
    case 'ST_BUFF_CHANCE':
      if (rate) dest.effRate += value / 10;
      else dest.eff += value;
      return;
    case 'ST_BUFF_RESIST':
      if (rate) dest.resRate += value / 10;
      else dest.res += value;
      return;
  }
}

function applyPremiumBuff(dest: StatBlock, buff: Row, baseForRate: { spd: number }): void {
  if (buff.Type !== 'BT_STAT_PREMIUM') return;
  if ((buff.BuffConditionType ?? 'NONE') !== 'NONE') return;
  applyStatBonus(dest, buff.StatType, buff.ApplyingType, num(buff.Value), baseForRate);
}

function extractClassPassive(
  row: Row,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
  baseForRate: { spd: number },
): StatBlock {
  const out = zeroStats();
  const skillId = row.Skill_22;
  if (!skillId) return out;
  const levelRow = pickSkillLevelRow(skillsByID.get(String(skillId)));
  for (const bid of splitCsv(levelRow?.BuffID)) {
    const b = pickMaxBuff(buffsByID.get(bid));
    if (b) applyPremiumBuff(out, b, baseForRate);
  }
  return out;
}

/**
 * Un StatBlock par SkillLevel : la contribution PASSIVE PERMANENTE self au
 * niveau donné. Convention plancher : plus haut BuffLevel ≤ SkillLv (Ame S2
 * Lv5 → BuffLv4). Filtre STRICT : BT_STAT_PREMIUM + ME + PASSIVE + Cond NONE
 * + TurnDuration=-1 (les modificateurs de combat ne touchent pas la fiche).
 */
function extractSkillPassiveByLevel(
  skillId: string | undefined,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
  baseForRate: { spd: number },
): Record<string, StatBlock> {
  if (!skillId) return {};
  const rows = skillsByID.get(String(skillId));
  if (!rows || rows.length === 0) return {};
  const out: Record<string, StatBlock> = {};
  for (const row of rows) {
    const skillLv = num(row.SkillLevel);
    const dest = zeroStats();
    for (const bid of splitCsv(row.BuffID)) {
      const bRows = buffsByID.get(bid);
      if (!bRows || bRows.length === 0) continue;
      let chosen = bRows[0];
      for (const b of bRows) {
        if (num(b.Level) <= skillLv) chosen = b;
        else break;
      }
      const ok =
        chosen.Type === 'BT_STAT_PREMIUM' &&
        chosen.TargetType === 'ME' &&
        chosen.BuffCreateType === 'PASSIVE' &&
        (chosen.BuffConditionType ?? 'NONE') === 'NONE' &&
        chosen.TurnDuration === '-1';
      if (ok) applyPremiumBuff(dest, chosen, baseForRate);
    }
    if (!isEmpty(dest)) out[String(skillLv)] = dest;
  }
  return out;
}

// Buffs de Skill_8 par niveau de transcendance débloqué.
function extractSkill8ByLevel(
  row: Row,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
  transcendByStar: Record<string, TranscendStar>,
  baseForRate: { spd: number },
): Record<string, StatBlock> {
  const out: Record<string, StatBlock> = {};
  const skillId = row.Skill_8;
  if (!skillId) return out;
  const skillRows = skillsByID.get(String(skillId));
  if (!skillRows) return out;
  const seen = new Set<number>();
  for (const star of Object.keys(transcendByStar)) {
    const lvl = transcendByStar[star].skillLevel;
    if (lvl <= 0 || seen.has(lvl)) continue;
    seen.add(lvl);
    const levelRow = pickSkillLevelRow(skillRows, lvl);
    if (!levelRow) continue;
    const dest = zeroStats();
    for (const bid of splitCsv(levelRow.BuffID)) {
      const b = pickMaxBuff(buffsByID.get(bid));
      if (b) applyPremiumBuff(dest, b, baseForRate);
    }
    if (!isEmpty(dest)) out[String(lvl)] = dest;
  }
  return out;
}

function accumulateGeasBonus(
  dest: StatBlock,
  levelRow: Row,
  buffsByID: Map<string, Row[]>,
  baseForRate: { spd: number },
): void {
  let statType = levelRow.StatType ?? 'ST_NONE';
  let applying = levelRow.ApplyingType ?? 'OAT_NONE';
  let value = num(levelRow.OptionValue);
  let condition = 'NONE';
  if (levelRow.OptionType === 'IOT_BUFF' && levelRow.BuffID) {
    const b = pickMaxBuff(buffsByID.get(levelRow.BuffID));
    if (!b) return;
    if (b.Type !== 'BT_STAT_PREMIUM') return;
    statType = b.StatType ?? 'ST_NONE';
    applying = b.ApplyingType ?? 'OAT_NONE';
    value = num(b.Value);
    condition = b.BuffConditionType ?? 'NONE';
  }
  if (condition !== 'NONE') return;
  applyStatBonus(dest, statType, applying, value, baseForRate);
}

export interface GeasNode {
  source: 'stat' | 'buff';
  levels: Record<string, StatBlock>;
}
// Geas (nœuds élément/classe/sous-classe) — valeur CUMULATIVE par niveau ;
// l'app choisit la ligne du niveau possédé (capture /gift/info), sinon le max.
function extractGeasByNode(
  row: Row,
  awakNodes: Row[],
  awakLevelsByGroup: Map<string, Map<number, Row>>,
  buffsByID: Map<string, Row[]>,
  baseForRate: { spd: number },
): Record<string, GeasNode> {
  const elemIdx = ELEMENT_INDEX[row.Element ?? ''] ?? -1;
  const classIdx = CLASS_INDEX[row.Class ?? ''] ?? -1;
  const subIdx = SUBCLASS_INDEX[row.SubClass ?? ''] ?? -1;
  const out: Record<string, GeasNode> = {};
  for (const node of awakNodes) {
    const gid = node.AwakeningLevelGroupID;
    if (!gid) continue;
    const v = num(node.AwakeningApplyTypeValue);
    let match = false;
    if (node.AwakeningApplyType === 'AAT_ELEMENTAL' && v === elemIdx) match = true;
    else if (node.AwakeningApplyType === 'AAT_CLASS' && v === classIdx) match = true;
    else if (node.AwakeningApplyType === 'AAT_SUBCLASS' && v === subIdx) match = true;
    if (!match) continue;
    const inner = awakLevelsByGroup.get(gid);
    if (!inner) continue;
    const perLevel: Record<string, StatBlock> = {};
    let source: 'stat' | 'buff' | null = null;
    for (const [lvl, lvlRow] of inner) {
      const dest = zeroStats();
      accumulateGeasBonus(dest, lvlRow, buffsByID, baseForRate);
      if (!isEmpty(dest)) {
        perLevel[String(lvl)] = dest;
        if (source === null) source = lvlRow.OptionType === 'IOT_BUFF' ? 'buff' : 'stat';
      }
    }
    if (Object.keys(perLevel).length > 0)
      out[node.ID] = { source: source ?? 'stat', levels: perLevel };
  }
  return out;
}

export interface CharacterIngredients {
  base: BaseStats;
  evoByLevel: Record<string, StatBlock>;
  transcendByStar: Record<string, TranscendStar>;
  classPassive: StatBlock;
  skill8ByLevel: Record<string, StatBlock>;
  geasByNode: Record<string, GeasNode>;
  s1ByLevel: Record<string, StatBlock>;
  s2ByLevel: Record<string, StatBlock>;
  s3ByLevel: Record<string, StatBlock>;
  corePassive: StatBlock | null;
}

export interface IngredientsTables {
  characterTemplet: Row[];
  evoStats: Row[];
  archiveStats: Row[];
  transcendent: Row[];
  skillLevels: Row[];
  buffs: Row[];
  awakLevels: Row[];
  awakNodes: Row[];
  fusionTemplet: Row[];
}

/** Bundles d'ingrédients par perso + la courbe codex globale. */
export function computeCharacterIngredients(tables: IngredientsTables): {
  codexByLevel: CodexLevel[];
  characters: Record<string, CharacterIngredients>;
} {
  const {
    characterTemplet,
    evoStats,
    archiveStats,
    transcendent,
    skillLevels,
    buffs,
    awakLevels,
    awakNodes,
    fusionTemplet,
  } = tables;

  const codexByLevel = extractCodexCurve(archiveStats);

  const buffsByID = indexBy(buffs, 'BuffID', 'Level');
  const skillsByID = indexBy(skillLevels, 'SkillID', 'SkillLevel');
  const evosByCharId = indexBy(evoStats, 'CharacterID');
  const transcendByCharId = indexBy(transcendent, 'CharacterID');
  const awakLevelsByGroup = new Map<string, Map<number, Row>>();
  for (const r of awakLevels) {
    const gid = r.AwakeningLevelGroupID;
    if (!gid) continue;
    let inner = awakLevelsByGroup.get(gid);
    if (!inner) {
      inner = new Map();
      awakLevelsByGroup.set(gid, inner);
    }
    inner.set(num(r.AwakeningLevel), r);
  }

  // Filtre variantes : NameID d'un AUTRE perso = alt visuel/PvP — jamais
  // référencé par une capture utilisateur (règle canonique du solver).
  const characters: Record<string, CharacterIngredients> = {};
  for (const row of characterTemplet) {
    if (row.Type !== 'CT_PC') continue;
    if (row.NameID !== `${row.ID}_Name`) continue;
    const id = row.ID;
    const fusionRow = fusionTemplet.find((r) => r.ChangeCharID === id);
    const evoCharId = fusionRow?.CharacterID ?? id;
    const basicStar = num(row.BasicStar);
    const base = extractBase(row);
    const evoByLevel = extractEvoByLevel(evosByCharId.get(evoCharId));
    // Seul `spd` est encore consommé (SPD OAT_RATE pré-cuit sur lv100 max + évo max).
    const evoMax = zeroStats();
    for (const k of Object.keys(evoByLevel)) {
      for (const f of Object.keys(evoMax) as (keyof StatBlock)[]) evoMax[f] += evoByLevel[k][f];
    }
    const baseForRate = { spd: base.spd.max + evoMax.spd };
    const transcendByStar = extractTranscendByStar(transcendByCharId, basicStar, id);
    const classPassive = extractClassPassive(row, skillsByID, buffsByID, baseForRate);
    const skill8ByLevel = extractSkill8ByLevel(
      row,
      skillsByID,
      buffsByID,
      transcendByStar,
      baseForRate,
    );
    const geasByNode = extractGeasByNode(row, awakNodes, awakLevelsByGroup, buffsByID, baseForRate);
    const s1ByLevel = extractSkillPassiveByLevel(row.Skill_1, skillsByID, buffsByID, baseForRate);
    const s2ByLevel = extractSkillPassiveByLevel(row.Skill_2, skillsByID, buffsByID, baseForRate);
    const s3ByLevel = extractSkillPassiveByLevel(row.Skill_3, skillsByID, buffsByID, baseForRate);
    // Core fusion (2700xxx) : passif Skill_23 émis en un bloc au niveau max.
    let corePassive: StatBlock | null = null;
    if (/^2700\d{3}$/.test(id) && row.Skill_23) {
      const byLv = extractSkillPassiveByLevel(row.Skill_23, skillsByID, buffsByID, baseForRate);
      const levels = Object.keys(byLv).map(Number);
      if (levels.length) corePassive = byLv[String(Math.max(...levels))];
    }
    characters[id] = {
      base,
      evoByLevel,
      transcendByStar,
      classPassive,
      skill8ByLevel,
      geasByNode,
      s1ByLevel,
      s2ByLevel,
      s3ByLevel,
      corePassive,
    };
  }
  return { codexByLevel, characters };
}
